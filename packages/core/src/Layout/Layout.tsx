// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file Layout.tsx
 * @input Uses React, stack/stackItem utilities, LayoutAreaContext, LayoutSlotsContext
 * @output Exports Layout component and LayoutProps, LayoutHeight types
 * @position Page shell and app layout — use for any page with a header, sidebar, or content area.
 *   Building a page with a sidebar? Use Layout with start/end slots.
 *   Need a header + scrollable content? Use Layout with header + content slots.
 *   Manages padding collapse, scroll containment, and responsive slot sizing automatically.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Layout/Layout.doc.mjs
 * - /apps/storybook/stories/Layout.stories.tsx
 * - /packages/cli/templates/blocks/components/Layout/ (showcase blocks)
 */

import {type ReactNode, useMemo} from 'react';
import * as stylex from '@stylexjs/stylex';
import {LayoutAreaContext, type LayoutArea} from './LayoutAreaContext';
import {LayoutSlotsContext, type LayoutSlots} from './LayoutSlotsContext';
import {LayoutDividerContext} from './LayoutDividerContext';
import {stack} from '../Stack/stack.stylex';
import {stackItem} from '../Stack/stackItem.stylex';
import {mergeProps} from '../utils';
import type {BaseProps} from '../BaseProps';
import type {SpacingStep} from '../utils/types';
import {themeProps} from '../utils/themeProps';
import {
  layoutPaddingOuterXVarStyles,
  layoutPaddingOuterYVarStyles,
} from './padding.stylex';

/**
 * Height behavior for the layout.
 * - `fill`: Layout fills container height, content scrolls internally (default)
 * - `auto`: Layout grows with content, container/page scrolls
 */
export type LayoutHeight = 'fill' | 'auto';

const styles = stylex.create({
  // Outer wrapper uses negative margin to escape container padding
  layoutOuter: {
    marginInlineStart: 'calc(-1 * var(--container-padding-inline-start, 0px))',
    marginInlineEnd: 'calc(-1 * var(--container-padding-inline-end, 0px))',
    marginBlockStart: 'calc(-1 * var(--container-padding-block-start, 0px))',
    marginBlockEnd: 'calc(-1 * var(--container-padding-block-end, 0px))',
  },
  // Inner wrapper resets container padding vars for descendants
  layoutInner: {
    '--container-padding-inline-start': '0px',
    '--container-padding-inline-end': '0px',
    '--container-padding-block-start': '0px',
    '--container-padding-block-end': '0px',
  },
  fill: {
    // Add 2x container block padding to compensate for negative block margins
    height:
      'calc(100% + var(--container-padding-block-start, 0px) + var(--container-padding-block-end, 0px))',
    maxHeight: 'var(--container-max-height, none)',
  },
  auto: {
    minHeight: '100%',
  },
  middle: {
    flex: 1,
    minHeight: 0,
  },
  // When full bleed, set outer padding variables to 0 so child components touch container edges
  fullBleed: {
    '--layout-padding-outer-x': '0px',
    '--layout-padding-outer-y': '0px',
  },
});

const dynamicStyles = stylex.create({
  contentWidthVar: (width: number) => ({
    '--layout-content-width': `${width}px`,
  }),
  contentWidth: (width: number) => ({
    width: '100%',
    maxWidth: width,
    marginInline: 'auto',
  }),
});

export interface LayoutProps extends Omit<BaseProps, 'content'> {
  /**
   * Ref forwarded to the root DOM element.
   */
  ref?: React.Ref<HTMLDivElement>;

  /**
   * Main content area (center).
   */
  content?: ReactNode;

  /**
   * Maximum width of the content within each slot (header, content, footer,
   * panels). Dividers remain full-bleed. Content is centered with
   * `margin-inline: auto` when narrower than the available space.
   *
   * Accepts any pixel value. Common page widths from internal patterns:
   * - `640` — forms, settings, text-focused pages
   * - `960` — content pages, component demos, wider layouts
   */
  contentWidth?: number;

  /**
   * End panel slot (right in LTR, left in RTL).
   */
  end?: ReactNode;

  /**
   * Footer slot.
   */
  footer?: ReactNode;

  /**
   * Header slot.
   */
  header?: ReactNode;

  /**
   * Controls the height behavior:
   * - `fill`: Layout fills container height, content scrolls internally (default)
   * - `auto`: Layout grows with content, container/page scrolls
   * @default 'fill'
   */
  height?: LayoutHeight;

  /**
   * Padding at the layout's outer edges using the spacing scale.
   * Controls both `--layout-padding-outer-x` and `--layout-padding-outer-y`.
   * Accepts numeric spacing steps: 0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10.
   */
  padding?: SpacingStep;

  /**
   * Start panel slot (left in LTR, right in RTL).
   */
  start?: ReactNode;
  /**
   * Default divider visibility for LayoutHeader and LayoutFooter children.
   * When set, headers/footers that don't explicitly pass `hasDivider` will use this value.
   * When not set, nested layouts inherit from their parent context.
   */
  defaultHasDividers?: boolean;

  /**
   * CSS class name(s) appended to the root element.
   */
  className?: string;
  /**
   * Inline styles to apply to the root element.
   */
  style?: React.CSSProperties;
}

/**
 * Helper component to wrap content in layout area context.
 */
function AreaProvider({
  area,
  children,
}: {
  area: LayoutArea;
  children: ReactNode;
}) {
  if (children == null) {
    return null;
  }
  return <LayoutAreaContext value={area}>{children}</LayoutAreaContext>;
}

/**
 * Page shell with header, sidebar(s), content, and footer slots.
 * Use this for full-page layouts, app shells, dashboard layouts, or any UI
 * that needs a header bar, side navigation, scrollable content area, or action footer.
 * Can be used standalone for page-level layouts, or inside a container
 * (Card, Section) for content-level layouts.
 *
 * Handles padding collapse between adjacent slots, scroll containment in the
 * content area, and automatic RTL support via CSS logical properties.
 *
 * Structure:
 * ```
 * ┌─────────────────────────────────────────┐
 * │                 header                  │
 * ├──────┬─────────────────────────┬────────┤
 * │      │                         │        │
 * │start │        content          │  end   │
 * │      │                         │        │
 * ├──────┴─────────────────────────┴────────┤
 * │                 footer                  │
 * └─────────────────────────────────────────┘
 * ```
 *
 * When to use Layout vs raw flexbox:
 * - Page with a sidebar → Layout with `start` slot
 * - Dashboard with header + scrollable body → Layout with `header` + `content`
 * - Settings page with nav panel → Layout with `start` + `content`
 * - Simple vertical stack of items → use VStack instead
 *
 * @example
 * ```
 * <Layout
 *   header={<LayoutHeader hasDivider>App Name</LayoutHeader>}
 *   start={
 *     <LayoutPanel hasDivider width={240} role="navigation">
 *       <Navigation />
 *     </LayoutPanel>
 *   }
 *   content={
 *     <LayoutContent role="main">
 *       <MainContent />
 *     </LayoutContent>
 *   }
 * />
 * ```
 */
export function Layout({
  content,
  contentWidth,
  defaultHasDividers,
  end,
  footer,
  header,
  height = 'fill',
  padding,
  ref,
  start,
  xstyle,
  className,
  style,
}: LayoutProps) {
  const isFill = height === 'fill';

  const dividerCtxValue = useMemo(
    () => (defaultHasDividers != null ? {defaultHasDividers} : null),
    [defaultHasDividers],
  );

  // Memoize slots info to avoid unnecessary re-renders
  const hasHeader = header != null;
  const hasFooter = footer != null;
  const hasStart = start != null;
  const hasEnd = end != null;
  const slotsValue = useMemo<LayoutSlots>(
    () => ({hasHeader, hasFooter, hasStart, hasEnd}),
    [hasHeader, hasFooter, hasStart, hasEnd],
  );

  const tree = (
    <LayoutSlotsContext value={slotsValue}>
      <div
        ref={ref}
        {...mergeProps(
          themeProps('layout', {height}),
          stylex.props(
            styles.layoutOuter,
            isFill ? styles.fill : styles.auto,
            xstyle,
          ),
          className,
          style,
        )}>
        <div
          {...stylex.props(
            stylex.defaultMarker(),
            styles.layoutInner,
            ...stack({direction: 'vertical'}),
            isFill ? styles.fill : styles.auto,
            padding === 0 && styles.fullBleed,
            padding != null && layoutPaddingOuterXVarStyles[padding],
            padding != null && layoutPaddingOuterYVarStyles[padding],
            contentWidth != null && dynamicStyles.contentWidthVar(contentWidth),
          )}>
          <AreaProvider area="header">{header}</AreaProvider>
          <div
            {...stylex.props(
              ...stack({direction: 'horizontal'}),
              styles.middle,
              contentWidth != null && dynamicStyles.contentWidth(contentWidth),
            )}>
            <AreaProvider area="start">{start}</AreaProvider>
            <div {...stylex.props(...stackItem({size: 'fill'}))}>
              <AreaProvider area="content">{content}</AreaProvider>
            </div>
            <AreaProvider area="end">{end}</AreaProvider>
          </div>
          <AreaProvider area="footer">{footer}</AreaProvider>
        </div>
      </div>
    </LayoutSlotsContext>
  );

  if (dividerCtxValue != null) {
    return (
      <LayoutDividerContext value={dividerCtxValue}>
        {tree}
      </LayoutDividerContext>
    );
  }

  return tree;
}

Layout.displayName = 'Layout';
