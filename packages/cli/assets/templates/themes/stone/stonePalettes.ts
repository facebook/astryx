// Copyright (c) Meta Platforms, Inc. and affiliates.

import {black, palette, white} from './stonePalettes.generated';

function withModeRamps<
  Family extends {
    light: Readonly<Record<number, string>>;
    dark: Readonly<Record<number, string>>;
  },
>(
  family: Family,
): Family['light'] & {
  readonly light: Family['light'];
  readonly dark: Family['dark'];
} {
  return {
    ...family.light,
    light: family.light,
    dark: family.dark,
  };
}

/**
 * Stone's reviewed palette, generated from ../palette.config.json.
 * Numbered properties preserve Stone's original shared-ramp API; use `light`
 * and `dark` when authoring new mode-aware mappings.
 */
export const stonePalettes = {
  black,
  white,
  neutral: withModeRamps(palette.neutral),
  red: withModeRamps(palette.red),
  orange: withModeRamps(palette.orange),
  yellow: withModeRamps(palette.yellow),
  green: withModeRamps(palette.green),
  teal: withModeRamps(palette.teal),
  cyan: withModeRamps(palette.cyan),
  blue: withModeRamps(palette.blue),
  purple: withModeRamps(palette.purple),
  pink: withModeRamps(palette.pink),
} as const;

export default stonePalettes;
