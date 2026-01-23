/**
 * @file XDSCard.tsx
 * @input Uses container utility, StyleX, ThemeContext
 * @output Exports XDSCard component and XDSCardProps
 * @position Higher-order container component for card layouts
 */

import {forwardRef, useContext, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {colorVars, radiusVars, elevationVars} from '../../theme/tokens.stylex';
import {ThemeContext} from '../../theme/ThemeContext';
import type {StyleXStyles as ThemeStyleXStyles} from '../../theme/types';
import {container} from './container.stylex';

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
    backgroundColor: colorVars['--color-card'],
    borderRadius: radiusVars['--radius-container'],
    boxShadow: elevationVars['--elevation-base'],
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
 * A card container with elevation and themed styling.
 *
 * Applies card-specific appearance (background, shadow, border-radius)
 * and sets CSS variables for child layout components.
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
  function XDSCard(
    {width, height, maxWidth, minHeight, children, ...props},
    ref,
  ) {
    // Get theme context for component-level overrides
    const themeContext = useContext(ThemeContext);
    const themeOverride = themeContext?.theme.components?.card?.base;

    return (
      <div
        ref={ref}
        {...stylex.props(
          ...container({
            paddingInnerX: 'spacing4',
            paddingInnerY: 'spacing4',
            paddingOuterX: 'spacing4',
            paddingOuterY: 'spacing4',
          }),
          styles.card,
          themeOverride,
          dynamicStyles.sizing(
            width ?? null,
            height ?? null,
            maxWidth ?? null,
            minHeight ?? null,
          ),
        )}
        {...props}>
        {children}
      </div>
    );
  },
);

XDSCard.displayName = 'XDSCard';
