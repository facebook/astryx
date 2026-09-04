// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it} from 'vitest';
import {butterTheme} from '../packages/themes/butter/src/butterTheme.ts';
import {stoneTheme} from '../packages/themes/stone/src/stoneTheme.ts';

describe('Banner semantic info background overrides', () => {
  it('preserves Butter and Stone treatments through --color-info-muted', () => {
    const butterInfo = butterTheme.components?.banner?.['status:info'];
    const stoneInfo = stoneTheme.components?.banner?.['status:info'];

    expect(butterInfo).toMatchObject({'--color-info-muted': '#4883fd'});
    expect(stoneInfo).toMatchObject({
      '--color-info-muted': 'var(--color-background-blue)',
    });
    expect(butterInfo).not.toHaveProperty('--color-accent-muted');
    expect(stoneInfo).not.toHaveProperty('--color-accent-muted');
  });
});
