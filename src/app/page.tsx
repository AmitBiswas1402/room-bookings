import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { syncUserInDb } from "@/lib/authorization";
import {
  Star,
  MapPin,
  Heart,
  Flame,
  UserCheck,
  RotateCcw,
  Sparkles,
  SlidersHorizontal,
  Compass,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Building2,
} from "lucide-react";
import { formatINR, Stay } from "@/data/stays";
import { fetchAllStaysFromDb } from "@/lib/staysDb";
import WishlistHeartButton from "@/components/common/WishlistHeartButton";
import HomeMapDiscoveryTrigger from "@/components/map/HomeMapDiscoveryTrigger";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{
    city?: string;
    category?: string;
    destination?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: string;
    rooms?: string;
  }>;
}) {
  const clerkUser = await currentUser();
  let dbUser = null;

  if (clerkUser) {
    dbUser = await syncUserInDb();

    // If signed-in user has role === null (and not an ADMIN), redirect to /choose-role
    if (dbUser && !dbUser.role) {
      redirect("/choose-role");
    }
  }

  const params = await searchParams;
  const activeCity = (params.city || "").toLowerCase().trim();
  const activeCategory = (params.category || "").toLowerCase().trim();
  const activeDestination = (params.destination || "").toLowerCase().trim();
  const requiredGuests = Number(params.guests) || 0;
  const checkIn = params.checkIn || "";
  const checkOut = params.checkOut || "";

  // Fetch all live stays directly from Neon Database
  const liveStays = await fetchAllStaysFromDb();

  // Filter listings based on active search parameters
  let filteredStays = [...liveStays];

  if (activeCity && activeCity !== "all") {
    filteredStays = filteredStays.filter(
      (s) =>
        s.city.toLowerCase() === activeCity ||
        s.cityId.toLowerCase() === activeCity ||
        s.location.toLowerCase().includes(activeCity)
    );
  }

  if (activeCategory && activeCategory !== "all") {
    filteredStays = filteredStays.filter((s) => s.category.toLowerCase() === activeCategory);
  }

  if (activeDestination && activeDestination !== "anywhere") {
    filteredStays = filteredStays.filter(
      (s) =>
        s.city.toLowerCase().includes(activeDestination) ||
        s.location.toLowerCase().includes(activeDestination) ||
        s.title.toLowerCase().includes(activeDestination) ||
        s.state.toLowerCase().includes(activeDestination)
    );
  }

  if (requiredGuests > 0) {
    filteredStays = filteredStays.filter((s) => s.maxGuests >= requiredGuests);
  }

  const hasActiveFilters =
    (activeCity && activeCity !== "all") ||
    (activeCategory && activeCategory !== "all") ||
    (activeDestination && activeDestination !== "anywhere") ||
    requiredGuests > 0;

  return (
    <div className="flex-1 bg-slate-950 text-slate-100 flex flex-col justify-between">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        {/* Logged-In User Quick Status Banner */}
        {dbUser && (
          <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-indigo-950/60 via-slate-900/80 to-slate-900 border border-indigo-500/20 backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3.5">
              <div className="h-10 w-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <UserCheck className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">
                    Logged in as {dbUser.name || dbUser.email}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      dbUser.role === "ADMIN"
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                        : dbUser.role === "OWNER"
                        ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                        : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                    }`}
                  >
                    {dbUser.role}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  {dbUser.role === "ADMIN"
                    ? "Full administrative control enabled"
                    : dbUser.role === "OWNER"
                    ? "Host mode active: Manage your properties and reservations"
                    : "Guest mode active: Search and book verified stays"}
                </p>
              </div>
            </div>

            {(dbUser.role === "OWNER" || dbUser.role === "ADMIN") && (
              <Link
                href="/dashboard"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 transition-all hover:scale-105 flex items-center gap-1.5 shrink-0"
              >
                <Building2 className="h-4 w-4" />
                <span>Owner Dashboard &rarr;</span>
              </Link>
            )}
          </div>
        )}

        {/* Hero Search Callout Banner */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-indigo-950 via-slate-900 to-violet-950 border border-indigo-500/20 p-6 sm:p-10 mb-10 shadow-2xl">
          <div className="max-w-2xl space-y-3 relative z-10">
            <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Direct Booking Guarantee</span>
            </span>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              Find Exceptional Boutique Stays & Luxury Villas
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Verified private pools, mountain cabins, Arabian sea penthouses, and heritage palaces with instant confirmations.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                href={`/search${activeCity ? `?city=${activeCity}` : ""}`}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 via-indigo-600 to-violet-600 hover:from-rose-400 hover:to-violet-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-indigo-600/25 inline-flex items-center gap-2 transition-all hover:scale-105"
              >
                <span>Explore All Stays</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none hidden md:block" />
        </div>

        {/* Section Header & Active Filters Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Flame className="h-3.5 w-3.5" />
              {activeCity && activeCity !== "all"
                ? `Stays in ${activeCity.toUpperCase()}`
                : "Trending Stays & Villas"}
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              {hasActiveFilters
                ? `Filtered Stays (${filteredStays.length} found)`
                : "Popular places to stay this week"}
            </h2>
          </div>

          {/* Active Filter Badges */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 flex-wrap">
              {activeCity && activeCity !== "all" && (
                <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  City: {activeCity}
                </span>
              )}

              {activeCategory && activeCategory !== "all" && (
                <span className="px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 text-xs font-semibold flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  Category: {activeCategory}
                </span>
              )}

              {activeDestination && (
                <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold">
                  Search: {activeDestination}
                </span>
              )}

              <Link
                href="/"
                className="flex items-center gap-1 px-3 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold transition-colors"
              >
                <RotateCcw className="h-3 w-3" />
                Reset All
              </Link>
            </div>
          )}
        </div>

        {/* Empty State when no listings match */}
        {filteredStays.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-slate-900/40 border border-slate-800 my-12 max-w-xl mx-auto flex flex-col items-center">
            <div className="h-16 w-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
              <Compass className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              No stays match your criteria
            </h3>
            <p className="text-sm text-slate-400 mb-6 max-w-md">
              We couldn't find available rooms matching all current filters. Try
              clearing your filters or exploring another destination.
            </p>
            <Link
              href="/"
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all"
            >
              Browse All Stays
            </Link>
          </div>
        ) : (
          /* Stays Grid (Airbnb / OYO Card Aesthetics) */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredStays.map((stay) => (
              <div
                key={stay.id}
                className="group relative rounded-3xl bg-slate-900/60 border border-slate-800/80 overflow-hidden hover:border-indigo-500/40 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 flex flex-col justify-between"
              >
                {/* Card Image Container */}
                <Link
                  href={`/properties/${stay.id}`}
                  className="relative aspect-[4/3] w-full overflow-hidden bg-slate-800 block"
                >
                  <img
                    src={stay.imageUrl}
                    alt={stay.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30" />

                  {/* Tag Badge */}
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-950/70 backdrop-blur-md text-[10px] font-bold text-white border border-white/10">
                    {stay.tag}
                  </div>
                </Link>

                {/* Wishlist Heart Button */}
                <div className="absolute top-3 right-3 z-10">
                  <WishlistHeartButton propertyId={stay.id} />
                </div>

                {/* Card Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-400 font-medium flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-rose-400" />
                        {stay.location}
                      </span>
                      <span className="flex items-center gap-1 font-bold text-amber-400">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        {stay.rating.toFixed(2)}
                      </span>
                    </div>

                    <Link href={`/properties/${stay.id}`}>
                      <h3 className="font-bold text-sm text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                        {stay.title}
                      </h3>
                    </Link>

                    {/* Amenities Tags */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {stay.amenities.slice(0, 2).map((amenity) => (
                        <span
                          key={amenity}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-slate-950 text-slate-300 border border-slate-800"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Pricing & Booking Row */}
                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-base font-extrabold text-white">
                          {formatINR(stay.pricePerNight)}
                        </span>
                        <span className="text-xs text-slate-500 line-through">
                          {formatINR(stay.originalPrice)}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">
                        per night · taxes incl.
                      </span>
                    </div>

                    <Link
                      href={`/properties/${stay.id}`}
                      className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-indigo-600 hover:from-rose-400 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all hover:scale-105"
                    >
                      View Property
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Floating Map Discovery Pill Button */}
      <HomeMapDiscoveryTrigger stays={filteredStays} />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 mt-16 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-400">StaySpot</span>
            <span>&copy; {new Date().getFullYear()} StaySpot Technologies Inc.</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-300 cursor-pointer">Privacy</span>
            <span className="hover:text-slate-300 cursor-pointer">Terms</span>
            <span className="hover:text-slate-300 cursor-pointer">Destinations</span>
            <span className="hover:text-slate-300 cursor-pointer">Hosting Help</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
