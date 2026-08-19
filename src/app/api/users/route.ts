import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib";
import { users } from "@/db/schema";
import { syncUserInDb, ADMIN_EMAIL, UserRole } from "@/lib/authorization";

export async function GET() {
  try {
    const user = await syncUserInDb();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error("Error fetching current user:", error);
    return NextResponse.json(
      { error: "Failed to retrieve user profile" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const primaryEmail = clerkUser.emailAddresses[0]?.emailAddress?.toLowerCase().trim();
    if (!primaryEmail) {
      return NextResponse.json(
        { error: "No verified email associated with this account" },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { role } = body as { role?: string };

    const validRoles: UserRole[] = ["GUEST", "OWNER"];
    if (!role || !validRoles.includes(role as UserRole)) {
      return NextResponse.json(
        { error: "Invalid role specified. Allowed values: 'GUEST', 'OWNER'" },
        { status: 400 }
      );
    }

    // Check if the user is the Admin Email
    const isAdmin = primaryEmail === ADMIN_EMAIL.toLowerCase().trim();
    const assignedRole = isAdmin ? "ADMIN" : (role as UserRole);

    // Sync or fetch current DB user
    const dbUser = await syncUserInDb();
    if (!dbUser) {
      return NextResponse.json({ error: "User synchronization failed" }, { status: 500 });
    }

    // Update role in DB
    const [updatedUser] = await db
      .update(users)
      .set({
        role: assignedRole,
        updatedAt: new Date(),
      })
      .where(eq(users.id, dbUser.id))
      .returning();

    return NextResponse.json(
      {
        message: "User role updated successfully",
        user: updatedUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating user role:", error);
    return NextResponse.json(
      { error: "Failed to update user role" },
      { status: 500 }
    );
  }
}
