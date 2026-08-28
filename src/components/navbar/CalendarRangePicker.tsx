"use client";

import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  RotateCcw,
  Sparkles,
  Clock,
} from "lucide-react";
import { calculateNights } from "@/data/stays";

interface CalendarRangePickerProps {
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  onChange: (checkIn: string, checkOut: string) => void;
  onApply?: () => void;
  blockedDates?: string[];
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DAY_NAMES = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export default function CalendarRangePicker({
  checkIn,
  checkOut,
  onChange,
  onApply,
  blockedDates = [],
}: CalendarRangePickerProps) {
  // Start view on current date or checkIn month
  const initialDate = checkIn ? new Date(checkIn) : new Date();
  const [currentYear, setCurrentYear] = useState(
    isNaN(initialDate.getFullYear()) ? new Date().getFullYear() : initialDate.getFullYear()
  );
  const [currentMonth, setCurrentMonth] = useState(
    isNaN(initialDate.getMonth()) ? new Date().getMonth() : initialDate.getMonth()
  );

  const [hoverDate, setHoverDate] = useState<string | null>(null);

  const todayStr = new Date().toISOString().split("T")[0];

  // Helper to format date string
  const formatDateStr = (year: number, month: number, day: number) => {
    const mm = String(month + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    return `${year}-${mm}-${dd}`;
  };

  // Month navigation
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Next month info for dual month display
  const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
  const nextMonthYear = currentMonth === 11 ? currentYear + 1 : currentYear;

  // Date selection logic
  const handleDayClick = (dateStr: string) => {
    if (dateStr < todayStr) return; // disabled

    if (!checkIn || (checkIn && checkOut)) {
      // First click or restart range
      onChange(dateStr, "");
    } else if (checkIn && !checkOut) {
      if (dateStr < checkIn) {
        // Clicked before checkIn -> reset checkIn to this date
        onChange(dateStr, "");
      } else if (dateStr === checkIn) {
        // Clicked same day -> set 1 night stay (tomorrow)
        const nextDay = new Date(dateStr);
        nextDay.setDate(nextDay.getDate() + 1);
        onChange(dateStr, nextDay.toISOString().split("T")[0]);
      } else {
        // Valid checkOut date
        onChange(checkIn, dateStr);
        if (onApply) onApply();
      }
    }
  };

  // Quick preset buttons
  const setPresetDates = (daysCount: number, startOffset = 0) => {
    const start = new Date();
    start.setDate(start.getDate() + startOffset);
    const end = new Date(start);
    end.setDate(end.getDate() + daysCount);

    onChange(start.toISOString().split("T")[0], end.toISOString().split("T")[0]);
  };

  const setWeekendPreset = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sun, 5 = Fri, 6 = Sat
    const daysUntilFriday = (5 - dayOfWeek + 7) % 7;
    const friday = new Date(today);
    friday.setDate(today.getDate() + (daysUntilFriday === 0 ? 7 : daysUntilFriday));
    const sunday = new Date(friday);
    sunday.setDate(friday.getDate() + 2);

    onChange(friday.toISOString().split("T")[0], sunday.toISOString().split("T")[0]);
  };

  // Build calendar grid days for a given month/year
  const renderMonthDays = (year: number, month: number) => {
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];

    // Empty lead slots
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(<div key={`empty-${i}`} className="h-10 w-10" />);
    }

    // Actual month days
    for (let day = 1; day <= totalDaysInMonth; day++) {
      const dateStr = formatDateStr(year, month, day);
      const isPast = dateStr < todayStr;
      const isBlocked = blockedDates.includes(dateStr);
      const isCheckIn = dateStr === checkIn;
      const isCheckOut = dateStr === checkOut;

      const isBetween =
        (checkIn && checkOut && dateStr > checkIn && dateStr < checkOut) ||
        (checkIn && !checkOut && hoverDate && dateStr > checkIn && dateStr <= hoverDate);

      days.push(
        <button
          key={dateStr}
          type="button"
          disabled={isPast || isBlocked}
          title={isBlocked ? "Sold out on this date" : isPast ? "Past date" : dateStr}
          onClick={() => handleDayClick(dateStr)}
          onMouseEnter={() => checkIn && !checkOut && !isBlocked && setHoverDate(dateStr)}
          onMouseLeave={() => setHoverDate(null)}
          className={`h-10 w-10 text-xs font-semibold rounded-full flex flex-col items-center justify-center transition-all relative ${
            isPast
              ? "text-slate-600 cursor-not-allowed opacity-40 line-through"
              : isBlocked
              ? "text-rose-400/60 bg-rose-950/20 cursor-not-allowed opacity-60 border border-rose-900/40"
              : isCheckIn || isCheckOut
              ? "bg-gradient-to-r from-rose-500 to-indigo-600 text-white font-bold shadow-lg shadow-indigo-500/30 scale-105 z-10"
              : isBetween
              ? "bg-indigo-950/80 text-indigo-200 rounded-none first-of-type:rounded-l-full last-of-type:rounded-r-full"
              : "text-slate-200 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <span>{day}</span>
          {isBlocked && (
            <span className="w-1 h-1 rounded-full bg-rose-500 absolute bottom-1" />
          )}
        </button>
      );
    }

    return days;
  };

  const nights = calculateNights(checkIn, checkOut);

  return (
    <div className="w-full flex flex-col space-y-6">
      {/* Top Presets Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={setWeekendPreset}
            className="px-3.5 py-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700/80 text-xs font-semibold transition-all hover:scale-105 flex items-center gap-1.5"
          >
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span>This Weekend</span>
          </button>
          <button
            type="button"
            onClick={() => setPresetDates(3, 0)}
            className="px-3.5 py-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700/80 text-xs font-semibold transition-all hover:scale-105"
          >
            3 Nights
          </button>
          <button
            type="button"
            onClick={() => setPresetDates(7, 0)}
            className="px-3.5 py-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700/80 text-xs font-semibold transition-all hover:scale-105"
          >
            1 Week
          </button>
          <button
            type="button"
            onClick={() => setPresetDates(30, 0)}
            className="px-3.5 py-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700/80 text-xs font-semibold transition-all hover:scale-105 hidden sm:inline-block"
          >
            1 Month
          </button>
        </div>

        {(checkIn || checkOut) && (
          <button
            type="button"
            onClick={() => onChange("", "")}
            className="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset Dates</span>
          </button>
        )}
      </div>

      {/* Selected Range Status Card */}
      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <CalendarIcon className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <span>{checkIn ? checkIn : "Select Check-in"}</span>
              <span className="text-slate-500">&rarr;</span>
              <span>{checkOut ? checkOut : "Select Check-out"}</span>
            </div>
            <p className="text-[11px] text-slate-400">
              {checkIn && checkOut
                ? `${nights} ${nights === 1 ? "night" : "nights"} stay selected`
                : "Click to select your check-in date"}
            </p>
          </div>
        </div>

        {checkIn && checkOut && (
          <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold">
            {nights} {nights === 1 ? "Night" : "Nights"}
          </span>
        )}
      </div>

      {/* Dual Month Calendar View */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Month 1 */}
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between px-2">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="text-sm font-bold text-white tracking-wide">
              {MONTH_NAMES[currentMonth]} {currentYear}
            </div>
            <div className="w-8 md:hidden">
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {DAY_NAMES.map((d) => (
              <span key={d} className="text-[11px] font-bold text-slate-500 py-1">
                {d}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 justify-items-center">
            {renderMonthDays(currentYear, currentMonth)}
          </div>
        </div>

        {/* Month 2 (Desktop) */}
        <div className="space-y-3 hidden md:block">
          {/* Header */}
          <div className="flex items-center justify-between px-2">
            <div className="w-8" />
            <div className="text-sm font-bold text-white tracking-wide">
              {MONTH_NAMES[nextMonth]} {nextMonthYear}
            </div>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {DAY_NAMES.map((d) => (
              <span key={d} className="text-[11px] font-bold text-slate-500 py-1">
                {d}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 justify-items-center">
            {renderMonthDays(nextMonthYear, nextMonth)}
          </div>
        </div>
      </div>
    </div>
  );
}
