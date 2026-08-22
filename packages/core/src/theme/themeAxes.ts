// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file themeAxes.ts
 * @input Theme axis configs from defineTheme input (typography, components)
 * @output Type-scale config and font-family tokens
 * @position Theme system utility; consumed by defineTheme and conditionalTheme
 *
 * Shared helpers for turning the declarative axes of a theme input into the
 * lower-level shapes the expanders and the CSS generator consume. Extracted
 * from defineTheme so the conditional theme layer (`mobile`) resolves its
 * partial theme through exactly the same code as the base theme — one
 * implementation, no drift between the two.
 */

import type {TypographyConfig, FontWeight} from './types';
import type {TypeScaleConfig} from './expandTypeScale';

/**
 * Resolve a FontWeight name to a var() reference.
 * Named weights map to var(--font-weight-*); raw values pass through.
 */
export function resolveFontWeight(weight: FontWeight): string {
  const named: Record<string, string> = {
    normal: 'var(--font-weight-normal)',
    medium: 'var(--font-weight-medium)',
    semibold: 'var(--font-weight-semibold)',
    bold: 'var(--font-weight-bold)',
  };
  return named[weight] ?? weight;
}

/**
 * Build the full CSS font-family value from family + fallbacks.
 * Quotes the family name if it contains spaces.
 */
export function buildFontFamily(
  family?: string,
  fallbacks?: string,
): string | undefined {
  if (!family) {
    return undefined;
  }
  const quoted = family.includes(' ') ? `"${family}"` : family;
  if (fallbacks) {
    return `${quoted}, ${fallbacks}`;
  }
  return quoted;
}

/**
 * A typography config a type scale can be built from.
 *
 * The scale's own fields are optional so the conditional theme layer, whose
 * scale inherits anything it does not state, shares this one builder — it
 * passes the values it resolved as `resolvedScale`.
 */
export type TypeScaleSource = Omit<TypographyConfig, 'scale'> & {
  scale?: {base?: number; ratio?: number};
};

/**
 * Build the type-scale config from a typography config.
 *
 * Returns undefined when the typography config has no `scale` — font families
 * and weights alone do not produce a scale.
 */
export function buildTypeScaleConfig(
  typo: TypeScaleSource,
  /**
   * Base and ratio to use instead of `typo.scale`'s own. The conditional theme
   * layer resolves its scale first (a pin re-derives the ratio, and either
   * field may be inherited from the desktop scale) and hands the result in, so
   * weight collection stays in one place.
   */
  resolvedScale?: {base: number; ratio: number},
): TypeScaleConfig | undefined {
  // The resolved scale wins when the caller supplies one; otherwise the
  // config's own fields must both be present for there to be a scale at all.
  const base = resolvedScale?.base ?? typo.scale?.base;
  const ratio = resolvedScale?.ratio ?? typo.scale?.ratio;
  if (base === undefined || ratio === undefined) {
    return undefined;
  }

  // Collect weight overrides from typography roles
  const headingWeights: Partial<Record<1 | 2 | 3 | 4 | 5 | 6, string>> = {};
  const headingRole = typo.heading;
  if (headingRole?.weights) {
    for (const [level, w] of Object.entries(headingRole.weights)) {
      if (w) {
        headingWeights[Number(level) as 1 | 2 | 3 | 4 | 5 | 6] =
          resolveFontWeight(w);
      }
    }
  }
  // Default heading weight from role
  const defaultHeadingWeight = headingRole?.weight
    ? resolveFontWeight(headingRole.weight)
    : undefined;
  if (defaultHeadingWeight) {
    for (let i = 1; i <= 6; i++) {
      if (!(i in headingWeights)) {
        headingWeights[i as 1 | 2 | 3 | 4 | 5 | 6] = defaultHeadingWeight;
      }
    }
  }

  // Text weight overrides from roles
  const textWeights: Partial<Record<string, string>> = {};
  if (typo.body?.weight) {
    textWeights.body = resolveFontWeight(typo.body.weight);
  }
  if (typo.code?.weight) {
    textWeights.code = resolveFontWeight(typo.code.weight);
  }

  return {
    base,
    ratio,
    weights: {
      ...(Object.keys(headingWeights).length > 0
        ? {heading: headingWeights}
        : {}),
      ...(Object.keys(textWeights).length > 0 ? {text: textWeights} : {}),
    },
  };
}

/**
 * Build the `--font-family-*` token overrides implied by a typography config.
 * Heading inherits from body when it declares no family of its own.
 */
export function buildFontFamilyTokens(
  typo: Omit<TypographyConfig, 'scale'>,
): Record<string, string> {
  const tokens: Record<string, string> = {};

  const bodyFamily = buildFontFamily(typo.body?.family, typo.body?.fallbacks);
  const headingFamily =
    buildFontFamily(typo.heading?.family, typo.heading?.fallbacks) ??
    bodyFamily;
  const codeFamily = buildFontFamily(typo.code?.family, typo.code?.fallbacks);

  if (bodyFamily) {
    tokens['--font-family-body'] = bodyFamily;
  }
  if (headingFamily) {
    tokens['--font-family-heading'] = headingFamily;
  }
  if (codeFamily) {
    tokens['--font-family-code'] = codeFamily;
  }

  return tokens;
}
