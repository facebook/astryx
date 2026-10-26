// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it} from 'vitest';
import {isTouchSupportOff} from './touchSupport';

describe('touch support in the stories', () => {
  it('is on unless the URL globals turn it off', () => {
    expect(isTouchSupportOff('?id=core-switch--default&viewMode=story')).toBe(
      false,
    );
    expect(
      isTouchSupportOff('?id=core-switch--default&globals=touchSupport:off'),
    ).toBe(true);
    expect(
      isTouchSupportOff(
        '?id=x&globals=astryxTheme:stone;touchSupport:off;direction:rtl',
      ),
    ).toBe(true);
    expect(isTouchSupportOff('?id=x&globals=touchSupport:on')).toBe(false);
  });
});
