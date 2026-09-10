// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file MobileNavCloseTiming.test.ts
 * @input Uses vitest, parseShortestDurationMs from MobileNav
 * @output Unit coverage for the close-delay duration parsing (#4290)
 * @position Testing; guards the timing helper behind MobileNav's deferred close
 *
 * Through the component this helper is only ever reachable via jsdom, which
 * echoes an inline `250ms` back verbatim and never resolves `var()`. Browsers do
 * neither: they serialise computed `<time>` values in seconds, so `"0.41s"` is
 * the only shape the helper sees in production and `"250ms"` is a shape it never
 * sees. Reading it directly is the only way the seconds branch, a list, and a
 * zero hold get covered at all.
 */

import {describe, it, expect} from 'vitest';
import {parseShortestDurationMs} from './MobileNav';

describe('parseShortestDurationMs', () => {
  it.each([
    // How browsers actually serialise a computed transition-duration.
    ['0.41s', 410],
    ['0.25s', 250],
    ['1s', 1000],
    // jsdom's shape: an inline declaration echoed back unchanged.
    ['250ms', 250],
    // Lists. The dialog transitions one property today, but a style or xstyle
    // prop can add more, and only the shortest entry is safe to close inside.
    ['0.41s, 0.12s', 120],
    ['120ms, 410ms', 120],
    // A zero hold is the #4290 state itself. It has to read as 0 — meaning
    // "close now" — rather than as unreadable, which would fall back to the cap
    // and schedule the close long after the drawer stopped being rendered.
    ['0s', 0],
    ['0ms', 0],
  ])('reads %j as %ims', (value, expected) => {
    expect(parseShortestDurationMs(value)).toBeCloseTo(expected, 6);
  });

  it.each([
    // An unresolved var() — jsdom, or any style read outside a browser.
    ['var(--duration-medium)'],
    // A CSS math function reads as unreadable too, so the caller falls back to
    // the cap rather than deriving a delay from a number it did not compute.
    ['max(150ms, var(--duration-medium))'],
    // A bare number is not a duration.
    ['250'],
    [''],
    ['   '],
  ])('reports %j as unreadable', value => {
    expect(parseShortestDurationMs(value)).toBeNull();
  });

  it('skips unreadable entries rather than discarding the whole list', () => {
    expect(parseShortestDurationMs('var(--x), 0.3s')).toBeCloseTo(300, 6);
  });
});
