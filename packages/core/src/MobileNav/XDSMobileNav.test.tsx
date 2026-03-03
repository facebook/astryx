/**
 * @file XDSMobileNav.test.tsx
 * @input Uses vitest, @testing-library/react, XDSMobileNav component
 * @output Unit tests for XDSMobileNav component behavior
 * @position Testing; validates XDSMobileNav.tsx implementation
 *
 * SYNC: When XDSMobileNav.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, vi, beforeAll} from 'vitest';
import {render, screen, fireEvent} from '@testing-library/react';
import {XDSMobileNav} from './XDSMobileNav';

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

describe('XDSMobileNav', () => {
  it('renders when isOpen is true', () => {
    render(
      <XDSMobileNav isOpen={true} onClose={() => {}}>
        <span>Nav content</span>
      </XDSMobileNav>,
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Nav content')).toBeInTheDocument();
  });

  it('does not show dialog as open when isOpen is false', () => {
    render(
      <XDSMobileNav isOpen={false} onClose={() => {}} data-testid="mobile-nav">
        <span>Nav content</span>
      </XDSMobileNav>,
    );
    // The dialog element exists but is not open
    const dialog = screen.getByTestId('mobile-nav');
    expect(dialog).toBeInTheDocument();
    expect(dialog).not.toHaveAttribute('open');
  });

  it('calls onClose on native cancel event (Escape)', () => {
    const handleClose = vi.fn();
    render(
      <XDSMobileNav isOpen={true} onClose={handleClose}>
        <span>Content</span>
      </XDSMobileNav>,
    );

    // Native <dialog> fires a cancel event on Escape
    const dialog = screen.getByRole('dialog');
    const cancelEvent = new Event('cancel', {bubbles: false, cancelable: true});
    fireEvent(dialog, cancelEvent);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose on backdrop click (click on dialog itself)', () => {
    const handleClose = vi.fn();
    render(
      <XDSMobileNav
        isOpen={true}
        onClose={handleClose}
        data-testid="mobile-nav">
        <span>Content</span>
      </XDSMobileNav>,
    );

    // Click directly on the dialog element (the transparent overlay area)
    const dialog = screen.getByTestId('mobile-nav');
    fireEvent.click(dialog);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('does not close on drawer content click', () => {
    const handleClose = vi.fn();
    render(
      <XDSMobileNav isOpen={true} onClose={handleClose}>
        <span>Content</span>
      </XDSMobileNav>,
    );

    fireEvent.click(screen.getByText('Content'));
    expect(handleClose).not.toHaveBeenCalled();
  });

  it('renders close button', () => {
    render(
      <XDSMobileNav isOpen={true} onClose={() => {}}>
        <span>Content</span>
      </XDSMobileNav>,
    );

    const closeButton = screen.getByRole('button', {name: /close/i});
    expect(closeButton).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    render(
      <XDSMobileNav isOpen={true} onClose={handleClose}>
        <span>Content</span>
      </XDSMobileNav>,
    );

    const closeButton = screen.getByRole('button', {name: /close/i});
    fireEvent.click(closeButton);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('renders title when provided', () => {
    render(
      <XDSMobileNav isOpen={true} onClose={() => {}} title="Navigation">
        <span>Content</span>
      </XDSMobileNav>,
    );

    expect(screen.getByText('Navigation')).toBeInTheDocument();
  });

  it('forwards data-testid', () => {
    render(
      <XDSMobileNav isOpen={true} onClose={() => {}} data-testid="custom-nav">
        <span>Content</span>
      </XDSMobileNav>,
    );

    expect(screen.getByTestId('custom-nav')).toBeInTheDocument();
  });

  it('uses native dialog element', () => {
    render(
      <XDSMobileNav isOpen={true} onClose={() => {}} data-testid="mobile-nav">
        <span>Content</span>
      </XDSMobileNav>,
    );

    const dialog = screen.getByTestId('mobile-nav');
    expect(dialog.tagName).toBe('DIALOG');
  });

  it('sets aria-label from title', () => {
    render(
      <XDSMobileNav isOpen={true} onClose={() => {}} title="My Nav">
        <span>Content</span>
      </XDSMobileNav>,
    );

    expect(screen.getByRole('dialog')).toHaveAttribute('aria-label', 'My Nav');
  });

  it('defaults aria-label to Navigation when no title', () => {
    render(
      <XDSMobileNav isOpen={true} onClose={() => {}}>
        <span>Content</span>
      </XDSMobileNav>,
    );

    expect(screen.getByRole('dialog')).toHaveAttribute(
      'aria-label',
      'Navigation',
    );
  });

  it('opens dialog via showModal when isOpen becomes true', () => {
    const {rerender} = render(
      <XDSMobileNav isOpen={false} onClose={() => {}} data-testid="mobile-nav">
        <span>Content</span>
      </XDSMobileNav>,
    );

    const dialog = screen.getByTestId('mobile-nav');
    expect(dialog).not.toHaveAttribute('open');

    rerender(
      <XDSMobileNav isOpen={true} onClose={() => {}} data-testid="mobile-nav">
        <span>Content</span>
      </XDSMobileNav>,
    );

    expect(dialog).toHaveAttribute('open');
  });
});
