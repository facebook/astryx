/**
 * @file XDSSection.tsx
 * @input Uses container utility, StyleX, ThemeContext
 * @output Exports XDSSection component and XDSSectionProps
 * @position Higher-order container component for section layouts
 */

import {forwardRef, useContext, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {colorVars} from '../../theme/tokens.stylex';
import {ThemeContext} from '../../theme/ThemeContext';
import type {StyleXStyles as ThemeStyleXStyles} from '../../theme/types';
import {container} from './container.stylex';
import type {SizeValue} from './XDSCard';

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
    backgroundColor: colorVars['--color-surface'],
  },
  transparent: {
    backgroundColor: 'transparent',
  },
  wash: {
    backgroundColor: colorVars['--color-wash'],
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
 * A section container with background variants.
 *
 * Applies section-specific appearance based on the variant prop
 * and sets CSS variables for child layout components.
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
    {
      variant = 'section',
      width,
      height,
      maxWidth,
      minHeight,
      children,
      ...props
    },
    ref,
  ) {
    // Get theme context for component-level overrides
    const themeContext = useContext(ThemeContext);
    const themeVariantOverride =
      themeContext?.theme.components?.section?.variants?.[variant];

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
          variantStyles[variant],
          themeVariantOverride,
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

XDSSection.displayName = 'XDSSection';
