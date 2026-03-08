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

'use client';

import {type ReactNode, useMemo} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSLayoutAreaContext, type LayoutArea} from './XDSLayoutAreaContext';
import {XDSLayoutSlotsContext, type LayoutSlots} from './XDSLayoutSlotsContext';
import {stack} from '../Stack/stack.stylex';
import {stackItem} from '../Stack/stackItem.stylex';
import {xdsClassName, mergeProps} from '../utils';

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

export interface XDSLayoutProps {
  /**
   * Main content area (center).
   */
  content?: ReactNode;

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
   * Removes padding at layout's outer edges, making layout touch container edges.
   * @default false
   */
  isFullBleed?: boolean;

  /**
   * Start panel slot (left in LTR, right in RTL).
   */
  start?: ReactNode;
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
  end,
  footer,
  header,
  height = 'fill',
  isFullBleed = false,
  start,
  className,
  style,
}: XDSLayoutProps) {
  const isFill = height === 'fill';

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

  return (
    <XDSLayoutSlotsContext.Provider value={slotsValue}>
      <div
        {...mergeProps(
          xdsClassName('layout', {height}),
          stylex.props(styles.layoutOuter, isFill ? styles.fill : styles.auto),
          className,
          style,
        )}>
        <div
          {...stylex.props(
            styles.layoutInner,
            ...stack({direction: 'vertical'}),
            isFill ? styles.fill : styles.auto,
            isFullBleed && styles.fullBleed,
          )}>
          <AreaProvider area="header">{header}</AreaProvider>
          <div
            {...stylex.props(
              ...stack({direction: 'horizontal'}),
              styles.middle,
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
}

XDSLayout.displayName = 'XDSLayout';
