// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file ListItem.tsx
 * @input Uses React, ReactNode, StyleXStyles, theme tokens, the List row edge
 *   treatment, the press layer (dividers beside a touch-pressed or held row
 *   hide and the layer reaches over the row's own), the touch hit area
 *   (listRow.stylex.ts, kept live by utils/hitArea.ts), the travelling
 *   marker of an update's slide (List/useListUpdateMotion.ts), CheckboxInput,
 *   and the marker or task checkbox a ListMarkerScope sets (Markdown's nested
 *   lists and the task items of mixed lists)
 * @output Exports ListItem component, ListItemProps type
 * @position Core implementation; consumed by List, index.ts, tested by List.test.tsx
 *
 * Composes Item for the shared start content + label + description + end content layout
 * and the invisible button/anchor interactive pattern.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/List/List.doc.mjs
 * - /packages/core/src/List/List.test.tsx
 * - /packages/core/src/List/index.ts
 * - /apps/storybook/stories/List.stories.tsx
 * - /packages/cli/assets/templates/blocks/components/List/ (showcase blocks)
 */

import {use, useEffect, useRef, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  typeScaleVars,
  borderVars,
} from '../theme/tokens.stylex';
import type {BaseProps} from '../BaseProps';
import {
  EDITING_ATTRIBUTE,
  EDITING_CONTROL_ATTRIBUTE,
  ListContext,
  type ListMarker,
} from './ListContext';
import {useIndicator} from '../Indicator';
import {CheckboxInput} from '../CheckboxInput';
import {mergeProps} from '../utils';
import {Item} from '../Item';
import type {ItemAlign, ItemSwipeActions, ItemSwipeBehavior} from '../Item';
import {themeProps} from '../utils/themeProps';
import {listRowConsts, listRowStyles} from './listRow.stylex';
import {useIsomorphicLayoutEffect} from '../hooks/useIsomorphicLayoutEffect';
import {useMergedRefs} from '../hooks/useMergedRefs';
import {MIN_TOUCH_TARGET, watchHitArea, writeHitInsets} from '../utils/hitArea';

// =============================================================================
// Types
// =============================================================================

export interface ListItemProps extends BaseProps<HTMLLIElement> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLLIElement>;
  /**
   * Vertical alignment of the start and end content against the label,
   * forwarded to Item. Use `first-line` to keep the start and end content level with the
   * first line of a wrapped label.
   * @default 'center'
   */
  align?: ItemAlign;
  /**
   * Primary text label for the item.
   *
   * Accepts a plain string (single-line truncation applied automatically)
   * or a ReactNode for rich content (no truncation constraints —
   * child components control their own text behavior).
   */
  label: ReactNode;

  /**
   * Secondary description below the label.
   *
   * Accepts a plain string (single-line truncation applied automatically)
   * or a ReactNode for rich/multi-line content (no wrapping constraints
   * applied — child components control their own text behavior).
   */
  description?: ReactNode;

  /**
   * Content rendered before the item (icon, avatar, checkbox).
   * Uses start/end naming for RTL support.
   */
  startContent?: ReactNode;

  /**
   * Content rendered after the item (badge, action button, chevron).
   */
  endContent?: ReactNode;

  /**
   * Click handler for interactive items.
   * Automatically enables hover/press styles when provided.
   */
  onClick?: (e: React.MouseEvent) => void;

  /**
   * Ref to a nested control inside the item (e.g. a checkbox in
   * `startContent`) that already provides the item's keyboard access and
   * action. When set, the item becomes an enlarged click/tap target that
   * delegates surface clicks to that control via the `useClickableContainer`
   * pattern: it renders no invisible button/anchor, so the row adds no second
   * tab stop (WCAG 4.1.2 — one focusable control per option). Mutually
   * exclusive with `onClick`/`href` — when set those are ignored.
   */
  interactiveRef?: React.RefObject<HTMLElement | null>;

  /**
   * URL for link items. Renders an invisible anchor element.
   * Automatically enables hover/press styles when provided.
   */
  href?: string;

  /**
   * Link target (e.g., '_blank'). Only used with href.
   */
  target?: string;

  /**
   * Link relationship. Automatically includes noopener noreferrer when
   * target is "_blank".
   */
  rel?: string;

  /**
   * Whether the item is disabled.
   * @default false
   */
  isDisabled?: boolean;

  /**
   * Whether the item is currently selected.
   * @default false
   */
  isSelected?: boolean;

  /**
   * Swipe actions for touch, passed through to `Item` unchanged: the verbs a
   * sideways drag uncovers on each side. See `Item.swipeActions`; `List`
   * clips the rows in the inline axis for them.
   */
  swipeActions?: ItemSwipeActions;

  /**
   * What a swipe does, passed through to `Item` unchanged. See
   * `Item.swipeBehavior`.
   * @default 'reveal'
   */
  swipeBehavior?: ItemSwipeBehavior;
}

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  withCounter: {
    counterIncrement: 'astryx-list',
  },
  // A row an update slides across rows moving the other way rides above them
  // with the surface behind it, for the length of its slide (the attribute
  // List/useListUpdateMotion.ts writes): a UIKit cell passes its neighbours
  // opaque and on top, and rows here have no background of their own. The
  // surface is an inset shadow across the padding box, under the press layer
  // and the row's content, so the row's divider and its press stay visible;
  // a selected row keeps its own fill. It takes no pseudo-element: under a
  // finger the row's `::after` is its hit layer (List/listRow.stylex.ts).
  travelling: {
    zIndex: {
      default: null,
      '[data-astryx-travelling]': 1,
    },
    boxShadow: {
      default: null,
      '[data-astryx-travelling]:not([aria-selected="true"],[aria-current="true"])': `inset 0 0 0 100vmax ${colorVars['--color-background-surface']}`,
    },
  },
  // List's edge treatments. Each reads --_item-inset-inline, the variable
  // Item derives its paddingInline from, on the row itself (custom properties
  // only cascade downward, so the <ul> cannot read it); density and theme
  // paddingInline overrides on `item` move it. Each edge resolves against ITS
  // OWN container padding var, so asymmetric padding never over-reaches an
  // edge, and logical properties keep RTL correct.
  //
  // 'flush': no inset, so content meets the row's edges.
  edgeFlush: {
    '--_item-inset-inline': '0px',
  },
  // 'outset': the list reaches the container's padding edge (List.tsx); the
  // row steps back in by whatever padding its inset does not fill, so the row
  // reaches min(inset, container padding) past the content line and its text
  // lands on that line when the padding is at least the inset.
  edgeOutset: {
    marginInlineStart:
      'max(var(--container-padding-inline-start, 0px) - var(--_item-inset-inline), 0px)',
    marginInlineEnd:
      'max(var(--container-padding-inline-end, 0px) - var(--_item-inset-inline), 0px)',
  },
  // 'bleed': the row fills the list, which reaches the container's padding
  // edge (List.tsx); its text sits on the container's padding line, never
  // closer to the row's edge than its own inset. Square corners: the row
  // meets the container's straight sides.
  edgeBleed: {
    // The leading padding is edit mode's `rowBleed`, which starts from the
    // same value.
    paddingInlineEnd:
      'max(var(--container-padding-inline-end, 0px), var(--_item-inset-inline))',
    borderRadius: 0,
  },
  withDivider: {
    borderBlockEndWidth: borderVars['--border-width'],
    borderBlockEndStyle: 'solid',
    // Under a finger (a coarse primary pointer, TOUCH_QUERY in
    // utils/touchPresentation.ts), a touch press hides this row's divider
    // and the one above it, in the frame the press is believed, with no
    // transition, as a highlighted UIKit cell hides its separators; both
    // come back in the first frame of the release, while the press is still
    // fading. A selection hold (the row kept selected through a navigation
    // push) hides them the same way until its deselect begins, and again
    // after a cancel. With a mouse the dividers stay drawn.
    borderBlockEndColor: {
      default: colorVars['--color-border'],
      '@media (pointer: coarse)': {
        default: null,
        '[data-astryx-press="on"]': 'transparent',
        '[data-astryx-press="held"]:not([data-astryx-deselecting])':
          'transparent',
        ':has(+ [data-astryx-press="on"])': 'transparent',
        ':has(+ [data-astryx-press="held"]:not([data-astryx-deselecting]))':
          'transparent',
      },
    },
    // A longhand, not the `borderBlockEnd` shorthand: StyleX's default
    // property-specificity mode drops border shorthands silently, so the
    // shorthand never reached the shipped CSS and the last item kept its
    // divider.
    ':last-child': {
      borderBlockEndWidth: 0,
    },
    // While its divider is hidden, the press layer (the `cell` style of
    // utils/interactionOverlay.stylex.ts) reaches over it, so the whole row
    // is pressed. The last row has no divider to cover.
    '::before': {
      insetBlockEnd: {
        default: null,
        '@media (pointer: coarse)': {
          default: null,
          '[data-astryx-press="on"]': {
            default: `calc(-1 * ${borderVars['--border-width']})`,
            ':last-child': 0,
          },
          '[data-astryx-press="held"]:not([data-astryx-deselecting])': {
            default: `calc(-1 * ${borderVars['--border-width']})`,
            ':last-child': 0,
          },
        },
      },
    },
  },
});

// =============================================================================
// Marker styles — custom-rendered markers instead of native list-style-type.
// Uses CSS counters for numbers (same pattern as WWW Astryx).
// =============================================================================

const MARKER_DOT_SIZE = 6;

const markerStyles = stylex.create({
  container: {
    alignSelf: 'baseline',
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    width: spacingVars['--spacing-4'],
    marginTop: `calc((1em * ${typeScaleVars['--text-body-leading']} - ${MARKER_DOT_SIZE}px) / 2)`,
  },
  dot: {
    width: MARKER_DOT_SIZE,
    height: MARKER_DOT_SIZE,
    borderRadius: '50%',
    backgroundColor: colorVars['--color-text-primary'],
  },
  circle: {
    width: MARKER_DOT_SIZE,
    height: MARKER_DOT_SIZE,
    borderRadius: '50%',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colorVars['--color-text-primary'],
    backgroundColor: 'transparent',
  },
  square: {
    width: MARKER_DOT_SIZE,
    height: MARKER_DOT_SIZE,
    backgroundColor: colorVars['--color-text-primary'],
  },
  number: {
    alignSelf: 'baseline',
    flexShrink: 0,
    color: colorVars['--color-text-primary'],
    fontSize: typeScaleVars['--text-body-size'],
    lineHeight: typeScaleVars['--text-body-leading'],
    width: spacingVars['--spacing-4'],
  },
  // A number outside a counter style's range (zero or below, or past 3999
  // in roman) is written in decimal, as CSS counter styles fall back.
  decimal: {
    '::before': {
      content: 'counter(astryx-list) "."',
    },
  },
  lowerAlpha: {
    '::before': {
      content: 'counter(astryx-list, lower-alpha) "."',
    },
  },
  lowerRoman: {
    '::before': {
      content: 'counter(astryx-list, lower-roman) "."',
    },
  },
});

/** The width and height of CheckboxInput's small control. */
const TASK_CHECKBOX_SIZE = 20;

const editingStyles = stylex.create({
  // The room edit mode makes at a row's leading edge for an editing control,
  // on the row itself (no element of its own): its leading padding grows by
  // the indent while it carries EDITING_ATTRIBUTE, so the content moves by
  // exactly the indent. The default is the row's leading padding out of edit
  // mode, as Item and the edge treatment set it (`rowBleed` for 'bleed').
  row: {
    paddingInlineStart: {
      default: 'var(--_item-inset-inline)',
      '[data-astryx-editing]': `calc(var(--_item-inset-inline) + ${listRowConsts.editingIndent})`,
    },
  },
  rowBleed: {
    paddingInlineStart: {
      default:
        'max(var(--container-padding-inline-start, 0px), var(--_item-inset-inline))',
      '[data-astryx-editing]': `calc(max(var(--container-padding-inline-start, 0px), var(--_item-inset-inline)) + ${listRowConsts.editingIndent})`,
    },
  },
  // The editing control, placed itself (no wrapper) in the room the row's
  // padding makes: centred UIKit's distance past the row's resting text
  // start (its leading padding out of edit mode; `controlBleed` for
  // 'bleed') and on the row's height. Leaving edit mode, the room goes at
  // once (the content springs back from it) while the control slides out
  // from where it stood. Its slide is a translate
  // (List/useListEditingMotion.ts) and its centring a transform, so the two
  // compose.
  control: {
    position: 'absolute',
    insetInlineStart: `calc(var(--_item-inset-inline) + ${listRowConsts.editingControlCenter})`,
    insetBlockStart: '50%',
    transform: {
      default: 'translate(-50%, -50%)',
      ':is([dir="rtl"] *)': 'translate(50%, -50%)',
    },
    pointerEvents: 'none',
  },
  controlBleed: {
    insetInlineStart: `calc(max(var(--container-padding-inline-start, 0px), var(--_item-inset-inline)) + ${listRowConsts.editingControlCenter})`,
  },
});

const taskMarkerStyles = stylex.create({
  // A task item's checkbox stands where the marker would, centered on the
  // item's first line, as a task list's checkboxes are.
  container: {
    alignSelf: 'flex-start',
    display: 'flex',
    flexShrink: 0,
    marginTop: `calc((1em * ${typeScaleVars['--text-body-leading']} - ${TASK_CHECKBOX_SIZE}px) / 2)`,
  },
});

/** The number styles, by marker. */
const NUMBER_STYLES = {
  decimal: markerStyles.decimal,
  'lower-alpha': markerStyles.lowerAlpha,
  'lower-roman': markerStyles.lowerRoman,
} as const;

const embeddedStyles = stylex.create({
  noRadius: {
    borderRadius: 0,
  },
});

// =============================================================================
// Component
// =============================================================================

/**
 * A list item component for use within List.
 *
 * Renders structured content with label, description, start/end content areas.
 * When `onClick` is provided, uses the invisible button pattern for accessibility.
 * When `href` is provided, uses an invisible anchor pattern.
 *
 * @example
 * ```
 * <ListItem label="Settings" description="Manage your preferences" />
 * <ListItem label="Profile" onClick={() => navigate('/profile')} />
 * <ListItem label="Docs" href="/docs" target="_blank" rel="noreferrer" />
 * ```
 */
/**
 * The theme's touch target size in px (`--size-touch-target`), read under a
 * finger only; the 44px minimum otherwise.
 */
function touchTargetSize(row: HTMLElement): number {
  const view = row.ownerDocument.defaultView;
  if (view?.matchMedia?.('(pointer: coarse)').matches !== true) {
    return MIN_TOUCH_TARGET;
  }
  const value = view
    .getComputedStyle(row)
    .getPropertyValue('--size-touch-target')
    .trim();
  const size = value.endsWith('px') ? Number.parseFloat(value) : Number.NaN;
  return Number.isFinite(size) && size > 0 ? size : MIN_TOUCH_TARGET;
}

/**
 * The finite animations running or held in the row's list: its rows' motions
 * (an update's slide, a swipe, edit mode's slide) and their parts'.
 */
function listAnimations(row: HTMLElement): Animation[] {
  const list = row.parentElement ?? row;
  if (typeof list.getAnimations !== 'function') {
    return [];
  }
  return list.getAnimations({subtree: true}).filter(animation => {
    if (animation.playState !== 'running' && animation.playState !== 'paused') {
      return false;
    }
    const end = animation.effect?.getComputedTiming().endTime;
    return typeof end === 'number' && Number.isFinite(end);
  });
}

/**
 * Keeps the row's hit insets live through the shared touch hit area. Rows
 * move by transform, which the shared measurement reads as they stand in one
 * frame: a measurement that arrives while the list moves is dropped, and once
 * the motion ends the row is watched afresh, so its insets are taken at rest
 * and no frame of a compositor motion lays out or paints for them.
 */
function watchRowHitArea(row: HTMLElement, minSize: number): () => void {
  let stop = (): void => {};
  let isStopped = false;
  let isWaiting = false;
  const watch = (): void => {
    stop = watchHitArea(
      row,
      insets => {
        const moving = listAnimations(row);
        if (moving.length === 0) {
          writeHitInsets(row, insets);
          return;
        }
        if (isWaiting) {
          return;
        }
        isWaiting = true;
        void Promise.allSettled(
          moving.map(async animation => animation.finished),
        ).then(() => {
          isWaiting = false;
          if (!isStopped) {
            stop();
            watch();
          }
        });
      },
      minSize,
    );
  };
  watch();
  return () => {
    isStopped = true;
    stop();
  };
}

export function ListItem({
  label,
  description,
  startContent,
  endContent,
  onClick,
  interactiveRef,
  href,
  target,
  rel,
  isDisabled = false,
  isSelected = false,
  align,
  xstyle,
  className,
  style,
  ref,
  ...restProps
}: ListItemProps) {
  const ctx = use(ListContext);
  const rowRef = useRef<HTMLLIElement | null>(null);
  const mergedRef = useMergedRefs(ref, rowRef);
  const keepRowPresentation = ctx?.keepRowPresentation;
  const keepRowPresentationRef = useRef(keepRowPresentation);
  useIsomorphicLayoutEffect(() => {
    keepRowPresentationRef.current = keepRowPresentation;
  });
  // External system (`architecture:react-component-runtime` INV3): the Web
  // Animations running on the row's parts (a swipe's travel, on the
  // compositor), which a detached row loses. Leaving a list that animates
  // its changes, the row writes what they present inline while it is still
  // in the document (a parent's layout cleanup runs before React removes the
  // row), so the removal's collapse shows it as it was on screen.
  useIsomorphicLayoutEffect(() => {
    const row = rowRef.current;
    return () => {
      if (row != null) {
        keepRowPresentationRef.current?.(row);
      }
    };
  }, []);
  // Under a finger, an interactive row's hit target grows toward the touch
  // target where its neighbors leave room, with no visual or layout change
  // (component:List FR10): utils/hitArea.ts measures how far, and the row's
  // invisible layer (listRowStyles.touchHitArea) reads it.
  const isTouchTarget =
    (onClick != null || href != null || interactiveRef != null) && !isDisabled;
  // External system (`architecture:react-component-runtime` INV3): the shared
  // touch hit area (utils/hitArea.ts), which measures the row against its
  // neighbours and writes its insets on the row; the cleanup stops the watch.
  useEffect(() => {
    const row = rowRef.current;
    if (!isTouchTarget || row == null) {
      return undefined;
    }
    return watchRowHitArea(row, touchTargetSize(row));
  }, [isTouchTarget]);
  const density = ctx?.density ?? 'balanced';
  const hasDividers = ctx?.hasDividers ?? false;
  const edge = ctx?.edge ?? 'padded';
  const listStyle = ctx?.listStyle ?? 'none';
  const hasMarkers = listStyle !== 'none';
  // ListMarkerScope may name another marker for this item.
  const markerKind: ListMarker | null =
    listStyle === 'none' ? null : (ctx?.marker ?? listStyle);

  // A task item in a list with markers shows its checkbox instead.
  const task = markerKind == null ? undefined : ctx?.task;

  const marker =
    task != null ? (
      <span {...stylex.props(taskMarkerStyles.container)}>
        <CheckboxInput
          size="sm"
          value={task.isChecked}
          label={task.label}
          isLabelHidden
          isReadOnly
        />
      </span>
    ) : markerKind === 'disc' ||
      markerKind === 'circle' ||
      markerKind === 'square' ? (
      <span {...stylex.props(markerStyles.container)}>
        <span
          {...stylex.props(
            markerKind === 'disc'
              ? markerStyles.dot
              : markerKind === 'circle'
                ? markerStyles.circle
                : markerStyles.square,
          )}
        />
      </span>
    ) : markerKind != null ? (
      <span {...stylex.props(markerStyles.number, NUMBER_STYLES[markerKind])} />
    ) : null;

  // Edit mode: room at the leading edge for an editing control (the row's
  // own padding, through EDITING_ATTRIBUTE), and no trailing content once it
  // has faded (List/useListEditingMotion.ts).
  const isEditing = ctx?.isEditing ?? false;
  const showsTrailing = ctx?.showsTrailing ?? true;
  // Edit mode's control: the theme's checkbox indicator, decorative (the row
  // keeps its selected semantics and its one tab stop), placed itself in the
  // room the row's padding makes (no wrapper), shown in edit mode and while
  // it slides out after.
  const CheckboxControl = useIndicator('checkbox');
  const showsControl =
    ctx?.editingControl === 'select' &&
    (isEditing || (ctx?.showsEditingControl ?? false));
  const editingControl = showsControl ? (
    <CheckboxControl
      aria-hidden="true"
      {...{[EDITING_CONTROL_ATTRIBUTE]: ''}}
      state={isSelected ? 'checked' : 'unchecked'}
      size="md"
      isDisabled={isDisabled}
      xstyle={[
        editingStyles.control,
        edge === 'bleed' && editingStyles.controlBleed,
      ]}
    />
  ) : null;

  return (
    <Item
      as="li"
      ref={mergedRef}
      // One fragment in both modes, so the marker keeps its slot, and its
      // element, when the control comes and goes: it slides with the text
      // instead of remounting at rest.
      marker={
        <>
          {editingControl}
          {marker}
        </>
      }
      startContent={startContent}
      label={label}
      description={description}
      endContent={showsTrailing ? endContent : undefined}
      onClick={onClick}
      interactiveRef={interactiveRef}
      href={href}
      target={target as '_blank' | '_self'}
      rel={rel}
      isDisabled={isDisabled}
      isSelected={isSelected}
      align={align}
      density={density}
      xstyle={
        [
          hasMarkers && styles.withCounter,
          styles.travelling,
          edge === 'bleed' ? editingStyles.rowBleed : editingStyles.row,
          hasDividers && styles.withDivider,
          hasDividers && embeddedStyles.noRadius,
          isTouchTarget && listRowStyles.touchHitArea,
          edge === 'flush' && styles.edgeFlush,
          edge === 'outset' && styles.edgeOutset,
          edge === 'bleed' && styles.edgeBleed,
          xstyle,
        ] as StyleXStyles
      }
      {...mergeProps(themeProps('list-item'), {className, style})}
      {...(isEditing ? {[EDITING_ATTRIBUTE]: ''} : undefined)}
      {...restProps}
    />
  );
}

ListItem.displayName = 'ListItem';
