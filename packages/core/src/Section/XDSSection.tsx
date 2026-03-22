'use client';

/**
 * @file XDSSection.tsx
 * @input Uses container utility, StyleX
 * @output Exports XDSSection component and XDSSectionProps
 * @position Core section container component
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Section/Section.doc.mjs (props table, features)
 * - /packages/core/src/Section/index.ts (exports if types change)
 * - /apps/storybook/stories/Section.stories.tsx (storybook stories)
 */


import {type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';
import {colorVars} from '../theme/tokens.stylex';
import {container} from '../Layout/container.stylex';
import type {SpacingToken} from '../Layout/container.stylex';
import {
  paddingStyles,
  containerPaddingInlineVarStyles,
  spacingStepToToken,
} from '../Layout/padding.stylex';
import type {SizeValue, SpacingStep} from '../utils/types';
import {xdsClassName, mergeProps} from '../utils';

/**
 * Extensible variant map for XDSSection.
 *
 * Theme packages can add custom variants via TypeScript module augmentation:
 * @example
 * ```
 * declare module '@xds/core/Section' {
 *   interface XDSSectionVariantMap {
 *     'elevated': true;
 *   }
 * }
 * ```
 */
export interface XDSSectionVariantMap {
  section: true;
  transparent: true;
  wash: true;
}

/**
 * Visual variant for the section.
 * Extensible via module augmentation of XDSSectionVariantMap.
 */
export type XDSSectionVariant = keyof XDSSectionVariantMap;

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
});

// Divider styles for each side
const dividerStyles = stylex.create({
  top: {
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: colorVars['--color-border'],
  },
  bottom: {
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: colorVars['--color-border'],
  },
  start: {
    borderInlineStartWidth: 1,
    borderInlineStartStyle: 'solid',
    borderInlineStartColor: colorVars['--color-border'],
  },
  end: {
    borderInlineEndWidth: 1,
    borderInlineEndStyle: 'solid',
    borderInlineEndColor: colorVars['--color-border'],
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
  ref?: React.Ref<HTMLElement>;
  /**
   * StyleX styles created via `stylex.create()`. Merged with the component's
   * base styles inside a single `stylex.props()` call on the outer wrapper.
   *
   * @example
   * ```
   * const overrides = stylex.create({ root: { marginBottom: 8 } });
   * <XDSSection xstyle={overrides.root} />
   * ```
   */
  xstyle?: StyleXStyles;
  /**
   * CSS class name(s) appended to the root element.
   */
  className?: string;
  /**
   * Inline styles to apply to the root element.
   */
  style?: React.CSSProperties;
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
   * @example
   * ```
   * dividers={['top', 'bottom']}
   * ```
   */
  dividers?: Array<'top' | 'bottom' | 'start' | 'end'>;

  /**
   * Internal padding of the section using the spacing scale.
   * Accepts numeric spacing steps: 0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10.
   * @default 4 (16px)
   */
  padding?: SpacingStep;
}

/**
 * A section container with background variants.
 *
 * Applies section-specific appearance based on the variant prop
 * and sets CSS variables for child layout components.
 *
 * @compositionHint Use inside XDSCard to create visually distinct regions.
 * Sections automatically escape parent container padding for edge-to-edge fills.
 *
 * @example
 * ```
 * <XDSSection variant="wash" width={300} height={250}>
 *   <XDSLayout
 *     content={<XDSLayoutContent>Content in wash section</XDSLayoutContent>}
 *   />
 * </XDSSection>
 * ```
 */
export function XDSSection({
  variant = 'section',
  width,
  height,
  maxWidth,
  minHeight,
  children,
  dividers,
  padding,
  xstyle,
  className,
  style,
  ref,
  ...props
}: XDSSectionProps) {
  const effectivePadding = padding ?? 4;
  const paddingToken = spacingStepToToken[effectivePadding] as SpacingToken;
  return (
    <div
      ref={ref as React.Ref<HTMLDivElement>}
      {...mergeProps(
        xdsClassName('section', {variant}),
        stylex.props(
          nestedStyles.outer,
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
          nestedStyles.inner,
          ...container({
            paddingInnerX: paddingToken,
            paddingInnerY: paddingToken,
            paddingOuterX: paddingToken,
            paddingOuterY: paddingToken,
          }),
          effectivePadding !== 4 && paddingStyles[effectivePadding],
          effectivePadding !== 4 &&
            containerPaddingInlineVarStyles[effectivePadding],
          variantStyles[variant],
          dividers?.includes('top') && dividerStyles.top,
          dividers?.includes('bottom') && dividerStyles.bottom,
          dividers?.includes('start') && dividerStyles.start,
          dividers?.includes('end') && dividerStyles.end,
        )}>
        {children}
      </div>
    </div>
  );
}

XDSSection.displayName = 'XDSSection';
