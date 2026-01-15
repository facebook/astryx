/**
 * @file XDSSection.tsx
 * @input Uses XDSLayoutContainer, StyleX, ThemeContext
 * @output Exports XDSSection component and XDSSectionProps
 * @position Higher-order container component for section layouts
 */

import { forwardRef, useContext, type ReactNode, type CSSProperties } from 'react';
import * as stylex from '@stylexjs/stylex';
import { colorTokens } from '../../theme/tokens.stylex';
import { ThemeContext } from '../../theme/ThemeContext';
import type { StyleXStyles as ThemeStyleXStyles } from '../../theme/types';
import { XDSLayoutContainer } from './XDSLayoutContainer';
import type { SizeValue } from './XDSCard';

/**
 * Visual variant for the section.
 */
export type XDSSectionVariant = 'section' | 'transparent' | 'wash';

// =============================================================================
// Module Augmentation - Register XDSSection's themeable properties
// =============================================================================

declare module '../../theme/types' {
  interface ComponentStyles {
    section?: {
      /** Style overrides for each variant */
      variants?: Partial<Record<XDSSectionVariant, ThemeStyleXStyles>>;
    };
  }
}

const variantStyles = stylex.create({
  section: {
    backgroundColor: colorTokens.surface,
  },
  transparent: {
    backgroundColor: 'transparent',
  },
  wash: {
    backgroundColor: colorTokens.wash,
  },
});

export interface XDSSectionProps {
  /**
   * Visual variant of the section.
   * - 'section': Surface background color
   * - 'transparent': Fully transparent background
   * - 'wash': Wash background color
   * @default 'section'
   */
  variant?: XDSSectionVariant;

  /**
   * Width of the section.
   * Numbers are treated as pixels, strings are used as-is.
   */
  width?: SizeValue;

  /**
   * Height of the section.
   * Numbers are treated as pixels, strings are used as-is.
   */
  height?: SizeValue;

  /**
   * Maximum width of the section.
   * Numbers are treated as pixels, strings are used as-is.
   */
  maxWidth?: SizeValue;

  /**
   * Minimum height of the section.
   * Numbers are treated as pixels, strings are used as-is.
   */
  minHeight?: SizeValue;

  /**
   * Content to render inside the section.
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
 * A section container with background variants.
 *
 * Uses XDSLayoutContainer internally and applies section-specific
 * appearance based on the variant prop.
 *
 * @example
 * ```tsx
 * <XDSSection variant="wash" width={300} height={250}>
 *   <XDSLayout
 *     content={<XDSLayoutContent>Content in wash section</XDSLayoutContent>}
 *   />
 * </XDSSection>
 * ```
 */
export const XDSSection = forwardRef<HTMLDivElement, XDSSectionProps>(
  function XDSSection(
    { variant = 'section', width, height, maxWidth, minHeight, children, ...props },
    ref
  ) {
    // Get theme context for component-level overrides
    const themeContext = useContext(ThemeContext);
    const themeVariantOverride = themeContext?.theme.components?.section?.variants?.[variant];

    // Build inline style for sizing props
    const sizeStyle: CSSProperties = {};
    if (width !== undefined) sizeStyle.width = formatSize(width);
    if (height !== undefined) sizeStyle.height = formatSize(height);
    if (maxWidth !== undefined) sizeStyle.maxWidth = formatSize(maxWidth);
    if (minHeight !== undefined) sizeStyle.minHeight = formatSize(minHeight);

    return (
      <XDSLayoutContainer
        ref={ref}
        xstyle={[variantStyles[variant], themeVariantOverride]}
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

XDSSection.displayName = 'XDSSection';
