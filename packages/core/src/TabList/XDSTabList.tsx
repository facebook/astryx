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

'use client';

import {useMemo, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {colorVars, spacingVars} from '../theme/tokens.stylex';
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
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
    borderBottomColor: colorVars['--color-divider'],
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
          stylex.props(styles.nav, hasDivider && styles.divider),
        )}>
        {children}
      </nav>
    </XDSTabListContext.Provider>
  );
}

XDSTabList.displayName = 'XDSTabList';
