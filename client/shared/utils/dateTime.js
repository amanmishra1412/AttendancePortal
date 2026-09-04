export const IST_TIMEZONE = 'Asia/Kolkata';

/**
 * Formats time strictly in Indian Standard Time (Asia/Kolkata).
 * e.g., "09:30 AM" or "09:30:00 AM"
 */
export const formatTimeIST = (
  date,
  options = { hour: '2-digit', minute: '2-digit', hour12: true }
) => {
  if (!date) return '';
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: IST_TIMEZONE,
    ...options,
  }).format(d);
};

/**
 * Formats date strictly in Indian Standard Time (Asia/Kolkata).
 * e.g., "04 Sep 2026" or custom options
 */
export const formatDateIST = (
  date,
  options = { day: '2-digit', month: 'short', year: 'numeric' }
) => {
  if (!date) return '';
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: IST_TIMEZONE,
    ...options,
  }).format(d);
};

/**
 * Formats datetime strictly in Indian Standard Time (Asia/Kolkata).
 * e.g., "04 Sep 2026, 11:55:00 am" or "04 Sep 2026, 11:55 am"
 */
export const formatDateTimeIST = (date, includeSeconds = true) => {
  if (!date) return '';
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return '';
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

/**
 * Extracts "HH:mm" in Asia/Kolkata from a timestamp for <input type="time" />
 */
export const getISTTimeInputString = (timestamp) => {
  if (!timestamp) return '';
  const d = timestamp instanceof Date ? timestamp : new Date(timestamp);
  if (isNaN(d.getTime())) return '';

  const parts = new Intl.DateTimeFormat('en-IN', {
    timeZone: IST_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(d);

  const hour = parts.find((p) => p.type === 'hour')?.value || '00';
  const minute = parts.find((p) => p.type === 'minute')?.value || '00';
  return `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;
};

/**
 * Creates an ISO string with explicit IST (+05:30) offset from date and time strings.
 * e.g., dateStr = "2026-09-04", timeStr = "09:30" => "2026-09-04T09:30:00+05:30"
 */
export const toISTISOString = (dateStr, timeStr) => {
  if (!dateStr || !timeStr) return '';
  const time = timeStr.length === 5 ? `${timeStr}:00` : timeStr;
  return `${dateStr}T${time}+05:30`;
};

/**
 * Returns today's date formatted as 'YYYY-MM-DD' in Asia/Kolkata (IST).
 */
export const getTodayISTDateString = (date = new Date()) => {
  const d = date instanceof Date ? date : new Date(date);
  return new Intl.DateTimeFormat('en-CA', { timeZone: IST_TIMEZONE }).format(d);
};
