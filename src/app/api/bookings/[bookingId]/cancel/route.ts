import { NextRequest, NextResponse } from "next/server";
import { syncUserInDb } from "@/lib/authorization";
import { db } from "@/lib";
import { bookings, bookingRooms, properties, users, payments } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { notifyBookingCancellationAndRefund } from "@/lib/notifications";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ bookingId: string }> }
) {
  try {
    const user = await syncUserInDb();
    if (!user) {
      return NextResponse.json({ error: "Authentication required to cancel reservation" }, { status: 401 });
    }

    const { bookingId } = await context.params;
    if (!bookingId) {
      return NextResponse.json({ error: "Booking ID is required" }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const reason = body?.reason || "Guest requested cancellation";

    // 1. Locate booking
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
        totalAmount: bookings.totalAmount,
        status: bookings.status,
      })
      .from(bookings)
      .where(condition);

    if (!foundBooking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (foundBooking.status === "CANCELLED") {
      return NextResponse.json({ error: "Booking is already cancelled" }, { status: 400 });
    }

    // 2. Fetch property details
    const [propertyData] = await db
      .select({
        id: properties.id,
        name: properties.name,
        hostId: properties.hostId,
      })
      .from(properties)
      .where(eq(properties.id, foundBooking.propertyId));

    // 3. Authorization check: user must be guest, property host, or ADMIN
    const isGuest = user.id === foundBooking.guestId;
    const isHost = propertyData && user.id === propertyData.hostId;
    const isAdmin = user.role === "ADMIN";

    if (!isGuest && !isHost && !isAdmin) {
      return NextResponse.json({ error: "Unauthorized to cancel this booking" }, { status: 403 });
    }

    // 4. Fetch guest & host details
    const [guestData] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
      })
      .from(users)
      .where(eq(users.id, foundBooking.guestId));

    let hostEmail = "";
    let hostName = "Property Host";
    if (propertyData?.hostId) {
      const [hostData] = await db
        .select({ name: users.name, email: users.email })
        .from(users)
        .where(eq(users.id, propertyData.hostId));
      if (hostData) {
        hostEmail = hostData.email || "";
        hostName = hostData.name || "Property Host";
      }
    }

    // 5. Fetch booked rooms
    const bookedRooms = await db
      .select()
      .from(bookingRooms)
      .where(eq(bookingRooms.bookingId, foundBooking.id));

    const roomName = bookedRooms[0]?.roomName || "Luxury Suite";

    // 6. Calculate Cancellation Policy & Refund
    const checkInDate = new Date(foundBooking.checkIn);
    const now = new Date();
    const hoursUntilCheckIn = (checkInDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    let refundPercentage = 100;
    let policyNote = "Free cancellation policy applied (>48 hours before check-in). 100% full refund.";

    if (hoursUntilCheckIn < 24) {
      refundPercentage = 50;
      policyNote = "Late cancellation (<24 hours prior to check-in). 50% partial refund after late room release fee.";
    } else if (hoursUntilCheckIn < 48) {
      refundPercentage = 75;
      policyNote = "Standard cancellation (24-48 hours before check-in). 75% refund.";
    }

    const refundAmount = Math.round((foundBooking.totalAmount * refundPercentage) / 100);

    // 7. Update booking status to CANCELLED (this instantly releases room inventory)
    await db
      .update(bookings)
      .set({
        status: "CANCELLED",
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, foundBooking.id));

    // 8. Update payment status to REFUNDED
    await db
      .update(payments)
      .set({
        status: "REFUNDED",
        updatedAt: new Date(),
      })
      .where(eq(payments.bookingId, foundBooking.id));

    // 9. Dispatch Multi-Role In-App & Email Notifications (Guest + Owner)
    notifyBookingCancellationAndRefund({
      guestId: foundBooking.guestId,
      guestName: guestData?.name || "Valued Guest",
      guestEmail: guestData?.email || "guest@stayspot.com",
      hostId: propertyData?.hostId,
      hostName,
      hostEmail: hostEmail || undefined,
      bookingNumber: foundBooking.bookingNumber,
      propertyName: propertyData?.name || "Luxury Property",
      roomName,
      checkIn: foundBooking.checkIn,
      checkOut: foundBooking.checkOut,
      refundAmount,
      refundPercentage,
      policyApplied: policyNote,
    }).catch((err) => {
      console.error("Notice: async cancellation notification note:", err);
    });

    return NextResponse.json({
      success: true,
      message: "Reservation cancelled successfully and inventory released.",
      bookingNumber: foundBooking.bookingNumber,
      refundAmount,
      refundPercentage,
      policyApplied: policyNote,
      status: "CANCELLED",
    });
  } catch (error) {
    console.error("Cancellation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to cancel booking" },
      { status: 500 }
    );
  }
}
