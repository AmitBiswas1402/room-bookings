"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Star,
  MapPin,
  Heart,
  Share2,
  ShieldCheck,
  Zap,
  Sparkles,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Grid,
  Calendar as CalendarIcon,
  Users,
  BedDouble,
  Clock,
  Award,
  Wifi,
  Waves,
  Tv,
  Coffee,
  Car,
  Utensils,
  Wind,
  Bath,
  Home,
  Shield,
  CheckCircle2,
  Info,
  SlidersHorizontal,
  ChevronDown,
  ArrowRight,
  Building2,
  Pencil,
  CreditCard,
} from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { Stay, HotelRoom, formatINR, calculateNights, formatDateRange, ALL_STAYS } from "@/data/stays";
import CalendarRangePicker from "@/components/navbar/CalendarRangePicker";
import RazorpayBookingModal from "@/components/booking/RazorpayBookingModal";

interface PropertyClientViewProps {
  stay: Stay;
  initialCheckIn?: string;
  initialCheckOut?: string;
  initialGuests?: number;
}

export default function PropertyClientView({
  stay,
  initialCheckIn = "",
  initialCheckOut = "",
  initialGuests = 2,
}: PropertyClientViewProps) {
  const router = useRouter();
  const { user } = useUser();

  const [checkIn, setCheckIn] = useState(initialCheckIn);
  const [checkOut, setCheckOut] = useState(initialCheckOut);
  const [adults, setAdults] = useState(Math.max(1, initialGuests));
  const [children, setChildren] = useState(0);
  const [isGuestsOpen, setIsGuestsOpen] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [isAllAmenitiesOpen, setIsAllAmenitiesOpen] = useState(false);
  const [isBookingConfirmed, setIsBookingConfirmed] = useState(false);
  const [isBookingLoading, setIsBookingLoading] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Available Hotel Rooms
  const availableRooms: HotelRoom[] =
    stay.rooms && stay.rooms.length > 0
      ? stay.rooms
      : [
          {
            id: `${stay.id}-primary`,
            name: `${stay.category === "villas" ? "Entire Luxury Villa Suite" : "Standard Deluxe King Suite"}`,
            type: "Deluxe",
            description: "Primary accommodation featuring complete private access, scenic views, and curated hotel amenities.",
            maxGuests: stay.maxGuests,
            bedType: stay.sleepingArrangements[0]?.bedType || "1 King Bed",
            bedsCount: stay.beds,
            sizeSqFt: 480,
            pricePerNight: stay.pricePerNight,
            originalPrice: stay.originalPrice,
            holidayPrice: stay.holidaySurgePrice,
            totalUnits: 1,
            imageUrl: stay.imageUrl,
            gallery: stay.gallery,
            amenities: stay.amenities.slice(0, 5),
            mealPlan: "Free Breakfast Included",
            cancellationPolicy: "Free cancellation up to 48 hours before check-in",
          },
        ];

  const [selectedRoomId, setSelectedRoomId] = useState<string>(availableRooms[0].id);
  const selectedRoom = availableRooms.find((r) => r.id === selectedRoomId) || availableRooms[0];
  const [activeRoomModal, setActiveRoomModal] = useState<HotelRoom | null>(null);

  const totalGuests = adults + children;
  const nights = calculateNights(checkIn, checkOut);
  const formattedDates = formatDateRange(checkIn, checkOut);

  // Dynamic Room Price calculation
  const nightlyRate = selectedRoom.pricePerNight || stay.pricePerNight;
  const subtotal = nightlyRate * nights;
  const cleaning = stay.cleaningFee || 1000;
  const service = stay.serviceFee || 750;
  const total = subtotal + cleaning + service;

  // Handle Share link
  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // Keyboard navigation for gallery modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isGalleryOpen) return;
      if (e.key === "Escape") setIsGalleryOpen(false);
      if (e.key === "ArrowRight") {
        setGalleryIndex((prev) => (prev + 1) % stay.gallery.length);
      }
      if (e.key === "ArrowLeft") {
        setGalleryIndex((prev) => (prev - 1 + stay.gallery.length) % stay.gallery.length);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isGalleryOpen, stay.gallery.length]);

  const handleBookingSubmit = () => {
    let effectiveCheckIn = checkIn;
    let effectiveCheckOut = checkOut;

    if (!effectiveCheckIn || !effectiveCheckOut) {
      const today = new Date();
      const d1 = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
      const d2 = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3);
      const formatD = (d: Date) => d.toISOString().split("T")[0];
      effectiveCheckIn = formatD(d1);
      effectiveCheckOut = formatD(d2);
      setCheckIn(effectiveCheckIn);
      setCheckOut(effectiveCheckOut);
    }

    setIsPaymentModalOpen(true);
  };

  const otherStays = ALL_STAYS.filter((s) => s.id !== stay.id && s.cityId === stay.cityId).slice(0, 3);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1">
        {/* Breadcrumb Bar */}
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
          <Link href="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href={`/search?city=${stay.cityId}`} className="hover:text-white transition-colors">
            {stay.city}
          </Link>
          <span>/</span>
          <span className="text-slate-300 truncate max-w-xs">{stay.title}</span>
        </div>

        {/* 1. PROPERTY TITLE & ACTION BAR */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              {stay.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-300">
              <div className="flex items-center gap-1 font-bold text-amber-400">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span>{stay.rating.toFixed(2)}</span>
                <span className="text-slate-400 font-normal underline cursor-pointer ml-0.5">
                  ({stay.reviewsCount} reviews)
                </span>
              </div>

              <span className="text-slate-600">·</span>

              {stay.isSuperhost && (
                <>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 text-xs font-bold flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Superhost
                  </span>
                  <span className="text-slate-600">·</span>
                </>
              )}

              <div className="flex items-center gap-1 text-slate-300">
                <MapPin className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                <span className="font-semibold">{stay.location}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons: Edit, Share & Save */}
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href={`/dashboard?tab=create&editId=${stay.id}`}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
            >
              <Pencil className="h-3.5 w-3.5" />
              <span>Edit Listing</span>
            </Link>

            <button
              type="button"
              onClick={handleShare}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors relative"
            >
              {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Share2 className="h-3.5 w-3.5" />}
              <span>{copiedLink ? "Link Copied!" : "Share"}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsWishlisted(!isWishlisted)}
              className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                isWishlisted
                  ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
                  : "bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-800"
              }`}
            >
              <Heart className={`h-3.5 w-3.5 ${isWishlisted ? "fill-rose-500 text-rose-500" : ""}`} />
              <span>{isWishlisted ? "Saved" : "Save"}</span>
            </button>
          </div>
        </div>

        {/* 2. 5-IMAGE MOSAIC GALLERY GRID (Airbnb Style) */}
        <div className="relative rounded-3xl overflow-hidden mb-10 shadow-2xl shadow-black/80 bg-slate-900 border border-slate-800">
          <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-2 h-72 sm:h-96 md:h-[460px]">
            {/* Main Hero Image (Left side: 2 columns, 2 rows) */}
            <div
              onClick={() => {
                setGalleryIndex(0);
                setIsGalleryOpen(true);
              }}
              className="md:col-span-2 md:row-span-2 relative overflow-hidden cursor-pointer group"
            >
              <img
                src={stay.gallery[0] || stay.imageUrl}
                alt={`${stay.title} hero`}
                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
            </div>

            {/* 4 Supplementary Grid Images (Right side: 2x2) */}
            {(stay.gallery.slice(1, 5).length > 0
              ? stay.gallery.slice(1, 5)
              : [stay.imageUrl, stay.imageUrl, stay.imageUrl, stay.imageUrl]
            ).map((photo, index) => (
              <div
                key={index}
                onClick={() => {
                  setGalleryIndex(index + 1);
                  setIsGalleryOpen(true);
                }}
                className="hidden md:block relative overflow-hidden cursor-pointer group"
              >
                <img
                  src={photo}
                  alt={`${stay.title} photo ${index + 2}`}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
              </div>
            ))}
          </div>

          {/* Show All Photos Button */}
          <button
            type="button"
            onClick={() => {
              setGalleryIndex(0);
              setIsGalleryOpen(true);
            }}
            className="absolute bottom-4 right-4 px-4 py-2 rounded-xl bg-slate-950/80 hover:bg-slate-950 text-white border border-slate-700/80 backdrop-blur-md text-xs font-bold flex items-center gap-2 shadow-xl hover:scale-105 transition-all"
          >
            <Grid className="h-4 w-4" />
            <span>Show all {stay.gallery.length} photos</span>
          </button>
        </div>

        {/* 3. MAIN DETAILS LAYOUT: Left Details + Right Sticky Booking Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* LEFT 2 COLUMNS: Property Details & Story */}
          <div className="lg:col-span-2 space-y-8">
            {/* Host & Capacity Overview */}
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white">
                  Entire {stay.category} hosted by {stay.host.name}
                </h2>
                <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-slate-400 mt-1">
                  <span>{stay.maxGuests} guests</span>
                  <span>·</span>
                  <span>{stay.bedrooms} bedrooms</span>
                  <span>·</span>
                  <span>{stay.beds} beds</span>
                  <span>·</span>
                  <span>{stay.bathrooms} private baths</span>
                </div>
              </div>

              <div className="relative shrink-0">
                <img
                  src={stay.host.avatar}
                  alt={stay.host.name}
                  className="h-14 w-14 rounded-2xl object-cover border-2 border-indigo-500 shadow-md"
                />
                {stay.host.isSuperhost && (
                  <div className="absolute -bottom-1.5 -right-1.5 h-5 w-5 rounded-full bg-amber-500 flex items-center justify-center text-slate-950 shadow">
                    <ShieldCheck className="h-3.5 w-3.5 stroke-[3]" />
                  </div>
                )}
              </div>
            </div>

            {/* Key Highlights */}
            <div className="space-y-4 py-2 border-y border-slate-800/80">
              <div className="flex items-start gap-3.5">
                <div className="h-9 w-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                  <Award className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">Dedicated workspace</div>
                  <div className="text-xs text-slate-400">
                    A private room with high-speed fiber Wi-Fi perfectly suited for working.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="h-9 w-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                  <ShieldCheck className="h-4 w-4 text-amber-400" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">{stay.host.name} is a Superhost</div>
                  <div className="text-xs text-slate-400">
                    Superhosts are experienced, highly rated hosts committed to great stays.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="h-9 w-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                  <CalendarIcon className="h-4 w-4 text-emerald-400" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">Free cancellation for 48 hours</div>
                  <div className="text-xs text-slate-400">
                    Get a full refund if you change your mind within 48 hours of booking.
                  </div>
                </div>
              </div>
            </div>

            {/* 3. HOTEL ROOMS & SUITES SECTION */}
            <div className="space-y-6 pt-6 border-t border-slate-800/80">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-indigo-400" />
                    <h3 className="text-xl font-bold text-white">Available Rooms & Suites</h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Select your preferred room category for this stay.
                  </p>
                </div>
                <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                  {availableRooms.length} {availableRooms.length === 1 ? "Category" : "Categories"} Available
                </span>
              </div>

              {/* Room Cards List */}
              <div className="space-y-4">
                {availableRooms.map((room) => {
                  const isSelected = room.id === selectedRoomId;
                  const roomNightsSubtotal = room.pricePerNight * nights;

                  return (
                    <div
                      key={room.id}
                      className={`p-5 rounded-3xl border transition-all duration-300 flex flex-col md:flex-row gap-5 ${
                        isSelected
                          ? "bg-slate-900 border-indigo-500 shadow-xl shadow-indigo-500/10"
                          : "bg-slate-900/50 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      {/* Room Photo Thumbnail */}
                      <div
                        onClick={() => setActiveRoomModal(room)}
                        className="relative w-full md:w-56 h-44 rounded-2xl overflow-hidden bg-slate-800 shrink-0 cursor-pointer group"
                      >
                        <img
                          src={room.imageUrl || stay.imageUrl}
                          alt={room.name}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-md text-[10px] font-bold text-indigo-300 border border-indigo-500/30">
                          {room.type}
                        </div>
                        <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-md text-[10px] font-semibold text-slate-300">
                          {room.gallery?.length || 1} Photos
                        </div>
                      </div>

                      {/* Room Details Body */}
                      <div className="flex-1 flex flex-col justify-between space-y-3">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="text-base font-bold text-white hover:text-indigo-300 transition-colors">
                                {room.name}
                              </h4>
                              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-1">
                                <span>{room.bedType}</span>
                                <span>·</span>
                                <span>{room.sizeSqFt} sq ft</span>
                                <span>·</span>
                                <span>Up to {room.maxGuests} guests</span>
                              </div>
                            </div>

                            {room.mealPlan && (
                              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full shrink-0">
                                {room.mealPlan}
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-slate-300 line-clamp-2 mt-2 leading-relaxed">
                            {room.description}
                          </p>

                          {/* Room Amenities Chips */}
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {room.amenities.map((amenity, idx) => (
                              <span
                                key={idx}
                                className="px-2.5 py-0.5 rounded-lg bg-slate-950 text-[10px] font-medium text-slate-300 border border-slate-800"
                              >
                                {amenity}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Room Price & Selection Action Row */}
                        <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
                          <div>
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-lg font-black text-white">
                                {formatINR(room.pricePerNight)}
                              </span>
                              <span className="text-xs text-slate-400">/ night</span>
                              <span className="text-xs text-slate-500 line-through">
                                {formatINR(room.originalPrice)}
                              </span>
                            </div>
                            <div className="text-[11px] text-indigo-400 font-semibold mt-0.5">
                              {nights > 1
                                ? `${formatINR(roomNightsSubtotal)} for ${nights} nights`
                                : "Taxes & fees included"}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setActiveRoomModal(room)}
                              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                            >
                              Room Specs
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                if (isSelected) {
                                  handleBookingSubmit();
                                } else {
                                  setSelectedRoomId(room.id);
                                }
                              }}
                              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer ${
                                isSelected
                                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/30 flex items-center gap-1.5 hover:scale-105"
                                  : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20 hover:scale-105"
                              }`}
                            >
                              {isSelected ? (
                                <>
                                  <CreditCard className="h-3.5 w-3.5" />
                                  <span>Reserve & Pay &rarr;</span>
                                </>
                              ) : (
                                <span>Select Room</span>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Property Description */}
            <div className="space-y-3 pt-6 border-t border-slate-800/80">
              <h3 className="text-lg font-bold text-white">About this property</h3>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                {stay.description}
              </p>
            </div>

            {/* Where you'll sleep (Sleeping arrangements) */}
            <div className="space-y-4 pt-4 border-t border-slate-800/80">
              <h3 className="text-lg font-bold text-white">Where you'll sleep</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {stay.sleepingArrangements.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2"
                  >
                    <BedDouble className="h-5 w-5 text-indigo-400" />
                    <div>
                      <div className="text-sm font-bold text-white">{item.roomName}</div>
                      <div className="text-xs text-slate-400">{item.bedType}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* What this place offers (Amenities) */}
            <div className="space-y-4 pt-4 border-t border-slate-800/80">
              <h3 className="text-lg font-bold text-white">What this place offers</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {stay.amenities.map((amenity, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-sm text-slate-300 py-1">
                    <CheckCircle2 className="h-4 w-4 text-indigo-400 shrink-0" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>

              {stay.amenities.length > 6 && (
                <button
                  type="button"
                  onClick={() => setIsAllAmenitiesOpen(true)}
                  className="mt-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-semibold transition-colors"
                >
                  Show all {stay.amenities.length} amenities
                </button>
              )}
            </div>

            {/* Interactive Calendar Date Picker */}
            <div className="space-y-4 pt-4 border-t border-slate-800/80">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {nights} {nights === 1 ? "night" : "nights"} in {stay.city}
                  </h3>
                  <p className="text-xs text-slate-400">{formattedDates}</p>
                </div>
              </div>

              <div className="p-4 sm:p-6 rounded-3xl bg-slate-900/60 border border-slate-800">
                <CalendarRangePicker
                  checkIn={checkIn}
                  checkOut={checkOut}
                  onChange={(inDate, outDate) => {
                    setCheckIn(inDate);
                    setCheckOut(outDate);
                  }}
                />
              </div>
            </div>

            {/* Verified Reviews Section */}
            <div className="space-y-6 pt-6 border-t border-slate-800/80">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                <h3 className="text-xl font-black text-white">
                  {stay.rating.toFixed(2)} · {stay.reviewsCount} reviews
                </h3>
              </div>

              {/* Rating Sub-Metrics Bars */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                {[
                  { label: "Cleanliness", val: "4.9" },
                  { label: "Accuracy", val: "5.0" },
                  { label: "Communication", val: "5.0" },
                  { label: "Location", val: "4.9" },
                  { label: "Check-in", val: "5.0" },
                  { label: "Value", val: "4.8" },
                ].map((metric) => (
                  <div key={metric.label} className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/60 space-y-1">
                    <div className="text-slate-400 font-medium">{metric.label}</div>
                    <div className="text-sm font-bold text-white">{metric.val} ★</div>
                  </div>
                ))}
              </div>

              {/* Reviews List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {stay.reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={rev.avatar}
                        alt={rev.author}
                        className="h-10 w-10 rounded-xl object-cover border border-slate-700"
                      />
                      <div>
                        <div className="text-sm font-bold text-white">{rev.author}</div>
                        <div className="text-xs text-slate-400">{rev.date}</div>
                      </div>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{rev.comment}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Host Details & House Rules */}
            <div className="space-y-6 pt-6 border-t border-slate-800/80">
              <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
                <div className="flex items-center gap-4">
                  <img
                    src={stay.host.avatar}
                    alt={stay.host.name}
                    className="h-14 w-14 rounded-2xl object-cover border-2 border-indigo-500 shadow-md"
                  />
                  <div>
                    <h4 className="text-base font-bold text-white">Hosted by {stay.host.name}</h4>
                    <div className="text-xs text-slate-400">
                      Hosting for {stay.host.yearsHosting} years · Responds {stay.host.responseTime}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{stay.host.bio}</p>

                <div className="pt-3 border-t border-slate-800 flex items-center gap-6 text-xs text-slate-400">
                  <div>
                    <span className="font-bold text-white">{stay.host.responseRate}%</span> Response rate
                  </div>
                  <div>
                    <span className="font-bold text-white">{stay.host.responseTime}</span> Response time
                  </div>
                </div>
              </div>

              {/* Things to know / House Rules */}
              <div className="space-y-3">
                <h4 className="text-base font-bold text-white">Things to know</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                  {stay.houseRules.map((rule, i) => (
                    <div key={i} className="flex items-center gap-2 py-1">
                      <Clock className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                      <span>{rule}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT 1 COLUMN: Sticky Reservation Card */}
          <div className="relative">
            <div className="sticky top-28 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl shadow-black/90 p-6 space-y-6">
              {/* Top Rate Header */}
              <div className="flex items-baseline justify-between">
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-white">{formatINR(nightlyRate)}</span>
                    <span className="text-xs text-slate-400">/ night</span>
                  </div>
                  <span className="text-xs text-slate-500 line-through">
                    {formatINR(selectedRoom.originalPrice || stay.originalPrice)}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-xs font-bold text-amber-400">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span>{stay.rating.toFixed(2)}</span>
                  <span className="text-slate-500 font-normal">({stay.reviewsCount})</span>
                </div>
              </div>

              {/* Selected Room Indicator Badge */}
              <div className="p-3 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 flex items-center justify-between text-xs">
                <div>
                  <div className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">SELECTED ROOM</div>
                  <div className="font-bold text-white truncate max-w-[180px]">{selectedRoom.name}</div>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  {selectedRoom.type}
                </span>
              </div>

              {/* Booking Picker Box */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden">
                {/* Room Category Dropdown Selector */}
                <div className="p-3 border-b border-slate-800 text-left bg-slate-950/80">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1 flex items-center gap-1">
                    <Building2 className="h-3 w-3 text-indigo-400" />
                    <span>ROOM / SUITE CATEGORY</span>
                  </label>
                  <select
                    value={selectedRoomId}
                    onChange={(e) => setSelectedRoomId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-xs font-bold text-white rounded-xl px-2.5 py-2 focus:outline-none focus:border-indigo-500 cursor-pointer shadow-inner"
                  >
                    {availableRooms.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} — {formatINR(r.pricePerNight)}/night ({r.type})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Dates Selector */}
                <div className="grid grid-cols-2 divide-x divide-slate-800 border-b border-slate-800">
                  <div className="p-3 text-left">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">CHECK-IN</div>
                    <div className="text-xs font-semibold text-white truncate mt-0.5">
                      {checkIn ? checkIn : "Add date"}
                    </div>
                  </div>
                  <div className="p-3 text-left">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">CHECKOUT</div>
                    <div className="text-xs font-semibold text-white truncate mt-0.5">
                      {checkOut ? checkOut : "Add date"}
                    </div>
                  </div>
                </div>

                {/* Guests Selector */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsGuestsOpen(!isGuestsOpen)}
                    className="w-full p-3 text-left flex items-center justify-between hover:bg-slate-900 transition-colors"
                  >
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">GUESTS</div>
                      <div className="text-xs font-semibold text-white mt-0.5">
                        {totalGuests} {totalGuests === 1 ? "guest" : "guests"}
                      </div>
                    </div>
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  </button>

                  {/* Guests Dropdown Panel */}
                  {isGuestsOpen && (
                    <div className="p-4 bg-slate-900 border-t border-slate-800 space-y-4 animate-in fade-in">
                      <div className="flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-white">Adults</div>
                          <div className="text-slate-400">Age 13+</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={adults <= 1}
                            onClick={() => setAdults(Math.max(1, adults - 1))}
                            className="h-7 w-7 rounded-full border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white disabled:opacity-30"
                          >
                            -
                          </button>
                          <span className="w-5 text-center font-bold text-white">{adults}</span>
                          <button
                            type="button"
                            disabled={adults >= stay.maxGuests}
                            onClick={() => setAdults(adults + 1)}
                            className="h-7 w-7 rounded-full border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white disabled:opacity-30"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-white">Children</div>
                          <div className="text-slate-400">Ages 2–12</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={children <= 0}
                            onClick={() => setChildren(Math.max(0, children - 1))}
                            className="h-7 w-7 rounded-full border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white disabled:opacity-30"
                          >
                            -
                          </button>
                          <span className="w-5 text-center font-bold text-white">{children}</span>
                          <button
                            type="button"
                            disabled={totalGuests >= stay.maxGuests}
                            onClick={() => setChildren(children + 1)}
                            className="h-7 w-7 rounded-full border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white disabled:opacity-30"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Reserve CTA Button */}
              <button
                type="button"
                onClick={handleBookingSubmit}
                disabled={isBookingLoading}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-500 via-indigo-600 to-violet-600 hover:from-rose-400 hover:to-violet-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all hover:scale-[1.01] active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
              >
                <CreditCard className="h-4 w-4" />
                <span>Reserve {selectedRoom.name.split(" ")[0]} & Pay</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <p className="text-center text-xs text-slate-400 flex items-center justify-center gap-1.5 font-medium">
                <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" />
                <span>Pay securely via Razorpay</span>
              </p>

              {/* Price Breakdown Calculation */}
              <div className="space-y-2.5 pt-4 border-t border-slate-800 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span className="underline">
                    {formatINR(nightlyRate)} × {nights} {nights === 1 ? "night" : "nights"}
                  </span>
                  <span>{formatINR(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="underline">Cleaning fee</span>
                  <span>{formatINR(cleaning)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="underline">StaySpot service fee</span>
                  <span>{formatINR(service)}</span>
                </div>
                <div className="pt-3 border-t border-slate-800 flex justify-between text-sm font-bold text-white">
                  <span>Total before taxes</span>
                  <span className="text-indigo-400">{formatINR(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. EXPLORE SIMILAR STAYS IN THE SAME DESTINATION */}
        {otherStays.length > 0 && (
          <div className="mt-16 pt-12 border-t border-slate-800/80 space-y-6">
            <h3 className="text-xl font-bold text-white">More stays in {stay.city}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {otherStays.map((other) => (
                <Link
                  key={other.id}
                  href={`/properties/${other.id}`}
                  className="group rounded-3xl bg-slate-900/60 border border-slate-800 overflow-hidden hover:border-indigo-500/40 transition-all hover:shadow-xl flex flex-col"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-800">
                    <img
                      src={other.imageUrl}
                      alt={other.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-950/70 backdrop-blur-md text-[10px] font-bold text-white">
                      {other.tag}
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-400 font-medium">{other.location}</span>
                        <span className="flex items-center gap-1 font-bold text-amber-400">
                          <Star className="h-3.5 w-3.5 fill-amber-400" />
                          {other.rating.toFixed(2)}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                        {other.title}
                      </h4>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-sm font-black text-white">{formatINR(other.pricePerNight)} / night</span>
                      <span className="text-xs text-indigo-400 font-bold">View Property &rarr;</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* FULLSCREEN LIGHTBOX PHOTO GALLERY MODAL */}
      {isGalleryOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-4 sm:p-6 animate-in fade-in">
          {/* Top Bar */}
          <div className="flex items-center justify-between text-white">
            <span className="text-xs font-semibold text-slate-400">
              Photo {galleryIndex + 1} of {stay.gallery.length} · {stay.title}
            </span>
            <button
              type="button"
              onClick={() => setIsGalleryOpen(false)}
              className="p-2 rounded-full bg-slate-900 text-slate-300 hover:text-white"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Main Large Image with Navigation Arrows */}
          <div className="relative flex-1 flex items-center justify-center max-h-[80vh] my-auto">
            <button
              type="button"
              onClick={() =>
                setGalleryIndex((prev) => (prev - 1 + stay.gallery.length) % stay.gallery.length)
              }
              className="absolute left-2 sm:left-6 p-3 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white backdrop-blur-md transition-transform hover:scale-110"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            <img
              src={stay.gallery[galleryIndex]}
              alt={`${stay.title} fullscreen photo ${galleryIndex + 1}`}
              className="max-h-[75vh] max-w-full rounded-2xl object-contain shadow-2xl"
            />

            <button
              type="button"
              onClick={() => setGalleryIndex((prev) => (prev + 1) % stay.gallery.length)}
              className="absolute right-2 sm:right-6 p-3 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white backdrop-blur-md transition-transform hover:scale-110"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>

          {/* Bottom Thumbnails Strip */}
          <div className="flex items-center justify-center gap-2 overflow-x-auto py-2">
            {stay.gallery.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setGalleryIndex(idx)}
                className={`h-14 w-20 rounded-xl overflow-hidden border-2 transition-all ${
                  galleryIndex === idx ? "border-indigo-500 scale-105" : "border-transparent opacity-50 hover:opacity-100"
                }`}
              >
                <img src={img} alt="thumb" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ALL AMENITIES MODAL */}
      {isAllAmenitiesOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl relative max-h-[80vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setIsAllAmenitiesOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-xl font-bold text-white mb-4">What this place offers</h3>
            <div className="space-y-3">
              {stay.amenities.map((amenity, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-slate-200 py-1.5 border-b border-slate-800/60">
                  <CheckCircle2 className="h-4 w-4 text-indigo-400" />
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* INSTANT BOOKING CONFIRMATION MODAL */}
      {isBookingConfirmed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-center space-y-4 animate-in zoom-in-95">
            <div className="h-16 w-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <Check className="h-8 w-8 stroke-[3]" />
            </div>
            <h3 className="text-xl font-black text-white">Reservation Confirmed!</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Your stay at <span className="text-white font-bold">{stay.title}</span> has been confirmed for{" "}
              <span className="text-indigo-400 font-semibold">{formattedDates}</span> ({nights} {nights === 1 ? "night" : "nights"}).
            </p>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-1 text-left">
              <div className="flex justify-between text-slate-400">
                <span>Confirmation ID:</span>
                <span className="font-mono text-white">STAY-{Date.now().toString().slice(-6)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Total Amount:</span>
                <span className="font-bold text-emerald-400">{formatINR(total)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsBookingConfirmed(false)}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* DEDICATED ROOM DETAILS & GALLERY MODAL */}
      {activeRoomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl relative max-h-[85vh] overflow-y-auto space-y-5 animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20 uppercase tracking-wider">
                  {activeRoomModal.type} Category
                </span>
                <h3 className="text-xl font-bold text-white mt-1">{activeRoomModal.name}</h3>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                  <span>{activeRoomModal.bedType}</span>
                  <span>·</span>
                  <span>{activeRoomModal.sizeSqFt} sq ft</span>
                  <span>·</span>
                  <span>Max {activeRoomModal.maxGuests} Guests</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveRoomModal(null)}
                className="p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Room Photo */}
            <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-slate-800 shadow-md">
              <img
                src={activeRoomModal.imageUrl || stay.imageUrl}
                alt={activeRoomModal.name}
                className="h-full w-full object-cover"
              />
            </div>

            {/* Room Description */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">About This Room</h4>
              <p className="text-xs text-slate-300 leading-relaxed">{activeRoomModal.description}</p>
            </div>

            {/* Room Amenities Grid */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Room Amenities & Features</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {activeRoomModal.amenities.map((amenity, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center gap-2 text-xs text-slate-200"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                    <span className="truncate">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing & Selection Footer */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-4">
              <div>
                <div className="text-base sm:text-lg font-black text-white">
                  {formatINR(activeRoomModal.pricePerNight)}{" "}
                  <span className="text-xs font-normal text-slate-400">/ night</span>
                </div>
                <span className="text-[11px] text-emerald-400 font-semibold">
                  {activeRoomModal.mealPlan || "Free Breakfast Included"}
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedRoomId(activeRoomModal.id);
                  setActiveRoomModal(null);
                }}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg ${
                  selectedRoomId === activeRoomModal.id
                    ? "bg-emerald-600 text-white shadow-emerald-600/30"
                    : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30 hover:scale-105"
                }`}
              >
                {selectedRoomId === activeRoomModal.id ? "Selected for Stay ✓" : "Choose This Room"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Razorpay Interactive Booking & Payment Modal */}
      <RazorpayBookingModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        stay={stay}
        selectedRoom={selectedRoom}
        checkIn={checkIn || "2026-08-28"}
        checkOut={checkOut || "2026-08-30"}
        guestsCount={totalGuests}
        nightsCount={nights}
        totalBeforeTaxes={total}
        grandTotal={total + Math.round(total * 0.12)}
        userEmail={user?.emailAddresses?.[0]?.emailAddress || ""}
        userName={user?.fullName || user?.firstName || ""}
      />
    </div>
  );
}
