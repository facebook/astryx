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
      /** Outer container styles (positioning, margins) */
      container?: ThemeStyleXStyles;
      /** Inner content styles (padding) */
      content?: ThemeStyleXStyles;
      /** Style overrides for each variant (background, visual styling) */
      variants?: Partial<Record<XDSSectionVariant, ThemeStyleXStyles>>;
    };
  }
}

const variantStyles = stylex.create({
  section: {
    backgroundColor: colorVars['--color-surface'],
    // Surface background: nested cards need visible borders
    '--card-border-color': colorVars['--color-divider'],
  },
  transparent: {
    backgroundColor: 'transparent',
    // Transparent inherits --card-border-color from parent
  },
  wash: {
    backgroundColor: colorVars['--color-wash'],
    // Wash background: nested cards don't need borders
    '--card-border-color': 'transparent',
  },
});

// Styles for escaping parent container padding when nested
const nestedStyles = stylex.create({
  // Outer wrapper escapes parent's container padding
  outer: {
    // Always escape horizontal padding
    marginInline: 'calc(-1 * var(--container-padding, 0px))',
    // Escape top padding only if first child
    marginTop: {
      default: null,
      ':first-child': 'calc(-1 * var(--container-padding, 0px))',
    },
    // Escape bottom padding only if last child
    marginBottom: {
      default: null,
      ':last-child': 'calc(-1 * var(--container-padding, 0px))',
    },
  },
  // Inner wrapper resets container padding for descendants
  inner: {
    '--container-padding': '0px',
    height: '100%',
  },
  // Full bleed: removes all internal padding
  fullBleed: {
    paddingInlineStart: 0,
    paddingInlineEnd: 0,
    paddingBlockStart: 0,
    paddingBlockEnd: 0,
  },
});

// Divider styles for each side
const dividerStyles = stylex.create({
  top: {
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: colorVars['--color-divider'],
  },
  bottom: {
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: colorVars['--color-divider'],
  },
  start: {
    borderInlineStartWidth: 1,
    borderInlineStartStyle: 'solid',
    borderInlineStartColor: colorVars['--color-divider'],
  },
  end: {
    borderInlineEndWidth: 1,
    borderInlineEndStyle: 'solid',
    borderInlineEndColor: colorVars['--color-divider'],
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

  /**
   * Which sides should have divider borders.
   * Use 'start'/'end' for horizontal (respects RTL).
   * @example dividers={['top', 'bottom']}
   */
  dividers?: Array<'top' | 'bottom' | 'start' | 'end'>;

  /**
   * Removes internal padding, allowing content to touch the edges.
   * @default false
   */
  isFullBleed?: boolean;
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
      dividers,
      isFullBleed = false,
      ...props
    },
    ref,
  ) {
    // Get theme context for component-level overrides
    const themeContext = useContext(ThemeContext);
    const containerOverride = themeContext?.theme.components?.section?.container;
    const contentOverride = themeContext?.theme.components?.section?.content;
    const variantOverride =
      themeContext?.theme.components?.section?.variants?.[variant];

    return (
      <div
        ref={ref}
        {...stylex.props(
          nestedStyles.outer,
          dynamicStyles.sizing(
            width ?? null,
            height ?? null,
            maxWidth ?? null,
            minHeight ?? null,
          ),
          containerOverride,
        )}
        {...props}>
        <div
          {...stylex.props(
            nestedStyles.inner,
            ...container({
              paddingInnerX: 'spacing4',
              paddingInnerY: 'spacing4',
              paddingOuterX: 'spacing4',
              paddingOuterY: 'spacing4',
            }),
            variantStyles[variant],
            variantOverride,
            isFullBleed && nestedStyles.fullBleed,
            dividers?.includes('top') && dividerStyles.top,
            dividers?.includes('bottom') && dividerStyles.bottom,
            dividers?.includes('start') && dividerStyles.start,
            dividers?.includes('end') && dividerStyles.end,
            contentOverride,
          )}>
          {children}
        </div>
      </div>
    );
  },
);

XDSSection.displayName = 'XDSSection';
