// Copyright (c) Meta Platforms, Inc. and affiliates.

import {act, render} from '@testing-library/react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {isInHeldLayer} from '../Layer/inputHold';
import {TOUCH_QUERY} from '../utils/touchQueries';
import {Dialog} from './Dialog';

/** Ends the entrance every dialog reports (jsdom runs no CSS animation). */
let finishEntrance: () => void = () => {};

/** The primary pointer: a finger (`coarse`) or a mouse. */
function stubPointer(coarse: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({
      matches: coarse && query === TOUCH_QUERY,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    })),
  );
}

beforeEach(() => {
  HTMLDialogElement.prototype.showModal = vi.fn(function (
    this: HTMLDialogElement,
  ) {
    this.setAttribute('open', '');
  });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    this.removeAttribute('open');
  });
  const finished = new Promise<void>(resolve => {
    finishEntrance = resolve;
  });
  Object.defineProperty(Element.prototype, 'getAnimations', {
    configurable: true,
    value: () => [
      {
        playState: 'running',
        finished,
        effect: {getComputedTiming: () => ({endTime: 300})},
      },
    ],
  });
});

afterEach(() => {
  delete (Element.prototype as {getAnimations?: unknown}).getAnimations;
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function TestDialog({isOpen}: {isOpen: boolean}) {
  return (
    <Dialog isOpen={isOpen} onOpenChange={() => {}} aria-label="Held">
      <button type="button">Act</button>
    </Dialog>
  );
}

const theDialog = () => {
  const dialog = document.querySelector('dialog');
  if (dialog == null) {
    throw new Error('no dialog');
  }
  return dialog;
};

describe('Dialog entrance under a finger (spec:AST-094 FR35)', () => {
  it('holds pointer input while it enters, and gives it back when the entrance ends', async () => {
    stubPointer(true);
    render(<TestDialog isOpen />);
    expect(isInHeldLayer(theDialog())).toBe(true);

    await act(async () => {
      finishEntrance();
      await Promise.resolve();
    });
    expect(isInHeldLayer(theDialog())).toBe(false);
  });

  it('gives input back when it closes mid-entrance', () => {
    stubPointer(true);
    const view = render(<TestDialog isOpen />);
    expect(isInHeldLayer(theDialog())).toBe(true);

    view.rerender(<TestDialog isOpen={false} />);
    expect(isInHeldLayer(theDialog())).toBe(false);
  });

  it('holds nothing with a mouse', () => {
    stubPointer(false);
    render(<TestDialog isOpen />);
    expect(isInHeldLayer(theDialog())).toBe(false);
  });
});
