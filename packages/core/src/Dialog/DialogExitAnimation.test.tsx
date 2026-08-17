// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file DialogExitAnimation.test.tsx
 * @input Uses vitest, @testing-library/react, Dialog
 * @output Unit tests for the hold between `isOpen` going false and close()
 * @position Testing; validates the exit-animation timing in Dialog.tsx
 *
 * jsdom cannot run the animation itself — the frame-by-frame evidence that the
 * dialog fades and retreats lives in the PR. What is testable here is the
 * contract around it: how long the open <dialog> is held, that the hold is
 * skipped whenever there is no animation to wait for, and that focus goes back
 * to the trigger only once the dialog has actually closed.
 *
 * SYNC: When the close timing in Dialog.tsx changes, update these tests.
 */

import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {render, screen, act} from '@testing-library/react';
import {Dialog, parseExitDurationMs} from './Dialog';

const EXIT_MS = 250;

// jsdom resolves no StyleX CSS, so the exit animation's own duration — what
// the component reads to time the close — has to be stood in for.
function mockExitDuration(value: string) {
  const real = window.getComputedStyle.bind(window);
  vi.spyOn(window, 'getComputedStyle').mockImplementation((el, pseudo) => {
    const style = real(el, pseudo);
    return {...style, animationDuration: value};
  });
}

function mockReducedMotion(reduce: boolean) {
  const real = window.matchMedia.bind(window);
  vi.spyOn(window, 'matchMedia').mockImplementation(query =>
    query.includes('prefers-reduced-motion')
      ? {...real(query), matches: reduce}
      : real(query),
  );
}

function DialogUnderTest({isOpen}: {isOpen: boolean}) {
  return (
    <Dialog isOpen={isOpen} onOpenChange={() => {}} aria-label="Test dialog">
      Content
    </Dialog>
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
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('parseExitDurationMs', () => {
  it.each([
    ['250ms', 250],
    ['0.31s', 310],
    [' 250ms ', 250],
    ['0ms', 0],
    ['0.31s, 0.31s', 310],
  ])('reads %s', (input, expected) => {
    expect(parseExitDurationMs(input)).toBe(expected);
  });

  it.each(['', 'var(--duration-medium-min)', '250', 'none'])(
    'returns null for %s',
    input => {
      expect(parseExitDurationMs(input)).toBeNull();
    },
  );
});

describe('Dialog exit animation', () => {
  it('holds the open dialog for the exit duration, then closes', () => {
    mockExitDuration(`${EXIT_MS}ms`);
    const {rerender} = render(<DialogUnderTest isOpen={true} />);
    const dialog = screen.getByRole('dialog');

    act(() => rerender(<DialogUnderTest isOpen={false} />));
    expect(dialog).toHaveAttribute('open');

    act(() => void vi.advanceTimersByTime(EXIT_MS - 1));
    expect(dialog).toHaveAttribute('open');

    act(() => void vi.advanceTimersByTime(1));
    expect(dialog).not.toHaveAttribute('open');
  });

  it('restores focus to the trigger only after the dialog has closed', () => {
    mockExitDuration(`${EXIT_MS}ms`);
    function Harness({isOpen}: {isOpen: boolean}) {
      return (
        <>
          <button type="button" data-testid="trigger">
            Open
          </button>
          <Dialog isOpen={isOpen} onOpenChange={() => {}} aria-label="Test">
            <button type="button" data-autofocus data-testid="inside">
              Inside
            </button>
          </Dialog>
        </>
      );
    }
    const {rerender} = render(<Harness isOpen={false} />);
    const trigger = screen.getByTestId('trigger');
    act(() => trigger.focus());

    act(() => rerender(<Harness isOpen={true} />));
    expect(document.activeElement).toBe(screen.getByTestId('inside'));

    act(() => rerender(<Harness isOpen={false} />));
    expect(document.activeElement).toBe(screen.getByTestId('inside'));

    act(() => void vi.advanceTimersByTime(EXIT_MS));
    expect(document.activeElement).toBe(trigger);
  });

  it('closes in the same tick when the duration cannot be read', () => {
    // No StyleX-authored CSS outside a browser, so this is what jsdom and any
    // unresolved var() get: the pre-animation behaviour, unchanged.
    const {rerender} = render(<DialogUnderTest isOpen={true} />);
    const dialog = screen.getByRole('dialog');

    act(() => rerender(<DialogUnderTest isOpen={false} />));
    expect(dialog).not.toHaveAttribute('open');
  });

  it('closes in the same tick under prefers-reduced-motion', () => {
    mockExitDuration(`${EXIT_MS}ms`);
    mockReducedMotion(true);
    const {rerender} = render(<DialogUnderTest isOpen={true} />);
    const dialog = screen.getByRole('dialog');

    act(() => rerender(<DialogUnderTest isOpen={false} />));
    expect(dialog).not.toHaveAttribute('open');
  });

  it('caps the hold so a long theme duration cannot strand the dialog open', () => {
    mockExitDuration('5s');
    const {rerender} = render(<DialogUnderTest isOpen={true} />);
    const dialog = screen.getByRole('dialog');

    act(() => rerender(<DialogUnderTest isOpen={false} />));
    act(() => void vi.advanceTimersByTime(400));
    expect(dialog).not.toHaveAttribute('open');
  });

  it('cancels the pending close when the dialog is reopened mid-exit', () => {
    mockExitDuration(`${EXIT_MS}ms`);
    const {rerender} = render(<DialogUnderTest isOpen={true} />);
    const dialog = screen.getByRole('dialog');

    act(() => rerender(<DialogUnderTest isOpen={false} />));
    act(() => void vi.advanceTimersByTime(EXIT_MS / 2));
    act(() => rerender(<DialogUnderTest isOpen={true} />));
    act(() => void vi.advanceTimersByTime(EXIT_MS));

    expect(dialog).toHaveAttribute('open');
  });

  it('closes the dialog when it unmounts mid-exit', () => {
    mockExitDuration(`${EXIT_MS}ms`);
    const {rerender, unmount} = render(<DialogUnderTest isOpen={true} />);
    const dialog = screen.getByRole('dialog');

    act(() => rerender(<DialogUnderTest isOpen={false} />));
    act(() => unmount());

    expect(dialog).not.toHaveAttribute('open');
  });
});
