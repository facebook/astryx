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
 * - /packages/cli/assets/templates/blocks/components/TreeList/ (showcase blocks)
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
import {focusOutlineProps} from '../utils/focusOutline.stylex';
import {interactionOverlayStyles} from '../utils/interactionOverlay.stylex';
import {Icon} from '../Icon';
import {mergeProps, isRenderable} from '../utils';
import {useLinkComponent} from '../Link/useLinkComponent';
import {TreeListBranches} from './TreeListBranches';
import type {
  TreeListDensity,
  TreeListVariant,
  TreeListExpandIconState,
} from './TreeListTypes';
import {themeProps} from '../utils/themeProps';
import {useTranslator} from '../i18n';

// =============================================================================
// Styles
// =============================================================================

// The indicator column — toggle button, non-interactive chevron box, and the
// leaf slot filled by `renderExpandIcon` — is sized on Icon's rem scale, not
// on a spacing token: `1rem` is exactly the `<Icon size="sm">` box, so a
// custom glyph at `size="sm"` and the default chevron (also `sm`) fill the
// column at every root font size. The spacing tokens are px, so a
// token-sized column drifts off a rem-sized glyph as soon as the browser's
// font size changes (a 20px root makes `sm` 20px inside a 16px column). The
// same length reserves a leaf's column (see `reservesChevronColumn`).
const INDICATOR_SIZE = '1rem';

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
    // Inter-row gap. Half the public `--tree-list-row-gap` lever sits above and
    // half below the row box; because this is PADDING (not margin) it cannot
    // collapse, so adjacent rows end up a full gap apart — and it rides the
    // `rowWrapper`, which carries no theme target, so the paintable
    // `tree-list-item` stays a pure paint seam (layout lives off it). The <li>s
    // stay contiguous — the gap is padding INSIDE each <li>, not space between
    // them — so the per-<li> connector guide can still span it and read as a
    // continuous line (see TreeListBranches). The lever's default is a subtle
    // `--spacing-0-5` (2px, set on the tree-list root); a theme widens or closes
    // it via the `tree-list` target.
    paddingBlock: 'calc(var(--tree-list-row-gap, 0px) / 2)',
  },
  contentWrapper: {
    borderRadius: radiusVars['--radius-element'],
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
    paddingInline: spacingVars['--spacing-2'],
    // No `outline: 'none'` here: this element receives the shared focus ring,
    // which already defaults to none, and the shorthand would erase it.
    overflow: 'hidden',
    position: 'relative',
    boxSizing: 'border-box',
    textAlign: 'start',
    // Per-level indent. Declared here (not inline) so it lives in
    // `@layer astryx-base` and the theme layer can override it in normal
    // cascade order — an inline longhand would outrank every layer. The row
    // publishes only the computed distance as `--_tree-indent`; the per-level
    // step is the public `--tree-list-indent` lever (see TreeList `root`).
    marginInlineStart: 'var(--_tree-indent, 0px)',
  },
  interactive: {
    cursor: {
      default: 'pointer',
      ':is(:disabled,[aria-disabled="true"])': 'default',
    },
    transitionProperty: 'background-image',
    transitionDuration: durationVars['--duration-fast'],
    transitionTimingFunction: easeVars['--ease-standard'],
  },
  disabled: {
    cursor: 'default',
    opacity: 0.5,
    pointerEvents: 'none' as const,
  },
  selected: {
    backgroundColor: colorVars['--color-accent-muted'],
  },
  invisibleButton: {
    all: 'unset',
    cursor: {
      default: 'inherit',
      ':is(:disabled,[aria-disabled="true"])': 'default',
    },
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
    cursor: {
      default: 'inherit',
      ':is(:disabled,[aria-disabled="true"])': 'default',
    },
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
  // One box for every indicator slot (see INDICATOR_SIZE). `fontSize` sizes
  // 1em-based glyphs — registry SVGs, a raw `<svg width="1em">` — to the
  // column; `<Icon>` brings its own rem box and matches it at `size="sm"`.
  indicatorColumn: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: INDICATOR_SIZE,
    height: INDICATOR_SIZE,
    fontSize: INDICATOR_SIZE,
    color: colorVars['--color-icon-secondary'],
    marginInlineStart: spacingVars['--spacing-1'],
    marginInlineEnd: `calc(${spacingVars['--spacing-1']} * -1)`,
  },
  chevronContainer: {
    cursor: {
      default: 'pointer',
      ':is(:disabled,[aria-disabled="true"])': 'default',
    },
    border: 'none',
    background: 'none',
    padding: 0,
    borderRadius: radiusVars['--radius-inner'],
  },
  chevronButton: {
    all: 'unset',
    cursor: {
      default: 'pointer',
      ':is(:disabled,[aria-disabled="true"])': 'default',
    },
    borderRadius: radiusVars['--radius-inner'],
  },
  chevronSvg: {
    display: 'flex',
    transitionProperty: 'transform',
    transitionDuration: durationVars['--duration-fast'],
    transitionTimingFunction: easeVars['--ease-standard'],
  },
  // The RTL mirror is folded into each state's transform rather than living on
  // a parent span. Both are `transform`, so on one element the later value
  // would win — spelling out `scaleX(-1) rotate(...)` per state composes them
  // exactly as the nested elements did, while leaving a single element to
  // carry the glyph's theme target.
  chevronExpanded: {
    transform: {
      default: 'rotate(90deg)',
      ':is([dir="rtl"] *)': 'scaleX(-1) rotate(90deg)',
    },
  },
  chevronCollapsed: {
    transform: {
      default: 'rotate(0deg)',
      ':is([dir="rtl"] *)': 'scaleX(-1) rotate(0deg)',
    },
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

// `CSSProperties` has no index signature for custom properties, so the row's
// inline style — which publishes the computed indent distance as the private
// `--_tree-indent` — needs this augmentation to typecheck.
type IndentStyle = React.CSSProperties & Record<'--_tree-indent', string>;

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
  /**
   * Whether the tree contains at least one expandable item anywhere (i.e. a
   * caret exists somewhere to align labels under). A leaf reserves the chevron
   * column — the extra offset that lines its label up past an expandable
   * ancestor/sibling's caret — whenever this is true, so it stays indented
   * beyond its parent's label. Only a fully flat tree (no expandable items at
   * all) has no caret to align under, so its rows sit flush (no chevron-column
   * offset). Computed once for the whole tree by TreeList.
   */
  hasExpandableItems: boolean;
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
  /**
   * Guide-line visual treatment. `noGuides` suppresses the connector lines;
   * indentation is unaffected (it lives on the row's `marginLeft`, not the
   * guide element).
   */
  variant: TreeListVariant;
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
  hasExpandableItems,
  nestedLevel,
  isLast,
  ancestorsIsLast,
  isExpanded,
  onToggle,
  renderExpandIcon,
  density,
  variant,
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

  // Per-level indent distance. The per-level step is the public, themeable
  // `--tree-list-indent` lever (default `--spacing-4`, set on the tree-list
  // root). A leaf adds a fixed chevron-column offset (chevron width + gap) so
  // its label lines up past an expandable ancestor/sibling's caret — but ONLY
  // when the tree actually contains an expandable item somewhere. In a fully
  // flat tree there is no caret to align under, so the offset is pointless and
  // every row sits flush, like a parent at that level. A leaf that renders its
  // own indicator (renderExpandIcon supplied a leaf icon) occupies the column
  // itself, so it takes no offset either. That offset is tied to the column's
  // own box (INDICATOR_SIZE), not the indent step, so it does not scale with
  // the lever.
  // Published as the private `--_tree-indent` and consumed by
  // `contentWrapper`'s stylesheet `margin-inline-start` (kept out of the inline
  // style so the theme layer can override it — see #4308).
  const reservesChevronColumn =
    !hasChildren && !hasCustomIcon && hasExpandableItems;
  const indentDistance = reservesChevronColumn
    ? `calc(${nestedLevel} * var(--tree-list-indent) + ${INDICATOR_SIZE} + ${spacingVars['--spacing-2']})`
    : `calc(${nestedLevel} * var(--tree-list-indent))`;
  const indentStyle: IndentStyle = {'--_tree-indent': indentDistance};

  const labelAndDescription = (
    <>
      <span
        id={labelId}
        {...mergeProps(
          // Stable theme target for the item's label text. The label carries no
          // themeable handle today, so a theme can only reach it through a
          // fragile structural selector (a content button's first span). This
          // adds an `astryx-tree-list-item-label` class and reflects the row's
          // `selected` state so a theme can, e.g., bold just the selected
          // item's label via `defineTheme`.
          themeProps('tree-list-item-label', {
            selected: isSelected ? 'selected' : null,
          }),
          stylex.props(styles.label),
        )}>
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

  // <Icon> renders the glyph's span itself — carrying the pre-existing
  // astryx-icon target — so the rotation rides on that same element instead of
  // an extra wrapper: a theme can still restyle the mark and its open/closed
  // transform through one selector.
  const chevronIcon = (
    <Icon
      icon="chevronRight"
      // The `sm` box is exactly INDICATOR_SIZE, so the glyph fills the column
      // at any root font size — the same contract a custom icon gets.
      size="sm"
      // The button/container owns the chevron color (--color-icon-secondary);
      // inheriting keeps that as the single source.
      color="inherit"
      xstyle={[
        styles.chevronSvg,
        isExpanded ? styles.chevronExpanded : styles.chevronCollapsed,
      ]}
    />
  );

  // A custom icon is the column's direct child, rendered as handed over: no
  // rotation (an open-folder icon must not also turn 90°) and no RTL mirror —
  // the consumer swaps per state instead. Sizing is the consumer's side of the
  // contract: `<Icon size="sm">` fills the column (see INDICATOR_SIZE).
  const indicatorIcon = hasCustomIcon ? customIcon : chevronIcon;

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
        {...mergeProps(
          // Stable theme target for the expand/collapse control. `data-tree-toggle`
          // stays as the functional activation hook; this adds a themeable
          // `astryx-tree-list-chevron` class and reflects the open/closed state so
          // a theme can restyle the toggle (and each state) without a fragile
          // `[data-tree-toggle]` selector.
          themeProps('tree-list-chevron', {
            state: isExpanded ? 'expanded' : 'collapsed',
          }),
          stylex.props(styles.indicatorColumn, styles.chevronButton),
        )}>
        {indicatorIcon}
      </button>
    ) : (
      // Non-interactive chevron only when toggling is not wired up at all
      <span
        {...mergeProps(
          themeProps('tree-list-chevron', {
            state: isExpanded ? 'expanded' : 'collapsed',
          }),
          stylex.props(styles.indicatorColumn, styles.chevronContainer),
        )}>
        {indicatorIcon}
      </span>
    )
  ) : hasCustomIcon ? (
    // Leaf indicator slot (e.g. a file icon in a folder tree): the same box as
    // the toggle so leaves align, but never a toggle — leaves have nothing to
    // expand.
    <span {...stylex.props(styles.indicatorColumn)}>{customIcon}</span>
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
      {...focusOutlineProps.publishFocusVisibleVars(styles.wrapper)}>
      {variant !== 'noGuides' && (
        <div {...stylex.props(styles.treeBranches)}>
          <TreeListBranches
            ancestorsIsLast={ancestorsIsLast}
            isLast={isLast}
            nestedLevel={nestedLevel}
          />
        </div>
      )}
      <div {...stylex.props(styles.rowWrapper)}>
        <div
          {...mergeProps(
            themeProps('tree-list-item', {
              density,
              selected: isSelected ? 'selected' : null,
              disabled: isDisabled ? 'disabled' : null,
            }),
            isInteractive || (hasChildren && onClick == null)
              ? focusOutlineProps.focusWithinOrPublished(
                  styles.contentWrapper,
                  densityStyles[density],
                  styles.interactive,
                  interactionOverlayStyles.backgroundImage,
                  isDisabled && styles.disabled,
                  isSelected && styles.selected,
                )
              : stylex.props(
                  styles.contentWrapper,
                  densityStyles[density],
                  isDisabled && styles.disabled,
                  isSelected && styles.selected,
                ),
          )}
          style={indentStyle}
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
