// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file TreeListItem.tsx
 * @input Uses React, StyleX, theme tokens, TreeListBranches
 * @output Exports TreeListItem component (internal, not publicly exported)
 * @position Internal implementation; consumed by TreeList.tsx
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/TreeList/TreeList.doc.mjs
 * - /packages/core/src/TreeList/TreeList.tsx
 * - /packages/cli/templates/blocks/components/TreeList/ (showcase blocks)
 */

import {useId, useMemo, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  radiusVars,
  spacingVars,
  durationVars,
  easeVars,
  typeScaleVars,
} from '../theme/tokens.stylex';
import {getIcon} from '../Icon/globalIconRegistry';
import {mergeProps, isRenderable} from '../utils';
import {useLinkComponent} from '../Link/useLinkComponent';
import {TreeListBranches} from './TreeListBranches';
import type {TreeListDensity, TreeListExpandIconState} from './TreeListTypes';
import {themeProps} from '../utils/themeProps';
import {useTranslator} from '../i18n';

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  wrapper: {
    listStyleType: 'none',
    margin: 0,
    padding: 0,
    position: 'relative',
    width: '100%',
    // The treeitem row is the roving-tabindex focus owner; suppress the
    // native focus ring in favor of the row's :focus-visible outline below.
    outline: 'none',
    // Publish this row's own focus state as an inheritable CSS variable
    // instead of matching it via an ancestor selector. Every nested <li>
    // redeclares these vars (default: 'none' / '0'), so a descendant row's
    // default shadows an ancestor's active value — the ring can never leak
    // past the nearest containing treeitem, however deep the tree nests.
    '--_tree-focus-outline': {
      default: 'none',
      ':focus-visible': `2px solid ${colorVars['--color-accent']}`,
    },
    '--_tree-focus-outline-offset': {
      default: '0',
      ':focus-visible': '2px',
    },
  },
  childGroup: {
    margin: 0,
    padding: 0,
    listStyleType: 'none',
  },
  treeBranches: {
    paddingInlineStart: spacingVars['--spacing-2'],
  },
  rowWrapper: {
    position: 'relative',
  },
  contentWrapper: {
    borderRadius: radiusVars['--radius-element'],
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
    paddingInline: spacingVars['--spacing-2'],
    outline: 'none',
    overflow: 'hidden',
    position: 'relative',
    boxSizing: 'border-box',
    textAlign: 'start',
  },
  interactive: {
    cursor: 'pointer',
    transitionProperty: 'background-image',
    transitionDuration: durationVars['--duration-fast'],
    transitionTimingFunction: easeVars['--ease-standard'],
    backgroundImage: {
      default: null,
      ':hover': {
        '@media (hover: hover)': `linear-gradient(${colorVars['--color-overlay-hover']}, ${colorVars['--color-overlay-hover']})`,
      },
      ':active': `linear-gradient(${colorVars['--color-overlay-pressed']}, ${colorVars['--color-overlay-pressed']})`,
    },
  },
  focusVisibleOutline: {
    outline: {
      // Reads the row's own --_tree-focus-outline (published on the <li> in
      // `wrapper`), which resolves to the nearest containing treeitem only.
      default: 'var(--_tree-focus-outline, none)',
      // Also support inner focusable actions.
      ':has(:focus-visible)': `2px solid ${colorVars['--color-accent']}`,
    },
    outlineOffset: {
      default: 'var(--_tree-focus-outline-offset, 0)',
      ':has(:focus-visible)': '2px',
    },
  },
  disabled: {
    cursor: 'not-allowed',
    opacity: 0.5,
    pointerEvents: 'none' as const,
  },
  selected: {
    backgroundColor: colorVars['--color-accent-muted'],
  },
  invisibleButton: {
    all: 'unset',
    cursor: 'inherit',
    font: 'inherit',
    color: 'inherit',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minWidth: 0,
    textAlign: 'start',
    // Suppress inner focus ring — the parent <li> handles it via :has(:focus-visible)
    outline: 'none',
  },
  invisibleAnchor: {
    all: 'unset',
    cursor: 'inherit',
    font: 'inherit',
    color: 'inherit',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minWidth: 0,
    textAlign: 'start',
    textDecoration: 'none',
    // Suppress inner focus ring — the parent <li> handles it via :has(:focus-visible)
    outline: 'none',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minWidth: 0,
    textAlign: 'start',
  },
  label: {
    color: colorVars['--color-text-primary'],
  },
  description: {
    color: colorVars['--color-text-secondary'],
  },
  startContent: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
  },
  endContent: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    marginInlineStart: 'auto',
  },
  chevronContainer: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: spacingVars['--spacing-4'],
    height: spacingVars['--spacing-4'],
    fontSize: spacingVars['--spacing-4'],
    cursor: 'pointer',
    border: 'none',
    background: 'none',
    padding: 0,
    color: colorVars['--color-icon-secondary'],
    borderRadius: radiusVars['--radius-inner'],
    marginInlineStart: spacingVars['--spacing-1'],
    marginInlineEnd: `calc(${spacingVars['--spacing-1']} * -1)`,
  },
  chevronButton: {
    all: 'unset',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: spacingVars['--spacing-4'],
    height: spacingVars['--spacing-4'],
    fontSize: spacingVars['--spacing-4'],
    cursor: 'pointer',
    color: colorVars['--color-icon-secondary'],
    borderRadius: radiusVars['--radius-inner'],
    marginInlineStart: spacingVars['--spacing-1'],
    marginInlineEnd: `calc(${spacingVars['--spacing-1']} * -1)`,
  },
  chevronSvg: {
    display: 'flex',
    transitionProperty: 'transform',
    transitionDuration: durationVars['--duration-fast'],
    transitionTimingFunction: easeVars['--ease-standard'],
  },
  chevronExpanded: {
    transform: 'rotate(90deg)',
  },
  chevronCollapsed: {
    transform: 'rotate(0deg)',
  },
  // Custom icons from renderExpandIcon swap per state instead of rotating —
  // no transform, no transition.
  customExpandIcon: {
    display: 'flex',
  },
  // Indicator slot for leaf items when renderExpandIcon supplies a leaf icon.
  // Same metrics as the chevron toggle so leaves align, but non-interactive.
  leafIconContainer: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: spacingVars['--spacing-4'],
    height: spacingVars['--spacing-4'],
    fontSize: spacingVars['--spacing-4'],
    color: colorVars['--color-icon-secondary'],
    marginInlineStart: spacingVars['--spacing-1'],
    marginInlineEnd: `calc(${spacingVars['--spacing-1']} * -1)`,
  },
});

const densityStyles = stylex.create({
  compact: {
    paddingBlock: spacingVars['--spacing-1'],
    fontSize: typeScaleVars['--text-body-size'],
    lineHeight: typeScaleVars['--text-body-leading'],
  },
  balanced: {
    paddingBlock: spacingVars['--spacing-2'],
    fontSize: typeScaleVars['--text-body-size'],
    lineHeight: typeScaleVars['--text-body-leading'],
  },
  spacious: {
    paddingBlock: spacingVars['--spacing-3'],
    fontSize: typeScaleVars['--text-body-size'],
    lineHeight: typeScaleVars['--text-body-leading'],
  },
});

const descriptionSizeStyles = stylex.create({
  compact: {
    fontSize: typeScaleVars['--text-supporting-size'],
    lineHeight: typeScaleVars['--text-supporting-leading'],
  },
  balanced: {
    fontSize: typeScaleVars['--text-supporting-size'],
    lineHeight: typeScaleVars['--text-supporting-leading'],
  },
  spacious: {
    fontSize: typeScaleVars['--text-supporting-size'],
    lineHeight: typeScaleVars['--text-supporting-leading'],
  },
});

// =============================================================================
// Types
// =============================================================================

export interface TreeListItemInternalProps {
  id: string;
  label: React.ReactNode;
  description?: string;
  startContent?: React.ReactNode;
  endContent?: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  href?: string;
  target?: string;
  isDisabled?: boolean;
  isSelected?: boolean;
  hasChildren: boolean;
  nestedLevel: number;
  isLast: boolean;
  ancestorsIsLast: ReadonlyArray<boolean>;
  isExpanded: boolean;
  onToggle?: (id: string) => void;
  /**
   * Custom expand/collapse indicator (see TreeListProps.renderExpandIcon).
   * Non-renderable returns fall back to the default chevron for parents and
   * to no indicator (with the leaf alignment offset) for leaves.
   */
  renderExpandIcon?: (state: TreeListExpandIconState) => ReactNode;
  density: TreeListDensity;
  /** Pre-rendered children subtree (rendered by the parent recursion) */
  renderedChildren?: ReactNode;
  /** 1-based position of this item among its siblings (aria-posinset). */
  posInSet: number;
  /** Number of siblings at this level (aria-setsize). */
  setSize: number;
  /**
   * Whether this treeitem is the initial roving-tabindex seed. Exactly one
   * treeitem is seeded tabbable at mount; useTreeFocus (hasRovingTabIndex)
   * then owns the tab stop dynamically.
   */
  isTabbable: boolean;
}

// =============================================================================
// Component
// =============================================================================

export function TreeListItem({
  id,
  label,
  description,
  startContent,
  endContent,
  onClick,
  href,
  target,
  isDisabled = false,
  isSelected = false,
  hasChildren,
  nestedLevel,
  isLast,
  ancestorsIsLast,
  isExpanded,
  onToggle,
  renderExpandIcon,
  density,
  renderedChildren,
  posInSet,
  setSize,
  isTabbable,
}: TreeListItemInternalProps) {
  const t = useTranslator();
  const labelId = useId();
  const descriptionId = useId();
  const LinkComponent = useLinkComponent();
  const isInteractive = onClick != null || href != null;

  const handleToggle = useMemo(
    () =>
      hasChildren && onToggle != null
        ? (e: React.MouseEvent) => {
            e.stopPropagation();
            onToggle(id);
          }
        : undefined,
    [hasChildren, onToggle, id],
  );

  const handleClick = useMemo(() => {
    if (onClick != null || (hasChildren && onToggle != null)) {
      return (e: React.MouseEvent) => {
        if (isDisabled) {
          return;
        }
        const el = e.target as HTMLElement;
        if (el.closest('button, a, input, select, textarea')) {
          return;
        }
        if (onClick != null) {
          onClick(e);
        } else if (hasChildren && onToggle != null) {
          onToggle(id);
        }
      };
    }
    return undefined;
  }, [onClick, hasChildren, onToggle, id, isDisabled]);

  const customIcon =
    renderExpandIcon != null
      ? renderExpandIcon({isExpanded, hasChildren, isDisabled})
      : null;
  const hasCustomIcon = isRenderable(customIcon);

  // A leaf occupies the indicator slot only when renderExpandIcon supplies an
  // icon for it; otherwise the leaf keeps the alignment offset below.
  const hasIndicator = hasChildren || hasCustomIcon;

  const computedMarginLeft = hasIndicator
    ? `calc(${nestedLevel} * ${spacingVars['--spacing-4']})`
    : `calc(${nestedLevel} * ${spacingVars['--spacing-4']} + ${spacingVars['--spacing-4']} + ${spacingVars['--spacing-2']})`;

  const labelAndDescription = (
    <>
      <span id={labelId} {...stylex.props(styles.label)}>
        {label}
      </span>
      {description != null && (
        <span
          id={descriptionId}
          {...stylex.props(styles.description, descriptionSizeStyles[density])}>
          {description}
        </span>
      )}
    </>
  );

  const indicatorIcon = hasCustomIcon ? (
    // Custom state-aware icons replace the rotation animation entirely — an
    // open-folder icon must not also be rotated 90°.
    <span {...stylex.props(styles.customExpandIcon)}>{customIcon}</span>
  ) : (
    <span
      {...stylex.props(
        styles.chevronSvg,
        isExpanded ? styles.chevronExpanded : styles.chevronCollapsed,
      )}>
      {getIcon('chevronRight')}
    </span>
  );

  const indicator = hasChildren ? (
    handleToggle != null ? (
      // Real toggle button whenever expand/collapse is supported, so the row
      // can be expanded from the keyboard even when the item has no onClick/href
      // (row-level onClick is the only click path in that case, but there is no
      // focusable element to receive Enter/Space). The row's handleClick ignores
      // clicks originating inside a <button>, so this never double-toggles.
      <button
        type="button"
        aria-expanded={isExpanded}
        aria-label={t('@astryx.treeList.toggleChildren')}
        // Stable identity for TreeList's activateItem selector — do not
        // remove without also updating TreeList.tsx.
        data-tree-toggle=""
        disabled={isDisabled}
        // Roving tabindex lives on the treeitem row; the chevron toggle is not
        // a separate tab stop. Row-level Enter/Space forwards to this button.
        tabIndex={-1}
        onClick={handleToggle}
        {...stylex.props(styles.chevronButton)}>
        {indicatorIcon}
      </button>
    ) : (
      // Non-interactive chevron only when toggling is not wired up at all
      <span {...stylex.props(styles.chevronContainer)}>{indicatorIcon}</span>
    )
  ) : hasCustomIcon ? (
    // Leaf indicator slot (e.g. a file icon in a folder tree). Never a toggle:
    // leaves have nothing to expand.
    <span {...stylex.props(styles.leafIconContainer)}>{customIcon}</span>
  ) : null;

  const innerContent = (
    <>
      {indicator}
      {startContent != null && (
        <span {...stylex.props(styles.startContent)}>{startContent}</span>
      )}
      {href != null ? (
        <LinkComponent
          href={href}
          target={target}
          aria-disabled={isDisabled || undefined}
          aria-labelledby={labelId}
          aria-describedby={description != null ? descriptionId : undefined}
          // Roving tabindex lives on the treeitem row; inner action is not a
          // separate tab stop. Activation is forwarded from the row.
          tabIndex={-1}
          {...stylex.props(styles.invisibleAnchor)}>
          {labelAndDescription}
        </LinkComponent>
      ) : onClick != null ? (
        <button
          type="button"
          onClick={onClick}
          disabled={isDisabled}
          aria-labelledby={labelId}
          aria-describedby={description != null ? descriptionId : undefined}
          // Roving tabindex lives on the treeitem row; inner action is not a
          // separate tab stop. Activation is forwarded from the row.
          tabIndex={-1}
          {...stylex.props(styles.invisibleButton)}>
          {labelAndDescription}
        </button>
      ) : (
        <span {...stylex.props(styles.content)}>{labelAndDescription}</span>
      )}
      {endContent != null && (
        <span {...stylex.props(styles.endContent)}>{endContent}</span>
      )}
    </>
  );

  return (
    <li
      role="treeitem"
      aria-expanded={hasChildren ? isExpanded : undefined}
      aria-selected={isSelected || undefined}
      aria-disabled={isDisabled || undefined}
      aria-level={nestedLevel + 1}
      aria-posinset={posInSet}
      aria-setsize={setSize}
      // Roving tabindex: exactly one visible treeitem is tabbable at a time.
      // Disabled items are skipped by the tree keyboard handler but remain
      // in the accessibility tree.
      tabIndex={isDisabled ? -1 : isTabbable ? 0 : -1}
      data-tree-id={id}
      data-tree-level={nestedLevel + 1}
      data-tree-disabled={isDisabled || undefined}
      {...stylex.props(styles.wrapper)}>
      <div {...stylex.props(styles.treeBranches)}>
        <TreeListBranches
          ancestorsIsLast={ancestorsIsLast}
          isLast={isLast}
          nestedLevel={nestedLevel}
        />
      </div>
      <div {...stylex.props(styles.rowWrapper)}>
        <div
          {...mergeProps(
            themeProps('tree-list-item', {
              density,
              selected: isSelected ? 'selected' : null,
              disabled: isDisabled ? 'disabled' : null,
            }),
            stylex.props(
              styles.contentWrapper,
              densityStyles[density],
              (isInteractive || (hasChildren && onClick == null)) &&
                styles.interactive,
              (isInteractive || (hasChildren && onClick == null)) &&
                styles.focusVisibleOutline,
              isDisabled && styles.disabled,
              isSelected && styles.selected,
            ),
          )}
          style={{marginLeft: computedMarginLeft}}
          onClick={handleClick}>
          {innerContent}
        </div>
      </div>
      {isExpanded && renderedChildren != null && (
        <ul role="group" {...stylex.props(styles.childGroup)}>
          {renderedChildren}
        </ul>
      )}
    </li>
  );
}

TreeListItem.displayName = 'TreeListItem';
