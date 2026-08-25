import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import {
  users,
  properties,
  propertyImages,
  amenities,
  propertyAmenities,
  rooms,
  roomImages,
  reviews,
} from "../db/schema";
import { ALL_STAYS } from "../data/stays";

const db = drizzle(process.env.DATABASE_URL!);

async function seed() {
  console.log("🚀 Starting Neon Database Seeding Process...");

  // 1. Ensure Admin and Host Users exist
  console.log("👤 Seeding Users & Hosts...");

  const existingUsers = await db.select().from(users);
  const userByEmail = new Map(existingUsers.map((u) => [u.email.toLowerCase(), u]));

  let adminUser = userByEmail.get("amit.142biswas@gmail.com");
  if (!adminUser) {
    const [createdAdmin] = await db
      .insert(users)
      .values({
        clerkId: "user_admin_amit",
        email: "amit.142biswas@gmail.com",
        name: "Amit Biswas (Admin)",
        imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
        role: "ADMIN",
      })
      .returning();
    adminUser = createdAdmin;
    userByEmail.set(adminUser.email.toLowerCase(), adminUser);
    console.log("  ✓ Created Admin user: amit.142biswas@gmail.com");
  } else {
    console.log("  ✓ Admin user exists: amit.142biswas@gmail.com");
  }

  // Ensure hosts exist
  for (const stay of ALL_STAYS) {
    const hostEmail = `host.${stay.host.name.toLowerCase().replace(/[^a-z0-9]/g, "") || "stayspot"}@stayspot.luxury`;
    if (!userByEmail.has(hostEmail)) {
      const [createdHost] = await db
        .insert(users)
        .values({
          clerkId: `user_host_${stay.id}`,
          email: hostEmail,
          name: stay.host.name,
          imageUrl: stay.host.avatar,
          role: "OWNER",
        })
        .returning();
      userByEmail.set(hostEmail, createdHost);
    }
  }
  console.log(`  ✓ Seeded hosts across all destinations.`);

  // 2. Seed All Unique Amenities
  console.log("✨ Seeding Master Amenities Catalog...");
  const existingAmenities = await db.select().from(amenities);
  const amenityMap = new Map(existingAmenities.map((a) => [a.name.trim().toLowerCase(), a.id]));

  const allAmenityNames = new Set<string>();
  ALL_STAYS.forEach((stay) => {
    stay.amenities.forEach((a) => allAmenityNames.add(a.trim()));
    stay.rooms?.forEach((r) => r.amenities.forEach((a) => allAmenityNames.add(a.trim())));
  });

  [
    "Private Pool",
    "Sea View",
    "Jacuzzi",
    "Gym",
    "High-Speed Wi-Fi",
    "Dedicated Workspace",
    "Balcony",
    "Kitchen",
    "Air Conditioning",
    "Elevator",
    "Free Parking",
    "Security System",
    "BBQ Grill",
    "Mountain Panorama",
    "Heated Rooms",
    "Garden Patio",
    "Daily Breakfast",
    "Pet Friendly",
    "Cocktail Bar",
    "Smart TV",
    "Espresso Machine",
    "Infinity Pool",
    "Rooftop Terrace",
    "Butler on Call",
  ].forEach((a) => allAmenityNames.add(a));

  const toInsertAmenities: { name: string }[] = [];
  allAmenityNames.forEach((name) => {
    if (!amenityMap.has(name.toLowerCase())) {
      toInsertAmenities.push({ name });
    }
  });

  if (toInsertAmenities.length > 0) {
    const inserted = await db.insert(amenities).values(toInsertAmenities).returning();
    inserted.forEach((a) => amenityMap.set(a.name.trim().toLowerCase(), a.id));
  }
  console.log(`  ✓ Inserted/Verified ${amenityMap.size} master amenities.`);

  // 3. Seed Properties, Images, Rooms, Room Images, and Reviews
  console.log(`🏡 Seeding ${ALL_STAYS.length} Luxury Properties into Neon DB...`);

  const existingProperties = await db.select().from(properties);
  const propByName = new Map(existingProperties.map((p) => [p.name.trim().toLowerCase(), p]));

  for (const stay of ALL_STAYS) {
    const hostEmail = `host.${stay.host.name.toLowerCase().replace(/[^a-z0-9]/g, "") || "stayspot"}@stayspot.luxury`;
    const hostUser = userByEmail.get(hostEmail) || adminUser;

    let property = propByName.get(stay.title.trim().toLowerCase());

    if (!property) {
      let propType: "VILLA" | "HOTEL" | "APARTMENT" | "HOMESTAY" | "HOSTEL" | "RESORT" = "VILLA";
      if (stay.propertyType) {
        propType = stay.propertyType;
      } else if (stay.category === "hotels") {
        propType = "HOTEL";
      } else if (stay.category === "apartments") {
        propType = "APARTMENT";
      } else if (stay.category === "beachfront" || stay.category === "tropical") {
        propType = "RESORT";
      } else if (stay.category === "mountains" || stay.category === "nature") {
        propType = "HOMESTAY";
      }

      const [newProp] = await db
        .insert(properties)
        .values({
          hostId: hostUser.id,
          name: stay.title,
          type: propType,
          description: stay.description,
          address: stay.location,
          city: stay.city,
          state: stay.state,
          country: "India",
          latitude: stay.lat.toString(),
          longitude: stay.lng.toString(),
          status: "APPROVED",
          checkInTime: "3:00 PM",
          checkOutTime: "11:00 AM",
        })
        .returning();

      property = newProp;
      propByName.set(property.name.trim().toLowerCase(), property);
    }

    const propertyId = property.id;

    // A. Property Images
    const existingImages = await db
      .select()
      .from(propertyImages)
      .where(eq(propertyImages.propertyId, propertyId));
    const existingImgUrls = new Set(existingImages.map((img) => img.imageUrl));

    const newImages = stay.gallery
      .filter((url) => !existingImgUrls.has(url))
      .map((url, i) => ({
        propertyId,
        imageUrl: url,
        isPrimary: existingImages.length === 0 && i === 0,
      }));

    if (newImages.length > 0) {
      await db.insert(propertyImages).values(newImages);
    }

    // B. Property Amenities
    const propAmenityIds = stay.amenities
      .map((a) => amenityMap.get(a.trim().toLowerCase()))
      .filter(Boolean) as string[];

    for (const aId of propAmenityIds) {
      try {
        await db.insert(propertyAmenities).values({
          propertyId,
          amenityId: aId,
        });
      } catch {
        // Unique conflict
      }
    }

    // C. Hotel Rooms & Suites
    const stayRooms =
      stay.rooms && stay.rooms.length > 0
        ? stay.rooms
        : [
            {
              id: `${stay.id}-r1`,
              name: `Deluxe King Suite`,
              type: "Deluxe" as const,
              description: `Spacious primary master suite at ${stay.title} with panoramic views and luxury amenities.`,
              maxGuests: 2,
              bedType: stay.sleepingArrangements[0]?.bedType || "1 King Bed",
              bedsCount: 1,
              sizeSqFt: 480,
              pricePerNight: stay.pricePerNight,
              originalPrice: stay.originalPrice,
              holidayPrice: stay.holidaySurgePrice || Math.round(stay.pricePerNight * 1.4),
              totalUnits: 2,
              imageUrl: stay.imageUrl,
              gallery: stay.gallery.slice(0, 2),
              amenities: stay.amenities.slice(0, 4),
              mealPlan: "Free Breakfast Included" as const,
            },
            {
              id: `${stay.id}-r2`,
              name: `Executive View Room`,
              type: "Executive" as const,
              description: `Premium bedroom with private balcony, ensuite marble bath, and scenic views.`,
              maxGuests: 2,
              bedType: stay.sleepingArrangements[1]?.bedType || "1 Queen Bed",
              bedsCount: 1,
              sizeSqFt: 390,
              pricePerNight: Math.round(stay.pricePerNight * 0.85),
              originalPrice: Math.round(stay.pricePerNight * 1.1),
              holidayPrice: Math.round(stay.pricePerNight * 1.25),
              totalUnits: 3,
              imageUrl: stay.gallery[1] || stay.imageUrl,
              gallery: stay.gallery.slice(1, 3),
              amenities: stay.amenities.slice(1, 5),
              mealPlan: "Room Only" as const,
            },
          ];

    const existingRooms = await db.select().from(rooms).where(eq(rooms.propertyId, propertyId));
    const roomByName = new Map(existingRooms.map((r) => [r.name.trim().toLowerCase(), r]));

    for (const r of stayRooms) {
      let roomObj = roomByName.get(r.name.trim().toLowerCase());
      if (!roomObj) {
        const [newRoom] = await db
          .insert(rooms)
          .values({
            propertyId,
            name: r.name,
            description: r.description,
            maxGuests: r.maxGuests,
            bedType: r.bedType,
            pricePerNight: r.pricePerNight,
            totalUnits: r.totalUnits || 2,
          })
          .returning();
        roomObj = newRoom;
      }

      if (r.gallery && r.gallery.length > 0) {
        const existingRoomImgs = await db
          .select()
          .from(roomImages)
          .where(eq(roomImages.roomId, roomObj.id));
        const existingUrls = new Set(existingRoomImgs.map((img) => img.imageUrl));

        const newRoomImgs = r.gallery
          .filter((url) => !existingUrls.has(url))
          .map((url) => ({
            roomId: roomObj!.id,
            imageUrl: url,
          }));

        if (newRoomImgs.length > 0) {
          await db.insert(roomImages).values(newRoomImgs);
        }
      }
    }

    // D. Reviews
    if (stay.reviews && stay.reviews.length > 0) {
      const existingReviews = await db
        .select()
        .from(reviews)
        .where(eq(reviews.propertyId, propertyId));
      const existingComments = new Set(existingReviews.map((rev) => rev.comment));

      const newReviews = stay.reviews
        .filter((rev) => !existingComments.has(rev.comment))
        .map((rev) => ({
          propertyId,
          guestId: adminUser!.id,
          rating: Math.round(rev.rating),
          comment: rev.comment,
        }));

      if (newReviews.length > 0) {
        await db.insert(reviews).values(newReviews);
      }
    }
  }

  // 4. Verification & Summary Output
  console.log("\n==================================================");
  console.log("🎉 NEON DATABASE POPULATED SUCCESSFULLY!");
  console.log("==================================================");

  const finalUsers = await db.select().from(users);
  const finalProps = await db.select().from(properties);
  const finalImages = await db.select().from(propertyImages);
  const finalRooms = await db.select().from(rooms);
  const finalAmenities = await db.select().from(amenities);
  const finalReviews = await db.select().from(reviews);

  console.log(`📊 Current Neon Database Live Statistics:`);
  console.log(`  • Users & Hosts:      ${finalUsers.length}`);
  console.log(`  • Properties & Stays: ${finalProps.length}`);
  console.log(`  • Property Photos:    ${finalImages.length}`);
  console.log(`  • Hotel Rooms/Suites: ${finalRooms.length}`);
  console.log(`  • Amenities catalog:  ${finalAmenities.length}`);
  console.log(`  • Guest Reviews:      ${finalReviews.length}`);
  console.log("==================================================\n");
}

seed().catch((err) => {
  console.error("❌ Fatal Seeding Error:", err);
  process.exit(1);
});
