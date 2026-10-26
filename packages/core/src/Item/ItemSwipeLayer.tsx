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
 * painted beside it, fills the rest out to that edge. No wrapper holds the
 * entries (minimal DOM, `architecture:component-style-authoring` INV7).
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
  // row's outer edge, on the surface it paints: the neutral variant is
  // translucent and shows what is under it.
  swipeTrack: {
    position: 'absolute',
    insetBlock: 0,
    width: '200%',
    overflow: 'clip',
    borderRadius: 'inherit',
    display: 'flex',
    backgroundColor: colorVars['--color-background-surface'],
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
  swipeEntryDisabled: {
    opacity: 0.5,
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
    // Forced colors replace the fill with Canvas; a border keeps the
    // destructive fill's shape visible (architecture:theme-tokens INV11). A
    // border, not an outline, leaves the shared focus ring intact.
    borderWidth: {default: 0, '@media (forced-colors: active)': '1px'},
    borderStyle: {default: 'none', '@media (forced-colors: active)': 'solid'},
    borderColor: {
      default: null,
      '@media (forced-colors: active)': 'CanvasText',
    },
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
  // The root forwards its key events into what this publishes. The Effect
  // installs this lazily loaded layer's key handler on Item's root, which
  // lives outside the layer, and releases it when the layer leaves. React
  // flushes effects before it delivers a discrete event, so a handler never
  // meets a stale bridge.
  useEffect(() => {
    onBridge({onKeyDown: swipe.onKeyDown});
    return () => {
      onBridge(null);
    };
  });
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
            ),
          )}>
          {entries.map(entry => {
            const variant = entry.variant ?? 'accent';
            const key = entry.id ?? entry.label;
            const isOuter = entry === outer;
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
                  ref={refs.entry(key)}
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
                ref={refs.entry(key)}
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
          })}
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
