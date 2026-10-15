// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file BottomSheetStackContext.ts
 * @input Uses React, the layer depth context, and the Dialog purpose type
 * @output Internal host and parent-level contexts, the depth-checked host reader, and the level protocol hook shared by BottomSheetStack, BottomSheet, and BottomSheetSwitcher
 * @position Private coordination layer between BottomSheetStack and the sheets it stacks; nothing here is exported from the package
 *
 * A BottomSheet or BottomSheetSwitcher rendered under a BottomSheetStack gives
 * up its own native dialog and becomes one level of that stack. The stack owns
 * the dialog, scrim, modal boundary, scroll lock, and dismissal; it never reads
 * its children. Each level registers itself from wherever it is rendered —
 * through wrappers, DOM elements, Suspense, Activity, providers, portals — and
 * reports what the stack needs: whether it is open and presented, its purpose,
 * label, final-focus target, and a way to close it through its own callback.
 *
 * Registration happens only in layout effects, keyed by `useId`, so a render
 * that never commits registers nothing and StrictMode leaves one entry per
 * level. Order is tree order: each level renders a hidden in-place anchor and
 * names its parent level through context, and the stack sorts siblings by the
 * anchors' document position with children right after their parent. Each
 * level owns the box its panel portals into, so re-registration (Suspense,
 * Activity, StrictMode) keeps the panel and its state.
 *
 * A sheet joins a stack only at the stack's own layer depth. The stack records
 * the depth of its content (`useLayerDepth()` inside its LayerDepthProvider)
 * and a sheet compares it with its own; every Core layer that opens its own
 * top-layer element (Dialog, AlertDialog, popover-based layers, Lightbox,
 * MobileNav) already pushes its content one level deeper, so a sheet opened
 * inside such a layer is a normal standalone sheet above it rather than a
 * level painted below it, with no change to those layers. A stacked level
 * adds no depth around its own content, so a sheet inside a level's content
 * joins the stack right above that level.
 *
 * Without a BottomSheetStack the contexts are null and every sheet behaves
 * exactly as it does standalone: the reads are inert, nothing is registered,
 * and no provider is added to the render tree.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/BottomSheet/BottomSheet.tsx
 * - /packages/core/src/BottomSheet/BottomSheetPanel.tsx
 * - /packages/core/src/BottomSheet/BottomSheetStack.tsx
 * - /packages/core/src/BottomSheet/BottomSheetSwitcher.tsx
 * - /packages/core/src/BottomSheet/BottomSheetStackContext.test.tsx
 */

import {
  createContext,
  use,
  useCallback,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type RefObject,
} from 'react';
import type {DialogPurpose} from '../Dialog';
import {useLayerDepth} from '../Layer/LayerDepthContext';

/** What kind of sheet a level is. */
export type BottomSheetStackLevelKind = 'sheet' | 'switcher';

/** What a level reports to its stack. */
export interface BottomSheetStackLevelState {
  /**
   * Whether the level is open by its own controlled state (`isOpen`, or a
   * non-null `activeSheet` naming a mounted sheet). The stack derives the open
   * set, the top level, and every level's depth from this.
   */
  isOpen: boolean;
  /**
   * Whether the level is on screen, including its exit motion. The stack keeps
   * its dialog open while any level is presented.
   */
  isPresented: boolean;
  /**
   * Dismissal purpose of the level's interactive sheet: for a switcher, the
   * active child's. The stack applies it to Escape and scrim interaction.
   */
  purpose: DialogPurpose;
  /** Accessible name of the level's interactive sheet, for the stack dialog. */
  label: string | undefined;
  /**
   * Element that receives focus when this level's close also closes the
   * stack. A switcher level has none and reports `undefined`.
   */
  finalFocusRef: RefObject<HTMLElement | null> | undefined;
  /**
   * Closes the level through its own controlled callback
   * (`onOpenChange(false)` or `onActiveSheetChange(null)`). Identity stays
   * stable for the life of the level; purpose gating is the stack's.
   */
  dismiss: () => void;
}

/** What the stack tells one level. */
export interface BottomSheetStackLevelView {
  /**
   * Open levels above this one. `0` is the top; a covered level stays
   * mounted, inert, and visibly receded by its depth.
   */
  depth: number;
  /** Whether this level is the top, interactive level. */
  isTop: boolean;
}

/** How a level registers with its stack. */
export interface BottomSheetStackLevelRegistration {
  /** The level's `useId`, stable for its life. */
  id: string;
  kind: BottomSheetStackLevelKind;
  /**
   * Hidden element the level renders in place. The stack orders sibling
   * levels by the anchors' document position.
   */
  anchor: Element;
  /** Id of the level whose content this level is rendered in, or null. */
  parentId: string | null;
  /**
   * Level-owned element the level portals its panel into. The stack places it
   * inside its dialog, in stack order, and marks it inert while covered.
   */
  box: HTMLElement;
}

/** What a BottomSheetStack provides to every level under it. */
export interface BottomSheetStackHostContextValue {
  /** Whether the stack dialog is modal with a scrim. Levels never set this. */
  hasScrim: boolean;
  /**
   * Layer depth of the stack's content. A sheet joins only when its own
   * `useLayerDepth()` equals this: a Core layer opened inside a level pushes
   * its content deeper, so a sheet inside it stays standalone above that layer.
   */
  layerDepth: number;
  /**
   * Adds a level. Called from a layout effect; returns the matching removal.
   * Registering an id again replaces its registration and keeps its report.
   */
  register: (registration: BottomSheetStackLevelRegistration) => () => void;
  /** Reports a registered level's current state. Idempotent for an equal state. */
  report: (id: string, state: BottomSheetStackLevelState) => void;
  /**
   * Asks the stack to re-derive order from the anchors. A level calls it on
   * every commit so a move in the tree is followed; the stack bails out when
   * the order is unchanged.
   */
  touch: () => void;
  /**
   * Forwards a gesture-driven scrim opacity (0..1) from a level's panel to
   * the stack's shared backdrop. The stack honours only its top level.
   */
  onScrimOpacity: (id: string, opacity: number) => void;
  /**
   * The stack's current view of every registered level, by id. A level that
   * has registered but not yet been placed has no entry.
   */
  views: ReadonlyMap<string, BottomSheetStackLevelView>;
}

/**
 * Context a BottomSheetStack provides once around everything it stacks. Sheets
 * read it through `useBottomSheetStackHost`; the default is `null`, so without
 * a stack nothing changes.
 */
export const BottomSheetStackHostContext =
  createContext<BottomSheetStackHostContextValue | null>(null);
BottomSheetStackHostContext.displayName = 'BottomSheetStackHostContext';

/**
 * Id of the level whose content the current subtree is rendered in, or null
 * at the stack's root. A level provides its own id around its content so a
 * sheet rendered inside it stacks right above it.
 */
export const BottomSheetStackParentLevelContext = createContext<string | null>(
  null,
);
BottomSheetStackParentLevelContext.displayName =
  'BottomSheetStackParentLevelContext';

/**
 * The stack the current subtree is a level of, or null: no stack, or a stack
 * whose content is at a different layer depth than this subtree (a Core layer
 * opened inside a level sits between them). Sheets and the stack itself read
 * the host through this, never through the raw context.
 */
export function useBottomSheetStackHost(): BottomSheetStackHostContextValue | null {
  const host = use(BottomSheetStackHostContext);
  const depth = useLayerDepth();
  return host != null && host.layerDepth === depth ? host : null;
}

/**
 * The layer depth a stack's content renders at when the stack wraps it in one
 * LayerDepthProvider: what the stack publishes as `layerDepth`. Reads the
 * ambient depth, so a stack inside a Core layer still matches its own levels.
 */
export function useBottomSheetStackContentDepth(): number {
  return useLayerDepth() + 1;
}

const subscribeToNothing = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

const UNPLACED_VIEW: BottomSheetStackLevelView = {
  depth: 0,
  isTop: false,
};

/** What the level protocol hook hands back to a sheet. */
export interface BottomSheetStackLevel {
  /** The level's id; provide it as the parent level around the content. */
  id: string;
  /** Ref for the hidden in-place anchor element the level renders. */
  anchorRef: RefObject<HTMLElement | null>;
  /**
   * Where to portal the level's panel, or null while there is nothing to
   * portal into: on the server, during hydration, and until the stack has
   * placed the level for the first time. Once placed it stays set, so a
   * level hidden by Suspense or Activity keeps its panel and its state.
   */
  portalTarget: HTMLElement | null;
  /**
   * The stack's view of this level. Before the first placement the level is
   * not top and has depth 0; after it leaves the stack (Suspense, Activity)
   * the last placed depth is kept so a return does not animate from zero.
   */
  view: BottomSheetStackLevelView;
  /** Forwards a gesture-driven scrim opacity for this level. */
  onScrimOpacity: (opacity: number) => void;
}

/**
 * The level side of the stack protocol, shared by the sheets that can be
 * levels. Registers in a layout effect with a `useId` key and an in-place
 * anchor, reports the given state whenever it changes, touches the stack on
 * every commit, and owns the box the panel portals into.
 *
 * With a null host (no stack) it registers nothing, creates nothing, and
 * returns an unplaced view, so a sheet can call it unconditionally.
 */
export function useBottomSheetStackLevel(
  host: BottomSheetStackHostContextValue | null,
  kind: BottomSheetStackLevelKind,
  state: BottomSheetStackLevelState,
): BottomSheetStackLevel {
  const id = useId();
  const parentId = use(BottomSheetStackParentLevelContext);
  const anchorRef = useRef<HTMLElement | null>(null);
  // The level owns its box so a re-registration (StrictMode, Suspense,
  // Activity) keeps the same portal target and the panel keeps its state.
  // Created on the client only; the server renders no portal.
  const [box] = useState(() =>
    host == null || typeof document === 'undefined'
      ? null
      : document.createElement('div'),
  );
  // Server snapshot false; the hydrating render matches the server (no
  // portal), and the post-hydration re-render mounts it.
  const isClient = useSyncExternalStore(
    subscribeToNothing,
    getClientSnapshot,
    getServerSnapshot,
  );
  const register = host?.register;
  const report = host?.report;
  const touch = host?.touch;
  const onScrimOpacity = host?.onScrimOpacity;

  useLayoutEffect(() => {
    const anchor = anchorRef.current;
    if (register == null || anchor == null || box == null) {
      return;
    }
    return register({id, kind, anchor, parentId, box});
  }, [box, id, kind, parentId, register]);

  const {isOpen, isPresented, purpose, label, finalFocusRef, dismiss} = state;
  useLayoutEffect(() => {
    report?.(id, {isOpen, isPresented, purpose, label, finalFocusRef, dismiss});
  }, [dismiss, finalFocusRef, id, isOpen, isPresented, label, purpose, report]);

  // Any commit of this level may have moved it in the tree.
  useLayoutEffect(() => {
    touch?.();
  });

  const placedView = host?.views.get(id);
  // The panel mounts one commit after registration, once the stack has placed
  // the level, so its first painted frame already has the right depth and
  // nothing animates from a wrong value. The latch keeps it mounted after.
  const [hasBeenPlaced, setHasBeenPlaced] = useState(false);
  useLayoutEffect(() => {
    if (placedView != null && !hasBeenPlaced) {
      // eslint-disable-next-line @eslint-react/set-state-in-effect -- latches the first placement so the panel stays mounted while the level is out of the stack
      setHasBeenPlaced(true);
    }
  }, [hasBeenPlaced, placedView]);
  const lastViewRef = useRef(UNPLACED_VIEW);
  useLayoutEffect(() => {
    if (placedView != null) {
      lastViewRef.current = placedView;
    }
  }, [placedView]);
  const view =
    placedView ??
    (hasBeenPlaced ? {...lastViewRef.current, isTop: false} : UNPLACED_VIEW);

  const forwardScrimOpacity = useCallback(
    (opacity: number) => onScrimOpacity?.(id, opacity),
    [id, onScrimOpacity],
  );

  return {
    id,
    anchorRef,
    portalTarget:
      isClient && (placedView != null || hasBeenPlaced) ? box : null,
    view,
    onScrimOpacity: forwardScrimOpacity,
  };
}
