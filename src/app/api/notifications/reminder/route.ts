import { NextRequest, NextResponse } from "next/server";
import { syncUserInDb } from "@/lib/authorization";
import { db } from "@/lib";
import { bookings, properties, users, bookingRooms } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { notifyBookingReminder } from "@/lib/notifications";

export async function POST(req: NextRequest) {
  try {
    const user = await syncUserInDb();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await req.json();
    const { bookingId } = body;

    if (!bookingId) {
      return NextResponse.json({ error: "bookingId is required" }, { status: 400 });
    }

    const isUuid = bookingId.length === 36 && bookingId.includes("-") && !bookingId.startsWith("STAY-");
    const condition = isUuid
      ? or(eq(bookings.id, bookingId), eq(bookings.bookingNumber, bookingId))
      : eq(bookings.bookingNumber, bookingId);

    const [foundBooking] = await db
      .select({
        id: bookings.id,
        bookingNumber: bookings.bookingNumber,
        guestId: bookings.guestId,
        propertyId: bookings.propertyId,
        checkIn: bookings.checkIn,
        checkOut: bookings.checkOut,
      })
      .from(bookings)
      .where(condition);

    if (!foundBooking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Fetch guest details
    const [guestData] = await db
      .select({ name: users.name, email: users.email })
      .from(users)
      .where(eq(users.id, foundBooking.guestId));

    // Fetch property & host details
    const [propertyData] = await db
      .select({
        name: properties.name,
        city: properties.city,
        hostName: users.name,
      })
      .from(properties)
      .leftJoin(users, eq(properties.hostId, users.id))
      .where(eq(properties.id, foundBooking.propertyId));

    // Fetch rooms
    const bookedRooms = await db
      .select()
      .from(bookingRooms)
      .where(eq(bookingRooms.bookingId, foundBooking.id));

    const roomName = bookedRooms[0]?.roomName || "Luxury Suite";

    if (guestData?.email) {
      await notifyBookingReminder({
        guestId: foundBooking.guestId,
        guestName: guestData.name || "Valued Guest",
        guestEmail: guestData.email,
        bookingNumber: foundBooking.bookingNumber,
        propertyName: propertyData?.name || "Luxury Property",
        propertyCity: propertyData?.city || "India",
        roomName,
        checkIn: foundBooking.checkIn,
        checkOut: foundBooking.checkOut,
        hostName: propertyData?.hostName || "Host",
      });
    }

    return NextResponse.json({
      success: true,
      message: `Booking reminder notification and email dispatched for ${foundBooking.bookingNumber}.`,
    });
  } catch (error) {
    console.error("Reminder dispatch failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to send reminder" },
      { status: 500 }
    );
  }
}
