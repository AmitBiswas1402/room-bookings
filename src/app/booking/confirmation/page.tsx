import React, { Suspense } from "react";
import { Metadata } from "next";
import BookingConfirmationClient from "./BookingConfirmationClient";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Payment Confirmation & Booking Receipt | StaySpot",
  description: "Official digital booking voucher and GST tax receipt for your StaySpot luxury reservation.",
};

export default function BookingConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
          <div className="flex flex-col items-center gap-3 text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            <p className="text-sm font-semibold">Generating official booking receipt...</p>
          </div>
        </div>
      }
    >
      <BookingConfirmationClient />
    </Suspense>
  );
}
