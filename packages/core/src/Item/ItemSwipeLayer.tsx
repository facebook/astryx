// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file ItemSwipeLayer.tsx
 * @input The swipe entries per side, the behavior; useSwipeAction,
 *   theme tokens
 * @output Exports ItemSwipeLayer (default) — the panels of a row's swipe
 *   actions and the gesture that uncovers them — and the ItemSwipeBridge type
 *   through which the root reaches the gesture's key handler
 * @position Internal to Item, reached only through a dynamic import from
 *   Item.tsx when `swipeActions` is set, so a row without them never loads
 *   the gesture. Tested through Item.test.tsx and Item.source-build.test.mjs.
 *
 * The row's root stays Item's: it carries the swipe root styles and forwards
 * its key events into the bridge this layer fills; the gesture attaches to
 * the root itself. This layer renders the two panels as out-of-flow children
 * of that root, so the DOM is the one Item rendered before the split — no
 * element is added to the row for the swipe (spec AST-057, FR2).
 *
 * A panel is two boxes and the entries themselves, all moved by transforms
 * only (see useSwipeAction): a window over the row's resting box that clips
 * to it, a track inside it that moves with the row and clips the entries to
 * the space the row vacates, and the entries, each translated to stay pinned
 * at the outer edge. Past the open width the outermost entry's colour,
 * painted beside it, fills the rest out to that edge; on a confirmed full
 * swipe it slides to the row's edge while the others fade over the track's
 * fill of its colour. No wrapper holds the entries (minimal DOM,
 * `architecture:component-style-authoring` INV7): the colours are
 * pseudo-elements.
 */

import {useEffect, useRef} from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  fontWeightVars,
  typographyVars,
  colorVars,
  spacingVars,
  typeScaleVars,
} from '../theme/tokens.stylex';
import {mergeProps} from '../utils';
import {themeProps} from '../utils/themeProps';
import {focusOutlineProps} from '../utils/focusOutline.stylex';
import {useSwipeAction, type SwipeSide} from './useSwipeAction';
import type {ItemSwipeAction, ItemSwipeBehavior} from './Item';

// =============================================================================
// Types
// =============================================================================

/**
 * What Item needs from the gesture: the key handler the root forwards its key
 * events into (Escape closes a resting row), and the reveal a control in the
 * row reaches through ItemSwipeRevealContext. The layer publishes it when it
 * mounts; each call reads the gesture's latest handlers.
 */
export interface ItemSwipeBridge {
  onKeyDown: (event: React.KeyboardEvent) => void;
  /** Open the row on `side` as a swipe opens it (useSwipeAction's `reveal`). */
  reveal: (side: SwipeSide) => void;
  /** Close the row as a tap outside it does. */
  close: () => void;
}

export interface ItemSwipeLayerProps {
  /**
   * Called with the gesture for Item to forward into when the layer mounts,
   * and with `null` when it leaves.
   */
  onBridge: (bridge: ItemSwipeBridge | null) => void;
  /**
   * Called with the side the row opens on (from the release or reveal that
   * opens it) and with `null` when it closes or the layer leaves. The root
   * takes no press while open: a tap on an open row's content only closes
   * it, as in UIKit, where the cell never sees that touch.
   */
  onOpenChange: (side: SwipeSide | null) => void;
  leading: ItemSwipeAction[];
  trailing: ItemSwipeAction[];
  behavior: ItemSwipeBehavior;
}

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  // A side's window: the row's resting box. It is translated back by the
  // travel, so it stays where the row rests, and clips the track to that box
  // and its corners. Transparent and not hit: only the entries take touches.
  swipePanel: {
    position: 'absolute',
    insetBlock: 0,
    insetInline: 0,
    overflow: 'clip',
    borderRadius: 'inherit',
    pointerEvents: 'none',
  },
  // The track: beside the window at rest (so not a pixel of it shows), moved
  // with the row, so the part inside the window is exactly the space the row
  // vacates, and the entries show only there. Twice the row's width covers
  // every travel, the slide-out included. The entries run in a row from its
  // edge next to the row, each translated back so they stay pinned at the
  // row's outer edge until the row has uncovered them all, then riding the
  // row, on the surface it paints: the neutral variant is translucent and
  // shows what is under it. Its `::before` is the confirm fill: the
  // outermost entry's colour, hidden until a full swipe confirms, which then
  // shows through the others as they fade (swipeTrackFillStyles).
  swipeTrack: {
    position: 'absolute',
    insetBlock: 0,
    width: '200%',
    overflow: 'clip',
    borderRadius: 'inherit',
    display: 'flex',
    isolation: 'isolate',
    backgroundColor: colorVars['--color-background-surface'],
    '::before': {
      content: '""',
      position: 'absolute',
      inset: 0,
      zIndex: -1,
      opacity: 0,
      pointerEvents: 'none',
    },
  },
  // The outermost entry is the last, at the outer edge: on the leading side
  // that is the inline start, so the row of entries runs in reverse from the
  // track's inline end.
  swipeTrackLeading: {
    insetInlineEnd: '100%',
    flexDirection: 'row-reverse',
  },
  swipeTrackTrailing: {
    insetInlineStart: '100%',
  },
  // The outermost entry: its colour, painted beside it out to the row's
  // outer edge, fills whatever the row uncovers past the open width (the
  // entry stretches), and a slide-out fills the row with it. Decoration
  // only, on a pseudo-element; the entry's own fill, theme included.
  swipeOuterEntry: {
    position: 'relative',
  },
  swipeOuterEntryLeading: {
    '::after': {
      content: '""',
      position: 'absolute',
      insetBlock: 0,
      insetInlineEnd: '100%',
      width: '100vw',
      backgroundColor: 'inherit',
      pointerEvents: 'none',
    },
  },
  swipeOuterEntryTrailing: {
    '::after': {
      content: '""',
      position: 'absolute',
      insetBlock: 0,
      insetInlineStart: '100%',
      width: '100vw',
      backgroundColor: 'inherit',
      pointerEvents: 'none',
    },
  },
  swipeEntry: {
    flexShrink: 0,
    pointerEvents: 'auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacingVars['--spacing-1'],
    minWidth: 72,
    height: '100%',
    paddingInline: spacingVars['--spacing-3'],
    boxSizing: 'border-box',
    margin: 0,
    borderWidth: 0,
    borderStyle: 'none',
    appearance: 'none',
    cursor: {
      default: 'pointer',
      ':is(:disabled,[aria-disabled="true"])': 'default',
    },
    fontFamily: typographyVars['--font-family-body'],
    fontSize: typeScaleVars['--text-supporting-size'],
    fontWeight: fontWeightVars['--font-weight-medium'],
    lineHeight: typeScaleVars['--text-supporting-leading'],
    whiteSpace: 'nowrap',
  },
  // Half strength as a filter, so the entry's own opacity stays free for the
  // full swipe's fade.
  swipeEntryDisabled: {
    filter: 'opacity(0.5)',
  },
});

// A verb's colour: ordinary, the one you mean, the dangerous one. The
// outermost entry's fills the row on a slide-out (swipeOuterEntry).
const swipeVariantStyles = stylex.create({
  neutral: {
    backgroundColor: colorVars['--color-neutral'],
    color: colorVars['--color-text-primary'],
  },
  accent: {
    backgroundColor: colorVars['--color-accent'],
    color: colorVars['--color-on-accent'],
  },
  destructive: {
    backgroundColor: colorVars['--color-error'],
    color: colorVars['--color-on-error'],
  },
});

// The track's confirm fill: the outermost entry's colour (a disabled one
// never confirms, so it has none to show).
const swipeTrackFillStyles = stylex.create({
  neutral: {
    '::before': {backgroundColor: colorVars['--color-neutral']},
  },
  accent: {
    '::before': {backgroundColor: colorVars['--color-accent']},
  },
  destructive: {
    '::before': {backgroundColor: colorVars['--color-error']},
  },
});

// =============================================================================
// Component
// =============================================================================

/**
 * The swipe half of an `Item` with `swipeActions`: both panels, rendered into
 * the root Item owns, and the gesture that drives that root.
 */
export default function ItemSwipeLayer({
  onBridge,
  onOpenChange,
  leading,
  trailing,
  behavior,
}: ItemSwipeLayerProps) {
  // The entries, read when an entry fires (after the render that showed them).
  // Synchronizes the gesture system's fire callback, which runs outside React
  // from the recognizer, with the committed entries.
  const entriesRef = useRef({leading, trailing});
  useEffect(() => {
    entriesRef.current = {leading, trailing};
  });
  const swipe = useSwipeAction({
    behavior,
    // An open row's root takes no press.
    onOpenChange,
    // A disabled outermost entry cannot fire, so a full swipe never confirms
    // toward it.
    canConfirm: side => {
      const entries = entriesRef.current[side];
      const entry = entries[entries.length - 1];
      return entry != null && entry.isDisabled !== true;
    },
    fireOutermost: side => {
      const entries = entriesRef.current[side];
      const entry = entries[entries.length - 1];
      if (entry == null || entry.isDisabled === true) {
        return false;
      }
      void entry.onActivate();
      return entry.hasRemoval === true;
    },
    sides: {
      leading: leading.length > 0,
      trailing: trailing.length > 0,
    },
  });
  // The root forwards its key events, and a control in the row its reveal,
  // into what this publishes. The first Effect keeps the gesture's latest
  // handlers for the bridge to call; the second installs the bridge on Item,
  // which lives outside this lazily loaded layer, once when the layer mounts,
  // and releases it when the layer leaves. React flushes effects before it
  // delivers a discrete event, so a call never meets a stale handler.
  const swipeRef = useRef(swipe);
  useEffect(() => {
    swipeRef.current = swipe;
  });
  useEffect(() => {
    onBridge({
      close: () => swipeRef.current.close(),
      onKeyDown: event => swipeRef.current.onKeyDown(event),
      reveal: side => swipeRef.current.reveal(side),
    });
    return () => {
      onBridge(null);
    };
  }, [onBridge]);
  const isSwipeResting = swipe.state.phase === 'resting';

  // A side's panel: entries as real buttons under `reveal`, presentational
  // blocks under `commit`. Out of the accessibility tree and the tab order
  // except while the row rests open on its side, so the row keeps one tab
  // stop, the other side's entries (out of sight behind the row) are never
  // reached, and a pointer that can hover never meets it.
  const renderSwipePanel = (side: SwipeSide, entries: ItemSwipeAction[]) => {
    if (entries.length === 0) {
      return null;
    }
    const outer = entries[entries.length - 1];
    const isCommit = behavior === 'commit';
    const isLive = isSwipeResting && swipe.state.side === side && !isCommit;
    const refs = swipe.panelRefs[side];
    const renderEntry = (entry: ItemSwipeAction) => {
      const variant = entry.variant ?? 'accent';
      const key = entry.id ?? entry.label;
      // The outermost entry is the full swipe's moving part itself.
      const isOuter = entry === outer;
      const ref = isOuter ? refs.outer : refs.entry(key);
      const content = (
        <>
          {entry.icon}
          <span>{entry.label}</span>
        </>
      );
      const entryStyles = [
        styles.swipeEntry,
        swipeVariantStyles[variant],
        entry.isDisabled === true && styles.swipeEntryDisabled,
        isOuter && styles.swipeOuterEntry,
        isOuter &&
          (side === 'leading'
            ? styles.swipeOuterEntryLeading
            : styles.swipeOuterEntryTrailing),
      ];
      if (isCommit) {
        return (
          <span
            key={key}
            ref={ref}
            {...mergeProps(
              themeProps('item-swipe-action', {variant}),
              stylex.props(...entryStyles),
            )}>
            {content}
          </span>
        );
      }
      return (
        <button
          key={key}
          ref={ref}
          type="button"
          disabled={entry.isDisabled === true}
          onClick={() =>
            swipe.activateEntry(() => {
              void entry.onActivate();
              return entry.hasRemoval === true;
            })
          }
          {...mergeProps(
            themeProps('item-swipe-action', {variant}),
            focusOutlineProps.focusVisible(...entryStyles),
          )}>
          {content}
        </button>
      );
    };
    return (
      <div
        key={side}
        ref={refs.panel}
        data-swipe-panel={side}
        inert={isLive ? undefined : true}
        aria-hidden={isCommit ? true : undefined}
        {...stylex.props(styles.swipePanel)}>
        <div
          ref={refs.track}
          {...mergeProps(
            themeProps('item-swipe-panel', {side}),
            stylex.props(
              styles.swipeTrack,
              side === 'leading'
                ? styles.swipeTrackLeading
                : styles.swipeTrackTrailing,
              swipeTrackFillStyles[outer.variant ?? 'accent'],
            ),
          )}>
          {entries.map(renderEntry)}
        </div>
      </div>
    );
  };

  return (
    <>
      {renderSwipePanel('leading', leading)}
      {renderSwipePanel('trailing', trailing)}
    </>
  );
}

ItemSwipeLayer.displayName = 'ItemSwipeLayer';
