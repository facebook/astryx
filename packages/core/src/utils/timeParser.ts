/**
 * @file timeParser.ts
 * @input Uses string parsing
 * @output Exports time parsing and formatting utilities
 * @position Shared utility; used by TimePicker
 *
 * SYNC: When modified, update this header
 */

/**
 * ISO time string in HH:MM or HH:MM:SS format (24-hour).
 * Examples: "14:30", "09:15:00", "23:59:59"
 */
export type ISOTimeString = string & {readonly __brand: 'ISOTimeString'};

/**
 * Parsed time object for internal manipulation.
 */
export interface ParsedTime {
  hour: number; // 0-23
  minute: number; // 0-59
  second: number; // 0-59
}

/**
 * Validates and creates an ISOTimeString from a string.
 * Returns null if the string is not a valid time format.
 */
export function createISOTimeString(value: string): ISOTimeString | null {
  const parsed = parseISOTime(value);
  if (!parsed) return null;
  return formatISOTime(parsed, value.split(':').length === 3);
}

/**
 * Parses an ISO time string into a ParsedTime object.
 * Accepts HH:MM or HH:MM:SS format.
 */
export function parseISOTime(time: string): ParsedTime | null {
  if (!time) return null;

  const parts = time.split(':');
  if (parts.length < 2 || parts.length > 3) return null;

  const hour = parseInt(parts[0], 10);
  const minute = parseInt(parts[1], 10);
  const second = parts.length === 3 ? parseInt(parts[2], 10) : 0;

  if (
    isNaN(hour) ||
    isNaN(minute) ||
    isNaN(second) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59 ||
    second < 0 ||
    second > 59
  ) {
    return null;
  }

  return {hour, minute, second};
}

/**
 * Formats a ParsedTime object into an ISOTimeString.
 */
export function formatISOTime(
  time: ParsedTime,
  includeSeconds: boolean = false,
): ISOTimeString {
  const hh = time.hour.toString().padStart(2, '0');
  const mm = time.minute.toString().padStart(2, '0');

  if (includeSeconds) {
    const ss = time.second.toString().padStart(2, '0');
    return `${hh}:${mm}:${ss}` as ISOTimeString;
  }

  return `${hh}:${mm}` as ISOTimeString;
}

/**
 * Formats a time for display in 12-hour format.
 * Example: "14:30" -> "2:30 PM"
 */
export function formatDisplayTime12h(
  time: ISOTimeString | undefined,
  includeSeconds: boolean = false,
): string {
  if (!time) return '';

  const parsed = parseISOTime(time);
  if (!parsed) return '';

  const hour12 =
    parsed.hour === 0 ? 12 : parsed.hour > 12 ? parsed.hour - 12 : parsed.hour;
  const meridiem = parsed.hour < 12 ? 'AM' : 'PM';
  const mm = parsed.minute.toString().padStart(2, '0');

  if (includeSeconds) {
    const ss = parsed.second.toString().padStart(2, '0');
    return `${hour12}:${mm}:${ss} ${meridiem}`;
  }

  return `${hour12}:${mm} ${meridiem}`;
}

/**
 * Formats a time for display in 24-hour format.
 * Example: "14:30" -> "14:30"
 */
export function formatDisplayTime24h(
  time: ISOTimeString | undefined,
  includeSeconds: boolean = false,
): string {
  if (!time) return '';

  const parsed = parseISOTime(time);
  if (!parsed) return '';

  const hh = parsed.hour.toString().padStart(2, '0');
  const mm = parsed.minute.toString().padStart(2, '0');

  if (includeSeconds) {
    const ss = parsed.second.toString().padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  }

  return `${hh}:${mm}`;
}

/**
 * Parses user input into an ISOTimeString.
 * Accepts various formats:
 * - "2:30 PM", "2:30pm", "2:30 pm"
 * - "14:30", "1430"
 * - "2pm", "2 PM"
 */
export function parseTimeInput(
  input: string,
  includeSeconds: boolean = false,
): ISOTimeString | null {
  if (!input) return null;

  const trimmed = input.trim().toLowerCase();

  // Check for AM/PM
  const hasMeridiem = /[ap]m?\s*$/i.test(trimmed);
  const isPM = /p\.?m?\.?\s*$/i.test(trimmed);
  const isAM = /a\.?m?\.?\s*$/i.test(trimmed);

  // Remove AM/PM suffix
  const timeStr = trimmed.replace(/\s*[ap]\.?m?\.?\s*$/i, '').trim();

  // Handle formats like "2pm" -> "2"
  if (/^\d{1,2}$/.test(timeStr)) {
    const hour = parseInt(timeStr, 10);
    if (hour >= 1 && hour <= 12 && hasMeridiem) {
      let hour24 = hour;
      if (isPM && hour !== 12) hour24 = hour + 12;
      if (isAM && hour === 12) hour24 = 0;
      return formatISOTime(
        {hour: hour24, minute: 0, second: 0},
        includeSeconds,
      );
    }
    if (hour >= 0 && hour <= 23 && !hasMeridiem) {
      return formatISOTime({hour, minute: 0, second: 0}, includeSeconds);
    }
    return null;
  }

  // Handle "1430" format
  if (/^\d{4}$/.test(timeStr)) {
    const hour = parseInt(timeStr.slice(0, 2), 10);
    const minute = parseInt(timeStr.slice(2, 4), 10);
    if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
      return formatISOTime({hour, minute, second: 0}, includeSeconds);
    }
    return null;
  }

  // Handle "143000" format (with seconds)
  if (/^\d{6}$/.test(timeStr)) {
    const hour = parseInt(timeStr.slice(0, 2), 10);
    const minute = parseInt(timeStr.slice(2, 4), 10);
    const second = parseInt(timeStr.slice(4, 6), 10);
    if (
      hour >= 0 &&
      hour <= 23 &&
      minute >= 0 &&
      minute <= 59 &&
      second >= 0 &&
      second <= 59
    ) {
      return formatISOTime({hour, minute, second}, includeSeconds);
    }
    return null;
  }

  // Handle colon-separated formats
  const colonParts = timeStr.split(':');
  if (colonParts.length >= 2 && colonParts.length <= 3) {
    let hour = parseInt(colonParts[0], 10);
    const minute = parseInt(colonParts[1], 10);
    const second = colonParts.length === 3 ? parseInt(colonParts[2], 10) : 0;

    if (isNaN(hour) || isNaN(minute) || isNaN(second)) return null;
    if (minute < 0 || minute > 59 || second < 0 || second > 59) return null;

    // Convert 12h to 24h if meridiem present
    if (hasMeridiem) {
      if (hour < 1 || hour > 12) return null;
      if (isPM && hour !== 12) hour += 12;
      if (isAM && hour === 12) hour = 0;
    } else {
      if (hour < 0 || hour > 23) return null;
    }

    return formatISOTime({hour, minute, second}, includeSeconds);
  }

  return null;
}

/**
 * Compares two times. Returns:
 * - negative if a < b
 * - 0 if a === b
 * - positive if a > b
 */
export function compareTime(
  a: ISOTimeString | undefined,
  b: ISOTimeString | undefined,
): number {
  if (!a && !b) return 0;
  if (!a) return -1;
  if (!b) return 1;

  const parsedA = parseISOTime(a);
  const parsedB = parseISOTime(b);

  if (!parsedA && !parsedB) return 0;
  if (!parsedA) return -1;
  if (!parsedB) return 1;

  const totalA = parsedA.hour * 3600 + parsedA.minute * 60 + parsedA.second;
  const totalB = parsedB.hour * 3600 + parsedB.minute * 60 + parsedB.second;

  return totalA - totalB;
}

/**
 * Checks if a time is within a min/max range (inclusive).
 */
export function isTimeInRange(
  time: ISOTimeString,
  min?: ISOTimeString,
  max?: ISOTimeString,
): boolean {
  if (min && compareTime(time, min) < 0) return false;
  if (max && compareTime(time, max) > 0) return false;
  return true;
}

/**
 * Clamps a time to a min/max range.
 */
export function clampTime(
  time: ISOTimeString,
  min?: ISOTimeString,
  max?: ISOTimeString,
  includeSeconds: boolean = false,
): ISOTimeString {
  const parsed = parseISOTime(time);
  if (!parsed) return time;

  if (min && compareTime(time, min) < 0) {
    return formatISOTime(parseISOTime(min)!, includeSeconds);
  }
  if (max && compareTime(time, max) > 0) {
    return formatISOTime(parseISOTime(max)!, includeSeconds);
  }

  return time;
}

/**
 * Adjusts a time by adding/subtracting minutes.
 */
export function adjustTime(
  time: ISOTimeString,
  deltaMinutes: number,
  includeSeconds: boolean = false,
): ISOTimeString {
  const parsed = parseISOTime(time);
  if (!parsed) return time;

  // Convert to total seconds for precision with fractional minutes
  let totalSeconds =
    parsed.hour * 3600 +
    parsed.minute * 60 +
    parsed.second +
    Math.round(deltaMinutes * 60);

  // Wrap around midnight
  const daySeconds = 24 * 3600;
  while (totalSeconds < 0) totalSeconds += daySeconds;
  totalSeconds = totalSeconds % daySeconds;

  const newHour = Math.floor(totalSeconds / 3600);
  const newMinute = Math.floor((totalSeconds % 3600) / 60);
  const newSecond = totalSeconds % 60;

  return formatISOTime(
    {hour: newHour, minute: newMinute, second: newSecond},
    includeSeconds,
  );
}
