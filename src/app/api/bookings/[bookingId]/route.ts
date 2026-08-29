import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib";
import { bookings, bookingRooms, properties, users, payments, propertyImages } from "@/db/schema";
import { eq, or } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ bookingId: string }> }
) {
  try {
    const { bookingId } = await context.params;

    if (!bookingId) {
      return NextResponse.json({ error: "Booking ID or reference is required" }, { status: 400 });
    }

    // Find booking either by UUID id or by bookingNumber (e.g. STAY-829104-492)
    const isUuid = bookingId.length === 36 && bookingId.includes("-") && !bookingId.startsWith("STAY-");

    const condition = isUuid
      ? or(eq(bookings.id, bookingId), eq(bookings.bookingNumber, bookingId))
      : eq(bookings.bookingNumber, bookingId);

    const [foundBooking] = await db
      .select({
        id: bookings.id,
        bookingNumber: bookings.bookingNumber,
        checkIn: bookings.checkIn,
        checkOut: bookings.checkOut,
        guests: bookings.guests,
        totalAmount: bookings.totalAmount,
        status: bookings.status,
        createdAt: bookings.createdAt,
        propertyId: bookings.propertyId,
        guestId: bookings.guestId,
      })
      .from(bookings)
      .where(condition);

    if (!foundBooking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // 1. Fetch Property Details & Host
    const [propertyData] = await db
      .select({
        id: properties.id,
        title: properties.name,
        description: properties.description,
        city: properties.city,
        address: properties.address,
        state: properties.state,
        propertyType: properties.type,
        checkInTime: properties.checkInTime,
        checkOutTime: properties.checkOutTime,
        hostId: properties.hostId,
        hostName: users.name,
        hostEmail: users.email,
        hostAvatar: users.imageUrl,
      })
      .from(properties)
      .leftJoin(users, eq(properties.hostId, users.id))
      .where(eq(properties.id, foundBooking.propertyId));

    // 2. Fetch Property Images
    const images = await db
      .select({ imageUrl: propertyImages.imageUrl })
      .from(propertyImages)
      .where(eq(propertyImages.propertyId, foundBooking.propertyId));

    const imageUrl = images[0]?.imageUrl || "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80";

    // 3. Fetch Guest User Details
    const [guestData] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
      })
      .from(users)
      .where(eq(users.id, foundBooking.guestId));

    // 4. Fetch Room Items for Booking
    const bookedRoomsList = await db
      .select({
        id: bookingRooms.id,
        roomId: bookingRooms.roomId,
        roomName: bookingRooms.roomName,
        pricePerNight: bookingRooms.pricePerNight,
        quantity: bookingRooms.quantity,
        nights: bookingRooms.nights,
        totalPrice: bookingRooms.totalPrice,
      })
      .from(bookingRooms)
      .where(eq(bookingRooms.bookingId, foundBooking.id));

    // 5. Fetch Payment Record
    const [paymentRecord] = await db
      .select({
        id: payments.id,
        razorpayOrderId: payments.razorpayOrderId,
        razorpayPaymentId: payments.razorpayPaymentId,
        amount: payments.amount,
        status: payments.status,
        createdAt: payments.createdAt,
      })
      .from(payments)
      .where(eq(payments.bookingId, foundBooking.id));

    return NextResponse.json({
      success: true,
      booking: {
        ...foundBooking,
        property: {
          ...propertyData,
          imageUrl,
          images: images.map((i) => i.imageUrl),
        },
        guest: guestData,
        rooms: bookedRoomsList,
        payment: paymentRecord || {
          status: "PAID",
          amount: foundBooking.totalAmount,
          razorpayPaymentId: "pay_verified",
        },
      },
    });
  } catch (error) {
    console.error("Failed to load booking details:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load booking details" },
      { status: 500 }
    );
  }
}
