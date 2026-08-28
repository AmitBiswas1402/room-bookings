import { NextRequest, NextResponse } from "next/server";
import { createRazorpayOrder } from "@/lib/razorpay";
import { currentUser } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  try {
    const clerkUser = await currentUser();
    const body = await req.json();

    const {
      propertyId,
      roomId,
      checkIn,
      checkOut,
      guests,
      amount,
      propertyName,
      roomName,
      guestName,
      guestEmail,
      guestPhone,
    } = body;

    if (!amount || Number(amount) <= 0) {
      return NextResponse.json({ error: "Invalid booking amount" }, { status: 400 });
    }

    if (!checkIn || !checkOut) {
      return NextResponse.json({ error: "Check-in and Check-out dates are required" }, { status: 400 });
    }

    // Live Availability Check (Prevent Overbooking)
    if (propertyId && propertyId.length === 36 && propertyId.includes("-")) {
      try {
        const { getLivePropertyAvailability } = await import("@/lib/availability");
        const availability = await getLivePropertyAvailability({
          propertyId,
          checkIn,
          checkOut,
        });

        if (roomId) {
          const roomStatus = availability.rooms.find((r) => r.roomId === roomId);
          if (roomStatus && roomStatus.isSoldOut) {
            return NextResponse.json(
              { error: `The ${roomStatus.roomName} is fully booked for your selected dates. Please choose another room or different dates.` },
              { status: 400 }
            );
          }
        } else if (availability.propertySoldOut) {
          return NextResponse.json(
            { error: "This property is fully booked for the selected dates." },
            { status: 400 }
          );
        }
      } catch (availErr) {
        console.warn("Notice: Live availability check in order route:", availErr);
      }
    }

    // Generate readable booking reference
    const bookingNumber = `STAY-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    const order = await createRazorpayOrder({
      amount: Number(amount),
      receipt: bookingNumber,
      notes: {
        propertyId: String(propertyId || ""),
        roomId: String(roomId || ""),
        propertyName: String(propertyName || "StaySpot Stay"),
        roomName: String(roomName || "Standard Room"),
        checkIn: String(checkIn),
        checkOut: String(checkOut),
        guestEmail: String(guestEmail || clerkUser?.emailAddresses?.[0]?.emailAddress || ""),
      },
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      bookingNumber,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || "rzp_test_T6CY5sQOs43USL",
    });
  } catch (error) {
    console.error("Razorpay order creation failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to initiate Razorpay order" },
      { status: 500 }
    );
  }
}
