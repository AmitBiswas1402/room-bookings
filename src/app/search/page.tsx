import React, { Suspense } from "react";
import Link from "next/link";
import {
  Star,
  MapPin,
  Heart,
  SlidersHorizontal,
  Sparkles,
  Calendar as CalendarIcon,
  Users,
  BedDouble,
  Check,
  RotateCcw,
  ArrowUpDown,
  ShieldCheck,
  Zap,
  Building2,
  ChevronRight,
  Info,
} from "lucide-react";
import {
  ALL_STAYS,
  searchStays,
  calculateNights,
  formatDateRange,
  formatINR,
  Stay,
} from "@/data/stays";
import SearchClientContainer from "./SearchClientContainer";

interface SearchPageProps {
  searchParams: Promise<{
    city?: string;
    destination?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: string;
    rooms?: string;
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    rating?: string;
    amenities?: string;
    sort?: string;
  }>;
}

export const metadata = {
  title: "Search Stays & Luxury Hotels — StaySpot",
  description: "Browse verified hotel rooms, luxury villas, mountain lofts, and beachfront apartments.",
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;

  const city = params.city || "";
  const destination = params.destination || "";
  const checkIn = params.checkIn || "";
  const checkOut = params.checkOut || "";
  const guests = Number(params.guests) || 1;
  const rooms = Number(params.rooms) || 1;
  const category = params.category || "";
  const minPrice = params.minPrice ? Number(params.minPrice) : undefined;
  const maxPrice = params.maxPrice ? Number(params.maxPrice) : undefined;
  const rating = params.rating ? Number(params.rating) : undefined;
  const amenitiesList = params.amenities ? params.amenities.split(",").filter(Boolean) : [];
  const sort = (params.sort as any) || "recommended";

  const nights = calculateNights(checkIn, checkOut);
  const formattedDates = formatDateRange(checkIn, checkOut);

  // Filter initial stays on the server
  const filteredStays = searchStays({
    city,
    destination,
    category,
    checkIn,
    checkOut,
    guests,
    rooms,
    minPrice,
    maxPrice,
    rating,
    amenities: amenitiesList,
    sort,
  });

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
          <div className="flex items-center gap-3">
            <div className="h-6 w-6 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
            <span className="text-sm font-semibold">Loading available stays...</span>
          </div>
        </div>
      }
    >
      <SearchClientContainer
        initialStays={filteredStays}
        allStaysCount={ALL_STAYS.length}
        queryCity={city}
        queryDestination={destination}
        queryCheckIn={checkIn}
        queryCheckOut={checkOut}
        queryGuests={guests}
        queryRooms={rooms}
        queryCategory={category}
        queryMinPrice={minPrice}
        queryMaxPrice={maxPrice}
        queryRating={rating}
        queryAmenities={amenitiesList}
        querySort={sort}
        nights={nights}
        formattedDates={formattedDates}
      />
    </Suspense>
  );
}
