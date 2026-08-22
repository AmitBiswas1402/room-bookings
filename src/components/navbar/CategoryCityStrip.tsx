"use client";

import React, { useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Sparkles,
  Palmtree,
  Mountain,
  Hotel,
  Building2,
  Trees,
  Waves,
  Castle,
  Tent,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Flame,
} from "lucide-react";

const CITIES = [
  { id: "all", name: "All Destinations" },
  { id: "goa", name: "Goa", trending: true },
  { id: "mumbai", name: "Mumbai" },
  { id: "bengaluru", name: "Bengaluru" },
  { id: "delhi", name: "Delhi NCR" },
  { id: "jaipur", name: "Jaipur", trending: true },
  { id: "manali", name: "Manali" },
  { id: "kerala", name: "Kerala" },
  { id: "udaipur", name: "Udaipur" },
  { id: "hyderabad", name: "Hyderabad" },
  { id: "kolkata", name: "Kolkata" },
  { id: "ooty", name: "Ooty" },
  { id: "rishikesh", name: "Rishikesh" },
];

const CATEGORIES = [
  { id: "all", label: "All Stays", icon: Sparkles },
  { id: "beachfront", label: "Beachfront", icon: Waves },
  { id: "villas", label: "Luxury Villas", icon: Castle },
  { id: "mountains", label: "Mountain Cabins", icon: Mountain },
  { id: "hotels", label: "Boutique Hotels", icon: Hotel },
  { id: "apartments", label: "City Apartments", icon: Building2 },
  { id: "nature", label: "Treehouses & Nature", icon: Trees },
  { id: "tropical", label: "Tropical & Islands", icon: Palmtree },
  { id: "glamping", label: "Glamping & Tents", icon: Tent },
];

export default function CategoryCityStrip() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const currentCity = searchParams.get("city") || "all";
  const currentCategory = searchParams.get("category") || "all";

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all" || !value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    const queryString = params.toString();
    router.push(queryString ? `/search?${queryString}` : "/search");
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const offset = direction === "left" ? -240 : 240;
      scrollContainerRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  return (
    <div className="w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      {/* 1. OYO-Style City Quick Strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2.5 pb-1 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 shrink-0 mr-1 flex items-center gap-1">
          <Flame className="h-3 w-3 text-rose-500" />
          Cities:
        </span>
        {CITIES.map((city) => {
          const isSelected =
            currentCity.toLowerCase() === city.id.toLowerCase() ||
            (city.id === "all" && currentCity === "all");

          return (
            <button
              key={city.id}
              onClick={() => updateParam("city", city.id)}
              className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 transition-all flex items-center gap-1.5 ${
                isSelected
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-1 ring-indigo-400"
                  : "bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800"
              }`}
            >
              <span>{city.name}</span>
              {city.trending && (
                <span className="h-1.5 w-1.5 rounded-full bg-rose-400 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>

      {/* 2. Airbnb-Style Category Icons Strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4">
        <div className="relative flex-1 flex items-center min-w-0">
          {/* Scroll Left Button */}
          <button
            type="button"
            onClick={() => scroll("left")}
            className="hidden sm:flex h-8 w-8 rounded-full bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 items-center justify-center shrink-0 mr-2 shadow-md transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {/* Categories Horizontal Carousel */}
          <div
            ref={scrollContainerRef}
            className="flex items-center gap-6 overflow-x-auto scroll-smooth no-scrollbar py-1"
          >
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected =
                currentCategory.toLowerCase() === cat.id.toLowerCase() ||
                (cat.id === "all" && currentCategory === "all");

              return (
                <button
                  key={cat.id}
                  onClick={() => updateParam("category", cat.id)}
                  className={`flex flex-col items-center gap-1.5 pb-1.5 shrink-0 transition-all border-b-2 group ${
                    isSelected
                      ? "border-indigo-500 text-white font-bold"
                      : "border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700 font-medium"
                  }`}
                >
                  <div
                    className={`p-2 rounded-xl transition-all ${
                      isSelected
                        ? "bg-indigo-500/20 text-indigo-400 shadow-sm"
                        : "bg-slate-900/60 text-slate-400 group-hover:text-slate-200 group-hover:bg-slate-800/80"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-[11px] whitespace-nowrap tracking-tight">
                    {cat.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Scroll Right Button */}
          <button
            type="button"
            onClick={() => scroll("right")}
            className="hidden sm:flex h-8 w-8 rounded-full bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 items-center justify-center shrink-0 ml-2 shadow-md transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Right Side Filter Button */}
        <div className="shrink-0 flex items-center gap-2">
          <button
            onClick={() => {
              // Toggle filter modal or open search
              const params = new URLSearchParams(searchParams.toString());
              if (params.toString()) {
                router.push("/");
              }
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-all shadow-sm"
          >
            <SlidersHorizontal className="h-3.5 w-3.5 text-indigo-400" />
            <span className="hidden sm:inline">
              {searchParams.toString() ? "Reset Filters" : "Filters"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
