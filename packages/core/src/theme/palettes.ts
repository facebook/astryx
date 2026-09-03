// Copyright (c) Meta Platforms, Inc. and affiliates.

import {parseColor} from '../utils/color';
import {relativeLuminance} from './contrast';

/** Canonical numeric stop labels used as Astryx palette keys. */
export const TONAL_PALETTE_STOPS = [
  0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95,
  100,
] as const;

export type TonalPaletteStop = (typeof TONAL_PALETTE_STOPS)[number];

/**
 * One complete, opaque ramp ordered from dark to light. Numbered keys identify
 * approved stops rather than exact measured HCT coordinates.
 */
export type TonalPaletteRamp = Readonly<
  Record<TonalPaletteStop, string> & {
    /** Hue angle from 0 (inclusive) to 360 (exclusive). */
    hue?: number;
    /** Non-negative chroma value. */
    chroma?: number;
  }
>;

interface ThemePaletteFamilyMetadata {
  /** Optional semantic role, such as "success", "warning", or "error". */
  readonly semantic?: string;
  /** Short author-facing explanation of the palette's intended use. */
  readonly description?: string;
}

/** A named palette family with at least one explicitly declared mode. */
export type ThemePaletteFamily = Readonly<
  ThemePaletteFamilyMetadata &
    (
      | {readonly light: TonalPaletteRamp; readonly dark?: TonalPaletteRamp}
      | {readonly light?: TonalPaletteRamp; readonly dark: TonalPaletteRamp}
    )
>;

/** Approved, named color families. */
export type ThemePalettes = Readonly<Record<string, ThemePaletteFamily>>;

const OPAQUE_HEX = /^#[0-9a-f]{6}$/i;
const TONAL_PALETTE_KEYS = new Set<string>([
  ...TONAL_PALETTE_STOPS.map(String),
  'hue',
  'chroma',
]);
const PALETTE_FAMILY_KEYS = new Set([
  'light',
  'dark',
  'semantic',
  'description',
]);

function validateRamp(
  name: string,
  mode: 'light' | 'dark',
  ramp: TonalPaletteRamp,
) {
  if (!ramp || typeof ramp !== 'object' || Array.isArray(ramp)) {
    throw new Error(`Palette "${name}" ${mode} must be a tonal ramp.`);
  }

  for (const key of Object.keys(ramp)) {
    if (!TONAL_PALETTE_KEYS.has(key)) {
      throw new Error(
        `Palette "${name}" ${mode} contains unknown stop or metadata key "${key}".`,
      );
    }
  }

  let previousLuminance = -1;
  for (const stop of TONAL_PALETTE_STOPS) {
    const value = ramp[stop];
    if (typeof value !== 'string' || !OPAQUE_HEX.test(value)) {
      throw new Error(
        `Palette "${name}" ${mode} stop ${stop} must be an opaque six-digit hex color.`,
      );
    }
    const parsed = parseColor(value);
    if (parsed === null) {
      throw new Error(
        `Palette "${name}" ${mode} stop ${stop} must be an opaque six-digit hex color.`,
      );
    }
    const luminance = relativeLuminance(parsed);
    if (luminance < previousLuminance) {
      throw new Error(
        `Palette "${name}" ${mode} stops must be ordered from darker to lighter; stop ${stop} is darker than the previous stop.`,
      );
    }
    previousLuminance = luminance;
  }

  if (
    ramp.hue !== undefined &&
    (!Number.isFinite(ramp.hue) || ramp.hue < 0 || ramp.hue >= 360)
  ) {
    throw new Error(
      `Palette "${name}" ${mode} hue must be a finite number from 0 up to but not including 360, got ${String(ramp.hue)}.`,
    );
  }
  if (
    ramp.chroma !== undefined &&
    (!Number.isFinite(ramp.chroma) || ramp.chroma < 0)
  ) {
    throw new Error(
      `Palette "${name}" ${mode} chroma must be a finite non-negative number, got ${String(ramp.chroma)}.`,
    );
  }
}

/** Validate approved palette metadata without generating CSS tokens. */
export function defineTonalPalettes<const T extends ThemePalettes>(
  palettes: T,
): T {
  if (!palettes || typeof palettes !== 'object' || Array.isArray(palettes)) {
    throw new Error('Theme palettes must be a named palette map.');
  }
  if (Object.keys(palettes).length === 0) {
    throw new Error(
      'Theme palettes must contain at least one named palette family.',
    );
  }

  for (const [name, family] of Object.entries(palettes)) {
    if (!family || typeof family !== 'object' || Array.isArray(family)) {
      throw new Error(`Palette "${name}" must be a palette family.`);
    }
    for (const key of Object.keys(family)) {
      if (!PALETTE_FAMILY_KEYS.has(key)) {
        throw new Error(
          `Palette "${name}" contains unknown family key "${key}".`,
        );
      }
    }
    if (family.light === undefined && family.dark === undefined) {
      throw new Error(
        `Palette "${name}" must define at least one light or dark tonal ramp.`,
      );
    }
    if (family.light === null) {
      throw new Error(
        `Palette "${name}" light must be a tonal ramp when provided.`,
      );
    }
    if (family.light !== undefined) {
      validateRamp(name, 'light', family.light);
    }
    if (family.dark === null) {
      throw new Error(
        `Palette "${name}" dark must be a tonal ramp when provided.`,
      );
    }
    if (family.dark !== undefined) {
      validateRamp(name, 'dark', family.dark);
    }
    if (family.semantic !== undefined && typeof family.semantic !== 'string') {
      throw new Error(
        `Palette "${name}" semantic must be a string, got ${String(family.semantic)}.`,
      );
    }
    if (
      family.description !== undefined &&
      typeof family.description !== 'string'
    ) {
      throw new Error(
        `Palette "${name}" description must be a string, got ${String(family.description)}.`,
      );
    }
  }
  return palettes;
}

/** Return a palette family's explicitly declared ramp for a color mode. */
export function getTonalPaletteRamp(
  family: ThemePaletteFamily,
  mode: 'light' | 'dark',
): TonalPaletteRamp | undefined {
  return family[mode];
}
