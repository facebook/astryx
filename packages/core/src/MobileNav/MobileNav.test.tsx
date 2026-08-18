// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file MobileNav.test.tsx
 * @input Uses vitest, @testing-library/react, MobileNav component
 * @output Unit tests for MobileNav component behavior
 * @position Testing; validates MobileNav.tsx implementation
 *
 * SYNC: When MobileNav.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, vi, beforeAll} from 'vitest';
import {render, screen, fireEvent} from '@testing-library/react';
import {MobileNav} from './MobileNav';
import {Dialog} from '../Dialog';
import {useFocusTrap} from '../hooks/useFocusTrap';

// jsdom doesn't implement showModal/close on <dialog>, so we mock them
beforeAll(() => {
  HTMLDialogElement.prototype.showModal =
    HTMLDialogElement.prototype.showModal ||
    function (this: HTMLDialogElement) {
      this.setAttribute('open', '');
    };
  HTMLDialogElement.prototype.close =
    HTMLDialogElement.prototype.close ||
    function (this: HTMLDialogElement) {
      this.removeAttribute('open');
    };
});

describe('MobileNav', () => {
  it('renders when isOpen is true', () => {
    render(
      <MobileNav isOpen={true} onOpenChange={() => {}}>
        <span>Nav content</span>
      </MobileNav>,
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Nav content')).toBeInTheDocument();
  });

  it('does not show dialog as open when isOpen is false', () => {
    render(
      <MobileNav
        isOpen={false}
        onOpenChange={() => {}}
        data-testid="mobile-nav">
        <span>Nav content</span>
      </MobileNav>,
    );
    // The dialog element exists but is not open
    const dialog = screen.getByTestId('mobile-nav');
    expect(dialog).toBeInTheDocument();
    expect(dialog).not.toHaveAttribute('open');
  });

  it('calls onOpenChange(false) on native cancel event (Escape)', () => {
    const handleClose = vi.fn();
    render(
      <MobileNav isOpen={true} onOpenChange={handleClose}>
        <span>Content</span>
      </MobileNav>,
    );

    // Native <dialog> fires a cancel event on Escape
    const dialog = screen.getByRole('dialog');
    const cancelEvent = new Event('cancel', {bubbles: false, cancelable: true});
    fireEvent(dialog, cancelEvent);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('calls onOpenChange(false) on backdrop click (click on dialog itself)', () => {
    const handleClose = vi.fn();
    render(
      <MobileNav
        isOpen={true}
        onOpenChange={handleClose}
        data-testid="mobile-nav">
        <span>Content</span>
      </MobileNav>,
    );

    // Click directly on the dialog element (the transparent overlay area)
    const dialog = screen.getByTestId('mobile-nav');
    fireEvent.click(dialog);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('does not close on drawer content click', () => {
    const handleClose = vi.fn();
    render(
      <MobileNav isOpen={true} onOpenChange={handleClose}>
        <span>Content</span>
      </MobileNav>,
    );

    fireEvent.click(screen.getByText('Content'));
    expect(handleClose).not.toHaveBeenCalled();
  });

  it('renders close button', () => {
    render(
      <MobileNav isOpen={true} onOpenChange={() => {}}>
        <span>Content</span>
      </MobileNav>,
    );

    const closeButton = screen.getByRole('button', {name: /close/i});
    expect(closeButton).toBeInTheDocument();
  });

  it('calls onOpenChange(false) when close button is clicked', () => {
    const handleClose = vi.fn();
    render(
      <MobileNav isOpen={true} onOpenChange={handleClose}>
        <span>Content</span>
      </MobileNav>,
    );

    const closeButton = screen.getByRole('button', {name: /close/i});
    fireEvent.click(closeButton);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('renders header string when provided', () => {
    render(
      <MobileNav isOpen={true} onOpenChange={() => {}} header="Navigation">
        <span>Content</span>
      </MobileNav>,
    );

    expect(screen.getByText('Navigation')).toBeInTheDocument();
  });

  it('forwards data-testid', () => {
    render(
      <MobileNav isOpen={true} onOpenChange={() => {}} data-testid="custom-nav">
        <span>Content</span>
      </MobileNav>,
    );

    expect(screen.getByTestId('custom-nav')).toBeInTheDocument();
  });

  it('forwards arbitrary pass-through attributes to the dialog', () => {
    render(
      <MobileNav
        isOpen={true}
        onOpenChange={() => {}}
        data-testid="nav"
        id="main-nav"
        data-custom="x"
        aria-describedby="nav-desc">
        <span>Content</span>
      </MobileNav>,
    );

    const dialog = screen.getByTestId('nav');
    expect(dialog).toHaveAttribute('id', 'main-nav');
    expect(dialog).toHaveAttribute('data-custom', 'x');
    expect(dialog).toHaveAttribute('aria-describedby', 'nav-desc');
  });

  it('applies a consumer className and style to the dialog', () => {
    render(
      <MobileNav
        isOpen={true}
        onOpenChange={() => {}}
        data-testid="nav"
        className="consumer-class"
        style={{zIndex: 42}}>
        <span>Content</span>
      </MobileNav>,
    );

    const dialog = screen.getByTestId('nav');
    expect(dialog.className).toContain('consumer-class');
    expect(dialog.style.zIndex).toBe('42');
  });

  it('composes a consumer onClick with the backdrop-dismiss handler', () => {
    const onClick = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <MobileNav
        isOpen={true}
        onOpenChange={onOpenChange}
        data-testid="nav"
        onClick={onClick}>
        <span>Content</span>
      </MobileNav>,
    );

    // Clicking the dialog element itself (the backdrop) dismisses AND calls the
    // consumer handler.
    fireEvent.click(screen.getByTestId('nav'));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('uses native dialog element', () => {
    render(
      <MobileNav isOpen={true} onOpenChange={() => {}} data-testid="mobile-nav">
        <span>Content</span>
      </MobileNav>,
    );

    const dialog = screen.getByTestId('mobile-nav');
    expect(dialog.tagName).toBe('DIALOG');
  });

  it('sets aria-label from header string', () => {
    render(
      <MobileNav isOpen={true} onOpenChange={() => {}} header="My Nav">
        <span>Content</span>
      </MobileNav>,
    );

    expect(screen.getByRole('dialog')).toHaveAttribute('aria-label', 'My Nav');
  });

  it('defaults aria-label to Navigation when no header', () => {
    render(
      <MobileNav isOpen={true} onOpenChange={() => {}}>
        <span>Content</span>
      </MobileNav>,
    );

    expect(screen.getByRole('dialog')).toHaveAttribute(
      'aria-label',
      'Navigation',
    );
  });

  it('opens dialog via showModal when isOpen becomes true', () => {
    const {rerender} = render(
      <MobileNav
        isOpen={false}
        onOpenChange={() => {}}
        data-testid="mobile-nav">
        <span>Content</span>
      </MobileNav>,
    );

    const dialog = screen.getByTestId('mobile-nav');
    expect(dialog).not.toHaveAttribute('open');

    rerender(
      <MobileNav isOpen={true} onOpenChange={() => {}} data-testid="mobile-nav">
        <span>Content</span>
      </MobileNav>,
    );

    expect(dialog).toHaveAttribute('open');
  });
});

/**
 * Regression coverage for #5168 — a MobileNav opened from inside a Dialog used
 * to hand its Escape press to the Dialog: the press bubbled from the MobileNav
 * `<dialog>` up to the Dialog's element-level keydown listener, which called
 * `preventDefault()` (killing the browser close request that would have
 * dismissed the nav) and closed itself. The Dialog vanished and the nav stayed
 * on screen.
 */
describe('MobileNav layered over a Dialog', () => {
  function pressEscape(target: Element): KeyboardEvent {
    const event = new KeyboardEvent('keydown', {
      key: 'Escape',
      bubbles: true,
      cancelable: true,
    });
    target.dispatchEvent(event);
    return event;
  }

  function renderNested() {
    const onNavOpenChange = vi.fn();
    const onDialogOpenChange = vi.fn();
    render(
      <Dialog isOpen onOpenChange={onDialogOpenChange} aria-label="Host dialog">
        <MobileNav isOpen onOpenChange={onNavOpenChange}>
          <span>Nav content</span>
        </MobileNav>
      </Dialog>,
    );

    // Document order puts the wrapping Dialog first; assert the nesting the
    // regression depends on rather than trusting the order.
    const dialogs = Array.from(document.querySelectorAll('dialog'));
    expect(dialogs).toHaveLength(2);
    const [hostDialog, nav] = dialogs;
    expect(hostDialog.contains(nav)).toBe(true);

    return {hostDialog, nav, onNavOpenChange, onDialogOpenChange};
  }

  it('closes the nav and leaves the Dialog open', () => {
    const {nav, onNavOpenChange, onDialogOpenChange} = renderNested();

    pressEscape(nav);

    expect(onNavOpenChange).toHaveBeenCalledWith(false);
    expect(onDialogOpenChange).not.toHaveBeenCalled();
  });

  it('consumes the press instead of letting it travel to the layers above', () => {
    const {nav} = renderNested();
    const reachedDocument = vi.fn();
    document.addEventListener('keydown', reachedDocument);

    // Two ways a single press reaches a second layer: it keeps bubbling to
    // document-level listeners, or the browser turns the un-consumed default
    // into a close request and fires `cancel` on the top-most open dialog.
    // Claiming the press at the nav element shuts both down.
    const event = pressEscape(nav);

    document.removeEventListener('keydown', reachedDocument);
    expect(reachedDocument).not.toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(true);
  });

  it('closes on Escape when it is the only layer', () => {
    const onOpenChange = vi.fn();
    render(
      <MobileNav isOpen onOpenChange={onOpenChange}>
        <span>Nav content</span>
      </MobileNav>,
    );
    const nav = document.querySelector('dialog')!;

    pressEscape(nav);

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('defers to a focus-trapped layer opened inside it', () => {
    const onOpenChange = vi.fn();
    const onEscape = vi.fn();

    // Stands in for a DropdownMenu or Popover opened from a nav row: those
    // register on the focus-trap Escape stack and must win the press.
    function TrappedLayer() {
      const {containerRef} = useFocusTrap<HTMLDivElement>({
        isActive: true,
        onEscape,
      });
      return <div ref={containerRef} data-testid="trapped" />;
    }

    render(
      <MobileNav isOpen onOpenChange={onOpenChange}>
        <TrappedLayer />
      </MobileNav>,
    );
    const trapped = screen.getByTestId('trapped');

    pressEscape(trapped);

    expect(onOpenChange).not.toHaveBeenCalled();
    expect(onEscape).toHaveBeenCalled();
  });

  it('ignores a close request raised while a focus-trapped layer is open', () => {
    const onOpenChange = vi.fn();

    function TrappedLayer() {
      const {containerRef} = useFocusTrap<HTMLDivElement>({
        isActive: true,
        onEscape: () => {},
      });
      return <div ref={containerRef} data-testid="trapped" />;
    }

    render(
      <MobileNav isOpen onOpenChange={onOpenChange}>
        <TrappedLayer />
      </MobileNav>,
    );
    const nav = document.querySelector('dialog')!;

    // The trapped layer let the press through to the browser, which aims its
    // close request at the top-most open dialog — this one. It is not ours.
    nav.dispatchEvent(new Event('cancel', {cancelable: true}));

    expect(onOpenChange).not.toHaveBeenCalled();
  });
});
