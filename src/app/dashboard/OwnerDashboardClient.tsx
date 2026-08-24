"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  Shield,
  Plus,
  Sparkles,
  Calendar,
  DollarSign,
  TrendingUp,
  Users,
  MapPin,
  Star,
  CheckCircle2,
  Trash2,
  ExternalLink,
  Edit3,
  Image as ImageIcon,
  Flame,
  Sun,
  PartyPopper,
  Zap,
  Bed,
  Bath,
  ArrowRight,
  Loader2,
  AlertCircle,
  Clock,
  Heart,
  SlidersHorizontal,
  Search,
  Filter,
} from "lucide-react";
import { Stay, formatINR, ALL_STAYS, getAllStays } from "@/data/stays";
import ImageUpload from "@/components/ui/ImageUpload";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  imageUrl: string;
  role: string;
}

interface OwnerDashboardClientProps {
  user: UserProfile;
}

const AVAILABLE_AMENITIES = [
  "Private Pool",
  "Sea View",
  "Jacuzzi",
  "High-Speed Wi-Fi",
  "Dedicated Workspace",
  "Kitchen",
  "Air Conditioning",
  "Chef on Demand",
  "Balcony",
  "Elevator",
  "Free Parking",
  "Security System",
  "BBQ Grill",
  "Mountain Panorama",
  "Heated Rooms",
  "Garden Patio",
  "Daily Breakfast",
  "Pet Friendly",
];

const POPULAR_CITIES = [
  "Goa",
  "Mumbai",
  "Bengaluru",
  "Manali",
  "Jaipur",
  "Kerala",
  "Udaipur",
  "Delhi NCR",
  "Ooty",
  "Rishikesh",
];

const HOLIDAY_PRESETS = [
  { name: "Diwali Festival Week", dates: "Oct 28 – Nov 4, 2026", surgePercent: 35 },
  { name: "Christmas & New Year Bash", dates: "Dec 22, 2026 – Jan 5, 2027", surgePercent: 50 },
  { name: "Independence Long Weekend", dates: "Aug 14 – Aug 18, 2026", surgePercent: 25 },
  { name: "Holi Spring Getaway", dates: "Mar 20 – Mar 25, 2027", surgePercent: 20 },
];

export default function OwnerDashboardClient({ user }: OwnerDashboardClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"overview" | "properties" | "create" | "holidays" | "bookings">("overview");

  const [propertiesList, setPropertiesList] = useState<Stay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("all");

  // Form State for "Create Property / Villa"
  const [formStep, setFormStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [publishedStay, setPublishedStay] = useState<Stay | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    type: "VILLA" as "VILLA" | "HOTEL" | "APARTMENT" | "HOMESTAY" | "RESORT",
    category: "villas" as "villas" | "beachfront" | "mountains" | "hotels" | "apartments" | "nature" | "tropical" | "glamping",
    city: "Goa",
    address: "",
    state: "Goa",
    tag: "",
    description: "",
    pricePerNight: 8500,
    originalPrice: 10500,
    holidaySurgePrice: 11999,
    isHolidayAvailable: true,
    selectedHolidayPresets: ["Diwali Festival Week", "Christmas & New Year Bash"],
    maxGuests: 6,
    bedrooms: 3,
    beds: 3,
    bathrooms: 3,
    amenities: ["Private Pool", "Sea View", "High-Speed Wi-Fi", "Air Conditioning", "Kitchen"] as string[],
    gallery: [] as string[],
    checkInTime: "2:00 PM",
    checkOutTime: "11:00 AM",
    isInstantBook: true,
    houseRules: [
      "Check-in: 2:00 PM – 10:00 PM",
      "Checkout: 11:00 AM",
      "No smoking indoors",
      "Quiet hours after 10:30 PM",
    ],
  });

  // Fetch properties
  const fetchProperties = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/properties?mine=true");
      if (res.ok) {
        const data = await res.json();
        setPropertiesList(data.properties || []);
      } else {
        setPropertiesList(getAllStays());
      }
    } catch (err) {
      console.error("Failed to load properties:", err);
      setPropertiesList(getAllStays());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleAmenityToggle = (amenity: string) => {
    if (formData.amenities.includes(amenity)) {
      setFormData({
        ...formData,
        amenities: formData.amenities.filter((a) => a !== amenity),
      });
    } else {
      setFormData({
        ...formData,
        amenities: [...formData.amenities, amenity],
      });
    }
  };

  const handleHolidayPresetToggle = (presetName: string) => {
    if (formData.selectedHolidayPresets.includes(presetName)) {
      setFormData({
        ...formData,
        selectedHolidayPresets: formData.selectedHolidayPresets.filter((p) => p !== presetName),
      });
    } else {
      setFormData({
        ...formData,
        selectedHolidayPresets: [...formData.selectedHolidayPresets, presetName],
      });
    }
  };

  const handleDeleteProperty = async (id: string) => {
    if (!confirm("Are you sure you want to remove this property listing?")) return;

    try {
      const res = await fetch(`/api/properties?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setPropertiesList((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete property:", err);
    }
  };

  const handleSubmitProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!formData.title.trim()) {
      setSubmitError("Please enter a title for your property.");
      return;
    }
    if (!formData.city.trim()) {
      setSubmitError("Please specify the destination city.");
      return;
    }
    if (formData.gallery.length === 0) {
      setSubmitError("Please upload at least 1 photo for your property.");
      return;
    }

    try {
      setIsSubmitting(true);

      const holidayPricing = formData.selectedHolidayPresets.map((presetName) => {
        const preset = HOLIDAY_PRESETS.find((h) => h.name === presetName);
        return {
          holidayName: presetName,
          startDate: "2026-10-28",
          endDate: "2026-11-04",
          holidayPrice: formData.holidaySurgePrice,
        };
      });

      const res = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          holidayPricing,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to publish property");
      }

      setPublishedStay(data.property);
      setPropertiesList((prev) => [data.property, ...prev]);
    } catch (err: any) {
      console.error("Submission failed:", err);
      setSubmitError(err.message || "Failed to publish property");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setPublishedStay(null);
    setFormStep(1);
    setFormData({
      title: "",
      type: "VILLA",
      category: "villas",
      city: "Goa",
      address: "",
      state: "Goa",
      tag: "",
      description: "",
      pricePerNight: 8500,
      originalPrice: 10500,
      holidaySurgePrice: 11999,
      isHolidayAvailable: true,
      selectedHolidayPresets: ["Diwali Festival Week", "Christmas & New Year Bash"],
      maxGuests: 6,
      bedrooms: 3,
      beds: 3,
      bathrooms: 3,
      amenities: ["Private Pool", "Sea View", "High-Speed Wi-Fi", "Air Conditioning", "Kitchen"],
      gallery: [],
      checkInTime: "2:00 PM",
      checkOutTime: "11:00 AM",
      isInstantBook: true,
      houseRules: [
        "Check-in: 2:00 PM – 10:00 PM",
        "Checkout: 11:00 AM",
        "No smoking indoors",
        "Quiet hours after 10:30 PM",
      ],
    });
  };

  const filteredProperties = propertiesList.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategoryFilter === "all" || p.category === selectedCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      {/* 1. TOP HERO BANNER & HOST HEADER */}
      <div className="border-b border-slate-800/80 bg-gradient-to-b from-slate-900/90 to-slate-950/95 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={
                    user.imageUrl ||
                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"
                  }
                  alt={user.name}
                  className="h-16 w-16 rounded-2xl object-cover border-2 border-indigo-500 shadow-xl"
                />
                <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-indigo-600 flex items-center justify-center text-white border-2 border-slate-950 shadow">
                  {user.role === "ADMIN" ? <Shield className="h-3.5 w-3.5" /> : <Building2 className="h-3.5 w-3.5" />}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {user.name}
                  </h1>
                  <span
                    className={`px-3 py-0.5 rounded-full text-xs font-black uppercase tracking-wider ${
                      user.role === "ADMIN"
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                        : "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                    }`}
                  >
                    {user.role === "ADMIN" ? "Admin Console" : "Verified Host"}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {user.email} · Host & Property Management Portal
                </p>
              </div>
            </div>

            {/* Quick Action Button */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setActiveTab("create");
                }}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-rose-500 via-indigo-600 to-violet-600 hover:from-rose-400 hover:to-violet-500 text-white font-bold text-xs shadow-xl shadow-indigo-600/25 flex items-center gap-2 transition-all hover:scale-105"
              >
                <Plus className="h-4 w-4" />
                <span>List New Property / Villa</span>
              </button>
            </div>
          </div>

          {/* DASHBOARD NAVIGATION TABS */}
          <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto pt-8 border-t border-slate-800/80 mt-8 scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveTab("overview")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                activeTab === "overview"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <TrendingUp className="h-4 w-4" />
              <span>Overview</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("properties")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                activeTab === "properties"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <Building2 className="h-4 w-4" />
              <span>My Properties ({propertiesList.length})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                resetForm();
                setActiveTab("create");
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                activeTab === "create"
                  ? "bg-gradient-to-r from-rose-500 to-indigo-600 text-white shadow-lg shadow-rose-500/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <Plus className="h-4 w-4" />
              <span>+ List New Stay</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("holidays")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                activeTab === "holidays"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <PartyPopper className="h-4 w-4 text-amber-400" />
              <span>Holiday Pricing</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("bookings")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                activeTab === "bookings"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <Calendar className="h-4 w-4" />
              <span>Bookings (14)</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. TAB CONTENTS */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ========================================================================= */}
        {/* TAB 1: OVERVIEW & METRICS */}
        {/* ========================================================================= */}
        {activeTab === "overview" && (
          <div className="space-y-8 animate-in fade-in">
            {/* Stat Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800/80 relative overflow-hidden shadow-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-400">Total Listed Properties</span>
                  <div className="h-9 w-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                    <Building2 className="h-4 w-4" />
                  </div>
                </div>
                <div className="text-3xl font-black text-white">{propertiesList.length}</div>
                <div className="text-[11px] text-emerald-400 font-semibold mt-1 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>All Active & Bookable</span>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800/80 relative overflow-hidden shadow-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-400">Holiday Peak Bookings</span>
                  <div className="h-9 w-9 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
                    <Flame className="h-4 w-4" />
                  </div>
                </div>
                <div className="text-3xl font-black text-white">42 Nights</div>
                <div className="text-[11px] text-rose-400 font-semibold mt-1 flex items-center gap-1">
                  <span>+18% Diwali & New Year Surge</span>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800/80 relative overflow-hidden shadow-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-400">Estimated Revenue</span>
                  <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <DollarSign className="h-4 w-4" />
                  </div>
                </div>
                <div className="text-3xl font-black text-white">₹3,48,500</div>
                <div className="text-[11px] text-emerald-400 font-semibold mt-1">
                  Direct Payout to Bank
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800/80 relative overflow-hidden shadow-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-400">Average Occupancy</span>
                  <div className="h-9 w-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <Sun className="h-4 w-4" />
                  </div>
                </div>
                <div className="text-3xl font-black text-white">92%</div>
                <div className="text-[11px] text-amber-300 font-semibold mt-1">
                  High Holiday Demand
                </div>
              </div>
            </div>

            {/* Quick Actions & Recent Listings Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">Featured Live Properties</h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab("properties")}
                    className="text-xs text-indigo-400 font-bold hover:underline"
                  >
                    View All &rarr;
                  </button>
                </div>

                <div className="space-y-3">
                  {propertiesList.slice(0, 4).map((stay) => (
                    <div
                      key={stay.id}
                      className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between gap-4 hover:border-indigo-500/40 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={stay.imageUrl}
                          alt={stay.title}
                          className="h-16 w-20 rounded-xl object-cover bg-slate-800 shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                              LIVE
                            </span>
                            <span className="text-xs text-slate-400">{stay.location}</span>
                          </div>
                          <h4 className="text-sm font-bold text-white mt-0.5 line-clamp-1">
                            {stay.title}
                          </h4>
                          <div className="text-xs font-semibold text-slate-300 mt-1">
                            {formatINR(stay.pricePerNight)} / night ·{" "}
                            <span className="text-rose-400">
                              Holiday: {formatINR(stay.holidaySurgePrice || Math.round(stay.pricePerNight * 1.4))}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Link
                          href={`/properties/${stay.id}`}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                          title="View on site"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Holiday Surge Callout Box */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-rose-950/40 via-indigo-950/40 to-slate-900 border border-rose-500/20 space-y-4 shadow-xl">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
                  <PartyPopper className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-base font-black text-white">Upcoming Holiday Surge</h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Diwali and Christmas season searches are up <span className="font-bold text-amber-300">240%</span>.
                    Ensure your villas and penthouses have updated holiday surge pricing and Cloudinary photos.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("holidays")}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-indigo-600 hover:from-rose-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-rose-500/20 transition-all"
                >
                  Configure Holiday Rates &rarr;
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: MY PROPERTIES & ROOMS */}
        {/* ========================================================================= */}
        {activeTab === "properties" && (
          <div className="space-y-6 animate-in fade-in">
            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search your listings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
                {["all", "villas", "beachfront", "apartments", "hotels", "mountains"].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-colors ${
                      selectedCategoryFilter === cat
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Properties Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProperties.map((stay) => (
                <div
                  key={stay.id}
                  className="group rounded-3xl bg-slate-900/70 border border-slate-800/80 overflow-hidden flex flex-col justify-between shadow-xl hover:border-indigo-500/40 transition-all duration-300"
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-800">
                    <img
                      src={stay.imageUrl}
                      alt={stay.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                      <span className="px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-[10px] font-bold text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>Active</span>
                      </span>
                      {stay.isHolidayAvailable && (
                        <span className="px-2.5 py-1 rounded-full bg-rose-500/80 backdrop-blur-md text-[10px] font-bold text-white shadow flex items-center gap-1">
                          <PartyPopper className="h-3 w-3" />
                          <span>Holiday Ready</span>
                        </span>
                      )}
                    </div>

                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-[10px] font-bold text-white border border-white/10">
                      {stay.gallery.length} Photos
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-400 font-medium flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-rose-400" />
                          {stay.location}
                        </span>
                        <span className="flex items-center gap-1 font-bold text-amber-400">
                          <Star className="h-3.5 w-3.5 fill-amber-400" />
                          {stay.rating.toFixed(2)}
                        </span>
                      </div>

                      <h3 className="font-bold text-base text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                        {stay.title}
                      </h3>

                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-2">
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          {stay.maxGuests} guests
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Bed className="h-3.5 w-3.5" />
                          {stay.bedrooms} beds
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Bath className="h-3.5 w-3.5" />
                          {stay.bathrooms} baths
                        </span>
                      </div>
                    </div>

                    {/* Pricing & Actions */}
                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                      <div>
                        <div className="text-base font-black text-white">
                          {formatINR(stay.pricePerNight)}{" "}
                          <span className="text-xs font-normal text-slate-400">/ night</span>
                        </div>
                        <div className="text-[11px] font-semibold text-rose-400">
                          Holiday rate: {formatINR(stay.holidaySurgePrice || Math.round(stay.pricePerNight * 1.4))}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          href={`/properties/${stay.id}`}
                          className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow transition-colors flex items-center gap-1"
                        >
                          <span>View</span>
                          <ExternalLink className="h-3 w-3" />
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleDeleteProperty(stay.id)}
                          className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-600 text-slate-400 hover:text-white transition-colors"
                          title="Delete listing"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: LIST NEW PROPERTY / VILLA WIZARD */}
        {/* ========================================================================= */}
        {activeTab === "create" && (
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in">
            {publishedStay ? (
              /* Success Confirmation Card */
              <div className="p-8 sm:p-12 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl text-center space-y-6">
                <div className="h-20 w-20 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-xl">
                  <CheckCircle2 className="h-10 w-10 stroke-[2.5]" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl sm:text-3xl font-black text-white">
                    Property Listed Successfully!
                  </h2>
                  <p className="text-sm text-slate-400 max-w-md mx-auto">
                    Your listing <span className="text-white font-bold">{publishedStay.title}</span> is now active,
                    synchronized with Cloudinary galleries, and ready for holiday bookings.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                  <Link
                    href={`/properties/${publishedStay.id}`}
                    className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all hover:scale-105"
                  >
                    <span>View Live Property Page</span>
                    <ExternalLink className="h-4 w-4" />
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      resetForm();
                      setActiveTab("properties");
                    }}
                    className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
                  >
                    Manage All Listings
                  </button>
                </div>
              </div>
            ) : (
              /* Main Wizard Form */
              <form onSubmit={handleSubmitProperty} className="space-y-8">
                {/* Wizard Steps Indicator */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                  {[
                    { step: 1, label: "1. Basics" },
                    { step: 2, label: "2. Location" },
                    { step: 3, label: "3. Specs" },
                    { step: 4, label: "4. Holiday Rates" },
                    { step: 5, label: "5. Photos" },
                    { step: 6, label: "6. Amenities" },
                  ].map((s) => (
                    <button
                      key={s.step}
                      type="button"
                      onClick={() => setFormStep(s.step)}
                      className={`text-xs font-bold transition-colors ${
                        formStep === s.step
                          ? "text-indigo-400 font-extrabold underline underline-offset-4"
                          : formStep > s.step
                          ? "text-emerald-400"
                          : "text-slate-500"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>

                {submitError && (
                  <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
                    <span>{submitError}</span>
                  </div>
                )}

                {/* STEP 1: PROPERTY IDENTITY & TYPE */}
                {formStep === 1 && (
                  <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-6 animate-in fade-in">
                    <div>
                      <h3 className="text-xl font-bold text-white">Property Overview</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Define your stay name, category, and theme.</p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1.5">
                          Property Title *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Royal Horizon Glass Villa & Private Pool"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1.5">
                            Property Type
                          </label>
                          <select
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                            className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
                          >
                            <option value="VILLA">Luxury Villa</option>
                            <option value="HOTEL">Boutique Hotel</option>
                            <option value="APARTMENT">City Penthouse / Apartment</option>
                            <option value="HOMESTAY">Heritage Homestay</option>
                            <option value="RESORT">Beachfront Resort</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1.5">
                            Category Tab
                          </label>
                          <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                            className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
                          >
                            <option value="villas">Luxury Villas</option>
                            <option value="beachfront">Beachfront</option>
                            <option value="mountains">Mountain Cabins</option>
                            <option value="hotels">Boutique Hotels</option>
                            <option value="apartments">City Apartments</option>
                            <option value="nature">Treehouses & Nature</option>
                            <option value="tropical">Tropical & Islands</option>
                            <option value="glamping">Glamping & Tents</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1.5">
                          Highlights Tagline
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Private Pool · Arabian Sea Sunset Views"
                          value={formData.tag}
                          onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                          className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1.5">
                          Detailed Description
                        </label>
                        <textarea
                          rows={4}
                          placeholder="Describe the architectural highlights, private views, amenities, and holiday atmosphere..."
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-4">
                      <button
                        type="button"
                        onClick={() => setFormStep(2)}
                        className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg transition-all"
                      >
                        Next: Location &rarr;
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 2: LOCATION & DESTINATION */}
                {formStep === 2 && (
                  <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-6 animate-in fade-in">
                    <div>
                      <h3 className="text-xl font-bold text-white">Location & Destination</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Where is your property located?</p>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1.5">
                            City / Destination *
                          </label>
                          <select
                            value={formData.city}
                            onChange={(e) => {
                              const cityVal = e.target.value;
                              let stateVal = "Maharashtra";
                              if (cityVal === "Goa") stateVal = "Goa";
                              if (cityVal === "Manali") stateVal = "Himachal Pradesh";
                              if (cityVal === "Jaipur" || cityVal === "Udaipur") stateVal = "Rajasthan";
                              if (cityVal === "Bengaluru") stateVal = "Karnataka";
                              if (cityVal === "Kerala") stateVal = "Kerala";
                              if (cityVal === "Ooty") stateVal = "Tamil Nadu";
                              if (cityVal === "Rishikesh") stateVal = "Uttarakhand";
                              setFormData({ ...formData, city: cityVal, state: stateVal });
                            }}
                            className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
                          >
                            {POPULAR_CITIES.map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1.5">
                            State / Province
                          </label>
                          <input
                            type="text"
                            value={formData.state}
                            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                            className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1.5">
                          Neighborhood Address / Landmark
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Vagator Cliff Road, North Goa"
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div className="flex justify-between pt-4">
                      <button
                        type="button"
                        onClick={() => setFormStep(1)}
                        className="px-5 py-2.5 rounded-2xl bg-slate-800 text-slate-300 text-xs font-bold"
                      >
                        &larr; Back
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormStep(3)}
                        className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg transition-all"
                      >
                        Next: Specs & Capacity &rarr;
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3: SPECS & CAPACITY */}
                {formStep === 3 && (
                  <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-6 animate-in fade-in">
                    <div>
                      <h3 className="text-xl font-bold text-white">Space & Accommodation Specs</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Guests capacity and bedroom layout.</p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1.5">Max Guests</label>
                        <input
                          type="number"
                          min={1}
                          max={30}
                          value={formData.maxGuests}
                          onChange={(e) => setFormData({ ...formData, maxGuests: Number(e.target.value) })}
                          className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1.5">Bedrooms</label>
                        <input
                          type="number"
                          min={1}
                          max={20}
                          value={formData.bedrooms}
                          onChange={(e) => setFormData({ ...formData, bedrooms: Number(e.target.value) })}
                          className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1.5">Total Beds</label>
                        <input
                          type="number"
                          min={1}
                          max={30}
                          value={formData.beds}
                          onChange={(e) => setFormData({ ...formData, beds: Number(e.target.value) })}
                          className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1.5">Bathrooms</label>
                        <input
                          type="number"
                          min={1}
                          max={20}
                          value={formData.bathrooms}
                          onChange={(e) => setFormData({ ...formData, bathrooms: Number(e.target.value) })}
                          className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div className="flex justify-between pt-4">
                      <button
                        type="button"
                        onClick={() => setFormStep(2)}
                        className="px-5 py-2.5 rounded-2xl bg-slate-800 text-slate-300 text-xs font-bold"
                      >
                        &larr; Back
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormStep(4)}
                        className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg transition-all"
                      >
                        Next: Holiday Rates &rarr;
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 4: HOLIDAY BOOKING & PRICING */}
                {formStep === 4 && (
                  <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-6 animate-in fade-in">
                    <div>
                      <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <PartyPopper className="h-5 w-5 text-amber-400" />
                        <span>Holiday & Base Pricing</span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Set standard rates and holiday surge pricing for peak seasons.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1.5">
                          Base Price / Night (₹) *
                        </label>
                        <input
                          type="number"
                          min={500}
                          value={formData.pricePerNight}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setFormData({
                              ...formData,
                              pricePerNight: val,
                              originalPrice: Math.round(val * 1.25),
                              holidaySurgePrice: Math.round(val * 1.4),
                            });
                          }}
                          className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-sm font-bold text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1.5">
                          Original Price / Strike (₹)
                        </label>
                        <input
                          type="number"
                          value={formData.originalPrice}
                          onChange={(e) => setFormData({ ...formData, originalPrice: Number(e.target.value) })}
                          className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-rose-400 mb-1.5 flex items-center gap-1">
                          <Flame className="h-3.5 w-3.5" />
                          <span>Holiday Surge Rate (₹)</span>
                        </label>
                        <input
                          type="number"
                          value={formData.holidaySurgePrice}
                          onChange={(e) => setFormData({ ...formData, holidaySurgePrice: Number(e.target.value) })}
                          className="w-full px-4 py-3 rounded-2xl bg-rose-950/20 border border-rose-500/40 text-sm font-bold text-rose-300 focus:outline-none focus:border-rose-400"
                        />
                      </div>
                    </div>

                    {/* Holiday Season Presets */}
                    <div className="space-y-3 pt-2">
                      <label className="block text-xs font-bold text-slate-300">
                        Enable for Upcoming Holiday Seasons:
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {HOLIDAY_PRESETS.map((preset) => {
                          const isSelected = formData.selectedHolidayPresets.includes(preset.name);
                          return (
                            <div
                              key={preset.name}
                              onClick={() => handleHolidayPresetToggle(preset.name)}
                              className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                                isSelected
                                  ? "bg-rose-950/30 border-rose-500/50 text-white"
                                  : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                              }`}
                            >
                              <div>
                                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                                  <PartyPopper className="h-3.5 w-3.5 text-amber-400" />
                                  <span>{preset.name}</span>
                                </div>
                                <div className="text-[11px] text-slate-400 mt-0.5">{preset.dates}</div>
                              </div>
                              <span className="text-xs font-bold text-rose-400">+{preset.surgePercent}%</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex justify-between pt-4">
                      <button
                        type="button"
                        onClick={() => setFormStep(3)}
                        className="px-5 py-2.5 rounded-2xl bg-slate-800 text-slate-300 text-xs font-bold"
                      >
                        &larr; Back
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormStep(5)}
                        className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg transition-all"
                      >
                        Next: Photos & Cloudinary &rarr;
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 5: PHOTO GALLERY (CLOUDINARY) */}
                {formStep === 5 && (
                  <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-6 animate-in fade-in">
                    <div>
                      <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <ImageIcon className="h-5 w-5 text-indigo-400" />
                        <span>Cloudinary Image Upload</span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Upload high-resolution photos of the villa, master bedrooms, views, and bathrooms.
                      </p>
                    </div>

                    <ImageUpload
                      value={formData.gallery}
                      onChange={(urls) => setFormData({ ...formData, gallery: urls })}
                      folder="room-bookings/hotels"
                      maxFiles={8}
                      label="Property & Room Photos"
                      description="Drag and drop high-res pictures. First photo will be the main Cover Photo."
                    />

                    <div className="flex justify-between pt-4">
                      <button
                        type="button"
                        onClick={() => setFormStep(4)}
                        className="px-5 py-2.5 rounded-2xl bg-slate-800 text-slate-300 text-xs font-bold"
                      >
                        &larr; Back
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormStep(6)}
                        className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg transition-all"
                      >
                        Next: Amenities & Publish &rarr;
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 6: AMENITIES & PUBLISH */}
                {formStep === 6 && (
                  <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-6 animate-in fade-in">
                    <div>
                      <h3 className="text-xl font-bold text-white">Select Amenities & Rules</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Highlight what makes your stay unforgettable.</p>
                    </div>

                    <div className="space-y-4">
                      <label className="block text-xs font-bold text-slate-300">Popular Amenities:</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                        {AVAILABLE_AMENITIES.map((amenity) => {
                          const isChecked = formData.amenities.includes(amenity);
                          return (
                            <button
                              key={amenity}
                              type="button"
                              onClick={() => handleAmenityToggle(amenity)}
                              className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all flex items-center gap-2 ${
                                isChecked
                                  ? "bg-indigo-600/20 border-indigo-500 text-white shadow-sm"
                                  : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
                              }`}
                            >
                              <CheckCircle2
                                className={`h-4 w-4 shrink-0 ${isChecked ? "text-indigo-400" : "text-slate-600"}`}
                              />
                              <span className="truncate">{amenity}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1.5">Check-in Time</label>
                        <input
                          type="text"
                          value={formData.checkInTime}
                          onChange={(e) => setFormData({ ...formData, checkInTime: e.target.value })}
                          className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1.5">Checkout Time</label>
                        <input
                          type="text"
                          value={formData.checkOutTime}
                          onChange={(e) => setFormData({ ...formData, checkOutTime: e.target.value })}
                          className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div className="flex justify-between pt-6 border-t border-slate-800">
                      <button
                        type="button"
                        onClick={() => setFormStep(5)}
                        className="px-5 py-2.5 rounded-2xl bg-slate-800 text-slate-300 text-xs font-bold"
                      >
                        &larr; Back
                      </button>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 via-indigo-600 to-violet-600 hover:from-rose-400 hover:to-violet-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all hover:scale-105 flex items-center gap-2 disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Publishing to StaySpot...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4" />
                            <span>Publish Holiday Listing</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </form>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: HOLIDAY & SEASONAL PRICING CALENDAR */}
        {/* ========================================================================= */}
        {activeTab === "holidays" && (
          <div className="space-y-6 animate-in fade-in">
            <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <PartyPopper className="h-5 w-5 text-amber-400" />
                    <span>Seasonal & Holiday Surge Calendar</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Activate dynamic multipliers during nationwide holidays to maximize earnings.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {HOLIDAY_PRESETS.map((preset) => (
                  <div
                    key={preset.name}
                    className="p-5 rounded-2xl bg-slate-950 border border-slate-800/90 flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-black text-white">{preset.name}</span>
                        <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold">
                          +{preset.surgePercent}% Surge
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-indigo-400" />
                        <span>{preset.dates}</span>
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-900 text-xs">
                      <span className="text-slate-400">Status: <span className="text-emerald-400 font-bold">Active for all listings</span></span>
                      <span className="text-indigo-400 font-bold">Configured</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: BOOKINGS & RESERVATIONS */}
        {/* ========================================================================= */}
        {activeTab === "bookings" && (
          <div className="space-y-6 animate-in fade-in">
            <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white">Upcoming Guest Bookings</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Recent holiday reservations across your properties.</p>
                </div>
              </div>

              <div className="divide-y divide-slate-800/80">
                {[
                  {
                    guest: "Aarav Sharma",
                    stay: "Skyline Glass Penthouse Suite",
                    city: "Mumbai",
                    dates: "Oct 28 – Nov 2, 2026 (Diwali)",
                    guests: 4,
                    amount: "₹49,995",
                    status: "Confirmed",
                  },
                  {
                    guest: "Neha Rastogi",
                    stay: "Azure Horizon Cliffside Villa",
                    city: "Goa",
                    dates: "Dec 24 – Dec 29, 2026 (Christmas)",
                    guests: 6,
                    amount: "₹59,995",
                    status: "Confirmed",
                  },
                  {
                    guest: "Karan Patel",
                    stay: "Portuguese Colonial Heritage Estate",
                    city: "Goa",
                    dates: "Dec 30, 2026 – Jan 3, 2027 (New Year)",
                    guests: 8,
                    amount: "₹71,994",
                    status: "Confirmed",
                  },
                ].map((item, idx) => (
                  <div key={idx} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="text-sm font-bold text-white">{item.guest}</div>
                      <div className="text-xs text-slate-300 font-medium mt-0.5">
                        {item.stay} · {item.city}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                        <Calendar className="h-3 w-3 text-indigo-400" />
                        <span>{item.dates}</span>
                        <span>·</span>
                        <span>{item.guests} guests</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm font-black text-emerald-400">{item.amount}</div>
                        <div className="text-[10px] text-slate-400">Total Paid</div>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
