import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/authorization";
import { db } from "@/lib";
import { payments, bookings, properties, users } from "@/db/schema";
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
    const statusFilter = searchParams.get("status"); // 'PAID' | 'REFUNDED' | 'PENDING' | 'FAILED' | 'ALL'

    const allPayments = await db
      .select({
        id: payments.id,
        bookingId: payments.bookingId,
        razorpayOrderId: payments.razorpayOrderId,
        razorpayPaymentId: payments.razorpayPaymentId,
        amount: payments.amount,
        status: payments.status,
        createdAt: payments.createdAt,
        bookingNumber: bookings.bookingNumber,
        checkIn: bookings.checkIn,
        checkOut: bookings.checkOut,
        guestId: bookings.guestId,
        guestName: users.name,
        guestEmail: users.email,
        propertyId: properties.id,
        propertyName: properties.name,
      })
      .from(payments)
      .leftJoin(bookings, eq(payments.bookingId, bookings.id))
      .leftJoin(properties, eq(bookings.propertyId, properties.id))
      .leftJoin(users, eq(bookings.guestId, users.id))
      .orderBy(desc(payments.createdAt));

    const filtered = allPayments.filter((p) =>
      !statusFilter || statusFilter === "ALL" ? true : p.status === statusFilter
    );

    const totalCollected = allPayments
      .filter((p) => p.status === "PAID")
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    const totalRefunded = allPayments
      .filter((p) => p.status === "REFUNDED")
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    return NextResponse.json({
      success: true,
      payments: filtered,
      summary: {
        totalTransactions: allPayments.length,
        totalCollected,
        totalRefunded,
        netRevenue: totalCollected - totalRefunded,
      },
    });
  } catch (error) {
    console.error("Admin fetch payments error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load payments" },
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
    const { paymentId, status } = body;

    if (!paymentId || !status || !["PAID", "REFUNDED", "PENDING", "FAILED"].includes(status)) {
      return NextResponse.json(
        { error: "Valid paymentId and status ('PAID', 'REFUNDED', 'PENDING', 'FAILED') are required" },
        { status: 400 }
      );
    }

    const [updated] = await db
      .update(payments)
      .set({
        status: status as "PAID" | "REFUNDED" | "PENDING" | "FAILED",
        updatedAt: new Date(),
      })
      .where(eq(payments.id, paymentId))
      .returning();

    return NextResponse.json({
      success: true,
      message: `Payment record updated to ${status}.`,
      payment: updated,
    });
  } catch (error) {
    console.error("Admin update payment error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update payment" },
      { status: 500 }
    );
  }
}
