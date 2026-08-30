import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/authorization";
import { db } from "@/lib";
import { users, bookings, properties, payments } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const access = await requireRole("ADMIN");
    if (access.status || !access.user) {
      return NextResponse.json(
        { error: access.status === 401 ? "Authentication required" : "Admin access required" },
        { status: access.status || 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const roleFilter = searchParams.get("role"); // 'GUEST' | 'OWNER' | 'ADMIN' | null

    const allUsers = await db.select().from(users).orderBy(desc(users.createdAt));

    // Aggregate booking counts & property counts for each user
    const allBookings = await db.select().from(bookings);
    const allProperties = await db.select().from(properties);

    const enrichedUsers = allUsers
      .filter((u) => (!roleFilter || roleFilter === "ALL" ? true : u.role === roleFilter))
      .map((u) => {
        const userBookings = allBookings.filter((b) => b.guestId === u.id);
        const userProperties = allProperties.filter((p) => p.hostId === u.id);
        const totalSpent = userBookings
          .filter((b) => b.status !== "CANCELLED")
          .reduce((sum, b) => sum + (b.totalAmount || 0), 0);
        const totalRevenue = allBookings
          .filter((b) => userProperties.some((p) => p.id === b.propertyId) && b.status !== "CANCELLED")
          .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

        return {
          id: u.id,
          name: u.name,
          email: u.email,
          imageUrl: u.imageUrl,
          role: u.role,
          createdAt: u.createdAt,
          bookingsCount: userBookings.length,
          propertiesCount: userProperties.length,
          totalSpent,
          totalRevenue,
        };
      });

    return NextResponse.json({
      success: true,
      users: enrichedUsers,
    });
  } catch (error) {
    console.error("Admin fetch users error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load users" },
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
    const { userId, role } = body;

    if (!userId || !role || !["GUEST", "OWNER", "ADMIN"].includes(role)) {
      return NextResponse.json(
        { error: "Valid userId and role ('GUEST', 'OWNER', 'ADMIN') are required" },
        { status: 400 }
      );
    }

    const [updatedUser] = await db
      .update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();

    return NextResponse.json({
      success: true,
      message: `User ${updatedUser.email} role updated to ${role}`,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Admin update user error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update user" },
      { status: 500 }
    );
  }
}
