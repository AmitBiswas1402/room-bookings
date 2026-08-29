import { NextRequest, NextResponse } from "next/server";
import { syncUserInDb } from "@/lib/authorization";
import { db } from "@/lib";
import { notifications } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { ensureNotificationsTable } from "@/lib/notifications";

export async function GET(req: NextRequest) {
  try {
    const user = await syncUserInDb();
    if (!user) {
      return NextResponse.json({ success: true, notifications: [], unreadCount: 0 });
    }

    await ensureNotificationsTable();

    const userNotifications = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, user.id))
      .orderBy(desc(notifications.createdAt))
      .limit(30);

    const unreadCount = userNotifications.filter((n) => !n.isRead).length;

    return NextResponse.json({
      success: true,
      notifications: userNotifications,
      unreadCount,
    });
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load notifications" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await syncUserInDb();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await ensureNotificationsTable();

    const body = await req.json().catch(() => ({}));
    const { notificationId, markAllAsRead } = body;

    if (markAllAsRead) {
      await db
        .update(notifications)
        .set({ isRead: true })
        .where(eq(notifications.userId, user.id));

      return NextResponse.json({ success: true, message: "All notifications marked as read" });
    }

    if (notificationId) {
      await db
        .update(notifications)
        .set({ isRead: true })
        .where(and(eq(notifications.id, notificationId), eq(notifications.userId, user.id)));

      return NextResponse.json({ success: true, message: "Notification marked as read" });
    }

    return NextResponse.json({ error: "Missing notificationId or markAllAsRead flag" }, { status: 400 });
  } catch (error) {
    console.error("Failed to update notifications:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update notification" },
      { status: 500 }
    );
  }
}
