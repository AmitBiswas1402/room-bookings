import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/authorization";
import { db } from "@/lib";
import { bookings, bookingRooms, properties, users, payments } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const access = await requireRole("ADMIN");
    if (access.status || !access.user) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: access.status || 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get("status"); // 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'PENDING' | 'ALL'

    const allBookings = await db
      .select({
        id: bookings.id,
        bookingNumber: bookings.bookingNumber,
        checkIn: bookings.checkIn,
        checkOut: bookings.checkOut,
        guests: bookings.guests,
        totalAmount: bookings.totalAmount,
        status: bookings.status,
        createdAt: bookings.createdAt,
        guestId: bookings.guestId,
        guestName: users.name,
        guestEmail: users.email,
        guestImage: users.imageUrl,
        propertyId: properties.id,
        propertyName: properties.name,
        propertyCity: properties.city,
        hostId: properties.hostId,
        paymentStatus: payments.status,
        razorpayPaymentId: payments.razorpayPaymentId,
        razorpayOrderId: payments.razorpayOrderId,
      })
      .from(bookings)
      .leftJoin(properties, eq(bookings.propertyId, properties.id))
      .leftJoin(users, eq(bookings.guestId, users.id))
      .leftJoin(payments, eq(payments.bookingId, bookings.id))
      .orderBy(desc(bookings.createdAt));

    // Fetch hosts data to enrich host information
    const allUsers = await db.select().from(users);
    const allBookedRooms = await db.select().from(bookingRooms);

    const enriched = allBookings
      .filter((b) => (!statusFilter || statusFilter === "ALL" ? true : b.status === statusFilter))
      .map((b) => {
        const host = allUsers.find((u) => u.id === b.hostId);
        const bookedRoom = allBookedRooms.find((r) => r.bookingId === b.id);
        return {
          ...b,
          hostName: host?.name || "StaySpot Host",
          hostEmail: host?.email || "",
          roomName: bookedRoom?.roomName || "Luxury Suite",
        };
      });

    return NextResponse.json({
      success: true,
      bookings: enriched,
    });
  } catch (error) {
    console.error("Admin fetch bookings error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load bookings" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const access = await requireRole("ADMIN");
    if (access.status || !access.user) {
      return NextResponse.json(
        { error: "Admin authorization required" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { bookingId, status } = body;

    if (!bookingId || !status || !["CONFIRMED", "CANCELLED", "COMPLETED", "PENDING"].includes(status)) {
      return NextResponse.json(
        { error: "Valid bookingId and status ('CONFIRMED', 'CANCELLED', 'COMPLETED', 'PENDING') are required" },
        { status: 400 }
      );
    }

    const [updated] = await db
      .update(bookings)
      .set({
        status: status as "CONFIRMED" | "CANCELLED" | "COMPLETED" | "PENDING",
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, bookingId))
      .returning();

    return NextResponse.json({
      success: true,
      message: `Booking ${updated.bookingNumber} marked as ${status}.`,
      booking: updated,
    });
  } catch (error) {
    console.error("Admin update booking error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update booking" },
      { status: 500 }
    );
  }
}
