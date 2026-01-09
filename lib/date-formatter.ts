/**
 * SSR-safe date formatting utilities
 * 
 * These functions use Intl.DateTimeFormat with explicit locale and timezone
 * to ensure consistent formatting between server and client renders.
 */

const DEFAULT_LOCALE = 'en-US'
const DEFAULT_TIMEZONE = 'Europe/Sofia'

/**
 * Format a date to a date string (SSR-safe)
 * @param date - Date object or ISO string
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string,
  options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' }
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat(DEFAULT_LOCALE, {
    ...options,
    timeZone: DEFAULT_TIMEZONE,
  }).format(dateObj)
}

/**
 * Format a date to a time string (SSR-safe)
 * @param date - Date object or ISO string
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted time string
 */
export function formatTime(
  date: Date | string,
  options: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' }
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat(DEFAULT_LOCALE, {
    ...options,
    timeZone: DEFAULT_TIMEZONE,
  }).format(dateObj)
}

/**
 * Format a date to a date-time string (SSR-safe)
 * @param date - Date object or ISO string
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date-time string
 */
export function formatDateTime(
  date: Date | string,
  options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat(DEFAULT_LOCALE, {
    ...options,
    timeZone: DEFAULT_TIMEZONE,
  }).format(dateObj)
}
