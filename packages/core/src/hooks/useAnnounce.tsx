// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useAnnounce.tsx
 * @input Uses React context and useCallback; DOM APIs and cancellable
 *   animation frames for a singleton live-region pair on the page body and
 *   one persistent polite/assertive pair inside each open Astryx modal
 * @output Exports useAnnounce hook and AnnouncePoliteness type; the internal
 *   ModalAnnounceProvider the Astryx modals render, and the internal delivery
 *   helpers the busy-announcement hook shares
 * @position Core a11y hook; provides imperative screen-reader announcements.
 *   A message follows the nearest open native modal enclosing its caller
 *   (`spec:AST-086` FR14): inside an Astryx modal it is written to that
 *   dialog's own containers, since the page-body channel is not exposed
 *   while a native modal is open; otherwise to the shared page-body pair.
 *   Containers are created empty (FR3), carry the two urgencies (FR5), join
 *   messages written before the previous is exposed and say an identical
 *   same-frame repeat once (FR9), clear shortly after each announcement, and
 *   hand a message still unexposed when its modal stops being exposed to
 *   the channel exposed after it — the modal then on top, or the page body
 *   once no modal is open.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/hooks/index.ts
 */

import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  type ReactNode,
  type RefObject,
} from 'react';

/**
 * Announcement urgency:
 * - `'polite'` (default): announced when the screen reader is idle. Use for
 *   status updates, result counts, "no results", non-urgent confirmations.
 * - `'assertive'`: interrupts the current announcement. Reserve for errors and
 *   time-sensitive alerts.
 */
export type AnnouncePoliteness = 'polite' | 'assertive';

/**
 * Imperative screen-reader announcement function.
 */
export type AnnounceFn = (
  message: string,
  politeness?: AnnouncePoliteness,
) => void;

const CONTAINER_ATTR = 'data-astryx-live-region';

// Visually-hidden clip block (matches the VisuallyHidden primitive). Applied
// inline so the regions work without any stylesheet being present.
const VISUALLY_HIDDEN_CSS =
  'position:absolute;width:1px;height:1px;margin:-1px;padding:0;' +
  'overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;' +
  'inset-block-start:0;inset-inline-start:0;pointer-events:none;' +
  'user-select:none;';

interface LiveRegions {
  polite: HTMLElement;
  assertive: HTMLElement;
}

/**
 * How long an announcement stays in its region before being auto-cleared.
 * Long enough for screen readers to pick the message up and finish reading
 * it; clearing afterwards keeps stale status text out of the accessibility
 * tree for users who browse the DOM later. Each announce resets the timer.
 */
const CLEAR_DELAY_MS = 2000;

const clearTimers: {
  [K in AnnouncePoliteness]: ReturnType<typeof setTimeout> | null;
} = {
  polite: null,
  assertive: null,
};

function cancelScheduledClear(politeness: AnnouncePoliteness): void {
  const timer = clearTimers[politeness];
  if (timer != null) {
    clearTimeout(timer);
    clearTimers[politeness] = null;
  }
}

// Messages announced before the region exposes them (written in the same
// frame) wait here and are exposed together, in order, so none is dropped;
// an identical repeat is the same message and is kept once (spec:AST-086
// FR9). One frame per region writes them.
const pendingFrames: Record<AnnouncePoliteness, number | null> = {
  polite: null,
  assertive: null,
};
// Each pending message counts the announcers waiting on it, so one of them
// withdrawing it (a busy start overtaken by its outcome) leaves it in place
// for the others.
interface PendingMessage {
  text: string;
  holders: number;
}
const pendingMessages: Record<AnnouncePoliteness, PendingMessage[]> = {
  polite: [],
  assertive: [],
};
// The pending message the latest announce joined, until its announcer takes it.
let lastJoined: PendingMessage | null = null;

function cancelPendingFrames(politeness: AnnouncePoliteness): void {
  const frame = pendingFrames[politeness];
  if (frame != null) {
    cancelAnimationFrame(frame);
    pendingFrames[politeness] = null;
  }
  pendingMessages[politeness] = [];
}

function scheduleClear(
  politeness: AnnouncePoliteness,
  target: HTMLElement,
): void {
  cancelScheduledClear(politeness);
  clearTimers[politeness] = setTimeout(() => {
    clearTimers[politeness] = null;
    target.textContent = '';
  }, CLEAR_DELAY_MS);
}

// Singleton: the live regions are created ONCE and stay mounted for the
// lifetime of the document. This is the crux of reliable announcements — many
// screen readers will not announce content injected into a live region that is
// created together with its content ("born with content"). By mounting empty
// regions up front and only mutating their text later, updates are announced.
let regions: LiveRegions | null = null;

function createRegion(politeness: AnnouncePoliteness): HTMLElement {
  const el = document.createElement('div');
  el.setAttribute(CONTAINER_ATTR, politeness);
  el.setAttribute('aria-live', politeness);
  el.setAttribute('aria-atomic', 'true');
  el.setAttribute('role', politeness === 'assertive' ? 'alert' : 'status');
  el.style.cssText = VISUALLY_HIDDEN_CSS;
  document.body.appendChild(el);
  return el;
}

function getRegions(): LiveRegions | null {
  if (typeof document === 'undefined') {
    return null;
  }
  if (regions) {
    // Re-attach if a region was removed from the DOM (e.g. by a test cleanup).
    if (!regions.polite.isConnected) {
      document.body.appendChild(regions.polite);
    }
    if (!regions.assertive.isConnected) {
      document.body.appendChild(regions.assertive);
    }
    return regions;
  }
  regions = {
    polite: createRegion('polite'),
    assertive: createRegion('assertive'),
  };
  return regions;
}

function announceMessage(
  message: string,
  politeness: AnnouncePoliteness,
): void {
  const r = getRegions();
  if (!r) {
    return;
  }
  const target = politeness === 'assertive' ? r.assertive : r.polite;
  const repeat = pendingMessages[politeness].find(
    pending => pending.text === message,
  );
  if (repeat != null) {
    repeat.holders += 1;
    lastJoined = repeat;
    return;
  }
  const pending = {text: message, holders: 1};
  pendingMessages[politeness].push(pending);
  lastJoined = pending;
  if (pendingFrames[politeness] == null) {
    // Clearing first guarantees the mutation is observed even when the new
    // message equals the current text — some AT deduplicate identical content.
    target.textContent = '';
    // A re-set in the next frame is more reliable across AT than an immediate
    // re-set, which can be coalesced with the clear.
    pendingFrames[politeness] = requestAnimationFrame(() => {
      pendingFrames[politeness] = null;
      target.textContent = pendingMessages[politeness]
        .map(pending => pending.text)
        .join(' ');
      pendingMessages[politeness] = [];
    });
  }
  // Auto-clear so the last message does not linger in the accessibility tree
  // indefinitely. Scheduled per announce, so a newer announcement always
  // resets the countdown (the delay comfortably outlasts the rAF re-set).
  scheduleClear(politeness, target);
}

/**
 * Clear any pending announcement from a region without announcing anything new.
 * Used when the triggering context goes away (e.g. a search query is cleared),
 * so stale status text does not linger in the accessibility tree.
 */
function clearRegion(politeness: AnnouncePoliteness): void {
  cancelPendingFrames(politeness);
  cancelScheduledClear(politeness);
  if (!regions) {
    return;
  }
  const target =
    politeness === 'assertive' ? regions.assertive : regions.polite;
  target.textContent = '';
}

/**
 * Returns an imperative `announce(message, politeness?)` function that speaks a
 * message through a persistently-mounted, visually-hidden live region.
 *
 * The polite and assertive regions are created once on first use and kept
 * mounted, so announcements are reliable even for messages that appear
 * immediately (unlike a live region rendered together with its content).
 * Messages announced in the same frame are joined, in order, into one
 * announcement, and an identical repeat is kept once. Each message is automatically cleared a couple of seconds after being
 * announced, so users browsing the DOM later do not encounter stale status
 * text; announcing again before the clear simply resets the countdown.
 *
 * @example
 * ```
 * function Search() {
 *   const announce = useAnnounce();
 *   const onResults = (n: number) => {
 *     announce(n === 0 ? 'No results found' : `${n} results`);
 *   };
 *   // ...
 * }
 * ```
 */
export function useAnnounce(): AnnounceFn {
  const modal = use(ModalAnnounceContext);
  return useCallback(
    (message: string, politeness: AnnouncePoliteness = 'polite') => {
      // Resolved per call: the same owner is sometimes inside a modal and
      // sometimes not, and the modal it is in may have just opened or closed.
      const dialog = enclosingOpenModal(modal);
      if (dialog == null && modal != null && hasDialogNotYetOpen(modal)) {
        // Announced in the commit that opens the enclosing modal — a field
        // error inside `{isOpen && <Dialog isOpen>}` — before the Dialog's
        // own Effect, which runs after its content's, has called
        // showModal(). Choose the route a frame later, when it has; an
        // empty message in the same commit withdraws what waits (FR9).
        deferUntilPresented(modal, message, politeness);
        return;
      }
      if (!message) {
        // An empty message clears any lingering status from the region,
        // including messages joined but not yet exposed — useful when the
        // triggering context ends.
        if (dialog != null) {
          withdrawFromModal(dialog, politeness);
        } else {
          clearRegion(politeness);
        }
        return;
      }
      if (dialog != null) {
        announceInModal(dialog, message, politeness);
        return;
      }
      announceMessage(message, politeness);
    },
    [modal],
  );
}

// Messages from callers whose enclosing modal is being presented in this
// commit, waiting one frame for the route; an empty message among them
// withdraws the earlier ones of its urgency, as it would on a channel.
interface Deferred {
  frame: number;
  messages: Record<AnnouncePoliteness, string[]>;
  clears: Record<AnnouncePoliteness, boolean>;
}
const deferredByScope = new WeakMap<ModalAnnounceScope, Deferred>();

function deferUntilPresented(
  scope: ModalAnnounceScope,
  message: string,
  politeness: AnnouncePoliteness,
): void {
  let deferred = deferredByScope.get(scope);
  if (deferred == null) {
    const created: Deferred = {
      frame: requestAnimationFrame(() => {
        deferredByScope.delete(scope);
        const opened = enclosingOpenModal(scope);
        for (const urgency of ['polite', 'assertive'] as const) {
          if (created.clears[urgency]) {
            if (opened != null) {
              withdrawFromModal(opened, urgency);
            } else {
              clearRegion(urgency);
            }
          }
          for (const text of created.messages[urgency]) {
            if (opened != null) {
              announceInModal(opened, text, urgency);
            } else {
              announceMessage(text, urgency);
            }
          }
        }
      }),
      messages: {polite: [], assertive: []},
      clears: {polite: false, assertive: false},
    };
    deferred = created;
    deferredByScope.set(scope, deferred);
  }
  if (!message) {
    deferred.messages[politeness] = [];
    deferred.clears[politeness] = true;
    return;
  }
  if (!deferred.messages[politeness].includes(message)) {
    deferred.messages[politeness].push(message);
  }
}

/**
 * Whether a provider in the chain has a dialog that is not open (yet): the
 * caller sits inside a modal that is mounting or about to be presented.
 */
function hasDialogNotYetOpen(scope: ModalAnnounceScope | null): boolean {
  for (let s = scope; s != null; s = s.parent) {
    const dialog = s.dialogRef.current;
    if (dialog == null || !dialog.open) {
      return true;
    }
  }
  return false;
}

// =============================================================================
// Inside an Astryx modal (spec:AST-086 FR14)
// =============================================================================

const MODAL_REGION_ATTR = 'data-astryx-modal-live-region';

/**
 * What an Astryx modal tells the hooks beneath it: where its dialog element
 * is, and the modal above it, so a caller inside a non-modal sheet nested in
 * a modal still finds the modal.
 */
interface ModalAnnounceScope {
  dialogRef: RefObject<HTMLDialogElement | null>;
  parent: ModalAnnounceScope | null;
}

const ModalAnnounceContext = createContext<ModalAnnounceScope | null>(null);
ModalAnnounceContext.displayName = 'ModalAnnounceContext';

/** Whether `dialog` is open as a native modal right now. */
function isOpenModal(dialog: HTMLDialogElement | null | undefined): boolean {
  return dialog != null && dialog.open && dialog.matches(':modal');
}

/**
 * Whether what is written inside `dialog` reaches assistive technology: open
 * as a modal, and not taken out of the accessibility tree by `inert` or
 * `aria-hidden` — a BottomSheet, standalone or a switcher step, stays open
 * through its exit motion in exactly that state.
 */
function isExposed(dialog: HTMLDialogElement): boolean {
  return (
    isOpenModal(dialog) &&
    !dialog.inert &&
    dialog.getAttribute('aria-hidden') !== 'true'
  );
}

/**
 * The nearest open native modal dialog among the Astryx modals enclosing a
 * caller: a scrimless BottomSheet or Drawer is a dialog that is open but not
 * modal, so the walk continues to the modal above it.
 */
function enclosingOpenModal(
  scope: ModalAnnounceScope | null,
): HTMLDialogElement | null {
  for (let s = scope; s != null; s = s.parent) {
    const dialog = s.dialogRef.current;
    if (isOpenModal(dialog)) {
      return dialog;
    }
  }
  return null;
}

// The dialogs the providers have seen open, in the order they were last
// presented. `showModal()` sets `open` as it is called, so the order of the
// attribute records is the top-layer order, and the last one still open as a
// modal is the modal on top.
const presented: HTMLDialogElement[] = [];

function notePresented(dialog: HTMLDialogElement): void {
  const at = presented.indexOf(dialog);
  if (at !== -1) {
    presented.splice(at, 1);
  }
  if (dialog.open) {
    presented.push(dialog);
  }
}

function forgetPresented(dialog: HTMLDialogElement): void {
  const at = presented.indexOf(dialog);
  if (at !== -1) {
    presented.splice(at, 1);
  }
}

/**
 * The modal on top among the ones Astryx renders: the last presented that is
 * open, modal and exposed. One above it that is exiting (open, not exposed)
 * is on its way out and does not count — the step the person went back to
 * is on top while the step they left fades.
 */
function topExposedModal(): HTMLDialogElement | null {
  for (let i = presented.length - 1; i >= 0; i -= 1) {
    if (isExposed(presented[i])) {
      return presented[i];
    }
  }
  return null;
}

/**
 * The channel exposed to the person right now, other than `except`, read
 * down the top-layer order: the first dialog that is exposed is it; a dialog
 * still open as a modal but not exposed — one running its exit above the
 * rest — covers everything beneath it, so nothing is exposed yet
 * (`'covered'`); the page body (`null`) is exposed once no native modal is
 * open.
 */
function nextExposedChannel(
  except: HTMLDialogElement,
): HTMLDialogElement | 'covered' | null {
  for (let i = presented.length - 1; i >= 0; i -= 1) {
    const dialog = presented[i];
    if (dialog !== except && isExposed(dialog)) {
      return dialog;
    }
    // `except` itself, still an open modal through its exit, covers what is
    // beneath it as any other exiting modal does.
    if (isOpenModal(dialog)) {
      return 'covered';
    }
  }
  // A modal presented in this same task is not in the list yet (its
  // attribute record is delivered after the task): the document still knows
  // it. With no presentation order to go by, the last such dialog in the
  // document stands for the one on top.
  let fallback: HTMLDialogElement | null = null;
  for (const dialog of document.querySelectorAll('dialog')) {
    if (dialog !== except && !presented.includes(dialog) && isExposed(dialog)) {
      fallback = dialog;
    }
  }
  return fallback;
}

/** Whether any native modal dialog is open in the document right now. */
function isAnyModalOpen(): boolean {
  for (const dialog of document.querySelectorAll('dialog')) {
    if (isOpenModal(dialog)) {
      return true;
    }
  }
  return false;
}

// Words waiting for an exiting modal's real close: their dialog has left
// the accessibility tree for its exit but is still an open native modal, or
// such a dialog covers the channel they would go to, so nothing is exposed
// yet. They are delivered when a dialog closes (or theirs is exposed again).
const held = new Map<HTMLDialogElement, Record<AnnouncePoliteness, string[]>>();

function hold(
  dialog: HTMLDialogElement,
  message: string,
  politeness: AnnouncePoliteness,
): void {
  let slot = held.get(dialog);
  if (slot == null) {
    slot = {polite: [], assertive: []};
    held.set(dialog, slot);
  }
  if (!slot[politeness].includes(message)) {
    slot[politeness].push(message);
  }
}

/** Drop what `dialog` holds for `politeness`: the owner took it back. */
function dropHeld(
  dialog: HTMLDialogElement,
  politeness: AnnouncePoliteness,
): void {
  const slot = held.get(dialog);
  if (slot == null) {
    return;
  }
  slot[politeness] = [];
  if (slot.polite.length === 0 && slot.assertive.length === 0) {
    held.delete(dialog);
  }
}

/** Deliver what `dialog` held, now that a channel may be exposed. */
function releaseHeld(dialog: HTMLDialogElement): void {
  const slot = held.get(dialog);
  if (slot == null) {
    return;
  }
  held.delete(dialog);
  for (const politeness of ['polite', 'assertive'] as const) {
    if (slot[politeness].length > 0) {
      const message = slot[politeness].join(' ');
      if (isExposed(dialog)) {
        announceInModal(dialog, message, politeness);
      } else {
        // Holds again if still nothing is exposed.
        deliverBeyond(dialog, message, politeness);
      }
    }
  }
}

function releaseAllHeld(): void {
  for (const dialog of [...held.keys()]) {
    releaseHeld(dialog);
  }
}

/**
 * Deliver `message` through the channel exposed now that `dialog` is not:
 * the modal on top, the page body once no modal is open, or — while the
 * dialog is still an open modal through its exit, with nothing exposed —
 * held until it closes.
 */
function deliverBeyond(
  dialog: HTMLDialogElement,
  message: string,
  politeness: AnnouncePoliteness,
): void {
  const next = nextExposedChannel(dialog);
  if (next === 'covered' || (next == null && isAnyModalOpen())) {
    // An exiting modal — this one, or one above the next candidate — is
    // still open and covers what is beneath it: nothing is exposed until
    // it closes.
    hold(dialog, message, politeness);
    return;
  }
  if (next != null) {
    announceInModal(next, message, politeness);
    return;
  }
  announceMessage(message, politeness);
}

/**
 * Move whatever `dialog`'s containers hold that assistive technology has not
 * had yet to the channel exposed now. Called when the dialog stops being
 * exposed — closed, taken inert or `aria-hidden` for its exit, or unmounted
 * while open — so a message sent just before is not lost (FR14).
 */
function handOffUnexposed(dialog: HTMLDialogElement): void {
  for (const politeness of ['polite', 'assertive'] as const) {
    const waiting = takeUnexposed(dialog, politeness);
    if (waiting.length > 0) {
      deliverBeyond(dialog, waiting.join(' '), politeness);
    }
  }
}

/**
 * Rendered by every Astryx component that owns a native `<dialog>` (Dialog,
 * BottomSheet, Drawer, Lightbox; CommandPalette through Dialog), around the
 * dialog's content, so `useAnnounce` beneath it routes into that dialog while
 * it is open as a modal. The provider watches the dialog's `open`, `inert`
 * and `aria-hidden` attributes: when the dialog stops being exposed, any
 * message its containers hold that assistive technology has not had yet is
 * handed to the channel exposed then — the modal on top, or the shared
 * channel — and the same happens when the provider unmounts with the dialog
 * still open. A dialog closed and shown again in one task is exposed again
 * by the time the change is seen, so its words stay (a hand-over, not a
 * close).
 *
 * Internal: imported by path inside the package; not exported from the hooks
 * barrel or the package entry.
 */
export function ModalAnnounceProvider({
  dialogRef,
  children,
}: {
  dialogRef: RefObject<HTMLDialogElement | null>;
  children: ReactNode;
}): ReactNode {
  const parent = use(ModalAnnounceContext);
  const scope = useMemo<ModalAnnounceScope>(
    () => ({dialogRef, parent}),
    [dialogRef, parent],
  );
  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog == null) {
      return;
    }
    notePresented(dialog);
    let wasOpen = dialog.open;
    const onPresentationChange = () => {
      // The order is the top-layer order: only `open` being set moves a
      // dialog up it. A dialog turning inert or aria-hidden for its exit
      // keeps its place, so the step the person went back to stays on top.
      if (dialog.open !== wasOpen) {
        wasOpen = dialog.open;
        notePresented(dialog);
      }
      if (!isExposed(dialog)) {
        handOffUnexposed(dialog);
      }
      // Closed for real, or exposed again after an exit that was called
      // off: whatever waited for this moment — held by this dialog, or by
      // one this dialog was covering — goes out.
      if (!dialog.open || isExposed(dialog)) {
        releaseAllHeld();
      }
    };
    const presentation = new MutationObserver(onPresentationChange);
    presentation.observe(dialog, {
      attributes: true,
      attributeFilter: ['open', 'inert', 'aria-hidden'],
    });
    return () => {
      presentation.disconnect();
      // Unmounted while open: no close event, no attribute change — the
      // words would otherwise stay in a detached container.
      handOffUnexposed(dialog);
      forgetPresented(dialog);
      releaseAllHeld();
    };
  }, [dialogRef]);
  return <ModalAnnounceContext value={scope}>{children}</ModalAnnounceContext>;
}

// Each in-dialog region's pending state: the messages written since its text
// was last exposed, the frame that will expose them joined, the frame after
// that (text set in one frame is not yet taken by assistive technology in
// that same frame, so a message arriving before this frame runs still joins
// rather than wiping the words), and the timer that clears them afterwards.
interface ModalPending {
  messages: string[];
  // Announcers waiting on each message, by text: one withdrawing a message
  // (a busy start overtaken by its outcome) leaves it for the others.
  holders: Map<string, number>;
  frame: number | null;
  settleFrame: number | null;
  timer: ReturnType<typeof setTimeout> | null;
}

const pendingByRegion = new WeakMap<HTMLElement, ModalPending>();

function cancelPending(pending: ModalPending): void {
  if (pending.frame != null) {
    cancelAnimationFrame(pending.frame);
  }
  if (pending.settleFrame != null) {
    cancelAnimationFrame(pending.settleFrame);
  }
  if (pending.timer != null) {
    clearTimeout(pending.timer);
  }
}

/** Words written to `target` that assistive technology has not had yet. */
function unexposedMessages(target: HTMLElement): string[] {
  const pending = pendingByRegion.get(target);
  if (pending == null) {
    return [];
  }
  return pending.frame != null || pending.settleFrame != null
    ? pending.messages
    : [];
}

function modalRegion(
  dialog: HTMLDialogElement,
  politeness: AnnouncePoliteness,
): HTMLElement | null {
  return dialog.querySelector<HTMLElement>(
    `:scope > [${MODAL_REGION_ATTR}="${politeness}"]`,
  );
}

/**
 * The dialog's own live region for one urgency, created empty on first use
 * and kept as a direct child of the dialog so it survives the dialog's
 * content re-rendering.
 */
function ensureModalRegion(
  dialog: HTMLDialogElement,
  politeness: AnnouncePoliteness,
): HTMLElement {
  let region = modalRegion(dialog, politeness);
  if (region == null) {
    region = document.createElement('div');
    region.setAttribute(MODAL_REGION_ATTR, politeness);
    region.setAttribute(
      'role',
      politeness === 'assertive' ? 'alert' : 'status',
    );
    region.setAttribute('aria-live', politeness);
    region.setAttribute('aria-atomic', 'true');
    region.style.cssText = VISUALLY_HIDDEN_CSS;
    dialog.appendChild(region);
  }
  return region;
}

/**
 * Speak `message` through the open modal `dialog`'s own live region, joining
 * it to messages written there that are not yet exposed and saying an
 * identical repeat once. A dialog that is not exposed — taken inert for its
 * exit — passes the message on to the channel that is; a dialog covered by a
 * later modal is not heard (FR14), so the message is not written and its
 * region is cleared. Internal: shared with the busy-announcement hook, whose
 * owner may sit inside a native modal an app renders without Astryx.
 */
export function announceInModal(
  dialog: HTMLDialogElement,
  message: string,
  politeness: AnnouncePoliteness = 'polite',
): void {
  if (!isExposed(dialog)) {
    deliverBeyond(dialog, message, politeness);
    return;
  }
  const top = topExposedModal();
  if (top != null && top !== dialog && presented.includes(dialog)) {
    // Covered by a later Astryx modal: the owner is not operable until that
    // one closes, and a message announced meanwhile is not heard — the
    // container is clear before this modal is on top again.
    clearModalRegion(dialog, politeness);
    return;
  }
  const target = ensureModalRegion(dialog, politeness);
  const unexposed = unexposedMessages(target);
  const messages = unexposed.includes(message)
    ? unexposed
    : [...unexposed, message];
  const previous = pendingByRegion.get(target);
  const holders = new Map(
    unexposed.length > 0 && previous != null ? previous.holders : [],
  );
  holders.set(message, (holders.get(message) ?? 0) + 1);
  if (previous != null) {
    cancelPending(previous);
  }
  // Clearing first guarantees the mutation is observed even when the new
  // message equals the current text — some AT deduplicate identical content.
  target.textContent = '';
  const pending: ModalPending = {
    messages,
    holders,
    frame: null,
    settleFrame: null,
    timer: null,
  };
  pending.frame = requestAnimationFrame(() => {
    pending.frame = null;
    if (!isExposed(dialog)) {
      // Stopped being exposed between the call and this frame: the words go
      // where they will be heard.
      pendingByRegion.delete(target);
      deliverBeyond(dialog, pending.messages.join(' '), politeness);
      return;
    }
    target.textContent = pending.messages.join(' ');
    pending.settleFrame = requestAnimationFrame(() => {
      pending.settleFrame = null;
    });
    pending.timer = setTimeout(() => {
      target.textContent = '';
      pendingByRegion.delete(target);
    }, CLEAR_DELAY_MS);
  });
  pendingByRegion.set(target, pending);
}

/**
 * Withdraw one announcer's share of `message` from `dialog` before it is
 * exposed — written to the region but not yet spoken, or held for the
 * dialog's real close — so a busy start overtaken by its own outcome is
 * never heard ahead of it inside a modal, as on the shared channel
 * (`spec:AST-086` FR8). The message stays while another announcer holds it.
 * Internal: used by the busy-announcement hook's settle function.
 */
export function withdrawFromModalPending(
  dialog: HTMLDialogElement,
  message: string,
  politeness: AnnouncePoliteness = 'polite',
): void {
  const region = modalRegion(dialog, politeness);
  const pending = region == null ? undefined : pendingByRegion.get(region);
  if (
    region != null &&
    pending != null &&
    (pending.frame != null || pending.settleFrame != null)
  ) {
    const count = pending.holders.get(message) ?? 0;
    if (count > 1) {
      pending.holders.set(message, count - 1);
    } else if (count === 1) {
      pending.holders.delete(message);
      pending.messages = pending.messages.filter(text => text !== message);
      if (pending.messages.length === 0) {
        cancelPending(pending);
        pendingByRegion.delete(region);
        region.textContent = '';
      } else if (pending.frame == null) {
        // Already written this frame, not yet taken: show the rest.
        region.textContent = pending.messages.join(' ');
      }
    }
  }
  const slot = held.get(dialog);
  if (slot != null) {
    slot[politeness] = slot[politeness].filter(text => text !== message);
    if (slot.polite.length === 0 && slot.assertive.length === 0) {
      held.delete(dialog);
    }
  }
}

/**
 * Withdraw whatever the dialog's region for `politeness` holds or is about to
 * hold, as an empty message does on the shared channel. A dialog that never
 * announced has no region and nothing to clear.
 */
export function clearModalRegion(
  dialog: HTMLDialogElement,
  politeness: AnnouncePoliteness,
): void {
  const region = modalRegion(dialog, politeness);
  if (region == null) {
    return;
  }
  const pending = pendingByRegion.get(region);
  if (pending != null) {
    cancelPending(pending);
    pendingByRegion.delete(region);
  }
  region.textContent = '';
}

/**
 * An empty message from inside `dialog`: withdraw the words its region for
 * `politeness` holds or is about to hold, and the words of that urgency
 * waiting for the dialog's real close, so a status taken back while the
 * dialog exits ("3 results", then the query is cleared) is not delivered
 * after all once the dialog has closed.
 */
function withdrawFromModal(
  dialog: HTMLDialogElement,
  politeness: AnnouncePoliteness,
): void {
  clearModalRegion(dialog, politeness);
  dropHeld(dialog, politeness);
}

/** Take the unexposed messages out of a dialog's region, clearing it. */
function takeUnexposed(
  dialog: HTMLDialogElement,
  politeness: AnnouncePoliteness,
): string[] {
  const region = modalRegion(dialog, politeness);
  if (region == null) {
    return [];
  }
  const waiting = unexposedMessages(region);
  clearModalRegion(dialog, politeness);
  return waiting;
}

/**
 * The nearest open native modal dialog enclosing `element` in the DOM, Astryx
 * or app-rendered. Internal: the busy-announcement hook routes by its owner's
 * element so a busy start inside a native modal an app renders without Astryx
 * is still heard inside it (`spec:AST-086` FR14, last sentence).
 */
export function enclosingModalDialog(
  element: Element | null | undefined,
): HTMLDialogElement | null {
  let dialog = element?.closest('dialog') ?? null;
  while (dialog != null) {
    if (isOpenModal(dialog)) {
      return dialog;
    }
    dialog = dialog.parentElement?.closest('dialog') ?? null;
  }
  return null;
}

/**
 * Takes the pending message the latest announce joined, so that announcer can
 * withdraw its own share of it later. Shared with useBusyAnnouncement; not
 * exported from the hooks index.
 *
 * @internal
 */
export function takeJoinedAnnouncement(): object | null {
  const joined = lastJoined;
  lastJoined = null;
  return joined;
}

/**
 * Withdraws one announcer's share of a message still waiting to be exposed, so
 * a busy start overtaken by its own outcome is never spoken (spec:AST-086 FR8).
 * The message stays while another announcer still holds it.
 *
 * @internal
 */
export function withdrawPendingAnnouncement(
  joined: object,
  politeness: AnnouncePoliteness,
): void {
  const pending = pendingMessages[politeness];
  const index = pending.indexOf(joined as PendingMessage);
  if (index < 0) {
    return;
  }
  pending[index].holders -= 1;
  if (pending[index].holders <= 0) {
    pending.splice(index, 1);
  }
}

/**
 * Test-only helper: removes the singleton live regions and resets state so
 * each test starts clean. Not part of the public runtime API.
 *
 * @internal
 */
export function __resetLiveRegionsForTest(): void {
  cancelPendingFrames('polite');
  cancelPendingFrames('assertive');
  cancelScheduledClear('polite');
  cancelScheduledClear('assertive');
  lastJoined = null;
  if (regions) {
    regions.polite.remove();
    regions.assertive.remove();
    regions = null;
  }
}
