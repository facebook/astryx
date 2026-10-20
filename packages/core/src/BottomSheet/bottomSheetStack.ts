// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file bottomSheetStack.ts
 * @input Uses the DOM (dialog elements, document order) and focusForLastInput
 * @output Exports the private bottom-sheet stack registry: registration of
 *   modal sheet hosts, open-order ranking with tree-order ties, native
 *   top-layer reconciliation, one view per host (top, covered, recede
 *   depth, scrim ownership, blocking), and the replace handoff between a
 *   sheet closing and a sheet opening in the same update
 * @position Internal to BottomSheet; consumed by the standalone host in
 *   BottomSheet.tsx and by BottomSheetSwitcher. Not exported from the package
 *   root, and no public API reaches it.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/BottomSheet/BottomSheet.tsx
 * - /packages/core/src/BottomSheet/BottomSheetSwitcher.tsx
 * - /packages/core/src/BottomSheet/BottomSheetStacking.test.tsx
 * - /packages/core/src/BottomSheet/BottomSheetReplace.test.tsx
 * - /packages/core/src/BottomSheet/BottomSheet.doc.mjs
 * - /apps/storybook/stories/BottomSheetReplace.stories.tsx
 *
 * ## Why a registry and not a component
 *
 * Every modal sheet keeps its own native `<dialog>` and its own open state. A
 * sheet opened while another sheet is open is a stacked sheet: the browser's
 * top layer already paints the later `showModal()` above the earlier one, and
 * the later modal dialog already blocks the earlier one. What the browser does
 * NOT know is that the two dialogs are sheets of one stack, so this registry
 * supplies the rest: which sheet is on top, how far back each covered sheet
 * recedes, whose `::backdrop` is the one visible scrim, and when the native
 * order would come out wrong (several sheets opening in one commit) it puts
 * the top layer right before the frame paints. Nothing here is a public
 * surface; the hosts call it from their commit-phase effects only.
 *
 * ## Order is open order, ties are tree order
 *
 * Each open cycle of a sheet gets a rank: the batch it opened in, then a
 * running sequence. A batch is one React commit: registrations that arrive
 * between two seals belong to the same commit, because the hosts seal in
 * passive effects and React runs every pending passive effect before the next
 * commit's layout effects (and flushes them synchronously after a sync
 * commit). Later batch is higher. Within one batch there is no open order, so
 * document order of the dialog elements decides: a sheet before the sheets
 * rendered in its content, siblings in the order they are written. That is the
 * order the first painted frame of a deep link must show, and effect order
 * (child first) gets it backwards; the rank is read at compare time, after
 * every registration of the commit has arrived, so it does not.
 *
 * ## The top layer is reconciled, not trusted
 *
 * The registry remembers the order it called `showModal()` in. After every
 * change it computes the order the ranks want; where the two diverge it closes
 * the dialogs from the first divergence up and shows them again in rank order.
 * That happens inside the commit, before paint, so a deep link whose inner
 * sheet registered first is repaired without a frame in between. A sheet that
 * closes and reopens gets a new rank and is re-shown on top the same way;
 * only the dialogs that have to move up are re-shown, the rest keep their
 * place, their backdrop and any motion in flight.
 *
 * ## A replace is a move the person makes from one sheet to the next
 *
 * One sheet closing and another opening in the same commit, where the closing
 * sheet was the top open sheet of its stack (no other open sheet above it,
 * the opening sheet aside) and the interaction came from inside it, is a
 * replace: the person is moving from one step to the next, not stacking one
 * on the other. The registry then runs the handoff a BottomSheetSwitcher runs
 * between its steps, on the two standalone dialogs: the entering sheet rises
 * above the retained one; a taller retained sheet moves down to meet it; the
 * retained sheet fades only after both motions complete, then its dialog
 * closes and the entering sheet takes over the scrim in the same frame. The
 * retained sheet is inert at once, keeps no place in the dismissal order, and
 * lends its opener to the sheet replacing it, so closing the flow later
 * returns focus to where the flow began. A covered sheet closing (not the
 * top), a sheet closing in a different update from the open, or a close and
 * an open driven from a control outside the closing sheet (two owners acting
 * in one update) is never a replace, so a push over a stack and a pop out of
 * one keep their motion and their own openers. Non-modal sheets neither stack
 * nor replace: their `show()` dialogs have no top layer to order them.
 *
 * ## One state per realm, per document
 *
 * The state lives on `globalThis` so that two copies of this module on one
 * page share one stack (see StackState). Within it, each document is its own
 * stack: a sheet portaled into another document has that document's top
 * layer, focus and order.
 */

import {focusForLastInput} from '../utils/focusReturn';

export interface BottomSheetStackView {
  /** Another modal sheet is presented alongside this one. */
  readonly isStacked: boolean;
  /** This sheet is the open sheet that is on top. */
  readonly isTop: boolean;
  /** This sheet is open with at least one open sheet above it. */
  readonly isCovered: boolean;
  /** Open sheets above this one; drives how far the sheet recedes. */
  readonly depth: number;
  /** This sheet's `::backdrop` is the one visible scrim of the stack. */
  readonly ownsScrim: boolean;
  /**
   * This sheet took the scrim over from a sheet below it that is still
   * sliding out, so its backdrop must appear at once rather than fade in.
   */
  readonly isScrimHandoff: boolean;
  /**
   * This sheet is covered and contains no presented sheet, so its whole
   * dialog can be marked inert and hidden from assistive technology.
   */
  readonly isBlocked: boolean;
  /**
   * This sheet is closing and an open sheet above it owns the scrim now, so
   * its own backdrop must leave at once rather than fade: the dim is the
   * other sheet's from this frame on, and two backdrops would double it.
   */
  readonly isScrimTakenOver: boolean;
  /**
   * This closed sheet is being replaced by the sheet opened in the same
   * update: it stays in place (`covered`), moves down to the entering sheet's
   * top edge (`aligning`), or fades (`fading`), instead of sliding out.
   */
  readonly replacedMotion: BottomSheetReplacedMotion | null;
  /** How far down a replaced sheet moves to meet the entering sheet, in px. */
  readonly alignmentOffset: number;
  /** This open sheet is replacing the sheet that closed in the same update. */
  readonly isReplacing: boolean;
}

export type BottomSheetReplacedMotion = 'covered' | 'aligning' | 'fading';

/** The motions a host's panel reports to the registry during a replace. */
export type BottomSheetReplaceMotion =
  'entering' | 'aligning' | 'fading' | 'exiting';

export const BOTTOM_SHEET_STACK_DEFAULT_VIEW: BottomSheetStackView = {
  isStacked: false,
  isTop: false,
  isCovered: false,
  depth: 0,
  ownsScrim: false,
  isScrimHandoff: false,
  isBlocked: false,
  isScrimTakenOver: false,
  replacedMotion: null,
  alignmentOffset: 0,
  isReplacing: false,
};

/**
 * Why focus is moving into a sheet: `open` is the sheet's own entrance, which
 * honours a `data-autofocus` descendant; `reveal` is the sheet above it
 * closing, which only parks focus on the panel and shows a ring after
 * keyboard input (`architecture:interaction-modality` INV1).
 */
export type BottomSheetFocusReason = 'open' | 'reveal';

export interface BottomSheetStackRegistration {
  /** Stable identity of the host component instance. */
  key: object;
  /** The host's native dialog. */
  getElement: () => HTMLDialogElement | null;
  /** Present the dialog modally (`showModal()`), capturing the opener first. */
  show: () => void;
  /** Take the dialog out of the top layer (`close()`) for a re-show. */
  hide: () => void;
  /** Move focus into the sheet: shown on top, or revealed by a close above. */
  focus: (reason: BottomSheetFocusReason) => void;
  /** Receive this host's view whenever it changes. */
  onView: (view: BottomSheetStackView) => void;
  /**
   * What a host must supply to take part in a replace. A host without it (a
   * switcher flow, which replaces its own steps) is never paired.
   */
  replaceable?: BottomSheetReplaceable;
}

export interface BottomSheetReplaceable {
  /** The host's visual panel, measured for the replace alignment. */
  getPanel: () => HTMLElement | null;
  /** The element focus returns to when the sheet closes the flow. */
  getOpener: () => HTMLElement | null;
  /** Adopt the replaced sheet's opener, so the flow closes back to it. */
  setOpener: (opener: HTMLElement | null) => void;
  /** The replace is over: this replaced sheet is hidden and its dialog closed. */
  finish: () => void;
}

interface Rank {
  batch: number;
  seq: number;
}

interface ReplaceState {
  /** The sheet that opened in the same update and now stands in for this one. */
  replacer: Entry;
  motion: BottomSheetReplacedMotion;
  alignmentOffset: number;
  isAlignmentComplete: boolean;
  isEnteringComplete: boolean;
}

interface Entry extends BottomSheetStackRegistration {
  rank: Rank;
  isOpen: boolean;
  /** The document whose top layer this sheet's dialog is in. */
  doc: Document;
  view: BottomSheetStackView;
  /** Set on a closed sheet while another sheet replaces it. */
  replace: ReplaceState | null;
  /** Set on an open sheet while it replaces the sheet that closed with it. */
  replacing: Entry | null;
  /**
   * Reopened while it was being replaced: its panel is already in place, so
   * when it replaces in turn its entrance is complete the moment it starts.
   */
  isEnteringInPlace: boolean;
}

const ALIGNMENT_THRESHOLD_PX = 1;

/**
 * The registry's state. One per JavaScript realm, shared by every copy of this
 * module in it: two copies of the package on one page (two bundles, a dev
 * server serving the same file under two URLs, a micro-frontend) must see
 * one stack, or each would show its own sheets over the other's with two
 * scrims and no order. The state lives on `globalThis` under a shared symbol
 * and carries the shape it was written for; a copy that finds a state of
 * another shape keeps its own, private state rather than corrupt it.
 */
interface StackState {
  shape: number;
  entries: Entry[];
  // The order showModal() was called in for the presented entries, per
  // document: each document has its own top layer.
  shownOrder: Map<Document, Entry[]>;
  // The open/close flips of the current batch (one commit); a replace pairs
  // one of each. Cleared with the seal.
  batchOpened: Entry[];
  batchClosed: Entry[];
  // Where focus was when the batch's first flip arrived: the control the
  // person acted from, read before any dialog of this commit is shown and
  // moves focus. A replace is recognised by it.
  batchActor: Element | null;
  // Rank persists across a StrictMode replay (unregister and register in one
  // synchronous pass) so the replay cannot promote a sheet. A rank marked
  // closed is spent: the next open takes a new one.
  rankByKey: WeakMap<
    object,
    Rank & {isClosed: boolean; detachedBatch: number | null}
  >;
  currentBatch: number;
  nextSeq: number;
  isBatchDirty: boolean;
  isSealScheduled: boolean;
}

const STACK_STATE_KEY = Symbol.for('astryx.bottomSheetStack');
// Bump when Entry, the registration, or the batch/seal protocol changes shape
// or meaning, so an older copy on the same page cannot share this state.
const STACK_STATE_SHAPE = 2;

function createStackState(): StackState {
  return {
    shape: STACK_STATE_SHAPE,
    entries: [],
    shownOrder: new Map(),
    batchOpened: [],
    batchClosed: [],
    batchActor: null,
    rankByKey: new WeakMap(),
    currentBatch: 0,
    nextSeq: 0,
    isBatchDirty: false,
    isSealScheduled: false,
  };
}

function acquireStackState(): StackState {
  const holder = globalThis as {[STACK_STATE_KEY]?: StackState};
  const shared = holder[STACK_STATE_KEY];
  if (shared != null) {
    return shared.shape === STACK_STATE_SHAPE ? shared : createStackState();
  }
  const created = createStackState();
  holder[STACK_STATE_KEY] = created;
  return created;
}

const state = acquireStackState();

function takeRank(): Rank {
  state.isBatchDirty = true;
  scheduleSeal();
  return {batch: state.currentBatch, seq: state.nextSeq++};
}

function scheduleSeal(): void {
  // Backstop for a commit whose hosts run no passive effect afterwards (a
  // subtree React just hid). A later task is always a later batch.
  if (state.isSealScheduled || typeof queueMicrotask !== 'function') {
    return;
  }
  state.isSealScheduled = true;
  queueMicrotask(() => {
    state.isSealScheduled = false;
    sealBottomSheetBatch();
  });
}

/**
 * End the current batch. Hosts call it from a passive effect, which React runs
 * after every layout effect of the same commit and before the next commit;
 * registrations on either side of it are therefore different open orders.
 */
export function sealBottomSheetBatch(): void {
  if (state.isBatchDirty) {
    state.currentBatch += 1;
    state.isBatchDirty = false;
  }
  state.batchOpened = [];
  state.batchClosed = [];
  state.batchActor = null;
}

/** Record a flip of the current batch, and who acted if it is the first. */
function recordFlip(entry: Entry, flip: 'opened' | 'closed'): void {
  if (state.batchOpened.length === 0 && state.batchClosed.length === 0) {
    state.batchActor = entry.doc.activeElement;
  }
  (flip === 'opened' ? state.batchOpened : state.batchClosed).push(entry);
}

function compareRank(a: Entry, b: Entry): number {
  if (a.rank.batch !== b.rank.batch) {
    return a.rank.batch - b.rank.batch;
  }
  // One commit: tree order. A dialog that precedes another in document order
  // (including one that contains the other) is below it.
  const aEl = a.getElement();
  const bEl = b.getElement();
  if (aEl != null && bEl != null && aEl !== bEl) {
    const position = aEl.compareDocumentPosition(bEl);
    if (position & Node.DOCUMENT_POSITION_FOLLOWING) {
      return -1;
    }
    if (position & Node.DOCUMENT_POSITION_PRECEDING) {
      return 1;
    }
  }
  return a.rank.seq - b.rank.seq;
}

/** The sheets of one document, bottom to top. */
function sortedEntries(doc: Document): Entry[] {
  return state.entries.filter(entry => entry.doc === doc).sort(compareRank);
}

function isSameView(a: BottomSheetStackView, b: BottomSheetStackView): boolean {
  return (
    a.isStacked === b.isStacked &&
    a.isTop === b.isTop &&
    a.isCovered === b.isCovered &&
    a.depth === b.depth &&
    a.ownsScrim === b.ownsScrim &&
    a.isScrimHandoff === b.isScrimHandoff &&
    a.isBlocked === b.isBlocked &&
    a.isScrimTakenOver === b.isScrimTakenOver &&
    a.replacedMotion === b.replacedMotion &&
    a.alignmentOffset === b.alignmentOffset &&
    a.isReplacing === b.isReplacing
  );
}

function computeViews(order: Entry[]): void {
  const openEntries = order.filter(entry => entry.isOpen);
  const top = openEntries[openEntries.length - 1] ?? null;
  // A replaced sheet keeps the scrim while it is retained; the sheet replacing
  // it takes the scrim over, instantly, when the replaced sheet leaves.
  const owner =
    order.find(entry => entry.isOpen || entry.replace != null) ?? null;
  const changed: Entry[] = [];
  order.forEach((entry, index) => {
    let depth = 0;
    for (let above = index + 1; above < order.length; above += 1) {
      // The sheet replacing this one stands in its place, not above it.
      if (order[above].isOpen && order[above] !== entry.replace?.replacer) {
        depth += 1;
      }
    }
    const isCovered = entry.isOpen && depth > 0;
    const element = entry.getElement();
    const containsPresented =
      element != null &&
      order.some(other => {
        const otherElement = other.getElement();
        return (
          other !== entry &&
          otherElement != null &&
          element.contains(otherElement)
        );
      });
    const ownsScrim = entry === owner;
    const isScrimHandoff =
      ownsScrim &&
      entry.isOpen &&
      order.slice(0, index).some(below => !below.isOpen);
    const view: BottomSheetStackView = {
      isStacked: order.length > 1,
      isTop: entry === top,
      isCovered,
      depth,
      ownsScrim,
      isScrimHandoff,
      isBlocked: isCovered && !containsPresented,
      isScrimTakenOver: !entry.isOpen && owner != null && owner !== entry,
      replacedMotion: entry.replace?.motion ?? null,
      alignmentOffset: entry.replace?.alignmentOffset ?? 0,
      isReplacing: entry.replacing != null,
    };
    if (!isSameView(entry.view, view)) {
      entry.view = view;
      changed.push(entry);
    }
  });
  for (const entry of changed) {
    entry.onView(entry.view);
  }
}

/** The pending restore of a dialog's scrim transition; one per host. */
export interface BottomSheetScrimWrite {
  frame: number | null;
}

/**
 * Write a dialog's scrim opacity. A change while the dialog is up is a change
 * of scrim owner, and lands with no transition at all: a `0.01s` duration
 * still paints one frame at the old value, which reads as a dip or, with the
 * old owner's backdrop still fading, as a doubled dim. The pin
 * (`--_sheet-scrim-duration: 0s`, inline) stays until a frame has taken the
 * new value, then the stylesheet's duration returns. Hosts cancel the pending
 * restore with `cancelScrimWrite` when they unmount.
 */
export function writeScrimOpacity(
  dialog: HTMLDialogElement | null,
  opacity: '0' | '1',
  pending: BottomSheetScrimWrite,
): void {
  if (dialog == null) {
    return;
  }
  if (
    !dialog.open ||
    dialog.style.getPropertyValue('--_sheet-scrim-opacity') === opacity
  ) {
    dialog.style.setProperty('--_sheet-scrim-opacity', opacity);
    return;
  }
  dialog.style.setProperty('--_sheet-scrim-duration', '0s');
  dialog.style.setProperty('--_sheet-scrim-opacity', opacity);
  cancelScrimWrite(pending);
  pending.frame = requestAnimationFrame(() => {
    pending.frame = requestAnimationFrame(() => {
      pending.frame = null;
      dialog.style.removeProperty('--_sheet-scrim-duration');
    });
  });
}

export function cancelScrimWrite(pending: BottomSheetScrimWrite): void {
  if (pending.frame != null) {
    cancelAnimationFrame(pending.frame);
    pending.frame = null;
  }
}

/**
 * Close a dialog without letting the browser move focus. `close()` returns
 * focus to the element that was focused when `showModal()` ran; with another
 * sheet still open on top, that would pull focus out of the sheet the person
 * is using (a re-show that repairs the top-layer order, a covered sheet
 * closing from code, a replaced sheet leaving). Focus stays where it is; the
 * caller decides where it goes next, if anywhere.
 */
export function closeDialogKeepingFocus(
  dialog: HTMLDialogElement | null,
): void {
  if (dialog == null || !dialog.open) {
    return;
  }
  const doc = dialog.ownerDocument;
  const activeElement = doc.activeElement;
  dialog.close();
  if (
    doc.activeElement !== activeElement &&
    activeElement instanceof HTMLElement &&
    activeElement.isConnected
  ) {
    activeElement.focus({preventScroll: true});
  }
}

/**
 * Pair the one close and the one open of this batch as a replace. A replace
 * is a move the person makes from one sheet to the next, and that is what
 * the conditions check:
 *
 * - exactly one sheet closed and exactly one opened in this update;
 * - both are standalone sheets of one document (a switcher flow replaces its
 *   own steps and is never paired);
 * - the closing sheet was the top sheet of its stack once the opening sheet
 *   is set aside — a covered sheet closing while a sheet opens is a pop
 *   beneath a push;
 * - neither dialog contains the other — a sheet in another's content closes
 *   with it, it does not replace it;
 * - the interaction came from inside the closing sheet: the element that was
 *   focused when this update's first flip arrived (before any dialog of the
 *   update was shown) is in its dialog, or nowhere (a control that left with
 *   the step). A close and an open driven from a control outside the closing
 *   sheet are two unrelated owners acting in one update, so the sheets keep
 *   their own openers and their own push and pop motion.
 *
 * The opening sheet then adopts the closing sheet's opener: its own opener
 * is inside the sheet that is leaving, and the flow began where the closing
 * sheet's did.
 */
function detectReplace(): void {
  if (state.batchOpened.length !== 1 || state.batchClosed.length !== 1) {
    return;
  }
  const [replacer] = state.batchOpened;
  const [replaced] = state.batchClosed;
  if (
    replaced === replacer ||
    replaced.replaceable == null ||
    replacer.replaceable == null ||
    replaced.doc !== replacer.doc ||
    replaced.replace?.replacer === replacer ||
    !replacer.isOpen ||
    replaced.isOpen
  ) {
    return;
  }
  const replacedElement = replaced.getElement();
  const replacerElement = replacer.getElement();
  if (
    replacedElement == null ||
    replacerElement == null ||
    replacedElement.contains(replacerElement) ||
    replacerElement.contains(replacedElement)
  ) {
    return;
  }
  const wasTop = !sortedEntries(replaced.doc).some(
    other =>
      other !== replacer &&
      other !== replaced &&
      other.isOpen &&
      compareRank(other, replaced) > 0,
  );
  if (!wasTop) {
    return;
  }
  const actor = state.batchActor;
  const actedFromReplaced =
    actor == null ||
    actor === replaced.doc.body ||
    replacedElement.contains(actor);
  if (!actedFromReplaced) {
    return;
  }
  // A sheet the closing sheet was itself replacing is dropped at once, the
  // way a switcher drops a step that is left mid-handoff.
  if (replaced.replacing != null) {
    finishReplace(replaced.replacing);
  }
  if (replaced.replace != null) {
    replaced.replace.replacer.replacing = null;
  }
  if (replacer.replace != null) {
    replacer.replace = null;
  }
  replaced.replace = {
    replacer,
    motion: 'covered',
    alignmentOffset: 0,
    isAlignmentComplete: false,
    isEnteringComplete: false,
  };
  replacer.replacing = replaced;
  replacer.replaceable.setOpener(replaced.replaceable.getOpener());
}

/**
 * End a replace: the replaced sheet is hidden and its dialog closed; the
 * views computed next hand the scrim to the sheet that replaced it, which
 * takes it in the same frame. Focus stays where it is.
 */
function finishReplace(replaced: Entry): void {
  const replace = replaced.replace;
  if (replace == null) {
    return;
  }
  const {replacer} = replace;
  replaced.replace = null;
  if (replacer.replacing === replaced) {
    replacer.replacing = null;
  }
  replaced.hide();
  replaced.replaceable?.finish();
}

function alignmentOffsetForPanels(
  enteringPanel: HTMLElement | null,
  retainedPanel: HTMLElement | null,
): number {
  if (enteringPanel == null || retainedPanel == null) {
    return 0;
  }
  // The positioner is where the entering sheet will rest; the panel itself
  // is still rising from below the viewport.
  const enteringTop =
    enteringPanel.parentElement?.getBoundingClientRect().top ??
    enteringPanel.getBoundingClientRect().top;
  return Math.max(0, enteringTop - retainedPanel.getBoundingClientRect().top);
}

/**
 * A host's panel reports the start and end of its motions here. During a
 * replace they drive the handoff: when the entering sheet starts to rise, a
 * taller retained sheet starts moving down to its top edge; the retained
 * sheet fades once both have finished; when the fade ends the replace is over.
 */
export function reportBottomSheetMotion(
  key: object,
  event: 'start' | 'complete',
  motion: BottomSheetReplaceMotion,
): void {
  const entry = state.entries.find(candidate => candidate.key === key);
  if (entry == null) {
    return;
  }
  if (motion === 'entering') {
    const replaced = entry.replacing;
    const replace = replaced?.replace ?? null;
    if (replaced == null || replace == null || replace.replacer !== entry) {
      return;
    }
    if (event === 'start') {
      if (replace.motion !== 'covered') {
        return;
      }
      const alignmentOffset = alignmentOffsetForPanels(
        entry.replaceable?.getPanel() ?? null,
        replaced.replaceable?.getPanel() ?? null,
      );
      if (alignmentOffset > ALIGNMENT_THRESHOLD_PX) {
        replace.motion = 'aligning';
        replace.alignmentOffset = alignmentOffset;
        replace.isAlignmentComplete = false;
      }
      // A sheet that came back while fading is already where it belongs:
      // its entrance is over as soon as it starts, like a switcher step's.
      if (entry.isEnteringInPlace) {
        entry.isEnteringInPlace = false;
        replace.isEnteringComplete = true;
        if (replace.motion !== 'aligning') {
          replace.motion = 'fading';
        }
      } else if (replace.motion === 'covered') {
        return;
      }
    } else {
      replace.isEnteringComplete = true;
      if (replace.motion === 'aligning' && !replace.isAlignmentComplete) {
        return;
      }
      replace.motion = 'fading';
    }
    update(entry.doc);
    return;
  }
  const replace = entry.replace;
  if (replace == null || event !== 'complete') {
    return;
  }
  if (motion === 'aligning' && replace.motion === 'aligning') {
    if (replace.isEnteringComplete) {
      replace.motion = 'fading';
    } else {
      replace.isAlignmentComplete = true;
    }
    update(entry.doc);
  } else if (motion === 'fading' && replace.motion === 'fading') {
    finishReplace(entry);
    update(entry.doc);
  }
}

/**
 * Make a document's top layer match the ranked order. The top layer is
 * append-only, so a dialog can only move up, by closing and showing it again:
 * the longest prefix of the wanted order that the shown order already
 * contains, in order, is kept, and every dialog after it is re-shown in
 * order (closing them from the top first). A deep link whose inner sheet
 * registered first therefore re-shows inner and outer; a sheet that must
 * rise above the sheets shown after it re-shows only itself, so a retained
 * sheet beneath it keeps its backdrop and any motion in flight. Runs inside
 * the commit, so a wrong intermediate order never paints. Focus moves into
 * the top open sheet when anything was shown.
 */
function reconcileTopLayer(doc: Document, order: Entry[]): void {
  const shownOrder = state.shownOrder.get(doc) ?? [];
  const presentable = order.filter(entry => {
    const element = entry.getElement();
    return element != null && element.isConnected;
  });
  let kept = 0;
  let cursor = 0;
  while (kept < presentable.length) {
    const next = shownOrder.indexOf(presentable[kept], cursor);
    if (next === -1) {
      break;
    }
    cursor = next + 1;
    kept += 1;
  }
  const keptEntries = new Set(presentable.slice(0, kept));
  let didShow = false;
  for (let index = shownOrder.length - 1; index >= 0; index -= 1) {
    if (!keptEntries.has(shownOrder[index])) {
      shownOrder[index].hide();
    }
  }
  for (let index = kept; index < presentable.length; index += 1) {
    presentable[index].show();
    didShow = true;
  }
  if (presentable.length === 0) {
    state.shownOrder.delete(doc);
  } else {
    state.shownOrder.set(doc, presentable);
  }
  if (didShow) {
    const openEntries = presentable.filter(entry => entry.isOpen);
    openEntries[openEntries.length - 1]?.focus('open');
  }
}

function update(doc: Document): void {
  detectReplace();
  const order = sortedEntries(doc);
  computeViews(order);
  reconcileTopLayer(doc, order);
}

/**
 * Join the stack for as long as the sheet is presented. Call from a layout
 * effect; the returned function leaves the stack (also from its cleanup).
 * `isOpen` is the controlled open state; a presented sheet whose `isOpen` is
 * false is sliding out and keeps its place without counting as a layer.
 */
export function registerBottomSheet(
  registration: BottomSheetStackRegistration,
  isOpen: boolean,
): () => void {
  const {key} = registration;
  const remembered = state.rankByKey.get(key);
  let rank: Rank;
  if (
    remembered != null &&
    !remembered.isClosed &&
    // A StrictMode replay unregisters and registers again in one synchronous
    // pass, before any seal; the rank is kept so the replay cannot reorder.
    // A sheet React hid (Suspense, Activity) and later revealed comes back in
    // a later batch and re-presents on top, like a fresh open.
    (remembered.detachedBatch == null ||
      remembered.detachedBatch === state.currentBatch)
  ) {
    rank = {batch: remembered.batch, seq: remembered.seq};
    remembered.detachedBatch = null;
  } else {
    rank = takeRank();
    state.rankByKey.set(key, {
      ...rank,
      isClosed: !isOpen,
      detachedBatch: null,
    });
  }
  const entry: Entry = {
    ...registration,
    rank,
    isOpen,
    doc: registration.getElement()?.ownerDocument ?? document,
    view: BOTTOM_SHEET_STACK_DEFAULT_VIEW,
    replace: null,
    replacing: null,
    isEnteringInPlace: false,
  };
  state.entries.push(entry);
  if (isOpen && rank.batch === state.currentBatch && state.isBatchDirty) {
    recordFlip(entry, 'opened');
  }
  update(entry.doc);

  return () => {
    const index = state.entries.indexOf(entry);
    if (index === -1) {
      return;
    }
    state.entries.splice(index, 1);
    const shownOrder = state.shownOrder.get(entry.doc);
    if (shownOrder != null) {
      state.shownOrder.set(
        entry.doc,
        shownOrder.filter(shown => shown !== entry),
      );
    }
    state.batchOpened = state.batchOpened.filter(other => other !== entry);
    state.batchClosed = state.batchClosed.filter(other => other !== entry);
    if (entry.replace != null) {
      entry.replace.replacer.replacing = null;
      entry.replace = null;
    }
    if (entry.replacing != null) {
      // The sheet it was replacing is left as an ordinary closing sheet.
      entry.replacing.replace = null;
      entry.replacing = null;
    }
    // A sheet that leaves while its dialog is still open was hidden by React
    // (Suspense, Activity) or is unmounting: a modal dialog with no box would
    // keep blocking the page, so it leaves the top layer here.
    entry.hide();
    const current = state.rankByKey.get(key);
    if (current != null) {
      current.detachedBatch = state.currentBatch;
      state.isBatchDirty = true;
      scheduleSeal();
    }
    entry.view = BOTTOM_SHEET_STACK_DEFAULT_VIEW;
    entry.onView(entry.view);
    update(entry.doc);
  };
}

/**
 * Report the controlled open state of a registered sheet. Closing keeps the
 * sheet's place while it slides out; reopening takes a new rank, so the sheet
 * returns on top.
 */
export function setBottomSheetOpen(key: object, isOpen: boolean): void {
  const entry = state.entries.find(candidate => candidate.key === key);
  if (entry == null || entry.isOpen === isOpen) {
    return;
  }
  entry.isOpen = isOpen;
  const remembered = state.rankByKey.get(key);
  if (isOpen) {
    entry.rank = takeRank();
    state.rankByKey.set(key, {
      ...entry.rank,
      isClosed: false,
      detachedBatch: null,
    });
    recordFlip(entry, 'opened');
    // Reopened while being replaced: it is a sheet again, not a fading one.
    if (entry.replace != null) {
      entry.replace.replacer.replacing = null;
      entry.replace = null;
      entry.isEnteringInPlace = true;
    }
  } else {
    if (remembered != null) {
      remembered.isClosed = true;
    }
    state.isBatchDirty = true;
    scheduleSeal();
    recordFlip(entry, 'closed');
    entry.isEnteringInPlace = false;
    // A replacing sheet that closes drops the sheet it was replacing at once,
    // the way a switcher hides a retained step when the flow is left.
    if (entry.replacing != null) {
      finishReplace(entry.replacing);
    }
  }
  update(entry.doc);
}

/**
 * The open sheet directly beneath `key`: its dialog, and a way to move focus
 * into it. Null when nothing open is beneath. A closing top sheet asks this
 * to return focus into the sheet it reveals.
 */
export function getBottomSheetBeneath(
  key: object,
): {element: HTMLDialogElement; focus: () => void} | null {
  const own = state.entries.find(entry => entry.key === key);
  if (own == null) {
    return null;
  }
  const order = sortedEntries(own.doc);
  for (let below = order.indexOf(own) - 1; below >= 0; below -= 1) {
    const entry = order[below];
    const element = entry.getElement();
    if (entry.isOpen && element != null) {
      return {element, focus: () => entry.focus('reveal')};
    }
  }
  return null;
}

// preventScroll on both: presenting a sheet must not scroll the page to reveal
// what it just focused. For an autofocused field that reveal is the mobile
// keyboard's, and it moves the document under a fixed sheet; useMobileKeyboard
// brings the field into view within the sheet instead.
/**
 * Move focus into a sheet panel. On `open`, a `data-autofocus` descendant wins
 * and a non-modal sheet otherwise leaves focus alone; on `reveal` the panel
 * itself takes focus, with a ring only after keyboard input.
 */
export function focusSheetPanel(
  panel: HTMLElement | null,
  reason: BottomSheetFocusReason,
  isModal: boolean,
): void {
  if (panel == null) {
    return;
  }
  // Focus already inside this sheet's own content stays put. Focus inside a
  // sheet rendered within this content (a closing nested sheet) does not
  // count: that sheet's dialog is leaving, and this one is being revealed.
  const activeElement = panel.ownerDocument.activeElement;
  if (
    activeElement != null &&
    panel.contains(activeElement) &&
    activeElement.closest('dialog') === panel.closest('dialog')
  ) {
    return;
  }
  if (reason === 'reveal') {
    focusForLastInput(panel);
    return;
  }
  const autofocus = panel.querySelector<HTMLElement>('[data-autofocus]');
  if (autofocus != null) {
    autofocus.focus({preventScroll: true});
  } else if (isModal) {
    panel.focus({preventScroll: true});
  }
}

/** Test-only: the presented sheets' dialogs, bottom to top, with their views. */
export function getBottomSheetStackForTests(
  doc: Document = document,
): ReadonlyArray<{
  element: HTMLDialogElement | null;
  isOpen: boolean;
  view: BottomSheetStackView;
}> {
  return sortedEntries(doc).map(entry => ({
    element: entry.getElement(),
    isOpen: entry.isOpen,
    view: entry.view,
  }));
}

/** Test-only: forget every sheet and start the batch counter over. */
export function resetBottomSheetStackForTests(): void {
  state.entries.length = 0;
  state.shownOrder.clear();
  state.batchOpened = [];
  state.batchClosed = [];
  state.batchActor = null;
  state.currentBatch = 0;
  state.nextSeq = 0;
  state.isBatchDirty = false;
  state.isSealScheduled = false;
}

/** Test-only: the shared state's key and shape, for the two-copies test. */
export const BOTTOM_SHEET_STACK_STATE_FOR_TESTS = {
  key: STACK_STATE_KEY,
  shape: STACK_STATE_SHAPE,
};
