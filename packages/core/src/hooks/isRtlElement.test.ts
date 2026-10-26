// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file isRtlElement.test.ts
 * @input The public hooks entry and jsdom elements with and without a
 *   right-to-left direction
 * @output Proves isRtlElement is exported from the hooks entry and reads the
 *   direction an element computes (right to left, left to right by default),
 *   and is false for no element
 * @position Unit test beside isRtlElement.ts
 */

import {afterEach, describe, expect, it} from 'vitest';
import * as hooks from './index';

describe('isRtlElement', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('is exported from the hooks entry', () => {
    expect(typeof hooks.isRtlElement).toBe('function');
  });

  it('reads the direction the element computes', () => {
    document.body.innerHTML =
      '<span id="rtl" style="direction: rtl"></span><span id="ltr"></span>';
    expect(hooks.isRtlElement(document.getElementById('rtl'))).toBe(true);
    expect(hooks.isRtlElement(document.getElementById('ltr'))).toBe(false);
  });

  it('is false for no element', () => {
    expect(hooks.isRtlElement(null)).toBe(false);
  });
});
