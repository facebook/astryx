// Copyright (c) Meta Platforms, Inc. and affiliates.

import {act, render} from '@testing-library/react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {isInHeldLayer} from '../Layer/inputHold';
import {TOUCH_QUERY} from '../utils/touchQueries';
import {Drawer} from './Drawer';

/** Ends the slide-in every drawer reports (jsdom runs no CSS transition). */
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
  HTMLElement.prototype.showPopover = vi.fn(function (this: HTMLElement) {
    this.setAttribute('open', '');
  });
  HTMLElement.prototype.hidePopover = vi.fn(function (this: HTMLElement) {
    this.removeAttribute('open');
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
        effect: {getComputedTiming: () => ({endTime: 250})},
      },
    ],
  });
});

afterEach(() => {
  delete (Element.prototype as {getAnimations?: unknown}).getAnimations;
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function TestDrawer({
  isOpen,
  hasScrim = true,
}: {
  isOpen: boolean;
  hasScrim?: boolean;
}) {
  return (
    <Drawer
      isOpen={isOpen}
      onOpenChange={() => {}}
      label="Held"
      hasScrim={hasScrim}>
      <button type="button">Act</button>
    </Drawer>
  );
}

const theDrawer = () => {
  const drawer = document.querySelector('dialog');
  if (drawer == null) {
    throw new Error('no drawer');
  }
  return drawer;
};

describe('Drawer slide-in under a finger (spec:AST-094 FR35)', () => {
  it('holds pointer input while it slides in, and gives it back when the slide-in ends', async () => {
    stubPointer(true);
    render(<TestDrawer isOpen />);
    expect(isInHeldLayer(theDrawer())).toBe(true);

    await act(async () => {
      finishEntrance();
      await Promise.resolve();
    });
    expect(isInHeldLayer(theDrawer())).toBe(false);
  });

  it('holds a non-modal drawer too', () => {
    stubPointer(true);
    render(<TestDrawer isOpen hasScrim={false} />);
    expect(isInHeldLayer(theDrawer())).toBe(true);
  });

  it('gives input back when it closes mid-slide', () => {
    stubPointer(true);
    const view = render(<TestDrawer isOpen />);
    expect(isInHeldLayer(theDrawer())).toBe(true);

    view.rerender(<TestDrawer isOpen={false} />);
    expect(isInHeldLayer(theDrawer())).toBe(false);
  });

  it('holds nothing with a mouse', () => {
    stubPointer(false);
    render(<TestDrawer isOpen />);
    expect(isInHeldLayer(theDrawer())).toBe(false);
  });
});
