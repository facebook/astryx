/**
 * @file XDSTreeListItem.tsx
 * @input Uses React, StyleX, theme tokens, XDSTreeListBranches
 * @output Exports XDSTreeListItem component (internal, not publicly exported)
 * @position Internal implementation; consumed by XDSTreeList.tsx
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/TreeList/TreeList.doc.mjs
 * - /packages/core/src/TreeList/XDSTreeList.tsx
 */

'use client';

import {useId, useMemo, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  radiusVars,
  spacingVars,
  textSizeVars,
  lineHeightVars,
  transitionVars,
} from '../theme/tokens.stylex';
import {getIcon} from '../Icon/globalIconRegistry';
import {
  XDSTreeListBranches,
  XDSTreeListHorizontalConnector,
} from './XDSTreeListBranches';
import type {XDSTreeListDensity} from './XDSTreeListTypes';

// =============================================================================
// Constants
// =============================================================================

const INDENT = 20;
const CHEVRON_SIZE = 16;
const CHEVRON_MARGIN = 8;
const BRANCH_MARGIN_LEFT = 9;

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
    paddingInlineStart: BRANCH_MARGIN_LEFT,
  },
  rowWrapper: {
    position: 'relative',
  },
  contentWrapper: {
    borderRadius: radiusVars['--radius-content'],
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
    outline: 'none',
    overflow: 'hidden',
    position: 'relative',
    boxSizing: 'border-box',
    textAlign: 'start',
  },
  interactive: {
    cursor: 'pointer',
    transitionProperty: 'background-image',
    transitionDuration: transitionVars['--transition-fast'],
    backgroundImage: {
      default: null,
      ':hover': {
        '@media (hover: hover)': `linear-gradient(${colorVars['--color-hover-overlay']}, ${colorVars['--color-hover-overlay']})`,
      },
      ':active': `linear-gradient(${colorVars['--color-pressed-overlay']}, ${colorVars['--color-pressed-overlay']})`,
    },
  },
  focusWithinOutline: {
    outline: {
      default: 'none',
      ':focus-within': `2px solid ${colorVars['--color-focus-outline']}`,
    },
    outlineOffset: {
      default: '0',
      ':focus-within': '2px',
    },
  },
  disabled: {
    cursor: 'not-allowed',
    opacity: 0.5,
    pointerEvents: 'none' as const,
  },
  selected: {
    backgroundColor: colorVars['--color-accent-deemphasized'],
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
    width: CHEVRON_SIZE,
    height: CHEVRON_SIZE,
    fontSize: CHEVRON_SIZE,
    cursor: 'pointer',
    border: 'none',
    background: 'none',
    padding: 0,
    color: colorVars['--color-icon-secondary'],
    borderRadius: radiusVars['--radius-content'],
  },
  chevronButton: {
    all: 'unset',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: CHEVRON_SIZE,
    height: CHEVRON_SIZE,
    fontSize: CHEVRON_SIZE,
    cursor: 'pointer',
    color: colorVars['--color-icon-secondary'],
    borderRadius: radiusVars['--radius-content'],
  },
  chevronSvg: {
    display: 'flex',
    transitionProperty: 'transform',
    transitionDuration: transitionVars['--transition-fast'],
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
    paddingInline: spacingVars['--spacing-2'],
    fontSize: textSizeVars['--text-xsm'],
    lineHeight: lineHeightVars['--leading-snug'],
  },
  balanced: {
    paddingBlock: spacingVars['--spacing-2'],
    paddingInline: spacingVars['--spacing-3'],
    fontSize: textSizeVars['--text-sm'],
    lineHeight: lineHeightVars['--leading-snug'],
  },
  spacious: {
    paddingBlock: spacingVars['--spacing-3'],
    paddingInline: spacingVars['--spacing-4'],
    fontSize: textSizeVars['--text-base'],
    lineHeight: lineHeightVars['--leading-normal'],
  },
});

const descriptionSizeStyles = stylex.create({
  compact: {
    fontSize: textSizeVars['--text-2xs'],
    lineHeight: lineHeightVars['--leading-snug'],
  },
  balanced: {
    fontSize: textSizeVars['--text-xsm'],
    lineHeight: lineHeightVars['--leading-snug'],
  },
  spacious: {
    fontSize: textSizeVars['--text-sm'],
    lineHeight: lineHeightVars['--leading-normal'],
  },
});

// =============================================================================
// Types
// =============================================================================

export interface XDSTreeListItemInternalProps {
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
  density: XDSTreeListDensity;
  /** Pre-rendered children subtree (rendered by the parent recursion) */
  renderedChildren?: ReactNode;
}

// =============================================================================
// Component
// =============================================================================

export function XDSTreeListItem({
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
}: XDSTreeListItemInternalProps) {
  const labelId = useId();
  const descriptionId = useId();
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
        if (isDisabled) return;
        const el = e.target as HTMLElement;
        if (el.closest('button, a, input, select, textarea')) return;
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
    ? nestedLevel * INDENT
    : nestedLevel * INDENT +
      CHEVRON_SIZE +
      (startContent != null ? 0 : CHEVRON_MARGIN);

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
        <a
          href={href}
          target={target}
          aria-disabled={isDisabled || undefined}
          aria-labelledby={labelId}
          aria-describedby={description != null ? descriptionId : undefined}
          tabIndex={isDisabled ? -1 : undefined}
          {...stylex.props(styles.invisibleAnchor)}>
          {labelAndDescription}
        </a>
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
        <XDSTreeListBranches
          ancestorsIsLast={ancestorsIsLast}
          isLast={isLast}
          levelIndent={INDENT}
          marginLeft={BRANCH_MARGIN_LEFT}
          nestedLevel={nestedLevel}
        />
      </div>
      <div {...stylex.props(styles.rowWrapper)}>
        <XDSTreeListHorizontalConnector
          hasChildren={hasChildren}
          levelIndent={INDENT}
          marginLeft={BRANCH_MARGIN_LEFT}
          nestedLevel={nestedLevel}
        />
        <div
          {...stylex.props(
            styles.contentWrapper,
            densityStyles[density],
            (isInteractive || (hasChildren && onClick == null)) &&
              styles.interactive,
            (isInteractive || (hasChildren && onClick == null)) &&
              styles.focusWithinOutline,
            isDisabled && styles.disabled,
            isSelected && styles.selected,
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

XDSTreeListItem.displayName = 'XDSTreeListItem';
