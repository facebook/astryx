// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file isRtlElement.test.ts
 * @input vitest (jsdom) and isRtlElement
 * @output Proofs that the check reads an element's computed direction and is
 *   false without an element
 * @position Testing; validates utils/isRtlElement.ts
 */

import {afterEach, describe, expect, it} from 'vitest';
import {isRtlElement} from './isRtlElement';

afterEach(() => {
  document.body.innerHTML = '';
});

describe('isRtlElement', () => {
  it('is false without an element', () => {
    expect(isRtlElement(null)).toBe(false);
    expect(isRtlElement(undefined)).toBe(false);
  });

  it('reads the element’s computed direction', () => {
    const element = document.createElement('div');
    document.body.append(element);
    expect(isRtlElement(element)).toBe(false);
    element.style.direction = 'rtl';
    expect(isRtlElement(element)).toBe(true);
    element.style.direction = 'ltr';
    expect(isRtlElement(element)).toBe(false);
  });
});
