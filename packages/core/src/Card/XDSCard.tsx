'use client';

/**
 * @file XDSCard.tsx
 * @input Uses container utility, StyleX
 * @output Exports XDSCard component and XDSCardProps
 * @position Core card container component
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Card/Card.doc.mjs (props table, features)
 * - /packages/core/src/Card/index.ts (exports if types change)
 * - /apps/storybook/stories/Card.stories.tsx (storybook stories)
 */

import {type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {borderVars, colorVars, radiusVars} from '../theme/tokens.stylex';
import {container} from '../Layout/container.stylex';
import type {SpacingToken} from '../Layout/container.stylex';
import {
  paddingStyles,
  containerPaddingInlineVarStyles,
  containerPaddingBlockStartVarStyles,
  containerPaddingBlockEndVarStyles,
  spacingStepToToken,
} from '../Layout/padding.stylex';
import type {SizeValue, SpacingStep} from '../utils/types';
import {xdsClassName, mergeProps} from '../utils';
import type {XDSBaseProps} from '../XDSBaseProps';

// =============================================================================
// Variant type
// =============================================================================

/**
 * Background color variant for XDSCard.
 * - `default`: the standard card background (`--color-background-card`)
 * - `muted`: subtle muted background (`--color-background-muted`) for de-emphasised cards
 * - Non-semantic palette: `blue | cyan | gray | green | orange | pink | purple | red | teal | yellow`
 *   Each uses the corresponding `--color-background-<name>` token (20% opacity tint).
 *
 * Non-default variants have no border — the background provides its own visual separation.
 */
export type XDSCardVariant =
  | 'default'
  | 'muted'
  | 'blue'
  | 'cyan'
  | 'gray'
  | 'green'
  | 'orange'
  | 'pink'
  | 'purple'
  | 'red'
  | 'teal'
  | 'yellow';

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  card: {
    '--card-radius': radiusVars['--radius-container'],
    borderRadius: 'var(--card-radius)',
    overflow: 'clip',
  },
  withBorder: {
    borderWidth: borderVars['--border-width'],
    borderStyle: 'solid',
    borderColor: colorVars['--color-border-emphasized'],
  },
  // Fixed-height cards scroll content; overflow: auto also clips to border-radius
  scrollable: {
    overflow: 'auto',
  },
});

// Background variant styles — each maps to a design token
const variantStyles = stylex.create({
  default: {
    backgroundColor: colorVars['--color-background-card'],
  },
  muted: {
    backgroundColor: colorVars['--color-background-muted'],
  },
  blue: {
    backgroundColor: colorVars['--color-background-blue'],
  },
  cyan: {
    backgroundColor: colorVars['--color-background-cyan'],
  },
  gray: {
    backgroundColor: colorVars['--color-background-gray'],
  },
  green: {
    backgroundColor: colorVars['--color-background-green'],
  },
  orange: {
    backgroundColor: colorVars['--color-background-orange'],
  },
  pink: {
    backgroundColor: colorVars['--color-background-pink'],
  },
  purple: {
    backgroundColor: colorVars['--color-background-purple'],
  },
  red: {
    backgroundColor: colorVars['--color-background-red'],
  },
  teal: {
    backgroundColor: colorVars['--color-background-teal'],
  },
  yellow: {
    backgroundColor: colorVars['--color-background-yellow'],
  },
});

// Dynamic styles for sizing props
const dynamicStyles = stylex.create({
  sizing: (
    width: SizeValue | null,
    height: SizeValue | null,
    maxWidth: SizeValue | null,
    minHeight: SizeValue | null,
  ) => ({
    width,
    height,
    maxWidth,
    minHeight,
  }),
});

export type {SizeValue} from '../utils/types';

export interface XDSCardProps extends XDSBaseProps<HTMLDivElement> {
  ref?: React.Ref<HTMLDivElement>;
  /**
   * CSS class name(s) appended to the root element.
   */
  className?: string;
  /**
   * Inline styles to apply to the root element.
   */
  style?: React.CSSProperties;
  /**
   * Width of the card.
   * Numbers are treated as pixels, strings are used as-is.
   */
  width?: SizeValue;

  /**
   * Height of the card.
   * Numbers are treated as pixels, strings are used as-is.
   */
  height?: SizeValue;

  /**
   * Maximum width of the card.
   * Numbers are treated as pixels, strings are used as-is.
   */
  maxWidth?: SizeValue;

  /**
   * Minimum height of the card.
   * Numbers are treated as pixels, strings are used as-is.
   */
  minHeight?: SizeValue;

  /**
   * Content to render inside the card.
   * Should typically be XDSLayout child components.
   */
  children?: ReactNode;

  /**
   * Internal padding of the card using the spacing scale.
   * Accepts numeric spacing steps: 0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10.
   * @default 4 (16px)
   */
  padding?: SpacingStep;

  /**
   * Background color variant.
   * - `default`: standard card background with border
   * - `muted`: subtle muted background for de-emphasised cards (no border)
   * - Non-semantic: `blue`, `cyan`, `gray`, `green`, `orange`, `pink`, `purple`, `red`, `teal`, `yellow` (no border)
   * @default 'default'
   */
  variant?: XDSCardVariant;
}

/**
 * A card container with border and themed styling.
 *
 * Applies card-specific appearance (background, border, border-radius)
 * and sets CSS variables for child layout components.
 *
 * @compositionHint Use as a top-level container for elevated content.
 * Pair with XDSLayout for structured header/content/footer layouts.
 *
 * @example
 * ```
 * <XDSCard width={400} height={300}>
 *   <XDSLayout
 *     header={<XDSLayoutHeader hasDivider>Title</XDSLayoutHeader>}
 *     content={<XDSLayoutContent>Content</XDSLayoutContent>}
 *     footer={<XDSLayoutFooter hasDivider>Actions</XDSLayoutFooter>}
 *   />
 * </XDSCard>
 * ```
 *
 * @example
 * ```
 * <XDSCard variant="blue" width={300}>
 *   <p>Blue tinted card</p>
 * </XDSCard>
 * ```
 *
 * @example
 * ```
 * <XDSCard variant="muted" width={300}>
 *   <p>Subtle de-emphasised card</p>
 * </XDSCard>
 * ```
 */
export function XDSCard({
  width,
  height,
  maxWidth,
  minHeight,
  children,
  padding,
  variant = 'default',
  xstyle,
  className,
  style,
  ref,
  ...props
}: XDSCardProps) {
  // Only enable scrolling when card has a fixed height (not null/undefined and not "auto")
  const hasFixedHeight = height != null && height !== 'auto';

  // When no explicit padding prop, use theme default (set via container tokens)
  const useThemeDefault = padding == null;
  const effectivePadding = padding ?? 4;
  const paddingToken = spacingStepToToken[effectivePadding] as SpacingToken;

  return (
    <div
      ref={ref}
      {...mergeProps(
        xdsClassName('card', {variant}),
        stylex.props(
          styles.card,
          variantStyles[variant],
          variant === 'default' && styles.withBorder,
          hasFixedHeight && styles.scrollable,
          dynamicStyles.sizing(
            width ?? null,
            height ?? null,
            maxWidth ?? null,
            minHeight ?? null,
          ),
          ...container(
            useThemeDefault
              ? {useThemeDefault: 'card'}
              : {
                  paddingInnerX: paddingToken,
                  paddingInnerY: paddingToken,
                  paddingOuterX: paddingToken,
                  paddingOuterY: paddingToken,
                },
          ),
          !useThemeDefault &&
            effectivePadding !== 4 &&
            paddingStyles[effectivePadding],
          !useThemeDefault &&
            effectivePadding !== 4 &&
            containerPaddingInlineVarStyles[effectivePadding],
          !useThemeDefault &&
            effectivePadding !== 4 &&
            containerPaddingBlockStartVarStyles[effectivePadding],
          !useThemeDefault &&
            effectivePadding !== 4 &&
            containerPaddingBlockEndVarStyles[effectivePadding],
          xstyle,
        ),
        className,
        style,
      )}
      {...props}>
      {children}
    </div>
  );
}

XDSCard.displayName = 'XDSCard';
