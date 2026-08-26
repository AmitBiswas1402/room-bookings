import Razorpay from "razorpay";
import crypto from "crypto";

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

export const razorpayInstance =
  RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET
    ? new Razorpay({
        key_id: RAZORPAY_KEY_ID,
        key_secret: RAZORPAY_KEY_SECRET,
      })
    : null;

/**
 * Creates a Razorpay Order in INR paise
 */
export async function createRazorpayOrder({
  amount,
  receipt,
  notes = {},
}: {
  amount: number; // in INR
  receipt: string;
  notes?: Record<string, string>;
}) {
  if (!razorpayInstance) {
    // Fallback simulated order if secret is not set
    return {
      id: `order_mock_${Date.now()}`,
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt,
      status: "created",
    };
  }

  const options = {
    amount: Math.round(amount * 100), // amount in paise
    currency: "INR",
    receipt,
    notes,
  };

  return await razorpayInstance.orders.create(options);
}

/**
 * Verifies Razorpay Payment Signature
 */
export function verifyRazorpaySignature({
  orderId,
  paymentId,
  signature,
}: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  if (!RAZORPAY_KEY_SECRET) {
    return true; // Allow in mock / dev mode
  }

  const generatedSignature = crypto
    .createHmac("sha256", RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  return generatedSignature === signature;
}
