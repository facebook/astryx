/**
 * @file XDSLayout.tsx
 * @input Uses React, XDSHStack, XDSVStack, XDSLayoutAreaContext
 * @output Exports XDSLayout component and XDSLayoutProps, XDSLayoutHeight types
 * @position Core layout component with named slots
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Layout/XDSLayout/README.md
 * - /packages/core/src/Layout/XDSLayout/index.ts
 * - /apps/storybook/stories/Layout.stories.tsx
 */

import { type ReactNode } from 'react';
import * as stylex from '@stylexjs/stylex';
import { XDSLayoutAreaContext, type LayoutArea } from './XDSLayoutAreaContext';
import { XDSHStack } from '../Stack/XDSHStack';
import { XDSVStack } from '../Stack/XDSVStack';
import { XDSStackItem } from '../Stack/XDSStackItem';

/**
 * Height behavior for the layout.
 * - `fill`: Layout fills container height, content scrolls internally (default)
 * - `auto`: Layout grows with content, container/page scrolls
 */
export type XDSLayoutHeight = 'fill' | 'auto';

const styles = stylex.create({
  fill: {
    height: '100%',
  },
  auto: {
    minHeight: '100%',
  },
  middle: {
    flex: 1,
    minHeight: 0,
  },
  fullBleed: {
    // Removes outer padding from layout edges
    marginInline: 'calc(-1 * var(--layout-padding-outer-x, 0px))',
    marginBlock: 'calc(-1 * var(--layout-padding-outer-y, 0px))',
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

  return (
    <XDSVStack
      xstyle={[
        isFill ? styles.fill : styles.auto,
        isFullBleed && styles.fullBleed,
      ]}
    >
      <AreaProvider area="header">{header}</AreaProvider>
      <XDSHStack xstyle={styles.middle}>
        <AreaProvider area="start">{start}</AreaProvider>
        <XDSStackItem size="fill">
          <AreaProvider area="content">{content}</AreaProvider>
        </XDSStackItem>
        <AreaProvider area="end">{end}</AreaProvider>
      </XDSHStack>
      <AreaProvider area="footer">{footer}</AreaProvider>
    </XDSVStack>
  );
}

XDSLayout.displayName = 'XDSLayout';
