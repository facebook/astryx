// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it} from 'vitest';
import {neutralTheme} from './neutralTheme';

const statusFill = {
  accent: 'var(--astryx-theme-neutral-color-status-fill-accent)',
  success: 'var(--astryx-theme-neutral-color-status-fill-success)',
  warning: 'var(--astryx-theme-neutral-color-status-fill-warning)',
  error: 'var(--astryx-theme-neutral-color-status-fill-error)',
} as const;

describe('neutral theme-local status mappings', () => {
  it('owns reusable status fills through exact Neutral-local token names', () => {
    expect(neutralTheme.localTokens).toMatchObject({
      '--astryx-theme-neutral-color-status-fill-accent':
        'light-dark(#0074e2, #6d9cfe)',
      '--astryx-theme-neutral-color-status-fill-success':
        'light-dark(#198100, #64af4c)',
      '--astryx-theme-neutral-color-status-fill-warning': '#ffce2f',
      '--astryx-theme-neutral-color-status-fill-error':
        'light-dark(#c9303a, #ff705d)',
    });
    expect(neutralTheme.tokens).not.toHaveProperty(
      '--astryx-theme-neutral-color-status-fill-accent',
    );
  });

  it('shares each status fill across the components with the same role', () => {
    expect(neutralTheme.components?.badge?.['variant:info']).toMatchObject({
      backgroundColor: statusFill.accent,
    });
    expect(neutralTheme.components?.statusdot?.['variant:success']).toEqual({
      backgroundColor: statusFill.success,
    });
    expect(
      neutralTheme.components?.['avatar-status-dot']?.['variant:error'],
    ).toEqual({backgroundColor: statusFill.error});
    expect(
      neutralTheme.components?.['step-indicator']?.['status:warning'],
    ).toEqual({'--color-warning': statusFill.warning});
    expect(neutralTheme.components?.progressbar?.['variant:accent']).toEqual({
      '--color-accent': statusFill.accent,
    });
  });

  it('does not adopt the unapproved table row-status target', () => {
    expect(neutralTheme.components).not.toHaveProperty('table-row-status');
  });
});
