/**
 * @file XDSTreeList.tsx
 * @input Uses React, StyleX, theme tokens, XDSTreeListItem, XDSTreeListTypes
 * @output Exports XDSTreeList component, XDSTreeListProps type
 * @position Core implementation; consumed by index.ts
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/TreeList/TreeList.doc.mjs
 * - /packages/core/src/TreeList/index.ts
 * - /apps/storybook/stories/TreeList.stories.tsx
 */

'use client';

import {useId, useState, useMemo, useCallback, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';
import {spacingVars} from '../theme/tokens.stylex';
import {xdsClassName, mergeProps} from '../utils';
import {XDSTreeListItem} from './XDSTreeListItem';
import type {XDSTreeListItemData, XDSTreeListDensity} from './XDSTreeListTypes';

// =============================================================================
// Types
// =============================================================================

export {type XDSTreeListDensity} from './XDSTreeListTypes';

export interface XDSTreeListProps {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLDivElement>;

  /**
   * Tree items as a recursive data structure.
   * Each item can have nested `children` arrays.
   */
  items: XDSTreeListItemData[];

  /**
   * Spacing density for tree list items.
   * - 'compact': Tighter spacing for dense UIs
   * - 'balanced': Standard spacing
   * - 'spacious': Extra spacing for readability
   * @default 'balanced'
   */
  density?: XDSTreeListDensity;

  /**
   * Header content rendered above the tree list.
   * Semantically associated via aria-labelledby.
   */
  header?: ReactNode;

  /**
   * StyleX styles created via `stylex.create()`. Merged with the component's
   * base styles inside a single `stylex.props()` call for optimal deduplication.
   */
  xstyle?: StyleXStyles;

  /**
   * CSS class name(s) appended to the root element.
   * If you're using StyleX, prefer `xstyle` for optimal style deduplication.
   */
  className?: string;

  /**
   * Inline styles to apply to the root element. Spread after StyleX
   * inline styles, so these values take priority.
   */
  style?: React.CSSProperties;

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
function collectExpandedKeys(items: XDSTreeListItemData[]): string[] {
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
 * <XDSTreeList
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
export function XDSTreeList({
  items,
  density = 'balanced',
  header,
  xstyle,
  className,
  style,
  'data-testid': testId,
  ref,
}: XDSTreeListProps) {
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
          ? prev.get(id)!
          : expandedKeysFromProps.has(id);
        next.set(id, !isCurrentlyExpanded);
        return next;
      });
    },
    [expandedKeysFromProps],
  );

  function renderItems(
    items: XDSTreeListItemData[],
    nestedLevel: number,
    ancestorsIsLast: ReadonlyArray<boolean>,
  ): ReactNode {
    return items.map((item, index) => {
      const isLast = index === items.length - 1;
      const isExpanded = expandedKeysOverride.has(item.id)
        ? expandedKeysOverride.get(item.id)!
        : expandedKeysFromProps.has(item.id);
      const hasChildren = item.children != null && item.children.length > 0;

      const ancestorsIsLastForChildren = hasChildren
        ? [...ancestorsIsLast, isLast]
        : ancestorsIsLast;

      const renderedChildren =
        isExpanded && hasChildren
          ? renderItems(
              item.children!,
              nestedLevel + 1,
              ancestorsIsLastForChildren,
            )
          : undefined;

      return (
        <XDSTreeListItem
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
        />
      );
    });
  }

  return (
    <div
      ref={ref}
      data-testid={testId}
      {...mergeProps(
        xdsClassName('tree-list', {density}),
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
        role="tree"
        aria-labelledby={header != null ? headerId : undefined}
        {...stylex.props(styles.list)}>
        {renderItems(items, 0, [])}
      </ul>
    </div>
  );
}

XDSTreeList.displayName = 'XDSTreeList';
