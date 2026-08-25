"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  SignInButton,
  SignUpButton,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import {
  Hotel,
  Search,
  Globe,
  Menu,
  Building2,
  CalendarDays,
  Heart,
  Shield,
  Compass,
  Sparkles,
  Castle,
  Palmtree,
  Mountain,
  Plus,
} from "lucide-react";
import SearchExpandedModal from "./SearchExpandedModal";
import CategoryCityStrip from "./CategoryCityStrip";

interface SearchState {
  city: string;
  destination: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  rooms: number;
}

function NavbarContent() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoaded, isSignedIn } = useUser();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [dbUserRole, setDbUserRole] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState<"stays" | "villas" | "experiences">("stays");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Scroll listener for dynamic shrinking navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const cityParam = searchParams.get("city") || "";
  const destinationParam = searchParams.get("destination") || cityParam || "";
  const checkInParam = searchParams.get("checkIn") || "";
  const checkOutParam = searchParams.get("checkOut") || "";
  const guestsParam = Number(searchParams.get("guests")) || 2;
  const roomsParam = Number(searchParams.get("rooms")) || 1;

  const [searchState, setSearchState] = useState<SearchState>({
    city: cityParam,
    destination: destinationParam,
    checkIn: checkInParam,
    checkOut: checkOutParam,
    adults: Math.max(1, guestsParam),
    children: 0,
    rooms: Math.max(1, roomsParam),
  });

  useEffect(() => {
    setSearchState({
      city: cityParam,
      destination: destinationParam,
      checkIn: checkInParam,
      checkOut: checkOutParam,
      adults: Math.max(1, guestsParam),
      children: 0,
      rooms: Math.max(1, roomsParam),
    });
  }, [cityParam, destinationParam, checkInParam, checkOutParam, guestsParam, roomsParam]);

  // Fetch DB role for the signed in user
  useEffect(() => {
    async function fetchUserRole() {
      if (!user) {
        setDbUserRole(null);
        return;
      }

      try {
        const res = await fetch("/api/users");
        if (res.ok) {
          const data = await res.json();
          setDbUserRole(data.user?.role || null);
        }
      } catch (err) {
        console.error("Failed to fetch user role in navbar:", err);
      }
    }

    fetchUserRole();
  }, [user]);

  const handleSearchApply = (params: {
    city: string;
    destination: string;
    checkIn: string;
    checkOut: string;
    guests: number;
    rooms: number;
  }) => {
    const newParams = new URLSearchParams();

    if (params.city) newParams.set("city", params.city);
    if (params.destination && params.destination !== params.city) {
      newParams.set("destination", params.destination);
    }
    if (params.checkIn) newParams.set("checkIn", params.checkIn);
    if (params.checkOut) newParams.set("checkOut", params.checkOut);
    if (params.guests > 1) newParams.set("guests", String(params.guests));
    if (params.rooms > 1) newParams.set("rooms", String(params.rooms));

    const categoryParam = searchParams.get("category");
    if (categoryParam) newParams.set("category", categoryParam);

    const qs = newParams.toString();
    router.push(qs ? `/search?${qs}` : "/search");
  };

  const isRoleSelectionPage = pathname === "/choose-role";

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full bg-slate-950/95 backdrop-blur-2xl border-b border-slate-800/80 transition-all duration-300 ease-in-out ${
          isScrolled ? "shadow-2xl shadow-black/60 py-2.5" : "py-4 sm:py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* TOP BAR ROW: Brand + Mode Navigation / Compact Search + Actions */}
          <div className="flex items-center justify-between gap-4">
            {/* 1. BRAND LOGO */}
            <Link href="/" className="flex items-center gap-3 shrink-0 group">
              <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-2xl bg-gradient-to-tr from-rose-500 via-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition-transform">
                <Hotel className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg sm:text-xl font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent group-hover:to-rose-300 transition-colors">
                  StaySpot
                </span>
                <span className="text-[9px] sm:text-[10px] text-slate-400 font-semibold tracking-wider uppercase -mt-1">
                  Luxury & Stays
                </span>
              </div>
            </Link>

            {/* 2. CENTER SECTION: Mode Tabs (Top) OR Compact Search Pill (Scrolled) */}
            {!isRoleSelectionPage && (
              <div className="hidden md:flex items-center justify-center flex-1 max-w-xl transition-all duration-300">
                {/* When SCROLLED: Compact floating search pill appears */}
                {isScrolled ? (
                  <button
                    type="button"
                    onClick={() => setIsSearchOpen(true)}
                    className="flex items-center divide-x divide-slate-800 rounded-full border border-slate-800 bg-slate-900/90 py-1.5 pl-5 pr-2 shadow-lg shadow-slate-950/60 hover:shadow-indigo-500/10 hover:border-slate-700 transition-all duration-200 group animate-in fade-in zoom-in-95"
                  >
                    {/* Destination */}
                    <div className="pr-3.5 text-left">
                      <div className="text-xs font-bold text-slate-100 group-hover:text-indigo-400 transition-colors">
                        {searchState.city || searchState.destination || "Anywhere"}
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="px-3.5 text-left">
                      <div className="text-xs font-semibold text-slate-300">
                        {searchState.checkIn && searchState.checkOut
                          ? `${searchState.checkIn.slice(5)} – ${searchState.checkOut.slice(5)}`
                          : searchState.checkIn
                          ? searchState.checkIn.slice(5)
                          : "Any week"}
                      </div>
                    </div>

                    {/* Guests & Search Icon */}
                    <div className="pl-3.5 flex items-center gap-2.5 text-left">
                      <div className="text-xs text-slate-400">
                        {searchState.adults + searchState.children > 0
                          ? `${searchState.adults + searchState.children} guests`
                          : "Add guests"}
                      </div>
                      <div className="h-7 w-7 rounded-full bg-gradient-to-r from-rose-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-rose-500/20 group-hover:scale-105 transition-transform">
                        <Search className="h-3.5 w-3.5" />
                      </div>
                    </div>
                  </button>
                ) : (
                  /* When NOT SCROLLED: Experience Mode Switcher (Airbnb style) */
                  <div className="flex items-center gap-6 text-sm font-semibold transition-all duration-300 animate-in fade-in">
                    <button
                      type="button"
                      onClick={() => setActiveTab("stays")}
                      className={`relative py-1.5 transition-colors ${
                        activeTab === "stays" ? "text-white font-bold" : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <span>Stays</span>
                      {activeTab === "stays" && (
                        <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-rose-500 to-indigo-500 rounded-full" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab("villas");
                        router.push("/search?category=villas");
                      }}
                      className={`relative py-1.5 transition-colors ${
                        activeTab === "villas" ? "text-white font-bold" : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <span>Luxury Villas</span>
                      {activeTab === "villas" && (
                        <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-rose-500 to-indigo-500 rounded-full" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab("experiences");
                        router.push("/search?category=nature");
                      }}
                      className={`relative py-1.5 transition-colors ${
                        activeTab === "experiences" ? "text-white font-bold" : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <span>Experiences</span>
                      {activeTab === "experiences" && (
                        <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-rose-500 to-indigo-500 rounded-full" />
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 3. RIGHT-SIDE ACTIONS & CLERK AUTH */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              {/* Language & Currency Pill */}
              <button
                type="button"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-colors"
              >
                <Globe className="h-4 w-4 text-slate-400" />
                <span>₹ INR</span>
              </button>

              {/* Clerk Authentication Dynamic State */}
              {mounted && isLoaded && !isSignedIn && (
                <div className="flex items-center gap-2">
                  <SignInButton mode="modal">
                    <button className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-900 transition-colors">
                      Sign in
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 transition-all">
                      Sign up
                    </button>
                  </SignUpButton>
                </div>
              )}

              {mounted && isLoaded && isSignedIn && (
                <div className="relative flex items-center gap-2">
                  {/* Role Indicator Pill (Clickable directly to Owner/Admin Dashboard) */}
                  {dbUserRole && (
                    <Link
                      href={dbUserRole === "OWNER" || dbUserRole === "ADMIN" ? "/dashboard" : "/choose-role"}
                      className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all duration-200 hover:scale-105 shadow-sm ${
                        dbUserRole === "ADMIN"
                          ? "bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 hover:shadow-rose-500/20"
                          : dbUserRole === "OWNER"
                          ? "bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 border border-violet-500/40 hover:shadow-violet-500/20"
                          : "bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40"
                      }`}
                      title={dbUserRole === "OWNER" || dbUserRole === "ADMIN" ? "Open Owner & Admin Dashboard" : "View Role"}
                    >
                      {dbUserRole === "ADMIN" && <Shield className="h-3.5 w-3.5" />}
                      {dbUserRole === "OWNER" && <Building2 className="h-3.5 w-3.5" />}
                      {dbUserRole === "GUEST" && <Compass className="h-3.5 w-3.5" />}
                      <span>{dbUserRole}</span>
                    </Link>
                  )}

                  {/* User Dropdown Pill */}
                  <div className="flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-full border border-slate-800 bg-slate-900/90 shadow-sm">
                    <button
                      onClick={() => setIsMenuOpen(!isMenuOpen)}
                      className="flex items-center gap-1.5 text-slate-300 hover:text-white p-1 rounded-full text-xs font-semibold"
                    >
                      <Menu className="h-4 w-4" />
                    </button>
                    <UserButton />
                  </div>

                  {/* User Dropdown Menu */}
                  {isMenuOpen && (
                    <div className="absolute right-0 top-12 w-60 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50 animate-in fade-in-50 zoom-in-95">
                      <div className="px-3 py-2 border-b border-slate-800 mb-1">
                        <p className="text-xs font-bold text-white truncate">
                          {user?.fullName || "Welcome!"}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">
                          {user?.primaryEmailAddress?.emailAddress}
                        </p>
                      </div>

                      <Link
                        href="/"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                      >
                        <CalendarDays className="h-4 w-4 text-indigo-400" />
                        <span>My Bookings</span>
                      </Link>

                      <Link
                        href="/"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                      >
                        <Heart className="h-4 w-4 text-rose-400" />
                        <span>Wishlist & Saved</span>
                      </Link>

                      {(dbUserRole === "OWNER" || dbUserRole === "ADMIN") && (
                        <>
                          <Link
                            href="/dashboard"
                            onClick={() => setIsMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-violet-300 hover:text-white hover:bg-violet-950/60 transition-colors"
                          >
                            <Building2 className="h-4 w-4 text-violet-400" />
                            <span>Owner Dashboard</span>
                          </Link>

                          <Link
                            href="/dashboard?tab=create"
                            onClick={() => setIsMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-300 hover:text-white hover:bg-emerald-950/60 transition-colors"
                          >
                            <Plus className="h-4 w-4 text-emerald-400" />
                            <span>+ Add a Room / Hotel</span>
                          </Link>
                        </>
                      )}

                      {dbUserRole === "ADMIN" && (
                        <Link
                          href="/dashboard"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-300 hover:text-white hover:bg-rose-950/60 transition-colors"
                        >
                          <Shield className="h-4 w-4 text-rose-400" />
                          <span>Admin Console</span>
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* LARGE EXPANDED AIRBNB SEARCH BAR (Visible at top, smoothly compresses when scrolling) */}
          {!isRoleSelectionPage && (
            <div
              className={`hidden md:block transition-all duration-300 ease-in-out ${
                isScrolled
                  ? "max-h-0 opacity-0 -translate-y-2 pointer-events-none overflow-hidden mt-0"
                  : "max-h-24 opacity-100 translate-y-0 mt-4 sm:mt-5"
              }`}
            >
              <div className="max-w-3xl mx-auto rounded-full border border-slate-800 bg-slate-900/90 shadow-2xl shadow-black/80 p-1.5 flex items-center divide-x divide-slate-800 hover:border-slate-700 transition-all">
                {/* 1. Where */}
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(true)}
                  className="flex-1 px-5 py-2 text-left hover:bg-slate-800/60 rounded-full transition-colors group"
                >
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-300 group-hover:text-indigo-400 transition-colors">
                    Where
                  </div>
                  <div className="text-xs font-medium text-slate-400 truncate">
                    {searchState.city || searchState.destination || "Search destinations"}
                  </div>
                </button>

                {/* 2. When / Dates */}
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(true)}
                  className="flex-1 px-5 py-2 text-left hover:bg-slate-800/60 rounded-full transition-colors group"
                >
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-300 group-hover:text-indigo-400 transition-colors">
                    When
                  </div>
                  <div className="text-xs font-medium text-slate-400 truncate">
                    {searchState.checkIn && searchState.checkOut
                      ? `${searchState.checkIn.slice(5)} – ${searchState.checkOut.slice(5)}`
                      : searchState.checkIn
                      ? searchState.checkIn.slice(5)
                      : "Add dates"}
                  </div>
                </button>

                {/* 3. Who & Search Action */}
                <div className="flex-1 pl-5 pr-2 py-1.5 flex items-center justify-between gap-3 text-left">
                  <button
                    type="button"
                    onClick={() => setIsSearchOpen(true)}
                    className="flex-1 text-left group"
                  >
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-300 group-hover:text-indigo-400 transition-colors">
                      Who
                    </div>
                    <div className="text-xs font-medium text-slate-400 truncate">
                      {searchState.adults + searchState.children > 0
                        ? `${searchState.adults + searchState.children} guests · ${searchState.rooms} room`
                        : "Add guests"}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsSearchOpen(true)}
                    className="h-11 px-5 rounded-full bg-gradient-to-r from-rose-500 via-indigo-600 to-violet-600 hover:from-rose-400 hover:to-violet-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all hover:scale-105 shrink-0"
                  >
                    <Search className="h-4 w-4" />
                    <span>Search</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* MOBILE SEARCH TRIGGER BAR */}
          {!isRoleSelectionPage && (
            <div className="md:hidden mt-3">
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-2xl border border-slate-800 bg-slate-900/90 text-left shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-rose-500 to-indigo-600 flex items-center justify-center text-white">
                    <Search className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">
                      {searchState.city || searchState.destination || "Where to next?"}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {searchState.checkIn ? "Dates selected" : "Anywhere · Any week · Add guests"}
                    </div>
                  </div>
                </div>
                <span className="text-xs font-semibold text-indigo-400">Search</span>
              </button>
            </div>
          )}
        </div>

        {/* 4. OYO & AIRBNB CATEGORY & CITY STRIP */}
        {!isRoleSelectionPage && (
          <div className="mt-3">
            <CategoryCityStrip />
          </div>
        )}
      </header>

      {/* SEARCH EXPANDED MODAL */}
      <SearchExpandedModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSearch={handleSearchApply}
        initialValues={{
          city: cityParam,
          destination: destinationParam,
          checkIn: checkInParam,
          checkOut: checkOutParam,
          guests: guestsParam,
          rooms: roomsParam,
        }}
      />
    </>
  );
}

export default function Navbar() {
  return (
    <Suspense
      fallback={
        <div className="h-24 bg-slate-950 border-b border-slate-800/80 animate-pulse" />
      }
    >
      <NavbarContent />
    </Suspense>
  );
}
