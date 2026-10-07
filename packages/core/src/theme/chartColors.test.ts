// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it} from 'vitest';
import {
  categoricalChartColorTokens,
  normalizeChartCustomColor,
  projectChartColorOptions,
  resolveChartColorChoice,
  supportedChartColorTokens,
  validateChartColorChoice,
  type CanonicalOpaqueHex,
  type ChartColorChoice,
  type ChartColorTokenResolver,
} from './chartColors';

const LIGHT: Record<(typeof supportedChartColorTokens)[number], string> = {
  '--color-data-categorical-blue': '#005A4E',
  '--color-data-categorical-orange': '#EB6E00',
  '--color-data-categorical-purple': '#6B1EFD',
  '--color-data-categorical-green': '#0B991F',
  '--color-data-categorical-pink': '#F351C0',
  '--color-data-categorical-cyan': '#0171A4',
  '--color-data-categorical-red': '#F5394F',
  '--color-data-categorical-teal': '#08A3A3',
  '--color-data-categorical-brown': '#965E03',
  '--color-data-categorical-indigo': '#6F8AFF',
};

const DARK = {
  ...LIGHT,
  '--color-data-categorical-blue': '#72E1C1',
};

const lightResolver: ChartColorTokenResolver = token => LIGHT[token];
const darkResolver: ChartColorTokenResolver = token => DARK[token];

describe('chart color token inventories', () => {
  it('keeps the closed supported inventory explicit', () => {
    expect(supportedChartColorTokens).toEqual([
      '--color-data-categorical-blue',
      '--color-data-categorical-orange',
      '--color-data-categorical-purple',
      '--color-data-categorical-green',
      '--color-data-categorical-pink',
      '--color-data-categorical-cyan',
      '--color-data-categorical-red',
      '--color-data-categorical-teal',
      '--color-data-categorical-brown',
      '--color-data-categorical-indigo',
    ]);
  });

  it('keeps the default projection separate from the support inventory', () => {
    expect(categoricalChartColorTokens).not.toBe(supportedChartColorTokens);
    expect(categoricalChartColorTokens).toEqual(supportedChartColorTokens);
  });
});

describe('normalizeChartCustomColor', () => {
  it('normalizes product color-input values before persistence', () => {
    expect(normalizeChartCustomColor('#aabbcc')).toEqual({
      ok: true,
      value: '#AABBCC',
    });
  });

  it.each(['#abc', '#AABBCC80', 'rgb(1, 2, 3)', 'AABBCC'])(
    'rejects unsupported custom input %s',
    input => {
      const result = normalizeChartCustomColor(input);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.diagnostic.code).toBe('invalid-custom-color');
      }
    },
  );
});

describe('validateChartColorChoice', () => {
  it('accepts a supported stable token identity', () => {
    expect(
      validateChartColorChoice({
        kind: 'theme',
        token: '--color-data-categorical-blue',
      }),
    ).toEqual({
      ok: true,
      value: {kind: 'theme', token: '--color-data-categorical-blue'},
    });
  });

  it('accepts only already-canonical persisted custom colors', () => {
    expect(
      validateChartColorChoice({kind: 'custom', color: '#AABBCC'}),
    ).toEqual({
      ok: true,
      value: {kind: 'custom', color: '#AABBCC'},
    });
    expect(
      validateChartColorChoice({kind: 'custom', color: '#aabbcc'}).ok,
    ).toBe(false);
  });

  it.each([
    null,
    {kind: 'automatic'},
    {kind: 'theme', token: '--color-data-blue-5'},
    {kind: 'theme', token: '--missing'},
    {kind: 'theme', token: '--color-data-categorical-blue', color: '#AABBCC'},
    {kind: 'custom', color: '#AABBCC', token: '--color-data-categorical-blue'},
  ])('rejects unsupported or non-exact persisted input %j', input => {
    expect(validateChartColorChoice(input).ok).toBe(false);
  });

  it('round-trips canonical persisted intent through JSON', () => {
    const choice: ChartColorChoice = {
      kind: 'theme',
      token: '--color-data-categorical-purple',
    };
    expect(
      validateChartColorChoice(JSON.parse(JSON.stringify(choice))),
    ).toEqual({
      ok: true,
      value: choice,
    });
  });
});

describe('projectChartColorOptions', () => {
  it('projects the ten categorical choices by default', () => {
    const result = projectChartColorOptions(lightResolver);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toHaveLength(10);
      expect(result.value.map(option => option.id)).toEqual(
        categoricalChartColorTokens,
      );
      expect(result.value[0]).toEqual({
        id: '--color-data-categorical-blue',
        preview: '#005A4E',
      });
    }
  });

  it('updates previews while preserving stable IDs', () => {
    const light = projectChartColorOptions(lightResolver);
    const dark = projectChartColorOptions(darkResolver);
    expect(light.ok && dark.ok).toBe(true);
    if (light.ok && dark.ok) {
      expect(dark.value.map(option => option.id)).toEqual(
        light.value.map(option => option.id),
      );
      expect(dark.value[0].preview).toBe('#72E1C1');
    }
  });

  it('supports a product-curated subset without changing validation', () => {
    const result = projectChartColorOptions(darkResolver, [
      '--color-data-categorical-blue',
    ]);
    expect(result).toEqual({
      ok: true,
      value: [{id: '--color-data-categorical-blue', preview: '#72E1C1'}],
    });
    expect(
      validateChartColorChoice({
        kind: 'theme',
        token: '--color-data-categorical-orange',
      }).ok,
    ).toBe(true);
  });

  it('projects from a bounded structured-cloneable worker payload', () => {
    const workerTokens: Partial<Record<keyof typeof LIGHT, string>> = {
      '--color-data-categorical-blue': LIGHT['--color-data-categorical-blue'],
      '--color-data-categorical-orange':
        LIGHT['--color-data-categorical-orange'],
    };
    const payload = structuredClone({
      revision: 'theme-1',
      tokens: workerTokens,
    });
    const result = projectChartColorOptions(
      token => payload.tokens[token] ?? '',
      ['--color-data-categorical-blue', '--color-data-categorical-orange'],
    );
    expect(payload.revision).toBe('theme-1');
    expect(result).toEqual({
      ok: true,
      value: [
        {id: '--color-data-categorical-blue', preview: '#005A4E'},
        {id: '--color-data-categorical-orange', preview: '#EB6E00'},
      ],
    });
  });

  it('fails rather than mixing a CSS token with a concrete fallback', () => {
    const result = projectChartColorOptions(
      token =>
        token === '--color-data-categorical-blue'
          ? 'oklch(0.5 0.1 200)'
          : LIGHT[token],
      ['--color-data-categorical-blue'],
    );
    expect(result).toEqual({
      ok: false,
      diagnostic: {
        code: 'unsupported-resolved-color',
        message:
          'The active value for --color-data-categorical-blue is not an opaque concrete sRGB color.',
        token: '--color-data-categorical-blue',
      },
    });
  });
});

describe('resolveChartColorChoice', () => {
  it('preserves theme identity and returns every renderer format', () => {
    expect(
      resolveChartColorChoice(
        {kind: 'theme', token: '--color-data-categorical-blue'},
        lightResolver,
      ),
    ).toEqual({
      ok: true,
      value: {
        source: 'theme',
        token: '--color-data-categorical-blue',
        srgb: '#005A4E',
        rgba01: [0, 90 / 255, 78 / 255, 1],
      },
    });
  });

  it('returns exact renderer formats for canonical custom intent', () => {
    const color = '#AABBCC' as CanonicalOpaqueHex;
    expect(
      resolveChartColorChoice({kind: 'custom', color}, lightResolver),
    ).toEqual({
      ok: true,
      value: {
        source: 'custom',
        srgb: '#AABBCC',
        rgba01: [170 / 255, 187 / 255, 204 / 255, 1],
      },
    });
  });

  it('uses the same rounded channels for sRGB and GPU output', () => {
    const result = resolveChartColorChoice(
      {kind: 'theme', token: '--color-data-categorical-blue'},
      () => 'rgb(50%, 0%, 0%)',
    );
    expect(result).toEqual({
      ok: true,
      value: {
        source: 'theme',
        token: '--color-data-categorical-blue',
        srgb: '#800000',
        rgba01: [128 / 255, 0, 0, 1],
      },
    });
  });

  it('returns failure for an unsupported active theme value', () => {
    const result = resolveChartColorChoice(
      {kind: 'theme', token: '--color-data-categorical-blue'},
      () => 'rgba(1, 2, 3, 0.5)',
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.diagnostic.code).toBe('unsupported-resolved-color');
      expect(result.diagnostic.token).toBe('--color-data-categorical-blue');
    }
  });
});
