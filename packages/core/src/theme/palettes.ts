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

export interface TonalPaletteValidationIssue {
  readonly path: string;
  readonly message: string;
}

export interface TonalPaletteValidationResult {
  readonly valid: boolean;
  readonly errors: ReadonlyArray<TonalPaletteValidationIssue>;
  readonly warnings: ReadonlyArray<TonalPaletteValidationIssue>;
}

function validateRamp(
  name: string,
  mode: 'light' | 'dark',
  ramp: TonalPaletteRamp,
  errors: TonalPaletteValidationIssue[],
) {
  const path = `${name}.${mode}`;
  if (!ramp || typeof ramp !== 'object' || Array.isArray(ramp)) {
    errors.push({path, message: 'Must be a tonal ramp.'});
    return;
  }

  for (const key of Object.keys(ramp)) {
    if (!TONAL_PALETTE_KEYS.has(key)) {
      errors.push({
        path: `${path}.${key}`,
        message: `Unknown stop or metadata key "${key}".`,
      });
    }
  }

  let previousLuminance = -1;
  for (const stop of TONAL_PALETTE_STOPS) {
    const value = ramp[stop];
    if (typeof value !== 'string' || !OPAQUE_HEX.test(value)) {
      errors.push({
        path: `${path}.${stop}`,
        message: 'Must be an opaque six-digit hex color.',
      });
      continue;
    }
    const parsed = parseColor(value);
    if (parsed === null) {
      errors.push({
        path: `${path}.${stop}`,
        message: 'Must be an opaque six-digit hex color.',
      });
      continue;
    }
    const luminance = relativeLuminance(parsed);
    if (luminance < previousLuminance) {
      errors.push({
        path: `${path}.${stop}`,
        message: 'Must not be darker than the previous stop.',
      });
    }
    previousLuminance = luminance;
  }

  if (
    ramp.hue !== undefined &&
    (!Number.isFinite(ramp.hue) || ramp.hue < 0 || ramp.hue >= 360)
  ) {
    errors.push({
      path: `${path}.hue`,
      message: `Must be a finite number from 0 up to but not including 360; received ${String(ramp.hue)}.`,
    });
  }
  if (
    ramp.chroma !== undefined &&
    (!Number.isFinite(ramp.chroma) || ramp.chroma < 0)
  ) {
    errors.push({
      path: `${path}.chroma`,
      message: `Must be a finite non-negative number; received ${String(ramp.chroma)}.`,
    });
  }
}

/** Inspect palette metadata without changing it or generating theme values. */
export function validateTonalPalettes(
  palettes: unknown,
): TonalPaletteValidationResult {
  const errors: TonalPaletteValidationIssue[] = [];
  const warnings: TonalPaletteValidationIssue[] = [];
  if (!palettes || typeof palettes !== 'object' || Array.isArray(palettes)) {
    errors.push({path: 'palettes', message: 'Must be a named palette map.'});
    return {valid: false, errors, warnings};
  }
  if (Object.keys(palettes).length === 0) {
    errors.push({
      path: 'palettes',
      message: 'Must contain at least one named palette family.',
    });
  }

  for (const [name, family] of Object.entries(palettes)) {
    if (!family || typeof family !== 'object' || Array.isArray(family)) {
      errors.push({path: name, message: 'Must be a palette family.'});
      continue;
    }
    for (const key of Object.keys(family)) {
      if (!PALETTE_FAMILY_KEYS.has(key)) {
        errors.push({path: `${name}.${key}`, message: 'Unknown family key.'});
      }
    }
    if (family.light === undefined && family.dark === undefined) {
      errors.push({
        path: name,
        message: 'Must define at least one light or dark tonal ramp.',
      });
    }
    if (family.light === null) {
      errors.push({path: `${name}.light`, message: 'Must be a tonal ramp.'});
    } else if (family.light !== undefined) {
      validateRamp(name, 'light', family.light as TonalPaletteRamp, errors);
    }
    if (family.dark === null) {
      errors.push({path: `${name}.dark`, message: 'Must be a tonal ramp.'});
    } else if (family.dark !== undefined) {
      validateRamp(name, 'dark', family.dark as TonalPaletteRamp, errors);
    }
    if (family.semantic !== undefined && typeof family.semantic !== 'string') {
      errors.push({
        path: `${name}.semantic`,
        message: `Must be a string; received ${String(family.semantic)}.`,
      });
    }
    if (
      family.description !== undefined &&
      typeof family.description !== 'string'
    ) {
      errors.push({
        path: `${name}.description`,
        message: `Must be a string; received ${String(family.description)}.`,
      });
    }
  }
  return {valid: errors.length === 0, errors, warnings};
}
