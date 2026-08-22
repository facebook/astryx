// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file conditionalTheme.ts
 * @input Conditional theme overrides from defineTheme (`mobile`, `breakpoints`)
 * @output Resolved conditional layers (media query + tokens + components)
 * @position Theme system utility; consumed by defineTheme and generateThemeRules
 *
 * A conditional theme layer is a **named condition** whose values apply only
 * where that condition matches. The condition is named, not written as a raw
 * media query, so a theme author never has to invent a breakpoint or remember
 * that "mobile" means more than a narrow window.
 *
 * The first (and currently only) condition is `mobile`, which means
 * **narrow AND touch** — a desktop user dragging their window narrow does not
 * match it. It compiles to:
 *
 *     @media (max-width: <breakpoint>px) and (pointer: coarse)
 *
 * where `<breakpoint>` is `breakpoints.mobile` if the theme sets one and
 * {@link DEFAULT_MOBILE_BREAKPOINT} (756) otherwise.
 *
 * "Conditional" (not "media") is deliberate: in Astryx, *media* at the theme
 * layer already means content sitting on an image or video surface — see
 * `onMediaTokens.ts`, `MediaTheme`, `onDark`/`onLight`.
 *
 * Unset means nothing is emitted: a condition that is absent or `null`
 * produces no resolved layer at all, so no CSS is generated for it and a theme
 * that does not opt in is byte-identical to before this layer existed.
 */

import type {
  ComponentStyleMap,
  TokenName,
  TokenValue,
  DefineThemeInput,
} from './defineTheme';
import type {TypographyConfig} from './types';
import type {TypeScaleConfig, TypeScalePinAnchor} from './expandTypeScale';
import {
  expandTypeScale,
  generateTypeScaleComponents,
  derivePinnedRatio,
  recommendedPinAnchor,
  DEFAULT_TYPE_SCALE,
} from './expandTypeScale';
import {expandMotionScale, type MotionScaleConfig} from './expandMotionScale';
import {expandRadiusScale, type RadiusScaleConfig} from './expandRadiusScale';
import {expandColorScale, type ColorScaleConfig} from './expandColorScale';
import {buildFontFamilyTokens, buildTypeScaleConfig} from './themeAxes';
import {deepMergeComponents} from './mergeComponents';

// =============================================================================
// Types
// =============================================================================

/**
 * The width below which the `mobile` condition can match, in px.
 *
 * Themes override it with `breakpoints: {mobile: <px>}`. Width alone never
 * makes `mobile` match — the pointer must be coarse as well.
 */
export const DEFAULT_MOBILE_BREAKPOINT = 756;

/**
 * Names of the conditions a theme can define values for.
 *
 * Spelled inline at each use rather than exported as a named union: the
 * repo's doc guard (`docPropLiterals`) requires a documented type to reveal
 * its legal values, and `DefinedTheme` is documented as `<Theme>`'s `theme`
 * prop. A named alias would hide `'mobile'` from anyone reading the docs
 * without an IDE.
 */

/**
 * Breakpoint configuration for named conditions.
 *
 * @example
 * ```
 * breakpoints: {mobile: 640}
 * ```
 */
export interface ThemeBreakpoints {
  /**
   * Width below which the `mobile` condition can match, in px.
   * Defaults to 756. The condition also requires a coarse pointer, so a
   * narrow desktop window never matches it.
   */
  mobile?: number;
}

/**
 * A conditional type scale.
 *
 * Every field is optional, and each one that is omitted is inherited from the
 * theme's own (desktop) scale — so a condition states only what differs.
 *
 * @example
 * ```
 * // Floor body to 16 and keep the desktop ratio: the whole ladder lifts.
 * scale: {base: 16}
 *
 * // Floor body to 16 and hold Display 1 at its desktop size: the ratio is
 * // re-derived so the top of the scale does not grow.
 * scale: {base: 16, pin: 'display-1'}
 * ```
 */
export interface ConditionalTypeScale {
  /**
   * Base font size in px, anchored to body text.
   * Defaults to the theme's own base — set 16 for the touch readability floor.
   */
  base?: number;
  /**
   * Scaling ratio for the geometric progression.
   * Defaults to the theme's own ratio. Ignored when `pin` is set, which
   * derives the ratio instead.
   */
  ratio?: number;
  /**
   * Hold one role at the size it has in the theme's own scale, and re-derive
   * the ratio so the rest of the ladder falls around it.
   *
   * Without this, raising `base` raises every role by the same factor — a
   * Display 1 that reads well at 42px on a desktop becomes 48px on the device
   * with the least room for it. Pinning trades some of that growth away: the
   * pinned role holds, the roles below it still rise to meet the new base.
   *
   * `'auto'` picks the anchor from the theme's ratio: Display 1 up to 1.25,
   * Heading 2 below 1.414, Heading 3 at 1.414 and above — pinning lower the
   * more dramatic the scale. Unset means no pin: the desktop ratio is kept and
   * the whole ladder lifts with the base.
   *
   * Takes precedence over `ratio`.
   */
  pin?: TypeScalePinAnchor | 'auto';
}

/**
 * Typography overrides for a condition — the theme's typography config, with a
 * scale whose fields are all optional and can pin to the desktop scale.
 */
export interface ConditionalTypographyConfig extends Omit<
  TypographyConfig,
  'scale'
> {
  /** Type scale for this condition. Omitted fields follow the theme's own. */
  scale?: ConditionalTypeScale;
}

/**
 * Overrides that apply only where a condition matches — a partial theme with
 * the same shape as the top-level input.
 *
 * Every axis is independent: only the axes actually set here generate CSS.
 * Setting `tokens` alone emits token declarations and nothing else.
 */
export interface ConditionalThemeOverrides {
  /** Typography overrides — scale, families, weights. */
  typography?: ConditionalTypographyConfig;
  /** Color scale overrides. Merged over the theme's own color config. */
  color?: Partial<ColorScaleConfig>;
  /** Radius scale overrides. Merged over the theme's own radius config. */
  radius?: Partial<RadiusScaleConfig>;
  /** Motion scale overrides. Merged over the theme's own motion config. */
  motion?: Partial<MotionScaleConfig>;
  /** Explicit token overrides — highest precedence within the condition. */
  tokens?: Partial<Record<TokenName, TokenValue>>;
  /** Component style overrides. */
  components?: ComponentStyleMap;
}

/**
 * A resolved conditional layer stored on DefinedTheme.
 * @internal
 */
export interface ResolvedConditionalTheme {
  /** The condition this layer belongs to. */
  condition: 'mobile';
  /** The media query the condition compiles to, without the `@media` keyword. */
  query: string;
  /** Resolved token CSS values — only the tokens this layer sets. */
  tokens: Record<string, string>;
  /** Component style overrides for this layer, if any. */
  components?: ComponentStyleMap;
}

// =============================================================================
// Resolution
// =============================================================================

/**
 * Build the media query for the `mobile` condition.
 *
 * Both halves are load-bearing: the width bound keeps it off large touch
 * screens, and `pointer: coarse` keeps it off a narrowed desktop window.
 *
 * A breakpoint that is not a positive finite number falls back to the default
 * rather than reaching the CSS: `NaN` compiles to `max-width: NaNpx`, which no
 * browser matches, so the whole layer would vanish with no signal.
 */
export function mobileMediaQuery(breakpoint?: number): string {
  const width =
    typeof breakpoint === 'number' &&
    Number.isFinite(breakpoint) &&
    breakpoint > 0
      ? breakpoint
      : DEFAULT_MOBILE_BREAKPOINT;
  return `(max-width: ${width}px) and (pointer: coarse)`;
}

/**
 * Resolve a token value to a CSS string.
 * - String values pass through as-is
 * - [light, dark] tuples become light-dark(light, dark)
 */
function resolveTokenValue(value: TokenValue): string {
  if (Array.isArray(value)) {
    return `light-dark(${value[0]}, ${value[1]})`;
  }
  return value;
}

/**
 * Resolve a condition's type scale against the desktop scale it overrides.
 *
 * `base` and `ratio` fall back to the desktop scale's, so a condition states
 * only what differs. A `pin` derives the ratio instead of taking it, holding
 * the named role at its desktop size.
 */
function resolveConditionalScale(
  scale: ConditionalTypeScale,
  desktop: {base: number; ratio: number},
): {base: number; ratio: number} {
  const base = scale.base ?? desktop.base;

  if (scale.pin) {
    const anchor: TypeScalePinAnchor =
      scale.pin === 'auto' ? recommendedPinAnchor(desktop.ratio) : scale.pin;
    return {
      base,
      ratio: derivePinnedRatio({
        desktopBase: desktop.base,
        desktopRatio: desktop.ratio,
        base,
        anchor,
      }),
    };
  }

  return {base, ratio: scale.ratio ?? desktop.ratio};
}

/**
 * Resolve one condition's partial theme into tokens + component overrides.
 *
 * Mirrors the base theme's axis precedence exactly: generated values first
 * (color, type scale, radius, motion, font families), explicit `tokens` last.
 *
 * Every scale axis is merged over the theme's own config before expanding, so
 * a condition states only the fields that differ. Without that, an override
 * like `{color: {contrast: 'high'}}` would re-expand the palette from the
 * DEFAULT accent and silently drop the theme's brand hue — the same failure
 * the type scale's inheritance avoids, in the other axes.
 */
function resolveOverrides(
  input: ConditionalThemeOverrides,
  theme: ThemeAxisConfigs,
): {
  tokens: Record<string, string>;
  components?: ComponentStyleMap;
} {
  const tokens: Record<string, string> = {};

  const typo = input.typography;
  const desktopScale = theme.scale ?? DEFAULT_TYPE_SCALE;
  const resolvedScale = typo?.scale
    ? resolveConditionalScale(typo.scale, desktopScale)
    : undefined;
  const typeScaleConfig: TypeScaleConfig | undefined = typo
    ? buildTypeScaleConfig(typo, resolvedScale)
    : undefined;

  if (input.color) {
    const color: ColorScaleConfig = {...theme.color, ...input.color};
    Object.assign(tokens, expandColorScale(color));
  }
  if (typeScaleConfig) {
    Object.assign(tokens, expandTypeScale(typeScaleConfig));
  }
  // The expanders require a full config; a condition supplies a partial one
  // and the theme's own fills the rest. Both are cast because the merge is
  // only provably complete at runtime — a theme that sets neither the axis nor
  // the condition's missing fields falls back to the expander's own defaults.
  if (input.radius) {
    const radius: RadiusScaleConfig = {
      ...(theme.radius as RadiusScaleConfig),
      ...input.radius,
    };
    Object.assign(tokens, expandRadiusScale(radius));
  }
  if (input.motion) {
    const motion: MotionScaleConfig = {
      ...(theme.motion as MotionScaleConfig),
      ...input.motion,
    };
    Object.assign(tokens, expandMotionScale(motion));
  }
  if (typo) {
    Object.assign(tokens, buildFontFamilyTokens(typo));
  }
  // Explicit tokens win over anything generated inside this condition.
  if (input.tokens) {
    for (const [key, value] of Object.entries(input.tokens)) {
      if (value !== undefined) {
        tokens[key] = resolveTokenValue(value);
      }
    }
  }

  let components = input.components;
  if (typeScaleConfig) {
    components = deepMergeComponents(
      generateTypeScaleComponents(typeScaleConfig),
      input.components,
    );
  }

  return {tokens, components};
}

/**
 * The axis configs a condition resolves against — the theme's own, already
 * merged with anything it inherited through `extends`.
 * @internal
 */
export interface ThemeAxisConfigs {
  scale?: {base: number; ratio: number};
  color?: Partial<ColorScaleConfig>;
  radius?: Partial<RadiusScaleConfig>;
  motion?: Partial<MotionScaleConfig>;
}

/**
 * Merge a parent's resolved conditional layers with a child's.
 *
 * Same rule as every other inherited axis: matched by condition, the child's
 * tokens spread over the parent's and component maps deep-merge, and a
 * condition only the parent declares carries through untouched. A child that
 * declares nothing inherits the parent's layers whole — the alternative is a
 * theme that changes one colour and silently loses all its mobile styling.
 */
function mergeConditionalLayers(
  base: ResolvedConditionalTheme[] | undefined,
  own: ResolvedConditionalTheme[],
): ResolvedConditionalTheme[] {
  if (!base || base.length === 0) {
    return own;
  }
  const byCondition = new Map(base.map(layer => [layer.condition, layer]));
  for (const layer of own) {
    const parent = byCondition.get(layer.condition);
    byCondition.set(
      layer.condition,
      parent
        ? {
            condition: layer.condition,
            // The child's query wins: it already reflects the effective
            // breakpoint, inherited or overridden.
            query: layer.query,
            tokens: {...parent.tokens, ...layer.tokens},
            components: deepMergeComponents(
              parent.components,
              layer.components,
            ),
          }
        : layer,
    );
  }
  return [...byCondition.values()];
}

/**
 * Resolve every conditional layer a theme declares, merged with any it
 * inherits from the theme it extends.
 *
 * Returns `undefined` when neither declares one — the opt-in guarantee: a
 * theme that never mentions a condition carries no conditional data and
 * generates no conditional CSS.
 *
 * `base` mirrors the third argument of `resolveOnMedia`: a conditional layer
 * is inherited like every other axis, and a condition's scale, breakpoint and
 * pin anchor all resolve against the EFFECTIVE theme, so a child that inherits
 * its type scale pins against the scale it actually has.
 */
export function resolveConditionalThemes(
  input: Pick<
    DefineThemeInput,
    'mobile' | 'breakpoints' | 'typography' | 'color' | 'radius' | 'motion'
  >,
  base?: {
    __conditional?: ResolvedConditionalTheme[];
    __typeScale?: {base: number; ratio: number};
    __breakpoints?: ThemeBreakpoints;
    __axisConfigs?: ThemeAxisConfigs;
  },
): ResolvedConditionalTheme[] | undefined {
  const layers: ResolvedConditionalTheme[] = [];

  const theme: ThemeAxisConfigs = {
    scale: input.typography?.scale ?? base?.__typeScale,
    color: input.color ?? base?.__axisConfigs?.color,
    radius: input.radius ?? base?.__axisConfigs?.radius,
    motion: input.motion ?? base?.__axisConfigs?.motion,
  };
  const breakpoint = input.breakpoints?.mobile ?? base?.__breakpoints?.mobile;

  // Read the key only when it is set — absent or null means "no mobile layer".
  const mobile = input.mobile;
  if (mobile != null) {
    const {tokens, components} = resolveOverrides(mobile, theme);
    layers.push({
      condition: 'mobile',
      query: mobileMediaQuery(breakpoint),
      tokens,
      components,
    });
  }

  const merged = mergeConditionalLayers(base?.__conditional, layers);
  return merged.length > 0 ? merged : undefined;
}
