'use client';

/**
 * @file XDSTreeListBranches.tsx
 * @input Uses React, StyleX, theme tokens
 * @output Exports XDSTreeListBranches component (internal)
 * @position Presentational component for tree connector lines; consumed by XDSTreeListItem.tsx
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/TreeList/XDSTreeListItem.tsx
 */

import * as stylex from '@stylexjs/stylex';
import {colorVars, spacingVars} from '../theme/tokens.stylex';

const LINE_WIDTH = 2;

/**
 * Branch margin from the left edge. No exact spacing token for 10px,
 * so we use calc(--spacing-2 + --spacing-0-5) = 8 + 2 = 10.
 */
const BRANCH_MARGIN = `calc(${spacingVars['--spacing-2']} + ${spacingVars['--spacing-0-5']})`;

/** Per-level indent width, matching --spacing-5 (20px). */
const LEVEL_INDENT = spacingVars['--spacing-5'];

const styles = stylex.create({
  container: {
    height: '100%',
    position: 'absolute',
    width: spacingVars['--spacing-5'],
  },
  verticalLine: {
    borderRadius: 1,
    left: 0,
    margin: 'auto',
    position: 'absolute',
    right: 0,
    width: LINE_WIDTH,
    backgroundColor: colorVars['--color-border-emphasized'],
  },
  verticalFull: {
    height: 'calc(100% + 1px)',
  },
  verticalToHalf: {
    height: '50%',
  },
  verticalToHalfWithTerminus: {
    height: '50%',
    borderBottomRightRadius: LINE_WIDTH * 2,
  },
  connectorContainer: {
    position: 'absolute',
    width: spacingVars['--spacing-5'],
    height: '100%',
    top: 0,
  },
  horizontalLine: {
    borderRadius: 1,
    height: LINE_WIDTH,
    left: '50%',
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '50%',
    backgroundColor: colorVars['--color-border-emphasized'],
  },
  horizontalLineFull: {
    width: '100%',
  },
});

// =============================================================================
// Types
// =============================================================================

interface XDSTreeListBranchesProps {
  ancestorsIsLast: ReadonlyArray<boolean>;
  isLast: boolean;
  nestedLevel: number;
}

interface XDSTreeListHorizontalConnectorProps {
  hasChildren: boolean;
  nestedLevel: number;
}

// =============================================================================
// Components
// =============================================================================

/**
 * Renders vertical lines showing parent-child relationships in the tree.
 * Positioned in a full-height container to span the entire item including children.
 */
export function XDSTreeListBranches({
  ancestorsIsLast,
  isLast,
  nestedLevel,
}: XDSTreeListBranchesProps) {
  return (
    <>
      {ancestorsIsLast.map(
        (ancestorIsLast, level) =>
          // Skip the level that the current-item connector occupies
          // (nestedLevel - 1), since that position is rendered below
          // with the correct terminus/continuation style.
          !ancestorIsLast &&
          level !== nestedLevel - 1 && (
            <div
              key={level}
              {...stylex.props(styles.container)}
              style={{
                left: `calc(${BRANCH_MARGIN} + ${level} * ${LEVEL_INDENT})`,
              }}>
              <div
                {...stylex.props(styles.verticalLine, styles.verticalFull)}
              />
            </div>
          ),
      )}
      {nestedLevel > 0 && (
        <div
          {...stylex.props(styles.container)}
          style={{
            left: `calc(${BRANCH_MARGIN} + ${nestedLevel - 1} * ${LEVEL_INDENT})`,
          }}>
          <div
            {...stylex.props(
              styles.verticalLine,
              isLast ? styles.verticalToHalfWithTerminus : styles.verticalFull,
            )}
          />
        </div>
      )}
    </>
  );
}

/**
 * Renders the horizontal connector line from a parent branch to a child item.
 * Must be rendered inside a container whose height matches the content row,
 * so that top: 50% centers on the label, not the full item including children.
 */
export function XDSTreeListHorizontalConnector({
  hasChildren,
  nestedLevel,
}: XDSTreeListHorizontalConnectorProps) {
  if (nestedLevel <= 0) return null;

  return (
    <div
      {...stylex.props(styles.connectorContainer)}
      style={{
        left: `calc(${BRANCH_MARGIN} + ${nestedLevel - 1} * ${LEVEL_INDENT})`,
      }}>
      <div
        {...stylex.props(
          styles.horizontalLine,
          !hasChildren && styles.horizontalLineFull,
        )}
      />
    </div>
  );
}
