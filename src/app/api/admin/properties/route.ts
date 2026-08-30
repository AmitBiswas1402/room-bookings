import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/authorization";
import { db } from "@/lib";
import { properties, users, rooms, propertyImages } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const access = await requireRole("ADMIN");
    if (access.status || !access.user) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: access.status || 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get("status"); // 'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL'

    const allProps = await db
      .select({
        id: properties.id,
        name: properties.name,
        type: properties.type,
        description: properties.description,
        address: properties.address,
        city: properties.city,
        state: properties.state,
        country: properties.country,
        status: properties.status,
        checkInTime: properties.checkInTime,
        checkOutTime: properties.checkOutTime,
        createdAt: properties.createdAt,
        hostId: properties.hostId,
        hostName: users.name,
        hostEmail: users.email,
        hostImage: users.imageUrl,
      })
      .from(properties)
      .leftJoin(users, eq(properties.hostId, users.id))
      .orderBy(desc(properties.createdAt));

    // Fetch rooms and photos
    const allRooms = await db.select().from(rooms);
    const allImages = await db.select().from(propertyImages);

    const enriched = allProps
      .filter((p) => (!statusFilter || statusFilter === "ALL" ? true : p.status === statusFilter))
      .map((p) => {
        const propRooms = allRooms.filter((r) => r.propertyId === p.id);
        const propImages = allImages.filter((img) => img.propertyId === p.id);
        const minPrice = propRooms.length > 0 ? Math.min(...propRooms.map((r) => r.pricePerNight)) : 0;

        return {
          ...p,
          roomsCount: propRooms.length,
          minPrice,
          images: propImages.map((img) => img.imageUrl),
          coverImage: propImages[0]?.imageUrl || "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80",
        };
      });

    return NextResponse.json({
      success: true,
      properties: enriched,
    });
  } catch (error) {
    console.error("Admin fetch properties error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load properties" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const access = await requireRole("ADMIN");
    if (access.status || !access.user) {
      return NextResponse.json(
        { error: "Admin authorization required" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { propertyId, status } = body;

    if (!propertyId || !status || !["APPROVED", "REJECTED", "PENDING"].includes(status)) {
      return NextResponse.json(
        { error: "Valid propertyId and status ('APPROVED', 'REJECTED', 'PENDING') are required" },
        { status: 400 }
      );
    }

    const [updated] = await db
      .update(properties)
      .set({
        status: status as "APPROVED" | "REJECTED" | "PENDING",
        updatedAt: new Date(),
      })
      .where(eq(properties.id, propertyId))
      .returning();

    return NextResponse.json({
      success: true,
      message: `Property listing "${updated.name}" has been ${status.toLowerCase()}.`,
      property: updated,
    });
  } catch (error) {
    console.error("Admin approve/reject property error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update property status" },
      { status: 500 }
    );
  }
}
