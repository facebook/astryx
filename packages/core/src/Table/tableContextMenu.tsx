// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file tableContextMenu.tsx
 * @input React, ContextMenu, Icon, types
 * @output wrapInTableContextMenu helper
 * @position Renders the aggregated `contextMenuActions` for a header cell / row
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Table/BaseTable.tsx (call sites)
 * - /packages/core/src/Table/types.ts (TableContextAction)
 */

import type {ReactNode} from 'react';
import {ContextMenu, type ContextMenuOption} from '../ContextMenu';
import {Icon} from '../Icon';
import type {TableContextAction} from './types';

/**
 * Convert the flat action list into ContextMenu options, inserting a divider
 * between groups (first-seen group order). Ungrouped actions form a trailing
 * group. A `checked` action shows a trailing check icon.
 */
function toContextMenuOptions(
  actions: TableContextAction[],
): ContextMenuOption[] {
  const order: string[] = [];
  const buckets = new Map<string, TableContextAction[]>();
  for (const action of actions) {
    const key = action.group ?? '__ungrouped__';
    let bucket = buckets.get(key);
    if (!bucket) {
      bucket = [];
      buckets.set(key, bucket);
      order.push(key);
    }
    bucket.push(action);
  }

  const options: ContextMenuOption[] = [];
  order.forEach((key, groupIndex) => {
    if (groupIndex > 0) {
      options.push({type: 'divider'});
    }
    for (const action of buckets.get(key) ?? []) {
      options.push({
        label: typeof action.label === 'string' ? action.label : action.id,
        // A checked action (e.g. the active sort direction) shows a checkmark;
        // otherwise the action's own icon. ContextMenu's data form takes a
        // single leading icon, so checked state replaces the icon.
        icon: action.checked ? (
          <Icon icon="check" size="xsm" aria-hidden />
        ) : (
          action.icon
        ),
        isDisabled: action.disabled,
        onClick: action.onSelect,
      });
    }
  });
  return options;
}

/**
 * Wrap a table element (a header cell's content or a row) in a right-click
 * context menu rendering the aggregated `actions`. When no plugin contributes
 * actions the element is returned untouched so the native browser menu passes
 * through.
 */
export function wrapInTableContextMenu(
  element: ReactNode,
  actions: TableContextAction[],
): ReactNode {
  if (actions.length === 0) {
    return element;
  }
  // hasAutoFocus={false}: a right-click menu shouldn't pre-highlight the first
  // item (it looked like "ascending" was always selected). Focus moves only
  // when the user arrow-keys into the menu.
  return (
    <ContextMenu items={toContextMenuOptions(actions)} hasAutoFocus={false}>
      {element}
    </ContextMenu>
  );
}
