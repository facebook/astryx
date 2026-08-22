// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file isRenderable.test.tsx
 * @input Uses vitest and isRenderable
 * @output Tests for every value React treats as empty, including the empty
 *   array a `.map()` over an empty list produces
 * @position Testing; validates isRenderable.ts
 */

import {describe, it, expect} from 'vitest';
import {isRenderable} from './isRenderable';

describe('isRenderable', () => {
  it('is false for the values React renders as nothing', () => {
    expect(isRenderable(null)).toBe(false);
    expect(isRenderable(undefined)).toBe(false);
    expect(isRenderable(true)).toBe(false);
    expect(isRenderable(false)).toBe(false);
    expect(isRenderable('')).toBe(false);
  });

  it('is true for content that produces DOM output', () => {
    expect(isRenderable('text')).toBe(true);
    expect(isRenderable(<span />)).toBe(true);
  });

  // `0` renders the character "0" — it is content, unlike the other falsy
  // values above.
  it('is true for the number zero', () => {
    expect(isRenderable(0)).toBe(true);
  });

  // The case a slot prop hits in real code: `endContent={items.map(...)}`
  // over an empty list. React renders nothing, so a caller must not draw the
  // wrapper (divider, separator, container) that would frame it.
  it('is false for an empty array', () => {
    expect(isRenderable([])).toBe(false);
  });

  it('is true for a non-empty array', () => {
    expect(isRenderable(['a'])).toBe(true);
    expect(isRenderable([<span key="a" />])).toBe(true);
  });
});
