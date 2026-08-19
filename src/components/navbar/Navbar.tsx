"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  User,
  Compass,
} from "lucide-react";
import SearchExpandedModal from "./SearchExpandedModal";
import CategoryCityStrip from "./CategoryCityStrip";

interface SearchState {
  destination: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  rooms: number;
}

export default function Navbar() {
  const pathname = usePathname();
  const { user, isLoaded, isSignedIn } = useUser();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [dbUserRole, setDbUserRole] = useState<string | null>(null);
  const [searchState, setSearchState] = useState<SearchState>({
    destination: "",
    checkIn: "",
    checkOut: "",
    adults: 2,
    children: 0,
    rooms: 1,
  });

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

  const handleSearchApply = (params: SearchState) => {
    setSearchState(params);
    console.log("Search applied:", params);
  };

  const isRoleSelectionPage = pathname === "/choose-role";

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-slate-950/95 backdrop-blur-xl border-b border-slate-800/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* 1. BRAND LOGO */}
          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-rose-500 via-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition-transform">
              <Hotel className="h-6 w-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent group-hover:to-rose-300 transition-colors">
                StaySpot
              </span>
              <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase -mt-1">
                Luxury & Stays
              </span>
            </div>
          </Link>

          {/* 2. DYNAMIC AIRBNB-STYLE SEARCH PILL (Center) */}
          {!isRoleSelectionPage && (
            <div className="hidden md:flex items-center">
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className="flex items-center divide-x divide-slate-800 rounded-full border border-slate-800 bg-slate-900/90 py-2 pl-6 pr-2 shadow-lg shadow-slate-950/50 hover:shadow-indigo-500/10 hover:border-slate-700 transition-all group"
              >
                {/* Destination */}
                <div className="pr-4 text-left">
                  <div className="text-xs font-bold text-slate-100 group-hover:text-indigo-400 transition-colors">
                    {searchState.destination || "Anywhere"}
                  </div>
                  <div className="text-[11px] text-slate-400">Popular stays</div>
                </div>

                {/* Dates */}
                <div className="px-4 text-left">
                  <div className="text-xs font-bold text-slate-100">
                    {searchState.checkIn
                      ? `${searchState.checkIn.slice(5)} - ${searchState.checkOut.slice(5) || "End"}`
                      : "Any week"}
                  </div>
                  <div className="text-[11px] text-slate-400">Flexible dates</div>
                </div>

                {/* Guests & Search Button */}
                <div className="pl-4 flex items-center gap-3 text-left">
                  <div>
                    <div className="text-xs font-semibold text-slate-300">
                      {searchState.adults + searchState.children > 0
                        ? `${searchState.adults + searchState.children} guests · ${searchState.rooms} room`
                        : "Add guests"}
                    </div>
                  </div>

                  <div className="h-9 w-9 rounded-full bg-gradient-to-r from-rose-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-rose-500/20 group-hover:scale-105 transition-transform">
                    <Search className="h-4 w-4" />
                  </div>
                </div>
              </button>
            </div>
          )}

          {/* 3. RIGHT-SIDE ACTIONS & CLERK AUTH */}
          <div className="flex items-center gap-3">
            {/* Host CTA */}
            <Link
              href="/choose-role"
              className="hidden lg:flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all"
            >
              <Building2 className="h-4 w-4 text-indigo-400" />
              <span>{dbUserRole === "OWNER" ? "Owner Hub" : "Become a Host"}</span>
            </Link>

            {/* Language & Currency Pill */}
            <button
              type="button"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-colors"
            >
              <Globe className="h-4 w-4 text-slate-400" />
              <span>₹ INR</span>
            </button>

            {/* Clerk Authentication Dynamic State */}
            {isLoaded && !isSignedIn && (
              <div className="flex items-center gap-2">
                <SignInButton mode="modal">
                  <button className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-900 transition-colors">
                    Sign in
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 transition-all">
                    Sign up
                  </button>
                </SignUpButton>
              </div>
            )}

            {isLoaded && isSignedIn && (
              <div className="relative flex items-center gap-2">
                {/* Role Indicator Pill */}
                {dbUserRole && (
                  <span
                    className={`hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                      dbUserRole === "ADMIN"
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                        : dbUserRole === "OWNER"
                        ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                        : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                    }`}
                  >
                    {dbUserRole === "ADMIN" && <Shield className="h-3 w-3" />}
                    {dbUserRole === "OWNER" && <Building2 className="h-3 w-3" />}
                    {dbUserRole === "GUEST" && <Compass className="h-3 w-3" />}
                    {dbUserRole}
                  </span>
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
                      href="/choose-role"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                      <User className="h-4 w-4 text-indigo-400" />
                      <span>Switch / Choose Role</span>
                    </Link>

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
                      <Link
                        href="/"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-violet-300 hover:text-white hover:bg-violet-950/40 transition-colors"
                      >
                        <Building2 className="h-4 w-4 text-violet-400" />
                        <span>Manage Properties</span>
                      </Link>
                    )}

                    {dbUserRole === "ADMIN" && (
                      <Link
                        href="/"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-300 hover:text-white hover:bg-rose-950/40 transition-colors"
                      >
                        <Shield className="h-4 w-4 text-rose-400" />
                        <span>Admin Dashboard</span>
                      </Link>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* MOBILE SEARCH TRIGGER BAR */}
        {!isRoleSelectionPage && (
          <div className="md:hidden px-4 pb-3">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md text-left"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center">
                  <Search className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Where to?</div>
                  <div className="text-[11px] text-slate-400">
                    Anywhere · Any week · Add guests
                  </div>
                </div>
              </div>
            </button>
          </div>
        )}

        {/* 4. OYO & AIRBNB CATEGORY & CITY STRIP (Shown on main browsing pages) */}
        {!isRoleSelectionPage && <CategoryCityStrip />}
      </header>

      {/* SEARCH EXPANDED MODAL */}
      <SearchExpandedModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSearch={handleSearchApply}
        initialDestination={searchState.destination}
      />
    </>
  );
}
