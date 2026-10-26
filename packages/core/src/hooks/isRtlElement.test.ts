// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file isRtlElement.test.ts
 * @input jsdom elements with and without a right-to-left direction
 * @output Proves isRtlElement reads the direction an element computes
 *   (right to left, left to right by default), and is false for no element
 * @position Unit test beside isRtlElement.ts
 */

import {afterEach, describe, expect, it} from 'vitest';
import {isRtlElement} from './isRtlElement';

describe('isRtlElement', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('reads the direction the element computes', () => {
    document.body.innerHTML =
      '<span id="rtl" style="direction: rtl"></span><span id="ltr"></span>';
    expect(isRtlElement(document.getElementById('rtl'))).toBe(true);
    expect(isRtlElement(document.getElementById('ltr'))).toBe(false);
  });

  it('is false for no element', () => {
    expect(isRtlElement(null)).toBe(false);
  });
});
