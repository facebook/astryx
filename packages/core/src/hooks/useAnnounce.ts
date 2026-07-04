// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useAnnounce.ts
 * @input Uses React useCallback; DOM APIs for a singleton live-region pair
 * @output Exports useAnnounce hook and AnnouncePoliteness type
 * @position Core a11y hook; provides imperative screen-reader announcements
 *   via persistently-mounted polite/assertive live regions
 *
 * SYNC: When modified, update:
 * - /packages/core/src/hooks/index.ts
 */

import {useCallback} from 'react';

/**
 * Announcement urgency:
 * - `'polite'` (default): announced when the screen reader is idle. Use for
 *   status updates, result counts, "no results", non-urgent confirmations.
 * - `'assertive'`: interrupts the current announcement. Reserve for errors and
 *   time-sensitive alerts.
 */
export type AnnouncePoliteness = 'polite' | 'assertive';

/**
 * Imperative screen-reader announcement function.
 */
export type AnnounceFn = (
  message: string,
  politeness?: AnnouncePoliteness,
) => void;

const CONTAINER_ATTR = 'data-astryx-live-region';

// Visually-hidden clip block (matches the VisuallyHidden primitive). Applied
// inline so the regions work without any stylesheet being present.
const VISUALLY_HIDDEN_CSS =
  'position:absolute;width:1px;height:1px;margin:-1px;padding:0;' +
  'overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;' +
  'inset-block-start:0;inset-inline-start:0;pointer-events:none;' +
  'user-select:none;';

interface LiveRegions {
  polite: HTMLElement;
  assertive: HTMLElement;
}

// Singleton: the live regions are created ONCE and stay mounted for the
// lifetime of the document. This is the crux of reliable announcements — many
// screen readers will not announce content injected into a live region that is
// created together with its content ("born with content"). By mounting empty
// regions up front and only mutating their text later, updates are announced.
let regions: LiveRegions | null = null;

function createRegion(politeness: AnnouncePoliteness): HTMLElement {
  const el = document.createElement('div');
  el.setAttribute(CONTAINER_ATTR, politeness);
  el.setAttribute('aria-live', politeness);
  el.setAttribute('aria-atomic', 'true');
  el.setAttribute('role', politeness === 'assertive' ? 'alert' : 'status');
  el.style.cssText = VISUALLY_HIDDEN_CSS;
  document.body.appendChild(el);
  return el;
}

function getRegions(): LiveRegions | null {
  if (typeof document === 'undefined') {
    return null;
  }
  if (regions) {
    // Re-attach if a region was removed from the DOM (e.g. by a test cleanup).
    if (!regions.polite.isConnected) {
      document.body.appendChild(regions.polite);
    }
    if (!regions.assertive.isConnected) {
      document.body.appendChild(regions.assertive);
    }
    return regions;
  }
  regions = {
    polite: createRegion('polite'),
    assertive: createRegion('assertive'),
  };
  return regions;
}

function announceMessage(
  message: string,
  politeness: AnnouncePoliteness,
): void {
  const r = getRegions();
  if (!r) {
    return;
  }
  const target = politeness === 'assertive' ? r.assertive : r.polite;
  // Clearing first guarantees the mutation is observed even when the new
  // message equals the current text — some AT deduplicate identical content.
  target.textContent = '';
  // A microtask/rAF-free re-set in the next frame is more reliable across AT
  // than an immediate re-set, which can be coalesced with the clear.
  requestAnimationFrame(() => {
    target.textContent = message;
  });
}

/**
 * Clear any pending announcement from a region without announcing anything new.
 * Used when the triggering context goes away (e.g. a search query is cleared),
 * so stale status text does not linger in the accessibility tree.
 */
function clearRegion(politeness: AnnouncePoliteness): void {
  if (!regions) {
    return;
  }
  const target =
    politeness === 'assertive' ? regions.assertive : regions.polite;
  target.textContent = '';
}

/**
 * Returns an imperative `announce(message, politeness?)` function that speaks a
 * message through a persistently-mounted, visually-hidden live region.
 *
 * The polite and assertive regions are created once on first use and kept
 * mounted, so announcements are reliable even for messages that appear
 * immediately (unlike a live region rendered together with its content).
 *
 * @example
 * ```
 * function Search() {
 *   const announce = useAnnounce();
 *   const onResults = (n: number) => {
 *     announce(n === 0 ? 'No results found' : `${n} results`);
 *   };
 *   // ...
 * }
 * ```
 */
export function useAnnounce(): AnnounceFn {
  return useCallback(
    (message: string, politeness: AnnouncePoliteness = 'polite') => {
      if (!message) {
        // An empty message clears any lingering status from the region rather
        // than announcing nothing — useful when the triggering context ends.
        clearRegion(politeness);
        return;
      }
      announceMessage(message, politeness);
    },
    [],
  );
}

/**
 * Test-only helper: removes the singleton live regions and resets state so
 * each test starts clean. Not part of the public runtime API.
 *
 * @internal
 */
export function __resetLiveRegionsForTest(): void {
  if (regions) {
    regions.polite.remove();
    regions.assertive.remove();
    regions = null;
  }
}
