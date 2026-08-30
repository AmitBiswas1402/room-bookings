import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/authorization";
import { db } from "@/lib";
import { users, properties, bookings, payments, reviews } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const access = await requireRole("ADMIN");
    if (access.status || !access.user) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: access.status || 403 }
      );
    }

    const allUsers = await db.select().from(users);
    const allProperties = await db.select().from(properties);
    const allBookings = await db.select().from(bookings);
    const allPayments = await db.select().from(payments);
    const allReviews = await db.select().from(reviews);

    const totalGuests = allUsers.filter((u) => u.role === "GUEST").length;
    const totalOwners = allUsers.filter((u) => u.role === "OWNER" || u.role === "ADMIN").length;
    const pendingProperties = allProperties.filter((p) => p.status === "PENDING").length;
    const approvedProperties = allProperties.filter((p) => p.status === "APPROVED").length;

    const confirmedBookings = allBookings.filter((b) => b.status === "CONFIRMED" || b.status === "COMPLETED").length;
    const cancelledBookings = allBookings.filter((b) => b.status === "CANCELLED").length;

    const totalGrossRevenue = allPayments
      .filter((p) => p.status === "PAID")
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    const totalRefunds = allPayments
      .filter((p) => p.status === "REFUNDED")
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    const netRevenue = totalGrossRevenue - totalRefunds;

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers: allUsers.length,
        totalGuests,
        totalOwners,
        totalProperties: allProperties.length,
        pendingProperties,
        approvedProperties,
        totalBookings: allBookings.length,
        confirmedBookings,
        cancelledBookings,
        totalGrossRevenue,
        totalRefunds,
        netRevenue,
        totalReviews: allReviews.length,
      },
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load admin stats" },
      { status: 500 }
    );
  }
}
