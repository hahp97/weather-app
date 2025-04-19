import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  if (!date) return "";
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatNumber(value: number, decimals: number = 1): string {
  return value?.toFixed(decimals) ?? "0";
}

/**
 * Format a date and time to localized display format
 */
export function formatDateTime(date: Date | string): string {
  if (!date) return "";
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Convert a local date to UTC for API requests
 */
export function localToUTCDate(localDate: Date): Date {
  return new Date(
    Date.UTC(
      localDate.getFullYear(),
      localDate.getMonth(),
      localDate.getDate(),
      localDate.getHours(),
      localDate.getMinutes(),
      localDate.getSeconds(),
      localDate.getMilliseconds()
    )
  );
}

/**
 * Convert a UTC date from API to local date for display
 */
export function UTCToLocalDate(utcDate: Date | string): Date {
  const date = typeof utcDate === "string" ? new Date(utcDate) : utcDate;
  // Create a new date that's properly interpreted as local
  return new Date(date.toLocaleString());
}

/**
 * Format a date in YYYY-MM-DD format suitable for date inputs
 */
export function formatDateForInput(date: Date | string): string {
  if (!date) return "";
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toLocaleDateString("en-CA"); // en-CA locale gives YYYY-MM-DD format
}
