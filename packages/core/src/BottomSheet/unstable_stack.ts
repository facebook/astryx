// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file unstable_stack.ts
 * @input Uses React, the layer depth context, the Dialog purpose type, and the shared focus-return helper
 * @output unstable_ host and parent-level contexts, the depth-checked host reader, the level protocol hook, their types, and the focus-return helper an external host needs to stack BottomSheet levels
 * @position Lab-only coordination seam between Core sheet hosts and @astryxdesign/lab BottomSheetStack; not part of the public API
 *
 * A BottomSheet or BottomSheetSwitcher rendered under a stacking host gives up
 * its own native dialog and becomes one level of that host. The host owns the
 * dialog, scrim, modal boundary, scroll lock, and dismissal; it never reads
 * its children. Each level registers itself from wherever it is rendered —
 * through wrappers, DOM elements, Suspense, Activity, providers, portals — and
 * reports what the host needs: whether it is open and presented, its purpose,
 * label, final-focus target, and a way to close it through its own callback.
 *
 * Registration happens only in layout effects, keyed by `useId`, so a render
 * that never commits registers nothing and StrictMode leaves one entry per
 * level. Order is tree order: each level renders a hidden in-place anchor and
 * names its parent level through context, and the host sorts siblings by the
 * anchors' document position with children right after their parent. Each
 * level owns the box its panel portals into, so re-registration (Suspense,
 * Activity, StrictMode) keeps the panel and its state.
 *
 * A sheet joins a host only at the host's own layer depth. The host records
 * the depth of its content (`useLayerDepth()` inside its LayerDepthProvider)
 * and a sheet compares it with its own; every Core layer that opens its own
 * top-layer element (Dialog, AlertDialog, popover-based layers, Lightbox,
 * MobileNav) already pushes its content one level deeper, so a sheet opened
 * inside such a layer is a normal standalone sheet above it rather than a
 * level painted below it, with no change to those layers. A stacked level
 * adds no depth around its own content, so a sheet inside a level's content
 * joins the stack right above that level.
 *
 * Without a provider the contexts are null and every Core host behaves
 * exactly as it does today: the reads are inert, nothing is registered, and
 * no provider is added to Core's render tree.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/BottomSheet/BottomSheet.tsx
 * - /packages/core/src/BottomSheet/BottomSheetSwitcher.tsx
 * - /packages/core/src/BottomSheet/unstable_stack.test.tsx
 * - /packages/lab/src/BottomSheetStack/BottomSheetStack.tsx
 * - /scripts/sync-exports.js
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
import {focusForLastInput} from '../utils/focusReturn';

/**
 * What kind of Core host a level is. Lab-only coordination for
 * `@astryxdesign/lab` BottomSheetStack; no stability promise.
 */
export type unstable_BottomSheetStackLevelKind = 'sheet' | 'switcher';

/**
 * What a level reports to its host. Lab-only coordination for
 * `@astryxdesign/lab` BottomSheetStack; no stability promise.
 */
export interface unstable_BottomSheetStackLevelState {
  /**
   * Whether the level is open by its own controlled state (`isOpen`, or a
   * non-null `activeSheet` naming a mounted sheet). The host derives the open
   * set, the top level, and every level's depth from this.
   */
  isOpen: boolean;
  /**
   * Whether the level is on screen, including its exit motion. The host keeps
   * its dialog open while any level is presented.
   */
  isPresented: boolean;
  /**
   * Dismissal purpose of the level's interactive sheet: for a switcher, the
   * active child's. The host applies it to Escape and scrim interaction.
   */
  purpose: DialogPurpose;
  /** Accessible name of the level's interactive sheet, for the host dialog. */
  label: string | undefined;
  /**
   * Element that receives focus when this level's close also closes the host.
   * A switcher level has none and reports `undefined`.
   */
  finalFocusRef: RefObject<HTMLElement | null> | undefined;
  /**
   * Closes the level through its own controlled callback
   * (`onOpenChange(false)` or `onActiveSheetChange(null)`). Identity stays
   * stable for the life of the level; purpose gating is the host's.
   */
  dismiss: () => void;
}

/**
 * What the host tells one level. Lab-only coordination for
 * `@astryxdesign/lab` BottomSheetStack; no stability promise.
 */
export interface unstable_BottomSheetStackLevelView {
  /**
   * Open levels above this one. `0` is the top; a covered level stays
   * mounted, inert, and visibly receded by its depth.
   */
  depth: number;
  /** Whether this level is the top, interactive level. */
  isTop: boolean;
}

/**
 * How a level registers with its host. Lab-only coordination for
 * `@astryxdesign/lab` BottomSheetStack; no stability promise.
 */
export interface unstable_BottomSheetStackLevelRegistration {
  /** The level's `useId`, stable for its life. */
  id: string;
  kind: unstable_BottomSheetStackLevelKind;
  /**
   * Hidden element the level renders in place. The host orders sibling
   * levels by the anchors' document position.
   */
  anchor: Element;
  /** Id of the level whose content this level is rendered in, or null. */
  parentId: string | null;
  /**
   * Level-owned element the level portals its panel into. The host places it
   * inside its dialog, in stack order, and marks it inert while covered.
   */
  box: HTMLElement;
}

/**
 * What a stacking host provides to every level under it. Lab-only
 * coordination for `@astryxdesign/lab` BottomSheetStack; no stability promise.
 */
export interface unstable_BottomSheetStackHostContextValue {
  /** Whether the host dialog is modal with a scrim. Levels never set this. */
  hasScrim: boolean;
  /**
   * Layer depth of the host's content. A sheet joins only when its own
   * `useLayerDepth()` equals this: a Core layer opened inside a level pushes
   * its content deeper, so a sheet inside it stays standalone above that layer.
   */
  layerDepth: number;
  /**
   * Adds a level. Called from a layout effect; returns the matching removal.
   * Registering an id again replaces its registration and keeps its report.
   */
  register: (
    registration: unstable_BottomSheetStackLevelRegistration,
  ) => () => void;
  /** Reports a registered level's current state. Idempotent for an equal state. */
  report: (id: string, state: unstable_BottomSheetStackLevelState) => void;
  /**
   * Asks the host to re-derive order from the anchors. A level calls it on
   * every commit so a move in the tree is followed; the host bails out when
   * the order is unchanged.
   */
  touch: () => void;
  /**
   * Forwards a gesture-driven scrim opacity (0..1) from a level's panel to
   * the host's shared backdrop. The host honours only its top level.
   */
  onScrimOpacity: (id: string, opacity: number) => void;
  /**
   * The host's current view of every registered level, by id. A level that
   * has registered but not yet been placed has no entry.
   */
  views: ReadonlyMap<string, unstable_BottomSheetStackLevelView>;
}

/**
 * Context a stacking host provides once around everything it stacks. Core
 * reads it through `unstable_useBottomSheetStackHost`; the default is `null`,
 * so without a host nothing changes.
 *
 * Lab-only coordination for `@astryxdesign/lab` BottomSheetStack; no stability
 * promise.
 */
// eslint-disable-next-line @eslint-react/naming-convention-context-name -- the unstable_ prefix marks this Lab-only seam
export const unstable_BottomSheetStackHostContext =
  createContext<unstable_BottomSheetStackHostContextValue | null>(null);
unstable_BottomSheetStackHostContext.displayName =
  'unstable_BottomSheetStackHostContext';

/**
 * Id of the level whose content the current subtree is rendered in, or null
 * at the host's root. A level provides its own id around its content so a
 * sheet rendered inside it stacks right above it.
 *
 * Lab-only coordination for `@astryxdesign/lab` BottomSheetStack; no stability
 * promise.
 */
// eslint-disable-next-line @eslint-react/naming-convention-context-name -- the unstable_ prefix marks this Lab-only seam
export const unstable_BottomSheetStackParentLevelContext = createContext<
  string | null
>(null);
unstable_BottomSheetStackParentLevelContext.displayName =
  'unstable_BottomSheetStackParentLevelContext';

/**
 * The host the current subtree is a level of, or null: no host, or a host
 * whose content is at a different layer depth than this subtree (a Core
 * layer opened inside a level sits between them). Core hosts and the Lab
 * stack itself read the host through this, never through the raw context.
 *
 * Lab-only coordination for `@astryxdesign/lab` BottomSheetStack; no stability
 * promise.
 */
export const unstable_useBottomSheetStackHost: () => unstable_BottomSheetStackHostContextValue | null =
  useBottomSheetStackHost;

function useBottomSheetStackHost(): unstable_BottomSheetStackHostContextValue | null {
  const host = use(unstable_BottomSheetStackHostContext);
  const depth = useLayerDepth();
  return host != null && host.layerDepth === depth ? host : null;
}

/**
 * The layer depth a host's content renders at when the host wraps it in one
 * LayerDepthProvider: what the host publishes as `layerDepth`. Reads the
 * ambient depth, so a host inside a Core layer still matches its own levels.
 *
 * Lab-only coordination for `@astryxdesign/lab` BottomSheetStack; no stability
 * promise.
 */
export const unstable_useBottomSheetStackContentDepth: () => number =
  useBottomSheetStackContentDepth;

function useBottomSheetStackContentDepth(): number {
  return useLayerDepth() + 1;
}

const subscribeToNothing = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

const UNPLACED_VIEW: unstable_BottomSheetStackLevelView = {
  depth: 0,
  isTop: false,
};

/**
 * What the level protocol hook hands back to a Core host. Lab-only
 * coordination for `@astryxdesign/lab` BottomSheetStack; no stability promise.
 */
export interface unstable_BottomSheetStackLevel {
  /** The level's id; provide it as the parent level around the content. */
  id: string;
  /** Ref for the hidden in-place anchor element the level renders. */
  anchorRef: RefObject<HTMLElement | null>;
  /**
   * Where to portal the level's panel, or null while there is nothing to
   * portal into: on the server, during hydration, and until the host has
   * placed the level for the first time. Once placed it stays set, so a
   * level hidden by Suspense or Activity keeps its panel and its state.
   */
  portalTarget: HTMLElement | null;
  /**
   * The host's view of this level. Before the first placement the level is
   * not top and has depth 0; after it leaves the stack (Suspense, Activity)
   * the last placed depth is kept so a return does not animate from zero.
   */
  view: unstable_BottomSheetStackLevelView;
  /** Forwards a gesture-driven scrim opacity for this level. */
  onScrimOpacity: (opacity: number) => void;
}

/**
 * The level side of the stack protocol, shared by the Core hosts that can be
 * levels. Registers in a layout effect with a `useId` key and an in-place
 * anchor, reports the given state whenever it changes, touches the host on
 * every commit, and owns the box the panel portals into.
 *
 * With a null host (no stack) it registers nothing, creates nothing, and
 * returns an unplaced view, so a Core host can call it unconditionally.
 *
 * Lab-only coordination for `@astryxdesign/lab` BottomSheetStack; no stability
 * promise.
 */
export const unstable_useBottomSheetStackLevel: (
  host: unstable_BottomSheetStackHostContextValue | null,
  kind: unstable_BottomSheetStackLevelKind,
  state: unstable_BottomSheetStackLevelState,
) => unstable_BottomSheetStackLevel = useBottomSheetStackLevel;

function useBottomSheetStackLevel(
  host: unstable_BottomSheetStackHostContextValue | null,
  kind: unstable_BottomSheetStackLevelKind,
  state: unstable_BottomSheetStackLevelState,
): unstable_BottomSheetStackLevel {
  const id = useId();
  const parentId = use(unstable_BottomSheetStackParentLevelContext);
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
  // The panel mounts one commit after registration, once the host has placed
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

/**
 * Moves focus so its ring follows the last input, as a standalone sheet's
 * focus return does: no ring after pointer input, a ring after keyboard input.
 * A host calls it when the last level closes and focus returns to the opener
 * or a level's `finalFocusRef`. Core levels turn the document-wide modality
 * tracking on while they are mounted.
 *
 * Lab-only coordination for `@astryxdesign/lab` BottomSheetStack; no stability
 * promise.
 */
export const unstable_focusForLastInput: (
  element: HTMLElement,
  options?: FocusOptions,
) => void = focusForLastInput;
