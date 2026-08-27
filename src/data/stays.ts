export interface HostInfo {
  name: string;
  avatar: string;
  isSuperhost: boolean;
  yearsHosting: number;
  responseRate: number;
  responseTime: string;
  bio: string;
}

export interface ReviewItem {
  id: string;
  author: string;
  avatar: string;
  rating: number;
  date: string;
  comment: string;
}

export interface SleepingArrangement {
  roomName: string;
  bedType: string;
  count: number;
}

export interface HolidayRate {
  holidayName: string;
  startDate: string;
  endDate: string;
  holidayPrice: number;
}

export interface HotelRoom {
  id: string;
  name: string;
  type: "Deluxe" | "Executive" | "Suite" | "Presidential" | "Standard" | "Villa Room";
  description: string;
  maxGuests: number;
  bedType: string;
  bedsCount: number;
  sizeSqFt: number;
  pricePerNight: number;
  originalPrice: number;
  holidayPrice?: number;
  totalUnits: number;
  imageUrl: string;
  gallery: string[];
  amenities: string[];
  mealPlan?: "Room Only" | "Free Breakfast Included" | "All Meals Included";
  cancellationPolicy?: string;
}

export interface Stay {
  id: string;
  title: string;
  location: string;
  city: string;
  cityId: string;
  state: string;
  category: "villas" | "beachfront" | "mountains" | "hotels" | "apartments" | "nature" | "tropical" | "glamping";
  propertyType?: "HOTEL" | "APARTMENT" | "VILLA" | "HOMESTAY" | "HOSTEL" | "RESORT";
  rating: number;
  reviewsCount: number;
  pricePerNight: number;
  originalPrice: number;
  holidaySurgePrice?: number;
  isHolidayAvailable?: boolean;
  holidayPricing?: HolidayRate[];
  tag: string;
  imageUrl: string;
  gallery: string[];
  amenities: string[];
  maxGuests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  isSuperhost: boolean;
  isInstantBook: boolean;
  description: string;
  lat: number;
  lng: number;
  host: HostInfo;
  hostEmail?: string;
  sleepingArrangements: SleepingArrangement[];
  rooms?: HotelRoom[];
  reviews: ReviewItem[];
  cleaningFee: number;
  serviceFee: number;
  houseRules: string[];
  status?: "APPROVED" | "PENDING" | "REJECTED";
  createdAt?: string;
}

export const ALL_STAYS: Stay[] = [];

export interface SearchFilterParams {
  city?: string;
  category?: string;
  destination?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  rooms?: number;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  amenities?: string[];
  sort?: "recommended" | "price_asc" | "price_desc" | "rating" | "reviews";
}

/**
 * Retrieves a single stay by its ID (or case-insensitive match)
 */
export function getStayById(id: string): Stay | undefined {
  const normalizedId = id.toLowerCase().trim();
  return getAllStays().find(
    (s) =>
      s.id.toLowerCase() === normalizedId ||
      s.id.toLowerCase().replace("-", "") === normalizedId.replace("-", "")
  );
}

/**
 * Calculates number of nights between checkIn and checkOut dates.
 * Defaults to 1 if dates are invalid or identical.
 */
export function calculateNights(checkIn?: string, checkOut?: string): number {
  if (!checkIn || !checkOut) return 1;
  const start = new Date(checkIn).getTime();
  const end = new Date(checkOut).getTime();
  if (isNaN(start) || isNaN(end) || end <= start) return 1;
  const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  return Math.max(1, diffDays);
}

/**
 * Formats date range in readable format (e.g. Aug 25 - Aug 28, 2026)
 */
export function formatDateRange(checkIn?: string, checkOut?: string): string {
  if (!checkIn && !checkOut) return "Flexible dates";
  if (checkIn && !checkOut) {
    const d = new Date(checkIn);
    return isNaN(d.getTime()) ? checkIn : d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }
  const d1 = new Date(checkIn!);
  const d2 = new Date(checkOut!);
  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) {
    return `${checkIn} - ${checkOut}`;
  }
  const m1 = d1.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const m2 = d2.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  return `${m1} – ${m2}`;
}

/**
 * Formats number into Indian Rupee currency format (e.g. ₹9,999)
 */
export function formatINR(amount: number): string {
  return "₹" + amount.toLocaleString("en-IN");
}

/**
 * Filters and sorts stays based on all query parameters
 */
export function searchStays(params: SearchFilterParams): Stay[] {
  const cityQuery = (params.city || "").toLowerCase().trim();
  const destQuery = (params.destination || "").toLowerCase().trim();
  const categoryQuery = (params.category || "").toLowerCase().trim();
  const requiredGuests = params.guests || 0;
  const minPrice = params.minPrice || 0;
  const maxPrice = params.maxPrice || Infinity;
  const minRating = params.rating || 0;
  const requiredAmenities = params.amenities || [];

  let results = getAllStays().filter((stay) => {
    // 1. City Match
    if (cityQuery && cityQuery !== "all") {
      const cityMatches =
        stay.cityId.toLowerCase() === cityQuery ||
        stay.city.toLowerCase() === cityQuery ||
        stay.location.toLowerCase().includes(cityQuery) ||
        stay.state.toLowerCase().includes(cityQuery);
      if (!cityMatches) return false;
    }

    // 2. Destination keyword text search
    if (destQuery && destQuery !== "anywhere") {
      const destMatches =
        stay.title.toLowerCase().includes(destQuery) ||
        stay.location.toLowerCase().includes(destQuery) ||
        stay.city.toLowerCase().includes(destQuery) ||
        stay.tag.toLowerCase().includes(destQuery) ||
        stay.description.toLowerCase().includes(destQuery);
      if (!destMatches) return false;
    }

    // 3. Category Match
    if (categoryQuery && categoryQuery !== "all") {
      const catMatches =
        stay.category.toLowerCase() === categoryQuery ||
        stay.tag.toLowerCase().includes(categoryQuery);
      if (!catMatches) return false;
    }

    // 4. Guest Count
    if (requiredGuests > 0 && stay.maxGuests < requiredGuests) {
      return false;
    }

    // 5. Price Range
    if (stay.pricePerNight < minPrice || stay.pricePerNight > maxPrice) {
      return false;
    }

    // 6. Rating
    if (stay.rating < minRating) {
      return false;
    }

    // 7. Amenities
    if (requiredAmenities.length > 0) {
      const hasAllAmenities = requiredAmenities.every((reqAmenity) =>
        stay.amenities.some((a) => a.toLowerCase().includes(reqAmenity.toLowerCase()))
      );
      if (!hasAllAmenities) return false;
    }

    return true;
  });

  // Sorting
  switch (params.sort) {
    case "price_asc":
      results.sort((a, b) => a.pricePerNight - b.pricePerNight);
      break;
    case "price_desc":
      results.sort((a, b) => b.pricePerNight - a.pricePerNight);
      break;
    case "rating":
      results.sort((a, b) => b.rating - a.rating);
      break;
    case "reviews":
      results.sort((a, b) => b.reviewsCount - a.reviewsCount);
      break;
    case "recommended":
    default:
      // Keep curated order
      break;
  }

  return results;
}

/**
 * In-Memory dynamic store for newly published properties
 */
export const customStaysStore: Stay[] = [];

/**
 * Adds a new stay to the active catalog
 */
export function addCustomStay(newStay: Stay): Stay {
  // Check if exists
  const existingIdx = customStaysStore.findIndex((s) => s.id === newStay.id);
  if (existingIdx >= 0) {
    customStaysStore[existingIdx] = newStay;
  } else {
    customStaysStore.unshift(newStay);
  }
  return newStay;
}

/**
 * Deletes a stay by ID
 */
export function deleteCustomStay(id: string): boolean {
  const customIdx = customStaysStore.findIndex((s) => s.id === id);
  if (customIdx >= 0) {
    customStaysStore.splice(customIdx, 1);
    return true;
  }

  const staticIdx = ALL_STAYS.findIndex((s) => s.id === id);
  if (staticIdx >= 0) {
    ALL_STAYS.splice(staticIdx, 1);
    return true;
  }

  return false;
}

/**
 * Returns all active stays (combines catalog + custom stays)
 */
export function getAllStays(): Stay[] {
  const combined = [...customStaysStore, ...ALL_STAYS];
  const uniqueMap = new Map<string, Stay>();
  for (const s of combined) {
    if (!uniqueMap.has(s.id)) {
      uniqueMap.set(s.id, s);
    }
  }
  return Array.from(uniqueMap.values());
}
