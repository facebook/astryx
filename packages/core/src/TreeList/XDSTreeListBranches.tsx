/**
 * @file XDSTreeListBranches.tsx
 * @input Uses React, StyleX, theme tokens
 * @output Exports XDSTreeListBranches component (internal)
 * @position Presentational component for tree connector lines; consumed by XDSTreeListItem.tsx
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/TreeList/XDSTreeListItem.tsx
 */

'use client';

import * as stylex from '@stylexjs/stylex';
import {colorVars} from '../theme/tokens.stylex';
import type {
  XDSTreeListBranchAlignment,
  XDSTreeListDensity,
} from './XDSTreeListTypes';

const LINE_WIDTH = 2;

// Content row heights per density (paddingBlock * 2 + line-height).
// These must stay in sync with densityStyles in XDSTreeListItem.tsx.
const LABEL_ROW_HEIGHT_COMPACT = 28;
const LABEL_ROW_HEIGHT_BALANCED = 36;
const LABEL_ROW_HEIGHT_SPACIOUS = 48;

const styles = stylex.create({
  container: {
    height: '100%',
    position: 'absolute',
    width: 20,
  },
  verticalLine: {
    borderRadius: 1,
    left: 0,
    margin: 'auto',
    position: 'absolute',
    right: 0,
    width: LINE_WIDTH,
    backgroundColor: colorVars['--color-divider-emphasized'],
  },
  verticalFull: {
    height: 'calc(100% + 1px)',
  },
  horizontalLine: {
    borderRadius: 1,
    height: LINE_WIDTH,
    left: '50%',
    position: 'absolute',
    width: '50%',
    backgroundColor: colorVars['--color-divider-emphasized'],
  },
  horizontalLineFull: {
    width: '100%',
  },
});

// Vertical line from top to chevron center of content row (L-connector for last child)
const verticalToCenter = stylex.create({
  compact: {height: LABEL_ROW_HEIGHT_COMPACT / 2 - 2 + LINE_WIDTH},
  balanced: {height: LABEL_ROW_HEIGHT_BALANCED / 2 - 2 + LINE_WIDTH},
  spacious: {height: LABEL_ROW_HEIGHT_SPACIOUS / 2 - 2 + LINE_WIDTH},
});

// Horizontal line positioned to align with chevron center
const horizontalAtCenter = stylex.create({
  compact: {top: LABEL_ROW_HEIGHT_COMPACT / 2 - 2},
  balanced: {top: LABEL_ROW_HEIGHT_BALANCED / 2 - 2},
  spacious: {top: LABEL_ROW_HEIGHT_SPACIOUS / 2 - 2},
});

// =============================================================================
// Types
// =============================================================================

interface XDSTreeListBranchesProps {
  ancestorsIsLast: ReadonlyArray<boolean>;
  branchAlignment: XDSTreeListBranchAlignment;
  density: XDSTreeListDensity;
  hasChildren: boolean;
  isLast: boolean;
  levelIndent: number;
  marginLeft: number;
  nestedLevel: number;
}

interface BranchItemProps {
  density: XDSTreeListDensity;
  hasChildren?: boolean;
  leftPosition: number;
  type: 'parentToParentSibling' | 'parentToChildAndSibling' | 'parentToChild';
}

// =============================================================================
// Components
// =============================================================================

function TreeListBranchItem({
  density,
  hasChildren,
  leftPosition,
  type,
}: BranchItemProps) {
  return (
    <div {...stylex.props(styles.container)} style={{left: leftPosition}}>
      <div
        {...stylex.props(
          styles.verticalLine,
          type === 'parentToParentSibling' || type === 'parentToChildAndSibling'
            ? styles.verticalFull
            : verticalToCenter[density],
        )}
      />
      {(type === 'parentToChildAndSibling' || type === 'parentToChild') && (
        <div
          {...stylex.props(
            styles.horizontalLine,
            hasChildren === false && styles.horizontalLineFull,
            horizontalAtCenter[density],
          )}
        />
      )}
    </div>
  );
}

/**
 * Renders lines showing parent-child relationships in the tree.
 *
 * Line types:
 * 1. Pass-through vertical lines for non-last ancestors
 * 2. Parent-to-child connector (L-shaped for last child, T-shaped otherwise)
 */
export function XDSTreeListBranches({
  ancestorsIsLast,
  branchAlignment: _branchAlignment,
  density,
  hasChildren,
  isLast,
  levelIndent,
  marginLeft,
  nestedLevel,
}: XDSTreeListBranchesProps) {
  return (
    <>
      {ancestorsIsLast.map(
        (ancestorIsLast, level) =>
          !ancestorIsLast && (
            <TreeListBranchItem
              key={level}
              density={density}
              leftPosition={marginLeft + level * levelIndent}
              type="parentToParentSibling"
            />
          ),
      )}
      {nestedLevel > 0 && (
        <TreeListBranchItem
          density={density}
          hasChildren={hasChildren}
          leftPosition={marginLeft + (nestedLevel - 1) * levelIndent}
          type={isLast ? 'parentToChild' : 'parentToChildAndSibling'}
        />
      )}
    </>
  );
}
