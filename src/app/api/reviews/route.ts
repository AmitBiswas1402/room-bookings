import { NextRequest, NextResponse } from "next/server";
import { syncUserInDb } from "@/lib/authorization";
import { db } from "@/lib";
import { reviews, bookings, users, properties } from "@/db/schema";
import { eq, and, desc, sql, inArray } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const propertyId = searchParams.get("propertyId");

    if (!propertyId) {
      return NextResponse.json({ error: "propertyId parameter is required" }, { status: 400 });
    }

    // 1. Fetch reviews with guest info
    const propertyReviews = await db
      .select({
        id: reviews.id,
        rating: reviews.rating,
        comment: reviews.comment,
        createdAt: reviews.createdAt,
        guestId: reviews.guestId,
        guestName: users.name,
        guestImage: users.imageUrl,
      })
      .from(reviews)
      .leftJoin(users, eq(reviews.guestId, users.id))
      .where(eq(reviews.propertyId, propertyId))
      .orderBy(desc(reviews.createdAt));

    // 2. Compute aggregate ratings
    const totalReviews = propertyReviews.length;
    const averageRating =
      totalReviews > 0
        ? Number(
            (
              propertyReviews.reduce((sum, r) => sum + (r.rating || 5), 0) /
              totalReviews
            ).toFixed(2)
          )
        : 5.0;

    const distribution = {
      5: propertyReviews.filter((r) => r.rating === 5).length,
      4: propertyReviews.filter((r) => r.rating === 4).length,
      3: propertyReviews.filter((r) => r.rating === 3).length,
      2: propertyReviews.filter((r) => r.rating === 2).length,
      1: propertyReviews.filter((r) => r.rating === 1).length,
    };

    // 3. Check if current user can review this property
    let canReview = false;
    let eligibleBookingId: string | null = null;

    try {
      const user = await syncUserInDb();
      if (user) {
        // Find if user has a confirmed or completed booking for this property
        const userBookings = await db
          .select({ id: bookings.id, status: bookings.status })
          .from(bookings)
          .where(
            and(
              eq(bookings.guestId, user.id),
              eq(bookings.propertyId, propertyId),
              inArray(bookings.status, ["CONFIRMED", "COMPLETED"])
            )
          );

        if (userBookings.length > 0) {
          // Check if already reviewed
          const existingUserReview = propertyReviews.find((r) => r.guestId === user.id);
          if (!existingUserReview) {
            canReview = true;
            eligibleBookingId = userBookings[0].id;
          }
        }
      }
    } catch {
      // User not signed in
    }

    return NextResponse.json({
      success: true,
      reviews: propertyReviews,
      stats: {
        totalReviews,
        averageRating,
        distribution,
      },
      canReview,
      eligibleBookingId,
    });
  } catch (error) {
    console.error("Failed to load reviews:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load reviews" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await syncUserInDb();
    if (!user) {
      return NextResponse.json({ error: "Authentication required to submit a review" }, { status: 401 });
    }

    const body = await req.json();
    const { propertyId, rating, comment } = body;

    if (!propertyId || !rating) {
      return NextResponse.json({ error: "Property ID and rating (1-5) are required" }, { status: 400 });
    }

    const numericRating = Math.max(1, Math.min(5, Math.round(Number(rating))));

    // Verify stay completion / booking
    const validBookings = await db
      .select({ id: bookings.id })
      .from(bookings)
      .where(
        and(
          eq(bookings.guestId, user.id),
          eq(bookings.propertyId, propertyId),
          inArray(bookings.status, ["CONFIRMED", "COMPLETED"])
        )
      );

    if (validBookings.length === 0) {
      return NextResponse.json(
        { error: "Only verified guests who have booked a stay at this property can submit a review." },
        { status: 403 }
      );
    }

    const bookingId = validBookings[0].id;

    // Check for duplicate review
    const existingReview = await db
      .select()
      .from(reviews)
      .where(and(eq(reviews.guestId, user.id), eq(reviews.propertyId, propertyId)));

    if (existingReview.length > 0) {
      return NextResponse.json({ error: "You have already reviewed this stay." }, { status: 400 });
    }

    // Insert new verified review
    const [newReview] = await db
      .insert(reviews)
      .values({
        guestId: user.id,
        propertyId: propertyId,
        bookingId: bookingId,
        rating: numericRating,
        comment: comment?.trim() || "Exceptional stay, wonderful hospitality and pristine rooms!",
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: "Thank you! Your verified review has been published.",
      review: {
        ...newReview,
        guestName: user.name,
        guestImage: user.imageUrl,
      },
    });
  } catch (error) {
    console.error("Failed to submit review:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to post review" },
      { status: 500 }
    );
  }
}
