// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file MobileNavCloseTiming.test.ts
 * @input Uses vitest, parseLongestDurationMs from MobileNav
 * @output Unit coverage for reading the slide-out's duration
 * @position Testing; guards the timing helper that decides when the native
 *   dialog closes: at the end of the drawer's slide-out
 *
 * Through the component this helper is only ever reachable via jsdom, which
 * echoes an inline `250ms` back verbatim and never resolves `var()`. Browsers do
 * neither: they serialise computed `<time>` values in seconds, so `"0.41s"` is
 * the only shape the helper sees in production and `"250ms"` is a shape it never
 * sees. Reading it directly is the only way the seconds branch, a list, and a
 * zero duration get covered at all.
 */

import {describe, it, expect} from 'vitest';
import {parseLongestDurationMs} from './MobileNav';

describe('parseLongestDurationMs', () => {
  it.each([
    // How browsers actually serialise a computed transition-duration.
    ['0.41s', 410],
    ['0.25s', 250],
    ['1s', 1000],
    // jsdom's shape: an inline declaration echoed back unchanged.
    ['250ms', 250],
    // Lists. The drawer transitions one property today, but the dialog stays
    // open until every transition on it has run.
    ['0.41s, 0.12s', 410],
    ['120ms, 410ms', 410],
    // Reduced motion's near-zero transition, and none at all: the dialog
    // closes at once rather than falling back to the cap.
    ['0.01s', 10],
    ['0s', 0],
    ['0ms', 0],
  ])('reads %j as %ims', (value, expected) => {
    expect(parseLongestDurationMs(value)).toBeCloseTo(expected, 6);
  });

  it.each([
    // An unresolved var() — jsdom, or any style read outside a browser.
    ['var(--duration-medium)'],
    // A CSS math function reads as unreadable too, so the caller falls back to
    // the cap rather than deriving a duration from a number it did not compute.
    ['max(150ms, var(--duration-medium))'],
    // A bare number is not a duration.
    ['250'],
    [''],
    ['   '],
  ])('reports %j as unreadable', value => {
    expect(parseLongestDurationMs(value)).toBeNull();
  });

  it('skips unreadable entries rather than discarding the whole list', () => {
    expect(parseLongestDurationMs('var(--x), 0.3s')).toBeCloseTo(300, 6);
  });
});
