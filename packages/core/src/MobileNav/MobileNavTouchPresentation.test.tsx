// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file MobileNavTouchPresentation.test.tsx
 * @input Uses vitest, @testing-library/react, MobileNav and the Layer
 *   module's presentation hold
 * @output Tests that under a finger the drawer presents and dismisses as a
 *   UIKit sheet does (no touch until the slide-in ends, no input until the
 *   slide-out ends, the dialog closing at its end), and that under a mouse
 *   nothing is held and the close keeps its timing
 * @position Unit tests for MobileNav's touch presentation
 *
 * SYNC: When modified, update the header comment in MobileNav.tsx.
 */

import {useState} from 'react';
import {act, fireEvent, render, screen} from '@testing-library/react';
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import {stubMatchMedia} from '../__tests__/stubMatchMedia';
import {isInHeldLayer} from '../Layer/presentationHold';
import {MAX_EXIT_MS, MobileNav} from './MobileNav';

function Harness() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)}>
        Open
      </button>
      <MobileNav
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        data-testid="mobile-nav">
        <a href="#home">Home</a>
      </MobileNav>
    </>
  );
}

// jsdom resolves no `var()`, so the drawer's slide reads as unreadable and
// runs for MAX_EXIT_MS; the hold ends when its timer settles.
async function advance(ms: number) {
  await act(async () => {
    vi.advanceTimersByTime(ms);
  });
}

beforeAll(() => {
  // jsdom has no showModal/close: model the dialog focusing steps
  // (showModal() moves focus into the dialog; close() restores nothing).
  HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
    this.setAttribute('open', '');
    this.querySelector<HTMLElement>('[tabindex]')?.focus();
  };
  HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) {
    this.removeAttribute('open');
  };
});

class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal('ResizeObserver', MockResizeObserver);
});

afterEach(() => {
  vi.useRealTimers();
  document.documentElement.style.overflow = '';
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('MobileNav under a finger', () => {
  beforeEach(() => {
    stubMatchMedia({reduceMotion: false, pointer: 'coarse'});
  });

  it('takes no touch until the slide-in ends', async () => {
    render(<Harness />);
    const open = screen.getByRole('button', {name: 'Open'});
    open.focus();
    fireEvent.click(open);
    const dialog = screen.getByTestId('mobile-nav');
    expect(dialog).toHaveAttribute('open');
    expect(isInHeldLayer(dialog)).toBe(true);

    await advance(MAX_EXIT_MS + 10);
    expect(isInHeldLayer(dialog)).toBe(false);
  });

  it('stays open, modal and held until the slide-out ends, then closes and gives focus back', async () => {
    render(<Harness />);
    const open = screen.getByRole('button', {name: 'Open'});
    open.focus();
    fireEvent.click(open);
    await advance(MAX_EXIT_MS + 10);
    const dialog = screen.getByTestId('mobile-nav');

    fireEvent.click(screen.getByRole('button', {name: /close navigation/i}));
    // A mouse's close would have run by now (at most 250 ms in).
    await advance(260);
    expect(dialog).toHaveAttribute('open');
    expect(isInHeldLayer(dialog)).toBe(true);
    // The leaving drawer's content takes no input.
    expect(
      screen.getByRole('link', {name: 'Home', hidden: true}).closest('[inert]'),
    ).not.toBeNull();

    await advance(MAX_EXIT_MS - 260 + 10);
    expect(dialog).not.toHaveAttribute('open');
    expect(isInHeldLayer(dialog)).toBe(false);
    expect(
      screen.getByRole('link', {name: 'Home', hidden: true}).closest('[inert]'),
    ).toBeNull();
    expect(document.activeElement).toBe(open);
  });

  it('reopened during the slide-out, puts focus back into the drawer', async () => {
    render(<Harness />);
    const open = screen.getByRole('button', {name: 'Open'});
    open.focus();
    fireEvent.click(open);
    await advance(MAX_EXIT_MS + 10);
    const dialog = screen.getByTestId('mobile-nav');

    fireEvent.click(screen.getByRole('button', {name: /close navigation/i}));
    await advance(100);
    fireEvent.click(open);
    expect(dialog).toHaveAttribute('open');
    expect(dialog.contains(document.activeElement)).toBe(true);
    expect(
      screen.getByRole('link', {name: 'Home', hidden: true}).closest('[inert]'),
    ).toBeNull();

    await advance(MAX_EXIT_MS + 10);
    expect(dialog).toHaveAttribute('open');
    expect(isInHeldLayer(dialog)).toBe(false);
  });
});

describe('MobileNav under a mouse', () => {
  beforeEach(() => {
    stubMatchMedia({reduceMotion: false, pointer: 'fine'});
  });

  it('holds nothing, and closes on its own timing as before', async () => {
    render(<Harness />);
    const open = screen.getByRole('button', {name: 'Open'});
    open.focus();
    fireEvent.click(open);
    const dialog = screen.getByTestId('mobile-nav');
    expect(dialog).toHaveAttribute('open');
    expect(isInHeldLayer(dialog)).toBe(false);

    fireEvent.click(screen.getByRole('button', {name: /close navigation/i}));
    expect(isInHeldLayer(dialog)).toBe(false);
    expect(
      screen.getByRole('link', {name: 'Home', hidden: true}).closest('[inert]'),
    ).toBeNull();
    await advance(260);
    expect(dialog).not.toHaveAttribute('open');
    expect(document.activeElement).toBe(open);
  });
});
