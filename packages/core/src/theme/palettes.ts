// Copyright (c) Meta Platforms, Inc. and affiliates.

/** Canonical tone stops used by Astryx tonal palettes. */
export const TONAL_PALETTE_STEPS = [
  0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95,
  100,
] as const;

export type TonalPaletteStep = (typeof TONAL_PALETTE_STEPS)[number];

/**
 * One complete, opaque tonal ramp. Optional hue/chroma metadata is available
 * to palette editors and audit tools but is not emitted as CSS.
 */
export type TonalPaletteRamp = Readonly<
  Record<TonalPaletteStep, string> & {
    hue?: number;
    chroma?: number;
  }
>;

/**
 * A named palette family. Dark can be omitted when both modes intentionally
 * use the same ramp.
 */
export interface ThemePaletteFamily {
  readonly light: TonalPaletteRamp;
  readonly dark?: TonalPaletteRamp;
  /** Optional semantic role, such as "success", "warning", or "error". */
  readonly semantic?: string;
  /** Short author-facing explanation of the palette's intended use. */
  readonly description?: string;
}

/** Approved, named color families attached to a theme. */
export type ThemePalettes = Readonly<Record<string, ThemePaletteFamily>>;

const OPAQUE_HEX = /^#[0-9a-f]{6}$/i;

function validateRamp(
  name: string,
  mode: 'light' | 'dark',
  ramp: TonalPaletteRamp,
) {
  for (const step of TONAL_PALETTE_STEPS) {
    const value = ramp[step];
    if (typeof value !== 'string' || !OPAQUE_HEX.test(value)) {
      throw new Error(
        `Palette "${name}" ${mode} tone ${step} must be an opaque six-digit hex color.`,
      );
    }
  }

  for (const key of ['hue', 'chroma'] as const) {
    const value = ramp[key];
    if (value !== undefined && !Number.isFinite(value)) {
      throw new Error(
        `Palette "${name}" ${mode} ${key} must be a finite number, got ${String(value)}.`,
      );
    }
  }
}

/**
 * Validate and preserve an exact palette map with full type inference.
 *
 * Palette values are authoring metadata: they are available to agents,
 * previews, and custom visualization code, but they do not create CSS tokens.
 * Components should continue to use semantic tokens first.
 */
export function defineTonalPalettes<const T extends ThemePalettes>(
  palettes: T,
): T {
  for (const [name, family] of Object.entries(palettes)) {
    if (!family || typeof family !== 'object' || !family.light) {
      throw new Error(`Palette "${name}" must define a light tonal ramp.`);
    }
    validateRamp(name, 'light', family.light);
    if ('dark' in family && family.dark == null) {
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

/** Resolve the palette ramp used by a color mode. */
export function getTonalPaletteRamp(
  family: ThemePaletteFamily,
  mode: 'light' | 'dark',
): TonalPaletteRamp {
  return mode === 'dark' ? (family.dark ?? family.light) : family.light;
}
