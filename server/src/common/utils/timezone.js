export const IST_TIMEZONE = 'Asia/Kolkata';

/**
 * Returns current or given date formatted as 'YYYY-MM-DD' in Asia/Kolkata (IST).
 */
export const getISTDateString = (date = new Date()) => {
  const d = date instanceof Date ? date : new Date(date);
  return new Intl.DateTimeFormat('en-CA', { timeZone: IST_TIMEZONE }).format(d);
};

/**
 * Returns day of week (0 for Sunday, 1 for Monday, etc.) in Asia/Kolkata (IST).
 */
export const getISTDayOfWeek = (dateOrStr = new Date()) => {
  let d;
  if (typeof dateOrStr === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateOrStr)) {
    // Parse as noon IST to safely get day of week
    d = new Date(`${dateOrStr}T12:00:00+05:30`);
  } else {
    d = dateOrStr instanceof Date ? dateOrStr : new Date(dateOrStr);
  }
  const dayStr = new Intl.DateTimeFormat('en-US', { timeZone: IST_TIMEZONE, weekday: 'short' }).format(d);
  const map = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return map[dayStr] ?? 0;
};

/**
 * Returns hours (0-23) in Asia/Kolkata (IST).
 */
export const getISTHours = (date = new Date()) => {
  const d = date instanceof Date ? date : new Date(date);
  const hourStr = new Intl.DateTimeFormat('en-US', {
    timeZone: IST_TIMEZONE,
    hour: 'numeric',
    hour12: false,
  }).format(d);
  const h = parseInt(hourStr, 10);
  return h === 24 ? 0 : h;
};

/**
 * Returns minutes (0-59) in Asia/Kolkata (IST).
 */
export const getISTMinutes = (date = new Date()) => {
  const d = date instanceof Date ? date : new Date(date);
  const minStr = new Intl.DateTimeFormat('en-US', {
    timeZone: IST_TIMEZONE,
    minute: 'numeric',
  }).format(d);
  return parseInt(minStr, 10);
};

/**
 * Returns month (1-12) in Asia/Kolkata (IST).
 */
export const getISTMonth = (date = new Date()) => {
  const d = date instanceof Date ? date : new Date(date);
  const monthStr = new Intl.DateTimeFormat('en-US', {
    timeZone: IST_TIMEZONE,
    month: 'numeric',
  }).format(d);
  return parseInt(monthStr, 10);
};

/**
 * Returns year (4 digits) in Asia/Kolkata (IST).
 */
export const getISTYear = (date = new Date()) => {
  const d = date instanceof Date ? date : new Date(date);
  const yearStr = new Intl.DateTimeFormat('en-US', {
    timeZone: IST_TIMEZONE,
    year: 'numeric',
  }).format(d);
  return parseInt(yearStr, 10);
};

/**
 * Returns Date object for 23:59:00 IST for a given 'YYYY-MM-DD' date string.
 */
export const getISTEndOfDay = (dateStr) => {
  return new Date(`${dateStr}T23:59:00+05:30`);
};

/**
 * Parses a date/time string (like "2025-05-10T09:30:00", "2025-05-10T09:30", or ISO)
 * ensuring it is strictly interpreted as Asia/Kolkata (IST, +05:30) if no offset is present.
 */
export const parseISTDateTime = (dateTimeStr) => {
  if (!dateTimeStr) return null;
  if (dateTimeStr instanceof Date) return dateTimeStr;

  if (typeof dateTimeStr === 'string') {
    const trimmed = dateTimeStr.trim();
    // If it has standard ISO offset Z or +05:30 or -05:00
    if (trimmed.endsWith('Z') || /[+-]\d{2}:?\d{2}$/.test(trimmed)) {
      return new Date(trimmed);
    }
    // If it's a date-time like YYYY-MM-DDTHH:mm or YYYY-MM-DDTHH:mm:ss
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?(\.\d+)?$/.test(trimmed)) {
      const parts = trimmed.split('T');
      const timePart = parts[1].length === 5 ? `${parts[1]}:00` : parts[1];
      return new Date(`${parts[0]}T${timePart}+05:30`);
    }
    // If it's YYYY-MM-DD HH:mm:ss
    if (/^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}(:\d{2})?$/.test(trimmed)) {
      const parts = trimmed.split(' ');
      const timePart = parts[1].length === 5 ? `${parts[1]}:00` : parts[1];
      return new Date(`${parts[0]}T${timePart}+05:30`);
    }
    // Date only string YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return new Date(`${trimmed}T00:00:00+05:30`);
    }
  }

  return new Date(dateTimeStr);
};

/**
 * Formats time in IST (e.g. "09:30 AM" or "09:30:00 AM").
 */
export const formatISTTime = (date, includeSeconds = false) => {
  if (!date) return '';
  const d = date instanceof Date ? date : new Date(date);
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: IST_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    ...(includeSeconds ? { second: '2-digit' } : {}),
    hour12: true,
  }).format(d);
};

/**
 * Formats datetime in IST (e.g. "04 Sep 2026, 11:55:00 am").
 */
export const formatISTDateTime = (date, includeSeconds = true) => {
  if (!date) return '';
  const d = date instanceof Date ? date : new Date(date);
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: IST_TIMEZONE,
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...(includeSeconds ? { second: '2-digit' } : {}),
    hour12: true,
  }).format(d);
};
