// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file selectionHold.test.ts
 * @input selectionHold.ts on jsdom rows marked as core's list cells, under a
 *   stubbed coarse or fine primary pointer (jsdom runs no Web Animations: the
 *   animator writes end values)
 * @output Unit proofs for NavigationStack's copy of List's selection hold:
 *   no hold outside a list row or under a mouse; the held state while the
 *   pushed screen covers the row; a pop's progress marks the row
 *   deselecting; a finished pop releases it; a cancelled one selects it
 *   again; a second hold takes the row over; an ended hold does nothing
 * @position Unit test beside selectionHold.ts; the stack's own proofs are
 *   NavigationStack.test.tsx and the interaction spec's "the row that
 *   pushed"
 */

import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {holdSelection} from './selectionHold';

function stubPointer(coarse: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({
      matches: coarse && query.includes('pointer: coarse'),
      media: query,
      onchange: null,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => false,
    })),
  );
}

function makeRow(): {row: HTMLElement; button: HTMLButtonElement} {
  const row = document.createElement('div');
  row.setAttribute('data-astryx-pressable', 'cell');
  const button = document.createElement('button');
  button.textContent = 'General';
  row.append(button);
  document.body.append(row);
  return {row, button};
}

describe('NavigationStack selectionHold', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    document.body.replaceChildren();
  });

  it('holds nothing outside a list row, or under a mouse', () => {
    stubPointer(true);
    const loose = document.createElement('button');
    document.body.append(loose);
    expect(holdSelection(loose)).toBeNull();
    expect(holdSelection(null)).toBeNull();

    stubPointer(false);
    const {row, button} = makeRow();
    expect(holdSelection(button)).toBeNull();
    expect(row).not.toHaveAttribute('data-astryx-press');
  });

  describe('under a finger', () => {
    beforeEach(() => stubPointer(true));

    it('keeps the row held until a finished pop releases it', () => {
      const {row, button} = makeRow();
      const hold = holdSelection(button);
      expect(hold?.element).toBe(row);
      expect(row).toHaveAttribute('data-astryx-press', 'held');

      hold?.setProgress(0.4);
      expect(row).toHaveAttribute('data-astryx-deselecting');

      hold?.end(true);
      expect(row).not.toHaveAttribute('data-astryx-press');
      expect(row).not.toHaveAttribute('data-astryx-deselecting');
    });

    it('selects the row again at once when the pop is cancelled', () => {
      const {row, button} = makeRow();
      const hold = holdSelection(button);
      hold?.setProgress(0.6);
      hold?.end(false);
      expect(row).toHaveAttribute('data-astryx-press', 'held');
      expect(row).not.toHaveAttribute('data-astryx-deselecting');
      // The hold stays for the next pop.
      hold?.setProgress(0.2);
      expect(row).toHaveAttribute('data-astryx-deselecting');
    });

    it('lets a second hold take the row over', () => {
      const {row, button} = makeRow();
      const first = holdSelection(button);
      const second = holdSelection(button);
      first?.setProgress(0.5);
      expect(row).not.toHaveAttribute('data-astryx-deselecting');
      second?.end(true);
      expect(row).not.toHaveAttribute('data-astryx-press');
    });

    it('does nothing once ended', async () => {
      const {row, button} = makeRow();
      const hold = holdSelection(button);
      hold?.end(true);
      await expect(hold?.animate(1)).resolves.toBe(false);
      hold?.setProgress(0.5);
      expect(row).not.toHaveAttribute('data-astryx-deselecting');
    });

    it('focuses the row’s own control', () => {
      const {button} = makeRow();
      holdSelection(button)?.focus();
      expect(button).toHaveFocus();
    });
  });
});
