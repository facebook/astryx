// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file TreeList.tsx
 * @input Uses React, StyleX, theme tokens, TreeListItem, TreeListTypes
 * @output Exports TreeList component, TreeListProps type
 * @position Core implementation; consumed by index.ts
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/TreeList/TreeList.doc.mjs
 * - /packages/core/src/TreeList/index.ts
 * - /apps/storybook/stories/TreeList.stories.tsx
 * - /packages/cli/templates/blocks/components/TreeList/ (showcase blocks)
 */

import {
  useId,
  useState,
  useMemo,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import {spacingVars} from '../theme/tokens.stylex';
import {mergeProps} from '../utils';
import type {BaseProps} from '../BaseProps';
import {TreeListItem} from './TreeListItem';
import type {TreeListItemData, TreeListDensity} from './TreeListTypes';
import {themeProps} from '../utils/themeProps';

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
 * Compute the initial roving-tabindex owner: the first selected enabled item
 * in document order, else the first enabled item, else the first item.
 * Only the top-level candidates are considered for the default so the tab stop
 * is reachable even when the tree is fully collapsed.
 */
function findDefaultActiveId(items: TreeListItemData[]): string | undefined {
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

/** Keys handled by the tree keyboard model. */
const NAVIGATION_KEYS = new Set([
  'ArrowDown',
  'ArrowUp',
  'ArrowRight',
  'ArrowLeft',
  'Home',
  'End',
  'Enter',
  ' ',
]);

/** Reset delay for the typeahead buffer. */
const TYPEAHEAD_RESET_MS = 500;

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
  // Roving tabindex + APG tree keyboard model
  // ---------------------------------------------------------------------------

  const treeRef = useRef<HTMLUListElement>(null);

  // The treeitem that currently owns the tree's single tab stop. Focus moves
  // it around; a data-driven default seeds it (selected item or first enabled).
  const [activeId, setActiveId] = useState<string | undefined>(() =>
    findDefaultActiveId(items),
  );

  // If the seed id is no longer present (items changed), fall back to a valid
  // default so the tree always has exactly one reachable tab stop.
  const resolvedActiveId = useMemo(() => {
    if (activeId == null) {
      return findDefaultActiveId(items);
    }
    const exists = (list: TreeListItemData[]): boolean =>
      list.some(
        item =>
          item.id === activeId ||
          (item.children != null && exists(item.children)),
      );
    return exists(items) ? activeId : findDefaultActiveId(items);
  }, [activeId, items]);

  const typeaheadRef = useRef<{buffer: string; timer: number | null}>({
    buffer: '',
    timer: null,
  });

  /** Visible treeitems in DOM order (collapsed subtrees are not rendered). */
  const getVisibleItems = useCallback((): HTMLElement[] => {
    const root = treeRef.current;
    if (root == null) {
      return [];
    }
    return Array.from(root.querySelectorAll<HTMLElement>('[role="treeitem"]'));
  }, []);

  const isEnabled = useCallback(
    (el: HTMLElement): boolean => el.dataset.treeDisabled == null,
    [],
  );

  /** Move the tab stop to an element and focus it. */
  const focusItem = useCallback((el: HTMLElement | undefined) => {
    if (el == null) {
      return;
    }
    const id = el.dataset.treeId;
    if (id != null) {
      setActiveId(id);
    }
    el.focus();
  }, []);

  const level = useCallback(
    (el: HTMLElement): number => Number(el.dataset.treeLevel ?? '1'),
    [],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const items = getVisibleItems();
      if (items.length === 0) {
        return;
      }
      const active = document.activeElement;
      // Resolve the treeitem that owns focus: the nearest treeitem ancestor of
      // the active element (never an outer treeitem that merely contains it).
      const activeItem =
        active instanceof Element ? active.closest('[role="treeitem"]') : null;
      const currentIndex = items.findIndex(item => item === activeItem);
      const current = currentIndex >= 0 ? items[currentIndex] : undefined;

      const focusNextEnabledFrom = (start: number, dir: 1 | -1) => {
        for (let i = start; i >= 0 && i < items.length; i += dir) {
          const candidate = items[i];
          if (candidate != null && isEnabled(candidate)) {
            focusItem(candidate);
            return;
          }
        }
      };

      // Typeahead: printable single characters jump to the next matching item.
      if (
        e.key.length === 1 &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.altKey &&
        NAVIGATION_KEYS.has(e.key) === false
      ) {
        const state = typeaheadRef.current;
        if (state.timer != null) {
          clearTimeout(state.timer);
        }
        state.buffer += e.key.toLowerCase();
        state.timer = setTimeout(() => {
          typeaheadRef.current.buffer = '';
        }, TYPEAHEAD_RESET_MS) as unknown as number;

        const query = state.buffer;
        const start = currentIndex < 0 ? 0 : currentIndex;
        const ordered = [
          ...items.slice(start + 1),
          ...items.slice(0, start + 1),
        ];
        const match = ordered.find(
          item =>
            isEnabled(item) &&
            (item.textContent ?? '').trim().toLowerCase().startsWith(query),
        );
        if (match != null) {
          e.preventDefault();
          focusItem(match);
        }
        return;
      }

      if (!NAVIGATION_KEYS.has(e.key)) {
        return;
      }

      switch (e.key) {
        case 'ArrowDown': {
          e.preventDefault();
          focusNextEnabledFrom(currentIndex < 0 ? 0 : currentIndex + 1, 1);
          break;
        }
        case 'ArrowUp': {
          e.preventDefault();
          focusNextEnabledFrom(
            currentIndex < 0 ? items.length - 1 : currentIndex - 1,
            -1,
          );
          break;
        }
        case 'ArrowRight': {
          if (current == null) {
            break;
          }
          e.preventDefault();
          const expanded = current.getAttribute('aria-expanded');
          if (expanded === 'false') {
            // Collapsed parent → expand.
            const id = current.dataset.treeId;
            if (id != null) {
              handleToggle(id);
            }
          } else if (expanded === 'true') {
            // Expanded parent → move to first child.
            const next = items[currentIndex + 1];
            if (next != null && level(next) > level(current)) {
              focusItem(next);
            }
          }
          // Leaf → no-op.
          break;
        }
        case 'ArrowLeft': {
          if (current == null) {
            break;
          }
          e.preventDefault();
          const expanded = current.getAttribute('aria-expanded');
          if (expanded === 'true') {
            // Expanded parent → collapse.
            const id = current.dataset.treeId;
            if (id != null) {
              handleToggle(id);
            }
          } else {
            // Otherwise → move to parent treeitem (nearest shallower item
            // scanning upward in visible order).
            const currentLevel = level(current);
            for (let i = currentIndex - 1; i >= 0; i--) {
              const candidate = items[i];
              if (candidate != null && level(candidate) < currentLevel) {
                focusItem(candidate);
                break;
              }
            }
          }
          break;
        }
        case 'Home': {
          e.preventDefault();
          focusNextEnabledFrom(0, 1);
          break;
        }
        case 'End': {
          e.preventDefault();
          focusNextEnabledFrom(items.length - 1, -1);
          break;
        }
        case 'Enter':
        case ' ': {
          if (current == null || !isEnabled(current)) {
            break;
          }
          e.preventDefault();
          // Activate the item: prefer its own inner action (link/button);
          // fall back to toggling expansion for a parent without its own
          // action. Scoped to this treeitem's own row — never a descendant
          // treeitem's action inside an expanded group.
          const candidates = current.querySelectorAll<HTMLElement>(
            'a[href], button:not([aria-label="Toggle children"])',
          );
          let innerAction: HTMLElement | undefined;
          for (const candidate of candidates) {
            if (candidate.closest('[role="treeitem"]') === current) {
              innerAction = candidate;
              break;
            }
          }
          if (innerAction != null) {
            innerAction.click();
          } else if (current.getAttribute('aria-expanded') != null) {
            const id = current.dataset.treeId;
            if (id != null) {
              handleToggle(id);
            }
          }
          break;
        }
        default:
          break;
      }
    },
    [getVisibleItems, isEnabled, focusItem, level, handleToggle],
  );

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
          isTabbable={item.id === resolvedActiveId}
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
        {...stylex.props(styles.list)}>
        {renderItems(items, 0, [])}
      </ul>
    </div>
  );
}

TreeList.displayName = 'TreeList';
