// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file effective.test.ts
 * @input The component-override resolution in effective.ts
 * @output Edge-case coverage for effective pair construction (override precedence, rebind extraction)
 * @position Guards the harness that gates CI for every theme (issue #3654)
 */

import {describe, expect, it} from 'vitest';

import type {DefinedTheme} from '@astryxdesign/core/theme';

import type {ContrastPair} from './contract';
import {effectivePairs} from './effective';

function fakeTheme(components: Record<string, unknown>): DefinedTheme {
  return {name: 'fake', tokens: {}, components} as unknown as DefinedTheme;
}

function find(pairs: ContrastPair[], context: string): ContrastPair {
  const pair = pairs.find(p => p.context === context);
  expect(pair, context).toBeDefined();
  return pair!;
}

describe('effectivePairs', () => {
  it('falls back to core component defaults for a null theme', () => {
    const pairs = effectivePairs(null);
    const badgeError = find(pairs, 'Badge variant="error" label (effective)');
    expect(badgeError.fg).toBe('--color-on-error');
    expect(badgeError.bg).toEqual([
      '--color-background-surface',
      '--color-error',
    ]);
    expect(badgeError.rebind).toBeUndefined();

    const bannerInfoIcon = find(pairs, 'Banner status="info" icon (effective)');
    expect(bannerInfoIcon.fg).toBe('--color-accent');
    expect(bannerInfoIcon.bg).toEqual([
      '--color-background-surface',
      '--color-accent-muted',
    ]);
    expect(bannerInfoIcon.min).toBe(3);
  });

  it('prefers a theme override backgroundColor/color over the defaults', () => {
    const pairs = effectivePairs(
      fakeTheme({
        badge: {
          'variant:error': {
            backgroundColor: 'light-dark(#e33f4a, #ff705d)',
            color: 'light-dark(#ffffff, #171717)',
          },
        },
      }),
    );
    const badgeError = find(pairs, 'Badge variant="error" label (effective)');
    expect(badgeError.fg).toBe('light-dark(#ffffff, #171717)');
    expect(badgeError.bg).toEqual([
      '--color-background-surface',
      'light-dark(#e33f4a, #ff705d)',
    ]);
  });

  it('extracts only --token re-bindings, ignoring nested pseudo objects', () => {
    const pairs = effectivePairs(
      fakeTheme({
        banner: {
          'status:success': {
            backgroundColor: 'var(--color-background-green)',
            '--color-text-primary': 'var(--color-text-green)',
            '--color-success': 'var(--color-text-green)',
            ':hover': {backgroundColor: '#000000'},
          },
        },
      }),
    );
    const title = find(pairs, 'Banner status="success" title (effective)');
    expect(title.bg).toEqual([
      '--color-background-surface',
      'var(--color-background-green)',
    ]);
    expect(title.rebind).toEqual({
      '--color-text-primary': 'var(--color-text-green)',
      '--color-success': 'var(--color-text-green)',
    });
    expect(Object.keys(title.rebind!)).not.toContain(':hover');
  });

  it('honors field-status overrides (stone/butter restyle these)', () => {
    const pairs = effectivePairs(
      fakeTheme({
        'field-status': {
          'type:error': {
            backgroundColor: '#fc473b',
            color: '#1d1c11',
          },
        },
      }),
    );
    const error = find(pairs, 'FieldStatus type="error" message (effective)');
    expect(error.fg).toBe('#1d1c11');
    expect(error.bg).toEqual(['--color-background-surface', '#fc473b']);

    const warning = find(
      pairs,
      'FieldStatus type="warning" message (effective)',
    );
    expect(warning.fg).toBe('--color-text-yellow');
  });

  it('applies link base color overrides to every link surface', () => {
    const pairs = effectivePairs(
      fakeTheme({link: {base: {color: 'light-dark(#225BFF, #FDEE8C)'}}}),
    );
    const linkPairs = pairs.filter(
      p => p.context === 'Link / Text color="accent" (effective)',
    );
    expect(linkPairs).toHaveLength(5);
    for (const pair of linkPairs) {
      expect(pair.fg).toBe('light-dark(#225BFF, #FDEE8C)');
    }
  });

  it('ignores non-string style values without crashing', () => {
    const pairs = effectivePairs(
      fakeTheme({
        badge: {'variant:info': {backgroundColor: 42, color: null}},
      }),
    );
    const info = find(pairs, 'Badge variant="info" label (effective)');
    expect(info.fg).toBe('--color-on-accent');
    expect(info.bg).toEqual(['--color-background-surface', '--color-accent']);
  });
});
