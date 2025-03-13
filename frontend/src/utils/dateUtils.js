/**
 * Date Utilities
 *
 * A collection of helper functions for working with dates consistently
 * throughout the application.
 */

/**
 * Formats a date as YYYY-MM-DD for use in date inputs
 *
 * @param {Date} date - Date object to format
 * @returns {string} Formatted date string
 */
export function formatDate(date) {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().split("T")[0];
}

/**
 * Formats a date in a human-readable format (e.g., "January 1, 2023")
 *
 * @param {Date|string} date - Date object or ISO string to format
 * @returns {string} Formatted date string
 */
export function formatDateReadable(date) {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  if (!dateObj || isNaN(dateObj.getTime())) {
    return "Invalid date";
  }

  return dateObj.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Gets the start of day (00:00:00) for a given date
 *
 * @param {Date} date - Date to get start of day for
 * @returns {Date} New date object set to start of day
 */
export function getStartOfDay(date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  return startOfDay;
}

/**
 * Gets the end of day (23:59:59) for a given date
 *
 * @param {Date} date - Date to get end of day for
 * @returns {Date} New date object set to end of day
 */
export function getEndOfDay(date) {
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  return endOfDay;
}

/**
 * Gets a date for the specified number of days in the past
 *
 * @param {number} days - Number of days to go back
 * @returns {Date} Date object for past date
 */
export function getDaysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

/**
 * Gets an array of dates for the last n days
 *
 * @param {number} numDays - Number of days to include
 * @returns {Date[]} Array of date objects, most recent first
 */
export function getLastNDays(numDays) {
  const dates = [];
  const today = new Date();

  for (let i = 0; i < numDays; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    dates.push(date);
  }

  return dates;
}

/**
 * Determines if two dates are on the same day
 *
 * @param {Date} date1 - First date to compare
 * @param {Date} date2 - Second date to compare
 * @returns {boolean} True if dates are on the same day
 */
export function isSameDay(date1, date2) {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Gets ISO date string in local timezone (YYYY-MM-DD)
 *
 * @param {Date} date - Date to format
 * @returns {string} Date string in YYYY-MM-DD format
 */
export function getLocalISODate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
