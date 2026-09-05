// Copyright (c) Meta Platforms, Inc. and affiliates.

import {createHash} from 'node:crypto';
import {describe, expect, it} from 'vitest';
import {
  generatePaletteSet as generatePrototypePaletteSet,
  FULL_21_STOPS as PROTOTYPE_DEFAULT_21_STOPS,
} from '../../../../../../apps/sandbox/src/app/(sandbox)/pages/palette-generator/generator.ts';
import {
  COMPACT_11_STOPS,
  DEFAULT_21_STOPS,
  PALETTE_RECIPE,
  generatePaletteSet,
  generateTonalPalette,
  perceptualDelta,
  validateStops,
} from './generator.mjs';
import {hexToOklch} from './color.mjs';

const families = [
  {id: 'neutral', name: 'Neutral', seed: '#777777', kind: 'neutral'},
  {id: 'blue', name: 'Blue', seed: '#0074e2'},
  {id: 'orange', name: 'Orange', seed: '#d57113'},
];

function candidateDigest(request) {
  const candidate = generateTonalPalette(request);
  return createHash('sha256')
    .update(`${JSON.stringify(candidate, null, 2)}\n`)
    .digest('hex');
}

describe('astryx-oklch-v1 palette generator', () => {
  it('matches the pinned Sandbox OKLCH result for the default recipe', () => {
    const production = generatePaletteSet({families});
    const prototype = generatePrototypePaletteSet({
      algorithm: 'oklch-v1-experimental',
      vibrancy: 50,
      neutralProfile: 'neutral-v1',
      modeStrategy: 'light-and-dark',
      stops: [...PROTOTYPE_DEFAULT_21_STOPS],
      families,
    });

    expect(production.recipe).toBe(PALETTE_RECIPE);
    expect(production.status).toBe('candidate');
    expect(production.families).toEqual(prototype.families);
    expect(production.coordination).toEqual(prototype.coordination);
    expect(production.errors).toEqual([]);
  });

  it('returns directly usable candidate data without filesystem work', () => {
    const candidate = generateTonalPalette({
      families: [families[1]],
      stops: [40],
    });

    expect(candidate).toMatchObject({
      schemaVersion: 1,
      status: 'candidate',
      recipe: 'astryx-oklch-v1',
    });
    expect(candidate.palette.blue.light[40]).toMatch(/^#[0-9a-f]{6}$/);
    expect(candidate.palette.blue.dark[40]).toMatch(/^#[0-9a-f]{6}$/);
    expect(candidate.black).toBe('#000000');
    expect(candidate.white).toBe('#ffffff');
  });

  it('locks the normative recipe fixtures independently from the Sandbox', () => {
    expect(candidateDigest({families})).toBe(
      '44ba910320e57a8a56dd87d6a6540d4d21af97d465c6356c366328bee9949ef2',
    );
    expect(
      candidateDigest({
        modeStrategy: 'light-only',
        stops: [20, 50, 80],
        families: [
          {
            id: 'blue',
            name: 'Blue',
            seed: '#0074e2',
            anchors: [
              {
                mode: 'light',
                stop: 50,
                color: '#1682d5',
                policy: 'exact',
              },
            ],
          },
        ],
      }),
    ).toBe('e91fe5f5b2350408a0f68bb76e5272011586b4a6d891625dfefeccfb3eebd071');
    expect(
      candidateDigest({
        modeStrategy: 'dark-only',
        stops: [40],
        families: [{id: 'red', name: 'Red', seed: '#d62830'}],
      }),
    ).toBe('61b51f9d23d389d7a2e4d5b3a4558a5ac301f98c48de729abd92c08537a099f3');
    expect(
      candidateDigest({
        stops: [60, 80, 95],
        families: [
          {id: 'green', name: 'Green', seed: '#358a3a'},
          {id: 'teal', name: 'Teal', seed: '#0c7365'},
          {id: 'cyan', name: 'Cyan', seed: '#0c6f82'},
        ],
      }),
    ).toBe('26a91ffab53c63a9dc1969568ce0d1b52ba3eefda228e05d61a9e4bd8530a57e');
  });

  it('defaults to 21 stops while allowing authors to omit endpoints', () => {
    expect(generatePaletteSet({families: [families[1]]}).request.stops).toEqual(
      DEFAULT_21_STOPS,
    );
    expect(DEFAULT_21_STOPS).toHaveLength(21);
    expect(DEFAULT_21_STOPS[0]).toBe(0);
    expect(DEFAULT_21_STOPS.at(-1)).toBe(100);
    expect(
      generatePaletteSet({families: [families[1]], stops: [15, 40, 72]}).request
        .stops,
    ).toEqual([15, 40, 72]);
    expect(
      generatePaletteSet({families: [families[1]], stops: [40]}).families[0]
        .light.colors,
    ).toEqual({40: expect.stringMatching(/^#[0-9a-f]{6}$/)});
  });

  it('keeps shared stop values stable across full, compact, and custom layouts', () => {
    const family = {id: 'blue', name: 'Blue', seed: '#0074e2'};
    const full = generateTonalPalette({
      stops: [...DEFAULT_21_STOPS],
      families: [family],
    });
    const compact = generateTonalPalette({
      stops: [...COMPACT_11_STOPS],
      families: [family],
    });
    const custom = generateTonalPalette({
      stops: [12.5, 50, 80],
      families: [family],
    });

    for (const mode of ['light', 'dark']) {
      for (const stop of COMPACT_11_STOPS) {
        expect(compact.palette.blue[mode][stop]).toBe(
          full.palette.blue[mode][stop],
        );
      }
      expect(custom.palette.blue[mode][50]).toBe(full.palette.blue[mode][50]);
      expect(custom.palette.blue[mode][80]).toBe(full.palette.blue[mode][80]);
      expect(custom.palette.blue[mode][12.5]).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  it('keeps default endpoints black and white and rejects tinted endpoint anchors', () => {
    const candidate = generateTonalPalette({families: [families[1]]});
    for (const mode of ['light', 'dark']) {
      expect(candidate.palette.blue[mode][0]).toBe('#000000');
      expect(candidate.palette.blue[mode][100]).toBe('#ffffff');
    }
    expect(() =>
      generateTonalPalette({
        families: [
          {
            ...families[1],
            anchors: [
              {
                mode: 'light',
                stop: 0,
                color: '#001122',
                policy: 'exact',
              },
            ],
          },
        ],
      }),
    ).toThrow('reserved for exact black');
  });

  it('rejects invalid stop layouts without prescribing a count', () => {
    expect(() => validateStops([])).toThrow('at least one stop');
    expect(() => validateStops([0, 40, 40, 100])).toThrow(
      'unique and strictly increasing',
    );
    expect(() => validateStops([-1, 50])).toThrow('from 0 to 100');
    expect(() => validateStops([0, Number.NaN, 100])).toThrow('finite number');
    expect(validateStops([0.5, 37.25, 99.75])).toEqual([0.5, 37.25, 99.75]);
  });

  it('uses literal stop tones in dark mode', () => {
    const candidate = generateTonalPalette({
      modeStrategy: 'light-and-dark',
      stops: [0, 5, 100],
      families: [families[1]],
    });

    expect(candidate.palette.blue.light[0]).toBe('#000000');
    expect(candidate.palette.blue.dark[0]).toBe('#000000');
    expect(candidate.palette.blue.dark[5]).toBe('#000f30');
    expect(candidate.palette.blue.light[100]).toBe('#ffffff');
    expect(candidate.palette.blue.dark[100]).toBe('#ffffff');
  });

  it('preserves exact anchors and reports family-local failures', () => {
    const result = generatePaletteSet({
      modeStrategy: 'light-only',
      stops: [20, 50, 80],
      families: [
        {
          id: 'blue',
          name: 'Blue',
          seed: '#0074e2',
          anchors: [
            {
              mode: 'light',
              stop: 50,
              color: '#1682d5',
              policy: 'exact',
            },
          ],
        },
        {
          id: 'broken',
          name: 'Broken',
          seed: '#ff0000',
          anchors: [
            {
              mode: 'light',
              stop: 30,
              color: '#ff0000',
              policy: 'exact',
            },
          ],
        },
      ],
    });

    expect(result.families[0].light.colors[50]).toBe('#1682d5');
    expect(result.errors).toEqual([
      {
        familyId: 'broken',
        message: 'Anchor stop 30 is not present in the requested stop layout.',
      },
    ]);
  });

  it('distinguishes exact, bounded, and flexible authoring policies', () => {
    const target = '#1682d5';
    const generate = (policy, maxDeltaE) =>
      generateTonalPalette({
        modeStrategy: 'light-only',
        stops: [50],
        families: [
          {
            id: 'blue',
            name: 'Blue',
            seed: '#0074e2',
            anchors: [
              {
                mode: 'light',
                stop: 50,
                color: target,
                policy,
                ...(maxDeltaE == null ? {} : {maxDeltaE}),
              },
            ],
          },
        ],
      }).palette.blue.light[50];

    const exact = generate('exact');
    const bounded = generate('bounded', 2);
    const flexible = generate('flexible');

    expect(exact).toBe(target);
    expect(perceptualDelta(bounded, target)).toBeLessThanOrEqual(2.01);
    expect(flexible).not.toBe(target);
    expect(new Set([exact, bounded, flexible]).size).toBe(3);
  });

  it('generates an accent family only when the author declares one', () => {
    const withoutAccent = generateTonalPalette({
      stops: [50],
      families: [families[1]],
    });
    const withAccent = generateTonalPalette({
      stops: [50],
      families: [{id: 'accent', name: 'Accent', seed: '#ff4db8'}],
    });

    expect(withoutAccent.palette).not.toHaveProperty('accent');
    expect(withAccent.palette.accent.light[50]).toMatch(/^#[0-9a-f]{6}$/);
    expect(withAccent.palette.accent.dark[50]).toMatch(/^#[0-9a-f]{6}$/);
  });

  it('uses vibrancy to make the generated families more muted or vivid', () => {
    const generate = vibrancy =>
      generateTonalPalette({
        vibrancy,
        stops: [50],
        families: [families[1]],
      }).palette.blue.light[50];

    expect(hexToOklch(generate(25)).C).toBeLessThan(hexToOklch(generate(75)).C);
  });
});
