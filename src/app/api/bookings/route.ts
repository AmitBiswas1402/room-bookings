import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/authorization";
import { db } from "@/lib";
import { bookings, bookingRooms, properties, users, payments } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const access = await requireRole("GUEST", "OWNER", "ADMIN");
    if (access.status || !access.user) {
      return NextResponse.json(
        { error: access.status === 401 ? "Authentication required" : "Unauthorized" },
        { status: access.status || 401 }
      );
    }

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
        propertyName: properties.name,
        propertyCity: properties.city,
        guestName: users.name,
        guestEmail: users.email,
        paymentStatus: payments.status,
        razorpayPaymentId: payments.razorpayPaymentId,
      })
      .from(bookings)
      .leftJoin(properties, eq(bookings.propertyId, properties.id))
      .leftJoin(users, eq(bookings.guestId, users.id))
      .leftJoin(payments, eq(payments.bookingId, bookings.id))
      .orderBy(desc(bookings.createdAt));

    return NextResponse.json({
      success: true,
      bookings: allBookings,
    });
  } catch (error) {
    console.error("Failed to fetch bookings:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load bookings" },
      { status: 500 }
    );
  }
}
