import { db } from "@/lib";
import { notifications, users, properties, bookings } from "@/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import {
  sendBookingConfirmationEmail,
  sendNewBookingOwnerAlertEmail,
  sendBookingCancellationEmail,
  sendBookingCancellationOwnerEmail,
  sendBookingReminderGuestEmail,
} from "./email";

/**
 * Ensures notifications table exists in Neon DB
 */
let isTableInitialized = false;
export async function ensureNotificationsTable() {
  if (isTableInitialized) return;
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        link TEXT,
        is_read BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    isTableInitialized = true;
  } catch (err) {
    console.error("Notice: notifications table check note:", err);
  }
}

/**
 * Creates an in-app notification for a user
 */
export async function createNotification({
  userId,
  type,
  title,
  message,
  link,
}: {
  userId: string;
  type: string;
  title: string;
  message: string;
  link?: string;
}) {
  try {
    await ensureNotificationsTable();
    const [notif] = await db
      .insert(notifications)
      .values({
        userId,
        type,
        title,
        message,
        link: link || null,
        isRead: false,
      })
      .returning();
    return notif;
  } catch (error) {
    console.error("Failed to create in-app notification:", error);
    return null;
  }
}

/**
 * 1. TRIGGER: Booking & Payment Confirmation
 * Notifies BOTH Guest and Owner (In-App + Email)
 */
export async function notifyBookingAndPaymentConfirmation({
  guestId,
  guestName,
  guestEmail,
  hostId,
  hostName,
  hostEmail,
  bookingNumber,
  propertyName,
  propertyCity,
  roomName,
  checkIn,
  checkOut,
  nights,
  guestsCount,
  totalAmount,
  razorpayPaymentId,
}: {
  guestId?: string;
  guestName: string;
  guestEmail: string;
  hostId?: string;
  hostName: string;
  hostEmail?: string;
  bookingNumber: string;
  propertyName: string;
  propertyCity: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guestsCount: number;
  totalAmount: number;
  razorpayPaymentId: string;
}) {
  const formattedAmount = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(totalAmount);

  // 1. IN-APP NOTIFICATION FOR GUEST
  if (guestId) {
    await createNotification({
      userId: guestId,
      type: "BOOKING_CONFIRMATION",
      title: "🎉 Booking & Payment Confirmed!",
      message: `Your reservation at ${propertyName} (${roomName}) for ${checkIn} → ${checkOut} is confirmed. ${formattedAmount} paid via Razorpay.`,
      link: `/booking/confirmation?bookingNumber=${bookingNumber}`,
    });
  }

  // 2. IN-APP NOTIFICATION FOR OWNER
  if (hostId) {
    await createNotification({
      userId: hostId,
      type: "NEW_BOOKING_OWNER",
      title: "🔔 New Guest Booking Received!",
      message: `${guestName} booked ${roomName} at ${propertyName} from ${checkIn} to ${checkOut} (${nights} nights). Payout: ${formattedAmount}.`,
      link: `/dashboard?tab=bookings`,
    });
  }

  // 3. EMAIL TO GUEST (Booking & Payment Tax Receipt)
  sendBookingConfirmationEmail({
    guestName,
    guestEmail,
    bookingNumber,
    propertyName,
    propertyCity,
    roomName,
    checkIn,
    checkOut,
    nights,
    guestsCount,
    totalAmount,
    razorpayPaymentId,
    hostName,
    hostEmail,
  }).catch((err) => console.error("Guest confirmation email error:", err));

  // 4. EMAIL TO OWNER (New Booking Alert)
  if (hostEmail) {
    sendNewBookingOwnerAlertEmail({
      hostName,
      hostEmail,
      guestName,
      guestEmail,
      bookingNumber,
      propertyName,
      propertyCity,
      roomName,
      checkIn,
      checkOut,
      nights,
      guestsCount,
      totalAmount,
    }).catch((err) => console.error("Owner alert email error:", err));
  }
}

/**
 * 2. TRIGGER: Booking Cancellation & Refund
 * Notifies BOTH Guest and Owner (In-App + Email)
 */
export async function notifyBookingCancellationAndRefund({
  guestId,
  guestName,
  guestEmail,
  hostId,
  hostName,
  hostEmail,
  bookingNumber,
  propertyName,
  roomName,
  checkIn,
  checkOut,
  refundAmount,
  refundPercentage,
  policyApplied,
}: {
  guestId?: string;
  guestName: string;
  guestEmail: string;
  hostId?: string;
  hostName: string;
  hostEmail?: string;
  bookingNumber: string;
  propertyName: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  refundAmount: number;
  refundPercentage: number;
  policyApplied: string;
}) {
  const formattedRefund = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(refundAmount);

  // 1. IN-APP NOTIFICATION FOR GUEST
  if (guestId) {
    await createNotification({
      userId: guestId,
      type: "CANCELLATION_GUEST",
      title: "⚠️ Reservation Cancelled & Refund Initiated",
      message: `Your booking for ${propertyName} (${bookingNumber}) was cancelled. Refund of ${formattedRefund} (${refundPercentage}%) has been initiated.`,
      link: `/booking/confirmation?bookingNumber=${bookingNumber}`,
    });
  }

  // 2. IN-APP NOTIFICATION FOR OWNER
  if (hostId) {
    await createNotification({
      userId: hostId,
      type: "CANCELLATION_OWNER",
      title: "📢 Booking Cancelled · Room Inventory Released",
      message: `${guestName} cancelled their booking for ${propertyName} (${roomName}) scheduled for ${checkIn} to ${checkOut}. Dates are available again.`,
      link: `/dashboard?tab=bookings`,
    });
  }

  // 3. EMAIL TO GUEST
  sendBookingCancellationEmail({
    guestName,
    guestEmail,
    bookingNumber,
    propertyName,
    roomName,
    checkIn,
    checkOut,
    refundAmount,
    refundPercentage,
    cancellationPolicyApplied: policyApplied,
  }).catch((err) => console.error("Guest cancellation email error:", err));

  // 4. EMAIL TO OWNER
  if (hostEmail) {
    sendBookingCancellationOwnerEmail({
      hostName,
      hostEmail,
      guestName,
      bookingNumber,
      propertyName,
      roomName,
      checkIn,
      checkOut,
    }).catch((err) => console.error("Owner cancellation email error:", err));
  }
}

/**
 * 3. TRIGGER: Upcoming Booking Reminder
 * Notifies Guest (In-App + Email)
 */
export async function notifyBookingReminder({
  guestId,
  guestName,
  guestEmail,
  bookingNumber,
  propertyName,
  propertyCity,
  roomName,
  checkIn,
  checkOut,
  hostName,
}: {
  guestId?: string;
  guestName: string;
  guestEmail: string;
  bookingNumber: string;
  propertyName: string;
  propertyCity: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  hostName?: string;
}) {
  // In-App Notification
  if (guestId) {
    await createNotification({
      userId: guestId,
      type: "BOOKING_REMINDER",
      title: "🏖️ Upcoming Stay Reminder!",
      message: `Your luxury getaway to ${propertyName} in ${propertyCity} starts on ${checkIn}! Check-in begins at 2:00 PM.`,
      link: `/booking/confirmation?bookingNumber=${bookingNumber}`,
    });
  }

  // Email Notification
  sendBookingReminderGuestEmail({
    guestName,
    guestEmail,
    bookingNumber,
    propertyName,
    propertyCity,
    roomName,
    checkIn,
    checkOut,
    hostName,
  }).catch((err) => console.error("Guest reminder email error:", err));
}
