"use client";

import { useEffect, useState } from "react";
import { siteConfig } from "@/config/site";

export interface SalonOpenState {
  isOpen: boolean;
  statusText: "Open Now" | "Closed";
  todayName: string;
  todayHours: string;
}

export function getSalonOpenState(now: Date = new Date()): SalonOpenState {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: siteConfig.contact.timezone,
    weekday: "long",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  });

  const parts = formatter.formatToParts(now);
  const weekday = parts.find((p) => p.type === "weekday")?.value ?? "Monday";
  const rawHour = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
  const hour = rawHour === 24 ? 0 : rawHour;
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? "0");

  const schedule =
    siteConfig.contact.openingHours.find((entry) => entry.day === weekday) ??
    siteConfig.contact.openingHours[0];

  const currentMinutes = hour * 60 + minute;
  const openMinutes = schedule.openHour * 60 + schedule.openMinute;
  const closeMinutes = schedule.closeHour * 60 + schedule.closeMinute;

  const isOpen = currentMinutes >= openMinutes && currentMinutes < closeMinutes;

  return {
    isOpen,
    statusText: isOpen ? "Open Now" : "Closed",
    todayName: schedule.day,
    todayHours: schedule.hours,
  };
}

interface OpenStatusBadgeProps {
  variant?: "light" | "dark";
  className?: string;
}

export function OpenStatusBadge({
  variant = "light",
  className = "",
}: OpenStatusBadgeProps) {
  const [state, setState] = useState<SalonOpenState | null>(null);

  useEffect(() => {
    const update = () => setState(getSalonOpenState(new Date()));
    update();
    const timer = window.setInterval(update, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  if (!state) {
    return (
      <span
        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[0.75rem] font-semibold tracking-[0.14em] uppercase ${
          variant === "dark"
            ? "border border-cream/20 bg-cream/10 text-cream/80"
            : "border border-beige bg-sand/50 text-taupe"
        } ${className}`}
      >
        <span className="h-2 w-2 rounded-full bg-champagne" aria-hidden="true" />
        <span>Open 7 Days</span>
      </span>
    );
  }

  const isDark = variant === "dark";

  return (
    <span
      aria-live="polite"
      title={`Current status in Northfield, NJ (${siteConfig.contact.timezone}): ${state.statusText}`}
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[0.75rem] font-semibold tracking-[0.14em] uppercase ${
        state.isOpen
          ? isDark
            ? "border border-emerald-400/35 bg-emerald-950/50 text-emerald-200"
            : "border border-emerald-700/25 bg-emerald-50/90 text-emerald-900"
          : isDark
            ? "border border-cream/25 bg-cream/10 text-cream/85"
            : "border border-beige-dark bg-sand/70 text-taupe"
      } ${className}`}
    >
      <span
        aria-hidden="true"
        className={`h-2 w-2 rounded-full ${
          state.isOpen
            ? "bg-emerald-600 animate-pulse"
            : isDark
              ? "bg-cream/60"
              : "bg-taupe"
        }`}
      />
      <span>{state.statusText}</span>
    </span>
  );
}

