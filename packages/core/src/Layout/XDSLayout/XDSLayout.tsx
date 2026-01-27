/**
 * @file XDSLayout.tsx
 * @input Uses React, stack/stackItem utilities, XDSLayoutAreaContext, XDSLayoutSlotsContext
 * @output Exports XDSLayout component and XDSLayoutProps, XDSLayoutHeight types
 * @position Core layout component with named slots
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Layout/XDSLayout/README.md
 * - /packages/core/src/Layout/XDSLayout/index.ts
 * - /apps/storybook/stories/Layout.stories.tsx
 */

import {type ReactNode, useMemo} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSLayoutAreaContext, type LayoutArea} from './XDSLayoutAreaContext';
import {XDSLayoutSlotsContext, type LayoutSlots} from './XDSLayoutSlotsContext';
import {stack} from '../Stack/stack.stylex';
import {stackItem} from '../Stack/stackItem.stylex';

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
 * Arranges sections using named slots. Must be wrapped in XDSLayoutContainer.
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
 * @example
 * ```tsx
 * <XDSLayoutContainer variant="card">
 *   <XDSLayout
 *     header={<XDSLayoutHeader>Title</XDSLayoutHeader>}
 *     content={<XDSLayoutContent>Body</XDSLayoutContent>}
 *   />
 * </XDSLayoutContainer>
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
        {...stylex.props(
          styles.layoutOuter,
          isFill ? styles.fill : styles.auto,
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
