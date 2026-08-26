import { db } from "./index";
import {
  properties,
  propertyImages,
  amenities,
  propertyAmenities,
  rooms,
  roomImages,
  reviews,
  users,
} from "../db/schema";
import { eq } from "drizzle-orm";
import { Stay, ALL_STAYS, HotelRoom, ReviewItem } from "../data/stays";

/**
 * Normalizes string slug for matching
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Fetches all properties directly from Neon Database,
 * populating images, rooms, amenities, reviews, and host profiles.
 */
export async function fetchAllStaysFromDb(): Promise<Stay[]> {
  try {
    const dbProps = await db.select().from(properties);

    if (!dbProps || dbProps.length === 0) {
      return ALL_STAYS;
    }

    const [
      allImages,
      allRooms,
      allRoomImages,
      allPropAmenities,
      allAmenitiesList,
      allReviews,
      allUsers,
    ] = await Promise.all([
      db.select().from(propertyImages),
      db.select().from(rooms),
      db.select().from(roomImages),
      db.select().from(propertyAmenities),
      db.select().from(amenities),
      db.select().from(reviews),
      db.select().from(users),
    ]);

    // Map helpers
    const amenityNameMap = new Map(allAmenitiesList.map((a) => [a.id, a.name]));
    const userMap = new Map(allUsers.map((u) => [u.id, u]));

    const imagesByPropId = new Map<string, string[]>();
    allImages.forEach((img) => {
      const arr = imagesByPropId.get(img.propertyId) || [];
      if (img.isPrimary) {
        arr.unshift(img.imageUrl);
      } else {
        arr.push(img.imageUrl);
      }
      imagesByPropId.set(img.propertyId, arr);
    });

    const roomImagesByRoomId = new Map<string, string[]>();
    allRoomImages.forEach((rImg) => {
      const arr = roomImagesByRoomId.get(rImg.roomId) || [];
      arr.push(rImg.imageUrl);
      roomImagesByRoomId.set(rImg.roomId, arr);
    });

    const roomsByPropId = new Map<string, HotelRoom[]>();
    allRooms.forEach((r) => {
      const arr = roomsByPropId.get(r.propertyId) || [];
      const gallery = roomImagesByRoomId.get(r.id) || [];
      arr.push({
        id: r.id,
        name: r.name,
        type: (r.name.includes("Penthouse")
          ? "Presidential"
          : r.name.includes("Executive")
          ? "Executive"
          : r.name.includes("Suite")
          ? "Suite"
          : "Deluxe") as any,
        description: r.description || "",
        maxGuests: r.maxGuests,
        bedType: r.bedType || "1 King Bed",
        bedsCount: 1,
        sizeSqFt: 450,
        pricePerNight: r.pricePerNight,
        originalPrice: Math.round(r.pricePerNight * 1.25),
        holidayPrice: Math.round(r.pricePerNight * 1.4),
        totalUnits: r.totalUnits,
        imageUrl: gallery[0] || "",
        gallery: gallery,
        amenities: ["Air Conditioning", "High-Speed Wi-Fi", "Smart TV", "Bathtub", "Balcony"],
        mealPlan: "Free Breakfast Included",
      });
      roomsByPropId.set(r.propertyId, arr);
    });

    const amenitiesByPropId = new Map<string, string[]>();
    allPropAmenities.forEach((pa) => {
      const aName = amenityNameMap.get(pa.amenityId);
      if (aName) {
        const arr = amenitiesByPropId.get(pa.propertyId) || [];
        arr.push(aName);
        amenitiesByPropId.set(pa.propertyId, arr);
      }
    });

    const reviewsByPropId = new Map<string, ReviewItem[]>();
    allReviews.forEach((rev) => {
      const arr = reviewsByPropId.get(rev.propertyId) || [];
      const guest = rev.guestId ? userMap.get(rev.guestId) : null;
      arr.push({
        id: rev.id,
        author: guest?.name || "Verified Traveler",
        avatar: guest?.imageUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
        rating: rev.rating,
        date: new Date(rev.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" }),
        comment: rev.comment || "Wonderful stay with luxury amenities and fantastic views.",
      });
      reviewsByPropId.set(rev.propertyId, arr);
    });

    // Convert DB Properties to Stay objects
    const dbStays: Stay[] = dbProps.map((p) => {
      const gallery = imagesByPropId.get(p.id) || [
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
      ];
      const stayRooms = roomsByPropId.get(p.id) || [];
      const stayAmenities = amenitiesByPropId.get(p.id) || [
        "High-Speed Wi-Fi",
        "Air Conditioning",
        "Private Pool",
        "Sea View",
        "Kitchen",
      ];
      const stayReviews = reviewsByPropId.get(p.id) || [];
      const hostUser = userMap.get(p.hostId);

      // Category derivation
      let category: Stay["category"] = "villas";
      if (p.type === "HOTEL") category = "hotels";
      else if (p.type === "APARTMENT") category = "apartments";
      else if (p.type === "RESORT") category = "beachfront";
      else if (p.type === "HOMESTAY") category = "mountains";

      // Price calculation
      const primaryRoom = stayRooms[0];
      const pricePerNight = primaryRoom ? primaryRoom.pricePerNight : 8500;
      const originalPrice = primaryRoom ? primaryRoom.originalPrice : Math.round(pricePerNight * 1.25);
      const holidaySurgePrice = primaryRoom ? (primaryRoom.holidayPrice || Math.round(pricePerNight * 1.4)) : Math.round(pricePerNight * 1.4);

      // Average rating calculation
      const avgRating =
        stayReviews.length > 0
          ? Number((stayReviews.reduce((sum, r) => sum + r.rating, 0) / stayReviews.length).toFixed(2))
          : 5.0;

      // Clean city ID
      const cityId = p.city.toLowerCase().replace(/[^a-z0-9]/g, "");

      return {
        id: p.id,
        title: p.name,
        location: `${p.address ? p.address + ", " : ""}${p.city}`,
        city: p.city,
        cityId: cityId,
        state: p.state || p.city,
        category: category,
        propertyType: p.type as any,
        rating: avgRating,
        reviewsCount: stayReviews.length,
        pricePerNight: pricePerNight,
        originalPrice: originalPrice,
        holidaySurgePrice: holidaySurgePrice,
        isHolidayAvailable: true,
        tag: `${p.type} · Holiday Booking Open`,
        imageUrl: gallery[0],
        gallery: gallery,
        amenities: stayAmenities,
        maxGuests: primaryRoom ? primaryRoom.maxGuests : 6,
        bedrooms: stayRooms.length > 0 ? stayRooms.length : 3,
        beds: stayRooms.length > 0 ? stayRooms.length : 3,
        bathrooms: 2,
        isSuperhost: true,
        isInstantBook: true,
        description: p.description || `Welcome to ${p.name}, a premier ${category} destination in ${p.city}.`,
        lat: p.latitude ? Number(p.latitude) : 19.076,
        lng: p.longitude ? Number(p.longitude) : 72.8777,
        host: {
          name: hostUser?.name || "StaySpot Host",
          avatar: hostUser?.imageUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
          isSuperhost: true,
          yearsHosting: 2,
          responseRate: 100,
          responseTime: "within an hour",
          bio: `Verified Host of luxury properties in ${p.city}.`,
        },
        hostEmail: hostUser?.email,
        sleepingArrangements: stayRooms.map((r, i) => ({
          roomName: r.name,
          bedType: r.bedType,
          count: 1,
        })),
        rooms: stayRooms,
        reviews: stayReviews,
        cleaningFee: 1200,
        serviceFee: 850,
        houseRules: [
          `Check-in: ${p.checkInTime || "2:00 PM"}`,
          `Checkout: ${p.checkOutTime || "11:00 AM"}`,
          "No smoking indoors",
          "Quiet hours after 10:30 PM",
        ],
        status: p.status as any,
        createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : new Date().toISOString(),
      };
    });

    // Merge with static catalog (DB stays take precedence)
    const combinedMap = new Map<string, Stay>();

    // Add static catalog first
    ALL_STAYS.forEach((s) => {
      combinedMap.set(slugify(s.title), s);
      combinedMap.set(s.id, s);
    });

    // Add DB stays (overwriting or appending)
    dbStays.forEach((s) => {
      combinedMap.set(s.id, s);
      combinedMap.set(slugify(s.title), s);
      // Also index by composite slug e.g. "mumbai-new-life-home"
      combinedMap.set(`${s.cityId}-${slugify(s.title)}`, s);
    });

    // Return unique stays by property ID
    const finalUniqueStays: Stay[] = [];
    const seenIds = new Set<string>();

    // First include all DB Stays
    dbStays.forEach((s) => {
      if (!seenIds.has(s.id)) {
        seenIds.add(s.id);
        finalUniqueStays.push(s);
      }
    });

    // Then static stays not in DB
    ALL_STAYS.forEach((s) => {
      const matchDb = dbStays.some((d) => slugify(d.title) === slugify(s.title));
      if (!matchDb && !seenIds.has(s.id)) {
        seenIds.add(s.id);
        finalUniqueStays.push(s);
      }
    });

    return finalUniqueStays;
  } catch (err) {
    console.error("Notice: fetchAllStaysFromDb fallback to static stays:", err);
    return ALL_STAYS;
  }
}

/**
 * Retrieves a single stay by ID, UUID, slug, or title from Neon DB (with static fallback)
 */
export async function fetchStayByIdFromDb(id: string): Promise<Stay | undefined> {
  const normalizedSearch = id.toLowerCase().trim();
  const allStays = await fetchAllStaysFromDb();

  // 1. Exact ID match
  const exactMatch = allStays.find((s) => s.id.toLowerCase() === normalizedSearch);
  if (exactMatch) return exactMatch;

  // 2. Slug match (e.g. "mumbai-new-life-home-2361" -> "new-life-home")
  const cleanSearch = slugify(normalizedSearch);
  const slugMatch = allStays.find((s) => {
    const sSlug = slugify(s.title);
    const sComposite = `${s.cityId}-${sSlug}`;
    return (
      cleanSearch === sSlug ||
      cleanSearch === sComposite ||
      cleanSearch.includes(sSlug) ||
      sSlug.includes(cleanSearch) ||
      normalizedSearch.includes(s.id.toLowerCase())
    );
  });

  return slugMatch;
}
