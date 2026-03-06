/**
 * @file XDSCard.tsx
 * @input Uses container utility, StyleX, ThemeContext
 * @output Exports XDSCard component and XDSCardProps
 * @position Core card container component
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Card/README.md (props table, features)
 * - /packages/core/src/Card/index.ts (exports if types change)
 * - /apps/storybook/stories/Card.stories.tsx (storybook stories)
 */

'use client';

import {forwardRef, useContext, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {colorVars, radiusVars, elevationVars} from '../theme/tokens.stylex';
import {ThemeContext} from '../theme/ThemeContext';
import type {StyleXStyles as ThemeStyleXStyles} from '../theme/types';
import {container} from '../Layout/container.stylex';
import type {SizeValue} from '../utils/types';

// =============================================================================
// Module Augmentation - Register XDSCard's themeable properties
// =============================================================================

declare module '../theme/types' {
  interface ComponentStyles {
    card?: {
      /** Outer container styles (background, border, shadow, border-radius) */
      container?: ThemeStyleXStyles;
      /** Inner content styles (padding) */
      content?: ThemeStyleXStyles;
    };
  }
}

const styles = stylex.create({
  // Outer wrapper: visual styling with clip for border-radius
  cardOuter: {
    backgroundColor: colorVars['--color-card'],
    borderRadius: radiusVars['--radius-container'],
    boxShadow: elevationVars['--elevation-base'],
    // Clip content to border-radius so nested containers don't peek out corners
    overflow: 'clip',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colorVars['--color-divider'],
  },
  // Inner wrapper: container padding and overflow handling
  cardInner: {
    height: '100%',
  },
  // Only enable scrolling when card has fixed height
  scrollable: {
    overflow: 'auto',
  },
  // Full bleed: removes all internal padding
  fullBleed: {
    paddingInlineStart: 0,
    paddingInlineEnd: 0,
    paddingBlockStart: 0,
    paddingBlockEnd: 0,
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

export type {SizeValue} from '../utils/types';

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

  /**
   * Removes internal padding, allowing content to touch the edges.
   * @default false
   */
  isFullBleed?: boolean;
}

/**
 * A card container with elevation and themed styling.
 *
 * Applies card-specific appearance (background, shadow, border-radius)
 * and sets CSS variables for child layout components.
 *
 * @compositionHint Use as a top-level container for elevated content.
 * Pair with XDSLayout for structured header/content/footer layouts.
 *
 * @example
 * ```
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
    {
      width,
      height,
      maxWidth,
      minHeight,
      children,
      isFullBleed = false,
      ...props
    },
    ref,
  ) {
    // Get theme context for component-level overrides
    const themeContext = useContext(ThemeContext);
    const containerOverride = themeContext?.theme.components?.card?.container;
    const contentOverride = themeContext?.theme.components?.card?.content;

    // Only enable scrolling when card has a fixed height (not null/undefined and not "auto")
    const hasFixedHeight = height != null && height !== 'auto';

    return (
      <div
        ref={ref}
        {...stylex.props(
          styles.cardOuter,
          containerOverride,
          dynamicStyles.sizing(
            width ?? null,
            height ?? null,
            maxWidth ?? null,
            minHeight ?? null,
          ),
        )}
        {...props}>
        <div
          {...stylex.props(
            styles.cardInner,
            hasFixedHeight && styles.scrollable,
            ...container({
              paddingInnerX: 'spacing4',
              paddingInnerY: 'spacing4',
              paddingOuterX: 'spacing4',
              paddingOuterY: 'spacing4',
            }),
            isFullBleed && styles.fullBleed,
            contentOverride,
          )}>
          {children}
        </div>
      </div>
    );
  },
);

XDSCard.displayName = 'XDSCard';
