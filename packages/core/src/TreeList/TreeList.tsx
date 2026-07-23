// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file TreeList.tsx
 * @input Uses React, StyleX, theme tokens, TreeListItem, TreeListTypes, useTreeFocus
 * @output Exports TreeList component, TreeListProps type
 * @position Core implementation; consumed by index.ts
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/TreeList/TreeList.doc.mjs
 * - /packages/core/src/TreeList/index.ts
 * - /apps/storybook/stories/TreeList.stories.tsx
 * - /packages/cli/templates/blocks/components/TreeList/ (showcase blocks)
 */

import {useId, useState, useMemo, useCallback, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {spacingVars} from '../theme/tokens.stylex';
import {mergeProps} from '../utils';
import type {BaseProps} from '../BaseProps';
import {TreeListItem} from './TreeListItem';
import type {TreeListItemData, TreeListDensity} from './TreeListTypes';
import {themeProps} from '../utils/themeProps';
import {useTreeFocus} from '../hooks/useTreeFocus';

// =============================================================================
// Types
// =============================================================================

export {type TreeListDensity} from './TreeListTypes';

export interface TreeListProps extends BaseProps<HTMLDivElement> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLDivElement>;

  /**
   * Tree items as a recursive data structure.
   * Each item can have nested `children` arrays.
   */
  items: TreeListItemData[];

  /**
   * Spacing density for tree list items.
   * - 'compact': Tighter spacing for dense UIs
   * - 'balanced': Standard spacing
   * - 'spacious': Extra spacing for readability
   * @default 'balanced'
   */
  density?: TreeListDensity;

  /**
   * Header content rendered above the tree list.
   * Semantically associated via aria-labelledby.
   */
  header?: ReactNode;

  /**
   * Test ID for testing frameworks.
   */
  'data-testid'?: string;
}

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  root: {
    position: 'relative',
  },
  list: {
    margin: 0,
    padding: 0,
    listStyleType: 'none',
  },
  header: {
    marginBottom: spacingVars['--spacing-2'],
  },
});

// =============================================================================
// Helpers
// =============================================================================

/** Recursively collect IDs of items marked as `isExpanded`. */
function collectExpandedKeys(items: TreeListItemData[]): string[] {
  const keys: string[] = [];
  for (const item of items) {
    if (item.isExpanded && item.children != null && item.children.length > 0) {
      keys.push(item.id);
    }
    if (item.children != null) {
      keys.push(...collectExpandedKeys(item.children));
    }
  }
  return keys;
}

/**
 * Compute the initial roving-tabindex seed: the first selected enabled item in
 * document order, else the first enabled item, else the first item. The hook
 * (useTreeFocus with hasRovingTabIndex) takes ownership after mount — it
 * preserves this seeded `tabindex="0"` on its repair pass and moves the stop
 * with keyboard navigation.
 */
function findInitialTabbableId(items: TreeListItemData[]): string | undefined {
  let firstEnabled: string | undefined;
  const walk = (list: TreeListItemData[]): string | undefined => {
    for (const item of list) {
      if (item.isSelected && item.isDisabled !== true) {
        return item.id;
      }
      if (firstEnabled == null && item.isDisabled !== true) {
        firstEnabled = item.id;
      }
      if (item.children != null && item.children.length > 0) {
        const selected = walk(item.children);
        if (selected != null) {
          return selected;
        }
      }
    }
    return undefined;
  };
  return walk(items) ?? firstEnabled ?? items[0]?.id;
}

// =============================================================================
// Component
// =============================================================================

/**
 * A data-driven tree list component for rendering hierarchical data.
 *
 * Accepts an `items` array of recursive config objects. Expansion state is
 * managed internally — seed initial state by setting `isExpanded: true` on
 * individual items in the data.
 * Positional data (nestedLevel, isLast, ancestorsIsLast) is computed during
 * rendering — no context, no cloneElement, no force-update mechanism.
 *
 * @example
 * ```
 * <TreeList
 *   items={[
 *     { id: 'src', label: 'src', isExpanded: true, children: [
 *       { id: 'app', label: 'App.tsx' },
 *       { id: 'index', label: 'index.tsx' },
 *     ]},
 *     { id: 'pkg', label: 'package.json' },
 *   ]}
 * />
 * ```
 */
export function TreeList({
  items,
  density = 'balanced',
  header,
  xstyle,
  className,
  style,
  'data-testid': testId,
  ref,
}: TreeListProps) {
  const headerId = useId();

  // Expanded keys from data: recomputed whenever items change.
  const expandedKeysFromProps = useMemo(
    () => new Set(collectExpandedKeys(items)),
    [items],
  );

  // User overrides: only stores IDs the user has explicitly toggled.
  const [expandedKeysOverride, setExpandedKeysOverride] = useState<
    Map<string, boolean>
  >(() => new Map());

  const handleToggle = useCallback(
    (id: string) => {
      setExpandedKeysOverride(prev => {
        const next = new Map(prev);
        const isCurrentlyExpanded = prev.has(id)
          ? (prev.get(id) ?? false)
          : expandedKeysFromProps.has(id);
        next.set(id, !isCurrentlyExpanded);
        return next;
      });
    },
    [expandedKeysFromProps],
  );

  // ---------------------------------------------------------------------------
  // Roving tabindex + APG tree keyboard model (via useTreeFocus)
  // ---------------------------------------------------------------------------

  // The hook (hasRovingTabIndex) owns the tree's single tab stop: it repairs
  // the stop on mount and moves it with keyboard navigation. We only seed the
  // initially-tabbable treeitem in the render (selected item or first enabled);
  // the hook's repair pass preserves that seeded `tabindex="0"`.
  const initialTabbableId = useMemo(
    () => findInitialTabbableId(items),
    [items],
  );

  // Enter/Space activation: prefer the treeitem's own inner action (link or
  // button); return true when handled so the hook does not also toggle. Scoped
  // to this treeitem's own row — never a descendant treeitem's action inside an
  // expanded group.
  const activateItem = useCallback((current: HTMLElement): boolean => {
    // The chevron toggle is marked with `data-tree-toggle` (set by
    // TreeListItem) so this filter stays stable across locales — matching by
    // aria-label would break under any locale where "Toggle children" is
    // translated.
    const candidates = current.querySelectorAll<HTMLElement>(
      'a[href], button:not([data-tree-toggle])',
    );
    for (const candidate of candidates) {
      if (candidate.closest('[role="treeitem"]') === current) {
        candidate.click();
        return true;
      }
    }
    return false;
  }, []);

  const {treeRef, handleKeyDown, handleFocus} = useTreeFocus<HTMLUListElement>({
    onToggleExpand: handleToggle,
    onActivate: activateItem,
    hasRovingTabIndex: true,
  });

  function renderItems(
    items: TreeListItemData[],
    nestedLevel: number,
    ancestorsIsLast: ReadonlyArray<boolean>,
  ): ReactNode {
    return items.map((item, index) => {
      const isLast = index === items.length - 1;
      const isExpanded = expandedKeysOverride.has(item.id)
        ? (expandedKeysOverride.get(item.id) ?? false)
        : expandedKeysFromProps.has(item.id);
      const hasChildren = item.children != null && item.children.length > 0;

      const ancestorsIsLastForChildren = hasChildren
        ? [...ancestorsIsLast, isLast]
        : ancestorsIsLast;

      const renderedChildren =
        isExpanded && hasChildren
          ? renderItems(
              item.children ?? [],
              nestedLevel + 1,
              ancestorsIsLastForChildren,
            )
          : undefined;

      return (
        <TreeListItem
          key={item.id}
          id={item.id}
          label={item.label}
          description={item.description}
          startContent={item.startContent}
          endContent={item.endContent}
          hasChildren={hasChildren}
          onClick={item.onClick}
          href={item.href}
          target={item.target}
          isDisabled={item.isDisabled}
          isSelected={item.isSelected}
          nestedLevel={nestedLevel}
          isLast={isLast}
          ancestorsIsLast={ancestorsIsLast}
          isExpanded={isExpanded}
          onToggle={handleToggle}
          density={density}
          renderedChildren={renderedChildren}
          posInSet={index + 1}
          setSize={items.length}
          isTabbable={item.id === initialTabbableId}
        />
      );
    });
  }

  return (
    <div
      ref={ref}
      data-testid={testId}
      {...mergeProps(
        themeProps('tree-list', {density}),
        stylex.props(styles.root, xstyle),
        className,
        style,
      )}>
      {header != null && (
        <div id={headerId} {...stylex.props(styles.header)}>
          {header}
        </div>
      )}
      <ul
        ref={treeRef}
        role="tree"
        aria-labelledby={header != null ? headerId : undefined}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        {...stylex.props(styles.list)}>
        {renderItems(items, 0, [])}
      </ul>
    </div>
  );
}

TreeList.displayName = 'TreeList';
