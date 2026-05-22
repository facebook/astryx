// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file XDSHeading.tsx
 * @input Uses React, HTMLAttributes, ReactNode
 * @output Exports XDSHeading component, XDSHeadingProps, XDSHeadingLevel types
 * @position Core implementation; consumed by index.ts, tested by XDSHeading.test.tsx
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Text/Text.doc.mjs (props table, features, implementation notes)
 * - /packages/core/src/Text/XDSHeading.test.tsx (tests for new/changed behavior)
 * - /packages/core/src/Text/index.ts (exports if types change)
 * - /apps/storybook/stories/Text.stories.tsx (storybook stories)
 * - /packages/cli/templates/blocks/components/Text/ (showcase blocks)
 */

import {lazy, Suspense, useRef, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {
  XDSTextColor,
  XDSTextDisplay,
  XDSWordBreak,
  XDSTextWrap,
} from '../theme/types';
import {
  colorStyles,
  sizeByLevelStyles,
  sizeByTypeStyles,
  defaultWeightByTypeStyles,
  displayStyles,
  truncationStyles,
  wordBreakStyles,
  textWrapStyles,
  capsizeStyles,
  decorationStyles,
  truncationTooltipStyles,
} from './text.stylex';
import {useTruncation} from './useTruncation';
import type {LayerPlacement} from '../Layer';
import {xdsClassName, mergeProps, mergeRefs} from '../utils';
import type {XDSBaseProps} from '../XDSBaseProps';

const LazyXDSTooltip = lazy(() =>
  import('../Tooltip/XDSTooltip').then(mod => ({default: mod.XDSTooltip})),
);

/**
 * Heading level (1-6). Determines both visual styling and semantic HTML element.
 */
export type XDSHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

/**
 * Display type variants for headings. Applies display-scale sizing
 * (larger, lighter) while preserving the semantic heading element.
 */
export type XDSHeadingType = 'display-1' | 'display-2' | 'display-3';

export interface XDSHeadingProps extends Omit<
  XDSBaseProps<HTMLHeadingElement>,
  'children'
> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLHeadingElement>;
  /**
   * Heading level (1-6). Determines the semantic HTML element (h1–h6).
   * Also determines visual styling unless `type` is set.
   */
  level: XDSHeadingLevel;

  /**
   * Display type variant. When set, overrides the visual styling from `level`
   * with display-scale sizing (larger, lighter weight, tighter line-height).
   * The `level` still determines the HTML element for accessibility.
   *
   * Use for hero banners, marketing headlines, and data callouts that need
   * heading semantics.
   *
   * @example
   * ```
   * <XDSHeading level={1} type="display-1">Hero Title</XDSHeading>
   * <XDSHeading level={2} type="display-2">$1.2M Revenue</XDSHeading>
   * ```
   */
  type?: XDSHeadingType;

  /**
   * Accessibility level override. When set, the `aria-level` will differ
   * from the visual `level`. Use this when the visual hierarchy doesn't
   * match the document outline (e.g., sidebar headings, reused components).
   *
   * @default Same as `level`
   *
   * @example
   * ```
   * <XDSHeading level={2} accessibilityLevel={3}>Sidebar Section</XDSHeading>
   * ```
   */
  accessibilityLevel?: XDSHeadingLevel;

  /**
   * Text color.
   * @default 'primary'
   */
  color?: XDSTextColor;

  /**
   * Display type. Headings default to block.
   * Note: Silently overridden to 'block' when maxLines > 0 or hasCapsize is true.
   * @default 'block'
   */
  display?: XDSTextDisplay;

  /**
   * Maximum lines before truncation. 0 = no truncation.
   * When set, shows tooltip on hover if content is truncated.
   * @default 0
   */
  maxLines?: number;

  /**
   * Control tooltip behavior for truncated text.
   * - `true` (default when maxLines > 0): show tooltip at default position
   * - `false`: disable tooltip
   * - Position value: show tooltip at specific position
   * @default true
   */
  hasTruncateTooltip?: boolean | LayerPlacement;

  /**
   * Word break behavior for truncated text.
   * @default 'break-all' for maxLines=1, 'break-word' otherwise
   */
  wordBreak?: XDSWordBreak;

  /**
   * Text wrapping behavior.
   */
  textWrap?: XDSTextWrap;

  /**
   * Enable optical alignment (text-box-trim).
   * Forces block display.
   * @default false
   */
  hasCapsize?: boolean;

  /**
   * Strikethrough decoration.
   * @default false
   */
  hasStrikethrough?: boolean;

  /**
   * Heading content
   */
  children: ReactNode;
}

const levelToTag = {
  1: 'h1',
  2: 'h2',
  3: 'h3',
  4: 'h4',
  5: 'h5',
  6: 'h6',
} as const;

/**
 * XDSHeading - Semantic heading component
 *
 * Renders headings with semantic HTML (h1-h6) and themed styling.
 *
 * @example
 * ```
 * <XDSHeading level={1}>Page Title</XDSHeading>
 * <XDSHeading level={2}>Section</XDSHeading>
 * <XDSHeading level={2} accessibilityLevel={3}>Sidebar Section</XDSHeading>
 * <XDSHeading level={1} type="display-1">Hero Title</XDSHeading>
 * <XDSHeading level={2} type="display-2">$1.2M Revenue</XDSHeading>
 * <XDSHeading level={2} maxLines={1}>Very Long Section Title...</XDSHeading>
 * <XDSHeading level={3} color="secondary">Muted Heading</XDSHeading>
 * ```
 */
export function XDSHeading({
  level,
  type,
  accessibilityLevel,
  color = 'primary',
  display = 'block',
  maxLines = 0,
  hasTruncateTooltip = true,
  wordBreak,
  textWrap,
  hasCapsize = false,
  hasStrikethrough = false,
  xstyle,
  className,
  style,
  children,
  ref,
  ...props
}: XDSHeadingProps) {
  const Component = levelToTag[level];

  // If accessibilityLevel differs from visual level, use aria-level
  const ariaProps =
    accessibilityLevel && accessibilityLevel !== level
      ? {'aria-level': accessibilityLevel}
      : {};

  // Resolve wordBreak with smart default
  const resolvedWordBreak =
    wordBreak ?? (maxLines === 1 ? 'break-all' : 'break-word');

  // Resolve display - force block when maxLines > 0 or hasCapsize
  const resolvedDisplay = maxLines > 0 || hasCapsize ? 'block' : display;

  // Truncation detection
  const truncation = useTruncation({maxLines});

  // Tooltip for truncated text
  const tooltipPlacement: LayerPlacement =
    typeof hasTruncateTooltip === 'string' ? hasTruncateTooltip : 'above';
  const tooltipEnabled =
    maxLines > 0 && hasTruncateTooltip !== false && truncation.isTruncated;

  // Ref for the heading element (used as tooltip anchor)
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Build inline style for -webkit-line-clamp (dynamic value)
  const inlineStyle = maxLines > 1 ? {WebkitLineClamp: maxLines} : undefined;

  return (
    <>
      <Component
        ref={mergeRefs(ref, truncation.ref, headingRef)}
        {...mergeProps(
          xdsClassName('heading', {level, color, ...(type && {type})}),
          stylex.props(
            colorStyles[color],
            type ? sizeByTypeStyles[type] : sizeByLevelStyles[level],
            type && defaultWeightByTypeStyles[type],
            // Display: use truncation styles when maxLines > 0
            maxLines === 1
              ? truncationStyles.singleLine
              : maxLines > 1
                ? truncationStyles.multiLine
                : displayStyles[resolvedDisplay],
            // Word break when truncating
            maxLines > 0 && wordBreakStyles[resolvedWordBreak],
            // Text wrap
            textWrap && textWrapStyles[textWrap],
            // Capsize
            hasCapsize && capsizeStyles.enabled,
            // Decorations
            hasStrikethrough && decorationStyles.strikethrough,
            // User xstyle
            xstyle,
          ),
          className,
          {...style, ...inlineStyle},
        )}
        title={tooltipEnabled ? truncation.fullText : undefined}
        {...ariaProps}
        {...props}>
        {children}
      </Component>
      {tooltipEnabled && (
        <Suspense fallback={null}>
          <LazyXDSTooltip
            anchorRef={headingRef}
            content={
              <span {...stylex.props(truncationTooltipStyles.content)}>
                {truncation.fullText}
              </span>
            }
            placement={tooltipPlacement}
          />
        </Suspense>
      )}
    </>
  );
}

XDSHeading.displayName = 'XDSHeading';
