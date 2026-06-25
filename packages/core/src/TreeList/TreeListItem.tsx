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
import {mergeProps} from '../utils';
import {useLinkComponent} from '../Link/useLinkComponent';
import {TreeListBranches} from './TreeListBranches';
import type {TreeListDensity} from './TreeListTypes';
import {themeProps} from '../utils/themeProps';

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
      default: 'none',
      ':has(:focus-visible)': `2px solid ${colorVars['--color-accent']}`,
    },
    outlineOffset: {
      default: '0',
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
  density: TreeListDensity;
  /** Pre-rendered children subtree (rendered by the parent recursion) */
  renderedChildren?: ReactNode;
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
  density,
  renderedChildren,
}: TreeListItemInternalProps) {
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

  const computedMarginLeft = hasChildren
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

  const chevronIcon = (
    <span
      {...stylex.props(
        styles.chevronSvg,
        isExpanded ? styles.chevronExpanded : styles.chevronCollapsed,
      )}>
      {getIcon('chevronRight')}
    </span>
  );

  const chevron = hasChildren ? (
    handleClick != null && onClick != null ? (
      // Separate toggle button when item has its own onClick
      <button
        type="button"
        aria-expanded={isExpanded}
        aria-label="Toggle children"
        onClick={handleToggle}
        {...stylex.props(styles.chevronButton)}>
        {chevronIcon}
      </button>
    ) : (
      // Non-interactive chevron when clicking the row toggles
      <span {...stylex.props(styles.chevronContainer)}>{chevronIcon}</span>
    )
  ) : null;

  const innerContent = (
    <>
      {chevron}
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
          tabIndex={isDisabled ? -1 : undefined}
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
