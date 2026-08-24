// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file resolveRingGeometry.test.ts
 * @input resolveRingGeometry
 * @output Unit tests for the ring's themed-vs-default geometry resolution
 * @position Testing; the fallback half of the themeable-geometry contract.
 *   What the canvas paints is verified in a browser (jsdom has no 2d context).
 */

import {describe, it, expect} from 'vitest';
import {resolveRingGeometry} from './resolveRingGeometry';

const MD = {diameter: 14, border: 3};

describe('resolveRingGeometry', () => {
  it('draws with the size default when a theme sets nothing', () => {
    // An unset registered property resolves to its initial `0px`, and an
    // engine without registered properties gives NaN — both mean "not themed".
    expect(resolveRingGeometry(NaN, NaN, MD)).toEqual(MD);
  });

  it('draws with a themed length in place of the default', () => {
    // Registered as <length>, so `2.5rem` and `calc(2rem + 8px)` reach here
    // already resolved to px — this is why a theme is not limited to px.
    expect(resolveRingGeometry(40, 6, MD)).toEqual({diameter: 40, border: 6});
  });

  it('honours a rail of 0, rather than reading it as unset', () => {
    // A theme asking for no visible track gets one. Read as "absent" this fell
    // back to the default rail, drawing a 4px ring in a box sized for none.
    expect(resolveRingGeometry(28, 0, MD)).toEqual({diameter: 28, border: 0});
  });

  it('falls back when only one of the two resolves', () => {
    // The vars are independent: a theme may set the diameter and leave the
    // rail alone, and half a resolution must not drag the other half with it.
    expect(resolveRingGeometry(40, NaN, MD)).toEqual({diameter: 40, border: 3});
    expect(resolveRingGeometry(NaN, 6, MD)).toEqual({diameter: 14, border: 6});
  });

  it('falls back for a diameter of 0, keeping the spinner visible', () => {
    // The asymmetry with the rail is deliberate: a zero-diameter ring is not a
    // thing anyone themes, and it is what an unresolved var looks like on the
    // first paint, so drawing nothing would be a blank spinner rather than a
    // small one.
    expect(resolveRingGeometry(0, 2, MD)).toEqual({diameter: 14, border: 2});
  });

  it('falls back for values that are not finite lengths', () => {
    // `parseFloat` of a value the registration rejected, and the infinities a
    // pathological calc() can produce.
    expect(resolveRingGeometry(Infinity, -Infinity, MD)).toEqual(MD);
  });
});
