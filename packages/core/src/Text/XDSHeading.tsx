/**
 * @file XDSHeading.tsx
 * @input Uses React forwardRef, HTMLAttributes, ReactNode
 * @output Exports XDSHeading component, XDSHeadingProps, XDSHeadingLevel, XDSHeadingVariant types
 * @position Core implementation; consumed by index.ts, tested by XDSHeading.test.tsx
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Text/README.md (props table, features, implementation notes)
 * - /packages/core/src/Text/XDSHeading.test.tsx (tests for new/changed behavior)
 * - /packages/core/src/Text/index.ts (exports if types change)
 * - /apps/storybook/stories/Text.stories.tsx (storybook stories)
 */

import {forwardRef, useCallback, useContext, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';
import {ThemeContext} from '../theme/ThemeContext';
import type {
  HeadingLevel,
  XDSTextColor,
  XDSTextDisplay,
  XDSWordBreak,
  XDSTextWrap,
} from '../theme/types';
import {
  colorStyles,
  displayStyles,
  truncationStyles,
  wordBreakStyles,
  textWrapStyles,
  capsizeStyles,
  decorationStyles,
  truncationTooltipStyles,
} from './text.stylex';
import {useTruncation} from './useTruncation';
import {useXDSTooltip, type LayerPlacement} from '../Layer';

/**
 * Heading level (1-6). Determines both visual styling and semantic HTML element.
 */
export type XDSHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

/**
 * Heading variant determines the size scale used
 */
export type XDSHeadingVariant = 'default' | 'editorial';

export interface XDSHeadingProps {
  /**
   * Visual heading level (1-6). Determines styling from theme.
   * Required to ensure intentional visual hierarchy.
   */
  level: XDSHeadingLevel;

  /**
   * Accessibility level override. When set, the `aria-level` will differ
   * from the visual `level`. Use this when the visual hierarchy doesn't
   * match the document outline (e.g., sidebar headings, reused components).
   *
   * @default Same as `level`
   *
   * @example
   * // Visually styled as h2, but semantically h3 in document outline
   * <XDSHeading level={2} accessibilityLevel={3}>Sidebar Section</XDSHeading>
   */
  accessibilityLevel?: XDSHeadingLevel;

  /**
   * Visual variant. Themes define different scales for each variant.
   * - 'default': Dense scale for internal tools (h1: 20px)
   * - 'editorial': Larger scale for content-heavy pages (h1: 32px)
   * @default 'default'
   */
  variant?: XDSHeadingVariant;

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
   * Constrained styles for layout integration.
   * Allows margins, width constraints, flex child props, text alignment.
   * Typography properties (fontSize, fontWeight, color, etc.) should NOT be used.
   */
  xstyle?: StyleXStyles;

  /**
   * Heading content
   */
  children: ReactNode;

  'data-testid'?: string;
  id?: string;
}

const levelToTag = {
  1: 'h1',
  2: 'h2',
  3: 'h3',
  4: 'h4',
  5: 'h5',
  6: 'h6',
} as const;

const levelToKey: Record<XDSHeadingLevel, HeadingLevel> = {
  1: 'h1',
  2: 'h2',
  3: 'h3',
  4: 'h4',
  5: 'h5',
  6: 'h6',
};

/**
 * XDSHeading - Semantic heading component
 *
 * Renders headings with semantic HTML (h1-h6) and themed styling.
 *
 * @example
 * ```tsx
 * <XDSHeading level={1}>Page Title</XDSHeading>
 * <XDSHeading level={2}>Section</XDSHeading>
 * <XDSHeading level={1} variant="editorial">Article Title</XDSHeading>
 * <XDSHeading level={2} accessibilityLevel={3}>Sidebar Section</XDSHeading>
 *
 * // With truncation
 * <XDSHeading level={2} maxLines={1}>Very Long Section Title...</XDSHeading>
 *
 * // With color
 * <XDSHeading level={3} color="secondary">Muted Heading</XDSHeading>
 * ```
 */
export const XDSHeading = forwardRef<HTMLHeadingElement, XDSHeadingProps>(
  function XDSHeading(
    {
      level,
      accessibilityLevel,
      variant = 'default',
      color = 'primary',
      display = 'block',
      maxLines = 0,
      hasTruncateTooltip = true,
      wordBreak,
      textWrap,
      hasCapsize = false,
      hasStrikethrough = false,
      xstyle,
      children,
      ...props
    },
    forwardedRef,
  ) {
    const themeContext = useContext(ThemeContext);
    const Component = levelToTag[level];
    const levelKey = levelToKey[level];

    const headingConfig = themeContext?.theme?.components?.heading;
    const headingStyles =
      variant === 'editorial'
        ? headingConfig?.editorialStyles
        : headingConfig?.styles;
    const levelStyle = headingStyles?.[levelKey];

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

    const tooltip = useXDSTooltip({
      placement: tooltipPlacement,
      isEnabled: tooltipEnabled,
    });

    // Merge refs: forwardedRef, truncation.ref, tooltip.ref
    const mergedRef = useCallback(
      (element: HTMLHeadingElement | null) => {
        // Forward ref
        if (typeof forwardedRef === 'function') {
          forwardedRef(element);
        } else if (forwardedRef) {
          forwardedRef.current = element;
        }
        // Truncation ref
        truncation.ref(element);
        // Tooltip ref
        tooltip.ref(element);
      },
      [forwardedRef, truncation.ref, tooltip.ref],
    );

    // Build inline style for -webkit-line-clamp (dynamic value)
    const inlineStyle = maxLines > 1 ? {WebkitLineClamp: maxLines} : undefined;

    return (
      <>
        <Component
          ref={mergedRef}
          {...stylex.props(
            levelStyle,
            colorStyles[color],
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
          )}
          style={inlineStyle}
          aria-describedby={tooltipEnabled ? tooltip.describedBy : undefined}
          {...ariaProps}
          {...props}>
          {children}
        </Component>
        {tooltipEnabled &&
          tooltip.renderTooltip(
            <span {...stylex.props(truncationTooltipStyles.content)}>
              {truncation.fullText}
            </span>,
          )}
      </>
    );
  },
);

XDSHeading.displayName = 'XDSHeading';
