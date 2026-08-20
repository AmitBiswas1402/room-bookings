import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { syncUserInDb } from "@/lib/authorization";
import {
  Star,
  MapPin,
  Heart,
  Flame,
  UserCheck,
  RotateCcw,
  Sparkles,
  SlidersHorizontal,
  Compass,
  CheckCircle2,
} from "lucide-react";

interface Stay {
  id: string;
  title: string;
  location: string;
  cityId: string;
  category: string;
  rating: number;
  reviews: number;
  price: number;
  originalPrice: number;
  tag: string;
  imageUrl: string;
  amenities: string[];
  maxGuests: number;
}

const ALL_STAYS: Stay[] = [
  {
    id: "1",
    title: "Azure Horizon Cliffside Villa",
    location: "Vagator, North Goa",
    cityId: "goa",
    category: "beachfront",
    rating: 4.96,
    reviews: 128,
    price: 8499,
    originalPrice: 10999,
    tag: "Superhost · Beachfront",
    imageUrl: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80",
    amenities: ["Private Pool", "Sea View", "King Bed", "Fast Wi-Fi"],
    maxGuests: 6,
  },
  {
    id: "2",
    title: "The Himalayan Cedar Loft",
    location: "Old Manali, Himachal Pradesh",
    cityId: "manali",
    category: "mountains",
    rating: 4.92,
    reviews: 94,
    price: 4299,
    originalPrice: 5500,
    tag: "Mountain Cabin · Fireplace",
    imageUrl: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80",
    amenities: ["Balcony", "Heated Rooms", "Mountain Panorama", "Breakfast"],
    maxGuests: 4,
  },
  {
    id: "3",
    title: "Heritage Haveli & Royal Courtyard",
    location: "Pink City, Jaipur",
    cityId: "jaipur",
    category: "villas",
    rating: 4.88,
    reviews: 215,
    price: 6199,
    originalPrice: 7999,
    tag: "Historic Palace",
    imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
    amenities: ["Courtyard Pool", "Traditional Dining", "Spa & Wellness"],
    maxGuests: 8,
  },
  {
    id: "4",
    title: "Skyline Glass Penthouse Suite",
    location: "Bandra West, Mumbai",
    cityId: "mumbai",
    category: "apartments",
    rating: 4.95,
    reviews: 167,
    price: 9999,
    originalPrice: 12500,
    tag: "Luxury Penthouse",
    imageUrl: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
    amenities: ["City Skyline", "Smart Automation", "Jacuzzi", "Gym"],
    maxGuests: 4,
  },
  {
    id: "5",
    title: "Palm Breeze Backwater Villa",
    location: "Kumarakom, Kerala",
    cityId: "kerala",
    category: "tropical",
    rating: 4.98,
    reviews: 82,
    price: 7499,
    originalPrice: 9200,
    tag: "Waterfront · Private Jetty",
    imageUrl: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80",
    amenities: ["Backwater View", "Ayurvedic Spa", "Houseboat Tour"],
    maxGuests: 5,
  },
  {
    id: "6",
    title: "Lake Pichola Heritage Suites",
    location: "Old City, Udaipur",
    cityId: "udaipur",
    category: "villas",
    rating: 4.91,
    reviews: 140,
    price: 8999,
    originalPrice: 11500,
    tag: "Lakefront Palace",
    imageUrl: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80",
    amenities: ["Rooftop Restaurant", "Lake View", "Royal Butler"],
    maxGuests: 6,
  },
  {
    id: "7",
    title: "Silicon Valley Tech Oasis Loft",
    location: "Indiranagar, Bengaluru",
    cityId: "bengaluru",
    category: "apartments",
    rating: 4.87,
    reviews: 112,
    price: 3899,
    originalPrice: 4800,
    tag: "Modern Loft · High Speed Wi-Fi",
    imageUrl: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
    amenities: ["Workstation", "Coffee Bar", "Garden Patio"],
    maxGuests: 3,
  },
  {
    id: "8",
    title: "The Diplomatic Imperial Suite",
    location: "Lutyens Zone, Delhi NCR",
    cityId: "delhi",
    category: "hotels",
    rating: 4.89,
    reviews: 178,
    price: 5999,
    originalPrice: 7500,
    tag: "Heritage Hotel",
    imageUrl: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80",
    amenities: ["Lounge Access", "Fine Dining", "Airport Shuttle"],
    maxGuests: 4,
  },
  {
    id: "9",
    title: "Canopy Treehouse & Tea Estate",
    location: "Nilgiris, Ooty",
    cityId: "ooty",
    category: "nature",
    rating: 4.97,
    reviews: 64,
    price: 5299,
    originalPrice: 6800,
    tag: "Treehouse · Eco Stay",
    imageUrl: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80",
    amenities: ["Tea Garden Tour", "Bonfire", "Bird Watching"],
    maxGuests: 4,
  },
  {
    id: "10",
    title: "Ganges Riverfront Yoga & Glamping",
    location: "Tapovan, Rishikesh",
    cityId: "rishikesh",
    category: "glamping",
    rating: 4.93,
    reviews: 98,
    price: 3499,
    originalPrice: 4500,
    tag: "Glamping · Riverside",
    imageUrl: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80",
    amenities: ["Yoga Deck", "Organic Cafe", "Rafting Access"],
    maxGuests: 3,
  },
];

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{
    city?: string;
    category?: string;
    destination?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: string;
    rooms?: string;
  }>;
}) {
  const clerkUser = await currentUser();
  let dbUser = null;

  if (clerkUser) {
    dbUser = await syncUserInDb();

    // If signed-in user has role === null (and not an ADMIN), redirect to /choose-role
    if (dbUser && !dbUser.role) {
      redirect("/choose-role");
    }
  }

  const params = await searchParams;
  const activeCity = (params.city || "").toLowerCase().trim();
  const activeCategory = (params.category || "").toLowerCase().trim();
  const activeDestination = (params.destination || "").toLowerCase().trim();
  const requiredGuests = Number(params.guests) || 0;

  // Filter listings based on active search parameters
  const filteredStays = ALL_STAYS.filter((stay) => {
    // City filter
    if (activeCity && activeCity !== "all") {
      const matchesCity =
        stay.cityId.toLowerCase() === activeCity ||
        stay.location.toLowerCase().includes(activeCity);
      if (!matchesCity) return false;
    }

    // Category filter
    if (activeCategory && activeCategory !== "all") {
      const matchesCategory =
        stay.category.toLowerCase() === activeCategory ||
        stay.tag.toLowerCase().includes(activeCategory);
      if (!matchesCategory) return false;
    }

    // Destination text search
    if (activeDestination && activeDestination !== "anywhere") {
      const matchesSearch =
        stay.title.toLowerCase().includes(activeDestination) ||
        stay.location.toLowerCase().includes(activeDestination) ||
        stay.cityId.toLowerCase().includes(activeDestination);
      if (!matchesSearch) return false;
    }

    // Guest capacity filter
    if (requiredGuests > 0 && stay.maxGuests < requiredGuests) {
      return false;
    }

    return true;
  });

  const hasActiveFilters =
    (activeCity && activeCity !== "all") ||
    (activeCategory && activeCategory !== "all") ||
    (activeDestination && activeDestination !== "anywhere") ||
    requiredGuests > 0;

  return (
    <div className="flex-1 bg-slate-950 text-slate-100 flex flex-col justify-between">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1">
        {/* Logged-In User Quick Status Banner */}
        {dbUser && (
          <div className="mb-10 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-indigo-950/60 via-slate-900/80 to-slate-900 border border-indigo-500/20 backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3.5">
              <div className="h-10 w-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <UserCheck className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">
                    Logged in as {dbUser.name || dbUser.email}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      dbUser.role === "ADMIN"
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                        : dbUser.role === "OWNER"
                        ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                        : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                    }`}
                  >
                    {dbUser.role}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  {dbUser.role === "ADMIN"
                    ? "Full administrative control enabled"
                    : dbUser.role === "OWNER"
                    ? "Host mode active: Manage your properties and reservations"
                    : "Guest mode active: Search and book verified stays"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-center">
              {dbUser.role !== "ADMIN" && (
                <Link
                  href="/choose-role"
                  className="text-xs font-semibold px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                >
                  Change Role
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Section Header & Active Filters Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Flame className="h-3.5 w-3.5" />
              {activeCity && activeCity !== "all"
                ? `Stays in ${activeCity.toUpperCase()}`
                : "Trending Stays & Villas"}
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {hasActiveFilters
                ? `Filtered Stays (${filteredStays.length} found)`
                : "Popular places to stay this week"}
            </h2>
          </div>

          {/* Active Filter Badges */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 flex-wrap">
              {activeCity && activeCity !== "all" && (
                <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  City: {activeCity}
                </span>
              )}

              {activeCategory && activeCategory !== "all" && (
                <span className="px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 text-xs font-semibold flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  Category: {activeCategory}
                </span>
              )}

              {activeDestination && (
                <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold">
                  Search: {activeDestination}
                </span>
              )}

              <Link
                href="/"
                className="flex items-center gap-1 px-3 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold transition-colors"
              >
                <RotateCcw className="h-3 w-3" />
                Reset All
              </Link>
            </div>
          )}
        </div>

        {/* Empty State when no listings match */}
        {filteredStays.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-slate-900/40 border border-slate-800 my-12 max-w-xl mx-auto flex flex-col items-center">
            <div className="h-16 w-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
              <Compass className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              No stays match your criteria
            </h3>
            <p className="text-sm text-slate-400 mb-6 max-w-md">
              We couldn't find available rooms matching all current filters. Try
              clearing your filters or exploring another destination.
            </p>
            <Link
              href="/"
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all"
            >
              Browse All Stays
            </Link>
          </div>
        ) : (
          /* Stays Grid (Airbnb / OYO Card Aesthetics) */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredStays.map((stay) => (
              <div
                key={stay.id}
                className="group relative rounded-3xl bg-slate-900/60 border border-slate-800/80 overflow-hidden hover:border-slate-700 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 flex flex-col"
              >
                {/* Card Image Container */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-800">
                  <img
                    src={stay.imageUrl}
                    alt={stay.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Heart / Wishlist Button */}
                  <button className="absolute top-3 right-3 p-2 rounded-full bg-slate-950/60 hover:bg-slate-950 text-white backdrop-blur-md transition-colors">
                    <Heart className="h-4 w-4" />
                  </button>

                  {/* Tag Badge */}
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-950/70 backdrop-blur-md text-[10px] font-bold text-white border border-white/10">
                    {stay.tag}
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-400 font-medium flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-slate-500" />
                        {stay.location}
                      </span>
                      <span className="flex items-center gap-1 font-bold text-slate-100">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        {stay.rating}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                      {stay.title}
                    </h3>

                    {/* Amenities Tags */}
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      {stay.amenities.slice(0, 2).map((amenity) => (
                        <span
                          key={amenity}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700/50"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Pricing & Booking Row */}
                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-base font-extrabold text-white">
                          ₹{stay.price.toLocaleString("en-IN")}
                        </span>
                        <span className="text-xs text-slate-500 line-through">
                          ₹{stay.originalPrice.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">
                        per night · taxes incl.
                      </span>
                    </div>

                    <button className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all hover:scale-105">
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 mt-16 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-400">StaySpot</span>
            <span>&copy; {new Date().getFullYear()} StaySpot Technologies Inc.</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-300 cursor-pointer">Privacy</span>
            <span className="hover:text-slate-300 cursor-pointer">Terms</span>
            <span className="hover:text-slate-300 cursor-pointer">Destinations</span>
            <span className="hover:text-slate-300 cursor-pointer">Hosting Help</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
