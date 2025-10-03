/**
 * @file timezone.ts
 * @summary Timezone utilities for Costa Rican time
 * @description Centralized timezone handling for Costa Rican time (UTC-6).
 */

/**
 * Gets the current time in Costa Rican timezone (UTC-6).
 * All database operations should use this function to ensure consistency.
 * 
 * @returns Date object in Costa Rican timezone
 */
export function getCostaRicanTime(): Date {
  const now = new Date();
  // Costa Rica is UTC-6 (no daylight saving time)
  const costaRicanOffset = -6 * 60; // -6 hours in minutes
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const costaRicanTime = new Date(utc + (costaRicanOffset * 60000));
  return costaRicanTime;
}

/**
 * Gets the current time in Costa Rican timezone as ISO string.
 * 
 * @returns ISO string in Costa Rican timezone
 */
export function getCostaRicanTimeISO(): string {
  return getCostaRicanTime().toISOString();
}

/**
 * Converts a Date to Costa Rican timezone.
 * 
 * @param date - Date to convert
 * @returns Date in Costa Rican timezone
 */
export function toCostaRicanTime(date: Date): Date {
  const costaRicanOffset = -6 * 60; // -6 hours in minutes
  const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
  return new Date(utc + (costaRicanOffset * 60000));
}

/**
 * Converts a Date to Costa Rican timezone as ISO string.
 * 
 * @param date - Date to convert
 * @returns ISO string in Costa Rican timezone
 */
export function toCostaRicanTimeISO(date: Date): string {
  return toCostaRicanTime(date).toISOString();
}