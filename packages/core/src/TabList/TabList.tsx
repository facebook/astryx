// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file TabList.tsx
 * @input Uses React, StyleX, TabListContext, useListFocus, useKeyboardHint
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

import React, {useCallback, useMemo, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {borderVars, colorVars, spacingVars} from '../theme/tokens.stylex';
import type {BaseProps} from '../BaseProps';
import {TabListContext} from './TabListContext';
import type {TabListOrientation, TabListSize} from './TabListContext';
import {useSize} from '../SizeContext/SizeContext';
import {mergeProps, mergeRefs} from '../utils';
import {useListFocus} from '../hooks/useListFocus';
import {useKeyboardHint} from '../hooks/useKeyboardHint';
import {EDGE_COMP_ATTR} from '../Layout/edgeCompensation.stylex';
import {themeProps} from '../utils/themeProps';
import {useTranslator} from '../i18n';

/**
 * Selector matching the focusable stops in the tab strip: every Tab
 * (`[data-tab-value]`) and every TabMenu trigger (`[data-tab-menu]`),
 * in DOM order. Disabled stops are filtered out by the handler.
 */
const TAB_STOP_SELECTOR = '[data-tab-value],[data-tab-menu]';

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
  onKeyDown: onKeyDownProp,
  onFocus: onFocusProp,
  onBlur: onBlurProp,
  'aria-label': ariaLabelFromProps,
  'aria-orientation': _ariaOrientation,
  [EDGE_COMP_ATTR]: _edgeCompAttr,
  ...restProps
}: TabListProps) {
  const t = useTranslator();
  const ariaLabel = ariaLabelFromProps ?? t('@astryx.tabList.label');
  const size = useSize(sizeProp, 'md');

  // Roving-tabindex keyboard navigation across the tab strip via the shared
  // hook. `orientation: 'both'` accepts both arrow axes per the WAI-ARIA APG
  // allowance for tab strips (ArrowRight/ArrowDown advance, ArrowLeft/ArrowUp
  // retreat) regardless of the component's `orientation` prop, which only
  // drives the keyboard hint badge (see useKeyboardHint below). We do not set
  // `aria-orientation` on the `<nav>`: that attribute is invalid on the
  // navigation role and triggers an axe `aria-allowed-attr` violation.
  //
  // `hasRovingTabIndex` makes the hook own the single tab stop: it stamps
  // tabindex 0/-1, repairs the stop on mount and as stops mount/unmount or
  // toggle disabled, and — via `handleFocus` on the nav — keeps the stop in
  // sync after clicks or programmatic focus. Individual Tabs still render
  // `tabIndex={isSelected ? 0 : -1}` (see Tab.tsx) as the initial source of
  // truth; the hook's repair preserves an existing tab stop and only promotes
  // the first enabled stop when none is tabbable.
  const {listRef, handleKeyDown, handleFocus} = useListFocus<HTMLElement>({
    itemSelector: TAB_STOP_SELECTOR,
    orientation: 'both',
    hasRovingTabIndex: true,
  });

  const {
    hintElement,
    onKeyDown: onHintKeyDown,
    onFocus: onHintFocus,
    onBlur: onHintBlur,
  } = useKeyboardHint({orientation});

  const contextValue = useMemo(
    () => ({value, onChange, size, layout}),
    [value, onChange, size, layout],
  );

  const handleRootKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLElement>) => {
      onKeyDownProp?.(e);
      if (e.defaultPrevented) {
        return;
      }
      onHintKeyDown(e);
      handleKeyDown(e);
    },
    [onKeyDownProp, onHintKeyDown, handleKeyDown],
  );

  const handleRootFocus = useCallback(
    (e: React.FocusEvent<HTMLElement>) => {
      onFocusProp?.(e);
      if (e.defaultPrevented) {
        return;
      }
      onHintFocus(e);
      handleFocus(e);
    },
    [onFocusProp, onHintFocus, handleFocus],
  );

  const handleRootBlur = useCallback(
    (e: React.FocusEvent<HTMLElement>) => {
      onBlurProp?.(e);
      if (e.defaultPrevented) {
        return;
      }
      onHintBlur(e);
    },
    [onBlurProp, onHintBlur],
  );

  return (
    <TabListContext value={contextValue}>
      <nav
        ref={mergeRefs(ref, listRef)}
        {...restProps}
        aria-label={ariaLabel}
        onKeyDown={handleRootKeyDown}
        onFocus={handleRootFocus}
        onBlur={handleRootBlur}
        {...{[EDGE_COMP_ATTR]: ''}}
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
        {hintElement}
      </nav>
    </TabListContext>
  );
}

TabList.displayName = 'TabList';
