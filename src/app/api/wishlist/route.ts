import { NextRequest, NextResponse } from "next/server";
import { syncUserInDb } from "@/lib/authorization";
import { db } from "@/lib";
import { favorites, properties, propertyImages, users, rooms } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const user = await syncUserInDb();
    if (!user) {
      return NextResponse.json({ success: true, favoriteIds: [], favorites: [] });
    }

    // Fetch user favorites joined with property details
    const userFavorites = await db
      .select({
        favoriteId: favorites.id,
        favoritedAt: favorites.createdAt,
        propertyId: properties.id,
        name: properties.name,
        type: properties.type,
        city: properties.city,
        state: properties.state,
        address: properties.address,
        hostName: users.name,
      })
      .from(favorites)
      .innerJoin(properties, eq(favorites.propertyId, properties.id))
      .leftJoin(users, eq(properties.hostId, users.id))
      .where(eq(favorites.guestId, user.id))
      .orderBy(desc(favorites.createdAt));

    // Fetch primary images and lowest room price for properties
    const propertyIds = userFavorites.map((f) => f.propertyId);
    let imagesMap: Record<string, string> = {};
    let pricesMap: Record<string, number> = {};

    if (propertyIds.length > 0) {
      const allImages = await db
        .select({
          propertyId: propertyImages.propertyId,
          imageUrl: propertyImages.imageUrl,
        })
        .from(propertyImages);

      allImages.forEach((img) => {
        if (!imagesMap[img.propertyId]) {
          imagesMap[img.propertyId] = img.imageUrl;
        }
      });

      const allRooms = await db
        .select({
          propertyId: rooms.propertyId,
          pricePerNight: rooms.pricePerNight,
        })
        .from(rooms);

      allRooms.forEach((r) => {
        if (!pricesMap[r.propertyId] || r.pricePerNight < pricesMap[r.propertyId]) {
          pricesMap[r.propertyId] = r.pricePerNight;
        }
      });
    }

    const formattedFavorites = userFavorites.map((f) => ({
      id: f.propertyId,
      favoriteId: f.favoriteId,
      name: f.name,
      type: f.type,
      city: f.city,
      state: f.state,
      address: f.address,
      pricePerNight: pricesMap[f.propertyId] || 8500,
      hostName: f.hostName || "Verified Superhost",
      imageUrl:
        imagesMap[f.propertyId] ||
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80",
    }));

    return NextResponse.json({
      success: true,
      favoriteIds: userFavorites.map((f) => f.propertyId),
      favorites: formattedFavorites,
    });
  } catch (error) {
    console.error("Failed to fetch wishlist:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load wishlist" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await syncUserInDb();
    if (!user) {
      return NextResponse.json({ error: "Please sign in to save stays to your wishlist" }, { status: 401 });
    }

    const body = await req.json();
    const { propertyId } = body;

    if (!propertyId) {
      return NextResponse.json({ error: "propertyId is required" }, { status: 400 });
    }

    // Check if already in favorites
    const existing = await db
      .select()
      .from(favorites)
      .where(and(eq(favorites.guestId, user.id), eq(favorites.propertyId, propertyId)));

    if (existing.length > 0) {
      // Remove from favorites
      await db
        .delete(favorites)
        .where(and(eq(favorites.guestId, user.id), eq(favorites.propertyId, propertyId)));

      return NextResponse.json({
        success: true,
        isFavorited: false,
        message: "Removed from your Wishlist",
      });
    } else {
      // Add to favorites
      await db.insert(favorites).values({
        guestId: user.id,
        propertyId: propertyId,
      });

      return NextResponse.json({
        success: true,
        isFavorited: true,
        message: "Saved to your Wishlist ❤️",
      });
    }
  } catch (error) {
    console.error("Wishlist toggle error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update wishlist" },
      { status: 500 }
    );
  }
}
