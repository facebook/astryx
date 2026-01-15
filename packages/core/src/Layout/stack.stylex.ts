/**
 * @file stack.stylex.ts
 * @input Uses @stylexjs/stylex
 * @output StyleX utility for stack (flex container) styling
 * @position Layout utility; used by XDSHStack, XDSVStack components
 *
 * SYNC: When modified, update /packages/core/src/Layout/README.md
 */

import * as stylex from '@stylexjs/stylex';

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
 * Dynamic gap styles using StyleX's support for dynamic values.
 * Gap is passed as a number (pixels) and converted to a style.
 */
const gapStyles = stylex.create({
  gap: (value: number) => ({
    columnGap: value,
    rowGap: value,
  }),
});

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
   * Spacing between items in pixels.
   * Accepts any number value.
   * @default 0
   */
  gap?: number;

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
 * <div {...stylex.props(...stack({ direction: 'horizontal', gap: 8 }))}>
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
 * // Wrapping horizontal stack
 * <div {...stylex.props(...stack({ direction: 'horizontal', gap: 8, wrap: 'wrap' }))}>
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
    gap != null && gapStyles.gap(gap),
    crossAlign != null && alignItemsStyles[crossAlign],
    wrap != null && wrapStyles[wrap],
  ] as const;
}
