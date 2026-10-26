// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file popoverOperations.test.ts
 * @input Uses vitest, the popoverOperations ledger
 * @output Unit tests for the per-document ledger of popover operations
 * @position Core testing; validates popoverOperations.ts
 */

import {afterEach, describe, it, expect, vi} from 'vitest';
import {
  afterPopoverOperations,
  isPopoverOperationInFlight,
  observeBrowserHide,
  runPopoverOperation,
} from './popoverOperations';

describe('popoverOperations', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('runs a callback at once when the document has no operation in flight', () => {
    const callback = vi.fn();
    afterPopoverOperations(document, callback);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('counts an operation while it runs and replays a show that arrived inside it once the script has unwound', async () => {
    const callback = vi.fn();
    runPopoverOperation(document, () => {
      expect(isPopoverOperationInFlight(document)).toBe(true);
      afterPopoverOperations(document, callback);
      expect(callback).not.toHaveBeenCalled();
    });
    // The operation has ended, but its caller is still on the stack.
    expect(isPopoverOperationInFlight(document)).toBe(false);
    expect(callback).not.toHaveBeenCalled();
    await Promise.resolve();
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('counts the browser’s own hide from its start until the element’s toggle, once per hide', async () => {
    const popover = document.createElement('div');
    document.body.appendChild(popover);
    try {
      const callback = vi.fn();
      observeBrowserHide(popover);
      observeBrowserHide(popover);
      expect(isPopoverOperationInFlight(document)).toBe(true);
      afterPopoverOperations(document, callback);
      await Promise.resolve();
      expect(callback).not.toHaveBeenCalled();

      popover.dispatchEvent(new Event('toggle'));
      expect(isPopoverOperationInFlight(document)).toBe(false);
      await Promise.resolve();
      expect(callback).toHaveBeenCalledTimes(1);
      // The toggle ended it once; the next task finds nothing to end.
      await new Promise(resolve => setTimeout(resolve, 0));
      expect(isPopoverOperationInFlight(document)).toBe(false);
    } finally {
      popover.remove();
    }
  });

  it('ends each hide exactly once: the loser of toggle and backstop is released, so a second in-flight hide keeps its count', () => {
    vi.useFakeTimers({toFake: ['setTimeout', 'clearTimeout']});
    const first = document.createElement('div');
    const second = document.createElement('div');
    document.body.append(first, second);
    try {
      const removeListener = vi.spyOn(second, 'removeEventListener');
      observeBrowserHide(first);
      observeBrowserHide(second);
      expect(isPopoverOperationInFlight(document)).toBe(true);
      expect(vi.getTimerCount()).toBe(2);

      // The first hide's toggle wins: its backstop is cleared, not left to
      // run later against another hide's count.
      first.dispatchEvent(new Event('toggle'));
      expect(isPopoverOperationInFlight(document)).toBe(true);
      expect(vi.getTimerCount()).toBe(1);
      // The second hide's backstop wins: it ends the hide once and drops the
      // one-shot toggle listener.
      vi.runOnlyPendingTimers();
      expect(isPopoverOperationInFlight(document)).toBe(false);
      expect(removeListener).toHaveBeenCalledWith(
        'toggle',
        expect.any(Function),
      );

      // A toggle after the backstop won, and a second toggle after the toggle
      // won, change nothing: the one-shot listeners are gone.
      observeBrowserHide(first);
      expect(isPopoverOperationInFlight(document)).toBe(true);
      second.dispatchEvent(new Event('toggle'));
      expect(isPopoverOperationInFlight(document)).toBe(true);
      first.dispatchEvent(new Event('toggle'));
      first.dispatchEvent(new Event('toggle'));
      expect(isPopoverOperationInFlight(document)).toBe(false);

      // Nothing drifted negative: a later hide is still counted.
      observeBrowserHide(second);
      expect(isPopoverOperationInFlight(document)).toBe(true);
      vi.runOnlyPendingTimers();
      expect(isPopoverOperationInFlight(document)).toBe(false);
    } finally {
      first.remove();
      second.remove();
    }
  });

  it('ends a counted hide at the next task when its toggle never arrives (the element left the document)', async () => {
    const popover = document.createElement('div');
    document.body.appendChild(popover);
    const callback = vi.fn();
    observeBrowserHide(popover);
    popover.remove();
    afterPopoverOperations(document, callback);
    await Promise.resolve();
    expect(callback).not.toHaveBeenCalled();
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(isPopoverOperationInFlight(document)).toBe(false);
    await Promise.resolve();
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('postpones the replay when another operation starts before it runs', async () => {
    const callback = vi.fn();
    runPopoverOperation(document, () => {
      afterPopoverOperations(document, callback);
    });
    // Before the replay's microtask: a new show starts, and ends.
    const second = document.createElement('div');
    document.body.appendChild(second);
    try {
      observeBrowserHide(second);
      await Promise.resolve();
      expect(callback).not.toHaveBeenCalled();
      second.dispatchEvent(new Event('toggle'));
      await Promise.resolve();
      expect(callback).toHaveBeenCalledTimes(1);
    } finally {
      second.remove();
    }
  });

  it('keeps one ledger per document', async () => {
    const frame = document.createElement('iframe');
    document.body.appendChild(frame);
    const other = frame.contentDocument;
    if (other == null) {
      throw new Error('the iframe has no document');
    }
    try {
      const callback = vi.fn();
      const popover = other.createElement('div');
      other.body.appendChild(popover);
      observeBrowserHide(popover);
      expect(isPopoverOperationInFlight(document)).toBe(false);
      afterPopoverOperations(document, callback);
      expect(callback).toHaveBeenCalledTimes(1);
      expect(isPopoverOperationInFlight(other)).toBe(true);
      popover.dispatchEvent(new Event('toggle'));
      expect(isPopoverOperationInFlight(other)).toBe(false);
    } finally {
      frame.remove();
    }
  });
});
