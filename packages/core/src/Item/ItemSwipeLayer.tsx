// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file ItemSwipeLayer.tsx
 * @input The swipe entries per side, the behavior; useSwipeAction,
 *   useTouchIdiom (whose idiom the swipe follows), theme tokens
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
 * A panel is three boxes, all moved by transforms only (see useSwipeAction):
 * a window over the row's resting box that clips to it, a track inside it
 * that moves with the row and paints the vacated space in the outermost
 * entry's colour, and the entries, pinned at the outer edge inside the track.
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
import {useTouchIdiom} from '../utils/touchPresentation';
import {isSwipeOpen, useSwipeAction, type SwipeSide} from './useSwipeAction';
import type {ItemSwipeAction, ItemSwipeBehavior} from './Item';

// =============================================================================
// Types
// =============================================================================

/**
 * What the root needs from the gesture: the key handler it forwards its key
 * events into (Escape closes a resting row). The layer writes it on every
 * render; the root reads it on every event.
 */
export interface ItemSwipeBridge {
  onKeyDown: (event: React.KeyboardEvent) => void;
}

export interface ItemSwipeLayerProps {
  /**
   * Called with the gesture for the root to forward into, after every render
   * of the layer, and with `null` when the layer leaves.
   */
  onBridge: (bridge: ItemSwipeBridge | null) => void;
  /**
   * Called with `true` when the row opens (from the release that opens it)
   * and with `false` when it closes or the layer leaves. The root takes no
   * press while open: a tap on an open row's content only closes it, as in
   * UIKit, where the cell never sees that touch.
   */
  onOpenChange: (isOpen: boolean) => void;
  leading: ItemSwipeAction[];
  trailing: ItemSwipeAction[];
  behavior: ItemSwipeBehavior;
  /**
   * The role each panel carries. A grid row (`role="row"`) passes `gridcell`,
   * so every exposed child of the row is a cell, the panel included; every
   * other row passes nothing.
   */
  panelRole?: 'gridcell';
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
  // vacates. Twice the row's width covers every travel, the slide-out
  // included. It wears the outermost entry's colour.
  swipeTrack: {
    position: 'absolute',
    insetBlock: 0,
    width: '200%',
    overflow: 'clip',
    borderRadius: 'inherit',
  },
  swipeTrackLeading: {
    insetInlineEnd: '100%',
  },
  swipeTrackTrailing: {
    insetInlineStart: '100%',
  },
  // The entries at their natural width at the track's edge next to the row,
  // translated back so they stay pinned at the row's outer edge until the
  // row has uncovered them all, then riding the row. The outermost entry is
  // the last, at the outer edge: on the leading side that is the inline
  // start, so the row of entries runs in reverse.
  swipeEntries: {
    position: 'absolute',
    insetBlock: 0,
    display: 'flex',
    width: 'max-content',
    pointerEvents: 'auto',
  },
  swipeEntriesLeading: {
    insetInlineEnd: 0,
    flexDirection: 'row-reverse',
  },
  swipeEntriesTrailing: {
    insetInlineStart: 0,
  },
  // The entries other than the outermost, and the outermost on its own: each
  // group sits on the surface, not on the track's own colour (the neutral
  // variant is translucent and would otherwise take the outermost entry's
  // colour through it). On a confirmed full swipe the outermost slides to the
  // row's edge and the others fade with their surface, so the outermost's
  // colour covers the space.
  swipeEntryGroup: {
    display: 'flex',
    height: '100%',
    backgroundColor: colorVars['--color-background-surface'],
  },
  swipeEntryGroupLeading: {
    flexDirection: 'row-reverse',
  },
  swipeEntry: {
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
  swipeEntryDisabled: {
    opacity: 0.5,
  },
});

// A verb's colour: ordinary, the one you mean, the dangerous one. The track
// wears its outermost entry's, so a slide-out fills the row with it.
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
  panelRole,
}: ItemSwipeLayerProps) {
  // The entries, read when an entry fires (after the render that showed them).
  const entriesRef = useRef({leading, trailing});
  useEffect(() => {
    entriesRef.current = {leading, trailing};
  });
  // iOS's swipe on iOS; the row's own on Android and any other finger.
  const idiom = useTouchIdiom();
  const swipe = useSwipeAction({
    behavior,
    idiom,
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
  // The root forwards its key events into what this publishes. Published
  // from an effect: React flushes effects before it delivers a discrete
  // event, so a handler never meets a stale bridge; and withdrawn when the
  // layer leaves.
  useEffect(() => {
    onBridge({onKeyDown: swipe.onKeyDown});
    return () => {
      onBridge(null);
    };
  });
  const isSwipeResting = swipe.state.phase === 'resting';
  // On iOS an open row's root takes no press; elsewhere it presses as before.
  const isOpen = idiom === 'ios' && isSwipeOpen(swipe.state);
  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }
    onOpenChange(true);
    return () => {
      onOpenChange(false);
    };
  }, [isOpen, onOpenChange]);

  // A side's panel: entries as real buttons under `reveal`, presentational
  // blocks under `commit`. Out of the accessibility tree and the tab order
  // except while the row rests open, so the row keeps one tab stop and a
  // pointer that can hover never meets it.
  const renderSwipePanel = (side: SwipeSide, entries: ItemSwipeAction[]) => {
    if (entries.length === 0) {
      return null;
    }
    const outer = entries[entries.length - 1];
    const isCommit = behavior === 'commit';
    const isLive = isSwipeResting && !isCommit;
    const refs = swipe.panelRefs[side];
    const renderEntry = (entry: ItemSwipeAction) => {
      const variant = entry.variant ?? 'accent';
      const content = (
        <>
          {entry.icon}
          <span>{entry.label}</span>
        </>
      );
      const entryStyle = stylex.props(
        styles.swipeEntry,
        swipeVariantStyles[variant],
        entry.isDisabled === true && styles.swipeEntryDisabled,
      );
      if (isCommit) {
        return (
          <span
            key={entry.id ?? entry.label}
            {...mergeProps(
              themeProps('item-swipe-action', {variant}),
              entryStyle,
            )}>
            {content}
          </span>
        );
      }
      return (
        <button
          key={entry.id ?? entry.label}
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
            focusOutlineProps.focusVisible(
              styles.swipeEntry,
              swipeVariantStyles[variant],
              entry.isDisabled === true && styles.swipeEntryDisabled,
            ),
          )}>
          {content}
        </button>
      );
    };
    return (
      <div
        key={side}
        ref={refs.panel}
        role={panelRole}
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
              swipeVariantStyles[outer.variant ?? 'accent'],
            ),
          )}>
          <div
            ref={refs.entries}
            {...stylex.props(
              styles.swipeEntries,
              side === 'leading'
                ? styles.swipeEntriesLeading
                : styles.swipeEntriesTrailing,
            )}>
            <div
              ref={refs.inner}
              {...stylex.props(
                styles.swipeEntryGroup,
                side === 'leading' && styles.swipeEntryGroupLeading,
              )}>
              {entries.slice(0, -1).map(renderEntry)}
            </div>
            <div ref={refs.outer} {...stylex.props(styles.swipeEntryGroup)}>
              {renderEntry(outer)}
            </div>
          </div>
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
