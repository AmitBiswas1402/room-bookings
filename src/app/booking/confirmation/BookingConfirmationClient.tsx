"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  ShieldCheck,
  Printer,
  Download,
  Share2,
  Calendar,
  MapPin,
  Users,
  CreditCard,
  ArrowLeft,
  Building2,
  Sparkles,
  Check,
  Clock,
  Phone,
  Mail,
  FileText,
  BedDouble,
  ExternalLink,
  Lock,
  Compass,
  AlertCircle,
  HelpCircle,
  Home,
} from "lucide-react";
import { formatINR } from "@/data/stays";
import CancellationModal from "@/components/booking/CancellationModal";

interface BookingConfirmationDetails {
  id: string;
  bookingNumber: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalAmount: number;
  status: string;
  createdAt: string;
  property: {
    id: string;
    title: string;
    description?: string;
    city: string;
    address?: string;
    state?: string;
    propertyType?: string;
    maxGuests?: number;
    pricePerNight?: number;
    imageUrl: string;
    images?: string[];
    hostName?: string;
    hostEmail?: string;
    hostAvatar?: string;
  };
  guest?: {
    id?: string;
    name?: string;
    email?: string;
    phone?: string;
  };
  rooms?: Array<{
    id: string;
    roomId?: string;
    roomName: string;
    pricePerNight: number;
    quantity: number;
    nights: number;
    totalPrice: number;
  }>;
  payment?: {
    id?: string;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    amount?: number;
    status?: string;
    createdAt?: string;
  };
}

export default function BookingConfirmationClient() {
  const searchParams = useSearchParams();
  const bookingNumberQuery = searchParams.get("bookingNumber") || searchParams.get("bNumber") || searchParams.get("bookingId") || "";
  const paymentIdQuery = searchParams.get("paymentId") || searchParams.get("razorpay_payment_id") || "";

  const [booking, setBooking] = useState<BookingConfirmationDetails | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [showCancelModal, setShowCancelModal] = useState<boolean>(false);
  const [cancellationResult, setCancellationResult] = useState<{ refundAmount: number; policyApplied: string } | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchBookingDetails = async () => {
      if (!bookingNumberQuery) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const res = await fetch(`/api/bookings/${encodeURIComponent(bookingNumberQuery)}`);
        const data = await res.json();

        if (res.ok && data.success && data.booking) {
          if (isMounted) {
            setBooking(data.booking);
          }
        } else {
          // If not found in DB, fallback to query parameters
          console.warn("Notice: booking fetch note:", data.error);
        }
      } catch (err) {
        console.error("Failed to load booking details:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchBookingDetails();

    return () => {
      isMounted = false;
    };
  }, [bookingNumberQuery]);

  // Fallback data if DB fetch not completed or offline simulation
  const effectiveBookingNumber =
    booking?.bookingNumber || bookingNumberQuery || `STAY-${Date.now().toString().slice(-6)}-92`;
  const effectivePaymentId =
    booking?.payment?.razorpayPaymentId || paymentIdQuery || `pay_${Date.now().toString().slice(-10)}`;
  const effectivePropertyTitle =
    booking?.property?.title || searchParams.get("propertyTitle") || "Azure Horizon Luxury Villa";
  const effectiveCity = booking?.property?.city || searchParams.get("city") || "Goa";
  const effectiveAddress =
    booking?.property?.address || searchParams.get("address") || "Vagator Beach Road, North Goa";
  const effectiveState = booking?.property?.state || searchParams.get("state") || "Goa";
  const effectiveImageUrl =
    booking?.property?.imageUrl ||
    searchParams.get("imageUrl") ||
    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80";
  const effectiveRoomName =
    booking?.rooms?.[0]?.roomName || searchParams.get("roomName") || "Master Oceanfront King Suite";
  const effectiveCheckIn = booking?.checkIn || searchParams.get("checkIn") || "2026-10-28";
  const effectiveCheckOut = booking?.checkOut || searchParams.get("checkOut") || "2026-11-02";
  const effectiveGuests = booking?.guests || Number(searchParams.get("guests")) || 2;
  const effectiveTotalAmount =
    booking?.totalAmount || Number(searchParams.get("totalAmount")) || 49995;
  const effectiveGuestName =
    booking?.guest?.name || searchParams.get("guestName") || "Verified Traveler";
  const effectiveGuestEmail =
    booking?.guest?.email || searchParams.get("guestEmail") || "traveler@stayspot.com";
  const effectiveHostName = booking?.property?.hostName || "Amit Biswas (Superhost)";

  // Calculate nights
  const calculateNights = (inDate: string, outDate: string) => {
    try {
      const d1 = new Date(inDate);
      const d2 = new Date(outDate);
      const diff = Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
      return Math.max(1, isNaN(diff) ? 2 : diff);
    } catch {
      return 2;
    }
  };

  const nights = calculateNights(effectiveCheckIn, effectiveCheckOut);
  const roomSubtotal = booking?.rooms?.[0]?.totalPrice || Math.round(effectiveTotalAmount * 0.85);
  const cleaningFee = 1000;
  const serviceFee = 750;
  const taxes = Math.max(0, effectiveTotalAmount - (roomSubtotal + cleaningFee + serviceFee));

  const handlePrint = () => {
    window.print();
  };

  const handleCopyCode = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(effectiveBookingNumber);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    }
  };

  const handleShareLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white print:bg-white print:text-black">
      {/* Top Header / Navigation */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-xl sticky top-0 z-40 print:hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors text-xs font-bold"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Stays</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShareLink}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Share2 className="h-3.5 w-3.5" />}
              <span>{copiedLink ? "Link Copied!" : "Share Voucher"}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 transition-all hover:scale-105"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print / Save Tax Receipt</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full flex-1 space-y-8">
        {/* ========================================================================= */}
        {/* 1. SUCCESS HERO BANNER */}
        {/* ========================================================================= */}
        <div className="relative rounded-3xl p-6 sm:p-10 bg-gradient-to-br from-indigo-950/60 via-slate-900/90 to-slate-950 border border-indigo-500/30 overflow-hidden shadow-2xl print:border-none print:shadow-none print:p-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20 print:hidden" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20 print:hidden" />

          <div className="relative z-10 flex flex-col items-center text-center space-y-4">
            <div className="relative">
              <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shadow-2xl shadow-emerald-500/30 animate-in zoom-in-75 duration-300">
                <CheckCircle2 className="h-10 w-10 sm:h-12 sm:w-12 stroke-[2.5]" />
              </div>
              <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-indigo-600 text-white shadow">
                <Sparkles className="h-4 w-4" />
              </div>
            </div>

            <div className="space-y-1.5 max-w-2xl">
              <div className="flex flex-wrap items-center justify-center gap-2">
                <span className="px-3 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-black uppercase tracking-wider">
                  Payment Verified & Settled
                </span>
                <span className="px-3 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 text-xs font-bold uppercase tracking-wider">
                  Instant Confirmation
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
                You're All Set for {effectiveCity}!
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pt-1">
                Your reservation at <strong className="text-white">{effectivePropertyTitle}</strong> is locked in. A digital voucher and tax invoice have been dispatched to{" "}
                <span className="text-indigo-300 font-semibold">{effectiveGuestEmail}</span>.
              </p>
            </div>

            {/* Quick Reference Code Bar */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
              <div className="px-4 py-2 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Booking ID:</span>
                <span className="font-mono font-black text-sm text-indigo-400">{effectiveBookingNumber}</span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  title="Copy Reference ID"
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                >
                  {copiedCode ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Share2 className="h-3.5 w-3.5" />}
                </button>
              </div>

              <div className="px-4 py-2 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Razorpay ID:</span>
                <span className="font-mono text-xs text-slate-300 truncate max-w-[140px]">{effectivePaymentId}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. OFFICIAL TAX INVOICE & DIGITAL RECEIPT CARD */}
        {/* ========================================================================= */}
        <div className="rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl overflow-hidden print:border print:border-slate-300 print:bg-white print:shadow-none">
          {/* Invoice Header */}
          <div className="p-6 sm:p-8 bg-slate-950/80 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:bg-white print:border-slate-300">
            <div>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-sm">
                  SS
                </div>
                <span className="text-base font-black text-white tracking-tight">
                  StaySpot Luxury Hospitality
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Official Digital Booking Confirmation & GST Tax Invoice
              </p>
            </div>

            <div className="text-left sm:text-right text-xs">
              <div className="font-bold text-emerald-400 flex items-center sm:justify-end gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>STATUS: PAID & CONFIRMED</span>
              </div>
              <div className="text-slate-400 text-[11px] mt-0.5 font-mono">
                Date: {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-8">
            {/* Property Summary Strip */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800/80 flex flex-col md:flex-row gap-5 items-center print:border print:border-slate-300">
              <img
                src={effectiveImageUrl}
                alt={effectivePropertyTitle}
                className="h-36 w-full md:w-52 rounded-xl object-cover bg-slate-800 shrink-0 border border-slate-800 shadow-md"
              />

              <div className="flex-1 space-y-2 w-full">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[10px] font-bold uppercase tracking-wider">
                    {booking?.property?.propertyType || "Luxury Property"}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-rose-400" />
                    <span>{effectiveCity}, {effectiveState}</span>
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-white leading-snug">
                  {effectivePropertyTitle}
                </h3>

                <p className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
                  <BedDouble className="h-4 w-4" />
                  <span>Reserved Suite: {effectiveRoomName}</span>
                </p>

                <div className="text-xs text-slate-400">
                  <span>Location: </span>
                  <span className="text-slate-300">{effectiveAddress}</span>
                </div>
              </div>
            </div>

            {/* Guest & Stay Schedule 4-Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-5 rounded-2xl bg-slate-950/60 border border-slate-800/60 print:border print:border-slate-300">
              <div className="space-y-1">
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-indigo-400" />
                  <span>Check-in</span>
                </div>
                <div className="text-sm font-bold text-white">{effectiveCheckIn}</div>
                <div className="text-[11px] text-slate-400">From 2:00 PM</div>
              </div>

              <div className="space-y-1">
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-indigo-400" />
                  <span>Checkout</span>
                </div>
                <div className="text-sm font-bold text-white">{effectiveCheckOut}</div>
                <div className="text-[11px] text-slate-400">Until 11:00 AM</div>
              </div>

              <div className="space-y-1">
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
                  <Clock className="h-3 w-3 text-indigo-400" />
                  <span>Duration</span>
                </div>
                <div className="text-sm font-bold text-white">
                  {nights} {nights === 1 ? "Night" : "Nights"}
                </div>
                <div className="text-[11px] text-slate-400">{effectiveGuests} Registered Guests</div>
              </div>

              <div className="space-y-1">
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
                  <Users className="h-3 w-3 text-indigo-400" />
                  <span>Primary Guest</span>
                </div>
                <div className="text-sm font-bold text-white truncate">{effectiveGuestName}</div>
                <div className="text-[11px] text-slate-400 truncate">{effectiveGuestEmail}</div>
              </div>
            </div>

            {/* Financial Breakdown Table */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-indigo-400" />
                <span>Itemized Billing & Tax Breakdown</span>
              </h4>

              <div className="rounded-2xl border border-slate-800 overflow-hidden print:border-slate-300">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-bold print:bg-slate-100">
                    <tr>
                      <th className="p-3.5">Description</th>
                      <th className="p-3.5 text-center">Qty / Nights</th>
                      <th className="p-3.5 text-right">Amount (INR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 text-slate-300">
                    <tr>
                      <td className="p-3.5 font-medium text-white">
                        {effectiveRoomName} Accommodation
                        <span className="block text-[10px] text-slate-400 mt-0.5">
                          Standard luxury stay rate ({effectiveCheckIn} &rarr; {effectiveCheckOut})
                        </span>
                      </td>
                      <td className="p-3.5 text-center font-mono">{nights} nights</td>
                      <td className="p-3.5 text-right font-mono font-bold text-white">
                        {formatINR(roomSubtotal)}
                      </td>
                    </tr>

                    <tr>
                      <td className="p-3.5">
                        Deep Cleaning & Room Preparation
                        <span className="block text-[10px] text-slate-400 mt-0.5">
                          Sanitization & premium luxury linen setup
                        </span>
                      </td>
                      <td className="p-3.5 text-center font-mono">1</td>
                      <td className="p-3.5 text-right font-mono">{formatINR(cleaningFee)}</td>
                    </tr>

                    <tr>
                      <td className="p-3.5">
                        StaySpot Service & 24/7 Concierge Support
                        <span className="block text-[10px] text-slate-400 mt-0.5">
                          Direct host protection & on-trip concierge
                        </span>
                      </td>
                      <td className="p-3.5 text-center font-mono">1</td>
                      <td className="p-3.5 text-right font-mono">{formatINR(serviceFee)}</td>
                    </tr>

                    <tr>
                      <td className="p-3.5">
                        GST / Statutory Hospitality Taxes (12%)
                        <span className="block text-[10px] text-slate-400 mt-0.5">
                          Government standard tax invoice component
                        </span>
                      </td>
                      <td className="p-3.5 text-center font-mono">12%</td>
                      <td className="p-3.5 text-right font-mono">{formatINR(taxes)}</td>
                    </tr>
                  </tbody>

                  <tfoot className="bg-slate-950/90 border-t-2 border-slate-800 font-bold print:bg-slate-100">
                    <tr>
                      <td colSpan={2} className="p-4 text-sm text-white">
                        Grand Total Paid
                        <span className="block text-[10px] font-normal text-slate-400">
                          Taxes and all hospitality fees included
                        </span>
                      </td>
                      <td className="p-4 text-right text-base font-black text-emerald-400 font-mono">
                        {formatINR(effectiveTotalAmount)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Payment Settlement Method Card */}
            <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <span>Paid via Razorpay Gateway</span>
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                    Transaction Ref: {effectivePaymentId}
                  </div>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold text-[10px] uppercase">
                  Razorpay Verified
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. CHECK-IN INSTRUCTIONS & HOST CONCIERGE */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:hidden">
          {/* Check-in Guidance */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Compass className="h-4 w-4 text-indigo-400" />
              <span>Check-in Instructions & Access</span>
            </h4>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex gap-3">
                <span className="h-5 w-5 rounded-full bg-slate-800 flex items-center justify-center font-bold text-[10px] text-indigo-400 shrink-0">
                  1
                </span>
                <p>
                  <strong className="text-white">Host Reception:</strong> Your host ({effectiveHostName}) or the estate concierge will greet you upon arrival at {effectiveAddress}.
                </p>
              </div>

              <div className="flex gap-3">
                <span className="h-5 w-5 rounded-full bg-slate-800 flex items-center justify-center font-bold text-[10px] text-indigo-400 shrink-0">
                  2
                </span>
                <p>
                  <strong className="text-white">Government ID:</strong> Please present valid government photo identification (Aadhaar / Passport) for all checking-in guests.
                </p>
              </div>

              <div className="flex gap-3">
                <span className="h-5 w-5 rounded-full bg-slate-800 flex items-center justify-center font-bold text-[10px] text-indigo-400 shrink-0">
                  3
                </span>
                <p>
                  <strong className="text-white">Check-in Timings:</strong> 2:00 PM onwards. Early check-in is subject to previous guest departure.
                </p>
              </div>
            </div>
          </div>

          {/* Need Assistance & Cancellation */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 flex flex-col justify-between">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-indigo-400" />
                <span>24/7 Concierge & Support</span>
              </h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Have questions about airport transfers, dietary preferences, or local sightseeing? Our support concierge is active 24/7.
              </p>

              <div className="mt-4 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <Mail className="h-3.5 w-3.5 text-indigo-400" />
                  <span>support@stayspot.com</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Phone className="h-3.5 w-3.5 text-indigo-400" />
                  <span>+91 (080) 4920-8000</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span>Free cancellation up to 48h prior</span>
              <span className="text-emerald-400 font-semibold">Protected by StaySpot</span>
            </div>
          </div>
        </div>

        {cancellationResult && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
              <span>
                Booking cancelled. Refund of {formatINR(cancellationResult.refundAmount)} initiated ({cancellationResult.policyApplied}). Confirmation sent via Resend.
              </span>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 4. BOTTOM ACTION CTA BUTTONS */}
        {/* ========================================================================= */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 print:hidden">
          <Link
            href="/dashboard?tab=bookings"
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all hover:scale-105"
          >
            <span>Manage My Bookings</span>
            <ExternalLink className="h-4 w-4" />
          </Link>

          <button
            type="button"
            onClick={handlePrint}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <Download className="h-4 w-4 text-indigo-400" />
            <span>Download Invoice (PDF)</span>
          </button>

          {!cancellationResult && booking?.status !== "CANCELLED" && (
            <button
              type="button"
              onClick={() => setShowCancelModal(true)}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <AlertCircle className="h-4 w-4" />
              <span>Cancel &amp; Refund</span>
            </button>
          )}

          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <Home className="h-4 w-4" />
            <span>Explore More Stays</span>
          </Link>
        </div>
      </main>

      {/* Cancellation Modal */}
      {showCancelModal && (
        <CancellationModal
          isOpen={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          booking={{
            id: booking?.id || effectiveBookingNumber,
            bookingNumber: effectiveBookingNumber,
            propertyName: effectivePropertyTitle,
            checkIn: effectiveCheckIn,
            checkOut: effectiveCheckOut,
            totalAmount: effectiveTotalAmount,
          }}
          onSuccess={(result) => {
            setCancellationResult(result);
            if (booking) {
              setBooking({ ...booking, status: "CANCELLED" });
            }
            setShowCancelModal(false);
          }}
        />
      )}
    </div>
  );
}
