"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  X,
  ShieldAlert,
  CheckCircle2,
  RefreshCw,
  Loader2,
  Calendar,
  CreditCard,
} from "lucide-react";
import { formatINR } from "@/data/stays";

interface CancellationModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: {
    id: string;
    bookingNumber: string;
    propertyName: string;
    checkIn: string;
    checkOut: string;
    totalAmount: number;
  };
  onSuccess: (result: { refundAmount: number; policyApplied: string }) => void;
}

export default function CancellationModal({
  isOpen,
  onClose,
  booking,
  onSuccess,
}: CancellationModalProps) {
  const [reason, setReason] = useState<string>("Change of travel plans");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Calculate estimated refund based on check-in date
  const checkInDate = new Date(booking.checkIn);
  const now = new Date();
  const hoursUntilCheckIn = (checkInDate.getTime() - now.getTime()) / (1000 * 60 * 60);

  let refundPercent = 100;
  let policyTier = "Full Refund (Over 48 hours prior to check-in)";

  if (hoursUntilCheckIn < 24) {
    refundPercent = 50;
    policyTier = "Late Cancellation: 50% Refund (Under 24 hours to check-in)";
  } else if (hoursUntilCheckIn < 48) {
    refundPercent = 75;
    policyTier = "Standard Policy: 75% Refund (24 to 48 hours to check-in)";
  }

  const estimatedRefund = Math.round((booking.totalAmount * refundPercent) / 100);

  const handleConfirmCancel = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      const res = await fetch(`/api/bookings/${encodeURIComponent(booking.bookingNumber || booking.id)}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to cancel booking");
      }

      onSuccess({
        refundAmount: data.refundAmount ?? estimatedRefund,
        policyApplied: data.policyApplied || policyTier,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel reservation");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="p-6 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Cancel Reservation</h3>
              <p className="text-xs text-slate-400">Ref: {booking.bookingNumber}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Booking Summary Strip */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2 text-xs">
            <div className="font-bold text-white text-sm">{booking.propertyName}</div>
            <div className="flex items-center gap-4 text-slate-400">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-indigo-400" />
                <span>{booking.checkIn} &rarr; {booking.checkOut}</span>
              </span>
            </div>
          </div>

          {/* Refund Calculation Box */}
          <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Total Paid:</span>
              <span className="font-mono text-slate-300">{formatINR(booking.totalAmount)}</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-emerald-400 font-semibold">Refund Rate ({refundPercent}%):</span>
              <span className="font-mono text-emerald-400 font-bold">{policyTier}</span>
            </div>

            <div className="pt-2 border-t border-emerald-500/20 flex items-center justify-between text-sm">
              <span className="font-bold text-white">Refund to Original Payment:</span>
              <span className="font-mono font-black text-emerald-400 text-base">
                {formatINR(estimatedRefund)}
              </span>
            </div>
          </div>

          {/* Cancellation Reason */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Reason for Cancellation</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="Change of travel plans">Change of travel plans</option>
              <option value="Booked another stay">Booked another accommodation</option>
              <option value="Emergency circumstances">Emergency circumstances</option>
              <option value="Work conflict">Work conflict</option>
              <option value="Other">Other reasons</option>
            </select>
          </div>

          {/* Policy Notice */}
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
            Upon confirmation, your reservation will be marked as <strong className="text-white">CANCELLED</strong>, the refund will be initiated to your original payment method, and the room dates will be immediately freed up. A cancellation confirmation email will be sent via Resend.
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-950/60 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
          >
            Keep Reservation
          </button>

          <button
            type="button"
            onClick={handleConfirmCancel}
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-lg shadow-rose-600/30 flex items-center gap-2 transition-all hover:scale-105 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Processing Refund...</span>
              </>
            ) : (
              <span>Confirm Cancellation &amp; Refund</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
