"use client";

import React, { useState, useEffect } from "react";
import { Heart } from "lucide-react";

interface WishlistHeartButtonProps {
  propertyId: string;
  initialIsFavorited?: boolean;
  className?: string;
}

export default function WishlistHeartButton({
  propertyId,
  initialIsFavorited = false,
  className = "",
}: WishlistHeartButtonProps) {
  const [isFavorited, setIsFavorited] = useState<boolean>(initialIsFavorited);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    setIsFavorited(initialIsFavorited);
  }, [initialIsFavorited]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isSubmitting) return;

    // Optimistic update
    const previousState = isFavorited;
    setIsFavorited(!previousState);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsFavorited(data.isFavorited);
      } else {
        // Revert on error
        setIsFavorited(previousState);
        if (data.error) {
          alert(data.error);
        }
      }
    } catch (err) {
      console.error("Wishlist toggle failed:", err);
      setIsFavorited(previousState);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={isFavorited ? "Remove from wishlist" : "Save to wishlist"}
      className={`relative p-2.5 rounded-full transition-all duration-200 backdrop-blur-md ${
        isFavorited
          ? "bg-rose-500/20 text-rose-500 border border-rose-500/40 hover:bg-rose-500/30 scale-105"
          : "bg-slate-900/60 text-slate-300 border border-white/10 hover:text-white hover:bg-slate-900/90 hover:scale-110"
      } ${className}`}
    >
      <Heart
        className={`h-4 w-4 transition-all duration-300 ${
          isFavorited ? "fill-rose-500 text-rose-500 scale-110 animate-in zoom-in-50" : ""
        }`}
      />
    </button>
  );
}
