import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib";
import { propertyPricingRules, properties } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { syncUserInDb } from "@/lib/authorization";
import { getStayDynamicPricingBreakdown } from "@/lib/pricing";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ propertyId: string }> }
) {
  try {
    const { propertyId } = await params;
    const { searchParams } = new URL(request.url);

    const checkIn = searchParams.get("checkIn");
    const checkOut = searchParams.get("checkOut");
    const basePrice = Number(searchParams.get("basePrice")) || 8500;

    // Fetch all active rules for this property
    const rules = await db
      .select()
      .from(propertyPricingRules)
      .where(eq(propertyPricingRules.propertyId, propertyId))
      .orderBy(desc(propertyPricingRules.createdAt));

    let breakdown = null;
    if (checkIn && checkOut) {
      breakdown = await getStayDynamicPricingBreakdown(
        propertyId,
        basePrice,
        checkIn,
        checkOut
      );
    }

    return NextResponse.json({
      success: true,
      rules,
      breakdown,
    });
  } catch (error: any) {
    console.error("Error in property pricing GET:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch pricing rules" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ propertyId: string }> }
) {
  try {
    const user = await syncUserInDb();
    if (!user) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
    }
    const { propertyId } = await params;

    const body = await request.json();
    const { startDate, endDate, pricePerNight, surgeMultiplier, reason, roomId } = body;

    if (!startDate || !endDate || (!pricePerNight && !surgeMultiplier)) {
      return NextResponse.json(
        { success: false, error: "Please provide start date, end date, and either a custom price or surge multiplier." },
        { status: 400 }
      );
    }

    // Verify property ownership or ADMIN
    const [property] = await db
      .select()
      .from(properties)
      .where(eq(properties.id, propertyId));

    if (!property) {
      return NextResponse.json({ success: false, error: "Property not found" }, { status: 404 });
    }

    if (property.hostId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized to configure pricing for this property" },
        { status: 403 }
      );
    }

    // Insert new dynamic pricing rule
    const [newRule] = await db
      .insert(propertyPricingRules)
      .values({
        propertyId,
        roomId: roomId || null,
        startDate,
        endDate,
        pricePerNight: pricePerNight ? Number(pricePerNight) : null,
        surgeMultiplier: surgeMultiplier ? Number(surgeMultiplier) : 1.0,
        reason: reason || "Custom Host Pricing",
        isActive: true,
      })
      .returning();

    return NextResponse.json({
      success: true,
      rule: newRule,
      message: `Dynamic pricing rule created for ${startDate} to ${endDate}`,
    });
  } catch (error: any) {
    console.error("Error creating dynamic pricing rule:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create pricing rule" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ propertyId: string }> }
) {
  try {
    const user = await syncUserInDb();
    if (!user) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
    }
    const { propertyId } = await params;
    const { searchParams } = new URL(request.url);
    const ruleId = searchParams.get("ruleId");

    if (!ruleId) {
      return NextResponse.json({ success: false, error: "Rule ID is required" }, { status: 400 });
    }

    // Verify property ownership or ADMIN
    const [property] = await db
      .select()
      .from(properties)
      .where(eq(properties.id, propertyId));

    if (!property || (property.hostId !== user.id && user.role !== "ADMIN")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    await db
      .delete(propertyPricingRules)
      .where(
        and(
          eq(propertyPricingRules.id, ruleId),
          eq(propertyPricingRules.propertyId, propertyId)
        )
      );

    return NextResponse.json({
      success: true,
      message: "Dynamic pricing rule deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting pricing rule:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete pricing rule" },
      { status: 500 }
    );
  }
}
