// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it} from 'vitest';
import {templateReplacementsActive} from './template-replacement-release.mjs';

describe('templateReplacementsActive', () => {
  it.each(['0.6.3', '0.6.4', '0.6.99'])(
    'keeps %s on legacy selection',
    version => {
      expect(templateReplacementsActive(version)).toBe(false);
    },
  );

  it.each(['0.7.0-rc.1', '0.7.0', '0.8.0'])('activates %s', version => {
    expect(templateReplacementsActive(version)).toBe(true);
  });
});
