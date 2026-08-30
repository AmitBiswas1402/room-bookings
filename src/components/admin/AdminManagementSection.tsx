"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Shield,
  Building2,
  Users,
  Calendar,
  CreditCard,
  Star,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Search,
  Filter,
  ExternalLink,
  Loader2,
  Trash2,
  Eye,
  ArrowUpRight,
  TrendingUp,
  RefreshCw,
  Mail,
  UserCheck,
  UserX,
  BadgeCheck,
  Percent,
} from "lucide-react";
import { formatINR } from "@/data/stays";

interface AdminManagementSectionProps {
  currentUser: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export default function AdminManagementSection({ currentUser }: AdminManagementSectionProps) {
  const [adminTab, setAdminTab] = useState<
    "overview" | "properties" | "guests" | "owners" | "bookings" | "payments" | "reviews"
  >("properties");

  const [stats, setStats] = useState<any>(null);
  const [properties, setProperties] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [bookingsList, setBookingsList] = useState<any[]>([]);
  const [paymentsList, setPaymentsList] = useState<any[]>([]);
  const [reviewsList, setReviewsList] = useState<any[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [propertyFilter, setPropertyFilter] = useState<string>("ALL");
  const [bookingFilter, setBookingFilter] = useState<string>("ALL");
  const [paymentFilter, setPaymentFilter] = useState<string>("ALL");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchAdminData = async () => {
    try {
      setIsLoading(true);

      const [statsRes, propsRes, usersRes, bookingsRes, paymentsRes, reviewsRes] = await Promise.all([
        fetch("/api/admin/stats").then((r) => r.json()).catch(() => ({ stats: null })),
        fetch("/api/admin/properties").then((r) => r.json()).catch(() => ({ properties: [] })),
        fetch("/api/admin/users").then((r) => r.json()).catch(() => ({ users: [] })),
        fetch("/api/admin/bookings").then((r) => r.json()).catch(() => ({ bookings: [] })),
        fetch("/api/admin/payments").then((r) => r.json()).catch(() => ({ payments: [] })),
        fetch("/api/admin/reviews").then((r) => r.json()).catch(() => ({ reviews: [] })),
      ]);

      if (statsRes?.stats) setStats(statsRes.stats);
      if (Array.isArray(propsRes?.properties)) setProperties(propsRes.properties);
      if (Array.isArray(usersRes?.users)) setUsersList(usersRes.users);
      if (Array.isArray(bookingsRes?.bookings)) setBookingsList(bookingsRes.bookings);
      if (Array.isArray(paymentsRes?.payments)) setPaymentsList(paymentsRes.payments);
      if (Array.isArray(reviewsRes?.reviews)) setReviewsList(reviewsRes.reviews);
    } catch (err) {
      console.error("Failed to load admin data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // 1. APPROVE / REJECT PROPERTY
  const handlePropertyApproval = async (propertyId: string, status: "APPROVED" | "REJECTED") => {
    try {
      setActionLoadingId(propertyId);
      const res = await fetch("/api/admin/properties", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId, status }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setProperties((prev) =>
          prev.map((p) => (p.id === propertyId ? { ...p, status } : p))
        );
        showToast(`Property has been ${status.toLowerCase()} successfully!`);
      } else {
        alert(data.error || "Failed to update property status");
      }
    } catch (err) {
      console.error("Approval error:", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  // 2. CHANGE USER ROLE
  const handleRoleChange = async (userId: string, newRole: "GUEST" | "OWNER" | "ADMIN") => {
    try {
      setActionLoadingId(userId);
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUsersList((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
        showToast(`User role updated to ${newRole}!`);
      } else {
        alert(data.error || "Failed to update user role");
      }
    } catch (err) {
      console.error("Role update error:", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  // 3. OVERRIDE BOOKING STATUS
  const handleBookingStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      setActionLoadingId(bookingId);
      const res = await fetch("/api/admin/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, status: newStatus }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setBookingsList((prev) =>
          prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b))
        );
        showToast(`Booking marked as ${newStatus}!`);
      } else {
        alert(data.error || "Failed to update booking status");
      }
    } catch (err) {
      console.error("Booking status update error:", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  // 4. OVERRIDE PAYMENT STATUS
  const handlePaymentStatusChange = async (paymentId: string, newStatus: string) => {
    try {
      setActionLoadingId(paymentId);
      const res = await fetch("/api/admin/payments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId, status: newStatus }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPaymentsList((prev) =>
          prev.map((p) => (p.id === paymentId ? { ...p, status: newStatus } : p))
        );
        showToast(`Payment record marked as ${newStatus}!`);
      } else {
        alert(data.error || "Failed to update payment status");
      }
    } catch (err) {
      console.error("Payment status update error:", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  // 5. DELETE REVIEW
  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm("Are you sure you want to remove this review permanently?")) return;
    try {
      setActionLoadingId(reviewId);
      const res = await fetch(`/api/admin/reviews?reviewId=${reviewId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setReviewsList((prev) => prev.filter((r) => r.id !== reviewId));
        showToast("Review successfully removed.");
      } else {
        alert(data.error || "Failed to remove review");
      }
    } catch (err) {
      console.error("Review deletion error:", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const guestsOnly = usersList.filter((u) => u.role === "GUEST");
  const ownersOnly = usersList.filter((u) => u.role === "OWNER" || u.role === "ADMIN");

  const filteredProperties = properties.filter((p) => {
    const matchSearch =
      searchQuery === "" ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.hostName && p.hostName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.hostEmail && p.hostEmail.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchFilter = propertyFilter === "ALL" || p.status === propertyFilter;
    return matchSearch && matchFilter;
  });

  const filteredBookings = bookingsList.filter((b) => {
    const matchSearch =
      searchQuery === "" ||
      (b.bookingNumber && b.bookingNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (b.propertyName && b.propertyName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (b.guestName && b.guestName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (b.guestEmail && b.guestEmail.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchFilter = bookingFilter === "ALL" || b.status === bookingFilter;
    return matchSearch && matchFilter;
  });

  const filteredPayments = paymentsList.filter((p) => {
    const matchSearch =
      searchQuery === "" ||
      (p.razorpayPaymentId && p.razorpayPaymentId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.bookingNumber && p.bookingNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.guestName && p.guestName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchFilter = paymentFilter === "ALL" || p.status === paymentFilter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Toast Notice */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-indigo-600 text-white font-bold text-xs shadow-2xl shadow-indigo-600/50 flex items-center gap-2 animate-in slide-in-from-bottom">
          <BadgeCheck className="h-4 w-4 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Admin Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-rose-950/60 via-slate-900 to-indigo-950/60 border border-rose-500/20 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 text-[11px] font-black uppercase tracking-wider">
              <Shield className="h-3.5 w-3.5" />
              <span>Master Administrator Console</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Platform Governance &amp; Controls
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              Full control over property approvals, guest profiles, owner listings, booking statuses, Razorpay financial ledger, and platform-wide reviews.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchAdminData}
            disabled={isLoading}
            className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-2 transition-colors self-start md:self-auto disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin text-indigo-400" : ""}`} />
            <span>Refresh Ledger</span>
          </button>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-800 text-xs font-bold">
        <button
          type="button"
          onClick={() => {
            setSearchQuery("");
            setAdminTab("properties");
          }}
          className={`px-4 py-2.5 rounded-2xl transition-all flex items-center gap-2 shrink-0 ${
            adminTab === "properties"
              ? "bg-rose-600 text-white shadow-lg shadow-rose-600/30"
              : "text-slate-400 hover:text-white hover:bg-slate-900"
          }`}
        >
          <Building2 className="h-4 w-4" />
          <span>Approve Properties ({properties.filter((p) => p.status === "PENDING").length} Pending)</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setSearchQuery("");
            setAdminTab("guests");
          }}
          className={`px-4 py-2.5 rounded-2xl transition-all flex items-center gap-2 shrink-0 ${
            adminTab === "guests"
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
              : "text-slate-400 hover:text-white hover:bg-slate-900"
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Manage Guests ({guestsOnly.length})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setSearchQuery("");
            setAdminTab("owners");
          }}
          className={`px-4 py-2.5 rounded-2xl transition-all flex items-center gap-2 shrink-0 ${
            adminTab === "owners"
              ? "bg-violet-600 text-white shadow-lg shadow-violet-600/30"
              : "text-slate-400 hover:text-white hover:bg-slate-900"
          }`}
        >
          <BadgeCheck className="h-4 w-4" />
          <span>Manage Owners ({ownersOnly.length})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setSearchQuery("");
            setAdminTab("bookings");
          }}
          className={`px-4 py-2.5 rounded-2xl transition-all flex items-center gap-2 shrink-0 ${
            adminTab === "bookings"
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
              : "text-slate-400 hover:text-white hover:bg-slate-900"
          }`}
        >
          <Calendar className="h-4 w-4" />
          <span>Manage Bookings ({bookingsList.length})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setSearchQuery("");
            setAdminTab("payments");
          }}
          className={`px-4 py-2.5 rounded-2xl transition-all flex items-center gap-2 shrink-0 ${
            adminTab === "payments"
              ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
              : "text-slate-400 hover:text-white hover:bg-slate-900"
          }`}
        >
          <CreditCard className="h-4 w-4" />
          <span>Manage Payments ({paymentsList.length})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setSearchQuery("");
            setAdminTab("reviews");
          }}
          className={`px-4 py-2.5 rounded-2xl transition-all flex items-center gap-2 shrink-0 ${
            adminTab === "reviews"
              ? "bg-amber-600 text-white shadow-lg shadow-amber-600/30"
              : "text-slate-400 hover:text-white hover:bg-slate-900"
          }`}
        >
          <Star className="h-4 w-4" />
          <span>Manage Reviews ({reviewsList.length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. APPROVE / REJECT PROPERTIES */}
      {/* ========================================================================= */}
      {adminTab === "properties" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search properties or hosts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-[11px] font-bold">
              {(["ALL", "PENDING", "APPROVED", "REJECTED"] as const).map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setPropertyFilter(filter)}
                  className={`px-3 py-1.5 rounded-lg uppercase tracking-wider transition-colors ${
                    propertyFilter === filter
                      ? "bg-indigo-600 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.length === 0 ? (
              <div className="col-span-full py-16 text-center text-slate-400 text-xs font-semibold">
                No properties found matching this criteria.
              </div>
            ) : (
              filteredProperties.map((prop) => (
                <div
                  key={prop.id}
                  className="rounded-3xl bg-slate-900/80 border border-slate-800 overflow-hidden flex flex-col justify-between shadow-xl"
                >
                  <div>
                    {/* Cover Photo */}
                    <div className="relative aspect-video bg-slate-950 overflow-hidden">
                      <img
                        src={prop.coverImage}
                        alt={prop.name}
                        className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
                      />
                      <div className="absolute top-3 right-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-lg ${
                            prop.status === "APPROVED"
                              ? "bg-emerald-500 text-white"
                              : prop.status === "REJECTED"
                              ? "bg-rose-500 text-white"
                              : "bg-amber-500 text-slate-950 animate-pulse"
                          }`}
                        >
                          {prop.status}
                        </span>
                      </div>
                      <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-white">
                        {prop.type} · {prop.city}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 space-y-3">
                      <div>
                        <h4 className="text-sm font-black text-white">{prop.name}</h4>
                        <p className="text-[11px] text-slate-400 line-clamp-1">{prop.address}</p>
                      </div>

                      <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 text-[11px] space-y-1">
                        <div className="text-slate-400 flex items-center justify-between">
                          <span>Owner:</span>
                          <strong className="text-slate-200">{prop.hostName || "Host"}</strong>
                        </div>
                        <div className="text-slate-400 flex items-center justify-between">
                          <span>Contact:</span>
                          <span className="text-indigo-400 truncate max-w-[160px]">{prop.hostEmail}</span>
                        </div>
                        <div className="text-slate-400 flex items-center justify-between">
                          <span>Rooms / Price:</span>
                          <strong className="text-emerald-400">
                            {prop.roomsCount} rooms · {formatINR(prop.minPrice)}/nt
                          </strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center gap-2">
                    <Link
                      href={`/properties/${prop.id}`}
                      target="_blank"
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                      title="View live stay preview"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>

                    {prop.status !== "APPROVED" && (
                      <button
                        type="button"
                        onClick={() => handlePropertyApproval(prop.id, "APPROVED")}
                        disabled={actionLoadingId === prop.id}
                        className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-lg shadow-emerald-600/20"
                      >
                        {actionLoadingId === prop.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        )}
                        <span>Approve</span>
                      </button>
                    )}

                    {prop.status !== "REJECTED" && (
                      <button
                        type="button"
                        onClick={() => handlePropertyApproval(prop.id, "REJECTED")}
                        disabled={actionLoadingId === prop.id}
                        className="flex-1 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                      >
                        {actionLoadingId === prop.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <XCircle className="h-3.5 w-3.5" />
                        )}
                        <span>Reject</span>
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. MANAGE GUESTS */}
      {/* ========================================================================= */}
      {adminTab === "guests" && (
        <div className="space-y-6">
          <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-white">Registered Guests Directory</span>
              <span className="text-[11px] text-slate-400">{guestsOnly.length} Total Guests</span>
            </div>

            <div className="divide-y divide-slate-800 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="p-4">Guest</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Total Bookings</th>
                    <th className="p-4">Total Spend</th>
                    <th className="p-4">Role Controls</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {guestsOnly.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-500">
                        No guests registered yet.
                      </td>
                    </tr>
                  ) : (
                    guestsOnly.map((guest) => (
                      <tr key={guest.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="p-4 flex items-center gap-3">
                          <img
                            src={
                              guest.imageUrl ||
                              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
                            }
                            alt=""
                            className="h-8 w-8 rounded-full object-cover border border-slate-700"
                          />
                          <span className="font-bold text-white">{guest.name || "Guest"}</span>
                        </td>
                        <td className="p-4 font-mono text-[11px] text-indigo-300">{guest.email}</td>
                        <td className="p-4 font-bold">{guest.bookingsCount} stays</td>
                        <td className="p-4 font-black text-emerald-400">{formatINR(guest.totalSpent)}</td>
                        <td className="p-4">
                          <button
                            type="button"
                            onClick={() => handleRoleChange(guest.id, "OWNER")}
                            disabled={actionLoadingId === guest.id}
                            className="px-3 py-1.5 rounded-xl bg-violet-500/10 hover:bg-violet-500/20 text-violet-300 border border-violet-500/20 font-bold text-[11px] transition-colors"
                          >
                            Promote to Owner
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. MANAGE OWNERS */}
      {/* ========================================================================= */}
      {adminTab === "owners" && (
        <div className="space-y-6">
          <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-white">Registered Property Owners &amp; Hosts</span>
              <span className="text-[11px] text-slate-400">{ownersOnly.length} Total Hosts</span>
            </div>

            <div className="divide-y divide-slate-800 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="p-4">Owner Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Properties</th>
                    <th className="p-4">Total Revenue</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {ownersOnly.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500">
                        No property owners registered yet.
                      </td>
                    </tr>
                  ) : (
                    ownersOnly.map((owner) => (
                      <tr key={owner.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="p-4 flex items-center gap-3">
                          <img
                            src={
                              owner.imageUrl ||
                              "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
                            }
                            alt=""
                            className="h-8 w-8 rounded-full object-cover border border-slate-700"
                          />
                          <span className="font-bold text-white">{owner.name || "Owner"}</span>
                        </td>
                        <td className="p-4 font-mono text-[11px] text-indigo-300">{owner.email}</td>
                        <td className="p-4 font-bold">{owner.propertiesCount} listings</td>
                        <td className="p-4 font-black text-emerald-400">{formatINR(owner.totalRevenue)}</td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              owner.role === "ADMIN"
                                ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                : "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                            }`}
                          >
                            {owner.role}
                          </span>
                        </td>
                        <td className="p-4">
                          <button
                            type="button"
                            onClick={() => handleRoleChange(owner.id, "GUEST")}
                            disabled={actionLoadingId === owner.id || owner.email === "amit.142biswas@gmail.com"}
                            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold transition-colors disabled:opacity-30"
                          >
                            Demote to Guest
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MANAGE BOOKINGS */}
      {/* ========================================================================= */}
      {adminTab === "bookings" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search booking ref, guest, property..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-[11px] font-bold">
              {(["ALL", "CONFIRMED", "COMPLETED", "CANCELLED"] as const).map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setBookingFilter(filter)}
                  className={`px-3 py-1.5 rounded-lg uppercase tracking-wider transition-colors ${
                    bookingFilter === filter ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
            <div className="divide-y divide-slate-800 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="p-4">Booking Ref</th>
                    <th className="p-4">Property</th>
                    <th className="p-4">Guest</th>
                    <th className="p-4">Dates</th>
                    <th className="p-4">Total</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Admin Override</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-500">
                        No bookings found matching filter.
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="p-4 font-mono font-bold text-indigo-400">{b.bookingNumber}</td>
                        <td className="p-4">
                          <div className="font-bold text-white">{b.propertyName}</div>
                          <div className="text-[10px] text-slate-400">{b.roomName}</div>
                        </td>
                        <td className="p-4">
                          <div className="font-semibold text-white">{b.guestName}</div>
                          <div className="text-[10px] text-slate-400">{b.guestEmail}</div>
                        </td>
                        <td className="p-4 text-[11px]">
                          {b.checkIn} → {b.checkOut}
                        </td>
                        <td className="p-4 font-black text-emerald-400">{formatINR(b.totalAmount)}</td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              b.status === "CONFIRMED"
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                : b.status === "CANCELLED"
                                ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                                : "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                            }`}
                          >
                            {b.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <select
                            value={b.status}
                            onChange={(e) => handleBookingStatusChange(b.id, e.target.value)}
                            disabled={actionLoadingId === b.id}
                            className="bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1 text-[11px] text-white focus:outline-none focus:border-indigo-500"
                          >
                            <option value="CONFIRMED">CONFIRMED</option>
                            <option value="COMPLETED">COMPLETED</option>
                            <option value="CANCELLED">CANCELLED</option>
                            <option value="PENDING">PENDING</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MANAGE PAYMENTS */}
      {/* ========================================================================= */}
      {adminTab === "payments" && (
        <div className="space-y-6">
          <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-white">Razorpay Settlement &amp; Payment Ledger</span>
              <span className="text-[11px] text-slate-400">{paymentsList.length} Transactions</span>
            </div>

            <div className="divide-y divide-slate-800 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="p-4">Payment ID</th>
                    <th className="p-4">Booking Ref</th>
                    <th className="p-4">Property</th>
                    <th className="p-4">Guest</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {filteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-500">
                        No payment records found.
                      </td>
                    </tr>
                  ) : (
                    filteredPayments.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="p-4 font-mono text-[11px] text-emerald-400">
                          {p.razorpayPaymentId || "Mock / Direct"}
                        </td>
                        <td className="p-4 font-mono text-indigo-300">{p.bookingNumber}</td>
                        <td className="p-4 font-bold text-white">{p.propertyName}</td>
                        <td className="p-4 text-[11px] text-slate-400">{p.guestEmail}</td>
                        <td className="p-4 font-black text-emerald-400">{formatINR(p.amount)}</td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              p.status === "PAID"
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                : p.status === "REFUNDED"
                                ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                                : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <select
                            value={p.status}
                            onChange={(e) => handlePaymentStatusChange(p.id, e.target.value)}
                            disabled={actionLoadingId === p.id}
                            className="bg-slate-950 border border-slate-700 rounded-xl px-2 py-1 text-[11px] text-white focus:outline-none"
                          >
                            <option value="PAID">PAID</option>
                            <option value="REFUNDED">REFUNDED</option>
                            <option value="PENDING">PENDING</option>
                            <option value="FAILED">FAILED</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. MANAGE REVIEWS */}
      {/* ========================================================================= */}
      {adminTab === "reviews" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviewsList.length === 0 ? (
              <div className="col-span-full py-16 text-center text-slate-400 text-xs font-semibold">
                No guest reviews submitted yet across the platform.
              </div>
            ) : (
              reviewsList.map((rev) => (
                <div
                  key={rev.id}
                  className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3 shadow-xl"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-black text-white">{rev.propertyName}</h4>
                      <p className="text-[10px] text-slate-400">
                        By {rev.guestName} ({rev.guestEmail})
                      </p>
                    </div>

                    <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full text-amber-400 text-xs font-black">
                      <Star className="h-3 w-3 fill-amber-400" />
                      <span>{rev.rating}.0</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-2xl border border-slate-800/60">
                    &ldquo;{rev.comment}&rdquo;
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px] text-slate-500">
                    <span>{new Date(rev.createdAt).toLocaleDateString()}</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteReview(rev.id)}
                      disabled={actionLoadingId === rev.id}
                      className="text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1"
                    >
                      <Trash2 className="h-3 w-3" />
                      <span>Delete Review</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
