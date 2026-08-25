import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/authorization";
import { db } from "@/lib";
import { properties, propertyImages, rooms as roomsTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Stay, addCustomStay, deleteCustomStay, getAllStays, customStaysStore } from "@/data/stays";

/**
 * GET /api/properties
 * Returns all properties owned by the authenticated OWNER or ADMIN
 */
export async function GET(req: NextRequest) {
  try {
    const access = await requireRole("OWNER", "ADMIN", "GUEST");
    if (access.status || !access.user) {
      return NextResponse.json(
        { error: access.status === 401 ? "Authentication required" : "Unauthorized" },
        { status: access.status || 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const filterMine = searchParams.get("mine") === "true";

    const all = getAllStays();

    if (filterMine) {
      const userEmail = access.user.email.toLowerCase().trim();
      const userProperties = all.filter((p) => {
        if (access.user?.role === "ADMIN") return true;
        return p.hostEmail?.toLowerCase().trim() === userEmail;
      });

      return NextResponse.json({
        success: true,
        properties: userProperties,
        total: userProperties.length,
      });
    }

    return NextResponse.json({
      success: true,
      properties: all,
      total: all.length,
    });
  } catch (error) {
    console.error("Failed to fetch properties:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load properties" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/properties
 * Creates a new property with Cloudinary photos, holiday pricing, and room details
 */
export async function POST(req: NextRequest) {
  try {
    const access = await requireRole("OWNER", "ADMIN");
    if (access.status || !access.user) {
      return NextResponse.json(
        { error: access.status === 401 ? "Authentication required" : "Only Owners & Admins can publish properties" },
        { status: access.status || 403 }
      );
    }

    const body = await req.json();

    const {
      title,
      type = "VILLA",
      category = "villas",
      city,
      address,
      state = "Maharashtra",
      country = "India",
      tag,
      description,
      pricePerNight,
      originalPrice,
      holidaySurgePrice,
      isHolidayAvailable = true,
      holidayPricing = [],
      maxGuests = 4,
      bedrooms = 2,
      beds = 2,
      bathrooms = 2,
      amenities = [],
      gallery = [],
      houseRules = [],
      sleepingArrangements = [],
      rooms = [],
      checkInTime = "2:00 PM",
      checkOutTime = "11:00 AM",
      isInstantBook = true,
      latitude,
      longitude,
    } = body;

    if (!title || !city || !pricePerNight) {
      return NextResponse.json(
        { error: "Please provide property title, destination city, and nightly base price" },
        { status: 400 }
      );
    }

    const primaryImage =
      gallery.length > 0
        ? gallery[0]
        : "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80";

    const propertySlug = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .slice(0, 30);
    const newId = `${city.toLowerCase().replace(/[^a-z0-9]/g, "")}-${propertySlug}-${Date.now().toString().slice(-4)}`;

    const newStay: Stay = {
      id: newId,
      title: title.trim(),
      location: `${address ? address + ", " : ""}${city}`,
      city: city.trim(),
      cityId: city.toLowerCase().replace(/[^a-z0-9]/g, ""),
      state: state.trim(),
      category: category,
      propertyType: type,
      rating: 5.0,
      reviewsCount: 0,
      pricePerNight: Number(pricePerNight),
      originalPrice: Number(originalPrice || Math.round(Number(pricePerNight) * 1.25)),
      holidaySurgePrice: Number(holidaySurgePrice || Math.round(Number(pricePerNight) * 1.4)),
      isHolidayAvailable: Boolean(isHolidayAvailable),
      holidayPricing: Array.isArray(holidayPricing) ? holidayPricing : [],
      tag: tag || `${type} · Holiday Booking Open`,
      imageUrl: primaryImage,
      gallery: gallery.length > 0 ? gallery : [primaryImage],
      amenities: Array.isArray(amenities) && amenities.length > 0 ? amenities : ["High-Speed Wi-Fi", "Air Conditioning", "Free Parking"],
      maxGuests: Number(maxGuests),
      bedrooms: Number(bedrooms),
      beds: Number(beds),
      bathrooms: Number(bathrooms),
      isSuperhost: true,
      isInstantBook: Boolean(isInstantBook),
      description: description || `Welcome to ${title}, an exclusive ${category} retreat in ${city} perfect for holidays and family getaways.`,
      lat: Number(latitude) || 19.076,
      lng: Number(longitude) || 72.8777,
      host: {
        name: access.user.name || "StaySpot Host",
        avatar: access.user.imageUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
        isSuperhost: true,
        yearsHosting: 1,
        responseRate: 100,
        responseTime: "within an hour",
        bio: `Owner & Host of luxury stays in ${city}.`,
      },
      hostEmail: access.user.email,
      sleepingArrangements:
        Array.isArray(sleepingArrangements) && sleepingArrangements.length > 0
          ? sleepingArrangements
          : [
              { roomName: "Master Suite", bedType: "1 King Bed", count: 1 },
              { roomName: "Guest Bedroom", bedType: "1 Queen Bed", count: 1 },
            ],
      rooms: Array.isArray(rooms) && rooms.length > 0 ? rooms : undefined,
      reviews: [],
      cleaningFee: 1200,
      serviceFee: 850,
      houseRules:
        Array.isArray(houseRules) && houseRules.length > 0
          ? houseRules
          : [
              `Check-in: ${checkInTime}`,
              `Checkout: ${checkOutTime}`,
              "No smoking indoors",
              "Quiet hours after 10:30 PM",
            ],
      status: "APPROVED",
      createdAt: new Date().toISOString(),
    };

    // 1. Add to in-memory active stays store
    addCustomStay(newStay);

    // 2. Persist to PostgreSQL if properties table is reachable
    try {
      const [insertedProperty] = await db
        .insert(properties)
        .values({
          hostId: access.user.id,
          name: newStay.title,
          type: type as any,
          description: newStay.description,
          address: address || city,
          city: newStay.city,
          state: newStay.state,
          country: country,
          checkInTime: checkInTime,
          checkOutTime: checkOutTime,
          status: "APPROVED",
        })
        .returning();

      if (insertedProperty && gallery.length > 0) {
        for (let i = 0; i < gallery.length; i++) {
          await db.insert(propertyImages).values({
            propertyId: insertedProperty.id,
            imageUrl: gallery[i],
            isPrimary: i === 0,
          });
        }
      }

      if (insertedProperty && Array.isArray(rooms) && rooms.length > 0) {
        for (const r of rooms) {
          await db.insert(roomsTable).values({
            propertyId: insertedProperty.id,
            name: r.name || "Deluxe Suite",
            description: r.description || "",
            maxGuests: Number(r.maxGuests) || 2,
            bedType: r.bedType || "1 King Bed",
            pricePerNight: Number(r.pricePerNight) || Number(pricePerNight),
            totalUnits: Number(r.totalUnits) || 1,
          });
        }
      }
    } catch (dbErr) {
      console.warn("Notice: PostgreSQL property insert skipped or pending migration:", dbErr);
    }

    return NextResponse.json({
      success: true,
      message: "Property published successfully for holiday bookings!",
      property: newStay,
    });
  } catch (error) {
    console.error("Failed to create property:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to publish property" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/properties
 * Deletes a property by ID
 */
export async function DELETE(req: NextRequest) {
  try {
    const access = await requireRole("OWNER", "ADMIN");
    if (access.status || !access.user) {
      return NextResponse.json(
        { error: access.status === 401 ? "Authentication required" : "Unauthorized" },
        { status: access.status || 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing property ID" }, { status: 400 });
    }

    const deleted = deleteCustomStay(id);

    return NextResponse.json({
      success: true,
      message: deleted ? "Property deleted successfully" : "Property not found",
    });
  } catch (error) {
    console.error("Failed to delete property:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete property" },
      { status: 500 }
    );
  }
}
