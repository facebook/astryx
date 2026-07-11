// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file Section.tsx
 * @input Uses container utility, Layout/flex.stylex, StyleX
 * @output Exports Section component and SectionProps
 * @position Core section container component
 *
 * Two-box anatomy — the props split across them:
 * - OUTER box: the flex child. Sizing (width/height/maxWidth/minHeight),
 *   flex-item props (grow/shrink/basis), and the negative margins that escape
 *   a parent container's padding.
 * - INNER box: the painted surface. Padding, variant background, dividers,
 *   height:100% — and `overflow`, so the surface scrolls its own content
 *   instead of sliding out from under it.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Section/Section.doc.mjs (props table, features)
 * - /packages/core/src/Section/index.ts (exports if types change)
 * - /apps/storybook/stories/Section.stories.tsx (storybook stories)
 * - /packages/cli/templates/blocks/components/Section/ (showcase blocks)
 */

import type {ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {colorVars} from '../theme/tokens.stylex';
import type {BaseProps} from '../BaseProps';
import {container} from '../Layout/container.stylex';
import type {SpacingToken} from '../Layout/container.stylex';
import {
  paddingStyles,
  paddingBlockStyles,
  containerPaddingInlineVarStyles,
  containerPaddingBlockStartVarStyles,
  containerPaddingBlockEndVarStyles,
  sectionPaddingPropagationStyles,
  spacingStepToToken,
} from '../Layout/padding.stylex';
import {
  flexItem,
  minSizeResetStyles,
  overflowStyles,
  type FlexFactor,
  type Overflow,
} from '../Layout/flex.stylex';
import type {SizeValue, SpacingStep} from '../utils/types';
import {mergeProps} from '../utils';
import {themeProps} from '../utils/themeProps';

/**
 * Extensible variant map for Section.
 *
 * Theme packages can add custom variants via TypeScript module augmentation:
 * @example
 * ```
 * declare module '@astryxdesign/core/Section' {
 *   interface SectionVariantMap {
 *     'elevated': true;
 *   }
 * }
 * ```
 */
export interface SectionVariantMap {
  section: true;
  transparent: true;
  muted: true;
}

/**
 * Visual variant for the section.
 * Extensible via module augmentation of SectionVariantMap.
 */
export type SectionVariant = keyof SectionVariantMap;

const variantStyles = stylex.create({
  section: {
    backgroundColor: colorVars['--color-background-surface'],
  },
  transparent: {
    backgroundColor: 'transparent',
  },
  muted: {
    backgroundColor: colorVars['--color-background-muted'],
  },
});

// Styles for escaping parent container padding when nested
const nestedStyles = stylex.create({
  // Outer wrapper escapes parent's container padding
  outer: {
    // Escape horizontal padding using directional vars with shorthand fallback
    marginInlineStart: 'calc(-1 * var(--container-padding-inline-start, 0px))',
    marginInlineEnd: 'calc(-1 * var(--container-padding-inline-end, 0px))',
    // Escape top padding only if first child
    marginTop: {
      default: null,
      ':first-child': 'calc(-1 * var(--container-padding-block-start, 0px))',
    },
    // Escape bottom padding only if last child
    marginBottom: {
      default: null,
      ':last-child': 'calc(-1 * var(--container-padding-block-end, 0px))',
    },
  },
  // Inner wrapper resets container padding for descendants
  inner: {
    '--container-padding-inline-start': '0px',
    '--container-padding-inline-end': '0px',
    '--container-padding-block-start': '0px',
    '--container-padding-block-end': '0px',
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

// Dynamic styles for sizing props.
// One style per property: passing `null` for an unset prop would *remove* that
// property from an earlier style (StyleX null values are removal overrides,
// not no-ops), which would delete the flex min-size reset below.
const dynamicStyles = stylex.create({
  width: (value: SizeValue) => ({width: value}),
  height: (value: SizeValue) => ({height: value}),
  maxWidth: (value: SizeValue) => ({maxWidth: value}),
  minHeight: (value: SizeValue) => ({minHeight: value}),
});

export interface SectionProps extends BaseProps<HTMLElement> {
  ref?: React.Ref<HTMLElement>;
  /**
   * Visual variant of the section.
   * - 'section': Surface background color
   * - 'transparent': Fully transparent background
   * - 'muted': Muted background color
   * @default 'section'
   */
  variant?: SectionVariant;

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
   * Should typically be Layout child components.
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
  dividers?: ('top' | 'bottom' | 'start' | 'end')[];

  /**
   * Internal padding of the section using the spacing scale.
   * Accepts numeric spacing steps: 0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10.
   * @default 4 (16px)
   */
  padding?: SpacingStep;
  /**
   * Block (vertical) padding override. When set, overrides only the block
   * axis padding while preserving inline padding from `padding` or the
   * container theme default.
   * Accepts numeric spacing steps: 0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10.
   */
  paddingBlock?: SpacingStep;

  /**
   * Overflow behavior of the section's content.
   *
   * Applied to the padded surface, so the background and dividers stay put
   * while the content scrolls under them, and the section's own padding is
   * respected at the scroll extremes. Anything other than `visible` also
   * applies the flex `min-height: 0` / `min-width: 0` reset so the section
   * can actually shrink (and therefore scroll) inside a Stack.
   *
   * Takes precedence over `isScrollable` when both are set. Only the
   * shorthand is exposed (no `overflowX`/`overflowY`): those are physical
   * axes, and Astryx styles with logical properties.
   */
  overflow?: Overflow;

  /**
   * Enables scrollable overflow (`overflow: auto`) for the section — the
   * "this pane scrolls on its own" prop. Matches `isScrollable` on
   * `LayoutContent` and `LayoutPanel`.
   *
   * The section still needs a bounded height to scroll against: give it a
   * `height`, or put it in a Stack that has one.
   * @default false
   */
  isScrollable?: boolean;

  /**
   * Whether the section grows to absorb free space when it is a flex child
   * (`flex-grow`). `true` is `1`; pass a number for a custom factor.
   */
  grow?: FlexFactor;

  /**
   * Whether the section shrinks when space runs short (`flex-shrink`).
   * `shrink={false}` is the "fixed width column" idiom.
   */
  shrink?: FlexFactor;

  /**
   * Initial main-axis size of the section as a flex child (`flex-basis`).
   * Numbers are treated as pixels, strings are used as-is.
   */
  basis?: SizeValue;
}

/**
 * A section container with background variants.
 *
 * Applies section-specific appearance based on the variant prop
 * and sets CSS variables for child layout components.
 *
 * @compositionHint Use inside Card to create visually distinct regions.
 * Sections automatically escape parent container padding for edge-to-edge fills.
 *
 * @example
 * ```
 * <Section variant="muted" width={300} height={250}>
 *   <Layout
 *     content={<LayoutContent>Content in muted section</LayoutContent>}
 *   />
 * </Section>
 *
 * // Multi-pane: fixed column + detail column that takes the rest,
 * // each scrolling on its own inside a horizontally scrolling strip.
 * <HStack height="100%" overflow="auto">
 *   <Section width={240} shrink={false} isScrollable dividers={['end']}>
 *     <List>{items}</List>
 *   </Section>
 *   <Section grow shrink={false} basis={320} isScrollable>
 *     <Detail />
 *   </Section>
 * </HStack>
 * ```
 */
export function Section({
  variant = 'section',
  width,
  height,
  maxWidth,
  minHeight,
  children,
  dividers,
  padding,
  paddingBlock,
  overflow,
  isScrollable,
  grow,
  shrink,
  basis,
  xstyle,
  className,
  style,
  ref,
  ...props
}: SectionProps) {
  // When no explicit padding prop, use theme default (set via container tokens)
  const useThemeDefault = padding == null;
  const effectivePadding = padding ?? 4;
  const paddingToken = spacingStepToToken[effectivePadding] as SpacingToken;

  // `isScrollable` is sugar for `overflow="auto"`; the enum wins when both are set.
  const resolvedOverflow = overflow ?? (isScrollable ? 'auto' : undefined);
  // A flex item's automatic minimum size (`min-height: auto`) refuses to shrink
  // below its content, so a section inside a Stack would grow instead of
  // scrolling. Scroll containers reset it — but the scroll container here is
  // the INNER box, and the flex item is the OUTER one, so it needs the reset
  // explicitly.
  const needsMinSizeReset =
    resolvedOverflow != null && resolvedOverflow !== 'visible';

  // The OUTER box is the flex child: sizing and flex-item props belong here.
  // The reset goes first so an explicit `minHeight` still wins over it.
  const outerStylex = stylex.props(
    nestedStyles.outer,
    needsMinSizeReset && minSizeResetStyles.reset,
    width != null && dynamicStyles.width(width),
    height != null && dynamicStyles.height(height),
    maxWidth != null && dynamicStyles.maxWidth(maxWidth),
    minHeight != null && dynamicStyles.minHeight(minHeight),
    ...flexItem({grow, shrink, basis}),
    xstyle,
  );

  return (
    <div
      ref={ref as React.Ref<HTMLDivElement>}
      className={
        [outerStylex.className, className].filter(Boolean).join(' ') ||
        undefined
      }
      style={
        style && outerStylex.style
          ? {...outerStylex.style, ...style}
          : style || outerStylex.style
      }
      {...props}>
      <div
        {...mergeProps(
          themeProps('section', {variant}),
          stylex.props(
            nestedStyles.inner,
            ...container(
              useThemeDefault
                ? {useThemeDefault: 'section'}
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
            !useThemeDefault &&
              effectivePadding !== 4 &&
              containerPaddingBlockStartVarStyles[effectivePadding],
            !useThemeDefault &&
              effectivePadding !== 4 &&
              containerPaddingBlockEndVarStyles[effectivePadding],
            !useThemeDefault &&
              sectionPaddingPropagationStyles[effectivePadding],
            paddingBlock != null && paddingBlockStyles[paddingBlock],
            paddingBlock != null &&
              containerPaddingBlockStartVarStyles[paddingBlock],
            paddingBlock != null &&
              containerPaddingBlockEndVarStyles[paddingBlock],
            variantStyles[variant],
            dividers?.includes('top') && dividerStyles.top,
            dividers?.includes('bottom') && dividerStyles.bottom,
            dividers?.includes('start') && dividerStyles.start,
            dividers?.includes('end') && dividerStyles.end,
            // Overflow belongs on the INNER box: it is the painted surface
            // (background, dividers) and it owns the padding. Scrolling the
            // outer box would slide this box — background and dividers with
            // it — out of view, and push content past the bottom padding.
            resolvedOverflow != null && overflowStyles[resolvedOverflow],
          ),
        )}>
        {children}
      </div>
    </div>
  );
}

Section.displayName = 'Section';
