// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ToastViewport.modalHost.test.tsx
 * @input Uses vitest, @testing-library/react, ToastViewport, useToast, Dialog
 * @output Tests that a top-layer ToastViewport moves into the latest open
 *   native modal and back without remounting its toasts
 * @position Testing; validates ToastViewport.tsx with Layer/modalOutlet.ts
 *
 * SYNC: When ToastViewport hosting or Layer/modalOutlet.ts changes, update
 *   these tests. jsdom has no top layer: paint order and hit testing above the
 *   modal need a real browser (see the Core/Toast AppToastOverDialog story).
 */

import {useState, type ReactNode} from 'react';
import {describe, it, expect, vi, afterEach, beforeEach} from 'vitest';
import {act, fireEvent, render, screen} from '@testing-library/react';
import {ToastViewport} from './ToastViewport';
import {useToast} from './useToast';
import {Dialog} from '../Dialog';
import type {ToastDismissReason} from './types';

// jsdom does not implement the native modal methods.
beforeEach(() => {
  HTMLDialogElement.prototype.showModal = vi.fn(function (
    this: HTMLDialogElement,
  ) {
    this.setAttribute('open', '');
  });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    this.removeAttribute('open');
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

function ToastButton({label = 'Show toast'}: {label?: string}) {
  const toast = useToast();
  return (
    <button type="button" onClick={() => toast({body: 'Saved'})}>
      {label}
    </button>
  );
}

function DialogFixture({
  label,
  children,
}: {
  label: string;
  children?: ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setIsOpen(open => !open)}>
        {`Toggle ${label}`}
      </button>
      <Dialog isOpen={isOpen} onOpenChange={setIsOpen} aria-label={label}>
        <button type="button" onClick={() => setIsOpen(false)}>
          {`Close ${label}`}
        </button>
        {children}
      </Dialog>
    </>
  );
}

function getDialog(label: string): HTMLDialogElement {
  return document.querySelector<HTMLDialogElement>(
    `dialog[aria-label="${label}"]`,
  )!;
}

function getViewport(): HTMLElement {
  return document.querySelector<HTMLElement>('[popover="manual"]')!;
}

function TimedToastButton({
  onHide,
}: {
  onHide: (reason: ToastDismissReason) => void;
}) {
  const toast = useToast();
  return (
    <button
      type="button"
      onClick={() => toast({body: 'Saved', autoHideDuration: 5000, onHide})}>
      Show timed toast
    </button>
  );
}

function UnmountFixture() {
  const [isMounted, setIsMounted] = useState(true);
  return (
    <>
      <button type="button" onClick={() => setIsMounted(false)}>
        Unmount
      </button>
      {isMounted ? (
        <Dialog isOpen onOpenChange={() => {}} aria-label="Edit">
          <ToastButton />
        </Dialog>
      ) : null}
    </>
  );
}

describe('ToastViewport modal hosting', () => {
  it('moves into an open Dialog and back when it closes, keeping the toast', () => {
    const {container} = render(
      <ToastViewport>
        <ToastButton />
        <DialogFixture label="Edit" />
      </ToastViewport>,
    );

    fireEvent.click(screen.getByRole('button', {name: 'Show toast'}));
    const toast = screen.getByText('Saved');
    expect(container.contains(getViewport())).toBe(true);

    fireEvent.click(screen.getByRole('button', {name: 'Toggle Edit'}));
    expect(getDialog('Edit').contains(getViewport())).toBe(true);
    // Same node: the rows were moved, not remounted, so their auto-hide
    // timers and gesture state carry on.
    expect(screen.getByText('Saved')).toBe(toast);

    fireEvent.click(screen.getByRole('button', {name: 'Close Edit'}));
    expect(getDialog('Edit').contains(getViewport())).toBe(false);
    expect(container.contains(getViewport())).toBe(true);
    expect(screen.getByText('Saved')).toBe(toast);
  });

  it('shows the viewport popover again after each move', () => {
    const showPopover = vi.spyOn(HTMLElement.prototype, 'showPopover');
    render(
      <ToastViewport>
        <DialogFixture label="Edit" />
      </ToastViewport>,
    );
    const viewport = getViewport();
    const showsOnViewport = () =>
      showPopover.mock.contexts.filter(context => context === viewport).length;
    expect(showsOnViewport()).toBe(1);

    fireEvent.click(screen.getByRole('button', {name: 'Toggle Edit'}));
    expect(showsOnViewport()).toBe(2);

    fireEvent.click(screen.getByRole('button', {name: 'Close Edit'}));
    expect(showsOnViewport()).toBe(3);
  });

  it("keeps each toast's auto-hide timer running across a move", () => {
    vi.useFakeTimers();
    try {
      const onHide = vi.fn();
      render(
        <ToastViewport>
          <TimedToastButton onHide={onHide} />
          <DialogFixture label="Edit" />
        </ToastViewport>,
      );

      fireEvent.click(screen.getByRole('button', {name: 'Show timed toast'}));
      act(() => {
        vi.advanceTimersByTime(3000);
      });
      fireEvent.click(screen.getByRole('button', {name: 'Toggle Edit'}));
      expect(getDialog('Edit').contains(getViewport())).toBe(true);
      act(() => {
        vi.advanceTimersByTime(2500);
      });
      // A remount would have restarted the 5s timer at the move.
      expect(onHide).toHaveBeenCalledWith('auto');
    } finally {
      vi.useRealTimers();
    }
  });

  it('returns when the dialog closes natively while React holds it open', () => {
    const {container} = render(
      <ToastViewport>
        <DialogFixture label="Edit" />
      </ToastViewport>,
    );
    fireEvent.click(screen.getByRole('button', {name: 'Toggle Edit'}));
    const dialog = getDialog('Edit');
    expect(dialog.contains(getViewport())).toBe(true);

    act(() => {
      dialog.removeAttribute('open');
      dialog.dispatchEvent(new Event('close'));
    });
    expect(container.contains(getViewport())).toBe(true);
  });

  it('follows the latest open modal through nested dialogs', () => {
    render(
      <ToastViewport>
        <DialogFixture label="Outer">
          <DialogFixture label="Inner" />
        </DialogFixture>
      </ToastViewport>,
    );

    fireEvent.click(screen.getByRole('button', {name: 'Toggle Outer'}));
    fireEvent.click(screen.getByRole('button', {name: 'Toggle Inner'}));
    expect(getDialog('Inner').contains(getViewport())).toBe(true);

    fireEvent.click(screen.getByRole('button', {name: 'Close Inner'}));
    expect(getDialog('Inner').contains(getViewport())).toBe(false);
    expect(getDialog('Outer').contains(getViewport())).toBe(true);
  });

  it('returns to its place when the open Dialog unmounts', () => {
    const {container} = render(
      <ToastViewport>
        <UnmountFixture />
      </ToastViewport>,
    );
    fireEvent.click(screen.getByRole('button', {name: 'Show toast'}));
    const toast = screen.getByText('Saved');
    const dismiss = getViewport().querySelector('button')!;
    dismiss.focus();

    act(() => {
      fireEvent.click(screen.getByRole('button', {name: 'Unmount'}));
    });
    expect(container.contains(getViewport())).toBe(true);
    expect(screen.getByText('Saved')).toBe(toast);
    // jsdom does not blur a moved node, so this guards only the end state;
    // the browser blur is handled by ToastViewport's focus restore.
    expect(document.activeElement).toBe(dismiss);
  });

  it('stays in place when the caller renders it in place', () => {
    render(
      <DialogFixture label="Edit">
        <ToastViewport isTopLayer={false}>
          <ToastButton />
        </ToastViewport>
      </DialogFixture>,
    );
    fireEvent.click(screen.getByRole('button', {name: 'Toggle Edit'}));
    fireEvent.click(screen.getByRole('button', {name: 'Show toast'}));
    expect(getDialog('Edit').contains(screen.getByText('Saved'))).toBe(true);
    expect(document.querySelector('[popover="manual"]')).toBeNull();
  });

  it('does not move into an inline Dialog', () => {
    const {container} = render(
      <ToastViewport>
        <Dialog isOpen isInline onOpenChange={() => {}} aria-label="Preview">
          <ToastButton />
        </Dialog>
      </ToastViewport>,
    );
    fireEvent.click(screen.getByRole('button', {name: 'Show toast'}));
    const viewport = getViewport();
    expect(viewport.closest('[aria-label="Preview"]')).toBeNull();
    expect(container.contains(viewport)).toBe(true);
  });
});
