import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/authorization";
import { db } from "@/lib";
import { reviews, properties, users, bookings } from "@/db/schema";
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

    const allReviews = await db
      .select({
        id: reviews.id,
        rating: reviews.rating,
        comment: reviews.comment,
        createdAt: reviews.createdAt,
        guestId: reviews.guestId,
        guestName: users.name,
        guestEmail: users.email,
        guestImage: users.imageUrl,
        propertyId: properties.id,
        propertyName: properties.name,
        propertyCity: properties.city,
      })
      .from(reviews)
      .leftJoin(properties, eq(reviews.propertyId, properties.id))
      .leftJoin(users, eq(reviews.guestId, users.id))
      .orderBy(desc(reviews.createdAt));

    const avgRating =
      allReviews.length > 0
        ? Number((allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length).toFixed(1))
        : 5.0;

    return NextResponse.json({
      success: true,
      reviews: allReviews,
      totalReviews: allReviews.length,
      averageRating: avgRating,
    });
  } catch (error) {
    console.error("Admin fetch reviews error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load reviews" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const access = await requireRole("ADMIN");
    if (access.status || !access.user) {
      return NextResponse.json(
        { error: "Admin authorization required" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const reviewId = searchParams.get("reviewId");

    if (!reviewId) {
      return NextResponse.json({ error: "reviewId is required" }, { status: 400 });
    }

    await db.delete(reviews).where(eq(reviews.id, reviewId));

    return NextResponse.json({
      success: true,
      message: "Review removed by administrator.",
    });
  } catch (error) {
    console.error("Admin delete review error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete review" },
      { status: 500 }
    );
  }
}
