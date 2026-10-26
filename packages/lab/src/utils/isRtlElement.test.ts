// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it} from 'vitest';
import {isRtlElement} from './isRtlElement';

describe('isRtlElement', () => {
  it('reads the element\u2019s computed direction', () => {
    const element = document.createElement('div');
    element.style.direction = 'rtl';
    document.body.append(element);
    expect(isRtlElement(element)).toBe(true);
    element.style.direction = 'ltr';
    expect(isRtlElement(element)).toBe(false);
    element.remove();
  });

  it('answers false for nothing', () => {
    expect(isRtlElement(null)).toBe(false);
  });
});
