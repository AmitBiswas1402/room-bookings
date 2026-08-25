import React, { Suspense } from "react";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { syncUserInDb } from "@/lib/authorization";
import OwnerDashboardClient from "./OwnerDashboardClient";

export const metadata: Metadata = {
  title: "Owner & Admin Dashboard — StaySpot",
  description: "Manage holiday listings, villa & room bookings, Cloudinary photos, and seasonal rates.",
};

export default async function DashboardPage() {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    redirect("/sign-in");
  }

  const dbUser = await syncUserInDb();

  // If user has not chosen role yet, redirect to choose-role
  if (!dbUser || !dbUser.role) {
    redirect("/choose-role");
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-xs font-semibold">
          Loading Owner Dashboard...
        </div>
      }
    >
      <OwnerDashboardClient
        user={{
          id: dbUser.id,
          name: dbUser.name || clerkUser.fullName || "StaySpot Host",
          email: dbUser.email,
          imageUrl: dbUser.imageUrl || clerkUser.imageUrl || "",
          role: dbUser.role,
        }}
      />
    </Suspense>
  );
}
