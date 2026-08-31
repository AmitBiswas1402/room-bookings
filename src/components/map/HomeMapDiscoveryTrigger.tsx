"use client";

import React, { useState } from "react";
import { Map as MapIcon, Sparkles } from "lucide-react";
import { Stay } from "@/data/stays";
import HomeMapDiscoveryModal from "./HomeMapDiscoveryModal";

interface HomeMapDiscoveryTriggerProps {
  stays: Stay[];
}

export default function HomeMapDiscoveryTrigger({ stays }: HomeMapDiscoveryTriggerProps) {
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

  return (
    <>
      {/* Floating Bottom Center "Show Map" Pill Button (Airbnb / Luxury style) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-in fade-in slide-in-from-bottom-6 duration-500">
        <button
          type="button"
          onClick={() => setIsMapModalOpen(true)}
          className="px-6 py-3.5 rounded-full bg-slate-900/95 hover:bg-slate-950 text-white font-extrabold text-xs shadow-2xl shadow-black/80 border border-slate-700/80 backdrop-blur-xl flex items-center gap-2.5 transition-all hover:scale-105 hover:border-indigo-500 group"
        >
          <div className="h-6 w-6 rounded-full bg-gradient-to-r from-rose-500 to-indigo-600 flex items-center justify-center text-white shadow group-hover:rotate-12 transition-transform">
            <MapIcon className="h-3.5 w-3.5" />
          </div>
          <span className="tracking-wide">Explore on Map 🗺️</span>
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        </button>
      </div>

      {/* Full-Screen Map Discovery Modal */}
      {isMapModalOpen && (
        <HomeMapDiscoveryModal
          stays={stays}
          isOpen={isMapModalOpen}
          onClose={() => setIsMapModalOpen(false)}
        />
      )}
    </>
  );
}
