/**
 * @file container.stylex.ts
 * @input Uses @stylexjs/stylex, spacing from theme
 * @output StyleX utility for layout container styling
 * @position Layout utility; used by XDSCard, XDSSection components
 *
 * ## Public API for themes
 *
 * Themes can override container padding via component-specific CSS custom
 * properties following the `--xds-{component}-padding` naming convention:
 *
 * ```ts
 * components: {
 *   card: { base: { '--xds-card-padding': 'var(--spacing-3)' } },
 *   section: { base: { '--xds-section-padding': 'var(--spacing-3)' } },
 *   dialog: { base: { '--xds-dialog-padding': 'var(--spacing-3)' } },
 * }
 * ```
 *
 * For asymmetric padding, use axis-specific overrides that take precedence
 * over the uniform `--xds-{component}-padding`:
 *
 * ```ts
 * card: { base: { '--xds-card-padding-inline': '20px', '--xds-card-padding-block': '24px' } },
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
    paddingInline: 'var(--container-padding-inline)',
    paddingBlockStart: 'var(--container-padding-block-start)',
    paddingBlockEnd: 'var(--container-padding-block-end)',
  },
});

/**
 * Card default padding styles that cascade from --xds-card-padding.
 *
 * When no explicit padding prop is set on Card, the internal
 * layout padding variables read from --xds-card-padding (set by theme)
 * with a fallback to --spacing-4 (the default).
 */
const cardDefaultPaddingStyles = stylex.create({
  containerPaddingInline: {
    '--container-padding-inline': `var(--xds-card-padding-inline, var(--xds-card-padding, ${spacingVars['--spacing-4']}))`,
  },
  containerPaddingBlockStart: {
    '--container-padding-block-start': `var(--xds-card-padding-block, var(--xds-card-padding, ${spacingVars['--spacing-4']}))`,
  },
  containerPaddingBlockEnd: {
    '--container-padding-block-end': `var(--xds-card-padding-block, var(--xds-card-padding, ${spacingVars['--spacing-4']}))`,
  },
  layoutPaddingOuterX: {
    '--layout-padding-outer-x': `var(--xds-card-padding-inline, var(--xds-card-padding, ${spacingVars['--spacing-4']}))`,
  },
  layoutPaddingOuterY: {
    '--layout-padding-outer-y': `var(--xds-card-padding-block, var(--xds-card-padding, ${spacingVars['--spacing-4']}))`,
  },
  layoutPaddingInnerX: {
    '--layout-padding-inner-x': `var(--xds-card-padding-inline, var(--xds-card-padding, ${spacingVars['--spacing-4']}))`,
  },
  layoutPaddingInnerY: {
    '--layout-padding-inner-y': `var(--xds-card-padding-block, var(--xds-card-padding, ${spacingVars['--spacing-4']}))`,
  },
});

/**
 * Section default padding styles that cascade from --xds-section-padding.
 *
 * When no explicit padding prop is set on Section, the internal
 * layout padding variables read from --xds-section-padding (set by theme)
 * with a fallback to --spacing-4 (the default).
 */
const sectionDefaultPaddingStyles = stylex.create({
  containerPaddingInline: {
    '--container-padding-inline': `var(--xds-section-padding, ${spacingVars['--spacing-4']})`,
  },
  containerPaddingBlockStart: {
    '--container-padding-block-start': `var(--xds-section-padding, ${spacingVars['--spacing-4']})`,
  },
  containerPaddingBlockEnd: {
    '--container-padding-block-end': `var(--xds-section-padding, ${spacingVars['--spacing-4']})`,
  },
  layoutPaddingOuterX: {
    '--layout-padding-outer-x': `var(--xds-section-padding, ${spacingVars['--spacing-4']})`,
  },
  layoutPaddingOuterY: {
    '--layout-padding-outer-y': `var(--xds-section-padding, ${spacingVars['--spacing-4']})`,
  },
  layoutPaddingInnerX: {
    '--layout-padding-inner-x': `var(--xds-section-padding, ${spacingVars['--spacing-4']})`,
  },
  layoutPaddingInnerY: {
    '--layout-padding-inner-y': `var(--xds-section-padding, ${spacingVars['--spacing-4']})`,
  },
});

/**
 * Dialog default padding styles that cascade from --xds-dialog-padding.
 *
 * When no explicit padding prop is set on Dialog, the internal
 * layout padding variables read from --xds-dialog-padding (set by theme)
 * with a fallback to --spacing-4 (the default).
 */
const dialogDefaultPaddingStyles = stylex.create({
  containerPaddingInline: {
    '--container-padding-inline': `var(--xds-dialog-padding, ${spacingVars['--spacing-4']})`,
  },
  containerPaddingBlockStart: {
    '--container-padding-block-start': `var(--xds-dialog-padding, ${spacingVars['--spacing-4']})`,
  },
  containerPaddingBlockEnd: {
    '--container-padding-block-end': `var(--xds-dialog-padding, ${spacingVars['--spacing-4']})`,
  },
  layoutPaddingOuterX: {
    '--layout-padding-outer-x': `var(--xds-dialog-padding, ${spacingVars['--spacing-4']})`,
  },
  layoutPaddingOuterY: {
    '--layout-padding-outer-y': `var(--xds-dialog-padding, ${spacingVars['--spacing-4']})`,
  },
  layoutPaddingInnerX: {
    '--layout-padding-inner-x': `var(--xds-dialog-padding, ${spacingVars['--spacing-4']})`,
  },
  layoutPaddingInnerY: {
    '--layout-padding-inner-y': `var(--xds-dialog-padding, ${spacingVars['--spacing-4']})`,
  },
});

/**
 * Map from component name to its theme default padding styles.
 * Each component reads from its own public CSS custom property.
 */
const themeDefaultStyles = {
  card: cardDefaultPaddingStyles,
  section: sectionDefaultPaddingStyles,
  dialog: dialogDefaultPaddingStyles,
};

export type ContainerComponent = keyof typeof themeDefaultStyles;

/**
 * Container inline padding styles for edge compensation.
 * Sets --container-padding-inline so edge-compensating children (ghost buttons, etc.)
 * know the inline padding to compensate against.
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

/**
 * Container block-start/block-end padding styles for vertical bleed.
 * Split into start and end because Layout areas have asymmetric block padding
 * (e.g., Header: block-start=outer-y, block-end=inner-y).
 */
const containerPaddingBlockStartStyles = stylex.create({
  spacing0: {'--container-padding-block-start': spacingVars['--spacing-0']},
  spacing0_5: {'--container-padding-block-start': spacingVars['--spacing-0-5']},
  spacing1: {'--container-padding-block-start': spacingVars['--spacing-1']},
  spacing1_5: {'--container-padding-block-start': spacingVars['--spacing-1-5']},
  spacing2: {'--container-padding-block-start': spacingVars['--spacing-2']},
  spacing3: {'--container-padding-block-start': spacingVars['--spacing-3']},
  spacing4: {'--container-padding-block-start': spacingVars['--spacing-4']},
  spacing5: {'--container-padding-block-start': spacingVars['--spacing-5']},
  spacing6: {'--container-padding-block-start': spacingVars['--spacing-6']},
  spacing7: {'--container-padding-block-start': spacingVars['--spacing-7']},
  spacing8: {'--container-padding-block-start': spacingVars['--spacing-8']},
  spacing9: {'--container-padding-block-start': spacingVars['--spacing-9']},
  spacing10: {'--container-padding-block-start': spacingVars['--spacing-10']},
  spacing11: {'--container-padding-block-start': spacingVars['--spacing-11']},
  spacing12: {'--container-padding-block-start': spacingVars['--spacing-12']},
});

const containerPaddingBlockEndStyles = stylex.create({
  spacing0: {'--container-padding-block-end': spacingVars['--spacing-0']},
  spacing0_5: {'--container-padding-block-end': spacingVars['--spacing-0-5']},
  spacing1: {'--container-padding-block-end': spacingVars['--spacing-1']},
  spacing1_5: {'--container-padding-block-end': spacingVars['--spacing-1-5']},
  spacing2: {'--container-padding-block-end': spacingVars['--spacing-2']},
  spacing3: {'--container-padding-block-end': spacingVars['--spacing-3']},
  spacing4: {'--container-padding-block-end': spacingVars['--spacing-4']},
  spacing5: {'--container-padding-block-end': spacingVars['--spacing-5']},
  spacing6: {'--container-padding-block-end': spacingVars['--spacing-6']},
  spacing7: {'--container-padding-block-end': spacingVars['--spacing-7']},
  spacing8: {'--container-padding-block-end': spacingVars['--spacing-8']},
  spacing9: {'--container-padding-block-end': spacingVars['--spacing-9']},
  spacing10: {'--container-padding-block-end': spacingVars['--spacing-10']},
  spacing11: {'--container-padding-block-end': spacingVars['--spacing-11']},
  spacing12: {'--container-padding-block-end': spacingVars['--spacing-12']},
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

const maxHeightStyles = stylex.create({
  containerMaxHeight: (maxHeight: string) => ({
    '--container-max-height': maxHeight,
  }),
});

export interface ContainerOptions {
  /**
   * Shortcut to set all padding values at once.
   * Sets paddingOuterX, paddingOuterY, paddingInnerX, and paddingInnerY
   * to the same value. Individual properties override this when set.
   * @default 'spacing4'
   */
  padding?: SpacingToken;

  /**
   * Outer horizontal padding (left/right).
   * Sets --container-padding-inline and --layout-padding-outer-x CSS variables.
   * Overrides `padding` for the horizontal outer axis.
   */
  paddingOuterX?: SpacingToken;

  /**
   * Outer vertical padding (top/bottom).
   * Sets --container-padding-block-start, --container-padding-block-end, and --layout-padding-outer-y CSS variables.
   * Overrides `padding` for the vertical outer axis.
   */
  paddingOuterY?: SpacingToken;

  /**
   * Inner horizontal padding for content areas.
   * Sets --layout-padding-inner-x CSS variable.
   * Overrides `padding` for the horizontal inner axis.
   */
  paddingInnerX?: SpacingToken;

  /**
   * Inner vertical padding for content areas.
   * Sets --layout-padding-inner-y CSS variable.
   * Overrides `padding` for the vertical inner axis.
   */
  paddingInnerY?: SpacingToken;

  /**
   * When set to a component name ('card' | 'section'), internal layout
   * padding variables cascade from the component-specific public CSS
   * custom property (e.g. --xds-card-padding, --xds-section-padding)
   * instead of being set to explicit spacing token values.
   *
   * This allows themes to override container padding via component-specific
   * public CSS custom properties without touching internal vars.
   *
   * Used by Card and Section when no explicit padding prop is provided.
   * @default undefined (uses explicit spacing token values)
   */
  useThemeDefault?: ContainerComponent;

  /**
   * Maximum height constraint for the container.
   * Sets --container-max-height CSS variable that XDSLayout reads
   * to enable scroll containment in fill mode.
   * Accepts CSS length values (e.g., '75vh', '500px').
   */
  maxHeight?: string;
}

/**
 * StyleX utility to add layout container styles to any element.
 *
 * Sets CSS variables for padding that child layout components read:
 * - `--container-padding-inline` — Inline padding for edge compensation and bleed
 * - `--container-padding-block-start` / `--container-padding-block-end` — Block padding for vertical bleed
 * - `--layout-padding-outer-x`, `--layout-padding-outer-y` (internal)
 * - `--layout-padding-inner-x`, `--layout-padding-inner-y` (internal)
 *
 * Themes should use `--xds-card-padding` or `--xds-section-padding` in
 * component overrides to adjust padding. Do not reference
 * `--layout-padding-*` variables directly.
 *
 * @example
 * ```
 * import { container } from '@xds/core/Layout';
 * import * as stylex from '@stylexjs/stylex';
 *
 * // Card container with default padding (theme-overridable via --xds-card-padding)
 * <div {...stylex.props(...container({ useThemeDefault: 'card' }))}>
 *   <XDSLayout ... />
 * </div>
 *
 * // Uniform padding
 * <div {...stylex.props(...container({ padding: 'spacing3' }))}>
 *   <XDSLayout ... />
 * </div>
 *
 * // Asymmetric — padding as base, paddingOuterY overrides vertical
 * <div {...stylex.props(
 *   ...container({ padding: 'spacing3', paddingOuterY: 'spacing2' }),
 *   customStyles.card
 * )}>
 *   <XDSLayout ... />
 * </div>
 * ```
 */
export function container({
  padding = 'spacing4',
  paddingOuterX,
  paddingOuterY,
  paddingInnerX,
  paddingInnerY,
  useThemeDefault,
  maxHeight,
}: ContainerOptions) {
  const outerX = paddingOuterX ?? padding;
  const outerY = paddingOuterY ?? padding;
  const innerX = paddingInnerX ?? padding;
  const innerY = paddingInnerY ?? padding;

  const maxHeightStyle = maxHeight
    ? maxHeightStyles.containerMaxHeight(maxHeight)
    : null;

  // When useThemeDefault is a component name, cascade from the component's
  // public CSS custom property (e.g. --xds-card-padding, --xds-section-padding)
  // so themes can override each component's padding independently.
  if (useThemeDefault) {
    const defaults = themeDefaultStyles[useThemeDefault];
    return [
      baseStyles.container,
      defaults.containerPaddingInline,
      defaults.containerPaddingBlockStart,
      defaults.containerPaddingBlockEnd,
      defaults.layoutPaddingOuterX,
      defaults.layoutPaddingOuterY,
      defaults.layoutPaddingInnerX,
      defaults.layoutPaddingInnerY,
      maxHeightStyle,
    ] as const;
  }

  return [
    baseStyles.container,
    containerPaddingInlineStyles[outerX],
    containerPaddingBlockStartStyles[outerY],
    containerPaddingBlockEndStyles[outerY],
    paddingOuterXStyles[outerX],
    paddingOuterYStyles[outerY],
    paddingInnerXStyles[innerX],
    paddingInnerYStyles[innerY],
    maxHeightStyle,
  ] as const;
}
