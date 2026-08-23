// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file layerStack.ts
 * @input Uses the isImeKeyEvent predicate from utils/ime
 * @output Exports the shared layer dismissal stack: registration, top-most
 *   ordering, and the single document-level Escape listener
 * @position Internal to the Layer system; consumed by useLayerDismissal, which
 *   is what overlays actually call. Not exported from the package root.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Layer/useLayerDismissal.ts
 * - /packages/core/src/Layer/useLayerDismissal.test.tsx
 *
 * ## Why one stack
 *
 * Every overlay used to own its own Escape listener, so one press dismissed
 * every open layer (a popover inside a Dialog closed both; a Modal opened from
 * inside another Modal closed both). Patching this per primitive produced
 * parallel registries — the focus-trap Escape stack, Drawer's LIFO registry,
 * useScrollLock's counter. This module is the single registry those collapse
 * into. One press dismisses exactly one layer.
 *
 * ## Only the top layer acts
 *
 * The stack owns ONE `keydown` listener on `document` and routes the press to
 * the top-most layer itself. Overlays do not listen; they register and say what
 * they want done. The alternative — every layer listens and filters itself out
 * — is what forces `stopPropagation()` choreography between element-level and
 * document-level listeners, and it silently breaks whenever a layer forgets.
 *
 * ## Bubble phase, not capture
 *
 * The listener is on the BUBBLE phase so content inside a layer can claim the
 * press first, either by `stopPropagation()` (the press never reaches us) or by
 * `preventDefault()` (we see it and stand down). Editors are the motivating
 * case: Monaco and the rich-text editor use Escape to close their own find
 * widget or autocomplete, and that must win over dismissing the Dialog they sit
 * in. A capture-phase listener would take the press away from them.
 *
 * ## The stack, not the browser, decides
 *
 * When the stack handles a press it calls `preventDefault()`, which suppresses
 * the browser's own close-watcher behavior — both `<dialog>`'s `cancel` event
 * and `popover="auto"` light-dismiss (verified in Chromium; the default action
 * runs after propagation, so a bubble-phase `preventDefault` still beats it).
 * That is deliberate: the native top layer only covers `showModal()` and
 * `popover="auto"`, so relying on it would leave non-modal `show()` drawers,
 * `popover="manual"` layers, and older browsers on a second, differently-behaved
 * code path. One code path, one ordering, everywhere.
 */

import {isImeKeyEvent} from '../utils/ime';

/**
 * What a layer does with an Escape press that reaches it.
 *
 * - `'close'` — dismiss this layer and consume the press. One Escape closes
 *   exactly this layer. The default, and correct for every dismissible layer:
 *   modals, popovers, menus, comboboxes, and hover layers alike.
 * - `'block'` — consume the press WITHOUT dismissing. For a layer that requires
 *   an explicit choice (`Dialog purpose="required"`): Escape must not dismiss
 *   it, and must not fall through and dismiss something behind it either.
 *
 * There is deliberately no "dismiss but let the press continue" variant. Escape
 * affects exactly one layer, always — a rule with no per-component exceptions
 * is one users can predict. Hover layers were the tempting exception (the user
 * never opened the tip, so why should it eat their press?), but guessing wrong
 * that way is destructive: someone dismissing a stray tooltip over a form would
 * lose the whole dialog. Guessing wrong the other way costs one keystroke.
 */
export type LayerEscapeBehavior = 'close' | 'block';

export interface LayerStackEntry {
  /**
   * Identity for removal; also the equality check for top-most, and the key
   * `seq` is assigned against so a layer keeps its place across re-registration.
   */
  token: object;
  /**
   * Nesting depth from the React tree (see LayerDepthContext), NOT the DOM.
   * Context flows through portals and is known during render, so it is correct
   * for layers that portal out and for an inner + outer layer that open in the
   * same commit — the case where effect order lies, because React runs child
   * effects before parent effects.
   */
  depth: number;
  /**
   * Monotonic open order; breaks ties between unrelated layers. Keyed to
   * `token`, not to the registration, because a layer re-registers whenever its
   * behavior or depth changes and must not overtake the layers above it.
   */
  seq: number;
  behavior: LayerEscapeBehavior;
  /**
   * The layer's container element, read lazily at press time. Used only to
   * break ties between layers the React tree reports at the same depth — a raw
   * `useFocusTrap` cannot wrap its content in a depth provider (it renders
   * nothing), so DOM containment is the only nesting signal those have.
   */
  getContainer?: () => HTMLElement | null;
  /**
   * Whether the layer is really on screen right now, asked at press time.
   *
   * Registration alone is not proof: a layer whose open state lives in React
   * state can lag a frame behind the DOM, so gating registration on that state
   * drops presses that arrive in the gap. Such layers register for their whole
   * lifetime and answer this from the DOM instead. Omit it to mean "registered
   * means present", which is true for layers that register on open.
   */
  isPresent?: () => boolean;
  dismiss: () => void;
}

const entries: LayerStackEntry[] = [];
// Open order per layer identity. A layer re-registers whenever its depth or
// behavior changes — a Dialog whose `purpose` flips while open, a focus trap
// that moves — and StrictMode remounts every effect once more on top of that.
// Counting registrations instead would hand the layer a fresh, higher seq each
// time and promote it above the layers opened over it.
let seqByToken = new WeakMap<object, number>();
let nextSeq = 0;
let isListening = false;

function seqFor(token: object): number {
  const existing = seqByToken.get(token);
  if (existing !== undefined) {
    return existing;
  }
  const seq = nextSeq++;
  seqByToken.set(token, seq);
  return seq;
}

/**
 * Order two entries: positive when `a` is above `b`, negative when below.
 * Three keys, each earning its place:
 *
 * 1. **Depth.** The layer nested inside the other is on top. This is what makes
 *    an inner-and-outer pair that mount in the SAME commit come out right;
 *    registration order alone gets it backwards, because React runs child
 *    effects before parent effects.
 * 2. **DOM containment.** Depth only moves when a layer wraps its content in a
 *    `LayerDepthProvider`, which a bare `useFocusTrap` cannot do — it renders
 *    nothing. For those, containment recovers the nesting the tree did not
 *    report.
 * 3. **Registration order.** For unrelated layers, the one opened later is on
 *    top, matching how the browser's own top layer stacks.
 *
 * Modality is deliberately NOT a key. Ranking modals above everything sounds
 * right and is not: a hover tip shown inside a modal renders on top of it, so
 * a modal-first rule would hand the press to the dialog and strand the tip.
 * Nesting already covers the case modality was meant to catch — a layer opened
 * from inside another is deeper, modal or not.
 *
 * Note this is a PARTIAL order: containment relates only nested pairs. Callers
 * must resolve the top with a pairwise max scan, never `Array.sort`, whose
 * result is undefined for a non-transitive comparator.
 */
function compareEntries(a: LayerStackEntry, b: LayerStackEntry): number {
  if (a.depth !== b.depth) {
    return a.depth - b.depth;
  }
  const aEl = a.getContainer?.() ?? null;
  const bEl = b.getContainer?.() ?? null;
  if (aEl != null && bEl != null && aEl !== bEl) {
    if (bEl.contains(aEl)) {
      return 1;
    }
    if (aEl.contains(bEl)) {
      return -1;
    }
  }
  return a.seq - b.seq;
}

function isPresentEntry(entry: LayerStackEntry): boolean {
  return entry.isPresent?.() ?? true;
}

/** The top-most present layer, or null when nothing is on screen. */
function topPresentEntry(): LayerStackEntry | null {
  let top: LayerStackEntry | null = null;
  for (const entry of entries) {
    if (!isPresentEntry(entry)) {
      continue;
    }
    if (top == null || compareEntries(entry, top) > 0) {
      top = entry;
    }
  }
  return top;
}

/**
 * Whether `token` identifies the top-most layer. Overlays that still own a
 * dismissal channel the stack does not model yet (outside-press, swipe) can
 * gate on this so every channel agrees on who is on top.
 */
export function isTopmostLayer(token: object): boolean {
  return topPresentEntry()?.token === token;
}

/** Resolve an Escape press against the stack. Returns whether it was handled. */
function dispatchEscape(): boolean {
  const top = topPresentEntry();
  if (top == null) {
    return false;
  }
  if (top.behavior === 'block') {
    return true;
  }
  top.dismiss();
  return true;
}

function handleKeyDown(event: KeyboardEvent): void {
  if (event.key !== 'Escape') {
    return;
  }
  // An IME user pressing Escape is cancelling a composition, not dismissing a
  // layer. Stand down entirely — the default action must run.
  if (isImeKeyEvent(event)) {
    return;
  }
  // Content inside a layer already claimed this press (see the bubble-phase
  // note in the file header). Honor it and leave the default action alone.
  if (event.defaultPrevented) {
    return;
  }
  if (dispatchEscape()) {
    // Suppress the browser's own close-watcher so it cannot dismiss a second
    // layer behind our back. Propagation is left alone: consumers may
    // legitimately listen for Escape on window, and the stack's decision is
    // already recorded in defaultPrevented.
    event.preventDefault();
  }
}

function startListening(): void {
  if (isListening || typeof document === 'undefined') {
    return;
  }
  document.addEventListener('keydown', handleKeyDown);
  isListening = true;
}

function stopListening(): void {
  if (!isListening || typeof document === 'undefined') {
    return;
  }
  document.removeEventListener('keydown', handleKeyDown);
  isListening = false;
}

/**
 * Add a layer to the stack for as long as it is active. Returns the unregister
 * function; callers own calling it.
 */
export function registerLayer(entry: Omit<LayerStackEntry, 'seq'>): () => void {
  const full: LayerStackEntry = {...entry, seq: seqFor(entry.token)};
  entries.push(full);
  startListening();

  return () => {
    const index = entries.indexOf(full);
    if (index !== -1) {
      entries.splice(index, 1);
    }
    if (entries.length === 0) {
      stopListening();
    }
  };
}

/** Test-only: drop all entries and detach the listener. */
export function resetLayerStackForTests(): void {
  entries.length = 0;
  seqByToken = new WeakMap();
  nextSeq = 0;
  stopListening();
}
