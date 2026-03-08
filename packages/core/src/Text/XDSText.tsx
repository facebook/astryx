/**
 * @file XDSText.tsx
 * @input Uses React forwardRef, HTMLAttributes, ReactNode
 * @output Exports XDSText component, XDSTextProps, XDSTextType, XDSTextSize types
 * @position Core implementation; consumed by index.ts, tested by XDSText.test.tsx
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Text/Text.doc.mjs (props table, features, implementation notes)
 * - /packages/core/src/Text/XDSText.test.tsx (tests for new/changed behavior)
 * - /packages/core/src/Text/index.ts (exports if types change)
 * - /apps/storybook/stories/Text.stories.tsx (storybook stories)
 */

'use client';

import {
  forwardRef,
  lazy,
  Suspense,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';
import type {
  XDSTextType,
  XDSTextSize,
  XDSTextColor,
  XDSTextWeight,
  XDSTextDisplay,
  XDSWordBreak,
  XDSTextWrap,
} from '../theme/types';
import {
  colorStyles,
  weightStyles,
  displayStyles,
  truncationStyles,
  wordBreakStyles,
  textWrapStyles,
  capsizeStyles,
  decorationStyles,
  tabularNumbersStyle,
  truncationTooltipStyles,
} from './text.stylex';
import {useTruncation} from './useTruncation';
import type {LayerPlacement} from '../Layer';
import {xdsClassName, mergeProps} from '../utils';

const LazyXDSTooltip = lazy(() =>
  import('../Layer/XDSTooltip').then(mod => ({default: mod.XDSTooltip})),
);

export type {XDSTextType, XDSTextSize};

export interface XDSTextProps {
  /**
   * Semantic text type. Determines size, weight, and line-height from theme.
   * Required to ensure semantic usage.
   */
  type: XDSTextType;

  /**
   * Explicit font size override. When set, overrides the size from `type`
   * but preserves other type properties (font-family, default color).
   *
   * ⚠️ Lint rule: Prefer using `type` alone. Use `size` only for custom
   * UI elements that need explicit size control (metrics, callouts).
   */
  size?: XDSTextSize;

  /**
   * Text color. Defaults vary by type:
   * - 'supporting' → 'secondary'
   * - others → 'primary'
   */
  color?: XDSTextColor;

  /**
   * Font weight override.
   */
  weight?: XDSTextWeight;

  /**
   * Display type. Text defaults to inline.
   * Note: Silently overridden to 'block' when maxLines > 0 or hasCapsize is true.
   * @default 'inline'
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
   * Use tabular (monospace) numbers for alignment.
   * @default false
   */
  hasTabularNumbers?: boolean;

  /**
   * Constrained styles for layout integration.
   * Allows margins, width constraints, flex child props, text alignment.
   * Typography properties (fontSize, fontWeight, color, etc.) should NOT be used.
   */
  xstyle?: StyleXStyles;

  /**
   * Text content
   */
  children: ReactNode;

  /**
   * HTML element to render
   * @default 'span'
   */
  as?: 'span' | 'p' | 'div' | 'label';

  'data-testid'?: string;
  id?: string;
}

// Default color by text type
const defaultColorByType: Record<XDSTextType, XDSTextColor> = {
  body: 'primary',
  large: 'primary',
  label: 'primary',
  supporting: 'secondary',
  code: 'primary',
};

/**
 * Semantic text component. Renders text with type-based styling from the theme.
 *
 * @example
 * ```
 * <XDSText type="body">Body text</XDSText>
 * <XDSText type="large">Large body text</XDSText>
 * <XDSText type="label">Form label</XDSText>
 * <XDSText type="supporting">Helper text</XDSText>
 * <XDSText type="code">{'const x = 1;'}</XDSText>
 * <XDSText type="body" maxLines={2}>Clamped text</XDSText>
 * <XDSText type="body" color="secondary" weight="bold">Styled text</XDSText>
 * ```
 */
export const XDSText = forwardRef<HTMLElement, XDSTextProps>(function XDSText(
  {
    type,
    size: _size,
    color,
    weight,
    display = 'inline',
    maxLines = 0,
    hasTruncateTooltip = true,
    wordBreak,
    textWrap,
    hasCapsize = false,
    hasStrikethrough = false,
    hasTabularNumbers = false,
    xstyle,
    as: Component = 'span',
    children,
    ...props
  },
  forwardedRef,
) {
  // Resolve color with type-based default
  const resolvedColor = color ?? defaultColorByType[type];

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

  // Ref for the text element (used as tooltip anchor)
  const textRef = useRef<HTMLElement>(null);

  // Merge refs: forwardedRef, truncation.ref, textRef
  const mergedRef = useCallback(
    (element: HTMLElement | null) => {
      // Forward ref
      if (typeof forwardedRef === 'function') {
        forwardedRef(element);
      } else if (forwardedRef) {
        forwardedRef.current = element;
      }
      // Truncation ref
      truncation.ref(element);
      // Local ref for tooltip anchor
      (textRef as React.MutableRefObject<HTMLElement | null>).current = element;
    },
    [forwardedRef, truncation.ref],
  );

  // Build inline style for -webkit-line-clamp (dynamic value)
  const inlineStyle = maxLines > 1 ? {WebkitLineClamp: maxLines} : undefined;

  return (
    <>
      <Component
        ref={mergedRef}
        {...mergeProps(
          xdsClassName('text', {type}),
          stylex.props(
            colorStyles[resolvedColor],
            weight && weightStyles[weight],
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
            hasTabularNumbers && tabularNumbersStyle.enabled,
            // User xstyle
            xstyle,
          ),
        )}
        style={inlineStyle}
        title={tooltipEnabled ? truncation.fullText : undefined}
        {...props}>
        {children}
      </Component>
      {tooltipEnabled && (
        <Suspense fallback={null}>
          <LazyXDSTooltip
            anchorRef={textRef}
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
});

XDSText.displayName = 'XDSText';
