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
 * - /packages/cli/assets/templates/blocks/components/TreeList/ (showcase blocks)
 */

import {useId, useState, useMemo, useCallback, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {spacingVars} from '../theme/tokens.stylex';
import {mergeProps} from '../utils';
import type {BaseProps} from '../BaseProps';
import {TreeListItem} from './TreeListItem';
import type {
  TreeListItemData,
  TreeListDensity,
  TreeListVariant,
} from './TreeListTypes';
import {themeProps} from '../utils/themeProps';
import {useTreeFocus} from '../hooks/useTreeFocus';

// =============================================================================
// Types
// =============================================================================

export {type TreeListDensity, type TreeListVariant} from './TreeListTypes';

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
   * Visual treatment of the hierarchy guide (connector) lines.
   * - `lineGuides`: connector lines between parent and child rows
   * - `noGuides`: no connector lines; indentation alone conveys nesting
   *
   * Orthogonal to `density` (which controls spacing) — the two compose.
   * @default 'lineGuides'
   */
  variant?: TreeListVariant;

  /**
   * Header content rendered above the tree list.
   * Semantically associated via aria-labelledby.
   */
  header?: ReactNode;

  /**
   * Callback fired on keydown, before TreeList's own arrow-key navigation
   * and expand/collapse handling run. Call `event.preventDefault()` to
   * cancel the built-in behavior for that key entirely — focus and the
   * roving tab stop are left untouched. A handler that doesn't call
   * `preventDefault()` still lets the APG tree keyboard model run
   * afterward.
   */
  onKeyDown?: BaseProps<HTMLDivElement>['onKeyDown'];

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
    // Per-level indentation step. Public, themeable lever: a theme can retune
    // the tree's indent metric (e.g. to `var(--spacing-5)`) via `defineTheme`
    // on the `tree-list` target, and both the row margins (TreeListItem) and
    // the guide-line offsets (TreeListBranches) read it so they stay aligned.
    '--tree-list-indent': spacingVars['--spacing-4'],
    // Vertical gap between adjacent rows. Public, themeable lever (default
    // `--spacing-0-5` = 2px for a subtle separation between rows). A theme sets
    // it on the `tree-list` target to widen or close the gap; the guide
    // connector spans the gap natively (see TreeListBranches) so the line stays
    // continuous and does not overhang the last row — no consumer-side guide
    // tuning needed.
    '--tree-list-row-gap': spacingVars['--spacing-0-5'],
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
  variant = 'lineGuides',
  header,
  xstyle,
  className,
  style,
  'data-testid': testId,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledby,
  onKeyDown: consumerOnKeyDown,
  ref,
  ...restProps
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

  // The consumer's own onKeyDown stays on the root `<div>` (below, via
  // onKeyDownCapture) rather than moving to the `<ul>`: the root is also
  // where the `header` slot mounts, as a sibling of the `<ul>`, so a handler
  // living only on the `<ul>` would never see keydowns from inside `header`.
  // Capture phase (top-down) is what lets it still run before the built-in
  // handler below, which stays in its original bubble-phase spot on the
  // `<ul>` — capture on an ancestor always precedes bubble on a descendant,
  // regardless of listener registration order. `handleTreeKeyDown` just
  // bails once the consumer has already called `preventDefault()`.
  const handleTreeKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLUListElement>) => {
      if (e.defaultPrevented) {
        return;
      }
      handleKeyDown(e);
    },
    [handleKeyDown],
  );

  const hasExpandableItems = items.some(
    item => item.children != null && item.children.length > 0,
  );

  function renderItems(
    items: TreeListItemData[],
    nestedLevel: number,
    ancestorsIsLast: ReadonlyArray<boolean>,
  ): ReactNode {
    // A leaf reserves the chevron column (so its label lines up under a parent's
    // caret) whenever the tree contains ANY expandable item — i.e. whenever a
    // caret exists somewhere to align under. This is a whole-tree property, not
    // a per-group one: a leaf nested under an expandable ancestor must still
    // reserve the column so it stays indented past its parent's label, even if
    // its own immediate group happens to be all leaves. Only a fully flat tree
    // (no expandable items anywhere) has no caret to align under, so its rows
    // sit flush. Because any expandable descendant forces its whole ancestor
    // chain to be expandable, "the tree has an expandable item" is equivalent to
    // "the root group has an expandable item" — checked once at the root.
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
          hasExpandableItems={hasExpandableItems}
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
          variant={variant}
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
        themeProps('tree-list', {density, variant}),
        stylex.props(styles.root, xstyle),
        className,
        style,
      )}
      onKeyDownCapture={consumerOnKeyDown}
      {...restProps}>
      {header != null && (
        <div id={headerId} {...stylex.props(styles.header)}>
          {header}
        </div>
      )}
      <ul
        ref={treeRef}
        role="tree"
        aria-label={header != null ? undefined : ariaLabel}
        aria-labelledby={header != null ? headerId : ariaLabelledby}
        onKeyDown={handleTreeKeyDown}
        onFocus={handleFocus}
        {...stylex.props(styles.list)}>
        {renderItems(items, 0, [])}
      </ul>
    </div>
  );
}

TreeList.displayName = 'TreeList';
