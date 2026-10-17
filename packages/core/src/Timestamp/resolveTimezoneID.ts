// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file resolveTimezoneID.ts
 * @input One consumer-supplied time zone identifier and the name of the prop
 *   it arrived on
 * @output The identifier when the platform accepts it, or `undefined` for the
 *   viewer's own zone
 * @position Leaf shared by Timestamp's visible text and its tooltip lines;
 *   owns what a consumer-supplied zone identifier means before formatInstant
 *   is handed one
 *
 * formatInstant takes only identifiers `Intl` already accepts — deciding what
 * an unusable one should do belongs to whoever took it from a consumer. Both
 * surfaces that take one make the same decision, so they make it here instead
 * of each guarding its own call and drifting apart on the alias, the fallback,
 * or the warning.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Timestamp/Timestamp.tsx
 * - /packages/core/src/Timestamp/tooltipEntries.ts
 */

import {devWarn} from '../utils/devWarning';

/** Spelling that means "the viewer's own zone" without naming it. */
const LOCAL_ZONE_ALIAS = 'local';

/**
 * Zone identifiers the platform has already accepted.
 *
 * Validating one means constructing a formatter, and resolution runs on every
 * render — on a live timestamp, several times a minute. An IANA identifier's
 * validity cannot change while the page is open, so the probe is worth paying
 * for once per identifier rather than once per render.
 */
const validTimezoneIDs = new Set<string>();

/**
 * Zone identifiers already reported as unknown, keyed by the prop they came
 * from.
 *
 * Resolution runs on every render, so without this a single typo on a live
 * timestamp would emit the same warning every tick, forever. One report per
 * bad identifier per prop is enough to act on, and keying the prop in means a
 * typo repeated on a second surface is still reported for that surface.
 */
const warnedTimezoneIDs = new Set<string>();

/**
 * Resolves a consumer's zone identifier to something safe to hand to `Intl`.
 *
 * Returns `undefined` for the viewer's own zone, which is also what `Intl`
 * treats as "use the host zone" — so the local path never constructs a
 * formatter with an explicit `timeZone` and cannot drift from the output a
 * caller that named no zone has always had.
 *
 * @param timezoneID The identifier as the consumer wrote it.
 * @param source The prop it arrived on, named in the warning so the builder
 *   knows which one to fix.
 */
export function resolveTimezoneID(
  timezoneID: string | undefined,
  source: string,
): string | undefined {
  if (
    timezoneID === undefined ||
    timezoneID.toLowerCase() === LOCAL_ZONE_ALIAS
  ) {
    return undefined;
  }

  if (validTimezoneIDs.has(timezoneID)) {
    return timezoneID;
  }

  // An unrecognized identifier makes every Intl.DateTimeFormat constructor
  // throw a RangeError. Rendering a timestamp must never take down the tree —
  // degrade to the viewer's zone and say so, mirroring how an unparseable
  // `value` is handled in Timestamp.tsx.
  try {
    // Locale does not affect time-zone identifier validity; pin one so this
    // validation path stays explicit and deterministic.
    new Intl.DateTimeFormat('en-US', {timeZone: timezoneID});
  } catch {
    const warningKey = `${source}\u0000${timezoneID}`;
    if (!warnedTimezoneIDs.has(warningKey)) {
      warnedTimezoneIDs.add(warningKey);
      devWarn(
        'Timestamp',
        `unknown time zone ${JSON.stringify(timezoneID)} in ${source}. Falling back to the viewer's time zone.`,
      );
    }
    return undefined;
  }

  validTimezoneIDs.add(timezoneID);
  return timezoneID;
}
