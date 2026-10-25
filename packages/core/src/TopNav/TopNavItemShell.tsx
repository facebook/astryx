// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file TopNavItemShell.tsx
 * @input Uses topNavItemStyles, navItemStyles, TopNavItemGate, the client
 *   TopNavItem, isSafeDestination
 * @output Exports TopNavItem: the server shell resolved by the `react-server`
 *   entry (index.server.ts)
 * @position Server-safe TopNavItem. Imports no client React API, so a Server
 *   Component renders the horizontal item on the server: the same anchor,
 *   classes and attributes the client TopNavItem renders in the bar. It sits
 *   in TopNavItemGate, which hands over to the client TopNavItem in AppShell's
 *   drawer or under a LinkProvider. An item with an `onClick`, a `ref`, a
 *   component passed as `as` or another function-valued prop renders the
 *   client TopNavItem.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/TopNav/TopNavItem.tsx (default mode markup)
 * - /packages/core/src/TopNav/TopNavItemGate.tsx
 * - /packages/core/src/TopNav/TopNavShell.test.tsx
 */

import type {ReactNode} from 'react';
import {pressableProps} from '../utils/pressable';
import {isSafeDestination} from '../utils/safeUrl';
import {
  TopNavItem as ClientTopNavItem,
  type TopNavItemProps,
} from './TopNavItem';
import {TopNavItemGate} from './TopNavItemGate';
import {getTopNavItemRootProps} from './topNavItemStyles.stylex';
import {navItemStyles} from '../NavItem/navItemStyles.stylex';

/**
 * Whether these props need the client TopNavItem. Exported for the
 * server-render tests; not part of the public API.
 */
export function needsClientTopNavItem(props: TopNavItemProps): boolean {
  if (props.ref != null || (props.as != null && props.as !== 'a')) {
    return true;
  }
  return Object.values(props).some(value => typeof value === 'function');
}

/**
 * A navigation item for use within TopNav startContent. Same API as the
 * client TopNavItem; see TopNavItem.tsx.
 */
export function TopNavItem(props: TopNavItemProps): ReactNode {
  if (needsClientTopNavItem(props)) {
    return <ClientTopNavItem {...props} />;
  }

  const {
    as: _as,
    href,
    target,
    label,
    isSelected = false,
    isDisabled = false,
    isIconOnly = false,
    icon,
    children,
    // Drawer only; the drawer item is a client TopNavItem.
    size: _size,
    xstyle,
    className,
    style,
    ...rest
  } = props;

  // TopNavItem.tsx default mode, attribute for attribute. A disabled item is
  // a plain anchor with no href; an enabled one is the native anchor the
  // client link handoff renders (href last, dropped when rejected).
  const itemProps = {
    target: isDisabled ? undefined : target,
    'aria-label': isIconOnly ? label : undefined,
    'aria-current': isSelected ? ('page' as const) : undefined,
    'aria-disabled': isDisabled || undefined,
    tabIndex: isDisabled ? -1 : undefined,
    ...pressableProps,
    ...getTopNavItemRootProps({
      isSelected,
      disabledXstyle: isDisabled && navItemStyles.disabled,
      isIconOnly,
      xstyle,
      className,
      style,
    }),
    ...rest,
  };
  const content = (
    <>
      {icon}
      {!isIconOnly && (children ?? label)}
    </>
  );
  // A Server Component cannot read LinkProvider; TopNavItemGate hands an
  // item under one to the client TopNavItem, which resolves it.
  const element = isDisabled ? (
    // eslint-disable-next-line @astryx/no-hardcoded-anchor -- a disabled item is a plain anchor in TopNavItem.tsx too.
    <a {...itemProps}>{content}</a>
  ) : (
    // eslint-disable-next-line @astryx/no-hardcoded-anchor -- see above.
    <a {...itemProps} href={isSafeDestination(href) ? href : undefined}>
      {content}
    </a>
  );

  return <TopNavItemGate itemProps={props}>{element}</TopNavItemGate>;
}

TopNavItem.displayName = 'TopNavItem';
