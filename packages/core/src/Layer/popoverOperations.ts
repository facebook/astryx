// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file popoverOperations.ts
 * @input Popover API events (`beforetoggle`, `toggle`) and the layers' own show/hide calls
 * @output The per-document ledger of popover operations in flight, and the deferral of a show that arrives inside one
 * @position Internal to the layer runtime; used by useLayer
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Layer/useLayer.tsx
 * - /packages/core/src/Layer/popoverOperations.test.ts
 */

/**
 * Popover operations in flight, per document.
 *
 * The Popover API refuses to show a popover while the document is in the
 * middle of showing or hiding ANY popover: `showPopover()` throws an
 * `InvalidStateError` ("Invalid to show a popover during another show
 * operation"); an engine still rolling the rule out instead refuses silently
 * with a console warning, which would leave a layer open with nothing shown.
 * Hiding a popover restores focus to the element that had it —
 * synchronously, inside that window — so a focus-driven layer on the element
 * receiving focus (a tooltip on the trigger that just closed a popover) asks
 * to show while the hide is still running.
 *
 * Every layer's show and hide passes through `runPopoverOperation`, so those
 * windows are observable. A hide the browser runs on its own — an Escape its
 * close watcher answers, a light dismiss, an `auto` popover evicted by another
 * one opening — never passes through here, but it is observable too:
 * the element's `beforetoggle` event fires synchronously as the hide starts,
 * and its `toggle` event fires in a task once it has ended. A layer reports
 * those through `observeBrowserHide`.
 *
 * A `show()` that arrives inside either window waits in `afterPopoverOperations`
 * and replays once the document's last operation has ended and the script
 * that started it — and the event dispatch it answered — has unwound.
 */
const operationsByDocument = new WeakMap<Document, number>();
const settledCallbacksByDocument = new WeakMap<Document, (() => void)[]>();

function begin(doc: Document): void {
  operationsByDocument.set(doc, (operationsByDocument.get(doc) ?? 0) + 1);
}

function end(doc: Document): void {
  const remaining = (operationsByDocument.get(doc) ?? 1) - 1;
  operationsByDocument.set(doc, remaining);
  if (remaining <= 0 && settledCallbacksByDocument.has(doc)) {
    // The operation's own script is still on the stack (the `finally` of a
    // `runPopoverOperation`, a `toggle` listener): replay once it has unwound.
    queueMicrotask(() => replaySettled(doc));
  }
}

function replaySettled(doc: Document): void {
  if (isPopoverOperationInFlight(doc)) {
    // Another operation started before the replay ran; its end replays.
    return;
  }
  const callbacks = settledCallbacksByDocument.get(doc);
  if (callbacks == null) {
    return;
  }
  settledCallbacksByDocument.delete(doc);
  for (const callback of callbacks) {
    callback();
  }
}

/** Runs `operation`, counting it as a popover operation in flight in `doc`. */
export function runPopoverOperation(
  doc: Document,
  operation: () => void,
): void {
  begin(doc);
  try {
    operation();
  } finally {
    end(doc);
  }
}

export function isPopoverOperationInFlight(doc: Document): boolean {
  return (operationsByDocument.get(doc) ?? 0) > 0;
}

/** Popovers whose browser-run hide is being counted, so one hide is counted once. */
const browserHidesInFlight = new WeakSet<Element>();

/**
 * Counts a hide the browser runs itself. Called as the element's `beforetoggle`
 * fires, which the hide dispatches synchronously as it starts; the count ends
 * at the element's `toggle`, which the browser queues for the task after the
 * hide, and in any case at the next task: the hide is synchronous, so the task
 * after it is past the window even when the element has left the document and
 * its `toggle` never arrives. Calling it again for the same hide is a no-op.
 */
export function observeBrowserHide(popover: HTMLElement): void {
  if (browserHidesInFlight.has(popover)) {
    return;
  }
  browserHidesInFlight.add(popover);
  const doc = popover.ownerDocument;
  const end = beginBrowserPopoverOperation(doc);
  const view = doc.defaultView ?? globalThis;
  let timer: ReturnType<typeof setTimeout> | null = null;
  const finish = () => {
    popover.removeEventListener('toggle', finish);
    if (timer != null) {
      view.clearTimeout(timer);
      timer = null;
    }
    browserHidesInFlight.delete(popover);
    end();
  };
  popover.addEventListener('toggle', finish);
  timer = view.setTimeout(finish, 0);
}

function beginBrowserPopoverOperation(doc: Document): () => void {
  begin(doc);
  let ended = false;
  return () => {
    if (ended) {
      return;
    }
    ended = true;
    end(doc);
  };
}

/**
 * Runs `callback` once no popover operation is in flight in `doc`: at once
 * when none is, otherwise after the last one has ended and the script that
 * started it has unwound.
 */
export function afterPopoverOperations(
  doc: Document,
  callback: () => void,
): void {
  if (!isPopoverOperationInFlight(doc)) {
    callback();
    return;
  }
  const callbacks = settledCallbacksByDocument.get(doc);
  if (callbacks == null) {
    settledCallbacksByDocument.set(doc, [callback]);
  } else {
    callbacks.push(callback);
  }
}
