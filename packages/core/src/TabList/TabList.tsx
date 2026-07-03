// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file TabList.tsx
 * @input Uses React, StyleX, TabListContext, useListFocus
 * @output Exports TabList component and TabListProps type
 * @position Nav wrapper; provides TabListContext to Tab and TabMenu children.
 *   Owns roving-tabindex keyboard navigation (Arrow/Home/End) across the tab
 *   strip via the shared useListFocus hook so it is a single Tab stop.
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
import type {TabListOrientation, TabListSize} from './TabListContext';
import {useSize} from '../SizeContext/SizeContext';
import {mergeProps, mergeRefs} from '../utils';
import {useListFocus} from '../hooks/useListFocus';
import {useIsomorphicLayoutEffect} from '../hooks/useIsomorphicLayoutEffect';
import {EDGE_COMP_ATTR} from '../Layout/edgeCompensation.stylex';
import {themeProps} from '../utils/themeProps';

/**
 * Selector matching the focusable stops in the tab strip: every Tab
 * (`[data-tab-value]`) and every TabMenu trigger (`[data-tab-menu]`),
 * in DOM order. Disabled stops are filtered out by the handler.
 */
const TAB_STOP_SELECTOR = '[data-tab-value],[data-tab-menu]';

function isDisabledStop(el: HTMLElement): boolean {
  return (
    el.getAttribute('aria-disabled') === 'true' ||
    (el instanceof HTMLButtonElement && el.disabled)
  );
}

export interface TabListProps extends Omit<BaseProps<HTMLElement>, 'onChange'> {
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
   * Orientation of the tab strip, controlling which arrow keys move
   * focus between tabs.
   * - `'horizontal'` (default): ArrowLeft / ArrowRight (ArrowUp / ArrowDown
   *   also work per the WAI-ARIA APG).
   * - `'vertical'`: ArrowUp / ArrowDown (ArrowLeft / ArrowRight also work).
   * @default 'horizontal'
   */
  orientation?: TabListOrientation;
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
  orientation = 'horizontal',
  xstyle,
  className,
  style,
  children,
  ...restProps
}: TabListProps) {
  const size = useSize(sizeProp, 'md');

  // Roving-tabindex keyboard navigation across the tab strip via the shared
  // hook. `orientation: 'both'` accepts both arrow axes per the WAI-ARIA APG
  // allowance for tab strips (ArrowRight/ArrowDown advance, ArrowLeft/ArrowUp
  // retreat) regardless of the component's `orientation` prop, which only
  // drives the reported `aria-orientation`.
  const {listRef, handleKeyDown} = useListFocus<HTMLElement>({
    itemSelector: TAB_STOP_SELECTOR,
    orientation: 'both',
  });

  const contextValue = useMemo(
    () => ({value, onChange, size, layout}),
    [value, onChange, size, layout],
  );

  // Roving tabindex: the tab strip is a single Tab stop. Individual Tabs set
  // tabIndex={0} on the selected tab and -1 on the rest (see Tab.tsx). If the
  // selected value doesn't correspond to any focusable stop (e.g. selection
  // lives in a collapsed TabMenu that renders no matching stop, or there is no
  // selection at all), no stop would be tabbable — this effect repairs that by
  // making the first stop tabbable. useListFocus handles arrow navigation but
  // not the initial tabbable stop, so this stays. Same pattern as the
  // SegmentedControl fix.
  useIsomorphicLayoutEffect(() => {
    const nav = listRef.current;
    if (nav == null) {
      return;
    }
    const stops = Array.from(
      nav.querySelectorAll<HTMLElement>(TAB_STOP_SELECTOR),
    );
    if (stops.length === 0) {
      return;
    }
    const hasTabbable = stops.some(el => el.tabIndex === 0);
    if (!hasTabbable) {
      const firstEnabled = stops.find(el => !isDisabledStop(el)) ?? stops[0];
      firstEnabled.tabIndex = 0;
    }
  });

  return (
    <TabListContext value={contextValue}>
      <nav
        ref={mergeRefs(ref, listRef)}
        aria-label="Tabs"
        aria-orientation={orientation}
        onKeyDown={handleKeyDown}
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
