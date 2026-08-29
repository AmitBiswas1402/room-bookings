"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Bell,
  Check,
  CheckCheck,
  Calendar,
  CreditCard,
  AlertTriangle,
  Sparkles,
  Building2,
  ExternalLink,
  Loader2,
  Clock,
  Send,
} from "lucide-react";

export interface InAppNotification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [filter, setFilter] = useState<"ALL" | "BOOKINGS" | "PAYMENTS" | "CANCELLATIONS">("ALL");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      if (res.ok && data.success) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.error("Failed to load notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 20000); // 20-second live polling
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId }),
      });
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);

      await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllAsRead: true }),
      });
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const filteredNotifications = notifications.filter((item) => {
    if (filter === "BOOKINGS") {
      return (
        item.type.includes("BOOKING") &&
        !item.type.includes("CANCEL") &&
        !item.type.includes("PAYMENT")
      );
    }
    if (filter === "PAYMENTS") return item.type.includes("PAYMENT");
    if (filter === "CANCELLATIONS") return item.type.includes("CANCEL");
    return true;
  });

  const formatTimeAgo = (dateStr: string) => {
    try {
      const now = new Date().getTime();
      const past = new Date(dateStr).getTime();
      const diffSec = Math.floor((now - past) / 1000);

      if (diffSec < 60) return "Just now";
      if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
      if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
      return `${Math.floor(diffSec / 86400)}d ago`;
    } catch {
      return "Recent";
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "BOOKING_CONFIRMATION":
        return <Calendar className="h-4 w-4 text-emerald-400" />;
      case "PAYMENT_CONFIRMATION":
        return <CreditCard className="h-4 w-4 text-indigo-400" />;
      case "NEW_BOOKING_OWNER":
        return <Building2 className="h-4 w-4 text-amber-400" />;
      case "CANCELLATION_GUEST":
      case "CANCELLATION_OWNER":
        return <AlertTriangle className="h-4 w-4 text-rose-400" />;
      case "BOOKING_REMINDER":
        return <Clock className="h-4 w-4 text-cyan-400" />;
      default:
        return <Sparkles className="h-4 w-4 text-violet-400" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchNotifications();
        }}
        aria-label="View notifications"
        className="relative p-2 rounded-full border border-slate-800 bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white transition-all hover:scale-105 shadow-sm"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-rose-500 text-white font-black text-[9px] flex items-center justify-center shadow-lg shadow-rose-500/50 animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Popup Panel */}
      {isOpen && (
        <div className="absolute right-0 top-12 w-80 sm:w-96 rounded-3xl bg-slate-900/95 border border-slate-800 shadow-2xl backdrop-blur-xl z-50 overflow-hidden animate-in fade-in-50 zoom-in-95">
          {/* Header */}
          <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white flex items-center gap-1.5">
                <Bell className="h-4 w-4 text-indigo-400" />
                <span>Notifications</span>
              </span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
              >
                <CheckCheck className="h-3 w-3" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="px-4 py-2 bg-slate-950/40 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto text-[10px] scrollbar-none font-bold">
            {(["ALL", "BOOKINGS", "PAYMENTS", "CANCELLATIONS"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setFilter(t)}
                className={`px-2.5 py-1 rounded-full uppercase tracking-wider transition-colors shrink-0 ${
                  filter === t
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                {t === "ALL" ? "All" : t.toLowerCase()}
              </button>
            ))}
          </div>

          {/* Notification Items List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-800/60">
            {filteredNotifications.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
                  <Bell className="h-5 w-5" />
                </div>
                <div className="text-xs font-bold text-slate-400">No notifications yet</div>
                <p className="text-[11px] text-slate-500 max-w-[200px] mx-auto">
                  Live updates for bookings, payments, and cancellations will appear here.
                </p>
              </div>
            ) : (
              filteredNotifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => !notif.isRead && handleMarkAsRead(notif.id)}
                  className={`p-3.5 transition-colors cursor-pointer flex gap-3 ${
                    notif.isRead ? "bg-transparent hover:bg-slate-800/40" : "bg-indigo-950/20 hover:bg-indigo-950/30"
                  }`}
                >
                  {/* Icon Avatar */}
                  <div className="h-8 w-8 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-center shrink-0 mt-0.5">
                    {getNotificationIcon(notif.type)}
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-start justify-between gap-1">
                      <h5 className="text-xs font-bold text-white truncate">{notif.title}</h5>
                      <span className="text-[9px] text-slate-500 shrink-0 font-medium">
                        {formatTimeAgo(notif.createdAt)}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>

                    {notif.link && (
                      <div className="pt-1">
                        <Link
                          href={notif.link}
                          onClick={() => {
                            handleMarkAsRead(notif.id);
                            setIsOpen(false);
                          }}
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                        >
                          <span>View Details</span>
                          <ExternalLink className="h-2.5 w-2.5" />
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Unread Dot */}
                  {!notif.isRead && (
                    <span className="h-2 w-2 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Resend &amp; In-App Sync Active</span>
            <Link
              href="/dashboard?tab=bookings"
              onClick={() => setIsOpen(false)}
              className="text-xs font-bold text-indigo-400 hover:text-indigo-300"
            >
              Dashboard &rarr;
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
