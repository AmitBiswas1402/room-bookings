"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { Stay, formatINR } from "@/data/stays";
import {
  Map as MapIcon,
  X,
  SlidersHorizontal,
  Star,
  Sparkles,
  Building2,
  MapPin,
  Heart,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

// Dynamically import PropertyDiscoveryMap with SSR disabled
const PropertyDiscoveryMap = dynamic(
  () => import("./PropertyDiscoveryMap"),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full rounded-3xl bg-slate-950 flex items-center justify-center text-slate-400 text-xs font-semibold">
        Loading Interactive Discovery Map...
      </div>
    ),
  }
);

interface HomeMapDiscoveryModalProps {
  stays: Stay[];
  isOpen: boolean;
  onClose: () => void;
}

export default function HomeMapDiscoveryModal({
  stays,
  isOpen,
  onClose,
}: HomeMapDiscoveryModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedStay, setSelectedStay] = useState<Stay | null>(null);

  if (!isOpen) return null;

  const categories = [
    { id: "ALL", label: "All Stays" },
    { id: "villas", label: "Luxury Villas" },
    { id: "beachfront", label: "Beachfront & Resorts" },
    { id: "mountains", label: "Mountain Cabins" },
    { id: "hotels", label: "Boutique Hotels" },
    { id: "apartments", label: "City Apartments" },
  ];

  const filteredStays = stays.filter((s) =>
    selectedCategory === "ALL" ? true : s.category === selectedCategory
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="w-full max-w-7xl h-[92vh] rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col overflow-hidden relative">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-r from-rose-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
              <MapIcon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                <span>Map-Based Property Discovery</span>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold">
                  {filteredStays.length} Stays Found
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Explore luxury villas, hotels &amp; beachfront resorts with live price pins on map.
              </p>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="hidden md:flex items-center gap-1.5 bg-slate-900 p-1 rounded-2xl border border-slate-800 text-[11px] font-bold">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl uppercase tracking-wider transition-colors ${
                  selectedCategory === cat.id
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="p-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Map Body & Stay Sidebar */}
        <div className="flex-1 flex relative overflow-hidden">
          {/* Map */}
          <div className="flex-1 h-full relative">
            <PropertyDiscoveryMap
              stays={filteredStays}
              selectedStayId={selectedStay?.id}
              onSelectStay={(stay) => setSelectedStay(stay)}
              className="h-full w-full rounded-none border-none"
            />
          </div>

          {/* Optional Sidebar (Desktop) */}
          <div className="hidden lg:flex flex-col w-96 bg-slate-950/90 border-l border-slate-800/80 overflow-y-auto divide-y divide-slate-800/60 p-4 space-y-4">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Featured Stays in View ({filteredStays.length})
            </div>

            <div className="space-y-4 pt-2">
              {filteredStays.map((stay) => (
                <div
                  key={stay.id}
                  onClick={() => setSelectedStay(stay)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex gap-3 ${
                    selectedStay?.id === stay.id
                      ? "bg-indigo-950/40 border-indigo-500 shadow-lg shadow-indigo-500/20"
                      : "bg-slate-900/60 border-slate-800/80 hover:border-slate-700"
                  }`}
                >
                  <img
                    src={stay.imageUrl}
                    alt={stay.title}
                    className="h-20 w-24 rounded-xl object-cover shrink-0 bg-slate-950"
                  />
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-indigo-400 uppercase">{stay.city}</span>
                      <div className="flex items-center gap-1 text-[10px] text-amber-400 font-bold">
                        <Star className="h-3 w-3 fill-amber-400" />
                        <span>{stay.rating.toFixed(1)}</span>
                      </div>
                    </div>
                    <h5 className="text-xs font-bold text-white truncate">{stay.title}</h5>
                    <p className="text-[10px] text-slate-400 truncate">{stay.location}</p>
                    <div className="flex items-baseline justify-between pt-1">
                      <span className="text-xs font-black text-white font-mono">
                        {formatINR(stay.pricePerNight)}
                        <span className="text-[9px] text-slate-400 font-normal"> / nt</span>
                      </span>
                      <Link
                        href={`/properties/${stay.id}`}
                        className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5"
                      >
                        <span>Book</span>
                        <ArrowRight className="h-2.5 w-2.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
