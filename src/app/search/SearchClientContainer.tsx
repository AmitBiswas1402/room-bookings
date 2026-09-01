"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
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
  Map,
  Grid,
  X,
  Share2,
} from "lucide-react";
import { Stay, formatINR, calculateNights } from "@/data/stays";
import SearchExpandedModal from "@/components/navbar/SearchExpandedModal";
import WishlistHeartButton from "@/components/common/WishlistHeartButton";
import dynamic from "next/dynamic";

const PropertyDiscoveryMap = dynamic(
  () => import("@/components/map/PropertyDiscoveryMap"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[400px] w-full rounded-3xl bg-slate-950 flex items-center justify-center text-slate-400 text-xs font-semibold">
        Loading interactive discovery map...
      </div>
    ),
  }
);

interface SearchClientContainerProps {
  initialStays: Stay[];
  allStaysCount: number;
  queryCity: string;
  queryDestination: string;
  queryCheckIn: string;
  queryCheckOut: string;
  queryGuests: number;
  queryRooms: number;
  queryCategory: string;
  queryMinPrice?: number;
  queryMaxPrice?: number;
  queryRating?: number;
  queryAmenities: string[];
  querySort: string;
  nights: number;
  formattedDates: string;
}

const ALL_AMENITIES = [
  "Private Pool",
  "Sea View",
  "High-Speed Wi-Fi",
  "Breakfast",
  "Air Conditioning",
  "Balcony",
  "Jacuzzi",
  "Kitchen",
  "Mountain View",
  "Lake View",
  "Free Parking",
  "Gym / Fitness",
];

const PROPERTY_TYPES = [
  { id: "ALL", label: "All Types" },
  { id: "VILLA", label: "Villas" },
  { id: "HOTEL", label: "Hotels" },
  { id: "APARTMENT", label: "Apartments" },
  { id: "RESORT", label: "Resorts" },
  { id: "HOMESTAY", label: "Homestays" },
];

export default function SearchClientContainer({
  initialStays,
  allStaysCount,
  queryCity,
  queryDestination,
  queryCheckIn,
  queryCheckOut,
  queryGuests,
  queryRooms,
  queryCategory,
  queryMinPrice,
  queryMaxPrice,
  queryRating,
  queryAmenities,
  querySort,
  nights,
  formattedDates,
}: SearchClientContainerProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [selectedStayForModal, setSelectedStayForModal] = useState<Stay | null>(null);
  const [wishlistedIds, setWishlistedIds] = useState<string[]>([]);
  const [isMapView, setIsMapView] = useState(false);
  const [activePinId, setActivePinId] = useState<string | null>(null);

  // Advanced filter states
  const [priceMin, setPriceMin] = useState<number>(queryMinPrice || 0);
  const [priceMax, setPriceMax] = useState<number>(queryMaxPrice || 50000);
  const [minRating, setMinRating] = useState<number>(queryRating || 0);
  const [selectedCategory, setSelectedCategory] = useState<string>(queryCategory || "");
  const [selectedPropertyType, setSelectedPropertyType] = useState<string>("ALL");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(queryAmenities || []);
  const [minGuests, setMinGuests] = useState<number>(queryGuests || 1);
  const [currentSort, setCurrentSort] = useState<string>(querySort || "recommended");
  const [onlySuperhost, setOnlySuperhost] = useState<boolean>(false);
  const [onlyInstantBook, setOnlyInstantBook] = useState<boolean>(false);

  // Update query params in URL
  const applyFilters = (updates: {
    minPrice?: number;
    maxPrice?: number;
    rating?: number;
    category?: string;
    propertyType?: string;
    amenities?: string[];
    guests?: number;
    sort?: string;
  }) => {
    const params = new URLSearchParams();
    if (queryCity) params.set("city", queryCity);
    if (queryDestination) params.set("destination", queryDestination);
    if (queryCheckIn) params.set("checkIn", queryCheckIn);
    if (queryCheckOut) params.set("checkOut", queryCheckOut);

    const finalGuests = updates.guests !== undefined ? updates.guests : minGuests;
    if (finalGuests > 1) params.set("guests", String(finalGuests));
    if (queryRooms > 1) params.set("rooms", String(queryRooms));

    const finalCat = updates.category !== undefined ? updates.category : selectedCategory;
    if (finalCat && finalCat !== "all") params.set("category", finalCat);

    const finalMin = updates.minPrice !== undefined ? updates.minPrice : priceMin;
    if (finalMin > 0) params.set("minPrice", String(finalMin));

    const finalMax = updates.maxPrice !== undefined ? updates.maxPrice : priceMax;
    if (finalMax && finalMax < 50000) params.set("maxPrice", String(finalMax));

    const finalRating = updates.rating !== undefined ? updates.rating : minRating;
    if (finalRating > 0) params.set("rating", String(finalRating));

    const finalAmenities = updates.amenities !== undefined ? updates.amenities : selectedAmenities;
    if (finalAmenities.length > 0) params.set("amenities", finalAmenities.join(","));

    const finalSort = updates.sort !== undefined ? updates.sort : currentSort;
    if (finalSort && finalSort !== "recommended") params.set("sort", finalSort);

    router.push(`/search?${params.toString()}`);
  };

  const handleSearchModalSubmit = (newSearch: {
    city: string;
    destination: string;
    checkIn: string;
    checkOut: string;
    guests: number;
    rooms: number;
  }) => {
    const params = new URLSearchParams();
    if (newSearch.city) params.set("city", newSearch.city);
    if (newSearch.destination) params.set("destination", newSearch.destination);
    if (newSearch.checkIn) params.set("checkIn", newSearch.checkIn);
    if (newSearch.checkOut) params.set("checkOut", newSearch.checkOut);
    if (newSearch.guests > 1) params.set("guests", String(newSearch.guests));
    if (newSearch.rooms > 1) params.set("rooms", String(newSearch.rooms));
    if (selectedCategory) params.set("category", selectedCategory);

    router.push(`/search?${params.toString()}`);
  };

  const toggleWishlist = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setWishlistedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleAmenity = (amenity: string) => {
    const next = selectedAmenities.includes(amenity)
      ? selectedAmenities.filter((a) => a !== amenity)
      : [...selectedAmenities, amenity];
    setSelectedAmenities(next);
    applyFilters({ amenities: next });
  };

  const clearAllFilters = () => {
    setPriceMin(0);
    setPriceMax(50000);
    setMinRating(0);
    setSelectedCategory("");
    setSelectedPropertyType("ALL");
    setSelectedAmenities([]);
    setMinGuests(1);
    setCurrentSort("recommended");
    setOnlySuperhost(false);
    setOnlyInstantBook(false);

    const params = new URLSearchParams();
    if (queryCity) params.set("city", queryCity);
    if (queryCheckIn) params.set("checkIn", queryCheckIn);
    if (queryCheckOut) params.set("checkOut", queryCheckOut);
    router.push(`/search?${params.toString()}`);
  };

  // Client-side filtering for advanced dimensions
  const visibleStays = initialStays.filter((stay) => {
    if (onlySuperhost && !stay.isSuperhost) return false;
    if (onlyInstantBook && !stay.isInstantBook) return false;
    if (stay.pricePerNight < priceMin) return false;
    if (stay.pricePerNight > priceMax) return false;
    if (minRating > 0 && stay.rating < minRating) return false;
    if (minGuests > 1 && stay.maxGuests < minGuests) return false;
    if (
      selectedPropertyType !== "ALL" &&
      stay.propertyType &&
      stay.propertyType.toUpperCase() !== selectedPropertyType.toUpperCase()
    ) {
      return false;
    }
    if (selectedAmenities.length > 0) {
      const hasAll = selectedAmenities.every((a) =>
        stay.amenities.some((sa) => sa.toLowerCase().includes(a.toLowerCase()))
      );
      if (!hasAll) return false;
    }
    return true;
  });

  const headingLocation = queryCity
    ? queryCity.charAt(0).toUpperCase() + queryCity.slice(1)
    : queryDestination || "All Destinations";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1">
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
          <Link href="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <ChevronRight className="h-3 w-3 text-slate-600" />
          <Link href="/search" className="hover:text-white transition-colors">
            Search
          </Link>
          {queryCity && (
            <>
              <ChevronRight className="h-3 w-3 text-slate-600" />
              <span className="text-indigo-400 font-semibold">{headingLocation}</span>
            </>
          )}
        </div>

        {/* Refined Search Quick-Bar Pill */}
        <div className="p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 shadow-xl mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
            {/* Destination Pill */}
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-950 border border-slate-800 text-slate-200">
              <MapPin className="h-3.5 w-3.5 text-rose-400" />
              <span className="font-bold">{headingLocation}</span>
            </div>

            {/* Dates Pill */}
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-950 border border-slate-800 text-slate-200">
              <CalendarIcon className="h-3.5 w-3.5 text-indigo-400" />
              <span>{formattedDates}</span>
              {queryCheckIn && queryCheckOut && (
                <span className="text-[11px] px-1.5 py-0.2 rounded-md bg-indigo-500/20 text-indigo-300 font-semibold">
                  {nights} {nights === 1 ? "night" : "nights"}
                </span>
              )}
            </div>

            {/* Guests & Rooms */}
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-950 border border-slate-800 text-slate-200">
              <Users className="h-3.5 w-3.5 text-violet-400" />
              <span>{queryGuests} {queryGuests === 1 ? "guest" : "guests"}</span>
              <span className="text-slate-500">·</span>
              <span>{queryRooms} {queryRooms === 1 ? "room" : "rooms"}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto justify-between md:justify-end">
            <button
              type="button"
              onClick={() => setIsMapView(!isMapView)}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              {isMapView ? <Grid className="h-3.5 w-3.5 text-indigo-400" /> : <Map className="h-3.5 w-3.5 text-indigo-400" />}
              <span>{isMapView ? "Grid View" : "Show Map"}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsSearchModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 via-indigo-600 to-violet-600 hover:from-rose-400 hover:to-violet-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 flex items-center gap-1.5 transition-all hover:scale-105"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>Modify Search</span>
            </button>
          </div>
        </div>

        {/* Results Title & Sort Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Stays in {headingLocation}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {visibleStays.length} verified {visibleStays.length === 1 ? "property" : "properties"} available
              {queryCheckIn && queryCheckOut ? ` for ${nights} nights` : ""}
            </p>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
              <ArrowUpDown className="h-3.5 w-3.5" />
              <span>Sort by:</span>
            </span>
            <select
              value={currentSort}
              onChange={(e) => {
                const val = e.target.value;
                setCurrentSort(val);
                applyFilters({ sort: val });
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
            >
              <option value="recommended">Recommended</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="reviews">Most Reviewed</option>
            </select>
          </div>
        </div>

        {/* Main Content Layout: Sidebar Filters + Results Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* LEFT SIDEBAR ADVANCED FILTERS */}
          <div className="space-y-6 lg:border-r lg:border-slate-800/80 lg:pr-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <SlidersHorizontal className="h-3.5 w-3.5 text-indigo-400" />
                <span>Filters</span>
              </h2>
              <button
                type="button"
                onClick={clearAllFilters}
                className="text-xs text-slate-500 hover:text-rose-400 transition-colors flex items-center gap-1"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset All</span>
              </button>
            </div>

            {/* 1. PRICE RANGE SLIDER & INPUTS */}
            <div className="space-y-3 pb-5 border-b border-slate-800/80">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">Nightly Price Range</span>
                <span className="font-bold text-indigo-400 font-mono">
                  {formatINR(priceMin)} – {formatINR(priceMax)}
                </span>
              </div>
              <input
                type="range"
                min="1000"
                max="50000"
                step="500"
                value={priceMax}
                onChange={(e) => setPriceMax(Number(e.target.value))}
                onMouseUp={() => applyFilters({ minPrice: priceMin, maxPrice: priceMax })}
                onTouchEnd={() => applyFilters({ minPrice: priceMin, maxPrice: priceMax })}
                className="w-full accent-indigo-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Min Price</span>
                  <input
                    type="number"
                    value={priceMin || ""}
                    placeholder="₹0"
                    onChange={(e) => {
                      const val = Number(e.target.value) || 0;
                      setPriceMin(val);
                      applyFilters({ minPrice: val, maxPrice: priceMax });
                    }}
                    className="w-full bg-transparent text-xs font-bold text-white font-mono focus:outline-none"
                  />
                </div>
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Max Price</span>
                  <input
                    type="number"
                    value={priceMax || ""}
                    placeholder="₹50000"
                    onChange={(e) => {
                      const val = Number(e.target.value) || 50000;
                      setPriceMax(val);
                      applyFilters({ minPrice: priceMin, maxPrice: val });
                    }}
                    className="w-full bg-transparent text-xs font-bold text-white font-mono focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 2. PROPERTY TYPE FILTER */}
            <div className="space-y-2 pb-5 border-b border-slate-800/80">
              <span className="text-xs font-semibold text-slate-300 block">Property Type</span>
              <div className="grid grid-cols-2 gap-1.5">
                {PROPERTY_TYPES.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => {
                      setSelectedPropertyType(type.id);
                      applyFilters({ propertyType: type.id });
                    }}
                    className={`py-1.5 px-2 text-xs font-semibold rounded-xl border text-center transition-all ${
                      selectedPropertyType === type.id
                        ? "bg-indigo-600 text-white border-indigo-500 shadow-sm"
                        : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700"
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. GUEST CAPACITY FILTER */}
            <div className="space-y-2 pb-5 border-b border-slate-800/80">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">Min Guest Capacity</span>
                <span className="font-bold text-violet-400">{minGuests}+ Guests</span>
              </div>
              <div className="grid grid-cols-5 gap-1 text-xs font-bold">
                {[1, 2, 4, 6, 8].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => {
                      setMinGuests(g);
                      applyFilters({ guests: g });
                    }}
                    className={`py-1.5 rounded-lg border text-center transition-all ${
                      minGuests === g
                        ? "bg-violet-600 text-white border-violet-500 shadow-sm"
                        : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white"
                    }`}
                  >
                    {g}+
                  </button>
                ))}
              </div>
            </div>

            {/* 4. GUEST RATING FILTER */}
            <div className="space-y-2 pb-5 border-b border-slate-800/80">
              <span className="text-xs font-semibold text-slate-300 block">Guest Rating</span>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { label: "Any", val: 0 },
                  { label: "4.0★", val: 4.0 },
                  { label: "4.5★", val: 4.5 },
                  { label: "4.8★", val: 4.8 },
                ].map((item) => (
                  <button
                    key={item.val}
                    type="button"
                    onClick={() => {
                      setMinRating(item.val);
                      applyFilters({ rating: item.val });
                    }}
                    className={`py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                      minRating === item.val
                        ? "bg-indigo-600 text-white border-indigo-500 shadow-sm"
                        : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 5. QUICK TOGGLES */}
            <div className="space-y-3 pb-5 border-b border-slate-800/80">
              <label className="flex items-center justify-between cursor-pointer group">
                <span className="text-xs font-medium text-slate-300 group-hover:text-white flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
                  <span>Superhost Stays Only</span>
                </span>
                <input
                  type="checkbox"
                  checked={onlySuperhost}
                  onChange={(e) => setOnlySuperhost(e.target.checked)}
                  className="accent-indigo-600 h-4 w-4 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer group">
                <span className="text-xs font-medium text-slate-300 group-hover:text-white flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Instant Booking Only</span>
                </span>
                <input
                  type="checkbox"
                  checked={onlyInstantBook}
                  onChange={(e) => setOnlyInstantBook(e.target.checked)}
                  className="accent-indigo-600 h-4 w-4 rounded cursor-pointer"
                />
              </label>
            </div>

            {/* 6. AMENITIES MULTI-SELECT */}
            <div className="space-y-2 pb-5">
              <span className="text-xs font-semibold text-slate-300 block mb-2">Amenities</span>
              <div className="space-y-2">
                {ALL_AMENITIES.map((amenity) => {
                  const isChecked = selectedAmenities.includes(amenity);
                  return (
                    <label
                      key={amenity}
                      className="flex items-center justify-between text-xs text-slate-300 hover:text-white cursor-pointer py-1"
                    >
                      <span>{amenity}</span>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleAmenity(amenity)}
                        className="accent-indigo-600 h-3.5 w-3.5 rounded cursor-pointer"
                      />
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT STAYS GRID & MAP VIEW */}
          <div className="lg:col-span-3 space-y-6">
            {/* Interactive Leaflet Map with Price Pins */}
            {isMapView && (
              <div className="w-full h-[400px] sm:h-[480px] rounded-3xl overflow-hidden relative shadow-2xl animate-in fade-in zoom-in-95 duration-300">
                <PropertyDiscoveryMap
                  stays={visibleStays}
                  selectedStayId={activePinId}
                  onSelectStay={(s) => setActivePinId(s?.id || null)}
                  className="h-full w-full"
                />
                <button
                  type="button"
                  onClick={() => setIsMapView(false)}
                  className="absolute top-4 right-4 z-30 p-2 rounded-full bg-slate-900/90 text-slate-300 hover:text-white border border-slate-700 shadow-xl"
                  title="Close Map View"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Zero Results State */}
            {visibleStays.length === 0 ? (
              <div className="p-12 rounded-3xl bg-slate-900/50 border border-slate-800 text-center space-y-4">
                <div className="h-16 w-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
                  <Sparkles className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold text-white">No stays found matching your criteria</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Try adjusting your price range, clearing some amenities, or exploring nearby destinations.
                </p>
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 transition-all inline-flex items-center gap-1.5"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reset All Filters</span>
                </button>
              </div>
            ) : (
              /* Stays Cards Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {visibleStays.map((stay) => {
                  const isWishlisted = wishlistedIds.includes(stay.id);
                  const totalPrice = stay.pricePerNight * nights;
                  const originalTotalPrice = stay.originalPrice * nights;

                  return (
                    <div
                      key={stay.id}
                      className="group rounded-3xl bg-slate-900/70 border border-slate-800/80 hover:border-indigo-500/40 transition-all duration-300 overflow-hidden flex flex-col justify-between shadow-lg hover:shadow-2xl hover:shadow-indigo-500/5 hover:-translate-y-1"
                    >
                      {/* Image & Badges */}
                      <Link
                        href={`/properties/${stay.id}?checkIn=${queryCheckIn}&checkOut=${queryCheckOut}&guests=${queryGuests}`}
                        className="relative aspect-[4/3] w-full overflow-hidden bg-slate-950 block"
                      >
                        <img
                          src={stay.imageUrl}
                          alt={stay.title}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30" />

                        {/* Top Badges */}
                        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                          {stay.propertyType && (
                            <span className="px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-[10px] font-bold text-slate-300 border border-slate-700">
                              {stay.propertyType}
                            </span>
                          )}
                          {stay.isSuperhost && (
                            <span className="px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-[10px] font-bold text-amber-300 border border-amber-500/30 flex items-center gap-1">
                              <ShieldCheck className="h-3 w-3" />
                              <span>Superhost</span>
                            </span>
                          )}
                          {stay.isInstantBook && (
                            <span className="px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-[10px] font-bold text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                              <Zap className="h-3 w-3" />
                              <span>Instant Book</span>
                            </span>
                          )}
                          {stay.isHolidayAvailable && (
                            <span className="px-2.5 py-1 rounded-full bg-rose-500/20 backdrop-blur-md text-[10px] font-bold text-rose-300 border border-rose-500/30 flex items-center gap-1">
                              <Zap className="h-3 w-3 text-rose-400" />
                              <span>Dynamic Pricing</span>
                            </span>
                          )}
                        </div>

                        {/* Location Tag on bottom of image */}
                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-slate-200">
                          <div className="flex items-center gap-1 truncate font-medium drop-shadow-md">
                            <MapPin className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                            <span className="truncate">{stay.location}</span>
                          </div>
                        </div>
                      </Link>

                      {/* Wishlist Button */}
                      <div className="absolute top-3 right-3 z-10">
                        <WishlistHeartButton propertyId={stay.id} />
                      </div>

                      {/* Card Content Body */}
                      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <Link href={`/properties/${stay.id}?checkIn=${queryCheckIn}&checkOut=${queryCheckOut}&guests=${queryGuests}`}>
                              <h3 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-1">
                                {stay.title}
                              </h3>
                            </Link>
                            <div className="flex items-center gap-1 text-xs font-bold text-amber-400 shrink-0">
                              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                              <span>{stay.rating.toFixed(2)}</span>
                              <span className="text-slate-500 font-normal">({stay.reviewsCount})</span>
                            </div>
                          </div>

                          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                            {stay.description}
                          </p>

                          {/* Amenities Chips */}
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {stay.amenities.slice(0, 3).map((amenity) => (
                              <span
                                key={amenity}
                                className="px-2 py-0.5 rounded-md bg-slate-950 text-[10px] font-medium text-slate-400 border border-slate-800"
                              >
                                {amenity}
                              </span>
                            ))}
                            {stay.amenities.length > 3 && (
                              <span className="px-2 py-0.5 rounded-md bg-slate-950 text-[10px] font-medium text-slate-500 border border-slate-800">
                                +{stay.amenities.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Price & Action */}
                        <div className="pt-3 border-t border-slate-800/80 flex items-end justify-between gap-2">
                          <div>
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-base sm:text-lg font-black text-white">
                                {formatINR(stay.pricePerNight)}
                              </span>
                              <span className="text-xs text-slate-400">/ night</span>
                              <span className="text-[11px] text-slate-500 line-through ml-1">
                                {formatINR(stay.originalPrice)}
                              </span>
                            </div>
                            <div className="text-[11px] text-indigo-400 font-semibold mt-0.5">
                              {nights > 1 ? (
                                <span>{formatINR(totalPrice)} total ({nights} nights)</span>
                              ) : (
                                <span>Taxes & fees included</span>
                              )}
                            </div>
                          </div>

                          <Link
                            href={`/properties/${stay.id}?checkIn=${queryCheckIn}&checkOut=${queryCheckOut}&guests=${queryGuests}`}
                            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-indigo-600 hover:from-rose-400 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all hover:scale-105 shrink-0"
                          >
                            View Property
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Floating Bottom Center "Show Map / List" Toggle Button */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-in fade-in slide-in-from-bottom-6 duration-300">
        <button
          type="button"
          onClick={() => {
            setIsMapView(!isMapView);
            if (!isMapView) {
              window.scrollTo({ top: 120, behavior: "smooth" });
            }
          }}
          className="px-6 py-3.5 rounded-full bg-slate-900/95 hover:bg-slate-950 text-white font-extrabold text-xs shadow-2xl shadow-black/80 border border-slate-700/80 backdrop-blur-xl flex items-center gap-2.5 transition-all hover:scale-105 hover:border-indigo-500 group"
        >
          <div className="h-6 w-6 rounded-full bg-gradient-to-r from-rose-500 to-indigo-600 flex items-center justify-center text-white shadow group-hover:rotate-12 transition-transform">
            {isMapView ? <Grid className="h-3.5 w-3.5" /> : <Map className="h-3.5 w-3.5" />}
          </div>
          <span className="tracking-wide">{isMapView ? "Show List 📋" : "Show Map 🗺️"}</span>
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        </button>
      </div>

      {/* Expanded Search Modal Integration */}
      <SearchExpandedModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onSearch={handleSearchModalSubmit}
        initialValues={{
          city: queryCity,
          destination: queryDestination,
          checkIn: queryCheckIn,
          checkOut: queryCheckOut,
          guests: queryGuests,
          rooms: queryRooms,
        }}
      />

      {/* Stay Reservation Quick Detail Modal */}
      {selectedStayForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div
            className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 relative animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedStayForModal(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="aspect-video w-full rounded-2xl overflow-hidden mb-4 relative">
              <img
                src={selectedStayForModal.imageUrl}
                alt={selectedStayForModal.title}
                className="h-full w-full object-cover"
              />
              <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-950/80 text-xs font-bold text-white border border-slate-700">
                {selectedStayForModal.tag}
              </span>
            </div>

            <h3 className="text-lg font-bold text-white">{selectedStayForModal.title}</h3>
            <p className="text-xs text-slate-400 mt-1">{selectedStayForModal.location}</p>

            <div className="my-4 p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Selected Dates</span>
                <span className="font-semibold text-white">{formattedDates}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Duration</span>
                <span className="font-semibold text-white">{nights} {nights === 1 ? "Night" : "Nights"}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Guests & Rooms</span>
                <span className="font-semibold text-white">{queryGuests} Guests · {queryRooms} Room</span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-between text-sm font-bold text-white">
                <span>Estimated Total</span>
                <span className="text-indigo-400">{formatINR(selectedStayForModal.pricePerNight * nights)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                alert(`Booking confirmation initiated for ${selectedStayForModal.title}! Total: ${formatINR(selectedStayForModal.pricePerNight * nights)}`);
                setSelectedStayForModal(null);
              }}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-500 via-indigo-600 to-violet-600 hover:from-rose-400 hover:to-violet-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/25 transition-all hover:scale-[1.01]"
            >
              Confirm & Book Now ({formatINR(selectedStayForModal.pricePerNight * nights)})
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
