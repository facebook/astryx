/**
 * @file XDSCard.tsx
 * @input Uses XDSLayoutContainer, StyleX, ThemeContext
 * @output Exports XDSCard component and XDSCardProps
 * @position Higher-order container component for card layouts
 */

import { forwardRef, useContext, type ReactNode, type CSSProperties } from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  colorTokens,
  radiusTokens,
  elevationTokens,
} from '../../theme/tokens.stylex';
import { ThemeContext } from '../../theme/ThemeContext';
import type { StyleXStyles as ThemeStyleXStyles } from '../../theme/types';
import { XDSLayoutContainer } from './XDSLayoutContainer';

// =============================================================================
// Module Augmentation - Register XDSCard's themeable properties
// =============================================================================

declare module '../../theme/types' {
  interface ComponentStyles {
    card?: {
      /** Base style overrides */
      base?: ThemeStyleXStyles;
    };
  }
}

const styles = stylex.create({
  card: {
    backgroundColor: colorTokens.card,
    borderRadius: radiusTokens.container,
    boxShadow: elevationTokens.base,
  },
});

/**
 * Size value type - accepts numbers (treated as pixels) or strings (e.g., '100%', '50vh')
 */
export type SizeValue = number | string;

export interface XDSCardProps {
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
}

/**
 * Converts a size value to a CSS-compatible string.
 */
function formatSize(value: SizeValue | undefined): string | undefined {
  if (value === undefined) return undefined;
  return typeof value === 'number' ? `${value}px` : value;
}

/**
 * A card container with elevation and themed styling.
 *
 * Uses XDSLayoutContainer internally and applies card-specific
 * appearance (background, shadow, border-radius).
 *
 * @example
 * ```tsx
 * <XDSCard width={400} height={300}>
 *   <XDSLayout
 *     header={<XDSLayoutHeader hasDivider>Title</XDSLayoutHeader>}
 *     content={<XDSLayoutContent>Content</XDSLayoutContent>}
 *     footer={<XDSLayoutFooter hasDivider>Actions</XDSLayoutFooter>}
 *   />
 * </XDSCard>
 * ```
 */
export const XDSCard = forwardRef<HTMLDivElement, XDSCardProps>(
  function XDSCard({ width, height, maxWidth, minHeight, children, ...props }, ref) {
    // Get theme context for component-level overrides
    const themeContext = useContext(ThemeContext);
    const themeOverride = themeContext?.theme.components?.card?.base;

    // Build inline style for sizing props
    const sizeStyle: CSSProperties = {};
    if (width !== undefined) sizeStyle.width = formatSize(width);
    if (height !== undefined) sizeStyle.height = formatSize(height);
    if (maxWidth !== undefined) sizeStyle.maxWidth = formatSize(maxWidth);
    if (minHeight !== undefined) sizeStyle.minHeight = formatSize(minHeight);

    return (
      <XDSLayoutContainer
        ref={ref}
        xstyle={[styles.card, themeOverride]}
        style={sizeStyle}
        paddingInnerX="space4"
        paddingInnerY="space4"
        paddingOuterX="space4"
        paddingOuterY="space4"
        {...props}
      >
        {children}
      </XDSLayoutContainer>
    );
  }
);

XDSCard.displayName = 'XDSCard';
