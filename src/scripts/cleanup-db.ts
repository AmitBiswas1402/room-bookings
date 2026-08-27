import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../db/schema";
import { notInArray, eq } from "drizzle-orm";

const db = drizzle(process.env.DATABASE_URL!);

async function cleanup() {
  console.log("Starting Neon DB cleanup...");

  // Keep only Amit Biswas user accounts
  const allowedEmails = [
    "amit.142biswas@gmail.com",
    "amitstudying1@gmail.com",
    "dsalearners6@gmail.com",
  ];

  // 1. Identify Amit Biswas user IDs
  const amitUsers = await db.select().from(schema.users);
  const keepUserIds = amitUsers
    .filter((u) => allowedEmails.includes(u.email.toLowerCase().trim()) || u.name?.toLowerCase().includes("amit biswas"))
    .map((u) => u.id);

  console.log("Preserving Amit Biswas User IDs:", keepUserIds);

  // 2. Identify created properties to keep (properties owned by Amit Biswas)
  const allProps = await db.select().from(schema.properties);
  const keepPropertyIds = allProps
    .filter((p) => keepUserIds.includes(p.hostId))
    .map((p) => p.id);

  console.log("Preserving Created Property IDs:", keepPropertyIds);

  const removePropertyIds = allProps
    .filter((p) => !keepPropertyIds.includes(p.id))
    .map((p) => p.id);

  console.log(`Deleting ${removePropertyIds.length} hardcoded seed properties...`);

  if (removePropertyIds.length > 0) {
    // Delete reviews for removed properties
    for (const propId of removePropertyIds) {
      await db.delete(schema.reviews).where(eq(schema.reviews.propertyId, propId));
      await db.delete(schema.propertyAmenities).where(eq(schema.propertyAmenities.propertyId, propId));
      await db.delete(schema.propertyImages).where(eq(schema.propertyImages.propertyId, propId));
      
      // Delete rooms and room images
      const propRooms = await db.select().from(schema.rooms).where(eq(schema.rooms.propertyId, propId));
      for (const room of propRooms) {
        await db.delete(schema.roomImages).where(eq(schema.roomImages.roomId, room.id));
      }
      await db.delete(schema.rooms).where(eq(schema.rooms.propertyId, propId));
      
      // Delete bookings if any
      await db.delete(schema.bookings).where(eq(schema.bookings.propertyId, propId));

      // Finally delete the property
      await db.delete(schema.properties).where(eq(schema.properties.id, propId));
    }
  }

  // 3. Delete non-Amit users
  const removeUserIds = amitUsers
    .filter((u) => !keepUserIds.includes(u.id))
    .map((u) => u.id);

  console.log(`Deleting ${removeUserIds.length} dummy seed users...`);
  for (const uid of removeUserIds) {
    await db.delete(schema.reviews).where(eq(schema.reviews.guestId, uid));
    await db.delete(schema.bookings).where(eq(schema.bookings.guestId, uid));
    await db.delete(schema.users).where(eq(schema.users.id, uid));
  }

  console.log("✅ Neon DB cleanup completed successfully!");
}

cleanup()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Cleanup error:", err);
    process.exit(1);
  });
