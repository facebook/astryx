'use client';

/**
 * @file XDSTabList.tsx
 * @input Uses React, StyleX, XDSTabListContext
 * @output Exports XDSTabList component and XDSTabListProps type
 * @position Nav wrapper; provides XDSTabListContext to XDSTab and XDSTabMenu children
 *
 * SYNC: When modified, update:
 * - /packages/core/src/TabList/TabList.doc.mjs
 * - /packages/core/src/TabList/index.ts
 * - /packages/core/src/TabList/XDSTabList.test.tsx
 */

import {useMemo, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';
import {borderVars, colorVars, spacingVars} from '../theme/tokens.stylex';
import {XDSTabListContext} from './XDSTabListContext';
import type {XDSTabListSize} from './XDSTabListContext';
import {xdsClassName, mergeProps} from '../utils';

export interface XDSTabListProps {
  /**
   * The currently selected tab value.
   */
  value: string;
  /**
   * Callback fired when a tab is selected.
   */
  onChange: (value: string) => void;
  /**
   * Size variant for all tabs.
   * @default 'md'
   */
  size?: XDSTabListSize;
  /**
   * Whether to show a bottom divider under the tab list.
   * @default false
   */
  hasDivider?: boolean;
  /**
   * StyleX styles created via `stylex.create()`. Merged with the component's
   * base styles inside a single `stylex.props()` call for optimal deduplication.
   *
   * @example
   * ```
   * const overrides = stylex.create({ root: { marginBottom: 8 } });
   * <XDSTabList xstyle={overrides.root} ... />
   * ```
   */
  xstyle?: StyleXStyles;
  /**
   * CSS class name(s) appended to the root element.
   * If you're using StyleX, prefer `xstyle` for optimal style deduplication.
   */
  className?: string;
  /**
   * Inline styles to apply to the root element.
   */
  style?: React.CSSProperties;
  /**
   * XDSTab and XDSTabMenu children.
   */
  children: ReactNode;
}

const styles = stylex.create({
  nav: {
    display: 'flex',
    alignItems: 'stretch',
    gap: spacingVars['--spacing-0-5'],
  },
  divider: {
    borderBottomWidth: borderVars['--border-width'],
    borderBottomStyle: 'solid',
    borderBottomColor: colorVars['--color-border'],
  },
});

/**
 * Tab navigation wrapper. Provides context for value/onChange/size
 * to XDSTab and XDSTabMenu children.
 *
 * @example
 * ```
 * <XDSTabList value={activeTab} onChange={setActiveTab}>
 *   <XDSTab value="home" label="Home" />
 *   <XDSTab value="settings" label="Settings" />
 *   <XDSTabMenu label="More">
 *     <XDSTab value="analytics" label="Analytics" />
 *     <XDSTab value="reports" label="Reports" />
 *   </XDSTabMenu>
 * </XDSTabList>
 * ```
 */
export function XDSTabList({
  value,
  onChange,
  size = 'md',
  hasDivider = false,
  xstyle,
  className,
  style,
  children,
}: XDSTabListProps) {
  const contextValue = useMemo(
    () => ({value, onChange, size}),
    [value, onChange, size],
  );

  return (
    <XDSTabListContext.Provider value={contextValue}>
      <nav
        aria-label="Tabs"
        {...mergeProps(
          xdsClassName('tab-list', {size}),
          stylex.props(styles.nav, hasDivider && styles.divider, xstyle),
          className,
          style,
        )}>
        {children}
      </nav>
    </XDSTabListContext.Provider>
  );
}

XDSTabList.displayName = 'XDSTabList';
