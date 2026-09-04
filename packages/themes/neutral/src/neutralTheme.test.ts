// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it} from 'vitest';
import {contrastRatio} from '../../../core/src/theme/contrast';
import {neutralPalettes} from './neutralPalettes';
import {neutralTheme} from './neutralTheme';

const statusFill = {
  accent: 'var(--astryx-theme-neutral-color-status-fill-accent)',
  success: 'var(--astryx-theme-neutral-color-status-fill-success)',
  warning: 'var(--astryx-theme-neutral-color-status-fill-warning)',
  error: 'var(--astryx-theme-neutral-color-status-fill-error)',
} as const;

const lightDark = (light: string, dark: string) =>
  `light-dark(${light}, ${dark})`;

describe('neutral theme palette mappings', () => {
  it('keeps semantic and categorical tokens aligned with reviewed stops', () => {
    const mappings = {
      '--color-background-surface': lightDark(
        neutralPalettes.neutral.light[100],
        neutralPalettes.neutral.dark[15],
      ),
      '--color-background-body': lightDark(
        neutralPalettes.neutral.light[95],
        neutralPalettes.neutral.dark[10],
      ),
      '--color-text-primary': lightDark(
        neutralPalettes.neutral.light[5],
        neutralPalettes.neutral.dark[100],
      ),
      '--color-icon-primary': lightDark(
        neutralPalettes.neutral.light[5],
        neutralPalettes.neutral.dark[100],
      ),
      '--color-success': lightDark(
        neutralPalettes.green.light[40],
        neutralPalettes.green.light[80],
      ),
      '--color-warning': lightDark(
        neutralPalettes.yellow.light[40],
        neutralPalettes.yellow.light[85],
      ),
      '--color-error': lightDark(
        neutralPalettes.red.light[35],
        neutralPalettes.red.dark[85],
      ),
      '--color-background-red': lightDark(
        neutralPalettes.red.light[85],
        `${neutralPalettes.red.dark[75]}3D`,
      ),
      '--color-border-red': lightDark(
        neutralPalettes.red.light[80],
        neutralPalettes.red.light[65],
      ),
      '--color-icon-red': lightDark(
        neutralPalettes.red.light[30],
        neutralPalettes.red.dark[75],
      ),
      '--color-text-red': lightDark(
        neutralPalettes.red.light[30],
        neutralPalettes.red.dark[85],
      ),
      '--color-background-orange': lightDark(
        neutralPalettes.orange.light[85],
        `${neutralPalettes.orange.light[75]}3D`,
      ),
      '--color-border-orange': lightDark(
        neutralPalettes.orange.light[85],
        neutralPalettes.orange.dark[65],
      ),
      '--color-icon-orange': lightDark(
        neutralPalettes.orange.light[30],
        neutralPalettes.orange.light[75],
      ),
      '--color-text-orange': lightDark(
        neutralPalettes.orange.light[30],
        neutralPalettes.orange.dark[85],
      ),
      '--color-background-yellow': lightDark(
        neutralPalettes.yellow.dark[90],
        `${neutralPalettes.yellow.light[75]}3D`,
      ),
      '--color-border-yellow': lightDark(
        neutralPalettes.yellow.dark[80],
        neutralPalettes.yellow.light[65],
      ),
      '--color-icon-yellow': lightDark(
        neutralPalettes.yellow.light[30],
        neutralPalettes.yellow.light[75],
      ),
      '--color-text-yellow': lightDark(
        neutralPalettes.yellow.light[30],
        neutralPalettes.yellow.light[85],
      ),
      '--color-background-green': lightDark(
        neutralPalettes.green.dark[85],
        `${neutralPalettes.green.light[75]}3D`,
      ),
      '--color-border-green': lightDark(
        neutralPalettes.green.dark[80],
        neutralPalettes.green.light[65],
      ),
      '--color-icon-green': lightDark(
        neutralPalettes.green.light[30],
        neutralPalettes.green.light[75],
      ),
      '--color-text-green': lightDark(
        neutralPalettes.green.light[30],
        neutralPalettes.green.light[80],
      ),
      '--color-background-teal': lightDark(
        neutralPalettes.teal.light[85],
        `${neutralPalettes.teal.dark[75]}3D`,
      ),
      '--color-border-teal': lightDark(
        neutralPalettes.teal.light[80],
        neutralPalettes.teal.dark[65],
      ),
      '--color-icon-teal': lightDark(
        neutralPalettes.teal.light[30],
        neutralPalettes.teal.dark[75],
      ),
      '--color-text-teal': lightDark(
        neutralPalettes.teal.light[30],
        neutralPalettes.teal.light[85],
      ),
      '--color-background-cyan': lightDark(
        neutralPalettes.cyan.dark[85],
        `${neutralPalettes.cyan.dark[75]}3D`,
      ),
      '--color-border-cyan': lightDark(
        neutralPalettes.cyan.dark[80],
        neutralPalettes.cyan.dark[65],
      ),
      '--color-icon-cyan': lightDark(
        neutralPalettes.cyan.light[30],
        neutralPalettes.cyan.dark[75],
      ),
      '--color-text-cyan': lightDark(
        neutralPalettes.cyan.light[30],
        neutralPalettes.cyan.dark[85],
      ),
      '--color-background-blue': lightDark(
        neutralPalettes.blue.light[85],
        `${neutralPalettes.blue.dark[75]}3D`,
      ),
      '--color-border-blue': lightDark(
        neutralPalettes.blue.light[80],
        neutralPalettes.blue.dark[65],
      ),
      '--color-icon-blue': lightDark(
        neutralPalettes.blue.light[30],
        neutralPalettes.blue.dark[75],
      ),
      '--color-text-blue': lightDark(
        neutralPalettes.blue.light[30],
        neutralPalettes.blue.dark[85],
      ),
      '--color-background-purple': lightDark(
        neutralPalettes.purple.light[90],
        `${neutralPalettes.purple.light[75]}3D`,
      ),
      '--color-border-purple': lightDark(
        neutralPalettes.purple.light[85],
        neutralPalettes.purple.light[70],
      ),
      '--color-icon-purple': lightDark(
        neutralPalettes.purple.light[30],
        neutralPalettes.purple.light[75],
      ),
      '--color-text-purple': lightDark(
        neutralPalettes.purple.light[30],
        neutralPalettes.purple.dark[85],
      ),
      '--color-background-pink': lightDark(
        neutralPalettes.pink.light[85],
        `${neutralPalettes.pink.dark[75]}3D`,
      ),
      '--color-border-pink': lightDark(
        neutralPalettes.pink.light[85],
        neutralPalettes.pink.light[70],
      ),
      '--color-icon-pink': lightDark(
        neutralPalettes.pink.light[30],
        neutralPalettes.pink.dark[75],
      ),
      '--color-text-pink': lightDark(
        neutralPalettes.pink.light[30],
        neutralPalettes.pink.dark[85],
      ),
    };

    expect(neutralTheme.tokens).toMatchObject(mappings);
  });
});

describe('neutral syntax contrast', () => {
  it('keeps light CodeBlock comments and operators at normal-text AA', () => {
    const background = neutralPalettes.neutral.light[100];
    for (const token of ['comment', 'operator'] as const) {
      expect(neutralTheme.tokens[`--color-syntax-${token}`]).toBe(
        lightDark(
          neutralPalettes.neutral.light[45],
          neutralPalettes.neutral.dark[65],
        ),
      );
      expect(
        contrastRatio(neutralPalettes.neutral.light[45], background),
      ).toBeGreaterThanOrEqual(4.5);
    }
  });
});

describe('neutral theme-local status mappings', () => {
  it('preserves the independently approved component status fills', () => {
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
