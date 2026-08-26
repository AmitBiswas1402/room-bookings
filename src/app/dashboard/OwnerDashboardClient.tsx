"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
  Pencil,
  Image as ImageIcon,
  Flame,
  Sun,
  PartyPopper,
  Zap,
  Bed,
  BedDouble,
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
import { Stay, HotelRoom, formatINR, ALL_STAYS, getAllStays } from "@/data/stays";
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
  const searchParams = useSearchParams();
  const tabQuery = searchParams.get("tab") as any;

  const [activeTab, setActiveTab] = useState<"overview" | "properties" | "create" | "holidays" | "bookings">(
    tabQuery && ["overview", "properties", "create", "holidays", "bookings"].includes(tabQuery)
      ? tabQuery
      : "overview"
  );

  const [editingPropertyId, setEditingPropertyId] = useState<string | null>(null);

  useEffect(() => {
    if (tabQuery && ["overview", "properties", "create", "holidays", "bookings"].includes(tabQuery)) {
      setActiveTab(tabQuery);
    }
  }, [tabQuery]);

  const [propertiesList, setPropertiesList] = useState<Stay[]>([]);
  const [bookingsList, setBookingsList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("all");

  // Form State for "Create / Edit Property"
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
    rooms: [
      {
        id: "room-1",
        name: "Deluxe King Suite",
        type: "Deluxe" as const,
        description: "Spacious master bedroom with plush King bed, luxury bath, and scenic balcony view.",
        maxGuests: 2,
        bedType: "1 King Bed",
        bedsCount: 1,
        sizeSqFt: 450,
        pricePerNight: 8500,
        originalPrice: 10500,
        holidayPrice: 11999,
        totalUnits: 2,
        imageUrl: "",
        gallery: [] as string[],
        amenities: ["Air Conditioning", "High-Speed Wi-Fi", "Smart TV", "Bathtub", "Balcony", "Tea/Coffee Maker"],
        mealPlan: "Free Breakfast Included" as const,
      },
    ] as HotelRoom[],
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

  const handleAddRoom = () => {
    const newRoom: HotelRoom = {
      id: `room-${Date.now().toString().slice(-4)}`,
      name: `Room Category ${formData.rooms.length + 1}`,
      type: "Deluxe",
      description: "Comfortable private room with king bed, ensuite bath, and luxury amenities.",
      maxGuests: 2,
      bedType: "1 King Bed",
      bedsCount: 1,
      sizeSqFt: 420,
      pricePerNight: formData.pricePerNight || 5500,
      originalPrice: Math.round((formData.pricePerNight || 5500) * 1.25),
      holidayPrice: Math.round((formData.pricePerNight || 5500) * 1.4),
      totalUnits: 2,
      imageUrl: "",
      gallery: [],
      amenities: ["Air Conditioning", "High-Speed Wi-Fi", "Smart TV", "Bathtub", "Balcony"],
      mealPlan: "Free Breakfast Included",
    };
    setFormData({ ...formData, rooms: [...formData.rooms, newRoom] });
  };

  const handleUpdateRoom = (index: number, field: keyof HotelRoom, value: any) => {
    const updated = [...formData.rooms];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, rooms: updated });
  };

  const handleRemoveRoom = (index: number) => {
    if (formData.rooms.length <= 1) return;
    const updated = formData.rooms.filter((_, i) => i !== index);
    setFormData({ ...formData, rooms: updated });
  };

  // Fetch properties
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("/api/properties");
        const data = await res.json();
        if (data.success && Array.isArray(data.properties)) {
          setPropertiesList(data.properties);
        }
      } catch (err) {
        console.error("Failed to load properties:", err);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchBookings = async () => {
      try {
        const res = await fetch("/api/bookings");
        const data = await res.json();
        if (data.success && Array.isArray(data.bookings)) {
          setBookingsList(data.bookings);
        }
      } catch (err) {
        console.error("Failed to load bookings:", err);
      }
    };

    fetchProperties();
    fetchBookings();
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

  // Check URL editId query param and auto-open edit mode
  const editIdQuery = searchParams.get("editId");
  useEffect(() => {
    if (editIdQuery && propertiesList.length > 0) {
      const match = propertiesList.find(
        (p) =>
          p.id.toLowerCase() === editIdQuery.toLowerCase() ||
          p.id.toLowerCase().replace(/[^a-z0-9]/g, "") === editIdQuery.toLowerCase().replace(/[^a-z0-9]/g, "") ||
          p.title.toLowerCase().includes(editIdQuery.toLowerCase())
      );
      if (match) {
        handleStartEdit(match);
      }
    }
  }, [editIdQuery, propertiesList]);

  const handleStartEdit = (stay: Stay) => {
    setEditingPropertyId(stay.id);
    setPublishedStay(null);
    setFormStep(1);
    setActiveTab("create");
    setFormData({
      title: stay.title,
      type: (stay.propertyType || "VILLA") as any,
      category: stay.category,
      city: stay.city,
      address: stay.location ? stay.location.replace(", " + stay.city, "").replace(stay.city, "").trim() : "",
      state: stay.state,
      tag: stay.tag,
      description: stay.description,
      pricePerNight: stay.pricePerNight,
      originalPrice: stay.originalPrice,
      holidaySurgePrice: stay.holidaySurgePrice || Math.round(stay.pricePerNight * 1.4),
      isHolidayAvailable: stay.isHolidayAvailable !== false,
      selectedHolidayPresets: ["Diwali Festival Week", "Christmas & New Year Bash"],
      maxGuests: stay.maxGuests,
      bedrooms: stay.bedrooms,
      beds: stay.beds,
      bathrooms: stay.bathrooms,
      amenities: stay.amenities,
      gallery: stay.gallery,
      rooms:
        stay.rooms && stay.rooms.length > 0
          ? stay.rooms
          : [
              {
                id: "room-1",
                name: "Deluxe King Suite",
                type: "Deluxe" as const,
                description: "Spacious master bedroom with plush King bed and scenic view.",
                maxGuests: 2,
                bedType: "1 King Bed",
                bedsCount: 1,
                sizeSqFt: 450,
                pricePerNight: stay.pricePerNight,
                originalPrice: stay.originalPrice,
                holidayPrice: stay.holidaySurgePrice || Math.round(stay.pricePerNight * 1.4),
                totalUnits: 2,
                imageUrl: stay.imageUrl,
                gallery: stay.gallery.slice(0, 2),
                amenities: stay.amenities.slice(0, 4),
                mealPlan: "Free Breakfast Included" as const,
              },
            ],
      checkInTime: stay.houseRules?.[0]?.replace("Check-in: ", "") || "2:00 PM",
      checkOutTime: stay.houseRules?.[1]?.replace("Checkout: ", "") || "11:00 AM",
      isInstantBook: stay.isInstantBook,
      houseRules: stay.houseRules && stay.houseRules.length > 0 ? stay.houseRules : [
        "Check-in: 2:00 PM – 10:00 PM",
        "Checkout: 11:00 AM",
        "No smoking indoors",
        "Quiet hours after 10:30 PM",
      ],
    });
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

      const isEditing = Boolean(editingPropertyId);
      const url = isEditing ? `/api/properties?id=${encodeURIComponent(editingPropertyId!)}` : "/api/properties";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          holidayPricing,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || `Failed to ${isEditing ? "update" : "publish"} property`);
      }

      setPublishedStay(data.property);
      setPropertiesList((prev) => {
        if (isEditing) {
          return prev.map((p) => (p.id === editingPropertyId ? data.property : p));
        }
        return [data.property, ...prev];
      });
      setEditingPropertyId(null);
    } catch (err: any) {
      console.error("Submission failed:", err);
      setSubmitError(err.message || "Failed to save property");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setEditingPropertyId(null);
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
      rooms: [
        {
          id: "room-1",
          name: "Deluxe King Suite",
          type: "Deluxe" as const,
          description: "Spacious master bedroom with plush King bed, luxury bath, and scenic balcony view.",
          maxGuests: 2,
          bedType: "1 King Bed",
          bedsCount: 1,
          sizeSqFt: 450,
          pricePerNight: 8500,
          originalPrice: 10500,
          holidayPrice: 11999,
          totalUnits: 2,
          imageUrl: "",
          gallery: [] as string[],
          amenities: ["Air Conditioning", "High-Speed Wi-Fi", "Smart TV", "Bathtub", "Balcony", "Tea/Coffee Maker"],
          mealPlan: "Free Breakfast Included" as const,
        },
      ],
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
                        <button
                          type="button"
                          onClick={() => handleStartEdit(stay)}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold border border-slate-700 transition-colors flex items-center gap-1"
                          title="Edit listing"
                        >
                          <Pencil className="h-3 w-3 text-indigo-400" />
                          <span>Edit</span>
                        </button>

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
                    Ensure your villas and penthouses have updated holiday surge pricing and high-resolution photos.
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

                      {stay.rooms && stay.rooms.length > 0 && (
                        <div className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-indigo-300 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20 w-fit">
                          <Building2 className="h-3.5 w-3.5 text-indigo-400" />
                          <span>{stay.rooms.length} Room Categories</span>
                        </div>
                      )}
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
                        <button
                          type="button"
                          onClick={() => handleStartEdit(stay)}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold border border-slate-700 transition-colors flex items-center gap-1"
                        >
                          <Pencil className="h-3 w-3 text-indigo-400" />
                          <span>Edit</span>
                        </button>

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
                    {editingPropertyId ? "Property Updated Successfully!" : "Property Listed Successfully!"}
                  </h2>
                  <p className="text-sm text-slate-400 max-w-md mx-auto">
                    Your listing <span className="text-white font-bold">{publishedStay.title}</span> is now active,
                    saved to your database, and ready for holiday bookings.
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
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/60 border border-slate-800 overflow-x-auto gap-2">
                  {[
                    { step: 1, label: "1. Basics" },
                    { step: 2, label: "2. Location" },
                    { step: 3, label: "3. Rooms & Suites" },
                    { step: 4, label: "4. Capacity" },
                    { step: 5, label: "5. Holiday Rates" },
                    { step: 6, label: "6. Photos" },
                    { step: 7, label: "7. Amenities" },
                  ].map((s) => (
                    <button
                      key={s.step}
                      type="button"
                      onClick={() => setFormStep(s.step)}
                      className={`text-xs font-bold whitespace-nowrap transition-colors ${
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

                {/* Edit Mode Notification Banner */}
                {editingPropertyId && (
                  <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 text-indigo-300">
                      <Pencil className="h-4 w-4 text-indigo-400 shrink-0" />
                      <span>
                        Currently Editing: <strong className="text-white">{formData.title}</strong>
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-bold transition-colors"
                    >
                      Cancel Edit & Create New
                    </button>
                  </div>
                )}

                {/* STEP 1: PROPERTY IDENTITY & TYPE */}
                {formStep === 1 && (
                  <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-6 animate-in fade-in">
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        {editingPropertyId ? "Edit Property Overview" : "Property Overview"}
                      </h3>
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
                        Next: Hotel Rooms & Suites &rarr;
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3: HOTEL ROOMS & SUITES */}
                {formStep === 3 && (
                  <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-6 animate-in fade-in">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                          <Building2 className="h-5 w-5 text-indigo-400" />
                          <span>Hotel Room Categories & Suites</span>
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Define multiple room types (e.g. Deluxe Room, Executive Suite, Presidential Penthouse).
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleAddRoom}
                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md flex items-center gap-1.5 self-start sm:self-auto transition-all"
                      >
                        <Plus className="h-4 w-4" />
                        <span>+ Add Room Category</span>
                      </button>
                    </div>

                    {/* Room Cards List */}
                    <div className="space-y-5">
                      {formData.rooms.map((room, idx) => (
                        <div
                          key={room.id || idx}
                          className="p-5 rounded-2xl bg-slate-950 border border-slate-800/90 space-y-4 relative"
                        >
                          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                            <div className="flex items-center gap-2">
                              <span className="h-6 w-6 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-bold flex items-center justify-center">
                                {idx + 1}
                              </span>
                              <h4 className="text-sm font-bold text-white">
                                {room.name || `Room Category ${idx + 1}`}
                              </h4>
                            </div>

                            {formData.rooms.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveRoom(idx)}
                                className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors text-xs flex items-center gap-1"
                                title="Remove room type"
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="hidden sm:inline text-[11px]">Remove</span>
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="sm:col-span-2">
                              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                                Room Name / Title *
                              </label>
                              <input
                                type="text"
                                required
                                placeholder="e.g. Deluxe Ocean View Suite"
                                value={room.name}
                                onChange={(e) => handleUpdateRoom(idx, "name", e.target.value)}
                                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                                Room Category
                              </label>
                              <select
                                value={room.type}
                                onChange={(e) => handleUpdateRoom(idx, "type", e.target.value)}
                                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                              >
                                <option value="Deluxe">Deluxe Room</option>
                                <option value="Executive">Executive Suite</option>
                                <option value="Suite">Master Suite</option>
                                <option value="Presidential">Presidential Penthouse</option>
                                <option value="Standard">Standard Classic</option>
                                <option value="Villa Room">Villa Room</option>
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div>
                              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                                Price / Night (₹)
                              </label>
                              <input
                                type="number"
                                min={500}
                                value={room.pricePerNight}
                                onChange={(e) => {
                                  const val = Number(e.target.value);
                                  handleUpdateRoom(idx, "pricePerNight", val);
                                  handleUpdateRoom(idx, "originalPrice", Math.round(val * 1.25));
                                  handleUpdateRoom(idx, "holidayPrice", Math.round(val * 1.4));
                                }}
                                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-white focus:outline-none focus:border-indigo-500"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                                Bed Type
                              </label>
                              <input
                                type="text"
                                placeholder="e.g. 1 King Bed"
                                value={room.bedType}
                                onChange={(e) => handleUpdateRoom(idx, "bedType", e.target.value)}
                                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                                Size (sq ft)
                              </label>
                              <input
                                type="number"
                                min={100}
                                placeholder="450"
                                value={room.sizeSqFt}
                                onChange={(e) => handleUpdateRoom(idx, "sizeSqFt", Number(e.target.value))}
                                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                                Max Guests
                              </label>
                              <input
                                type="number"
                                min={1}
                                max={10}
                                value={room.maxGuests}
                                onChange={(e) => handleUpdateRoom(idx, "maxGuests", Number(e.target.value))}
                                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                                Meal Plan
                              </label>
                              <select
                                value={room.mealPlan || "Free Breakfast Included"}
                                onChange={(e) => handleUpdateRoom(idx, "mealPlan", e.target.value)}
                                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                              >
                                <option value="Free Breakfast Included">🍳 Free Breakfast Included</option>
                                <option value="Room Only">☕ Room Only (No Meals)</option>
                                <option value="All Meals Included">🍽️ All Meals Included</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                                Total Units Available
                              </label>
                              <input
                                type="number"
                                min={1}
                                max={50}
                                value={room.totalUnits || 1}
                                onChange={(e) => handleUpdateRoom(idx, "totalUnits", Number(e.target.value))}
                                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-300 mb-1">
                              Room Description
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Spacious floor-to-ceiling suite with direct sea sunset views and soaking tub."
                              value={room.description}
                              onChange={(e) => handleUpdateRoom(idx, "description", e.target.value)}
                              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                            />
                          </div>
                        </div>
                      ))}
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
                        Next: Capacity & Specs &rarr;
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 4: SPECS & CAPACITY */}
                {formStep === 4 && (
                  <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-6 animate-in fade-in">
                    <div>
                      <h3 className="text-xl font-bold text-white">Space & Overall Accommodation Specs</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Guests capacity and overall bedroom layout.</p>
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
                        Next: Holiday Rates &rarr;
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 5: HOLIDAY BOOKING & PRICING */}
                {formStep === 5 && (
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
                        Next: Photos & Media &rarr;
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 6: PHOTO GALLERY */}
                {formStep === 6 && (
                  <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-6 animate-in fade-in">
                    <div>
                      <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <ImageIcon className="h-5 w-5 text-indigo-400" />
                        <span>Property & Room Photos</span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Upload high-resolution photos or paste direct image URLs (Unsplash, CDN, etc.).
                      </p>
                    </div>

                    <ImageUpload
                      value={formData.gallery}
                      onChange={(urls) => setFormData({ ...formData, gallery: urls })}
                      folder="room-bookings/hotels"
                      maxFiles={8}
                      label="Property & Room Photos"
                      description="Upload pictures or paste image URLs. The first photo will be the main Cover Photo."
                    />

                    <div className="flex justify-between pt-4">
                      <button
                        type="button"
                        onClick={() => setFormStep(5)}
                        className="px-5 py-2.5 rounded-2xl bg-slate-800 text-slate-300 text-xs font-bold"
                      >
                        &larr; Back
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormStep(7)}
                        className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg transition-all"
                      >
                        Next: Amenities & Publish &rarr;
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 7: AMENITIES & PUBLISH */}
                {formStep === 7 && (
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
                        onClick={() => setFormStep(6)}
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
                            <span>{editingPropertyId ? "Updating Property..." : "Publishing to StaySpot..."}</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4" />
                            <span>{editingPropertyId ? "Save & Update Listing" : "Publish Holiday Listing"}</span>
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
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-indigo-400" />
                    <span>Guest Bookings & Razorpay Payments</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Live holiday reservations and verified Razorpay payment receipts.
                  </p>
                </div>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  {bookingsList.length > 0 ? bookingsList.length : 3} Confirmed
                </span>
              </div>

              <div className="divide-y divide-slate-800/80">
                {(bookingsList.length > 0
                  ? bookingsList.map((b) => ({
                      guest: b.guestName || "Verified Traveler",
                      stay: b.propertyName || "Luxury Stay",
                      city: b.propertyCity || "India",
                      dates: `${b.checkIn} – ${b.checkOut}`,
                      guests: b.guests || 2,
                      amount: formatINR(b.totalAmount || 12000),
                      status: b.status || "CONFIRMED",
                      bookingNumber: b.bookingNumber,
                      paymentId: b.razorpayPaymentId,
                    }))
                  : [
                      {
                        guest: "Aarav Sharma",
                        stay: "Skyline Glass Penthouse Suite",
                        city: "Mumbai",
                        dates: "Oct 28 – Nov 2, 2026 (Diwali)",
                        guests: 4,
                        amount: "₹49,995",
                        status: "Confirmed",
                        bookingNumber: "STAY-829104-492",
                        paymentId: "pay_Pz92841kLa",
                      },
                      {
                        guest: "Neha Rastogi",
                        stay: "Azure Horizon Cliffside Villa",
                        city: "Goa",
                        dates: "Dec 24 – Dec 29, 2026 (Christmas)",
                        guests: 6,
                        amount: "₹59,995",
                        status: "Confirmed",
                        bookingNumber: "STAY-718293-102",
                        paymentId: "pay_Qm381029Xp",
                      },
                      {
                        guest: "Karan Patel",
                        stay: "Portuguese Colonial Heritage Estate",
                        city: "Goa",
                        dates: "Dec 30, 2026 – Jan 3, 2027 (New Year)",
                        guests: 8,
                        amount: "₹71,994",
                        status: "Confirmed",
                        bookingNumber: "STAY-938172-884",
                        paymentId: "pay_Lk492817Zy",
                      },
                    ]
                ).map((item, idx) => (
                  <div key={idx} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{item.guest}</span>
                        {item.bookingNumber && (
                          <span className="text-[10px] font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                            {item.bookingNumber}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-300 font-medium mt-0.5">
                        {item.stay} · {item.city}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1 flex flex-wrap items-center gap-2">
                        <Calendar className="h-3 w-3 text-indigo-400" />
                        <span>{item.dates}</span>
                        <span>·</span>
                        <span>{item.guests} guests</span>
                        {item.paymentId && (
                          <>
                            <span>·</span>
                            <span className="font-mono text-[10px] text-emerald-400">
                              Razorpay: {item.paymentId}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm font-black text-emerald-400">{item.amount}</div>
                        <div className="text-[10px] text-slate-400">Paid via Razorpay</div>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold uppercase tracking-wider">
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
