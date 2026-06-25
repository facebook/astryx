// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file TabList.tsx
 * @input Uses React, StyleX, TabListContext
 * @output Exports TabList component and TabListProps type
 * @position Nav wrapper; provides TabListContext to Tab and TabMenu children
 *
 * SYNC: When modified, update:
 * - /packages/core/src/TabList/TabList.doc.mjs
 * - /packages/core/src/TabList/index.ts
 * - /packages/core/src/TabList/TabList.test.tsx
 * - /packages/cli/templates/blocks/components/TabList/ (showcase blocks)
 */

import React, {useMemo, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {borderVars, colorVars, spacingVars} from '../theme/tokens.stylex';
import type {BaseProps} from '../BaseProps';
import {TabListContext} from './TabListContext';
import type {TabListSize} from './TabListContext';
import {useSize} from '../SizeContext/SizeContext';
import {mergeProps} from '../utils';
import {EDGE_COMP_ATTR} from '../Layout/edgeCompensation.stylex';
import {themeProps} from '../utils/themeProps';

export interface TabListProps extends Omit<
  BaseProps<HTMLElement>,
  'onChange'
> {
  ref?: React.Ref<HTMLElement>;
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
  size?: TabListSize;
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
   * Tab and TabMenu children.
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
 * to Tab and TabMenu children.
 *
 * @example
 * ```
 * <TabList value={activeTab} onChange={setActiveTab}>
 *   <Tab value="home" label="Home" />
 *   <Tab value="settings" label="Settings" />
 *   <TabMenu label="More">
 *     <Tab value="analytics" label="Analytics" />
 *     <Tab value="reports" label="Reports" />
 *   </TabMenu>
 * </TabList>
 * ```
 */
export function TabList({
  ref,
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
}: TabListProps) {
  const size = useSize(sizeProp, 'md');

  const contextValue = useMemo(
    () => ({value, onChange, size, layout}),
    [value, onChange, size, layout],
  );

  return (
    <TabListContext value={contextValue}>
      <nav
        ref={ref}
        aria-label="Tabs"
        {...{[EDGE_COMP_ATTR]: ''}}
        {...restProps}
        {...mergeProps(
          themeProps('tab-list', {size}),
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
    </TabListContext>
  );
}

TabList.displayName = 'TabList';
