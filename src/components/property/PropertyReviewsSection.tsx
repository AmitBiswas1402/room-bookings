"use client";

import React, { useState, useEffect } from "react";
import {
  Star,
  ShieldCheck,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  User,
  Calendar,
} from "lucide-react";

interface ReviewItem {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  guestId: string;
  guestName: string | null;
  guestImage: string | null;
}

interface ReviewsStats {
  totalReviews: number;
  averageRating: number;
  distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

interface PropertyReviewsSectionProps {
  propertyId: string;
  propertyName: string;
}

export default function PropertyReviewsSection({
  propertyId,
  propertyName,
}: PropertyReviewsSectionProps) {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [stats, setStats] = useState<ReviewsStats>({
    totalReviews: 0,
    averageRating: 5.0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });
  const [canReview, setCanReview] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Review Form State
  const [newRating, setNewRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [newComment, setNewComment] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/reviews?propertyId=${encodeURIComponent(propertyId)}`);
      const data = await res.json();

      if (res.ok && data.success) {
        setReviews(data.reviews || []);
        if (data.stats) {
          setStats(data.stats);
        }
        setCanReview(Boolean(data.canReview));
      }
    } catch (err) {
      console.error("Failed to load property reviews:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [propertyId]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      setSubmitError(null);

      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId,
          rating: newRating,
          comment: newComment,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit review");
      }

      setSubmitSuccess(true);
      setCanReview(false);
      setNewComment("");
      await fetchReviews();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to post review");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-8">
      {/* Header & Aggregate Rating Score */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-white tracking-tight">
              Guest Reviews &amp; Ratings
            </h3>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-bold">
              100% Verified Stays
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Reviews can only be submitted by verified guests who have reserved this stay.
          </p>
        </div>

        {/* Big Score Box */}
        <div className="flex items-center gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800 shrink-0">
          <div className="text-center">
            <div className="text-3xl font-black text-amber-400 flex items-center justify-center gap-1 font-mono">
              <Star className="h-6 w-6 fill-amber-400 text-amber-400" />
              <span>{stats.averageRating.toFixed(1)}</span>
            </div>
            <div className="text-[10px] text-slate-400 uppercase font-bold mt-0.5">
              {stats.totalReviews} {stats.totalReviews === 1 ? "Review" : "Reviews"}
            </div>
          </div>

          <div className="h-10 w-[1px] bg-slate-800" />

          {/* Rating Bars */}
          <div className="space-y-1 text-[10px] text-slate-400 w-36">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = stats.distribution[star as keyof typeof stats.distribution] || 0;
              const percent = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-1.5">
                  <span className="w-2">{star}</span>
                  <Star className="h-2.5 w-2.5 fill-amber-400/60 text-amber-400/60" />
                  <div className="flex-1 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="w-3 text-right font-mono">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Verified Guest Submission Form */}
      {canReview && (
        <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-950 border border-indigo-500/30 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-400" />
              <h4 className="text-sm font-bold text-white">
                You stayed here! Leave a verified review
              </h4>
            </div>
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              Verified Guest
            </span>
          </div>

          {submitSuccess ? (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span>Thank you! Your verified review has been published.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmitReview} className="space-y-4">
              {submitError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                  {submitError}
                </div>
              )}

              {/* Star Picker */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Your Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 text-slate-600 transition-transform hover:scale-125"
                    >
                      <Star
                        className={`h-6 w-6 transition-colors ${
                          (hoverRating || newRating) >= star
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-700"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-amber-400 ml-2">
                    {hoverRating || newRating} / 5 Stars
                  </span>
                </div>
              </div>

              {/* Comment Textarea */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Your Feedback</label>
                <textarea
                  rows={3}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share details about the cleanliness, location, hospitality, and overall luxury experience..."
                  required
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 placeholder:text-slate-600"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all hover:scale-105 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Publishing...</span>
                    </>
                  ) : (
                    <span>Submit Verified Review</span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="py-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
            <span>Loading reviews...</span>
          </div>
        ) : reviews.length === 0 ? (
          <div className="py-10 text-center space-y-2">
            <MessageSquare className="h-8 w-8 text-slate-700 mx-auto" />
            <div className="text-xs font-bold text-slate-400">No Reviews Yet</div>
            <p className="text-[11px] text-slate-500">
              Be the first verified guest to stay and review {propertyName}!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {rev.guestImage ? (
                      <img
                        src={rev.guestImage}
                        alt={rev.guestName || "Guest"}
                        className="h-9 w-9 rounded-full object-cover border border-slate-800"
                      />
                    ) : (
                      <div className="h-9 w-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                        <User className="h-4 w-4" />
                      </div>
                    )}
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>{rev.guestName || "Verified Guest"}</span>
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {new Date(rev.createdAt).toLocaleDateString("en-IN", {
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-0.5 text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 ${
                          i < rev.rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-700"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  "{rev.comment || "Great experience!"}"
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
