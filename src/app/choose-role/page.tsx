"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser, useClerk } from "@clerk/nextjs";
import {
  Compass,
  Building2,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Loader2,
  CalendarCheck,
  BedDouble,
  BadgeDollarSign,
  TrendingUp,
} from "lucide-react";

type RoleOption = "GUEST" | "OWNER";

export default function ChooseRolePage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  const [selectedRole, setSelectedRole] = useState<RoleOption | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingUser, setIsCheckingUser] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function checkCurrentRole() {
      if (!isLoaded) return;
      if (!isSignedIn) {
        router.replace("/");
        return;
      }

      try {
        const res = await fetch("/api/users");
        if (res.ok) {
          const data = await res.json();
          const currentRole = data.user?.role;
          if (currentRole) {
            // Already has role assigned (ADMIN, GUEST, OWNER)
            router.replace("/");
            return;
          }
        }
      } catch (err) {
        console.error("Failed to check user role status:", err);
      } finally {
        setIsCheckingUser(false);
      }
    }

    checkCurrentRole();
  }, [isLoaded, isSignedIn, router]);

  const handleRoleSelect = async (role: RoleOption) => {
    setSelectedRole(role);
    setErrorMessage(null);
  };

  const handleConfirmRole = async () => {
    if (!selectedRole) return;
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: selectedRole }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update role. Please try again.");
      }

      // Redirect to home/dashboard upon successful selection
      router.replace("/");
      router.refresh();
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred.");
      setIsSubmitting(false);
    }
  };

  if (!isLoaded || isCheckingUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex flex-col items-center justify-center text-white px-4">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <div className="h-12 w-12 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
          <p className="text-slate-400 text-sm font-medium tracking-wide">
            Preparing your experience...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-100 flex flex-col justify-between px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <header className="max-w-5xl mx-auto w-full flex items-center justify-between py-2">
        <div className="flex items-center gap-2.5">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-white">
              StaySpot
            </span>
            <span className="text-xs ml-1.5 px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-medium border border-indigo-500/30">
              Welcome
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 hidden sm:inline-block">
            Signed in as <strong className="text-slate-200">{user?.primaryEmailAddress?.emailAddress}</strong>
          </span>
          <button
            onClick={() => signOut({ redirectUrl: "/" })}
            className="text-xs text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700/60 hover:border-slate-600 transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto w-full my-auto py-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <ShieldCheck className="h-3.5 w-3.5" />
            Account Setup
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            How would you like to use StaySpot?
          </h1>
          <p className="mt-3 text-base sm:text-lg text-slate-400 leading-relaxed">
            Select your primary account role below. You can book rooms as a guest or list and manage properties as an owner.
          </p>
        </div>

        {errorMessage && (
          <div className="max-w-xl mx-auto mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm text-center">
            {errorMessage}
          </div>
        )}

        {/* Role Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* GUEST ROLE CARD */}
          <div
            onClick={() => handleRoleSelect("GUEST")}
            className={`group relative cursor-pointer rounded-2xl p-6 transition-all duration-300 border backdrop-blur-xl ${
              selectedRole === "GUEST"
                ? "bg-indigo-950/60 border-indigo-500 ring-2 ring-indigo-500/50 shadow-2xl shadow-indigo-500/20 scale-[1.02]"
                : "bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50 hover:scale-[1.01]"
            }`}
          >
            {selectedRole === "GUEST" && (
              <div className="absolute top-4 right-4">
                <CheckCircle2 className="h-6 w-6 text-indigo-400 fill-indigo-400/20" />
              </div>
            )}

            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-indigo-500/20 to-blue-500/20 border border-indigo-500/30 flex items-center justify-center mb-5 text-indigo-400 group-hover:scale-110 transition-transform">
              <Compass className="h-7 w-7" />
            </div>

            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              I am a Guest
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              I want to discover dream destinations, browse premium rooms, and make secure room reservations effortlessly.
            </p>

            <div className="space-y-2.5 pt-4 border-t border-slate-800">
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <BedDouble className="h-4 w-4 text-indigo-400" />
                <span>Explore hotels, villas & apartments</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <CalendarCheck className="h-4 w-4 text-indigo-400" />
                <span>Instant reservation & booking tracking</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <ShieldCheck className="h-4 w-4 text-indigo-400" />
                <span>Verified reviews & secure checkout</span>
              </div>
            </div>
          </div>

          {/* OWNER / HOST ROLE CARD */}
          <div
            onClick={() => handleRoleSelect("OWNER")}
            className={`group relative cursor-pointer rounded-2xl p-6 transition-all duration-300 border backdrop-blur-xl ${
              selectedRole === "OWNER"
                ? "bg-violet-950/60 border-violet-500 ring-2 ring-violet-500/50 shadow-2xl shadow-violet-500/20 scale-[1.02]"
                : "bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50 hover:scale-[1.01]"
            }`}
          >
            {selectedRole === "OWNER" && (
              <div className="absolute top-4 right-4">
                <CheckCircle2 className="h-6 w-6 text-violet-400 fill-violet-400/20" />
              </div>
            )}

            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/30 flex items-center justify-center mb-5 text-violet-400 group-hover:scale-110 transition-transform">
              <Building2 className="h-7 w-7" />
            </div>

            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              I am a Property Owner
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              I want to list properties, manage room availabilities, review bookings, and maximize rental revenue.
            </p>

            <div className="space-y-2.5 pt-4 border-t border-slate-800">
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <Building2 className="h-4 w-4 text-violet-400" />
                <span>List multiple properties & room types</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <TrendingUp className="h-4 w-4 text-violet-400" />
                <span>Real-time availability & occupancy calendar</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <BadgeDollarSign className="h-4 w-4 text-violet-400" />
                <span>Direct payout & revenue analytics</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-8 flex flex-col items-center justify-center gap-3">
          <button
            onClick={handleConfirmRole}
            disabled={!selectedRole || isSubmitting}
            className={`w-full max-w-sm flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-semibold text-sm transition-all duration-200 shadow-lg ${
              selectedRole && !isSubmitting
                ? "bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.01]"
                : "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50"
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving Your Role...</span>
              </>
            ) : (
              <>
                <span>Continue as {selectedRole ? (selectedRole === "GUEST" ? "Guest" : "Property Owner") : "..."}</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
          <p className="text-xs text-slate-400 font-medium">
            Please choose carefully. Your role selection is permanent and tailored for your account.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto w-full text-center py-4 text-xs text-slate-600 border-t border-slate-900">
        &copy; {new Date().getFullYear()} StaySpot Room Bookings. All rights reserved.
      </footer>
    </div>
  );
}
