"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Stay, formatINR } from "@/data/stays";
import { Star, MapPin, X, ArrowRight, Bed, Users } from "lucide-react";
import "leaflet/dist/leaflet.css";

interface PropertyDiscoveryMapProps {
  stays: Stay[];
  selectedStayId?: string | null;
  onSelectStay?: (stay: Stay | null) => void;
  className?: string;
  initialCenter?: [number, number];
  initialZoom?: number;
}

export default function PropertyDiscoveryMap({
  stays,
  selectedStayId,
  onSelectStay,
  className = "h-full w-full",
  initialCenter,
  initialZoom,
}: PropertyDiscoveryMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<{ [id: string]: any }>({});
  const [activeStay, setActiveStay] = useState<Stay | null>(null);

  // Determine center coordinates from stays or initialCenter
  const validStays = stays.filter((s) => typeof s.lat === "number" && typeof s.lng === "number");

  const defaultLat = initialCenter ? initialCenter[0] : validStays[0]?.lat || 19.076;
  const defaultLng = initialCenter ? initialCenter[1] : validStays[0]?.lng || 72.8777;
  const defaultZoom = initialZoom || (validStays.length === 1 ? 13 : 8);

  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (!mapContainerRef.current) return;
      const L = (await import("leaflet")).default;

      // Clean up previous map instance if any
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Initialize Leaflet Map
      const map = L.map(mapContainerRef.current, {
        center: [defaultLat, defaultLng],
        zoom: defaultZoom,
        zoomControl: false,
        attributionControl: false,
      });

      // Add Zoom control at top right
      L.control.zoom({ position: "topright" }).addTo(map);

      // Dark Theme Tiles (CartoDB Dark Matter / Voyager)
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
        {
          maxZoom: 19,
          subdomains: "abcd",
        }
      ).addTo(map);

      mapInstanceRef.current = map;

      // Fit bounds if multiple stays
      if (validStays.length > 1) {
        const bounds = L.latLngBounds(validStays.map((s) => [s.lat, s.lng]));
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
      }

      // Render Price Bubble Markers
      renderMarkers(L, map);
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [stays]);

  // Sync selected stay from props
  useEffect(() => {
    if (selectedStayId) {
      const match = stays.find((s) => s.id === selectedStayId);
      if (match) {
        setActiveStay(match);
        if (mapInstanceRef.current && typeof match.lat === "number" && typeof match.lng === "number") {
          mapInstanceRef.current.flyTo([match.lat, match.lng], 14, { duration: 1.2 });
        }
      }
    }
  }, [selectedStayId, stays]);

  const renderMarkers = (L: any, map: any) => {
    // Clear old markers
    Object.values(markersRef.current).forEach((marker: any) => marker.remove());
    markersRef.current = {};

    validStays.forEach((stay) => {
      const isSelected = activeStay?.id === stay.id || selectedStayId === stay.id;
      const formattedPrice = formatINR(stay.pricePerNight);

      // Create Custom Price Pin HTML
      const customIcon = L.divIcon({
        className: "custom-price-pin-wrapper",
        html: `
          <div class="group relative cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 hover:scale-110 ${
            isSelected ? "scale-110 z-50" : "z-20"
          }">
            <div class="px-3 py-1.5 rounded-full font-black text-xs shadow-2xl flex items-center gap-1 border transition-all ${
              isSelected
                ? "bg-gradient-to-r from-rose-500 to-indigo-600 text-white border-white scale-110 shadow-indigo-600/50"
                : "bg-slate-900/95 text-white border-slate-700 hover:bg-indigo-600 hover:border-indigo-400 shadow-black/80"
            }">
              <span class="font-mono">${formattedPrice}</span>
            </div>
            <div class="w-2 h-2 bg-slate-900 border-r border-b border-slate-700 transform rotate-45 mx-auto -mt-1 ${
              isSelected ? "bg-indigo-600 border-white" : ""
            }"></div>
          </div>
        `,
        iconSize: [80, 40],
        iconAnchor: [40, 20],
      });

      const marker = L.marker([stay.lat, stay.lng], { icon: customIcon }).addTo(map);

      // Click pin -> Select stay & fly to location
      marker.on("click", () => {
        setActiveStay(stay);
        if (onSelectStay) onSelectStay(stay);
        map.flyTo([stay.lat, stay.lng], 14, { duration: 1.0 });
      });

      markersRef.current[stay.id] = marker;
    });
  };

  return (
    <div className={`relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 ${className}`}>
      {/* Map Container */}
      <div ref={mapContainerRef} className="h-full w-full z-10" />

      {/* Map Header Overlay Pill */}
      <div className="absolute top-4 left-4 z-20 pointer-events-none">
        <div className="px-3.5 py-1.5 rounded-full bg-slate-900/90 backdrop-blur-md border border-slate-800 text-slate-200 text-xs font-bold shadow-xl flex items-center gap-2">
          <MapPin className="h-3.5 w-3.5 text-indigo-400" />
          <span>{validStays.length} Stays with Live Prices on Map</span>
        </div>
      </div>

      {/* Floating Property Card Popup on Pin Click */}
      {activeStay && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 w-11/12 max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="rounded-3xl bg-slate-900/95 border border-slate-700 shadow-2xl backdrop-blur-xl p-3 relative overflow-hidden group">
            {/* Close button */}
            <button
              type="button"
              onClick={() => {
                setActiveStay(null);
                if (onSelectStay) onSelectStay(null);
              }}
              className="absolute top-4 right-4 z-40 p-1.5 rounded-full bg-slate-950/80 hover:bg-slate-950 text-slate-400 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex gap-3.5 items-center">
              {/* Thumbnail */}
              <div className="relative h-24 w-28 rounded-2xl overflow-hidden shrink-0 bg-slate-950">
                <img
                  src={activeStay.imageUrl}
                  alt={activeStay.title}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-md text-[9px] font-bold text-white">
                  {activeStay.city}
                </span>
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0 pr-6 space-y-1">
                <div className="flex items-center gap-1 text-[11px] font-bold text-amber-400">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  <span>{activeStay.rating.toFixed(2)}</span>
                  <span className="text-slate-500 font-normal">({activeStay.reviewsCount})</span>
                </div>

                <h4 className="text-xs font-black text-white truncate group-hover:text-indigo-300 transition-colors">
                  {activeStay.title}
                </h4>

                <p className="text-[10px] text-slate-400 truncate">{activeStay.location}</p>

                <div className="pt-1 flex items-center justify-between">
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm font-black text-white font-mono">
                      {formatINR(activeStay.pricePerNight)}
                    </span>
                    <span className="text-[10px] text-slate-400">/ night</span>
                  </div>

                  <Link
                    href={`/properties/${activeStay.id}`}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 via-indigo-600 to-violet-600 text-white font-bold text-[10px] flex items-center gap-1 shadow-md hover:scale-105 transition-all"
                  >
                    <span>View</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
