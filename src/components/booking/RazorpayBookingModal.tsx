"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  X,
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  Calendar,
  Users,
  MapPin,
  Sparkles,
  Building2,
  Lock,
  ChevronRight,
  Loader2,
  AlertCircle,
  ExternalLink,
  Download,
  Share2,
  Check,
} from "lucide-react";
import { Stay, HotelRoom, formatINR } from "@/data/stays";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RazorpayBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  stay: Stay;
  selectedRoom: HotelRoom;
  checkIn: string;
  checkOut: string;
  guestsCount: number;
  nightsCount: number;
  totalBeforeTaxes: number;
  grandTotal: number;
  userEmail?: string;
  userName?: string;
}

export default function RazorpayBookingModal({
  isOpen,
  onClose,
  stay,
  selectedRoom,
  checkIn,
  checkOut,
  guestsCount,
  nightsCount,
  totalBeforeTaxes,
  grandTotal,
  userEmail = "",
  userName = "",
}: RazorpayBookingModalProps) {
  const [guestName, setGuestName] = useState(userName || "Priya Sharma");
  const [guestEmail, setGuestEmail] = useState(userEmail || "priya.sharma@example.com");
  const [guestPhone, setGuestPhone] = useState("+91 98765 43210");
  const [specialRequests, setSpecialRequests] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [bookingSuccessData, setBookingSuccessData] = useState<{
    bookingNumber: string;
    paymentId: string;
    bookingId: string;
  } | null>(null);

  const [copiedCode, setCopiedCode] = useState(false);

  // Sync user info if provided later
  useEffect(() => {
    if (userName && !guestName) setGuestName(userName);
    if (userEmail && !guestEmail) setGuestEmail(userEmail);
  }, [userName, userEmail]);

  // Load Razorpay Checkout script dynamically
  useEffect(() => {
    if (!window.Razorpay) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  if (!isOpen) return null;

  const roomPriceTotal = selectedRoom.pricePerNight * nightsCount;
  const taxes = Math.round(totalBeforeTaxes * 0.12);
  const finalPayable = grandTotal || totalBeforeTaxes + taxes;

  const handleInitiateRazorpayPayment = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      // 1. Create Razorpay Order from server
      const orderRes = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: stay.id,
          roomId: selectedRoom.id,
          propertyName: stay.title,
          roomName: selectedRoom.name,
          checkIn,
          checkOut,
          guests: guestsCount,
          amount: finalPayable,
          guestName,
          guestEmail,
          guestPhone,
        }),
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok || !orderData.success) {
        throw new Error(orderData.error || "Failed to create Razorpay order");
      }

      // 2. Configure Razorpay Checkout Options
      const options = {
        key: orderData.keyId || "rzp_test_T6CY5sQOs43USL",
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "StaySpot Luxury Hospitality",
        description: `Booking: ${selectedRoom.name} at ${stay.title}`,
        image: stay.imageUrl || "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=300&q=80",
        order_id: orderData.orderId,
        prefill: {
          name: guestName,
          email: guestEmail,
          contact: guestPhone,
        },
        theme: {
          color: "#4f46e5", // Indigo 600
        },
        modal: {
          ondismiss: () => {
            setIsLoading(false);
          },
        },
        handler: async (response: any) => {
          // 3. Verify Payment & Save to Neon DB
          try {
            setIsLoading(true);
            const verifyRes = await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id || orderData.orderId,
                razorpay_payment_id: response.razorpay_payment_id || `pay_${Date.now()}`,
                razorpay_signature: response.razorpay_signature || "simulated_sig",
                bookingNumber: orderData.bookingNumber,
                propertyId: stay.id,
                roomId: selectedRoom.id,
                roomName: selectedRoom.name,
                pricePerNight: selectedRoom.pricePerNight,
                nights: nightsCount,
                checkIn,
                checkOut,
                guests: guestsCount,
                totalAmount: finalPayable,
                guestName,
                guestEmail,
                guestPhone,
              }),
            });

            const verifyData = await verifyRes.json();

            if (!verifyRes.ok || !verifyData.success) {
              throw new Error(verifyData.error || "Payment verification failed");
            }

            setBookingSuccessData({
              bookingNumber: verifyData.bookingNumber || orderData.bookingNumber,
              paymentId: response.razorpay_payment_id || `pay_${Date.now()}`,
              bookingId: verifyData.bookingId,
            });
          } catch (verErr: any) {
            console.error("Verification error:", verErr);
            setErrorMessage(verErr.message || "Payment verification error");
          } finally {
            setIsLoading(false);
          }
        },
      };

      // 4. Open Razorpay Modal or execute fallback if window.Razorpay is blocked/simulated
      if (typeof window !== "undefined" && window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", function (resp: any) {
          setErrorMessage(resp.error?.description || "Payment was not completed");
          setIsLoading(false);
        });
        rzp.open();
      } else {
        // Fallback simulated payment handler if script blocked
        setTimeout(async () => {
          await options.handler({
            razorpay_order_id: orderData.orderId,
            razorpay_payment_id: `pay_test_${Date.now()}`,
            razorpay_signature: "mock_signature",
          });
        }, 1200);
      }
    } catch (err: any) {
      console.error("Payment initiation failed:", err);
      setErrorMessage(err.message || "Failed to initiate payment");
      setIsLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (bookingSuccessData) {
      navigator.clipboard.writeText(bookingSuccessData.bookingNumber);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl shadow-indigo-950/40 text-slate-100 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="sticky top-0 z-20 px-6 py-4 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-black text-sm">
              ₹
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                {bookingSuccessData ? "Reservation Confirmed" : "Confirm & Pay via Razorpay"}
              </h3>
              <p className="text-[11px] text-slate-400">
                {bookingSuccessData ? "Instant confirmation voucher" : "Secured 256-Bit SSL Payment Gateway"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ========================================================================= */}
        {/* SUCCESS CONFIRMATION VIEW */}
        {/* ========================================================================= */}
        {bookingSuccessData ? (
          <div className="p-6 sm:p-8 space-y-6 text-center animate-in zoom-in-95 duration-200">
            <div className="h-20 w-20 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/20">
              <CheckCircle2 className="h-10 w-10 stroke-[2.5]" />
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-black uppercase tracking-wider">
                Payment Successful · Instant Confirmation
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                You're All Set for {stay.city}!
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
                We've sent your digital booking voucher and check-in instructions to{" "}
                <strong className="text-slate-200">{guestEmail}</strong>.
              </p>
            </div>

            {/* Booking Receipt Box */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-left space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Booking Reference
                  </div>
                  <div className="text-base font-black text-indigo-400 font-mono">
                    {bookingSuccessData.bookingNumber}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  {copiedCode ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Share2 className="h-3.5 w-3.5" />}
                  <span>{copiedCode ? "Copied" : "Copy Code"}</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400">Property:</span>
                  <p className="font-bold text-white truncate">{stay.title}</p>
                </div>
                <div>
                  <span className="text-slate-400">Selected Room:</span>
                  <p className="font-bold text-indigo-300 truncate">{selectedRoom.name}</p>
                </div>
                <div>
                  <span className="text-slate-400">Dates:</span>
                  <p className="font-semibold text-white">
                    {checkIn} &rarr; {checkOut} ({nightsCount} nights)
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Amount Paid:</span>
                  <p className="font-bold text-emerald-400">{formatINR(finalPayable)}</p>
                </div>
                <div>
                  <span className="text-slate-400">Razorpay Payment ID:</span>
                  <p className="font-mono text-[11px] text-slate-300 truncate">
                    {bookingSuccessData.paymentId}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Guest Name:</span>
                  <p className="font-semibold text-white">{guestName}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href={`/booking/confirmation?bookingNumber=${encodeURIComponent(
                  bookingSuccessData.bookingNumber
                )}&bookingId=${encodeURIComponent(
                  bookingSuccessData.bookingId || ""
                )}&paymentId=${encodeURIComponent(
                  bookingSuccessData.paymentId
                )}&propertyTitle=${encodeURIComponent(stay.title)}&city=${encodeURIComponent(
                  stay.city
                )}&address=${encodeURIComponent(stay.location)}&roomName=${encodeURIComponent(
                  selectedRoom.name
                )}&checkIn=${checkIn}&checkOut=${checkOut}&guests=${guestsCount}&totalAmount=${finalPayable}&guestName=${encodeURIComponent(
                  guestName
                )}&guestEmail=${encodeURIComponent(guestEmail)}&imageUrl=${encodeURIComponent(
                  selectedRoom.imageUrl || stay.imageUrl
                )}`}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white text-xs font-bold shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all hover:scale-105"
              >
                <span>View Tax Invoice & Receipt &rarr;</span>
              </Link>

              <Link
                href="/dashboard?tab=bookings"
                className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <span>My Bookings</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* CHECKOUT & PAYMENT FORM VIEW */
          /* ========================================================================= */
          <div className="p-6 sm:p-8 space-y-6">
            {/* 1. Property & Room Summary Header */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex gap-4 items-center">
              <img
                src={selectedRoom.imageUrl || stay.imageUrl}
                alt={selectedRoom.name}
                className="h-20 w-24 rounded-xl object-cover bg-slate-800 shrink-0 border border-slate-700/50"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-bold uppercase tracking-wider">
                    {selectedRoom.type || "Room Suite"}
                  </span>
                  <span className="text-xs text-slate-400 truncate">{stay.city}</span>
                </div>
                <h4 className="text-sm font-bold text-white mt-0.5 truncate">{stay.title}</h4>
                <p className="text-xs font-semibold text-indigo-300 truncate">{selectedRoom.name}</p>

                <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-indigo-400" />
                    {checkIn} – {checkOut} ({nightsCount} {nightsCount === 1 ? "night" : "nights"})
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3 text-indigo-400" />
                    {guestsCount} {guestsCount === 1 ? "Guest" : "Guests"}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Guest Information Inputs */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-indigo-400" />
                <span>Primary Guest Contact</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Email for Voucher *
                  </label>
                  <input
                    type="email"
                    required
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    placeholder="e.g. priya@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Phone Number (SMS & WhatsApp Confirmation) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* 3. Transparent Price Breakdown */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>
                  {formatINR(selectedRoom.pricePerNight)} × {nightsCount} {nightsCount === 1 ? "night" : "nights"}
                </span>
                <span className="font-semibold text-white">{formatINR(roomPriceTotal)}</span>
              </div>

              <div className="flex justify-between text-slate-300">
                <span>Cleaning & Hospitality fee</span>
                <span className="font-semibold text-white">{formatINR(stay.cleaningFee || 1200)}</span>
              </div>

              <div className="flex justify-between text-slate-300">
                <span>StaySpot Platform Service fee</span>
                <span className="font-semibold text-white">{formatINR(stay.serviceFee || 850)}</span>
              </div>

              <div className="flex justify-between text-slate-300">
                <span>GST & Hospitality Taxes (12%)</span>
                <span className="font-semibold text-white">{formatINR(taxes)}</span>
              </div>

              <div className="pt-2 border-t border-slate-800 flex justify-between text-sm font-black">
                <span className="text-white">Total Payable Amount</span>
                <span className="text-indigo-400 text-base">{formatINR(finalPayable)}</span>
              </div>
            </div>

            {/* Error banner */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* 4. Razorpay Security Badges & Pay Button */}
            <div className="space-y-3 pt-2">
              <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/20 flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center gap-2 text-indigo-300 font-semibold">
                  <ShieldCheck className="h-4 w-4 text-indigo-400" />
                  <span>Razorpay 256-Bit SSL Encrypted</span>
                </div>
                <div className="flex items-center gap-1.5 font-bold text-slate-300">
                  <span>UPI · Cards · NetBanking · EMI</span>
                </div>
              </div>

              <button
                type="button"
                disabled={isLoading || !guestName.trim() || !guestEmail.trim() || !guestPhone.trim()}
                onClick={handleInitiateRazorpayPayment}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-black text-sm shadow-xl shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-98 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Connecting to Razorpay Gateway...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4" />
                    <span>Pay {formatINR(finalPayable)} with Razorpay &rarr;</span>
                  </>
                )}
              </button>

              <p className="text-[11px] text-center text-slate-500">
                By confirming your reservation, you agree to StaySpot's Guest Terms and Host Cancellation Policy.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
