"use client";

import React, { useState } from "react";
import {
  Search,
  MapPin,
  Calendar,
  Users,
  BedDouble,
  X,
  Plus,
  Minus,
  Sparkles,
  TrendingUp,
} from "lucide-react";

interface SearchExpandedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (params: {
    destination: string;
    checkIn: string;
    checkOut: string;
    adults: number;
    children: number;
    rooms: number;
  }) => void;
  initialDestination?: string;
}

const POPULAR_DESTINATIONS = [
  { name: "Goa", state: "India", tag: "Beach & Nightlife", emoji: "🏖️" },
  { name: "Mumbai", state: "Maharashtra", tag: "Iconic City & Sea", emoji: "🏙️" },
  { name: "Bengaluru", state: "Karnataka", tag: "Garden Tech City", emoji: "🌳" },
  { name: "Delhi NCR", state: "India", tag: "Heritage & Capital", emoji: "🏛️" },
  { name: "Jaipur", state: "Rajasthan", tag: "Royal Palaces", emoji: "👑" },
  { name: "Manali", state: "Himachal", tag: "Snow Mountains", emoji: "🏔️" },
  { name: "Kerala", state: "God's Country", tag: "Backwaters & Lush", emoji: "🌴" },
  { name: "Udaipur", state: "Rajasthan", tag: "City of Lakes", emoji: "🏰" },
];

export default function SearchExpandedModal({
  isOpen,
  onClose,
  onSearch,
  initialDestination = "",
}: SearchExpandedModalProps) {
  const [activeTab, setActiveTab] = useState<"where" | "when" | "who">("where");
  const [destination, setDestination] = useState(initialDestination);
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [adults, setAdults] = useState(2);
  const [childrenCount, setChildrenCount] = useState(0);
  const [rooms, setRooms] = useState(1);

  if (!isOpen) return null;

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onSearch({
      destination: destination || "Anywhere",
      checkIn: checkInDate,
      checkOut: checkOutDate,
      adults,
      children: childrenCount,
      rooms,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-start pt-16 px-4 bg-slate-950/75 backdrop-blur-md transition-all duration-300 animate-in fade-in">
      {/* Click outside backdrop */}
      <div className="absolute inset-0 -z-10" onClick={onClose} />

      {/* Floating Modal Box */}
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden shadow-indigo-500/10">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-900/90">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <Sparkles className="h-4 w-4 text-indigo-400" />
            <span>Search stays, hotels & villas</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 3-Section Floating Tabs */}
        <div className="p-4 bg-slate-950/50 border-b border-slate-800/60">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800">
            {/* WHERE TAB */}
            <button
              type="button"
              onClick={() => setActiveTab("where")}
              className={`flex flex-col text-left px-4 py-3 rounded-xl transition-all ${
                activeTab === "where"
                  ? "bg-slate-800 text-white shadow-md shadow-slate-950/50 ring-1 ring-indigo-500/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
              }`}
            >
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                Where
              </span>
              <span className="text-sm font-semibold truncate text-white mt-0.5">
                {destination || "Search destinations"}
              </span>
            </button>

            {/* WHEN TAB */}
            <button
              type="button"
              onClick={() => setActiveTab("when")}
              className={`flex flex-col text-left px-4 py-3 rounded-xl transition-all ${
                activeTab === "when"
                  ? "bg-slate-800 text-white shadow-md shadow-slate-950/50 ring-1 ring-indigo-500/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
              }`}
            >
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                Dates
              </span>
              <span className="text-sm font-semibold truncate text-white mt-0.5">
                {checkInDate || checkOutDate
                  ? `${checkInDate || "Check in"} - ${checkOutDate || "Check out"}`
                  : "Add dates"}
              </span>
            </button>

            {/* WHO & ROOMS TAB */}
            <button
              type="button"
              onClick={() => setActiveTab("who")}
              className={`flex flex-col text-left px-4 py-3 rounded-xl transition-all ${
                activeTab === "who"
                  ? "bg-slate-800 text-white shadow-md shadow-slate-950/50 ring-1 ring-indigo-500/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
              }`}
            >
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" />
                Guests & Rooms
              </span>
              <span className="text-sm font-semibold truncate text-white mt-0.5">
                {adults + childrenCount} Guests · {rooms} {rooms === 1 ? "Room" : "Rooms"}
              </span>
            </button>
          </div>
        </div>

        {/* Tab Body Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {/* WHERE CONTENT */}
          {activeTab === "where" && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="relative">
                <MapPin className="absolute left-4 top-3.5 h-5 w-5 text-slate-500" />
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="Search city, neighborhood, or landmark..."
                  autoFocus
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm"
                />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <TrendingUp className="h-3.5 w-3.5 text-indigo-400" />
                  Popular Destinations
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {POPULAR_DESTINATIONS.map((dest) => (
                    <button
                      key={dest.name}
                      type="button"
                      onClick={() => {
                        setDestination(dest.name);
                        setActiveTab("when");
                      }}
                      className={`p-3.5 rounded-2xl border text-left transition-all group flex flex-col justify-between ${
                        destination === dest.name
                          ? "bg-indigo-950/60 border-indigo-500 ring-1 ring-indigo-500/40"
                          : "bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60"
                      }`}
                    >
                      <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">
                        {dest.emoji}
                      </span>
                      <div>
                        <div className="text-sm font-bold text-white group-hover:text-indigo-300">
                          {dest.name}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">
                          {dest.tag}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* WHEN CONTENT */}
          {activeTab === "when" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <label className="block text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">
                    Check-in Date
                  </label>
                  <input
                    type="date"
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <label className="block text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">
                    Check-out Date
                  </label>
                  <input
                    type="date"
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap gap-2 pt-2">
                {[
                  { label: "Today", days: 0 },
                  { label: "Tomorrow", days: 1 },
                  { label: "This Weekend", days: 3 },
                  { label: "Next Week", days: 7 },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      const today = new Date();
                      today.setDate(today.getDate() + preset.days);
                      const tomorrow = new Date(today);
                      tomorrow.setDate(tomorrow.getDate() + 2);
                      setCheckInDate(today.toISOString().split("T")[0]);
                      setCheckOutDate(tomorrow.toISOString().split("T")[0]);
                      setActiveTab("who");
                    }}
                    className="px-3.5 py-1.5 rounded-full bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-xs font-medium text-slate-300 hover:text-white transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* WHO & ROOMS CONTENT (OYO / Airbnb Formula) */}
          {activeTab === "who" && (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Adults Counter */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <div>
                  <h4 className="text-sm font-bold text-white">Adults</h4>
                  <p className="text-xs text-slate-400">Ages 13 and above</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={adults <= 1}
                    onClick={() => setAdults(Math.max(1, adults - 1))}
                    className="h-8 w-8 rounded-full border border-slate-700 flex items-center justify-center text-slate-300 hover:border-slate-500 hover:text-white disabled:opacity-40 transition-colors"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-6 text-center font-bold text-white text-sm">
                    {adults}
                  </span>
                  <button
                    type="button"
                    disabled={adults >= 16}
                    onClick={() => setAdults(adults + 1)}
                    className="h-8 w-8 rounded-full border border-slate-700 flex items-center justify-center text-slate-300 hover:border-slate-500 hover:text-white disabled:opacity-40 transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Children Counter */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <div>
                  <h4 className="text-sm font-bold text-white">Children</h4>
                  <p className="text-xs text-slate-400">Ages 0 to 12</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={childrenCount <= 0}
                    onClick={() => setChildrenCount(Math.max(0, childrenCount - 1))}
                    className="h-8 w-8 rounded-full border border-slate-700 flex items-center justify-center text-slate-300 hover:border-slate-500 hover:text-white disabled:opacity-40 transition-colors"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-6 text-center font-bold text-white text-sm">
                    {childrenCount}
                  </span>
                  <button
                    type="button"
                    disabled={childrenCount >= 10}
                    onClick={() => setChildrenCount(childrenCount + 1)}
                    className="h-8 w-8 rounded-full border border-slate-700 flex items-center justify-center text-slate-300 hover:border-slate-500 hover:text-white disabled:opacity-40 transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Rooms Counter (OYO Style) */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <BedDouble className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Rooms</h4>
                    <p className="text-xs text-slate-400">Number of rooms needed</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={rooms <= 1}
                    onClick={() => setRooms(Math.max(1, rooms - 1))}
                    className="h-8 w-8 rounded-full border border-slate-700 flex items-center justify-center text-slate-300 hover:border-slate-500 hover:text-white disabled:opacity-40 transition-colors"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-6 text-center font-bold text-white text-sm">
                    {rooms}
                  </span>
                  <button
                    type="button"
                    disabled={rooms >= 10}
                    onClick={() => setRooms(rooms + 1)}
                    className="h-8 w-8 rounded-full border border-slate-700 flex items-center justify-center text-slate-300 hover:border-slate-500 hover:text-white disabled:opacity-40 transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Actions */}
        <div className="px-6 py-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              setDestination("");
              setCheckInDate("");
              setCheckOutDate("");
              setAdults(2);
              setChildrenCount(0);
              setRooms(1);
            }}
            className="text-xs font-semibold text-slate-400 hover:text-white underline underline-offset-4 transition-colors"
          >
            Clear all
          </button>

          <button
            type="button"
            onClick={() => handleSearchSubmit()}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-rose-500 via-indigo-600 to-violet-600 hover:from-rose-600 hover:to-violet-700 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
          >
            <Search className="h-4 w-4" />
            <span>Search Stays</span>
          </button>
        </div>
      </div>
    </div>
  );
}
