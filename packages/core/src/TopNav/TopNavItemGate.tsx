// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file TopNavItemGate.tsx
 * @input Uses TopNavRenderContext, the LinkProvider context, usePressFeedback
 *   and a lazily loaded client TopNavItem
 * @output Exports TopNavItemGate: the client part every server-rendered
 *   TopNavItem sits in
 * @position Client part of TopNavItemShell.tsx. In AppShell's drawer a
 *   TopNavItem renders as a vertical list item that closes the drawer, and
 *   under a LinkProvider its link is the provider's component; a Server
 *   Component can read neither context. Outside them this renders the
 *   server-rendered item it is given, unchanged; inside one, the client
 *   TopNavItem with the same props, loaded only then. It also installs the
 *   shared touch press controller, as every client TopNavItem does.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/TopNav/TopNavItemShell.tsx
 * - /packages/core/src/TopNav/TopNavItem.tsx (the contexts it reads)
 * - /packages/core/src/__tests__/serverEntryClientParts.ts
 */

import {lazy, Suspense, use, type ReactNode} from 'react';
import {LinkContext} from '../Link/LinkContext';
import {usePressFeedback} from '../hooks/usePressFeedback';
import {useTopNavRenderMode} from './TopNavRenderContext';
import type {TopNavItemProps} from './TopNavItem';

const ClientTopNavItem = lazy(async () =>
  import('./TopNavItem').then(mod => ({default: mod.TopNavItem})),
);

export interface TopNavItemGateProps {
  /** The props the item was rendered with: data only, no functions. */
  itemProps: TopNavItemProps;
  /** The item as the server rendered it, for the horizontal bar. */
  children: ReactNode;
}

/**
 * Keeps a server-rendered TopNavItem in the horizontal bar, and hands over to
 * the client TopNavItem in the drawer or under a LinkProvider.
 */
export function TopNavItemGate({
  itemProps,
  children,
}: TopNavItemGateProps): ReactNode {
  usePressFeedback();
  const renderMode = useTopNavRenderMode();
  const linkContext = use(LinkContext);
  const isProvided =
    renderMode === 'drawer' ||
    // A disabled item renders a plain anchor whatever the provider says.
    (linkContext != null &&
      itemProps.as == null &&
      itemProps.isDisabled !== true);
  if (!isProvided) {
    return children;
  }
  // In the drawer the horizontal item would be wrong (it would not close the
  // drawer), so the drawer waits with nothing: AppShell renders it hidden
  // ahead of time, which loads the client item before it opens. Under a
  // LinkProvider the server item is right but for its link component.
  return (
    <Suspense fallback={renderMode === 'drawer' ? null : children}>
      <ClientTopNavItem {...itemProps} />
    </Suspense>
  );
}

TopNavItemGate.displayName = 'TopNavItemGate';
