// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file TableCellContextMenu.tsx
 * @input React (lazy, Suspense), StyleX, tableContextActions
 * @output TableCellContextMenu
 * @position Renders a cell's `contextMenuActions` for TableCell and
 * TableHeaderCell. The context menu (ContextMenu, its menu hooks and touch
 * sheet) loads only for cells that have actions, so a table without context
 * menus doesn't ship it.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Table/tableContextMenu.tsx (TableContextMenu)
 * - /packages/core/src/ContextMenu/ContextMenu.tsx (trigger styles)
 */

import {lazy, Suspense, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '../theme/types';
import type {TableContextActions} from './types';
import {hasContextActions} from './tableContextActions';

const LazyTableContextMenu = lazy(async () =>
  import('./tableContextMenu').then(mod => ({default: mod.TableContextMenu})),
);

// Mirrors ContextMenu's trigger wrapper so the cell keeps its layout while the
// menu loads.
const styles = stylex.create({
  trigger: {
    position: 'relative',
    WebkitTouchCallout: 'none',
    WebkitUserSelect: 'none',
    userSelect: 'none',
  },
});

/**
 * A cell's content, wrapped in a right-click context menu when `actions` can
 * open one. Without actions the content is returned untouched, so the native
 * browser menu passes through and the menu code never loads.
 */
export function TableCellContextMenu({
  children,
  actions,
  triggerXstyle,
}: {
  children: ReactNode;
  actions: TableContextActions | undefined;
  triggerXstyle?: StyleXStyles | StyleXStyles[];
}): ReactNode {
  if (!hasContextActions(actions)) {
    return children;
  }
  const extra = triggerXstyle
    ? Array.isArray(triggerXstyle)
      ? triggerXstyle
      : [triggerXstyle]
    : [];
  return (
    <Suspense
      fallback={
        <span {...stylex.props(styles.trigger, ...extra)}>{children}</span>
      }>
      <LazyTableContextMenu actions={actions} triggerXstyle={triggerXstyle}>
        {children}
      </LazyTableContextMenu>
    </Suspense>
  );
}
