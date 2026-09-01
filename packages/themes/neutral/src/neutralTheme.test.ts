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

describe('neutral Banner tint mappings', () => {
  it('uses light overlays in light mode and dark overlays in dark mode', () => {
    expect(neutralTheme.localTokens).toMatchObject({
      '--astryx-theme-neutral-color-on-tint-neutral':
        'light-dark(#fafafa4D, #0a0a0a4D)',
      '--astryx-theme-neutral-color-on-tint-overlay-hover':
        'light-dark(#fafafa1A, #0a0a0a1A)',
      '--astryx-theme-neutral-color-on-tint-overlay-pressed':
        'light-dark(#fafafa33, #0a0a0a33)',
    });
    expect(neutralTheme.components?.banner?.base).toMatchObject({
      '--color-neutral': 'var(--astryx-theme-neutral-color-on-tint-neutral)',
      '--color-overlay-hover':
        'var(--astryx-theme-neutral-color-on-tint-overlay-hover)',
      '--color-overlay-pressed':
        'var(--astryx-theme-neutral-color-on-tint-overlay-pressed)',
    });
  });
});

describe('neutral theme component overrides', () => {
  it('keeps the roomier segmented-control inset height-neutral', () => {
    expect(neutralTheme.components?.['segmented-control']).toEqual({
      base: {padding: 'var(--spacing-1)'},
    });
    expect(neutralTheme.components?.['segmented-control-item']).toEqual({
      'size:sm': {height: 'calc(var(--size-element-sm) - 8px)'},
      'size:md': {height: 'calc(var(--size-element-md) - 8px)'},
      'size:lg': {height: 'calc(var(--size-element-lg) - 8px)'},
      selected: {boxShadow: 'none'},
    });
  });
});
