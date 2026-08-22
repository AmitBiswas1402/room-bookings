import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Compass, RotateCcw } from "lucide-react";
import { getStayById, ALL_STAYS } from "@/data/stays";
import PropertyClientView from "./PropertyClientView";

interface PropertyPageProps {
  params: Promise<{
    propertyId: string;
  }>;
  searchParams: Promise<{
    checkIn?: string;
    checkOut?: string;
    guests?: string;
  }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ propertyId: string }>;
}): Promise<Metadata> {
  const { propertyId } = await params;
  const stay = getStayById(propertyId);

  if (!stay) {
    return {
      title: "Property Not Found — StaySpot",
    };
  }

  return {
    title: `${stay.title} in ${stay.city} — StaySpot`,
    description: stay.description.slice(0, 160),
    openGraph: {
      title: `${stay.title} — StaySpot`,
      description: stay.description.slice(0, 160),
      images: [stay.imageUrl],
    },
  };
}

export default async function PropertyDetailsPage({
  params,
  searchParams,
}: PropertyPageProps) {
  const { propertyId } = await params;
  const search = await searchParams;

  const stay = getStayById(propertyId);

  if (!stay) {
    return (
      <div className="min-h-[70vh] bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="h-16 w-16 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center mx-auto">
            <Compass className="h-8 w-8" />
          </div>
          <h1 className="text-xl font-bold text-white">Property Not Found</h1>
          <p className="text-xs text-slate-400">
            The property <span className="font-mono text-indigo-400">"{propertyId}"</span> may have been delisted or does not exist.
          </p>
          <Link
            href="/search"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Browse All Available Stays</span>
          </Link>
        </div>
      </div>
    );
  }

  const initialGuests = search.guests ? Number(search.guests) : 2;

  return (
    <PropertyClientView
      stay={stay}
      initialCheckIn={search.checkIn || ""}
      initialCheckOut={search.checkOut || ""}
      initialGuests={isNaN(initialGuests) ? 2 : initialGuests}
    />
  );
}
