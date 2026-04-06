'use client';

/**
 * @file XDSLayout.tsx
 * @input Uses React, stack/stackItem utilities, XDSLayoutAreaContext, XDSLayoutSlotsContext
 * @output Exports XDSLayout component and XDSLayoutProps, XDSLayoutHeight types
 * @position Page shell and app layout — use for any page with a header, sidebar, or content area.
 *   Building a page with a sidebar? Use XDSLayout with start/end slots.
 *   Need a header + scrollable content? Use XDSLayout with header + content slots.
 *   Manages padding collapse, scroll containment, and responsive slot sizing automatically.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Layout/Layout.doc.mjs
 * - /packages/core/src/Layout/XDSLayout/index.ts
 * - /apps/storybook/stories/Layout.stories.tsx
 */

import {type ReactNode, useMemo} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSLayoutAreaContext, type LayoutArea} from './XDSLayoutAreaContext';
import {XDSLayoutSlotsContext, type LayoutSlots} from './XDSLayoutSlotsContext';
import {XDSLayoutDividerContext} from './XDSLayoutDividerContext';
import {stack} from '../Stack/stack.stylex';
import {stackItem} from '../Stack/stackItem.stylex';
import {xdsClassName, mergeProps} from '../utils';
import {XDSBaseProps} from '../XDSBaseProps';
import type {SpacingStep} from '../utils/types';
import {
  layoutPaddingOuterXVarStyles,
  layoutPaddingOuterYVarStyles,
} from './padding.stylex';

/**
 * Height behavior for the layout.
 * - `fill`: Layout fills container height, content scrolls internally (default)
 * - `auto`: Layout grows with content, container/page scrolls
 */
export type XDSLayoutHeight = 'fill' | 'auto';

const styles = stylex.create({
  // Outer wrapper uses negative margin to escape container padding
  layoutOuter: {
    margin: 'calc(-1 * var(--container-padding, 0px))',
  },
  // Inner wrapper resets --container-padding for descendants
  layoutInner: {
    '--container-padding': '0px',
  },
  fill: {
    // Add 2x container padding to compensate for negative margins on top/bottom
    height: 'calc(100% + 2 * var(--container-padding, 0px))',
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

export interface XDSLayoutProps extends Omit<XDSBaseProps, 'content'> {
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
  height?: XDSLayoutHeight;

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
   * Default divider visibility for XDSLayoutHeader and XDSLayoutFooter children.
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
  return (
    <XDSLayoutAreaContext.Provider value={area}>
      {children}
    </XDSLayoutAreaContext.Provider>
  );
}

/**
 * Page shell with header, sidebar(s), content, and footer slots.
 * Use this for full-page layouts, app shells, dashboard layouts, or any UI
 * that needs a header bar, side navigation, scrollable content area, or action footer.
 * Can be used standalone for page-level layouts, or inside a container
 * (XDSCard, XDSSection) for content-level layouts.
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
 * When to use XDSLayout vs raw flexbox:
 * - Page with a sidebar → XDSLayout with `start` slot
 * - Dashboard with header + scrollable body → XDSLayout with `header` + `content`
 * - Settings page with nav panel → XDSLayout with `start` + `content`
 * - Simple vertical stack of items → use XDSVStack instead
 *
 * @example
 * ```
 * <XDSLayout
 *   header={<XDSLayoutHeader hasDivider>App Name</XDSLayoutHeader>}
 *   start={
 *     <XDSLayoutPanel hasDivider width={240} role="navigation">
 *       <Navigation />
 *     </XDSLayoutPanel>
 *   }
 *   content={
 *     <XDSLayoutContent role="main">
 *       <MainContent />
 *     </XDSLayoutContent>
 *   }
 * />
 * ```
 */
export function XDSLayout({
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
}: XDSLayoutProps) {
  const isFill = height === 'fill';

  const dividerCtxValue = useMemo(
    () => (defaultHasDividers != null ? {defaultHasDividers} : null),
    [defaultHasDividers],
  );

  // Memoize slots info to avoid unnecessary re-renders
  const slotsValue = useMemo<LayoutSlots>(
    () => ({
      hasHeader: header != null,
      hasFooter: footer != null,
      hasStart: start != null,
      hasEnd: end != null,
    }),
    [header != null, footer != null, start != null, end != null],
  );

  const tree = (
    <XDSLayoutSlotsContext.Provider value={slotsValue}>
      <div
        ref={ref}
        {...mergeProps(
          xdsClassName('layout', {height}),
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
    </XDSLayoutSlotsContext.Provider>
  );

  if (dividerCtxValue != null) {
    return (
      <XDSLayoutDividerContext.Provider value={dividerCtxValue}>
        {tree}
      </XDSLayoutDividerContext.Provider>
    );
  }

  return tree;
}

XDSLayout.displayName = 'XDSLayout';
