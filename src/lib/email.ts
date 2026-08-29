import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
export const resend = resendApiKey ? new Resend(resendApiKey) : null;

const SENDER_EMAIL = process.env.SENDER_EMAIL || "StaySpot Luxury Stays <onboarding@resend.dev>";

export interface BookingConfirmationEmailData {
  guestName: string;
  guestEmail: string;
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
  hostName?: string;
  hostEmail?: string;
}

export interface BookingCancellationEmailData {
  guestName: string;
  guestEmail: string;
  bookingNumber: string;
  propertyName: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  refundAmount: number;
  refundPercentage: number;
  cancellationPolicyApplied: string;
}

export interface OwnerNewBookingEmailData {
  hostName: string;
  hostEmail: string;
  guestName: string;
  guestEmail: string;
  bookingNumber: string;
  propertyName: string;
  propertyCity: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guestsCount: number;
  totalAmount: number;
}

export interface OwnerCancellationEmailData {
  hostName: string;
  hostEmail: string;
  guestName: string;
  bookingNumber: string;
  propertyName: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
}

export interface GuestReminderEmailData {
  guestName: string;
  guestEmail: string;
  bookingNumber: string;
  propertyName: string;
  propertyCity: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  hostName?: string;
}

/**
 * 1. Sends a booking & payment confirmation email to the guest
 */
export async function sendBookingConfirmationEmail(data: BookingConfirmationEmailData) {
  if (!resend) {
    console.warn("Resend API key missing; skipping confirmation email dispatch.");
    return { success: false, error: "Resend not configured" };
  }

  const {
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
  } = data;

  const formattedTotal = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(totalAmount);

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Confirmed - ${bookingNumber}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #090d16; color: #f1f5f9; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background-color: #0f172a; border: 1px solid #1e293b; border-radius: 20px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%); padding: 32px 24px; text-align: center; border-bottom: 1px solid #334155; }
    .badge { display: inline-block; background-color: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 9999px; padding: 4px 12px; font-size: 12px; font-weight: 700; text-transform: uppercase; margin-bottom: 12px; }
    .title { color: #ffffff; font-size: 24px; font-weight: 800; margin: 0 0 6px 0; }
    .subtitle { color: #94a3b8; font-size: 14px; margin: 0; }
    .content { padding: 28px 24px; }
    .card { background-color: #1e293b; border: 1px solid #334155; border-radius: 14px; padding: 18px; margin-bottom: 20px; }
    .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #334155; font-size: 13px; }
    .row:last-child { border-bottom: none; }
    .label { color: #94a3b8; }
    .val { color: #f8fafc; font-weight: 600; text-align: right; }
    .total-box { background: linear-gradient(135deg, #312e81 0%, #1e1b4b 100%); border: 1px solid #4f46e5; border-radius: 12px; padding: 16px; text-align: center; margin: 20px 0; }
    .total-amount { font-size: 28px; font-weight: 900; color: #34d399; margin: 4px 0 0 0; font-family: monospace; }
    .btn { display: inline-block; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: #ffffff; text-decoration: none; font-weight: 700; font-size: 14px; padding: 14px 28px; border-radius: 12px; text-align: center; margin-top: 10px; }
    .footer { text-align: center; padding: 24px; font-size: 12px; color: #64748b; border-top: 1px solid #1e293b; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="badge">&#10003; Payment Verified &amp; Confirmed</div>
      <h1 class="title">Reservation Confirmed!</h1>
      <p class="subtitle">StaySpot Luxury Hospitality &#183; Ref: <strong>${bookingNumber}</strong></p>
    </div>
    <div class="content">
      <p style="margin-top: 0; font-size: 14px; color: #cbd5e1;">Dear <strong>${guestName}</strong>,</p>
      <p style="font-size: 14px; color: #94a3b8; line-height: 1.5;">Your payment via Razorpay was successful. Your stay at <strong>${propertyName}</strong> in ${propertyCity} is officially locked in.</p>
      
      <div class="card">
        <div style="font-size: 12px; font-weight: 700; color: #818cf8; text-transform: uppercase; margin-bottom: 10px;">Stay Details</div>
        <div class="row"><span class="label">Property</span><span class="val">${propertyName}</span></div>
        <div class="row"><span class="label">Location</span><span class="val">${propertyCity}</span></div>
        <div class="row"><span class="label">Reserved Suite</span><span class="val">${roomName}</span></div>
        <div class="row"><span class="label">Check-in</span><span class="val">${checkIn} (from 2:00 PM)</span></div>
        <div class="row"><span class="label">Checkout</span><span class="val">${checkOut} (until 11:00 AM)</span></div>
        <div class="row"><span class="label">Duration &amp; Guests</span><span class="val">${nights} Nights &#183; ${guestsCount} Guests</span></div>
      </div>

      <div class="total-box">
        <div style="font-size: 12px; color: #c7d2fe; text-transform: uppercase; font-weight: 700;">Grand Total Paid</div>
        <div class="total-amount">${formattedTotal}</div>
        <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">Razorpay ID: ${razorpayPaymentId}</div>
      </div>

      <div style="text-align: center; margin: 24px 0;">
        <a href="https://stayspot.luxury/booking/confirmation?bookingNumber=${bookingNumber}" class="btn">View Full Tax Invoice &amp; Voucher &rarr;</a>
      </div>

      <div style="background-color: #0b0f19; border-radius: 10px; padding: 14px; font-size: 12px; color: #94a3b8; line-height: 1.5;">
        <strong style="color: #f1f5f9;">Host Concierge:</strong> ${hostName || "Host"} will welcome you upon arrival. If you have special requests or airport transfer inquiries, feel free to reach out.
      </div>
    </div>

    <div class="footer">
      &copy; 2026 StaySpot Hospitality. All rights reserved.<br>
      24/7 Guest Concierge: support@stayspot.com
    </div>
  </div>
</body>
</html>
  `;

  try {
    const guestResult = await resend.emails.send({
      from: SENDER_EMAIL,
      to: guestEmail,
      subject: `Booking & Payment Confirmed: ${propertyName} [${bookingNumber}]`,
      html: htmlContent,
    });
    return { success: true, result: guestResult };
  } catch (error) {
    console.error("Failed to send booking confirmation email:", error);
    return { success: false, error };
  }
}

/**
 * 2. Sends new booking alert to the property owner
 */
export async function sendNewBookingOwnerAlertEmail(data: OwnerNewBookingEmailData) {
  if (!resend) {
    console.warn("Resend API key missing; skipping owner alert email.");
    return { success: false, error: "Resend not configured" };
  }

  const {
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
  } = data;

  const formattedTotal = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(totalAmount);

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #090d16; color: #f1f5f9; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background-color: #0f172a; border: 1px solid #1e293b; border-radius: 20px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%); padding: 28px 24px; text-align: center; border-bottom: 1px solid #334155; }
    .badge { display: inline-block; background-color: rgba(99, 102, 241, 0.15); color: #a5b4fc; border: 1px solid rgba(99, 102, 241, 0.3); border-radius: 9999px; padding: 4px 12px; font-size: 12px; font-weight: 700; text-transform: uppercase; margin-bottom: 12px; }
    .title { color: #ffffff; font-size: 22px; font-weight: 800; margin: 0; }
    .content { padding: 28px 24px; }
    .card { background-color: #1e293b; border: 1px solid #334155; border-radius: 14px; padding: 18px; margin-bottom: 20px; }
    .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #334155; font-size: 13px; }
    .row:last-child { border-bottom: none; }
    .label { color: #94a3b8; }
    .val { color: #f8fafc; font-weight: 600; text-align: right; }
    .payout-box { background: linear-gradient(135deg, #064e3b 0%, #022c22 100%); border: 1px solid #059669; border-radius: 12px; padding: 16px; text-align: center; margin: 20px 0; }
    .amount { font-size: 26px; font-weight: 900; color: #34d399; font-family: monospace; }
    .btn { display: inline-block; background: #6366f1; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 13px; padding: 12px 24px; border-radius: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="badge">&#128276; Host Notification</div>
      <h1 class="title">New Reservation Received!</h1>
    </div>
    <div class="content">
      <p style="margin-top: 0; font-size: 14px; color: #cbd5e1;">Dear <strong>${hostName}</strong>,</p>
      <p style="font-size: 14px; color: #94a3b8;">Great news! You have a new confirmed reservation for <strong>${propertyName}</strong> (${roomName}) in ${propertyCity}.</p>
      
      <div class="card">
        <div style="font-size: 12px; font-weight: 700; color: #818cf8; text-transform: uppercase; margin-bottom: 10px;">Reservation Details</div>
        <div class="row"><span class="label">Guest Name</span><span class="val">${guestName}</span></div>
        <div class="row"><span class="label">Guest Email</span><span class="val">${guestEmail}</span></div>
        <div class="row"><span class="label">Check-in</span><span class="val">${checkIn}</span></div>
        <div class="row"><span class="label">Checkout</span><span class="val">${checkOut}</span></div>
        <div class="row"><span class="label">Stay</span><span class="val">${nights} Nights &#183; ${guestsCount} Guests</span></div>
        <div class="row"><span class="label">Booking Ref</span><span class="val">${bookingNumber}</span></div>
      </div>

      <div class="payout-box">
        <div style="font-size: 12px; color: #a7f3d0; text-transform: uppercase; font-weight: 700;">Payout Total</div>
        <div class="amount">${formattedTotal}</div>
      </div>

      <div style="text-align: center; margin: 20px 0;">
        <a href="https://stayspot.luxury/dashboard?tab=bookings" class="btn">View in Owner Dashboard &rarr;</a>
      </div>
    </div>
  </div>
</body>
</html>
  `;

  try {
    const result = await resend.emails.send({
      from: SENDER_EMAIL,
      to: hostEmail,
      subject: `New Reservation Alert: ${propertyName} - ${guestName} [${bookingNumber}]`,
      html: htmlContent,
    });
    return { success: true, result };
  } catch (error) {
    console.error("Failed to send owner alert email:", error);
    return { success: false, error };
  }
}

/**
 * 3. Sends booking cancellation and refund receipt email to guest
 */
export async function sendBookingCancellationEmail(data: BookingCancellationEmailData) {
  if (!resend) {
    console.warn("Resend API key missing; skipping cancellation email.");
    return { success: false, error: "Resend not configured" };
  }

  const {
    guestName,
    guestEmail,
    bookingNumber,
    propertyName,
    roomName,
    checkIn,
    checkOut,
    refundAmount,
    refundPercentage,
    cancellationPolicyApplied,
  } = data;

  const formattedRefund = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(refundAmount);

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #090d16; color: #f1f5f9; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background-color: #0f172a; border: 1px solid #1e293b; border-radius: 20px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #450a0a 0%, #0f172a 100%); padding: 32px 24px; text-align: center; border-bottom: 1px solid #334155; }
    .badge { display: inline-block; background-color: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 9999px; padding: 4px 12px; font-size: 12px; font-weight: 700; text-transform: uppercase; margin-bottom: 12px; }
    .title { color: #ffffff; font-size: 24px; font-weight: 800; margin: 0 0 6px 0; }
    .subtitle { color: #94a3b8; font-size: 14px; margin: 0; }
    .content { padding: 28px 24px; }
    .card { background-color: #1e293b; border: 1px solid #334155; border-radius: 14px; padding: 18px; margin-bottom: 20px; }
    .refund-box { background: linear-gradient(135deg, #064e3b 0%, #022c22 100%); border: 1px solid #059669; border-radius: 12px; padding: 16px; text-align: center; margin: 20px 0; }
    .refund-amount { font-size: 28px; font-weight: 900; color: #34d399; margin: 4px 0 0 0; font-family: monospace; }
    .footer { text-align: center; padding: 24px; font-size: 12px; color: #64748b; border-top: 1px solid #1e293b; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="badge">&#10005; Booking Cancelled</div>
      <h1 class="title">Reservation Cancelled</h1>
      <p class="subtitle">StaySpot Hospitality &#183; Ref: <strong>${bookingNumber}</strong></p>
    </div>
    <div class="content">
      <p style="margin-top: 0; font-size: 14px; color: #cbd5e1;">Dear <strong>${guestName}</strong>,</p>
      <p style="font-size: 14px; color: #94a3b8; line-height: 1.5;">Your reservation for <strong>${propertyName}</strong> (${roomName}) scheduled for ${checkIn} to ${checkOut} has been successfully cancelled.</p>
      
      <div class="refund-box">
        <div style="font-size: 12px; color: #a7f3d0; text-transform: uppercase; font-weight: 700;">Refund Initiated (${refundPercentage}%)</div>
        <div class="refund-amount">${formattedRefund}</div>
        <div style="font-size: 11px; color: #cbd5e1; margin-top: 4px;">Refunds are processed back to your original payment method within 5-7 business days.</div>
      </div>

      <div class="card">
        <div style="font-size: 12px; font-weight: 700; color: #818cf8; text-transform: uppercase; margin-bottom: 10px;">Cancellation Policy Applied</div>
        <p style="margin: 0; font-size: 13px; color: #cbd5e1;">${cancellationPolicyApplied}</p>
      </div>
    </div>
    <div class="footer">
      &copy; 2026 StaySpot Hospitality. Need help? Contact support@stayspot.com
    </div>
  </div>
</body>
</html>
  `;

  try {
    const result = await resend.emails.send({
      from: SENDER_EMAIL,
      to: guestEmail,
      subject: `Booking Cancelled & Refund Notice: ${propertyName} [${bookingNumber}]`,
      html: htmlContent,
    });
    return { success: true, result };
  } catch (error) {
    console.error("Failed to send cancellation email:", error);
    return { success: false, error };
  }
}

/**
 * 4. Sends booking cancellation alert to property owner
 */
export async function sendBookingCancellationOwnerEmail(data: OwnerCancellationEmailData) {
  if (!resend) {
    console.warn("Resend API key missing; skipping owner cancellation email.");
    return { success: false, error: "Resend not configured" };
  }

  const { hostName, hostEmail, guestName, bookingNumber, propertyName, roomName, checkIn, checkOut } = data;

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #090d16; color: #f1f5f9; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background-color: #0f172a; border: 1px solid #1e293b; border-radius: 20px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #450a0a 0%, #0f172a 100%); padding: 28px 24px; text-align: center; border-bottom: 1px solid #334155; }
    .badge { display: inline-block; background-color: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 9999px; padding: 4px 12px; font-size: 12px; font-weight: 700; text-transform: uppercase; margin-bottom: 12px; }
    .title { color: #ffffff; font-size: 22px; font-weight: 800; margin: 0; }
    .content { padding: 28px 24px; }
    .card { background-color: #1e293b; border: 1px solid #334155; border-radius: 14px; padding: 18px; margin-bottom: 20px; }
    .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #334155; font-size: 13px; }
    .row:last-child { border-bottom: none; }
    .label { color: #94a3b8; }
    .val { color: #f8fafc; font-weight: 600; text-align: right; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="badge">&#9888; Booking Cancelled</div>
      <h1 class="title">Guest Cancelled Reservation</h1>
    </div>
    <div class="content">
      <p style="margin-top: 0; font-size: 14px; color: #cbd5e1;">Dear <strong>${hostName}</strong>,</p>
      <p style="font-size: 14px; color: #94a3b8;">Guest <strong>${guestName}</strong> has cancelled their reservation for <strong>${propertyName}</strong> (${roomName}).</p>
      
      <div class="card">
        <div style="font-size: 12px; font-weight: 700; color: #818cf8; text-transform: uppercase; margin-bottom: 10px;">Cancelled Stay Details</div>
        <div class="row"><span class="label">Booking Ref</span><span class="val">${bookingNumber}</span></div>
        <div class="row"><span class="label">Dates</span><span class="val">${checkIn} to ${checkOut}</span></div>
        <div class="row"><span class="label">Room Inventory</span><span class="val" style="color: #34d399;">Automatically Released</span></div>
      </div>

      <p style="font-size: 13px; color: #94a3b8;">The room inventory has been made available again for other travelers to book in real-time.</p>
    </div>
  </div>
</body>
</html>
  `;

  try {
    const result = await resend.emails.send({
      from: SENDER_EMAIL,
      to: hostEmail,
      subject: `Reservation Cancelled: ${propertyName} - ${guestName} [${bookingNumber}]`,
      html: htmlContent,
    });
    return { success: true, result };
  } catch (error) {
    console.error("Failed to send owner cancellation email:", error);
    return { success: false, error };
  }
}

/**
 * 5. Sends booking reminder email to guest for upcoming stays
 */
export async function sendBookingReminderGuestEmail(data: GuestReminderEmailData) {
  if (!resend) {
    console.warn("Resend API key missing; skipping reminder email.");
    return { success: false, error: "Resend not configured" };
  }

  const { guestName, guestEmail, bookingNumber, propertyName, propertyCity, roomName, checkIn, checkOut, hostName } = data;

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #090d16; color: #f1f5f9; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background-color: #0f172a; border: 1px solid #1e293b; border-radius: 20px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #0e7490 0%, #0f172a 100%); padding: 32px 24px; text-align: center; border-bottom: 1px solid #334155; }
    .badge { display: inline-block; background-color: rgba(6, 182, 212, 0.15); color: #67e8f9; border: 1px solid rgba(6, 182, 212, 0.3); border-radius: 9999px; padding: 4px 12px; font-size: 12px; font-weight: 700; text-transform: uppercase; margin-bottom: 12px; }
    .title { color: #ffffff; font-size: 24px; font-weight: 800; margin: 0 0 6px 0; }
    .content { padding: 28px 24px; }
    .card { background-color: #1e293b; border: 1px solid #334155; border-radius: 14px; padding: 18px; margin-bottom: 20px; }
    .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #334155; font-size: 13px; }
    .row:last-child { border-bottom: none; }
    .label { color: #94a3b8; }
    .val { color: #f8fafc; font-weight: 600; text-align: right; }
    .btn { display: inline-block; background: #0891b2; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 14px; padding: 14px 28px; border-radius: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="badge">&#127958; Get Ready for Your Getaway</div>
      <h1 class="title">Your Trip is Coming Up!</h1>
      <p style="color: #94a3b8; font-size: 14px; margin: 0;">${propertyName} &#183; Ref: <strong>${bookingNumber}</strong></p>
    </div>
    <div class="content">
      <p style="margin-top: 0; font-size: 14px; color: #cbd5e1;">Dear <strong>${guestName}</strong>,</p>
      <p style="font-size: 14px; color: #94a3b8; line-height: 1.5;">This is a friendly reminder that your upcoming stay in <strong>${propertyCity}</strong> is just around the corner!</p>
      
      <div class="card">
        <div style="font-size: 12px; font-weight: 700; color: #67e8f9; text-transform: uppercase; margin-bottom: 10px;">Check-in Information</div>
        <div class="row"><span class="label">Check-in Date</span><span class="val">${checkIn} (from 2:00 PM)</span></div>
        <div class="row"><span class="label">Checkout Date</span><span class="val">${checkOut} (until 11:00 AM)</span></div>
        <div class="row"><span class="label">Reserved Room</span><span class="val">${roomName}</span></div>
        <div class="row"><span class="label">Host</span><span class="val">${hostName || "Host"}</span></div>
      </div>

      <div style="text-align: center; margin: 24px 0;">
        <a href="https://stayspot.luxury/booking/confirmation?bookingNumber=${bookingNumber}" class="btn">View Digital Voucher &amp; Directions &rarr;</a>
      </div>
    </div>
  </div>
</body>
</html>
  `;

  try {
    const result = await resend.emails.send({
      from: SENDER_EMAIL,
      to: guestEmail,
      subject: `Upcoming Stay Reminder: ${propertyName} [${bookingNumber}]`,
      html: htmlContent,
    });
    return { success: true, result };
  } catch (error) {
    console.error("Failed to send reminder email:", error);
    return { success: false, error };
  }
}
