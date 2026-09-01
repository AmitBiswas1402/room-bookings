import {
  pgTable,
  pgEnum,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  date,
  decimal,
  real,
  unique,
} from "drizzle-orm/pg-core";

/* =========================
   ENUMS
========================= */

export const userRoleEnum = pgEnum("user_role", [
  "ADMIN",
  "OWNER",
  "HOST",
  "GUEST",
]);

export const propertyTypeEnum = pgEnum("property_type", [
  "HOTEL",
  "APARTMENT",
  "VILLA",
  "HOMESTAY",
  "HOSTEL",
  "RESORT",
]);

export const propertyStatusEnum = pgEnum("property_status", [
  "PENDING",
  "APPROVED",
  "REJECTED",
]);

export const bookingStatusEnum = pgEnum("booking_status", [
  "PENDING",
  "CONFIRMED",
  "CANCELLED",
  "COMPLETED",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "PENDING",
  "PAID",
  "FAILED",
  "REFUNDED",
]);

export const notificationTypeEnum = pgEnum("notification_type", [
  "BOOKING_CONFIRMATION",
  "PAYMENT_CONFIRMATION",
  "NEW_BOOKING_OWNER",
  "CANCELLATION_GUEST",
  "CANCELLATION_OWNER",
  "BOOKING_REMINDER",
]);

/* =========================
   USERS
========================= */

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),

  clerkId: text("clerk_id").notNull().unique(),

  email: text("email").notNull().unique(),

  name: text("name"),

  imageUrl: text("image_url"),

  role: userRoleEnum("role"),

  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at", {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
});

/* =========================
   PROPERTIES
========================= */

export const properties = pgTable("properties", {
  id: uuid("id").defaultRandom().primaryKey(),

  hostId: uuid("host_id")
    .references(() => users.id, {
      onDelete: "cascade",
    })
    .notNull(),

  name: text("name").notNull(),

  type: propertyTypeEnum("type").notNull(),

  description: text("description"),

  address: text("address").notNull(),

  city: text("city").notNull(),

  state: text("state"),

  country: text("country").default("India").notNull(),

  latitude: decimal("latitude", {
    precision: 10,
    scale: 7,
  }),

  longitude: decimal("longitude", {
    precision: 10,
    scale: 7,
  }),

  status: propertyStatusEnum("status")
    .default("PENDING")
    .notNull(),

  checkInTime: text("check_in_time"),

  checkOutTime: text("check_out_time"),

  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at", {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
});

/* =========================
   PROPERTY IMAGES
========================= */

export const propertyImages = pgTable("property_images", {
  id: uuid("id").defaultRandom().primaryKey(),

  propertyId: uuid("property_id")
    .references(() => properties.id, {
      onDelete: "cascade",
    })
    .notNull(),

  imageUrl: text("image_url").notNull(),

  isPrimary: boolean("is_primary")
    .default(false)
    .notNull(),

  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
});

/* =========================
   AMENITIES
========================= */

export const amenities = pgTable("amenities", {
  id: uuid("id").defaultRandom().primaryKey(),

  name: text("name").notNull().unique(),

  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
});

export const propertyAmenities = pgTable(
  "property_amenities",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    propertyId: uuid("property_id")
      .references(() => properties.id, {
        onDelete: "cascade",
      })
      .notNull(),

    amenityId: uuid("amenity_id")
      .references(() => amenities.id, {
        onDelete: "cascade",
      })
      .notNull(),
  },
  (table) => ({
    propertyAmenityUnique: unique().on(
      table.propertyId,
      table.amenityId
    ),
  })
);

/* =========================
   ROOMS
========================= */

export const rooms = pgTable("rooms", {
  id: uuid("id").defaultRandom().primaryKey(),

  propertyId: uuid("property_id")
    .references(() => properties.id, {
      onDelete: "cascade",
    })
    .notNull(),

  name: text("name").notNull(),

  description: text("description"),

  maxGuests: integer("max_guests").notNull(),

  bedType: text("bed_type"),

  pricePerNight: integer("price_per_night").notNull(),

  totalUnits: integer("total_units").default(1).notNull(),

  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at", {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
});

/* =========================
   ROOM IMAGES
========================= */

export const roomImages = pgTable("room_images", {
  id: uuid("id").defaultRandom().primaryKey(),

  roomId: uuid("room_id")
    .references(() => rooms.id, {
      onDelete: "cascade",
    })
    .notNull(),

  imageUrl: text("image_url").notNull(),

  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
});

/* =========================
   ROOM AMENITIES
========================= */

export const roomAmenities = pgTable(
  "room_amenities",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    roomId: uuid("room_id")
      .references(() => rooms.id, {
        onDelete: "cascade",
      })
      .notNull(),

    amenityId: uuid("amenity_id")
      .references(() => amenities.id, {
        onDelete: "cascade",
      })
      .notNull(),
  },
  (table) => ({
    roomAmenityUnique: unique().on(
      table.roomId,
      table.amenityId
    ),
  })
);

/* =========================
   ROOM AVAILABILITY
========================= */

export const roomAvailability = pgTable(
  "room_availability",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    roomId: uuid("room_id")
      .references(() => rooms.id, {
        onDelete: "cascade",
      })
      .notNull(),

    date: date("date").notNull(),

    availableUnits: integer("available_units")
      .notNull(),

    price: integer("price"),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    roomDateUnique: unique().on(
      table.roomId,
      table.date
    ),
  })
);

/* =========================
   DYNAMIC PROPERTY PRICING RULES (MARKET & SEASONAL DEMAND)
========================= */

export const propertyPricingRules = pgTable("property_pricing_rules", {
  id: uuid("id").defaultRandom().primaryKey(),

  propertyId: uuid("property_id")
    .references(() => properties.id, {
      onDelete: "cascade",
    })
    .notNull(),

  roomId: uuid("room_id")
    .references(() => rooms.id, {
      onDelete: "cascade",
    }),

  startDate: date("start_date").notNull(),

  endDate: date("end_date").notNull(),

  pricePerNight: integer("price_per_night"),

  surgeMultiplier: real("surge_multiplier").default(1.0),

  reason: text("reason").notNull(), // e.g. 'Weekend Surge', 'Diwali / Holiday Demand', 'Peak Season', 'Custom Host Rate'

  isActive: boolean("is_active").default(true).notNull(),

  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
});

/* =========================
   BOOKINGS
========================= */

export const bookings = pgTable("bookings", {
  id: uuid("id").defaultRandom().primaryKey(),

  bookingNumber: text("booking_number")
    .notNull()
    .unique(),

  guestId: uuid("guest_id")
    .references(() => users.id, {
      onDelete: "restrict",
    })
    .notNull(),

  propertyId: uuid("property_id")
    .references(() => properties.id, {
      onDelete: "restrict",
    })
    .notNull(),

  checkIn: date("check_in").notNull(),

  checkOut: date("check_out").notNull(),

  guests: integer("guests").notNull(),

  totalAmount: integer("total_amount").notNull(),

  status: bookingStatusEnum("status")
    .default("PENDING")
    .notNull(),

  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at", {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
});

/* =========================
   BOOKING ROOMS
========================= */

export const bookingRooms = pgTable("booking_rooms", {
  id: uuid("id").defaultRandom().primaryKey(),

  bookingId: uuid("booking_id")
    .references(() => bookings.id, {
      onDelete: "cascade",
    })
    .notNull(),

  roomId: uuid("room_id")
    .references(() => rooms.id, {
      onDelete: "restrict",
    })
    .notNull(),

  roomName: text("room_name").notNull(),

  pricePerNight: integer("price_per_night").notNull(),

  quantity: integer("quantity")
    .default(1)
    .notNull(),

  nights: integer("nights").notNull(),

  totalPrice: integer("total_price").notNull(),
});

/* =========================
   PAYMENTS
========================= */

export const payments = pgTable("payments", {
  id: uuid("id").defaultRandom().primaryKey(),

  bookingId: uuid("booking_id")
    .references(() => bookings.id, {
      onDelete: "cascade",
    })
    .notNull(),

  razorpayOrderId: text("razorpay_order_id"),

  razorpayPaymentId: text("razorpay_payment_id"),

  stripePaymentIntentId: text(
    "stripe_payment_intent_id"
  ),

  amount: integer("amount").notNull(),

  status: paymentStatusEnum("status")
    .default("PENDING")
    .notNull(),

  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at", {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
});

/* =========================
   FAVORITES
========================= */

export const favorites = pgTable(
  "favorites",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    guestId: uuid("guest_id")
      .references(() => users.id, {
        onDelete: "cascade",
      })
      .notNull(),

    propertyId: uuid("property_id")
      .references(() => properties.id, {
        onDelete: "cascade",
      })
      .notNull(),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    favoriteUnique: unique().on(
      table.guestId,
      table.propertyId
    ),
  })
);

/* =========================
   REVIEWS
========================= */

export const reviews = pgTable("reviews", {
  id: uuid("id").defaultRandom().primaryKey(),

  guestId: uuid("guest_id")
    .references(() => users.id, {
      onDelete: "cascade",
    })
    .notNull(),

  propertyId: uuid("property_id")
    .references(() => properties.id, {
      onDelete: "cascade",
    })
    .notNull(),

  bookingId: uuid("booking_id").references(() => bookings.id, {
    onDelete: "set null",
  }),

  rating: integer("rating").notNull(),

  comment: text("comment"),

  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
});

/* =========================
   NOTIFICATIONS
========================= */

export const notifications = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),

  userId: uuid("user_id")
    .references(() => users.id, {
      onDelete: "cascade",
    })
    .notNull(),

  type: text("type").notNull(),

  title: text("title").notNull(),

  message: text("message").notNull(),

  link: text("link"),

  isRead: boolean("is_read").default(false).notNull(),

  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
});