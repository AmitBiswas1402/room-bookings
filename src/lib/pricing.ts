import { db } from "@/lib";
import { propertyPricingRules, bookings, rooms } from "@/db/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";

export interface DynamicNightBreakdown {
  date: string; // YYYY-MM-DD
  dayOfWeek: string; // "Friday", "Saturday", etc.
  basePrice: number;
  finalPrice: number;
  surgeMultiplier: number;
  surgeReason: string | null;
  isSurge: boolean;
  isWeekend: boolean;
  isCustomHostPrice: boolean;
}

export interface StayPricingBreakdown {
  checkIn: string;
  checkOut: string;
  nightsCount: number;
  baseTotal: number;
  dynamicTotal: number;
  averageNightlyRate: number;
  totalSurgeAdjustment: number;
  demandSurgePercent: number;
  demandTag: string | null;
  nights: DynamicNightBreakdown[];
  taxesAndFees: number;
  grandTotal: number;
}

/**
 * Calculates dynamic night-by-night pricing based on:
 * 1. Host custom date range prices/overrides
 * 2. Weekend market surges (Friday/Saturday)
 * 3. Occupancy-based real-time market demand
 */
export function calculateNightlyDynamicPrice(
  basePrice: number,
  dateStr: string,
  activeRules: any[] = [],
  occupancyRate: number = 0 // 0.0 to 1.0
): DynamicNightBreakdown {
  const d = new Date(dateStr);
  const dayIndex = d.getUTCDay(); // 0: Sun, 5: Fri, 6: Sat
  const isWeekend = dayIndex === 5 || dayIndex === 6; // Friday & Saturday
  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const dayName = daysOfWeek[dayIndex];

  // 1. Check for Host Custom Date Rule Overrides
  const matchedRule = activeRules.find((rule) => {
    if (!rule.isActive) return false;
    const s = rule.startDate;
    const e = rule.endDate;
    return dateStr >= s && dateStr <= e;
  });

  if (matchedRule) {
    let finalPrice = basePrice;
    let multiplier = 1.0;
    let reason = matchedRule.reason || "Custom Host Rate";

    if (matchedRule.pricePerNight && matchedRule.pricePerNight > 0) {
      finalPrice = matchedRule.pricePerNight;
      multiplier = Number((finalPrice / basePrice).toFixed(2));
    } else if (matchedRule.surgeMultiplier && matchedRule.surgeMultiplier > 1.0) {
      multiplier = matchedRule.surgeMultiplier;
      finalPrice = Math.round(basePrice * multiplier);
    }

    return {
      date: dateStr,
      dayOfWeek: dayName,
      basePrice,
      finalPrice,
      surgeMultiplier: multiplier,
      surgeReason: reason,
      isSurge: finalPrice > basePrice,
      isWeekend,
      isCustomHostPrice: true,
    };
  }

  // 2. High Occupancy Demand Surge (if room occupancy is high on this date)
  let occupancyMultiplier = 1.0;
  let occupancyReason: string | null = null;

  if (occupancyRate >= 0.85) {
    occupancyMultiplier = 1.35; // +35% Peak Demand
    occupancyReason = "High Market Demand (85%+ Booked)";
  } else if (occupancyRate >= 0.6) {
    occupancyMultiplier = 1.2; // +20% Moderate Demand
    occupancyReason = "Market Demand Surge";
  }

  // 3. Weekend Market Surge
  let weekendMultiplier = 1.0;
  if (isWeekend) {
    weekendMultiplier = 1.15; // +15% Friday & Saturday rate
  }

  // Combined demand multiplier
  const combinedMultiplier = Math.max(occupancyMultiplier, weekendMultiplier);
  const finalPrice = Math.round(basePrice * combinedMultiplier);
  const isSurge = finalPrice > basePrice;

  let surgeReason = occupancyReason;
  if (!surgeReason && isWeekend) {
    surgeReason = "Weekend Market Rate";
  }

  return {
    date: dateStr,
    dayOfWeek: dayName,
    basePrice,
    finalPrice,
    surgeMultiplier: combinedMultiplier,
    surgeReason: isSurge ? surgeReason : null,
    isSurge,
    isWeekend,
    isCustomHostPrice: false,
  };
}

/**
 * Computes full stay pricing breakdown across multiple nights
 */
export async function getStayDynamicPricingBreakdown(
  propertyId: string,
  basePrice: number,
  checkIn: string,
  checkOut: string,
  roomId?: string
): Promise<StayPricingBreakdown> {
  // 1. Fetch active pricing rules for this property from DB
  let activeRules: any[] = [];
  try {
    activeRules = await db
      .select()
      .from(propertyPricingRules)
      .where(
        and(
          eq(propertyPricingRules.propertyId, propertyId),
          eq(propertyPricingRules.isActive, true)
        )
      );
  } catch (err) {
    console.error("Error fetching pricing rules:", err);
  }

  // 2. Compute date list
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const nightsList: string[] = [];

  const curr = new Date(start);
  while (curr < end) {
    nightsList.push(curr.toISOString().split("T")[0]);
    curr.setDate(curr.getDate() + 1);
  }

  if (nightsList.length === 0) {
    nightsList.push(checkIn);
  }

  // 3. Calculate night-by-night breakdown
  const nightsBreakdown: DynamicNightBreakdown[] = nightsList.map((d) => {
    return calculateNightlyDynamicPrice(basePrice, d, activeRules, 0.4);
  });

  const baseTotal = basePrice * nightsBreakdown.length;
  const dynamicTotal = nightsBreakdown.reduce((sum, n) => sum + n.finalPrice, 0);
  const avgRate = Math.round(dynamicTotal / nightsBreakdown.length);
  const totalSurgeAdjustment = dynamicTotal - baseTotal;
  const surgePercent = baseTotal > 0 ? Math.round((totalSurgeAdjustment / baseTotal) * 100) : 0;

  // Demand Tag label
  let demandTag: string | null = null;
  const customNight = nightsBreakdown.find((n) => n.isCustomHostPrice && n.surgeReason);
  if (customNight) {
    demandTag = `⚡ ${customNight.surgeReason}`;
  } else if (surgePercent > 0) {
    demandTag = `⚡ Dynamic Market Rate (+${surgePercent}%)`;
  }

  const taxesAndFees = Math.round(dynamicTotal * 0.12); // 12% GST standard
  const grandTotal = dynamicTotal + taxesAndFees;

  return {
    checkIn,
    checkOut,
    nightsCount: nightsBreakdown.length,
    baseTotal,
    dynamicTotal,
    averageNightlyRate: avgRate,
    totalSurgeAdjustment,
    demandSurgePercent: surgePercent,
    demandTag,
    nights: nightsBreakdown,
    taxesAndFees,
    grandTotal,
  };
}
