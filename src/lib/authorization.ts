import { currentUser } from "@clerk/nextjs/server";
import { eq, or } from "drizzle-orm";
import { db } from "./index";
import { users } from "../db/schema";

export const ADMIN_EMAIL = "amit.142biswas@gmail.com";

export type UserRole = "GUEST" | "OWNER" | "ADMIN";

export type DbUser = typeof users.$inferSelect;

/**
 * Synchronizes the current Clerk user session with the PostgreSQL database.
 * - Normalized primary email is extracted.
 * - Matches by clerk_id OR email.
 * - On first sign-in: sets role to "ADMIN" if matching ADMIN_EMAIL, else null.
 * - On subsequent sign-ins: updates name, email, and avatar; enforces "ADMIN" if matching ADMIN_EMAIL, else retains existing role.
 */
export async function syncUserInDb(): Promise<DbUser | null> {
  const clerkUser = await currentUser();
  if (!clerkUser) {
    return null;
  }

  const primaryEmail = clerkUser.emailAddresses[0]?.emailAddress?.toLowerCase().trim();
  if (!primaryEmail) {
    return null;
  }

  const isAdmin = primaryEmail === ADMIN_EMAIL.toLowerCase().trim();
  const displayName =
    clerkUser.fullName ||
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
    null;
  const avatarUrl = clerkUser.imageUrl || null;

  // Search users table matching clerk_id OR email
  const existingUsers = await db
    .select()
    .from(users)
    .where(or(eq(users.clerkId, clerkUser.id), eq(users.email, primaryEmail)));

  const existingUser = existingUsers[0];

  if (!existingUser) {
    // First Sign-in (Insert)
    const [newUser] = await db
      .insert(users)
      .values({
        clerkId: clerkUser.id,
        email: primaryEmail,
        name: displayName,
        imageUrl: avatarUrl,
        role: isAdmin ? "ADMIN" : null,
      })
      .returning();

    return newUser;
  }

  // Subsequent Sign-ins (Update)
  const resolvedRole = isAdmin
    ? "ADMIN"
    : existingUser.role === "ADMIN"
    ? null
    : existingUser.role;
  const [updatedUser] = await db
    .update(users)
    .set({
      clerkId: clerkUser.id,
      email: primaryEmail,
      name: displayName || existingUser.name,
      imageUrl: avatarUrl || existingUser.imageUrl,
      role: resolvedRole,
      updatedAt: new Date(),
    })
    .where(eq(users.id, existingUser.id))
    .returning();

  return updatedUser;
}

/**
 * Server-Side Authorization helper that checks user authentication and required roles.
 * - Returns { user: null, status: 401 } if unauthenticated.
 * - Returns { user: null, status: 403 } if user lacks required role.
 * - Returns { user, status: null } if authorized.
 */
export async function requireRole(
  ...roles: UserRole[]
): Promise<{ user: DbUser | null; status: 401 | 403 | null }> {
  const user = await syncUserInDb();

  if (!user) {
    return { user: null, status: 401 };
  }

  if (!user.role || !roles.includes(user.role as UserRole)) {
    return { user: null, status: 403 };
  }

  return { user, status: null };
}
