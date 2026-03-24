/**
 * @file container.stylex.ts
 * @input Uses @stylexjs/stylex, spacing from theme
 * @output StyleX utility for layout container styling
 * @position Layout utility; used by XDSCard, XDSSection components
 *
 * ## Public API for themes
 *
 * Themes can override container padding via the `--xds-container-padding`
 * CSS custom property in component style overrides:
 *
 * ```ts
 * components: {
 *   card: { base: { '--xds-container-padding': 'var(--spacing-3)' } },
 *   section: { base: { '--xds-container-padding': 'var(--spacing-3)' } },
 * }
 * ```
 *
 * This is the **only** supported way for themes to adjust container padding.
 * Internal variables (`--layout-padding-inner-x`, etc.) are implementation
 * details and must not be referenced by themes.
 *
 * SYNC: When modified, update /packages/core/src/Layout/Layout.doc.mjs
 */

import * as stylex from '@stylexjs/stylex';
import {spacingVars} from '../theme/tokens.stylex';

/**
 * Spacing token keys for padding props.
 */
export type SpacingToken =
  | 'spacing0'
  | 'spacing0_5'
  | 'spacing1'
  | 'spacing1_5'
  | 'spacing2'
  | 'spacing3'
  | 'spacing4'
  | 'spacing5'
  | 'spacing6'
  | 'spacing7'
  | 'spacing8'
  | 'spacing9'
  | 'spacing10'
  | 'spacing11'
  | 'spacing12';

const baseStyles = stylex.create({
  container: {
    boxSizing: 'border-box',
    padding: 'var(--container-padding)',
  },
});

/**
 * Default container padding styles that cascade from --xds-container-padding.
 *
 * When no explicit padding prop is set on Card/Section, the internal
 * layout padding variables read from --xds-container-padding (set by theme)
 * with a fallback to --spacing-4 (the default).
 */
const defaultContainerPaddingStyles = stylex.create({
  containerPadding: {
    '--container-padding': `var(--xds-container-padding, ${spacingVars['--spacing-4']})`,
  },
  containerPaddingInline: {
    '--container-padding-inline': `var(--xds-container-padding, ${spacingVars['--spacing-4']})`,
  },
  layoutPaddingOuterX: {
    '--layout-padding-outer-x': `var(--xds-container-padding, ${spacingVars['--spacing-4']})`,
  },
  layoutPaddingOuterY: {
    '--layout-padding-outer-y': `var(--xds-container-padding, ${spacingVars['--spacing-4']})`,
  },
  layoutPaddingInnerX: {
    '--layout-padding-inner-x': `var(--xds-container-padding, ${spacingVars['--spacing-4']})`,
  },
  layoutPaddingInnerY: {
    '--layout-padding-inner-y': `var(--xds-container-padding, ${spacingVars['--spacing-4']})`,
  },
});

/**
 * Container padding styles.
 * Sets --container-padding CSS variable for simple content padding.
 * XDSLayout will override this to 0 and handle its own padding.
 */
const containerPaddingStyles = stylex.create({
  spacing0: {'--container-padding': spacingVars['--spacing-0']},
  spacing0_5: {'--container-padding': spacingVars['--spacing-0-5']},
  spacing1: {'--container-padding': spacingVars['--spacing-1']},
  spacing1_5: {'--container-padding': spacingVars['--spacing-1-5']},
  spacing2: {'--container-padding': spacingVars['--spacing-2']},
  spacing3: {'--container-padding': spacingVars['--spacing-3']},
  spacing4: {'--container-padding': spacingVars['--spacing-4']},
  spacing5: {'--container-padding': spacingVars['--spacing-5']},
  spacing6: {'--container-padding': spacingVars['--spacing-6']},
  spacing7: {'--container-padding': spacingVars['--spacing-7']},
  spacing8: {'--container-padding': spacingVars['--spacing-8']},
  spacing9: {'--container-padding': spacingVars['--spacing-9']},
  spacing10: {'--container-padding': spacingVars['--spacing-10']},
  spacing11: {'--container-padding': spacingVars['--spacing-11']},
  spacing12: {'--container-padding': spacingVars['--spacing-12']},
});

/**
 * Container inline padding styles for edge compensation.
 * Sets --container-padding-inline so edge-compensating children (ghost buttons, etc.)
 * know the inline padding to compensate against. Defaults to the same value as
 * --container-padding for isotropic containers; containers with asymmetric padding
 * (e.g., TopNav, Banner) set this directly.
 */
const containerPaddingInlineStyles = stylex.create({
  spacing0: {'--container-padding-inline': spacingVars['--spacing-0']},
  spacing0_5: {'--container-padding-inline': spacingVars['--spacing-0-5']},
  spacing1: {'--container-padding-inline': spacingVars['--spacing-1']},
  spacing1_5: {'--container-padding-inline': spacingVars['--spacing-1-5']},
  spacing2: {'--container-padding-inline': spacingVars['--spacing-2']},
  spacing3: {'--container-padding-inline': spacingVars['--spacing-3']},
  spacing4: {'--container-padding-inline': spacingVars['--spacing-4']},
  spacing5: {'--container-padding-inline': spacingVars['--spacing-5']},
  spacing6: {'--container-padding-inline': spacingVars['--spacing-6']},
  spacing7: {'--container-padding-inline': spacingVars['--spacing-7']},
  spacing8: {'--container-padding-inline': spacingVars['--spacing-8']},
  spacing9: {'--container-padding-inline': spacingVars['--spacing-9']},
  spacing10: {'--container-padding-inline': spacingVars['--spacing-10']},
  spacing11: {'--container-padding-inline': spacingVars['--spacing-11']},
  spacing12: {'--container-padding-inline': spacingVars['--spacing-12']},
});

const paddingOuterXStyles = stylex.create({
  spacing0: {'--layout-padding-outer-x': spacingVars['--spacing-0']},
  spacing0_5: {'--layout-padding-outer-x': spacingVars['--spacing-0-5']},
  spacing1: {'--layout-padding-outer-x': spacingVars['--spacing-1']},
  spacing1_5: {'--layout-padding-outer-x': spacingVars['--spacing-1-5']},
  spacing2: {'--layout-padding-outer-x': spacingVars['--spacing-2']},
  spacing3: {'--layout-padding-outer-x': spacingVars['--spacing-3']},
  spacing4: {'--layout-padding-outer-x': spacingVars['--spacing-4']},
  spacing5: {'--layout-padding-outer-x': spacingVars['--spacing-5']},
  spacing6: {'--layout-padding-outer-x': spacingVars['--spacing-6']},
  spacing7: {'--layout-padding-outer-x': spacingVars['--spacing-7']},
  spacing8: {'--layout-padding-outer-x': spacingVars['--spacing-8']},
  spacing9: {'--layout-padding-outer-x': spacingVars['--spacing-9']},
  spacing10: {'--layout-padding-outer-x': spacingVars['--spacing-10']},
  spacing11: {'--layout-padding-outer-x': spacingVars['--spacing-11']},
  spacing12: {'--layout-padding-outer-x': spacingVars['--spacing-12']},
});

const paddingOuterYStyles = stylex.create({
  spacing0: {'--layout-padding-outer-y': spacingVars['--spacing-0']},
  spacing0_5: {'--layout-padding-outer-y': spacingVars['--spacing-0-5']},
  spacing1: {'--layout-padding-outer-y': spacingVars['--spacing-1']},
  spacing1_5: {'--layout-padding-outer-y': spacingVars['--spacing-1-5']},
  spacing2: {'--layout-padding-outer-y': spacingVars['--spacing-2']},
  spacing3: {'--layout-padding-outer-y': spacingVars['--spacing-3']},
  spacing4: {'--layout-padding-outer-y': spacingVars['--spacing-4']},
  spacing5: {'--layout-padding-outer-y': spacingVars['--spacing-5']},
  spacing6: {'--layout-padding-outer-y': spacingVars['--spacing-6']},
  spacing7: {'--layout-padding-outer-y': spacingVars['--spacing-7']},
  spacing8: {'--layout-padding-outer-y': spacingVars['--spacing-8']},
  spacing9: {'--layout-padding-outer-y': spacingVars['--spacing-9']},
  spacing10: {'--layout-padding-outer-y': spacingVars['--spacing-10']},
  spacing11: {'--layout-padding-outer-y': spacingVars['--spacing-11']},
  spacing12: {'--layout-padding-outer-y': spacingVars['--spacing-12']},
});

const paddingInnerXStyles = stylex.create({
  spacing0: {'--layout-padding-inner-x': spacingVars['--spacing-0']},
  spacing0_5: {'--layout-padding-inner-x': spacingVars['--spacing-0-5']},
  spacing1: {'--layout-padding-inner-x': spacingVars['--spacing-1']},
  spacing1_5: {'--layout-padding-inner-x': spacingVars['--spacing-1-5']},
  spacing2: {'--layout-padding-inner-x': spacingVars['--spacing-2']},
  spacing3: {'--layout-padding-inner-x': spacingVars['--spacing-3']},
  spacing4: {'--layout-padding-inner-x': spacingVars['--spacing-4']},
  spacing5: {'--layout-padding-inner-x': spacingVars['--spacing-5']},
  spacing6: {'--layout-padding-inner-x': spacingVars['--spacing-6']},
  spacing7: {'--layout-padding-inner-x': spacingVars['--spacing-7']},
  spacing8: {'--layout-padding-inner-x': spacingVars['--spacing-8']},
  spacing9: {'--layout-padding-inner-x': spacingVars['--spacing-9']},
  spacing10: {'--layout-padding-inner-x': spacingVars['--spacing-10']},
  spacing11: {'--layout-padding-inner-x': spacingVars['--spacing-11']},
  spacing12: {'--layout-padding-inner-x': spacingVars['--spacing-12']},
});

const paddingInnerYStyles = stylex.create({
  spacing0: {'--layout-padding-inner-y': spacingVars['--spacing-0']},
  spacing0_5: {'--layout-padding-inner-y': spacingVars['--spacing-0-5']},
  spacing1: {'--layout-padding-inner-y': spacingVars['--spacing-1']},
  spacing1_5: {'--layout-padding-inner-y': spacingVars['--spacing-1-5']},
  spacing2: {'--layout-padding-inner-y': spacingVars['--spacing-2']},
  spacing3: {'--layout-padding-inner-y': spacingVars['--spacing-3']},
  spacing4: {'--layout-padding-inner-y': spacingVars['--spacing-4']},
  spacing5: {'--layout-padding-inner-y': spacingVars['--spacing-5']},
  spacing6: {'--layout-padding-inner-y': spacingVars['--spacing-6']},
  spacing7: {'--layout-padding-inner-y': spacingVars['--spacing-7']},
  spacing8: {'--layout-padding-inner-y': spacingVars['--spacing-8']},
  spacing9: {'--layout-padding-inner-y': spacingVars['--spacing-9']},
  spacing10: {'--layout-padding-inner-y': spacingVars['--spacing-10']},
  spacing11: {'--layout-padding-inner-y': spacingVars['--spacing-11']},
  spacing12: {'--layout-padding-inner-y': spacingVars['--spacing-12']},
});

export interface ContainerOptions {
  /**
   * Default container padding for simple content.
   * Sets --container-padding CSS variable.
   * XDSLayout overrides this to 0 and manages its own padding.
   * @default 'spacing4'
   */
  padding?: SpacingToken;

  /**
   * Outer horizontal padding (left/right).
   * Sets --layout-padding-outer-x CSS variable.
   * @default 'spacing4'
   */
  paddingOuterX?: SpacingToken;

  /**
   * Outer vertical padding (top/bottom).
   * Sets --layout-padding-outer-y CSS variable.
   * @default 'spacing4'
   */
  paddingOuterY?: SpacingToken;

  /**
   * Inner horizontal padding for content areas.
   * Sets --layout-padding-inner-x CSS variable.
   * @default 'spacing4'
   */
  paddingInnerX?: SpacingToken;

  /**
   * Inner vertical padding for content areas.
   * Sets --layout-padding-inner-y CSS variable.
   * @default 'spacing4'
   */
  paddingInnerY?: SpacingToken;

  /**
   * When true, internal layout padding variables cascade from
   * --xds-container-padding (set by theme component overrides)
   * instead of being set to explicit spacing token values.
   *
   * This allows themes to override container padding via a single
   * public CSS custom property without touching internal vars.
   *
   * Used by Card and Section when no explicit padding prop is provided.
   * @default false
   */
  useThemeDefault?: boolean;
}

/**
 * StyleX utility to add layout container styles to any element.
 *
 * Sets CSS variables for padding that child layout components read:
 * - `--container-padding` — Default padding for simple content
 * - `--container-padding-inline` — Inline padding for edge compensation
 * - `--layout-padding-outer-x`, `--layout-padding-outer-y` (internal)
 * - `--layout-padding-inner-x`, `--layout-padding-inner-y` (internal)
 *
 * Themes should use `--xds-container-padding` in component overrides to
 * adjust padding. Do not reference `--layout-padding-*` variables directly.
 *
 * @example
 * ```
 * import { container } from '@xds/core/Layout';
 * import * as stylex from '@stylexjs/stylex';
 *
 * // Basic container with default padding (theme-overridable)
 * <div {...stylex.props(...container({ useThemeDefault: true }))}>
 *   <XDSLayout ... />
 * </div>
 *
 * // Explicit padding values (not theme-overridable)
 * <div {...stylex.props(
 *   ...container({ padding: 'spacing3', paddingOuterY: 'spacing2', paddingInnerX: 'spacing3' }),
 *   customStyles.card
 * )}>
 *   <XDSLayout ... />
 * </div>
 * ```
 */
export function container({
  padding = 'spacing4',
  paddingOuterX = 'spacing4',
  paddingOuterY = 'spacing4',
  paddingInnerX = 'spacing4',
  paddingInnerY = 'spacing4',
  useThemeDefault = false,
}: ContainerOptions) {
  // When useThemeDefault is true, cascade from --xds-container-padding
  // so themes can override via a single public custom property.
  if (useThemeDefault) {
    return [
      baseStyles.container,
      defaultContainerPaddingStyles.containerPadding,
      defaultContainerPaddingStyles.containerPaddingInline,
      defaultContainerPaddingStyles.layoutPaddingOuterX,
      defaultContainerPaddingStyles.layoutPaddingOuterY,
      defaultContainerPaddingStyles.layoutPaddingInnerX,
      defaultContainerPaddingStyles.layoutPaddingInnerY,
    ] as const;
  }

  return [
    baseStyles.container,
    containerPaddingStyles[padding],
    // Set --container-padding-inline for edge compensation. When paddingOuterX
    // differs from the base padding, use paddingOuterX since that's the actual
    // inline padding at the container edges.
    containerPaddingInlineStyles[paddingOuterX],
    paddingOuterXStyles[paddingOuterX],
    paddingOuterYStyles[paddingOuterY],
    paddingInnerXStyles[paddingInnerX],
    paddingInnerYStyles[paddingInnerY],
  ] as const;
}
