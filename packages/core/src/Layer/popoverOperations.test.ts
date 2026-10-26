// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file popoverOperations.test.ts
 * @input Uses vitest, the popoverOperations ledger
 * @output Unit tests for the per-document ledger of popover operations
 * @position Core testing; validates popoverOperations.ts
 */

import {describe, it, expect, vi} from 'vitest';
import {
  afterPopoverOperations,
  beginBrowserPopoverOperation,
  isPopoverOperationInFlight,
  runPopoverOperation,
} from './popoverOperations';

describe('popoverOperations', () => {
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

  it('counts the browser’s own hide from its start until it is ended, once', async () => {
    const callback = vi.fn();
    const end = beginBrowserPopoverOperation(document);
    expect(isPopoverOperationInFlight(document)).toBe(true);
    afterPopoverOperations(document, callback);
    await Promise.resolve();
    expect(callback).not.toHaveBeenCalled();

    end();
    end();
    expect(isPopoverOperationInFlight(document)).toBe(false);
    await Promise.resolve();
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('postpones the replay when another operation starts before it runs', async () => {
    const callback = vi.fn();
    const end = beginBrowserPopoverOperation(document);
    afterPopoverOperations(document, callback);
    end();
    // Before the replay's microtask: a new show starts.
    const endSecond = beginBrowserPopoverOperation(document);
    await Promise.resolve();
    expect(callback).not.toHaveBeenCalled();
    endSecond();
    await Promise.resolve();
    expect(callback).toHaveBeenCalledTimes(1);
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
      const end = beginBrowserPopoverOperation(other);
      expect(isPopoverOperationInFlight(document)).toBe(false);
      afterPopoverOperations(document, callback);
      expect(callback).toHaveBeenCalledTimes(1);
      expect(isPopoverOperationInFlight(other)).toBe(true);
      end();
      expect(isPopoverOperationInFlight(other)).toBe(false);
    } finally {
      frame.remove();
    }
  });
});
