// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file tooltipEntries.test.ts
 * @input formatTooltipLines and its entry types
 * @output Coverage for zone/format/label resolution of Timestamp tooltip lines
 * @position Unit tests for the pure tooltip-line formatter
 *
 * These tests must pass under ANY machine timezone. The repo pins TZ neither in
 * vitest.config.ts nor in CI, so a developer machine (e.g. America/New_York) and
 * CI (typically UTC) run the same assertions. Every exact-string expectation
 * therefore names an explicit zone and uses a `system_*` format, which is built
 * from numeric parts and is both timezone- and locale-independent. Assertions
 * about locale-formatted output stay structural.
 */

import {describe, it, expect, vi} from 'vitest';
import {formatTooltipLines} from './tooltipEntries';

/** 2026-02-19T17:00:00Z — chosen so several zones land on different dates. */
const INSTANT = new Date('2026-02-19T17:00:00Z');

const LOCAL_ZONE = Intl.DateTimeFormat().resolvedOptions().timeZone;

describe('formatTooltipLines', () => {
  // --- Explicit zones: exact, locale-free, TZ-agnostic ---

  it('renders system_date_time in an explicit zone', () => {
    const lines = formatTooltipLines(INSTANT, [
      {timezoneID: 'UTC', format: 'system_date_time'},
    ]);
    expect(lines).toHaveLength(1);
    expect(lines[0].value).toBe('2026-02-19 17:00:00');
  });

  it('crosses the date line for a zone that is a day ahead', () => {
    // 17:00Z is 02:00 the NEXT day in Tokyo. A naive local-getter
    // implementation would return the viewer's date here.
    const lines = formatTooltipLines(INSTANT, [
      {timezoneID: 'Asia/Tokyo', format: 'system_date_time'},
    ]);
    expect(lines[0].value).toBe('2026-02-20 02:00:00');
  });

  it('handles a half-hour offset zone', () => {
    const lines = formatTooltipLines(INSTANT, [
      {timezoneID: 'Asia/Kolkata', format: 'system_date_time'},
    ]);
    expect(lines[0].value).toBe('2026-02-19 22:30:00');
  });

  it('renders system_date and system_time in an explicit zone', () => {
    const lines = formatTooltipLines(INSTANT, [
      {timezoneID: 'America/Los_Angeles', format: 'system_date'},
      {timezoneID: 'America/Los_Angeles', format: 'system_time'},
    ]);
    expect(lines[0].value).toBe('2026-02-19');
    expect(lines[1].value).toBe('09:00:00');
  });

  it('honors the zone across a DST transition rather than a fixed offset', () => {
    // Los Angeles is UTC-8 in January and UTC-7 in July. A fixed-offset
    // implementation would get one of these wrong.
    const winter = formatTooltipLines(new Date('2026-01-15T20:00:00Z'), [
      {timezoneID: 'America/Los_Angeles', format: 'system_date_time'},
    ]);
    const summer = formatTooltipLines(new Date('2026-07-15T20:00:00Z'), [
      {timezoneID: 'America/Los_Angeles', format: 'system_date_time'},
    ]);
    expect(winter[0].value).toBe('2026-01-15 12:00:00');
    expect(summer[0].value).toBe('2026-07-15 13:00:00');
  });

  // --- Equivalence with the untouched local implementation ---

  it('matches the local-getter output character-for-character for the viewer zone', () => {
    // The existing formatTimestamp() builds system_* from date.getFullYear()/
    // getHours()/... Naming the viewer's own zone explicitly must produce the
    // identical string, or the two code paths have drifted.
    const pad = (n: number) => String(n).padStart(2, '0');
    const expected = `${INSTANT.getFullYear()}-${pad(INSTANT.getMonth() + 1)}-${pad(
      INSTANT.getDate(),
    )} ${pad(INSTANT.getHours())}:${pad(INSTANT.getMinutes())}:${pad(
      INSTANT.getSeconds(),
    )}`;

    const explicit = formatTooltipLines(INSTANT, [
      {timezoneID: LOCAL_ZONE, format: 'system_date_time'},
    ]);
    const implicit = formatTooltipLines(INSTANT, [
      {format: 'system_date_time'},
    ]);

    expect(explicit[0].value).toBe(expected);
    expect(implicit[0].value).toBe(expected);
  });

  // --- The 'local' sentinel ---

  it("treats timezoneID 'local' as an alias for the viewer's zone", () => {
    const omitted = formatTooltipLines(INSTANT, [{format: 'system_date_time'}]);
    const sentinel = formatTooltipLines(INSTANT, [
      {timezoneID: 'local', format: 'system_date_time'},
    ]);
    expect(sentinel[0].value).toBe(omitted[0].value);
  });

  it("does not treat 'local' as an IANA id to be looked up", () => {
    // 'local' is not a real zone; it must never reach Intl, which would throw.
    expect(() =>
      formatTooltipLines(INSTANT, [{timezoneID: 'local'}]),
    ).not.toThrow();
  });

  // --- Defaults ---

  it("defaults an entry's format to the full absolute style", () => {
    const [line] = formatTooltipLines(INSTANT, [{timezoneID: 'UTC'}]);
    // The full style carries date, time-with-seconds and a zone name.
    expect(line.value).toContain('2026');
    expect(line.value).toMatch(/\d{1,2}:00:00/);
    expect(line.value).toContain('UTC');
  });

  it('defaults an entry to the viewer zone when no timezoneID is given', () => {
    const [line] = formatTooltipLines(INSTANT, [{}]);
    expect(line.value).toContain('2026');
    expect(line.label).toBeUndefined();
  });

  // --- Labels ---

  it('passes a consumer label through verbatim', () => {
    const lines = formatTooltipLines(INSTANT, [
      {label: 'Your time'},
      {timezoneID: 'UTC', label: 'UTC'},
    ]);
    expect(lines[0].label).toBe('Your time');
    expect(lines[1].label).toBe('UTC');
  });

  it('never invents a label when none is supplied', () => {
    const lines = formatTooltipLines(INSTANT, [{}, {timezoneID: 'Asia/Tokyo'}]);
    expect(lines[0].label).toBeUndefined();
    expect(lines[1].label).toBeUndefined();
  });

  // --- Auto zone abbreviation (the disambiguation rule) ---

  it('appends a zone abbreviation to date_time lines when zones differ', () => {
    const lines = formatTooltipLines(INSTANT, [
      {format: 'date_time'},
      {timezoneID: 'UTC', format: 'date_time'},
    ]);
    // Two distinct zones were asked for, so each line must say which it is.
    expect(lines[1].value).toContain('UTC');
  });

  it('omits the zone abbreviation from date_time when only one zone is shown', () => {
    // Same zone rendered twice in two formats — a zone marker would be noise.
    const lines = formatTooltipLines(INSTANT, [
      {timezoneID: 'UTC', format: 'date_time'},
      {timezoneID: 'UTC', format: 'system_date_time'},
    ]);
    expect(lines[0].value).not.toContain('UTC');
    expect(lines[1].value).toBe('2026-02-19 17:00:00');
  });

  it('never appends a zone abbreviation to system_* lines', () => {
    const lines = formatTooltipLines(INSTANT, [
      {format: 'system_date_time'},
      {timezoneID: 'Asia/Tokyo', format: 'system_date_time'},
    ]);
    // Two distinct zones, but system_* output stays machine-clean.
    expect(lines[1].value).toBe('2026-02-20 02:00:00');
  });

  it('always carries a zone name on the full style, even for a single line', () => {
    const [line] = formatTooltipLines(INSTANT, [{timezoneID: 'UTC'}]);
    expect(line.value).toContain('UTC');
  });

  // --- Invalid zone handling ---

  it('falls back to the viewer zone instead of throwing on an invalid zone id', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      const lines = formatTooltipLines(INSTANT, [
        {timezoneID: 'Not/AZone', format: 'system_date_time'},
      ]);
      const local = formatTooltipLines(INSTANT, [{format: 'system_date_time'}]);
      expect(lines[0].value).toBe(local[0].value);
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('Not/AZone'));
    } finally {
      warn.mockRestore();
    }
  });

  it('does not throw on a plausible-but-wrong abbreviation like PST', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      expect(() =>
        formatTooltipLines(INSTANT, [{timezoneID: 'PST'}]),
      ).not.toThrow();
    } finally {
      warn.mockRestore();
    }
  });

  it('keeps the remaining lines intact when one entry has a bad zone', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      const lines = formatTooltipLines(INSTANT, [
        {timezoneID: 'Not/AZone', format: 'system_date_time'},
        {timezoneID: 'UTC', format: 'system_date_time'},
      ]);
      expect(lines).toHaveLength(2);
      expect(lines[1].value).toBe('2026-02-19 17:00:00');
    } finally {
      warn.mockRestore();
    }
  });

  // --- Ordering and arity ---

  it('preserves entry order', () => {
    const lines = formatTooltipLines(INSTANT, [
      {timezoneID: 'Asia/Tokyo', format: 'system_date', label: 'Tokyo'},
      {timezoneID: 'UTC', format: 'system_date', label: 'UTC'},
      {timezoneID: 'America/Los_Angeles', format: 'system_date', label: 'LA'},
    ]);
    expect(lines.map(l => l.label)).toEqual(['Tokyo', 'UTC', 'LA']);
    expect(lines.map(l => l.value)).toEqual([
      '2026-02-20',
      '2026-02-19',
      '2026-02-19',
    ]);
  });

  it('returns one line per entry, including duplicates', () => {
    const lines = formatTooltipLines(INSTANT, [
      {timezoneID: 'UTC'},
      {timezoneID: 'UTC'},
    ]);
    expect(lines).toHaveLength(2);
    expect(lines[0].value).toBe(lines[1].value);
  });

  it('returns an empty array for no entries', () => {
    expect(formatTooltipLines(INSTANT, [])).toEqual([]);
  });

  // --- Zone ids are case-insensitive per ECMA-402 ---

  it('accepts a lowercase IANA id', () => {
    const lines = formatTooltipLines(INSTANT, [
      {timezoneID: 'asia/tokyo', format: 'system_date_time'},
    ]);
    expect(lines[0].value).toBe('2026-02-20 02:00:00');
  });
});
