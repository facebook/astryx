/**
 * @file stack.stylex.ts
 * @input Uses @stylexjs/stylex, spacingTokens from theme
 * @output StyleX utility for stack (flex container) styling
 * @position Layout utility; used by XDSHStack, XDSVStack components
 *
 * SYNC: When modified, update /packages/core/src/Layout/README.md
 */

import * as stylex from '@stylexjs/stylex';
import { spacingTokens } from '../../theme/tokens.stylex';

const alignItemsStyles = stylex.create({
  center: {
    alignItems: 'center',
  },
  end: {
    alignItems: 'flex-end',
  },
  start: {
    alignItems: 'flex-start',
  },
  stretch: {
    alignItems: 'stretch',
  },
});

/**
 * Cross-axis alignment options for stack items.
 * - For HStack: vertical alignment
 * - For VStack: horizontal alignment
 */
export type StackCrossAlignment = keyof typeof alignItemsStyles;

const directionStyles = stylex.create({
  horizontal: {
    flexDirection: 'row',
  },
  vertical: {
    flexDirection: 'column',
  },
});

/**
 * Stack direction.
 * - `horizontal`: Items flow left-to-right (HStack)
 * - `vertical`: Items flow top-to-bottom (VStack)
 */
export type StackDirection = keyof typeof directionStyles;

const wrapStyles = stylex.create({
  nowrap: {
    flexWrap: 'nowrap',
  },
  wrap: {
    flexWrap: 'wrap',
  },
  'wrap-reverse': {
    flexWrap: 'wrap-reverse',
  },
});

/**
 * Flex wrap behavior.
 * - `nowrap`: Items stay on one line (default)
 * - `wrap`: Items wrap to next line
 * - `wrap-reverse`: Items wrap to previous line
 */
export type StackWrap = keyof typeof wrapStyles;

const baseStyles = stylex.create({
  stack: {
    display: 'flex',
  },
});

/**
 * Gap styles using spacing tokens from the theme.
 * Keys match spacing token names for clarity.
 */
const gapStyles = stylex.create({
  space0: {
    columnGap: spacingTokens.space0,
    rowGap: spacingTokens.space0,
  },
  'space0.5': {
    columnGap: spacingTokens.space0_5,
    rowGap: spacingTokens.space0_5,
  },
  space1: {
    columnGap: spacingTokens.space1,
    rowGap: spacingTokens.space1,
  },
  space2: {
    columnGap: spacingTokens.space2,
    rowGap: spacingTokens.space2,
  },
  space3: {
    columnGap: spacingTokens.space3,
    rowGap: spacingTokens.space3,
  },
  space4: {
    columnGap: spacingTokens.space4,
    rowGap: spacingTokens.space4,
  },
  space5: {
    columnGap: spacingTokens.space5,
    rowGap: spacingTokens.space5,
  },
  space6: {
    columnGap: spacingTokens.space6,
    rowGap: spacingTokens.space6,
  },
  space7: {
    columnGap: spacingTokens.space7,
    rowGap: spacingTokens.space7,
  },
});

/**
 * Spacing token names for gap values.
 * These match the theme's spacing token names.
 */
export type SpacingScale = keyof typeof gapStyles;

export interface StackOptions {
  /**
   * Position of items along the cross-axis.
   * - For HStack: vertical alignment
   * - For VStack: horizontal alignment
   */
  crossAlign?: StackCrossAlignment;

  /**
   * Direction of the stack.
   */
  direction: StackDirection;

  /**
   * Spacing between items using theme spacing tokens.
   * Use token names: 'space0', 'space1', 'space2', etc.
   */
  gap?: SpacingScale;

  /**
   * Whether items should wrap to the next line.
   * - `nowrap`: Items stay on one line (default)
   * - `wrap`: Items wrap to next line
   * - `wrap-reverse`: Items wrap to previous line
   * @default 'nowrap'
   */
  wrap?: StackWrap;
}

/**
 * StyleX utility to add stack (flex container) styles to any element.
 *
 * @example
 * ```tsx
 * import { stack } from '@xds/core/Layout';
 * import * as stylex from '@stylexjs/stylex';
 *
 * // Horizontal stack with gap
 * <div {...stylex.props(...stack({ direction: 'horizontal', gap: 'space2' }))}>
 *   <Child />
 *   <Child />
 * </div>
 *
 * // Vertical stack with centered items
 * <div {...stylex.props(...stack({ direction: 'vertical', crossAlign: 'center' }))}>
 *   <Child />
 *   <Child />
 * </div>
 *
 * // Wrapping horizontal stack with larger gap
 * <div {...stylex.props(...stack({ direction: 'horizontal', gap: 'space4', wrap: 'wrap' }))}>
 *   <Child />
 *   <Child />
 *   <Child />
 * </div>
 * ```
 */
export function stack({
  crossAlign,
  direction,
  gap,
  wrap,
}: StackOptions) {
  return [
    baseStyles.stack,
    directionStyles[direction],
    gap != null && gapStyles[gap],
    crossAlign != null && alignItemsStyles[crossAlign],
    wrap != null && wrapStyles[wrap],
  ] as const;
}
