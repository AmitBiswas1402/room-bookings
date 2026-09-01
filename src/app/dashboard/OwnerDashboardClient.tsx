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
  Send,
  Bell,
  CreditCard,
  Percent,
  Mail,
} from "lucide-react";
import { Stay, HotelRoom, formatINR } from "@/data/stays";
import ImageUpload from "@/components/ui/ImageUpload";
import CancellationModal from "@/components/booking/CancellationModal";
import NotificationBell from "@/components/navbar/NotificationBell";
import AdminManagementSection from "@/components/admin/AdminManagementSection";
import DynamicPricingManager from "@/components/pricing/DynamicPricingManager";

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

  const [activeTab, setActiveTab] = useState<"overview" | "properties" | "create" | "holidays" | "bookings" | "wishlist" | "admin">(
    tabQuery && ["overview", "properties", "create", "holidays", "bookings", "wishlist", "admin"].includes(tabQuery)
      ? tabQuery
      : user.role === "ADMIN" && tabQuery === "admin"
      ? "admin"
      : "overview"
  );

  const [editingPropertyId, setEditingPropertyId] = useState<string | null>(null);

  useEffect(() => {
    if (tabQuery && ["overview", "properties", "create", "holidays", "bookings", "wishlist", "admin"].includes(tabQuery)) {
      setActiveTab(tabQuery as any);
    }
  }, [tabQuery]);

  const [propertiesList, setPropertiesList] = useState<Stay[]>([]);
  const [bookingsList, setBookingsList] = useState<any[]>([]);
  const [wishlistList, setWishlistList] = useState<any[]>([]);
  const [bookingStatusFilter, setBookingStatusFilter] = useState<"ALL" | "CONFIRMED" | "COMPLETED" | "CANCELLED">("ALL");
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [isLoadingWishlist, setIsLoadingWishlist] = useState<boolean>(false);
  const [selectedBookingForCancel, setSelectedBookingForCancel] = useState<any | null>(null);
  const [cancellationNotice, setCancellationNotice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("all");

  const fetchWishlist = async () => {
    try {
      setIsLoadingWishlist(true);
      const res = await fetch("/api/wishlist");
      const data = await res.json();
      if (data.success && Array.isArray(data.favorites)) {
        setWishlistList(data.favorites);
      }
    } catch (err) {
      console.error("Failed to load wishlist:", err);
    } finally {
      setIsLoadingWishlist(false);
    }
  };

  const handleRemoveFromWishlist = async (propertyId: string) => {
    try {
      setWishlistList((prev) => prev.filter((item) => item.id !== propertyId));
      await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId }),
      });
    } catch (err) {
      console.error("Failed to remove from wishlist:", err);
    }
  };

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
    fetchWishlist();
  }, []);

  const [sendingReminderId, setSendingReminderId] = useState<string | null>(null);

  const handleSendReminder = async (bookingNumber: string) => {
    try {
      setSendingReminderId(bookingNumber);
      const res = await fetch("/api/notifications/reminder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: bookingNumber }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCancellationNotice(`🔔 Booking reminder notification & email sent for ${bookingNumber}!`);
      } else {
        alert(data.error || "Failed to send reminder");
      }
    } catch (err) {
      console.error("Reminder failed:", err);
    } finally {
      setSendingReminderId(null);
    }
  };

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

  const totalRevenue = bookingsList.reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0);
  const totalNightsBooked = bookingsList.reduce((sum, b) => {
    if (b.checkIn && b.checkOut) {
      const d1 = new Date(b.checkIn);
      const d2 = new Date(b.checkOut);
      const diff = Math.max(1, Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)));
      return sum + diff;
    }
    return sum + 2;
  }, 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      {/* 1. TOP HERO BANNER & HOST HEADER */}
      <div className="border-b border-slate-800/80 bg-linear-to-b from-slate-900/90 to-slate-950/95 backdrop-blur-xl">
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

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-3">
              <NotificationBell />

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
              <span>Properties ({propertiesList.length})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                resetForm();
                setActiveTab("create");
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                activeTab === "create"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
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
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              <span>Dynamic &amp; Market Pricing</span>
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
              <span>Bookings ({bookingsList.length})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                fetchWishlist();
                setActiveTab("wishlist");
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                activeTab === "wishlist"
                  ? "bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-lg shadow-rose-600/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <Heart className="h-4 w-4 text-rose-400" />
              <span>My Wishlist ❤️ ({wishlistList.length})</span>
            </button>

            {user.role === "ADMIN" && (
              <button
                type="button"
                onClick={() => setActiveTab("admin")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                  activeTab === "admin"
                    ? "bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-lg shadow-rose-600/30"
                    : "text-rose-300 hover:text-white hover:bg-rose-950/40 border border-rose-500/20"
                }`}
              >
                <Shield className="h-4 w-4 text-rose-400" />
                <span>🛡️ Admin Controls</span>
              </button>
            )}
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
                  <span>All Active in Neon DB</span>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800/80 relative overflow-hidden shadow-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-400">Total Guest Bookings</span>
                  <div className="h-9 w-9 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
                    <Flame className="h-4 w-4" />
                  </div>
                </div>
                <div className="text-3xl font-black text-white">{bookingsList.length} Bookings</div>
                <div className="text-[11px] text-rose-400 font-semibold mt-1 flex items-center gap-1">
                  <span>{totalNightsBooked} Total Nights Reserved</span>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800/80 relative overflow-hidden shadow-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-400">Realized Revenue</span>
                  <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <DollarSign className="h-4 w-4" />
                  </div>
                </div>
                <div className="text-3xl font-black text-white">{formatINR(totalRevenue)}</div>
                <div className="text-[11px] text-emerald-400 font-semibold mt-1">
                  Verified Razorpay Receipts
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800/80 relative overflow-hidden shadow-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-400">Holiday Active Listings</span>
                  <div className="h-9 w-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <Sun className="h-4 w-4" />
                  </div>
                </div>
                <div className="text-3xl font-black text-white">
                  {propertiesList.filter((p) => p.isHolidayAvailable !== false).length}
                </div>
                <div className="text-[11px] text-amber-300 font-semibold mt-1">
                  Ready for Festive Bookings
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
        {/* TAB 4: DYNAMIC MARKET & SEASONAL PRICING CALENDAR */}
        {/* ========================================================================= */}
        {activeTab === "holidays" && (
          <DynamicPricingManager properties={propertiesList} />
        )}

        {/* ========================================================================= */}
        {/* TAB 5: OWNER BOOKING & REVENUE MANAGEMENT */}
        {/* ========================================================================= */}
        {activeTab === "bookings" && (() => {
          const nonCancelled = bookingsList.filter((b) => b.status !== "CANCELLED");
          const grossRevenue = nonCancelled.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
          const totalRefunded = bookingsList
            .filter((b) => b.status === "CANCELLED")
            .reduce((sum, b) => sum + (b.totalAmount || 0), 0);
          const netRevenue = grossRevenue;
          const avgBookingValue = nonCancelled.length > 0 ? Math.round(grossRevenue / nonCancelled.length) : 0;

          const confirmedBookings = bookingsList.filter((b) => b.status === "CONFIRMED");
          const completedBookings = bookingsList.filter((b) => b.status === "COMPLETED" || (b.status === "CONFIRMED" && new Date(b.checkOut) < new Date()));
          const cancelledBookings = bookingsList.filter((b) => b.status === "CANCELLED");

          const filteredList = bookingsList.filter((b) => {
            if (bookingStatusFilter === "CONFIRMED") return b.status === "CONFIRMED";
            if (bookingStatusFilter === "COMPLETED") return b.status === "COMPLETED" || (b.status === "CONFIRMED" && new Date(b.checkOut) < new Date());
            if (bookingStatusFilter === "CANCELLED") return b.status === "CANCELLED";
            return true;
          });

          // Extract unique recent guests with emails
          const uniqueGuestsMap = new Map();
          bookingsList.forEach((b) => {
            if (b.guestEmail && !uniqueGuestsMap.has(b.guestEmail)) {
              const guestStays = bookingsList.filter((x) => x.guestEmail === b.guestEmail);
              const totalGuestSpend = guestStays
                .filter((x) => x.status !== "CANCELLED")
                .reduce((sum, x) => sum + (x.totalAmount || 0), 0);
              uniqueGuestsMap.set(b.guestEmail, {
                email: b.guestEmail,
                name: b.guestName || "Verified Guest",
                staysCount: guestStays.length,
                totalSpend: totalGuestSpend,
                lastBookingNumber: b.bookingNumber,
                lastProperty: b.propertyName || "Luxury Stay",
                lastCheckIn: b.checkIn,
                lastCheckOut: b.checkOut,
              });
            }
          });
          const recentGuests = Array.from(uniqueGuestsMap.values());

          return (
            <div className="space-y-8 animate-in fade-in">
              {/* 1. REVENUE & FINANCIAL ANALYTICS SUMMARY */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 relative overflow-hidden shadow-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-400">Gross Bookings Revenue</span>
                    <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                      <CreditCard className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
                    {formatINR(grossRevenue)}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1 font-semibold">
                    {nonCancelled.length} successful stays
                  </div>
                </div>

                <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 relative overflow-hidden shadow-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-400">Total Refunds Processed</span>
                    <div className="h-9 w-9 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
                      <AlertCircle className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-rose-400 font-mono">
                    {formatINR(totalRefunded)}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1 font-semibold">
                    {cancelledBookings.length} cancelled reservations
                  </div>
                </div>

                <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 relative overflow-hidden shadow-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-400">Net Settled Revenue</span>
                    <div className="h-9 w-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                      <TrendingUp className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-white font-mono">
                    {formatINR(netRevenue)}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1 font-semibold">
                    Razorpay instant settlements
                  </div>
                </div>

                <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 relative overflow-hidden shadow-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-400">Avg. Booking Value</span>
                    <div className="h-9 w-9 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center">
                      <Percent className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-indigo-300 font-mono">
                    {formatINR(avgBookingValue)}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1 font-semibold">
                    Per confirmed reservation
                  </div>
                </div>
              </div>

              {/* 2. RECENTLY VIEWED & CONTACTED GUESTS (GUEST EMAIL & INFO) */}
              <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-5 shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-base font-black text-white flex items-center gap-2">
                      <Mail className="h-4 w-4 text-indigo-400" />
                      <span>Recently Contacted Guests &amp; Emails</span>
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Direct contact directory for verified guests who booked or engaged with your properties.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                    {recentGuests.length} Guests
                  </span>
                </div>

                {recentGuests.length === 0 ? (
                  <div className="py-8 text-center text-slate-500 text-xs">
                    No guest contacts recorded yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recentGuests.map((guest, gIdx) => (
                      <div
                        key={guest.email || gIdx}
                        className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-3 hover:border-slate-700 transition-all flex flex-col justify-between"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-600 to-rose-500 flex items-center justify-center text-white text-xs font-bold">
                                {guest.name.charAt(0)}
                              </div>
                              <div>
                                <h5 className="text-xs font-bold text-white truncate max-w-[130px]">{guest.name}</h5>
                                <span className="text-[10px] text-slate-400">{guest.staysCount} stay(s)</span>
                              </div>
                            </div>
                            <span className="text-xs font-black text-emerald-400 font-mono">
                              {formatINR(guest.totalSpend)}
                            </span>
                          </div>

                          <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-[11px] flex items-center justify-between">
                            <span className="font-mono text-indigo-300 truncate max-w-[180px]">{guest.email}</span>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(guest.email);
                                setCopiedEmail(guest.email);
                                setTimeout(() => setCopiedEmail(null), 2000);
                              }}
                              className="text-[10px] font-bold text-slate-400 hover:text-white transition-colors ml-2"
                              title="Copy email to clipboard"
                            >
                              {copiedEmail === guest.email ? "Copied!" : "Copy"}
                            </button>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px]">
                          <span className="text-slate-400 truncate max-w-[140px]">
                            Stay: {guest.lastProperty}
                          </span>
                          <a
                            href={`mailto:${guest.email}?subject=Regarding Your Stay at ${encodeURIComponent(guest.lastProperty)} [${guest.lastBookingNumber}]`}
                            className="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white font-bold transition-colors flex items-center gap-1"
                          >
                            <Mail className="h-3 w-3" />
                            <span>Email Guest</span>
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 3. BOOKINGS FILTER PILLS & LIST */}
              <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-4 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-indigo-400" />
                      <span>Guest Reservations &amp; Receipts</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Completed stays, live reservations, and refund settlement logs.
                    </p>
                  </div>

                  {/* Status Filter Buttons */}
                  <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-2xl border border-slate-800 text-[11px] font-bold overflow-x-auto scrollbar-none">
                    {(
                      [
                        { id: "ALL", label: `All (${bookingsList.length})` },
                        { id: "CONFIRMED", label: `Active (${confirmedBookings.length})` },
                        { id: "COMPLETED", label: `Completed (${completedBookings.length})` },
                        { id: "CANCELLED", label: `Cancelled (${cancelledBookings.length})` },
                      ] as const
                    ).map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setBookingStatusFilter(tab.id)}
                        className={`px-3 py-1.5 rounded-xl uppercase tracking-wider transition-colors shrink-0 ${
                          bookingStatusFilter === tab.id
                            ? "bg-indigo-600 text-white shadow-sm"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {cancellationNotice && (
                  <div className="mb-4 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                      <span>{cancellationNotice}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCancellationNotice(null)}
                      className="text-slate-400 hover:text-white text-xs ml-4"
                    >
                      Dismiss
                    </button>
                  </div>
                )}

                {filteredList.length === 0 ? (
                  <div className="py-16 text-center space-y-3">
                    <div className="h-14 w-14 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/20">
                      <Calendar className="h-7 w-7" />
                    </div>
                    <h4 className="text-base font-bold text-white">No Bookings in this Category</h4>
                    <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                      Reservations matching the selected filter will appear here in real-time.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-800/80">
                    {filteredList.map((item, idx) => {
                      const isCancelled = item.status === "CANCELLED";
                      const isCompleted = item.status === "COMPLETED" || (item.status === "CONFIRMED" && new Date(item.checkOut) < new Date());

                      return (
                        <div key={item.id || idx} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-white">{item.guestName || "Verified Traveler"}</span>
                              {item.bookingNumber && (
                                <span className="text-[10px] font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                                  {item.bookingNumber}
                                </span>
                              )}
                              <span className="text-[10px] text-slate-400 font-mono">
                                ({item.guestEmail})
                              </span>
                            </div>
                            <div className="text-xs text-slate-300 font-medium mt-0.5">
                              {item.propertyName || "Luxury Stay"} · {item.propertyCity || "India"}
                            </div>
                            <div className="text-[11px] text-slate-400 mt-1 flex flex-wrap items-center gap-2">
                              <Calendar className="h-3 w-3 text-indigo-400" />
                              <span>{item.checkIn} – {item.checkOut}</span>
                              <span>·</span>
                              <span>{item.guests || 2} guests</span>
                              {item.razorpayPaymentId && (
                                <>
                                  <span>·</span>
                                  <span className="font-mono text-[10px] text-emerald-400">
                                    Razorpay: {item.razorpayPaymentId}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <div className={`text-sm font-black ${isCancelled ? "text-slate-500 line-through" : "text-emerald-400"}`}>
                                {formatINR(item.totalAmount || 0)}
                              </div>
                              <div className="text-[10px] text-slate-400">
                                {isCancelled ? "Refund Processed" : isCompleted ? "Stay Completed" : "Paid via Razorpay"}
                              </div>
                            </div>

                            <span
                              className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                                isCancelled
                                  ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                  : isCompleted
                                  ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                  : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              }`}
                            >
                              {isCancelled ? "CANCELLED" : isCompleted ? "COMPLETED" : (item.status || "CONFIRMED")}
                            </span>

                            {item.bookingNumber && (
                              <Link
                                href={`/booking/confirmation?bookingNumber=${encodeURIComponent(item.bookingNumber)}`}
                                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-white border border-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                                title="View official digital receipt & invoice"
                              >
                                <span>Receipt</span>
                                <ExternalLink className="h-3 w-3" />
                              </Link>
                            )}

                            {!isCancelled && item.bookingNumber && (
                              <button
                                type="button"
                                onClick={() => handleSendReminder(item.bookingNumber)}
                                disabled={sendingReminderId === item.bookingNumber}
                                className="px-3 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 text-xs font-semibold flex items-center gap-1 transition-colors disabled:opacity-50"
                                title="Send upcoming stay reminder notification & email"
                              >
                                {sendingReminderId === item.bookingNumber ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Send className="h-3 w-3" />
                                )}
                                <span>Remind</span>
                              </button>
                            )}

                            {!isCancelled && (
                              <button
                                type="button"
                                onClick={() =>
                                  setSelectedBookingForCancel({
                                    id: item.id,
                                    bookingNumber: item.bookingNumber,
                                    propertyName: item.propertyName || "Luxury Property",
                                    checkIn: item.checkIn || "2026-08-28",
                                    checkOut: item.checkOut || "2026-08-30",
                                    totalAmount: item.totalAmount || 0,
                                  })
                                }
                                className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-xs font-semibold transition-colors"
                                title="Cancel reservation and process refund"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* ========================================================================= */}
        {/* TAB 7: MASTER ADMIN MANAGEMENT CONTROLS */}
        {/* ========================================================================= */}
        {activeTab === "admin" && user.role === "ADMIN" && (
          <AdminManagementSection currentUser={user} />
        )}

        {/* ========================================================================= */}
        {/* TAB 6: MY WISHLIST ❤️ */}
        {/* ========================================================================= */}
        {activeTab === "wishlist" && (
          <div className="space-y-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Heart className="h-5 w-5 text-rose-500 fill-rose-500" />
                    <span>My Saved Wishlist</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Your collection of dream luxury stays and verified boutique suites.
                  </p>
                </div>

                <span className="text-xs font-bold text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
                  {wishlistList.length} Saved Stays
                </span>
              </div>

              {isLoadingWishlist ? (
                <div className="py-16 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-rose-500" />
                  <span>Loading your saved wishlist...</span>
                </div>
              ) : wishlistList.length === 0 ? (
                <div className="py-16 text-center space-y-3">
                  <div className="h-14 w-14 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/20">
                    <Heart className="h-7 w-7" />
                  </div>
                  <h4 className="text-base font-bold text-white">Your Wishlist is Empty</h4>
                  <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                    Click the heart icon on any villa or hotel suite across StaySpot to save it here for easy booking later.
                  </p>
                  <div className="pt-2">
                    <Link
                      href="/"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-xs shadow-lg transition-all hover:scale-105"
                    >
                      <span>Explore Stays</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {wishlistList.map((item) => (
                    <div
                      key={item.id}
                      className="group rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden hover:border-slate-700 transition-all flex flex-col justify-between"
                    >
                      <div className="relative h-48 overflow-hidden bg-slate-900">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveFromWishlist(item.id)}
                          className="absolute top-3 right-3 p-2 rounded-full bg-slate-950/80 backdrop-blur-md text-rose-500 border border-rose-500/30 hover:bg-rose-500/20 hover:scale-110 transition-all"
                          title="Remove from wishlist"
                        >
                          <Heart className="h-4 w-4 fill-rose-500" />
                        </button>
                        <div className="absolute bottom-3 left-3 px-2.5 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-md text-[10px] font-bold text-indigo-300 border border-indigo-500/30">
                          {item.type || "Luxury Stay"}
                        </div>
                      </div>

                      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="text-xs text-slate-400 flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-rose-400" />
                            <span>{item.city}, {item.state || "India"}</span>
                          </div>
                          <h4 className="text-sm font-bold text-white mt-1 group-hover:text-indigo-300 transition-colors">
                            {item.name}
                          </h4>
                          <div className="text-[11px] text-slate-400 mt-1">
                            Hosted by {item.hostName || "Superhost"}
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                          <div>
                            <span className="text-sm font-black text-white font-mono">
                              {formatINR(item.pricePerNight || 8500)}
                            </span>
                            <span className="text-[10px] text-slate-400"> / night</span>
                          </div>

                          <Link
                            href={`/properties/${item.id}`}
                            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1 transition-all hover:scale-105"
                          >
                            <span>View Stay</span>
                            <ArrowRight className="h-3 w-3" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Cancellation Modal */}
      {selectedBookingForCancel && (
        <CancellationModal
          isOpen={Boolean(selectedBookingForCancel)}
          onClose={() => setSelectedBookingForCancel(null)}
          booking={selectedBookingForCancel}
          onSuccess={({ refundAmount, policyApplied }) => {
            setCancellationNotice(
              `Reservation ${selectedBookingForCancel.bookingNumber} successfully cancelled. Refund of ${formatINR(refundAmount)} initiated (${policyApplied}).`
            );
            setBookingsList((prev) =>
              prev.map((b) =>
                b.id === selectedBookingForCancel.id || b.bookingNumber === selectedBookingForCancel.bookingNumber
                  ? { ...b, status: "CANCELLED" }
                  : b
              )
            );
            setSelectedBookingForCancel(null);
          }}
        />
      )}
    </div>
  );
}
