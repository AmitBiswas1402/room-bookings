"use client";

import React, { useState, useEffect } from "react";
import { Stay, formatINR } from "@/data/stays";
import {
  TrendingUp,
  Calendar,
  Zap,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  DollarSign,
  Flame,
  Percent,
  Layers,
} from "lucide-react";

interface DynamicPricingRule {
  id: string;
  propertyId: string;
  roomId: string | null;
  startDate: string;
  endDate: string;
  pricePerNight: number | null;
  surgeMultiplier: number | null;
  reason: string;
  isActive: boolean;
  createdAt: string;
}

interface DynamicPricingManagerProps {
  properties: Stay[];
}

export default function DynamicPricingManager({ properties }: DynamicPricingManagerProps) {
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(properties[0]?.id || "");
  const [rules, setRules] = useState<DynamicPricingRule[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Form State
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [pricingMode, setPricingMode] = useState<"multiplier" | "fixed">("multiplier");
  const [surgeMultiplier, setSurgeMultiplier] = useState<number>(1.25);
  const [customPrice, setCustomPrice] = useState<string>("");
  const [reason, setReason] = useState<string>("High Demand Season");

  const activeProperty = properties.find((p) => p.id === selectedPropertyId) || properties[0];

  // Fetch rules when selected property changes
  useEffect(() => {
    if (!selectedPropertyId) return;

    async function loadRules() {
      setLoading(true);
      try {
        const res = await fetch(`/api/properties/${selectedPropertyId}/pricing`);
        const data = await res.json();
        if (data.success && data.rules) {
          setRules(data.rules);
        }
      } catch (err) {
        console.error("Failed to fetch pricing rules:", err);
      } finally {
        setLoading(false);
      }
    }

    loadRules();
  }, [selectedPropertyId]);

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      setNotification({ type: "error", message: "Please choose both start date and end date." });
      return;
    }

    setIsSubmitting(true);
    setNotification(null);

    try {
      const payload: any = {
        startDate,
        endDate,
        reason,
      };

      if (pricingMode === "fixed") {
        if (!customPrice || Number(customPrice) <= 0) {
          throw new Error("Please enter a valid custom price.");
        }
        payload.pricePerNight = Number(customPrice);
      } else {
        payload.surgeMultiplier = surgeMultiplier;
      }

      const res = await fetch(`/api/properties/${selectedPropertyId}/pricing`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create pricing rule");
      }

      setNotification({ type: "success", message: `Dynamic pricing rule applied for ${startDate} to ${endDate}!` });
      setRules((prev) => [data.rule, ...prev]);

      // Reset form
      setStartDate("");
      setEndDate("");
      setCustomPrice("");
    } catch (err: any) {
      setNotification({ type: "error", message: err.message || "Failed to save rule" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    try {
      const res = await fetch(`/api/properties/${selectedPropertyId}/pricing?ruleId=${ruleId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setRules((prev) => prev.filter((r) => r.id !== ruleId));
        setNotification({ type: "success", message: "Rule removed." });
      }
    } catch (err) {
      console.error("Failed to delete rule:", err);
    }
  };

  const basePrice = activeProperty?.pricePerNight || 8500;
  const calculatedSurgePrice = Math.round(basePrice * surgeMultiplier);

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Header & Property Selector */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-indigo-400" />
              <span>Dynamic Market &amp; Date Pricing</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Charge different prices for high-demand dates, long weekends, festival seasons, and peak market periods.
            </p>
          </div>

          {/* Property Selector */}
          {properties.length > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Listing:</span>
              <select
                value={selectedPropertyId}
                onChange={(e) => setSelectedPropertyId(e.target.value)}
                className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-white focus:outline-none focus:border-indigo-500"
              >
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({p.city})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Live Market Demand Overview Pill */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-1">
            <span className="text-[11px] font-bold text-slate-400">Standard Base Rate</span>
            <div className="text-xl font-black text-white font-mono">{formatINR(basePrice)}</div>
            <span className="text-[10px] text-slate-500">Regular weekday pricing</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-1">
            <span className="text-[11px] font-bold text-indigo-400">Weekend Surge (Fri &amp; Sat)</span>
            <div className="text-xl font-black text-indigo-300 font-mono">{formatINR(Math.round(basePrice * 1.15))}</div>
            <span className="text-[10px] text-indigo-400/80">Automatic +15% demand rate</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-1">
            <span className="text-[11px] font-bold text-rose-400">Active Date Overrides</span>
            <div className="text-xl font-black text-rose-300 font-mono">{rules.length} Active Rules</div>
            <span className="text-[10px] text-slate-500">Custom pricing applied live</span>
          </div>
        </div>
      </div>

      {notification && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center justify-between ${
            notification.type === "success"
              ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"
              : "bg-rose-500/10 border border-rose-500/30 text-rose-300"
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
            )}
            <span>{notification.message}</span>
          </div>
          <button type="button" onClick={() => setNotification(null)} className="text-slate-400 hover:text-white ml-4">
            Dismiss
          </button>
        </div>
      )}

      {/* Main Grid: Add Rule Form + Active Rules List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form: Add Dynamic Pricing Rule */}
        <div className="lg:col-span-5 p-6 sm:p-7 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-5 shadow-xl">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-indigo-400" />
            <h4 className="text-base font-bold text-white">Create Date-Specific Pricing</h4>
          </div>

          <form onSubmit={handleCreateRule} className="space-y-4">
            {/* Dates Selection */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">Start Date</label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">End Date</label>
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Pricing Mode Switcher */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1.5">Pricing Strategy</label>
              <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setPricingMode("multiplier")}
                  className={`py-2 rounded-xl transition-all ${
                    pricingMode === "multiplier" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  % Demand Surge
                </button>
                <button
                  type="button"
                  onClick={() => setPricingMode("fixed")}
                  className={`py-2 rounded-xl transition-all ${
                    pricingMode === "fixed" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Fixed Nightly Price
                </button>
              </div>
            </div>

            {/* Mode 1: Demand Multiplier Presets */}
            {pricingMode === "multiplier" && (
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 block">Select Surge Level</label>
                <div className="grid grid-cols-3 gap-2 text-xs font-bold">
                  {[
                    { label: "+20% Surge", val: 1.2 },
                    { label: "+35% High", val: 1.35 },
                    { label: "+50% Peak", val: 1.5 },
                  ].map((preset) => (
                    <button
                      key={preset.val}
                      type="button"
                      onClick={() => setSurgeMultiplier(preset.val)}
                      className={`py-2 px-2 rounded-xl border text-center transition-all ${
                        surgeMultiplier === preset.val
                          ? "bg-indigo-600 text-white border-indigo-400 shadow-md"
                          : "bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs flex items-center justify-between">
                  <span className="text-slate-400">Effective Nightly Rate:</span>
                  <span className="font-mono font-black text-emerald-400 text-sm">
                    {formatINR(calculatedSurgePrice)} / night
                  </span>
                </div>
              </div>
            )}

            {/* Mode 2: Fixed Nightly Custom Price */}
            {pricingMode === "fixed" && (
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">Custom Nightly Rate (₹ INR)</label>
                <input
                  type="number"
                  placeholder="e.g. 15000"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>
            )}

            {/* Surge Reason / Occasion */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">Occasion / Reason</label>
              <input
                type="text"
                placeholder="e.g. Diwali / New Year Demand Surge"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-500 via-indigo-600 to-violet-600 hover:from-rose-400 hover:to-violet-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              <span>{isSubmitting ? "Applying..." : "Apply Dynamic Rate Rule"}</span>
            </button>
          </form>
        </div>

        {/* List: Active Dynamic Pricing Rules */}
        <div className="lg:col-span-7 p-6 sm:p-7 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-5 shadow-xl">
          <div className="flex items-center justify-between">
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <Calendar className="h-4 w-4 text-indigo-400" />
              <span>Active Date Overrides ({rules.length})</span>
            </h4>
            <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
              Auto-Synchronized
            </span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-500 text-xs">Loading pricing rules...</div>
          ) : rules.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/20">
                <Sparkles className="h-6 w-6" />
              </div>
              <h5 className="text-sm font-bold text-white">No Date Overrides Active</h5>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Properties use standard base rates with automatic +15% weekend market pricing. Add custom rules on the left for peak holiday dates!
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800/80 space-y-3">
              {rules.map((rule) => {
                const isFixed = rule.pricePerNight && rule.pricePerNight > 0;
                const effectiveRate = isFixed ? rule.pricePerNight : Math.round(basePrice * (rule.surgeMultiplier || 1.0));

                return (
                  <div key={rule.id} className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{rule.reason}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {isFixed ? "Fixed Custom Rate" : `+${Math.round(((rule.surgeMultiplier || 1) - 1) * 100)}% Surge`}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2">
                        <Calendar className="h-3 w-3 text-indigo-400" />
                        <span>
                          {rule.startDate} &rarr; {rule.endDate}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm font-black text-emerald-400 font-mono">
                          {formatINR(effectiveRate!)}
                        </div>
                        <div className="text-[10px] text-slate-500">per night</div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteRule(rule.id)}
                        className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors"
                        title="Delete pricing rule"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
