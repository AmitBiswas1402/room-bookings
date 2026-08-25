export interface HostInfo {
  name: string;
  avatar: string;
  isSuperhost: boolean;
  yearsHosting: number;
  responseRate: number;
  responseTime: string;
  bio: string;
}

export interface ReviewItem {
  id: string;
  author: string;
  avatar: string;
  rating: number;
  date: string;
  comment: string;
}

export interface SleepingArrangement {
  roomName: string;
  bedType: string;
  count: number;
}

export interface HolidayRate {
  holidayName: string;
  startDate: string;
  endDate: string;
  holidayPrice: number;
}

export interface HotelRoom {
  id: string;
  name: string;
  type: "Deluxe" | "Executive" | "Suite" | "Presidential" | "Standard" | "Villa Room";
  description: string;
  maxGuests: number;
  bedType: string;
  bedsCount: number;
  sizeSqFt: number;
  pricePerNight: number;
  originalPrice: number;
  holidayPrice?: number;
  totalUnits: number;
  imageUrl: string;
  gallery: string[];
  amenities: string[];
  mealPlan?: "Room Only" | "Free Breakfast Included" | "All Meals Included";
  cancellationPolicy?: string;
}

export interface Stay {
  id: string;
  title: string;
  location: string;
  city: string;
  cityId: string;
  state: string;
  category: "villas" | "beachfront" | "mountains" | "hotels" | "apartments" | "nature" | "tropical" | "glamping";
  propertyType?: "HOTEL" | "APARTMENT" | "VILLA" | "HOMESTAY" | "HOSTEL" | "RESORT";
  rating: number;
  reviewsCount: number;
  pricePerNight: number;
  originalPrice: number;
  holidaySurgePrice?: number;
  isHolidayAvailable?: boolean;
  holidayPricing?: HolidayRate[];
  tag: string;
  imageUrl: string;
  gallery: string[];
  amenities: string[];
  maxGuests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  isSuperhost: boolean;
  isInstantBook: boolean;
  description: string;
  lat: number;
  lng: number;
  host: HostInfo;
  hostEmail?: string;
  sleepingArrangements: SleepingArrangement[];
  rooms?: HotelRoom[];
  reviews: ReviewItem[];
  cleaningFee: number;
  serviceFee: number;
  houseRules: string[];
  status?: "APPROVED" | "PENDING" | "REJECTED";
  createdAt?: string;
}

export const ALL_STAYS: Stay[] = [
  // --- MUMBAI ---
  {
    id: "mumbai-1",
    title: "Skyline Glass Penthouse Suite",
    location: "Bandra West, Mumbai",
    city: "Mumbai",
    cityId: "mumbai",
    state: "Maharashtra",
    category: "apartments",
    rating: 4.95,
    reviewsCount: 168,
    pricePerNight: 9999,
    originalPrice: 12500,
    tag: "Luxury Penthouse · Arabian Sea Views",
    imageUrl: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=800&q=80",
    ],
    amenities: [
      "Sea View",
      "Smart Automation",
      "Jacuzzi",
      "Gym",
      "High-Speed Wi-Fi",
      "Dedicated Workspace",
      "Balcony",
      "Kitchen",
      "Air Conditioning",
      "Elevator",
      "Free Parking",
      "Security System",
    ],
    maxGuests: 4,
    bedrooms: 2,
    beds: 2,
    bathrooms: 2,
    isSuperhost: true,
    isInstantBook: true,
    description:
      "Perched high above the vibrant streets of Bandra West, this floor-to-ceiling glass penthouse offers uninterrupted 270-degree views of the Arabian Sea sunset and the glittering Mumbai skyline. Designed with custom Italian furnishings, integrated Bose acoustics, private terrace jacuzzi, and motorized blackout blinds for ultimate serenity.",
    lat: 19.0596,
    lng: 72.8295,
    cleaningFee: 1500,
    serviceFee: 950,
    host: {
      name: "Rohan & Tara Malhotra",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
      isSuperhost: true,
      yearsHosting: 5,
      responseRate: 100,
      responseTime: "within an hour",
      bio: "Interior architects and lifelong Mumbai residents passionate about providing discerning travelers with an unforgettable luxury stay.",
    },
    sleepingArrangements: [
      { roomName: "Master Bedroom", bedType: "1 King Bed", count: 1 },
      { roomName: "Bedroom 2", bedType: "1 Queen Bed", count: 1 },
    ],
    rooms: [
      {
        id: "m1-r1",
        name: "Deluxe Arabian Sea Suite",
        type: "Deluxe",
        description: "Floor-to-ceiling glass suite with direct Arabian Sea sunset views, Italian marble bath, and automated blackout shades.",
        maxGuests: 2,
        bedType: "1 King Bed",
        bedsCount: 1,
        sizeSqFt: 550,
        pricePerNight: 9999,
        originalPrice: 12500,
        holidayPrice: 13999,
        totalUnits: 2,
        imageUrl: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
        gallery: [
          "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80",
        ],
        amenities: ["Sea View", "Jacuzzi", "Smart TV", "High-Speed Wi-Fi", "Espresso Machine", "AC"],
        mealPlan: "Free Breakfast Included",
        cancellationPolicy: "Free cancellation up to 48 hours before check-in",
      },
      {
        id: "m1-r2",
        name: "Skyline Presidential Penthouse",
        type: "Presidential",
        description: "Top-floor sprawling suite featuring private wrap-around terrace, outdoor jacuzzi, integrated Bose acoustics, and panoramic city vistas.",
        maxGuests: 4,
        bedType: "2 King Beds",
        bedsCount: 2,
        sizeSqFt: 850,
        pricePerNight: 15999,
        originalPrice: 19500,
        holidayPrice: 21999,
        totalUnits: 1,
        imageUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
        gallery: [
          "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
        ],
        amenities: ["Terrace Jacuzzi", "Bose Audio", "Butler on Call", "Mini Bar", "Dedicated Workspace", "Fast Wi-Fi"],
        mealPlan: "All Meals Included",
        cancellationPolicy: "Free cancellation up to 72 hours before check-in",
      },
    ],
    reviews: [
      {
        id: "rev-m1-1",
        author: "Aarav Sharma",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
        rating: 5,
        date: "August 2026",
        comment: "Absolutely breathtaking views and world-class interior design! Watching the sunset over Bandra while relaxing in the jacuzzi was magical.",
      },
      {
        id: "rev-m1-2",
        author: "Priya Desai",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
        rating: 5,
        date: "July 2026",
        comment: "Superhost hospitality at its finest. Spotlessly clean, high-speed Wi-Fi perfect for remote work, and prime location close to top Bandra cafes.",
      },
      {
        id: "rev-m1-3",
        author: "David Miller",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
        rating: 4.9,
        date: "June 2026",
        comment: "Flawless stay in Bombay. The automated smart home features and views made this a standout trip. Highly recommend!",
      },
    ],
    houseRules: [
      "Check-in: 3:00 PM – 10:00 PM",
      "Checkout before 11:00 AM",
      "Self check-in with smart keypad",
      "No smoking indoors",
      "No commercial photography without host approval",
    ],
  },
  {
    id: "mumbai-2",
    title: "Marine Drive Art Deco Heritage Suite",
    location: "South Mumbai, Marine Drive",
    city: "Mumbai",
    cityId: "mumbai",
    state: "Maharashtra",
    category: "hotels",
    rating: 4.89,
    reviewsCount: 204,
    pricePerNight: 8499,
    originalPrice: 10500,
    tag: "Queens Necklace View · Historic Building",
    imageUrl: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=800&q=80",
    ],
    amenities: ["Sea View", "Breakfast Included", "Valet Parking", "Air Conditioning", "Concierge", "Fast Wi-Fi", "Daily Housekeeping", "Mini Bar"],
    maxGuests: 3,
    bedrooms: 1,
    beds: 2,
    bathrooms: 1,
    isSuperhost: false,
    isInstantBook: true,
    description: "Step into Bombay's golden 1930s era along the famed Queen's Necklace promenade. This restored Art Deco suite boasts heritage Burma teak floors, brass accents, panoramic bay views, and daily gourmet breakfast service.",
    lat: 18.9438,
    lng: 72.8232,
    cleaningFee: 1000,
    serviceFee: 750,
    host: {
      name: "Heritage Grand Stays",
      avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80",
      isSuperhost: false,
      yearsHosting: 8,
      responseRate: 98,
      responseTime: "within an hour",
      bio: "Preserving South Mumbai's architectural legacy with curated heritage residences and bespoke concierge services.",
    },
    sleepingArrangements: [
      { roomName: "Heritage Bedroom", bedType: "1 King Bed + 1 Daybed", count: 2 },
    ],
    reviews: [
      {
        id: "rev-m2-1",
        author: "Kavita Nair",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80",
        rating: 5,
        date: "August 2026",
        comment: "The location on Marine Drive is unbeatable. The sea breeze and evening lights over the bay are mesmerizing.",
      },
    ],
    houseRules: [
      "Check-in: 2:00 PM",
      "Checkout: 12:00 PM",
      "No parties or events",
      "Government photo ID required at check-in",
    ],
  },
  {
    id: "mumbai-3",
    title: "Juhu Beachfront Designer Bungalow",
    location: "Juhu Tara Road, Mumbai",
    city: "Mumbai",
    cityId: "mumbai",
    state: "Maharashtra",
    category: "beachfront",
    rating: 4.98,
    reviewsCount: 142,
    pricePerNight: 16999,
    originalPrice: 21000,
    tag: "Private Lawn · Direct Beach Access",
    imageUrl: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=800&q=80",
    ],
    amenities: ["Private Pool", "Beach Access", "Chef on Demand", "Garden", "Security", "Free Parking", "BBQ Grill", "Air Conditioning"],
    maxGuests: 8,
    bedrooms: 4,
    beds: 5,
    bathrooms: 4,
    isSuperhost: true,
    isInstantBook: false,
    description: "An exclusive beachfront private sanctuary in celebrity-favored Juhu. Featuring a 40-foot private swimming pool, sprawling green lawn with direct sand access, private chef on request, and bespoke coastal architecture.",
    lat: 19.0988,
    lng: 72.8267,
    cleaningFee: 2500,
    serviceFee: 1500,
    host: {
      name: "Vikram Singhania",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
      isSuperhost: true,
      yearsHosting: 6,
      responseRate: 100,
      responseTime: "within a few minutes",
      bio: "Dedicated to curating top-tier private villa getaways along India's coastal gems.",
    },
    sleepingArrangements: [
      { roomName: "Master Suite 1", bedType: "1 King Bed", count: 1 },
      { roomName: "Ocean Suite 2", bedType: "1 King Bed", count: 1 },
      { roomName: "Garden Suite 3", bedType: "1 Queen Bed", count: 1 },
      { roomName: "Guest Bedroom 4", bedType: "2 Single Beds", count: 2 },
    ],
    reviews: [
      {
        id: "rev-m3-1",
        author: "Meera Kapoor",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
        rating: 5,
        date: "August 2026",
        comment: "Unbelievable luxury in Mumbai! Having private beach access and a pool right in Juhu felt like an oasis in the city.",
      },
    ],
    houseRules: [
      "Check-in: 3:00 PM",
      "Checkout: 11:00 AM",
      "Pets allowed upon request",
      "Quiet hours after 10:30 PM",
    ],
  },
  {
    id: "mumbai-4",
    title: "Powai Lakeside Executive High-Rise",
    location: "Hiranandani Gardens, Powai",
    city: "Mumbai",
    cityId: "mumbai",
    state: "Maharashtra",
    category: "apartments",
    rating: 4.86,
    reviewsCount: 95,
    pricePerNight: 4799,
    originalPrice: 6200,
    tag: "Lake View · European Architecture",
    imageUrl: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=800&q=80",
    ],
    amenities: ["Lake View", "Swimming Pool", "High-Speed Wi-Fi", "Kitchen", "Gym", "Elevator", "Washer", "Air Conditioning"],
    maxGuests: 3,
    bedrooms: 1,
    beds: 1,
    bathrooms: 1,
    isSuperhost: true,
    isInstantBook: true,
    description: "Centrally situated in the European-styled Hiranandani township overlooking Powai Lake, perfect for business travelers, couples, and weekend staycations.",
    lat: 19.1197,
    lng: 72.9051,
    cleaningFee: 800,
    serviceFee: 500,
    host: {
      name: "Sameer Joshi",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
      isSuperhost: true,
      yearsHosting: 4,
      responseRate: 100,
      responseTime: "within an hour",
      bio: "Tech entrepreneur and avid host providing immaculate corporate lofts with superfast fiber internet.",
    },
    sleepingArrangements: [
      { roomName: "Executive Bedroom", bedType: "1 Queen Bed", count: 1 },
    ],
    reviews: [
      {
        id: "rev-m4-1",
        author: "Nikhil Verma",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80",
        rating: 5,
        date: "July 2026",
        comment: "Excellent loft with serene lake views and walking distance to Powai's best cafes. 10/10 setup.",
      },
    ],
    houseRules: ["Check-in: 2:00 PM", "Checkout: 11:00 AM", "Self check-in", "No smoking"],
  },

  // --- GOA ---
  {
    id: "goa-1",
    title: "Azure Horizon Cliffside Villa",
    location: "Vagator, North Goa",
    city: "Goa",
    cityId: "goa",
    state: "Goa",
    category: "beachfront",
    rating: 4.96,
    reviewsCount: 128,
    pricePerNight: 8499,
    originalPrice: 10999,
    tag: "Superhost · Cliffside Infinity Pool",
    imageUrl: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=800&q=80",
    ],
    amenities: ["Private Pool", "Sea View", "King Bed", "Fast Wi-Fi", "Daily Breakfast", "Cocktail Bar", "Air Conditioning", "Sun Loungers"],
    maxGuests: 6,
    bedrooms: 3,
    beds: 3,
    bathrooms: 3,
    isSuperhost: true,
    isInstantBook: true,
    description: "Perched majestically upon the red laterite cliffs of Vagator, enjoy panoramic Arabian Sea views and spectacular sunset cocktails from your private infinity pool deck.",
    lat: 15.6030,
    lng: 73.7336,
    cleaningFee: 1200,
    serviceFee: 850,
    host: {
      name: "Captain Mario D'Souza",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80",
      isSuperhost: true,
      yearsHosting: 7,
      responseRate: 100,
      responseTime: "within an hour",
      bio: "Born and raised in Goa, offering authentic Goan hospitality and curated villa experiences.",
    },
    sleepingArrangements: [
      { roomName: "Master Cliff Suite", bedType: "1 King Bed", count: 1 },
      { roomName: "Ocean Bedroom 2", bedType: "1 Queen Bed", count: 1 },
      { roomName: "Garden Bedroom 3", bedType: "1 Queen Bed", count: 1 },
    ],
    rooms: [
      {
        id: "g1-r1",
        name: "Cliffside Sunset Villa Suite",
        type: "Suite",
        description: "Direct infinity pool access with private sunset sundeck, handcrafted teak wood four-poster king bed, and open-air rain shower.",
        maxGuests: 2,
        bedType: "1 King Bed",
        bedsCount: 1,
        sizeSqFt: 620,
        pricePerNight: 8499,
        originalPrice: 10999,
        holidayPrice: 12499,
        totalUnits: 3,
        imageUrl: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80",
        gallery: [
          "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
        ],
        amenities: ["Private Pool Access", "Sea View", "King Bed", "Balcony", "Cocktail Bar", "Fast Wi-Fi"],
        mealPlan: "Free Breakfast Included",
        cancellationPolicy: "Free cancellation up to 48 hours before check-in",
      },
      {
        id: "g1-r2",
        name: "Oceanfront Deluxe Room",
        type: "Deluxe",
        description: "Upper-level panoramic bedroom with private balcony, ocean breeze, soaking tub, and luxury toiletries.",
        maxGuests: 2,
        bedType: "1 Queen Bed",
        bedsCount: 1,
        sizeSqFt: 450,
        pricePerNight: 5999,
        originalPrice: 7500,
        holidayPrice: 8999,
        totalUnits: 4,
        imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
        gallery: [
          "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80",
        ],
        amenities: ["Ocean View", "Balcony", "Bathtub", "Smart TV", "AC", "Espresso Maker"],
        mealPlan: "Room Only",
        cancellationPolicy: "Free cancellation up to 24 hours before check-in",
      },
    ],
    reviews: [
      {
        id: "rev-g1-1",
        author: "Neha Rastogi",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
        rating: 5,
        date: "August 2026",
        comment: "The infinity pool over the cliffs is unbelievable. Mario and his staff made our vacation unforgettable!",
      },
    ],
    houseRules: ["Check-in: 2:00 PM", "Checkout: 11:00 AM", "Pool open 24/7", "No glass near pool area"],
  },
  {
    id: "goa-2",
    title: "Portuguese Colonial Heritage Estate",
    location: "Assagao, North Goa",
    city: "Goa",
    cityId: "goa",
    state: "Goa",
    category: "villas",
    rating: 4.94,
    reviewsCount: 175,
    pricePerNight: 11999,
    originalPrice: 14500,
    tag: "300-Year-Old Restored Villa",
    imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=800&q=80",
    ],
    amenities: ["Private Pool", "Courtyard", "Chef Included", "Wi-Fi", "Garden", "Pet Friendly", "Air Conditioning"],
    maxGuests: 8,
    bedrooms: 4,
    beds: 5,
    bathrooms: 4,
    isSuperhost: true,
    isInstantBook: false,
    description: "Located in the fashionable village of Assagao, this high-ceilinged Portuguese mansion features handcrafted antique tiles, sprawling verandahs, and a private azure pool.",
    lat: 15.5898,
    lng: 73.7719,
    cleaningFee: 1800,
    serviceFee: 1100,
    host: {
      name: "Isabella & Carlos",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80",
      isSuperhost: true,
      yearsHosting: 5,
      responseRate: 99,
      responseTime: "within an hour",
      bio: "Heritage conservators sharing restored Portuguese homes with fellow architectural enthusiasts.",
    },
    sleepingArrangements: [
      { roomName: "Governor's Suite", bedType: "1 King Bed", count: 1 },
      { roomName: "Verandah Suite", bedType: "1 King Bed", count: 1 },
      { roomName: "Courtyard Bedroom", bedType: "1 Queen Bed", count: 1 },
      { roomName: "Garden Room", bedType: "2 Single Beds", count: 2 },
    ],
    reviews: [
      {
        id: "rev-g2-1",
        author: "Karan Patel",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
        rating: 5,
        date: "July 2026",
        comment: "Spectacular villa with so much character. The in-house chef prepared the best Goan curry we have ever tasted.",
      },
    ],
    houseRules: ["Check-in: 3:00 PM", "Checkout: 11:00 AM", "Pet friendly", "Smoking allowed on patio only"],
  },
  {
    id: "manali-1",
    title: "The Himalayan Cedar Loft",
    location: "Old Manali, Himachal Pradesh",
    city: "Manali",
    cityId: "manali",
    state: "Himachal Pradesh",
    category: "mountains",
    rating: 4.92,
    reviewsCount: 94,
    pricePerNight: 4299,
    originalPrice: 5500,
    tag: "Mountain Cabin · Wood Fireplace",
    imageUrl: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=800&q=80",
    ],
    amenities: ["Balcony", "Heated Rooms", "Mountain Panorama", "Fireplace", "Breakfast", "High-Speed Wi-Fi", "Bonfire Pit"],
    maxGuests: 4,
    bedrooms: 2,
    beds: 2,
    bathrooms: 2,
    isSuperhost: true,
    isInstantBook: true,
    description: "Built using fragrant deodar cedar wood and local Himalayan river stone, this peaceful loft offers unobstructed vistas of snow-capped peaks and the gushing Manalsu river.",
    lat: 32.2530,
    lng: 77.1750,
    cleaningFee: 600,
    serviceFee: 400,
    host: {
      name: "Tenzing & Sonam",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
      isSuperhost: true,
      yearsHosting: 6,
      responseRate: 100,
      responseTime: "within an hour",
      bio: "Himalayan mountaineers welcoming guests to experience serene mountain living.",
    },
    sleepingArrangements: [
      { roomName: "Peak View Loft", bedType: "1 King Bed", count: 1 },
      { roomName: "Cedar Bedroom", bedType: "1 Queen Bed", count: 1 },
    ],
    reviews: [
      {
        id: "rev-man-1",
        author: "Ananya Roy",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
        rating: 5,
        date: "August 2026",
        comment: "Cozy wood fireplace, steaming chai, and snow mountains right outside your window. Dream stay!",
      },
    ],
    houseRules: ["Check-in: 1:00 PM", "Checkout: 11:00 AM", "Heated blankets provided", "Quiet hours after 10:00 PM"],
  },
  {
    id: "jaipur-1",
    title: "Heritage Haveli & Royal Courtyard",
    location: "Pink City, Jaipur",
    city: "Jaipur",
    cityId: "jaipur",
    state: "Rajasthan",
    category: "villas",
    rating: 4.88,
    reviewsCount: 215,
    pricePerNight: 6199,
    originalPrice: 7999,
    tag: "Historic Palace · Royal Rajputana",
    imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=800&q=80",
    ],
    amenities: ["Courtyard Pool", "Traditional Dining", "Spa & Wellness", "Air Conditioning", "Wi-Fi", "Cultural Performances"],
    maxGuests: 8,
    bedrooms: 4,
    beds: 4,
    bathrooms: 4,
    isSuperhost: true,
    isInstantBook: true,
    description: "Experience the timeless grandeur of royal Rajasthan with hand-painted fresco ceilings, private central marble courtyard, and authentic Rajasthani hospitality.",
    lat: 26.9220,
    lng: 75.8267,
    cleaningFee: 1400,
    serviceFee: 800,
    host: {
      name: "Rana Digvijay Singh",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80",
      isSuperhost: true,
      yearsHosting: 9,
      responseRate: 100,
      responseTime: "within an hour",
      bio: "Custodians of Jaipur's rich royal hospitality for over three generations.",
    },
    sleepingArrangements: [
      { roomName: "Maharaja Suite", bedType: "1 Royal King Bed", count: 1 },
      { roomName: "Maharani Suite", bedType: "1 Royal King Bed", count: 1 },
      { roomName: "Courtyard Room 1", bedType: "1 Queen Bed", count: 1 },
      { roomName: "Courtyard Room 2", bedType: "1 Queen Bed", count: 1 },
    ],
    reviews: [
      {
        id: "rev-j1-1",
        author: "Siddharth Rao",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
        rating: 5,
        date: "July 2026",
        comment: "Felt like royalty. The central courtyard dinners and live folk musicians were enchanting.",
      },
    ],
    houseRules: ["Check-in: 2:00 PM", "Checkout: 12:00 PM", "Traditional evening aarti at 7 PM", "No loud music after 11 PM"],
  },
  {
    id: "bengaluru-1",
    title: "Silicon Valley Tech Oasis Loft",
    location: "Indiranagar, Bengaluru",
    city: "Bengaluru",
    cityId: "bengaluru",
    state: "Karnataka",
    category: "apartments",
    rating: 4.87,
    reviewsCount: 112,
    pricePerNight: 3899,
    originalPrice: 4800,
    tag: "High-Speed Wi-Fi · Garden Patio",
    imageUrl: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=800&q=80",
    ],
    amenities: ["Workstation", "Coffee Bar", "Garden Patio", "1 Gbps Wi-Fi", "Smart TV", "Kitchen", "Self Check-in", "Air Conditioning"],
    maxGuests: 3,
    bedrooms: 1,
    beds: 1,
    bathrooms: 1,
    isSuperhost: true,
    isInstantBook: true,
    description: "An urban jungle retreat on 100ft Road Indiranagar, equipped with ergonomic Herman Miller workstations, artisanal espresso machine, and leafy private terrace.",
    lat: 12.9784,
    lng: 77.6408,
    cleaningFee: 700,
    serviceFee: 400,
    host: {
      name: "Arjun Reddy",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
      isSuperhost: true,
      yearsHosting: 4,
      responseRate: 100,
      responseTime: "within a few minutes",
      bio: "Bangalore founder creating productive, design-forward retreats for remote innovators.",
    },
    sleepingArrangements: [
      { roomName: "Loft Studio", bedType: "1 Queen Bed", count: 1 },
    ],
    reviews: [
      {
        id: "rev-b1-1",
        author: "Devika Menon",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
        rating: 5,
        date: "August 2026",
        comment: "Fastest Wi-Fi I have had in India, fantastic espresso, and right in the heart of Indiranagar!",
      },
    ],
    houseRules: ["Check-in: 2:00 PM", "Checkout: 11:00 AM", "Self check-in", "Quiet working hours"],
  },
  {
    id: "kerala-1",
    title: "Palm Breeze Backwater Villa",
    location: "Kumarakom, Kerala",
    city: "Kerala",
    cityId: "kerala",
    state: "Kerala",
    category: "tropical",
    rating: 4.98,
    reviewsCount: 82,
    pricePerNight: 7499,
    originalPrice: 9200,
    tag: "Waterfront · Private Houseboat Jetty",
    imageUrl: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=800&q=80",
    ],
    amenities: ["Backwater View", "Ayurvedic Spa", "Houseboat Tour", "Infinity Pool", "Traditional Kerala Meals", "Air Conditioning"],
    maxGuests: 5,
    bedrooms: 2,
    beds: 3,
    bathrooms: 2,
    isSuperhost: true,
    isInstantBook: true,
    description: "Surrounded by swaying coconut palms on the serene shores of Vembanad Lake. Includes private boat cruise and therapeutic Ayurvedic wellness packages.",
    lat: 9.6175,
    lng: 76.4301,
    cleaningFee: 1000,
    serviceFee: 650,
    host: {
      name: "Kurian & Mary Mathew",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80",
      isSuperhost: true,
      yearsHosting: 7,
      responseRate: 100,
      responseTime: "within an hour",
      bio: "Passionate hosts sharing the natural tranquility and culinary heritage of God's Own Country.",
    },
    sleepingArrangements: [
      { roomName: "Lakeview Bedroom 1", bedType: "1 King Bed", count: 1 },
      { roomName: "Garden Bedroom 2", bedType: "2 Single Beds", count: 2 },
    ],
    reviews: [
      {
        id: "rev-k1-1",
        author: "Rahul Ghosh",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
        rating: 5,
        date: "July 2026",
        comment: "Watching fishermen glide by on the backwaters at sunrise from our private porch was pure bliss.",
      },
    ],
    houseRules: ["Check-in: 2:00 PM", "Checkout: 11:00 AM", "Ayurvedic treatments booked on arrival"],
  },
  {
    id: "udaipur-1",
    title: "Lake Pichola Heritage Suites",
    location: "Old City, Udaipur",
    city: "Udaipur",
    cityId: "udaipur",
    state: "Rajasthan",
    category: "villas",
    rating: 4.91,
    reviewsCount: 140,
    pricePerNight: 8999,
    originalPrice: 11500,
    tag: "Lakefront Palace · Taj Lake View",
    imageUrl: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=800&q=80",
    ],
    amenities: ["Rooftop Restaurant", "Lake View", "Royal Butler", "Swimming Pool", "Boat Transfer", "Air Conditioning"],
    maxGuests: 6,
    bedrooms: 3,
    beds: 3,
    bathrooms: 3,
    isSuperhost: true,
    isInstantBook: true,
    description: "Breathtaking palace property directly on Lake Pichola. Watch royal sunsets over Jag Mandir and Lake Palace from your private ornate jharokha balcony.",
    lat: 24.5760,
    lng: 73.6835,
    cleaningFee: 1500,
    serviceFee: 900,
    host: {
      name: "Maharaj Jai Singh",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80",
      isSuperhost: true,
      yearsHosting: 8,
      responseRate: 100,
      responseTime: "within an hour",
      bio: "Preserving royal heritage and hospitality on the shores of Lake Pichola.",
    },
    sleepingArrangements: [
      { roomName: "Pichola Royal Suite", bedType: "1 King Bed", count: 1 },
      { roomName: "Jag Mandir Suite", bedType: "1 King Bed", count: 1 },
      { roomName: "Sunset Room", bedType: "1 Queen Bed", count: 1 },
    ],
    reviews: [
      {
        id: "rev-u1-1",
        author: "Tanvi Saxena",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
        rating: 5,
        date: "August 2026",
        comment: "Unmatched view of the Lake Palace. Dining on the rooftop during sunset was an experience of a lifetime.",
      },
    ],
    houseRules: ["Check-in: 2:00 PM", "Checkout: 11:00 AM", "Complimentary boat ride included"],
  },
  {
    id: "delhi-1",
    title: "The Diplomatic Imperial Suite",
    location: "Lutyens Zone, Delhi NCR",
    city: "Delhi NCR",
    cityId: "delhi",
    state: "Delhi",
    category: "hotels",
    rating: 4.89,
    reviewsCount: 178,
    pricePerNight: 5999,
    originalPrice: 7500,
    tag: "Lutyens Heritage · Green Boulevard",
    imageUrl: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=800&q=80",
    ],
    amenities: ["Lounge Access", "Fine Dining", "Airport Shuttle", "High-Speed Wi-Fi", "Spa", "Air Conditioning"],
    maxGuests: 4,
    bedrooms: 2,
    beds: 2,
    bathrooms: 2,
    isSuperhost: false,
    isInstantBook: true,
    description: "Located within the leafy, secured embassy enclave of central New Delhi, offering stately colonial luxury and swift access to India Gate and Connaught Place.",
    lat: 28.6019,
    lng: 77.2177,
    cleaningFee: 900,
    serviceFee: 600,
    host: {
      name: "Imperial Residences",
      avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80",
      isSuperhost: false,
      yearsHosting: 10,
      responseRate: 98,
      responseTime: "within an hour",
      bio: "Premier hospitality in New Delhi's most prestigious diplomatic quarter.",
    },
    sleepingArrangements: [
      { roomName: "Diplomatic Master Suite", bedType: "1 King Bed", count: 1 },
      { roomName: "Guest Suite", bedType: "1 Queen Bed", count: 1 },
    ],
    reviews: [
      {
        id: "rev-d1-1",
        author: "Christopher Evans",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
        rating: 5,
        date: "July 2026",
        comment: "Extremely secure, silent, and luxurious. High-speed internet and excellent room service.",
      },
    ],
    houseRules: ["Check-in: 2:00 PM", "Checkout: 12:00 PM", "Valid passport or ID required"],
  },
  {
    id: "ooty-1",
    title: "Canopy Treehouse & Tea Estate",
    location: "Nilgiris, Ooty",
    city: "Ooty",
    cityId: "ooty",
    state: "Tamil Nadu",
    category: "nature",
    rating: 4.97,
    reviewsCount: 64,
    pricePerNight: 5299,
    originalPrice: 6800,
    tag: "Treehouse · 40-Acre Tea Plantation",
    imageUrl: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=800&q=80",
    ],
    amenities: ["Tea Garden Tour", "Bonfire", "Bird Watching", "Mountain View", "Fireplace", "Breakfast"],
    maxGuests: 4,
    bedrooms: 2,
    beds: 2,
    bathrooms: 1,
    isSuperhost: true,
    isInstantBook: false,
    description: "Elevated treehouse nestled 30 feet above organic tea gardens in the misty Nilgiri hills. Wake up to crisp mountain air and private estate tea tastings.",
    lat: 11.4102,
    lng: 76.6950,
    cleaningFee: 600,
    serviceFee: 450,
    host: {
      name: "Joseph & Grace",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80",
      isSuperhost: true,
      yearsHosting: 5,
      responseRate: 100,
      responseTime: "within an hour",
      bio: "Organic tea planters sharing our elevated nature sanctuaries with eco-travelers.",
    },
    sleepingArrangements: [
      { roomName: "Canopy Master Suite", bedType: "1 Queen Bed", count: 1 },
      { roomName: "Loft Nook", bedType: "1 Double Bed", count: 1 },
    ],
    reviews: [
      {
        id: "rev-o1-1",
        author: "Shreya Varma",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
        rating: 5,
        date: "August 2026",
        comment: "Sleeping amongst the tree canopies with the aroma of fresh tea leaves is bliss.",
      },
    ],
    houseRules: ["Check-in: 1:00 PM", "Checkout: 11:00 AM", "Eco-friendly guidelines", "No plastic disposal"],
  },
  {
    id: "rishikesh-1",
    title: "Ganges Riverfront Yoga & Glamping",
    location: "Tapovan, Rishikesh",
    city: "Rishikesh",
    cityId: "rishikesh",
    state: "Uttarakhand",
    category: "glamping",
    rating: 4.93,
    reviewsCount: 98,
    pricePerNight: 3499,
    originalPrice: 4500,
    tag: "Riverside · Himalayan Foothills",
    imageUrl: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=800&q=80",
    ],
    amenities: ["Yoga Deck", "Organic Cafe", "Rafting Access", "Bonfire", "River View", "High-Speed Wi-Fi"],
    maxGuests: 3,
    bedrooms: 1,
    beds: 2,
    bathrooms: 1,
    isSuperhost: true,
    isInstantBook: true,
    description: "Serene riverside luxury glamping on the white sands of the holy Ganges. Features daily sunrise yoga, organic farm-to-table cuisine, and stargazing.",
    lat: 30.1345,
    lng: 78.3247,
    cleaningFee: 500,
    serviceFee: 350,
    host: {
      name: "Swami Anand & Team",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
      isSuperhost: true,
      yearsHosting: 4,
      responseRate: 100,
      responseTime: "within an hour",
      bio: "Yoga instructors offering peaceful riverside retreats in Rishikesh.",
    },
    sleepingArrangements: [
      { roomName: "Riverside Safari Tent", bedType: "1 Queen Bed + 1 Single Bed", count: 2 },
    ],
    reviews: [
      {
        id: "rev-r1-1",
        author: "Manish Kumar",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
        rating: 5,
        date: "July 2026",
        comment: "The sunrise yoga overlooking the Ganges was life-changing. Clean, comfortable, and soul-healing.",
      },
    ],
    houseRules: ["Check-in: 12:00 PM", "Checkout: 10:00 AM", "Vegetarian food only on premises", "No alcohol"],
  },
];

export interface SearchFilterParams {
  city?: string;
  category?: string;
  destination?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  rooms?: number;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  amenities?: string[];
  sort?: "recommended" | "price_asc" | "price_desc" | "rating" | "reviews";
}

/**
 * Retrieves a single stay by its ID (or case-insensitive match)
 */
export function getStayById(id: string): Stay | undefined {
  const normalizedId = id.toLowerCase().trim();
  return getAllStays().find(
    (s) =>
      s.id.toLowerCase() === normalizedId ||
      s.id.toLowerCase().replace("-", "") === normalizedId.replace("-", "")
  );
}

/**
 * Calculates number of nights between checkIn and checkOut dates.
 * Defaults to 1 if dates are invalid or identical.
 */
export function calculateNights(checkIn?: string, checkOut?: string): number {
  if (!checkIn || !checkOut) return 1;
  const start = new Date(checkIn).getTime();
  const end = new Date(checkOut).getTime();
  if (isNaN(start) || isNaN(end) || end <= start) return 1;
  const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  return Math.max(1, diffDays);
}

/**
 * Formats date range in readable format (e.g. Aug 25 - Aug 28, 2026)
 */
export function formatDateRange(checkIn?: string, checkOut?: string): string {
  if (!checkIn && !checkOut) return "Flexible dates";
  if (checkIn && !checkOut) {
    const d = new Date(checkIn);
    return isNaN(d.getTime()) ? checkIn : d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }
  const d1 = new Date(checkIn!);
  const d2 = new Date(checkOut!);
  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) {
    return `${checkIn} - ${checkOut}`;
  }
  const m1 = d1.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const m2 = d2.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  return `${m1} – ${m2}`;
}

/**
 * Formats number into Indian Rupee currency format (e.g. ₹9,999)
 */
export function formatINR(amount: number): string {
  return "₹" + amount.toLocaleString("en-IN");
}

/**
 * Filters and sorts stays based on all query parameters
 */
export function searchStays(params: SearchFilterParams): Stay[] {
  const cityQuery = (params.city || "").toLowerCase().trim();
  const destQuery = (params.destination || "").toLowerCase().trim();
  const categoryQuery = (params.category || "").toLowerCase().trim();
  const requiredGuests = params.guests || 0;
  const minPrice = params.minPrice || 0;
  const maxPrice = params.maxPrice || Infinity;
  const minRating = params.rating || 0;
  const requiredAmenities = params.amenities || [];

  let results = getAllStays().filter((stay) => {
    // 1. City Match
    if (cityQuery && cityQuery !== "all") {
      const cityMatches =
        stay.cityId.toLowerCase() === cityQuery ||
        stay.city.toLowerCase() === cityQuery ||
        stay.location.toLowerCase().includes(cityQuery) ||
        stay.state.toLowerCase().includes(cityQuery);
      if (!cityMatches) return false;
    }

    // 2. Destination keyword text search
    if (destQuery && destQuery !== "anywhere") {
      const destMatches =
        stay.title.toLowerCase().includes(destQuery) ||
        stay.location.toLowerCase().includes(destQuery) ||
        stay.city.toLowerCase().includes(destQuery) ||
        stay.tag.toLowerCase().includes(destQuery) ||
        stay.description.toLowerCase().includes(destQuery);
      if (!destMatches) return false;
    }

    // 3. Category Match
    if (categoryQuery && categoryQuery !== "all") {
      const catMatches =
        stay.category.toLowerCase() === categoryQuery ||
        stay.tag.toLowerCase().includes(categoryQuery);
      if (!catMatches) return false;
    }

    // 4. Guest Count
    if (requiredGuests > 0 && stay.maxGuests < requiredGuests) {
      return false;
    }

    // 5. Price Range
    if (stay.pricePerNight < minPrice || stay.pricePerNight > maxPrice) {
      return false;
    }

    // 6. Rating
    if (stay.rating < minRating) {
      return false;
    }

    // 7. Amenities
    if (requiredAmenities.length > 0) {
      const hasAllAmenities = requiredAmenities.every((reqAmenity) =>
        stay.amenities.some((a) => a.toLowerCase().includes(reqAmenity.toLowerCase()))
      );
      if (!hasAllAmenities) return false;
    }

    return true;
  });

  // Sorting
  switch (params.sort) {
    case "price_asc":
      results.sort((a, b) => a.pricePerNight - b.pricePerNight);
      break;
    case "price_desc":
      results.sort((a, b) => b.pricePerNight - a.pricePerNight);
      break;
    case "rating":
      results.sort((a, b) => b.rating - a.rating);
      break;
    case "reviews":
      results.sort((a, b) => b.reviewsCount - a.reviewsCount);
      break;
    case "recommended":
    default:
      // Keep curated order
      break;
  }

  return results;
}

/**
 * In-Memory dynamic store for newly published properties
 */
export const customStaysStore: Stay[] = [];

/**
 * Adds a new stay to the active catalog
 */
export function addCustomStay(newStay: Stay): Stay {
  // Check if exists
  const existingIdx = customStaysStore.findIndex((s) => s.id === newStay.id);
  if (existingIdx >= 0) {
    customStaysStore[existingIdx] = newStay;
  } else {
    customStaysStore.unshift(newStay);
  }
  return newStay;
}

/**
 * Deletes a stay by ID
 */
export function deleteCustomStay(id: string): boolean {
  const customIdx = customStaysStore.findIndex((s) => s.id === id);
  if (customIdx >= 0) {
    customStaysStore.splice(customIdx, 1);
    return true;
  }

  const staticIdx = ALL_STAYS.findIndex((s) => s.id === id);
  if (staticIdx >= 0) {
    ALL_STAYS.splice(staticIdx, 1);
    return true;
  }

  return false;
}

/**
 * Returns all active stays (combines catalog + custom stays)
 */
export function getAllStays(): Stay[] {
  const combined = [...customStaysStore, ...ALL_STAYS];
  const uniqueMap = new Map<string, Stay>();
  for (const s of combined) {
    if (!uniqueMap.has(s.id)) {
      uniqueMap.set(s.id, s);
    }
  }
  return Array.from(uniqueMap.values());
}
