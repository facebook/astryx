'use client';

/**
 * @file XDSCard.tsx
 * @input Uses container utility, StyleX
 * @output Exports XDSCard component and XDSCardProps
 * @position Core card container component
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Card/Card.doc.mjs (props table, features)
 * - /packages/core/src/Card/index.ts (exports if types change)
 * - /apps/storybook/stories/Card.stories.tsx (storybook stories)
 */

import {type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {colorVars, radiusVars, shadowVars} from '../theme/tokens.stylex';
import {container} from '../Layout/container.stylex';
import type {SpacingToken} from '../Layout/container.stylex';
import {
  paddingStyles,
  containerPaddingInlineVarStyles,
  spacingStepToToken,
} from '../Layout/padding.stylex';
import type {SizeValue, SpacingStep} from '../utils/types';
import {xdsClassName, mergeProps} from '../utils';
import {XDSBaseProps} from '../XDSBaseProps';

const styles = stylex.create({
  // Outer wrapper: visual styling with clip for border-radius
  cardOuter: {
    '--card-radius': radiusVars['--radius-3'],
    backgroundColor: colorVars['--color-card'],
    borderRadius: 'var(--card-radius)',
    boxShadow: shadowVars['--shadow-base'],
    // Clip content to border-radius so nested containers don\'t peek out corners
    overflow: 'clip',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colorVars['--color-border-emphasized'],
  },
  // Inner wrapper: container padding and overflow handling
  cardInner: {
    height: '100%',
  },
  // Only enable scrolling when card has fixed height
  scrollable: {
    overflow: 'auto',
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

export interface XDSCardProps extends XDSBaseProps {
  ref?: React.Ref<HTMLDivElement>;
  /**
   * CSS class name(s) appended to the root element.
   */
  className?: string;
  /**
   * Inline styles to apply to the root element.
   */
  style?: React.CSSProperties;
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
   * Internal padding of the card using the spacing scale.
   * Accepts numeric spacing steps: 0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10.
   * @default 4 (16px)
   */
  padding?: SpacingStep;
}

/**
 * A card container with shadow and themed styling.
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
export function XDSCard({
  width,
  height,
  maxWidth,
  minHeight,
  children,
  padding,
  xstyle,
  className,
  style,
  ref,
  ...props
}: XDSCardProps) {
  // Only enable scrolling when card has a fixed height (not null/undefined and not "auto")
  const hasFixedHeight = height != null && height !== 'auto';

  // When no explicit padding prop, use theme default (--xds-card-padding)
  const useThemeDefault = padding == null;
  const effectivePadding = padding ?? 4;
  const paddingToken = spacingStepToToken[effectivePadding] as SpacingToken;

  return (
    <div
      ref={ref}
      {...mergeProps(
        xdsClassName('card'),
        stylex.props(
          styles.cardOuter,
          dynamicStyles.sizing(
            width ?? null,
            height ?? null,
            maxWidth ?? null,
            minHeight ?? null,
          ),
          xstyle,
        ),
        className,
        style,
      )}
      {...props}>
      <div
        {...stylex.props(
          styles.cardInner,
          hasFixedHeight && styles.scrollable,
          ...container(
            useThemeDefault
              ? {useThemeDefault: 'card'}
              : {
                  paddingInnerX: paddingToken,
                  paddingInnerY: paddingToken,
                  paddingOuterX: paddingToken,
                  paddingOuterY: paddingToken,
                },
          ),
          !useThemeDefault &&
            effectivePadding !== 4 &&
            paddingStyles[effectivePadding],
          !useThemeDefault &&
            effectivePadding !== 4 &&
            containerPaddingInlineVarStyles[effectivePadding],
        )}>
        {children}
      </div>
    </div>
  );
}

XDSCard.displayName = 'XDSCard';
