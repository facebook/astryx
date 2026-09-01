// Copyright (c) Meta Platforms, Inc. and affiliates.

import {butterPalettes} from '@astryxdesign/theme-butter';
import {gothicPalettes} from '@astryxdesign/theme-gothic';
import {stonePalettes} from '@astryxdesign/theme-stone';
import {y2kPalettes} from '@astryxdesign/theme-y2k';

import {hexToHct, hctToHex} from '../color-studio/colorUtils';
import {FULL_21_STOPS, type PaletteMode} from './generator';
import {PR_5628_NEUTRAL_PALETTES} from './pr5628NeutralPalettes';

export interface ThemeReferenceFamily {
  id: string;
  name: string;
  seed: string;
  kind?: 'chromatic' | 'neutral';
  light?: Record<number, string>;
  dark?: Record<number, string>;
  /** The same stored ramp is used in both preview columns. */
  sharedAcrossModes?: boolean;
}

export interface ThemeReference {
  id: string;
  name: string;
  description: string;
  referenceKind: 'stored' | 'legacy-generated';
  /** Best-fit starting points measured against stops 5–95. */
  suggestedVibrancy: {oklch: number; hct: number; compare: number};
  modes: PaletteMode[];
  families: ThemeReferenceFamily[];
}

type RawPalette = Readonly<Record<string | number, string | number>>;

function tones(palette: RawPalette): Record<number, string> {
  return Object.fromEntries(
    FULL_21_STOPS.map(stop => {
      const value = palette[stop];
      if (typeof value !== 'string') {
        throw new Error(`Theme palette is missing stop ${stop}.`);
      }
      return [stop, value.toLowerCase()];
    }),
  );
}

function legacyRamp(seed: string, mode: PaletteMode): Record<number, string> {
  const source = hexToHct(seed);
  const chroma = mode === 'dark' ? source.chroma * 0.85 : source.chroma;
  const maximumChroma = chroma * 1.8;
  return Object.fromEntries(
    FULL_21_STOPS.map(stop => {
      let tone: number = stop;
      if (mode === 'dark') {
        const lift = stop >= 95 ? 0 : stop <= 80 ? 5 : 5 * ((95 - stop) / 15);
        tone = Math.min(100, stop + lift);
      }
      const boost = tone < 50 ? 1 + (50 - tone) / 40 : 1;
      return [
        stop,
        hctToHex({
          hue: source.hue,
          chroma: Math.min(chroma * boost, maximumChroma),
          tone,
        }),
      ];
    }),
  );
}

function generatedFamily(
  id: string,
  name: string,
  seed: string,
  kind: 'chromatic' | 'neutral' = 'chromatic',
): ThemeReferenceFamily {
  return {
    id,
    name,
    seed,
    kind,
    light: legacyRamp(seed, 'light'),
    dark: legacyRamp(seed, 'dark'),
  };
}

function storedFamily(
  id: string,
  name: string,
  seed: string,
  palette: RawPalette,
  kind: 'chromatic' | 'neutral' = 'chromatic',
  darkPalette?: RawPalette,
): ThemeReferenceFamily {
  const ramp = tones(palette);
  return {
    id,
    name,
    seed,
    kind,
    light: ramp,
    dark: darkPalette ? tones(darkPalette) : ramp,
    sharedAcrossModes: darkPalette == null,
  };
}

function pr5628Family(
  id: keyof typeof PR_5628_NEUTRAL_PALETTES,
  name: string,
  kind: 'chromatic' | 'neutral' = 'chromatic',
): ThemeReferenceFamily {
  const palette = PR_5628_NEUTRAL_PALETTES[id];
  return {
    id,
    name,
    seed: palette.light[50],
    kind,
    light: tones(palette.light),
    dark: tones(palette.dark),
  };
}

const pr5628Families = [
  pr5628Family('neutral', 'Neutral', 'neutral'),
  pr5628Family('red', 'Red'),
  pr5628Family('orange', 'Orange'),
  pr5628Family('yellow', 'Yellow'),
  pr5628Family('green', 'Green'),
  pr5628Family('teal', 'Teal'),
  pr5628Family('cyan', 'Cyan'),
  pr5628Family('blue', 'Blue'),
  pr5628Family('purple', 'Purple'),
  pr5628Family('pink', 'Pink'),
];

const neutralFamilies = [
  generatedFamily('neutral', 'Neutral', '#e5e5e5', 'neutral'),
  generatedFamily('red', 'Red', '#eb183a'),
  generatedFamily('orange', 'Orange', '#d57113'),
  generatedFamily('yellow', 'Yellow', '#f8c723'),
  generatedFamily('green', 'Green', '#358a3a'),
  generatedFamily('teal', 'Teal', '#0c7365'),
  generatedFamily('cyan', 'Cyan', '#0c6f82'),
  generatedFamily('blue', 'Blue', '#1679fa'),
  generatedFamily('purple', 'Purple', '#980fb2'),
  generatedFamily('pink', 'Pink', '#b10e69'),
];

const stoneFamilies = [
  storedFamily(
    'neutral',
    'Stone Neutral',
    '#e2e2e2',
    stonePalettes.neutral,
    'neutral',
  ),
  storedFamily('blue', 'Blue', '#d7e4f5', stonePalettes.blue),
  storedFamily('cyan', 'Cyan', '#cce8e5', stonePalettes.cyan),
  storedFamily('green', 'Green', '#d0e9ce', stonePalettes.green),
  storedFamily('teal', 'Teal', '#d4e7dc', stonePalettes.teal),
  storedFamily('yellow', 'Yellow', '#f4e1b7', stonePalettes.yellow),
  storedFamily('orange', 'Orange', '#ffdcbb', stonePalettes.orange),
  storedFamily('red', 'Red', '#f9dcd7', stonePalettes.red),
  storedFamily('pink', 'Pink', '#f0dde8', stonePalettes.pink),
  storedFamily('purple', 'Purple', '#e8dff3', stonePalettes.purple),
];

const gothicFamilies = [
  storedFamily(
    'neutral',
    'Gothic Neutral',
    '#96a0ab',
    gothicPalettes.neutral,
    'neutral',
  ),
  storedFamily('green', 'Green', '#b3c79a', gothicPalettes.green),
  storedFamily('red', 'Red', '#c6a6a2', gothicPalettes.red),
  storedFamily('yellow', 'Yellow', '#d3c490', gothicPalettes.yellow),
  storedFamily('blue', 'Blue', '#a3b5d6', gothicPalettes.blue),
  storedFamily('purple', 'Purple', '#b29bc4', gothicPalettes.purple),
  storedFamily('pink', 'Pink', '#c89aab', gothicPalettes.pink),
  storedFamily('cyan', 'Cyan', '#a3c2cf', gothicPalettes.cyan),
  storedFamily('orange', 'Orange', '#d3b89a', gothicPalettes.orange),
  storedFamily('teal', 'Teal', '#a3c2b6', gothicPalettes.teal),
].map(family => ({...family, light: undefined, sharedAcrossModes: false}));

const y2kFamilies = [
  storedFamily(
    'neutral',
    'Y2K Neutral',
    '#c3b7ab',
    y2kPalettes.neutral,
    'neutral',
  ),
  storedFamily('green', 'Green', '#c5e17a', y2kPalettes.green),
  storedFamily('red', 'Red', '#ff9e9a', y2kPalettes.red),
  storedFamily('yellow', 'Yellow', '#ffcc55', y2kPalettes.yellow),
  storedFamily('blue', 'Blue', '#8ecfff', y2kPalettes.blue),
  storedFamily('pink', 'Pink', '#ffa0c8', y2kPalettes.pink),
  storedFamily('purple', 'Purple', '#c0aaff', y2kPalettes.purple),
  storedFamily('cyan', 'Cyan', '#70e8d0', y2kPalettes.cyan),
  storedFamily('orange', 'Orange', '#ffaa66', y2kPalettes.orange),
  storedFamily('teal', 'Teal', '#78e0b0', y2kPalettes.teal),
];

const butterDarkYellow = {
  0: '#000000',
  5: '#161100',
  10: '#211b00',
  15: '#2c2600',
  20: '#383100',
  25: '#443c00',
  30: '#504700',
  35: '#5d5300',
  40: '#6a5f00',
  45: '#786b00',
  50: '#867800',
  55: '#948500',
  60: '#a29200',
  65: '#b19f00',
  70: '#bfac1a',
  75: '#ceba2c',
  80: '#ddc73c',
  85: '#ecd54a',
  90: '#fbe358',
  95: '#fff1bd',
  100: '#ffffff',
} as const;

const butterFamilies = [
  storedFamily(
    'accent',
    'Accent',
    '#225bff',
    butterPalettes.accent,
    'chromatic',
    butterPalettes.yellow,
  ),
  storedFamily('neutral', 'Gray', '#868b99', butterPalettes.neutral, 'neutral'),
  storedFamily('red', 'Red', '#ff7553', butterPalettes.red),
  storedFamily('orange', 'Orange', '#ffa347', butterPalettes.orange),
  storedFamily(
    'yellow',
    'Yellow',
    '#edd64b',
    butterPalettes.yellow,
    'chromatic',
    butterDarkYellow,
  ),
  storedFamily('green', 'Green', '#5dce5f', butterPalettes.green),
  storedFamily('cyan', 'Cyan', '#60cfd3', butterPalettes.cyan),
  storedFamily('teal', 'Teal', '#6cd9a8', butterPalettes.teal),
  storedFamily('blue', 'Blue', '#5681ff', butterPalettes.blue),
  storedFamily('purple', 'Purple', '#b780f6', butterPalettes.purple),
  storedFamily('pink', 'Pink', '#f680e8', butterPalettes.pink),
  storedFamily('error', 'Error', '#ff5947', butterPalettes.error),
  storedFamily('warning', 'Warning', '#f8c726', butterPalettes.warning),
  storedFamily('success', 'Success', '#91d143', butterPalettes.success),
];

export const THEME_REFERENCES: ThemeReference[] = [
  {
    id: 'neutral-pr-5628',
    name: 'Neutral — PR #5628',
    description:
      'Exact approved higher-chroma light and dark ramps merged in PR #5628.',
    referenceKind: 'stored',
    suggestedVibrancy: {oklch: 66, hct: 49, compare: 61},
    modes: ['light', 'dark'],
    families: pr5628Families,
  },
  {
    id: 'neutral-legacy',
    name: 'Neutral — legacy preview',
    description:
      'Existing HCT-generated reference ramps used by the Neutral preview.',
    referenceKind: 'legacy-generated',
    suggestedVibrancy: {oklch: 71, hct: 71, compare: 71},
    modes: ['light', 'dark'],
    families: neutralFamilies,
  },
  {
    id: 'stone',
    name: 'Stone',
    description: 'Stored hand-tuned warm stone ramps.',
    referenceKind: 'stored',
    suggestedVibrancy: {oklch: 12, hct: 9, compare: 10},
    modes: ['light', 'dark'],
    families: stoneFamilies,
  },
  {
    id: 'gothic',
    name: 'Gothic',
    description: 'Stored dark-only muted gem-tone ramps.',
    referenceKind: 'stored',
    suggestedVibrancy: {oklch: 36, hct: 23, compare: 30},
    modes: ['dark'],
    families: gothicFamilies,
  },
  {
    id: 'y2k',
    name: 'Y2K',
    description: 'Stored high-chroma pastel pop ramps.',
    referenceKind: 'stored',
    suggestedVibrancy: {oklch: 45, hct: 34, compare: 39},
    modes: ['light', 'dark'],
    families: y2kFamilies,
  },
  {
    id: 'butter',
    name: 'Butter',
    description: 'Stored branded pastel ramps.',
    referenceKind: 'stored',
    suggestedVibrancy: {oklch: 24, hct: 22, compare: 23},
    modes: ['light', 'dark'],
    families: butterFamilies,
  },
];
