"use client";

import React, { useState, useEffect } from "react";
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
  Compass,
  Check,
} from "lucide-react";
import CalendarRangePicker from "./CalendarRangePicker";

interface SearchExpandedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (params: {
    city: string;
    destination: string;
    checkIn: string;
    checkOut: string;
    guests: number;
    rooms: number;
  }) => void;
  initialValues?: {
    city?: string;
    destination?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: number;
    rooms?: number;
  };
}

const POPULAR_DESTINATIONS = [
  {
    city: "Mumbai",
    cityId: "mumbai",
    state: "Maharashtra",
    tagline: "Skyline lofts & Arabian sea beachfronts",
    imageUrl: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=400&q=80",
    badge: "Trending",
  },
  {
    city: "Goa",
    cityId: "goa",
    state: "Goa",
    tagline: "Beach villas, infinity pools & nightlife",
    imageUrl: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=400&q=80",
    badge: "Popular",
  },
  {
    city: "Manali",
    cityId: "manali",
    state: "Himachal Pradesh",
    tagline: "Snow peaks, cedar lofts & river valleys",
    imageUrl: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=400&q=80",
    badge: "Mountains",
  },
  {
    city: "Jaipur",
    cityId: "jaipur",
    state: "Rajasthan",
    tagline: "Royal palaces, havelis & luxury tents",
    imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80",
    badge: "Heritage",
  },
  {
    city: "Bengaluru",
    cityId: "bengaluru",
    state: "Karnataka",
    tagline: "Tech lofts, leafy gardens & villas",
    imageUrl: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=400&q=80",
    badge: "Urban",
  },
  {
    city: "Kerala",
    cityId: "kerala",
    state: "Kerala",
    tagline: "Backwater villas & Ayurvedic retreats",
    imageUrl: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=400&q=80",
    badge: "Tropical",
  },
  {
    city: "Udaipur",
    cityId: "udaipur",
    state: "Rajasthan",
    tagline: "Lake Pichola palaces & sunset suites",
    imageUrl: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=400&q=80",
    badge: "Romance",
  },
  {
    city: "Delhi NCR",
    cityId: "delhi",
    state: "Delhi",
    tagline: "Diplomatic suites & boutique apartments",
    imageUrl: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=400&q=80",
    badge: "Capital",
  },
];

export default function SearchExpandedModal({
  isOpen,
  onClose,
  onSearch,
  initialValues,
}: SearchExpandedModalProps) {
  const [activeTab, setActiveTab] = useState<"where" | "dates" | "who">("where");
  const [selectedCity, setSelectedCity] = useState(initialValues?.city || "");
  const [destinationQuery, setDestinationQuery] = useState(
    initialValues?.destination || initialValues?.city || ""
  );
  const [checkIn, setCheckIn] = useState(initialValues?.checkIn || "");
  const [checkOut, setCheckOut] = useState(initialValues?.checkOut || "");
  const [adults, setAdults] = useState(initialValues?.guests ? Math.max(1, initialValues.guests) : 2);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [rooms, setRooms] = useState(initialValues?.rooms || 1);

  // Sync initial values when modal opens
  useEffect(() => {
    if (isOpen && initialValues) {
      if (initialValues.city) setSelectedCity(initialValues.city);
      if (initialValues.destination) setDestinationQuery(initialValues.destination);
      if (initialValues.checkIn) setCheckIn(initialValues.checkIn);
      if (initialValues.checkOut) setCheckOut(initialValues.checkOut);
      if (initialValues.guests) setAdults(Math.max(1, initialValues.guests));
      if (initialValues.rooms) setRooms(initialValues.rooms);
    }
  }, [isOpen, initialValues]);

  // Keyboard shortcut: close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const totalGuests = adults + children;

  const handleCitySelect = (dest: typeof POPULAR_DESTINATIONS[0]) => {
    setSelectedCity(dest.city);
    setDestinationQuery(dest.city);
    setActiveTab("dates");
  };

  const handleSearchSubmit = () => {
    const finalCity = selectedCity || destinationQuery.trim();
    onSearch({
      city: finalCity,
      destination: destinationQuery.trim(),
      checkIn,
      checkOut,
      guests: totalGuests,
      rooms,
    });
    onClose();
  };

  const filteredDestinations = destinationQuery.trim()
    ? POPULAR_DESTINATIONS.filter(
        (d) =>
          d.city.toLowerCase().includes(destinationQuery.toLowerCase()) ||
          d.state.toLowerCase().includes(destinationQuery.toLowerCase()) ||
          d.tagline.toLowerCase().includes(destinationQuery.toLowerCase())
      )
    : POPULAR_DESTINATIONS;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-3 sm:px-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-4xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl shadow-black/80 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header & Search Bar Navigation Pill */}
        <div className="p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between gap-3 bg-slate-900/90">
          <div className="flex items-center gap-1 sm:gap-2 p-1.5 rounded-full bg-slate-950 border border-slate-800 flex-1 max-w-2xl">
            {/* Where Tab */}
            <button
              type="button"
              onClick={() => setActiveTab("where")}
              className={`flex-1 px-3 sm:px-5 py-2.5 rounded-full text-left transition-all ${
                activeTab === "where"
                  ? "bg-slate-800 text-white shadow-md"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Where</div>
              <div className="text-xs sm:text-sm font-semibold truncate text-white">
                {selectedCity || destinationQuery || "Search destinations"}
              </div>
            </button>

            {/* When Tab */}
            <button
              type="button"
              onClick={() => setActiveTab("dates")}
              className={`flex-1 px-3 sm:px-5 py-2.5 rounded-full text-left transition-all ${
                activeTab === "dates"
                  ? "bg-slate-800 text-white shadow-md"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">When</div>
              <div className="text-xs sm:text-sm font-semibold truncate text-white">
                {checkIn ? (checkOut ? `${checkIn.slice(5)} – ${checkOut.slice(5)}` : checkIn.slice(5)) : "Add dates"}
              </div>
            </button>

            {/* Who Tab */}
            <button
              type="button"
              onClick={() => setActiveTab("who")}
              className={`flex-1 px-3 sm:px-5 py-2.5 rounded-full text-left transition-all ${
                activeTab === "who"
                  ? "bg-slate-800 text-white shadow-md"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Who & Rooms</div>
              <div className="text-xs sm:text-sm font-semibold truncate text-white">
                {totalGuests} {totalGuests === 1 ? "Guest" : "Guests"} · {rooms} {rooms === 1 ? "Room" : "Rooms"}
              </div>
            </button>
          </div>

          {/* Close Modal */}
          <button
            type="button"
            onClick={onClose}
            className="p-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body / Tab Content */}
        <div className="p-4 sm:p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {/* 1. WHERE TAB */}
          {activeTab === "where" && (
            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Search by Destination, City or Landmark
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-indigo-400" />
                  <input
                    type="text"
                    value={destinationQuery}
                    onChange={(e) => {
                      setDestinationQuery(e.target.value);
                      setSelectedCity("");
                    }}
                    placeholder="Where are you going? (e.g. Mumbai, Goa, Manali, Jaipur)"
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm font-medium transition-colors"
                    autoFocus
                  />
                  {destinationQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setDestinationQuery("");
                        setSelectedCity("");
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                    <span>Popular & Trending Destinations</span>
                  </h4>
                  <span className="text-xs text-slate-500">Instant One-Click Pick</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
                  {filteredDestinations.map((dest) => {
                    const isSelected = selectedCity.toLowerCase() === dest.city.toLowerCase();
                    return (
                      <button
                        key={dest.cityId}
                        type="button"
                        onClick={() => handleCitySelect(dest)}
                        className={`group p-3 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between relative overflow-hidden ${
                          isSelected
                            ? "bg-indigo-950/40 border-indigo-500/80 shadow-lg shadow-indigo-500/10 scale-[1.02]"
                            : "bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/50"
                        }`}
                      >
                        <div className="h-28 w-full rounded-xl overflow-hidden mb-2.5 relative">
                          <img
                            src={dest.imageUrl}
                            alt={dest.city}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-md text-[10px] font-bold text-white uppercase border border-slate-700">
                            {dest.badge}
                          </span>
                          {isSelected && (
                            <div className="absolute top-2 right-2 h-6 w-6 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-md">
                              <Check className="h-3.5 w-3.5 stroke-[3]" />
                            </div>
                          )}
                        </div>

                        <div>
                          <div className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">
                            {dest.city}
                          </div>
                          <div className="text-xs text-slate-400">{dest.state}</div>
                          <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">{dest.tagline}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 2. DATES TAB */}
          {activeTab === "dates" && (
            <div className="space-y-4">
              <CalendarRangePicker
                checkIn={checkIn}
                checkOut={checkOut}
                onChange={(inDate, outDate) => {
                  setCheckIn(inDate);
                  setCheckOut(outDate);
                }}
                onApply={() => setActiveTab("who")}
              />
            </div>
          )}

          {/* 3. WHO & ROOMS TAB */}
          {activeTab === "who" && (
            <div className="space-y-6 max-w-xl mx-auto py-2">
              {/* Adults */}
              <div className="flex items-center justify-between pb-5 border-b border-slate-800">
                <div>
                  <div className="text-sm font-bold text-white">Adults</div>
                  <div className="text-xs text-slate-400">Ages 13 and above</div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={adults <= 1}
                    onClick={() => setAdults(Math.max(1, adults - 1))}
                    className="h-9 w-9 rounded-full border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white hover:border-slate-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-8 text-center font-bold text-sm text-white">{adults}</span>
                  <button
                    type="button"
                    disabled={adults >= 16}
                    onClick={() => setAdults(adults + 1)}
                    className="h-9 w-9 rounded-full border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white hover:border-slate-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Children */}
              <div className="flex items-center justify-between pb-5 border-b border-slate-800">
                <div>
                  <div className="text-sm font-bold text-white">Children</div>
                  <div className="text-xs text-slate-400">Ages 2–12 years</div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={children <= 0}
                    onClick={() => setChildren(Math.max(0, children - 1))}
                    className="h-9 w-9 rounded-full border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white hover:border-slate-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-8 text-center font-bold text-sm text-white">{children}</span>
                  <button
                    type="button"
                    disabled={children >= 8}
                    onClick={() => setChildren(children + 1)}
                    className="h-9 w-9 rounded-full border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white hover:border-slate-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Infants */}
              <div className="flex items-center justify-between pb-5 border-b border-slate-800">
                <div>
                  <div className="text-sm font-bold text-white">Infants</div>
                  <div className="text-xs text-slate-400">Under 2 years (stay free)</div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={infants <= 0}
                    onClick={() => setInfants(Math.max(0, infants - 1))}
                    className="h-9 w-9 rounded-full border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white hover:border-slate-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-8 text-center font-bold text-sm text-white">{infants}</span>
                  <button
                    type="button"
                    disabled={infants >= 4}
                    onClick={() => setInfants(infants + 1)}
                    className="h-9 w-9 rounded-full border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white hover:border-slate-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Rooms */}
              <div className="flex items-center justify-between pb-2">
                <div>
                  <div className="text-sm font-bold text-white">Number of Rooms</div>
                  <div className="text-xs text-slate-400">Required bedrooms / suites</div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={rooms <= 1}
                    onClick={() => setRooms(Math.max(1, rooms - 1))}
                    className="h-9 w-9 rounded-full border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white hover:border-slate-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-8 text-center font-bold text-sm text-white">{rooms}</span>
                  <button
                    type="button"
                    disabled={rooms >= 8}
                    onClick={() => setRooms(rooms + 1)}
                    className="h-9 w-9 rounded-full border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white hover:border-slate-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer Action */}
        <div className="p-4 sm:p-6 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-4">
          <div className="text-xs text-slate-400">
            {selectedCity ? (
              <span className="font-semibold text-slate-200">
                Destination: <span className="text-indigo-400">{selectedCity}</span>
              </span>
            ) : destinationQuery ? (
              <span className="font-semibold text-slate-200">
                Search: <span className="text-indigo-400">{destinationQuery}</span>
              </span>
            ) : (
              <span>Select destination & dates</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSearchSubmit}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 via-indigo-600 to-violet-600 hover:from-rose-400 hover:to-violet-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-indigo-500/25 flex items-center gap-2 hover:scale-[1.02] transition-all"
            >
              <Search className="h-4 w-4" />
              <span>Search Stays</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
