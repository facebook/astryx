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
 * - /packages/cli/templates/blocks/components/TabList/ (showcase blocks)
 */

import {useMemo, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {borderVars, colorVars, spacingVars} from '../theme/tokens.stylex';
import {XDSBaseProps} from '../XDSBaseProps';
import {XDSTabListContext} from './XDSTabListContext';
import type {XDSTabListSize} from './XDSTabListContext';
import {useXDSSize} from '../SizeContext/XDSSizeContext';
import {xdsClassName, mergeProps} from '../utils';

export interface XDSTabListProps extends Omit<
  XDSBaseProps<HTMLElement>,
  'onChange'
> {
  /**
   * The currently selected tab value.
   */
  value: string;
  /**
   * Callback fired when a tab is selected.
   */
  onChange: (value: string) => void;
  /**
   * Size of the tab hover targets. Uses the same element size tokens
   * as Button and TextInput (`sm` = 28px, `md` = 32px, `lg` = 36px).
   * @default 'md'
   */
  size?: XDSTabListSize;
  /**
   * Layout mode for tab sizing.
   * - `'hug'` (default): each tab hugs its content width.
   * - `'fill'`: tabs stretch equally to fill the container width.
   * @default 'hug'
   */
  layout?: 'hug' | 'fill';
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
    maxWidth: '100%',
    minWidth: 0,
  },
  fill: {
    width: '100%',
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
  size: sizeProp,
  layout = 'hug',
  hasDivider = false,
  xstyle,
  className,
  style,
  children,
  ...restProps
}: XDSTabListProps) {
  const size = useXDSSize(sizeProp, 'md') as XDSTabListSize;

  const contextValue = useMemo(
    () => ({value, onChange, size, layout}),
    [value, onChange, size, layout],
  );

  return (
    <XDSTabListContext.Provider value={contextValue}>
      <nav
        aria-label="Tabs"
        {...restProps}
        {...mergeProps(
          xdsClassName('tab-list', {size}),
          stylex.props(
            styles.nav,
            layout === 'fill' && styles.fill,
            hasDivider && styles.divider,
            xstyle,
          ),
          className,
          style,
        )}>
        {children}
      </nav>
    </XDSTabListContext.Provider>
  );
}

XDSTabList.displayName = 'XDSTabList';
