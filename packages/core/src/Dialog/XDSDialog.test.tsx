/**
 * @file XDSDialog.test.tsx
 * @input Uses vitest, @testing-library/react, XDSDialog component
 * @output Unit tests for XDSDialog component behavior
 * @position Testing; validates XDSDialog.tsx implementation
 *
 * SYNC: When XDSDialog.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, vi, beforeEach} from 'vitest';
import {render, screen} from '@testing-library/react';
import {XDSDialog} from './XDSDialog';

// Mock showModal and close methods since they're not fully implemented in jsdom
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

describe('XDSDialog', () => {
  it('renders when isShown is true', () => {
    render(
      <XDSDialog isShown={true} onOpenChange={() => {}}>
        Dialog content
      </XDSDialog>,
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Dialog content')).toBeInTheDocument();
  });

  it('calls showModal when opened', () => {
    render(
      <XDSDialog isShown={true} onOpenChange={() => {}}>
        Content
      </XDSDialog>,
    );
    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled();
  });

  it('does not show when isShown is false', () => {
    render(
      <XDSDialog isShown={false} onOpenChange={() => {}}>
        Hidden content
      </XDSDialog>,
    );
    const dialog = screen.getByRole('dialog', {hidden: true});
    expect(dialog).not.toHaveAttribute('open');
  });

  it('has aria-modal attribute', () => {
    render(
      <XDSDialog isShown={true} onOpenChange={() => {}}>
        Content
      </XDSDialog>,
    );
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
  });

  describe('purpose: info (default)', () => {
    it('calls onOpenChange(false) when Escape is pressed', () => {
      const handleHide = vi.fn();

      render(
        <XDSDialog isShown={true} onOpenChange={handleHide} purpose="info">
          Content
        </XDSDialog>,
      );

      const dialog = screen.getByRole('dialog');
      const escapeEvent = new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        cancelable: true,
      });
      dialog.dispatchEvent(escapeEvent);
      expect(handleHide).toHaveBeenCalledTimes(1);
    });
  });

  describe('purpose: form', () => {
    it('calls onOpenChange(false) when Escape is pressed', () => {
      const handleHide = vi.fn();

      render(
        <XDSDialog isShown={true} onOpenChange={handleHide} purpose="form">
          Content
        </XDSDialog>,
      );

      const dialog = screen.getByRole('dialog');
      const escapeEvent = new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        cancelable: true,
      });
      dialog.dispatchEvent(escapeEvent);
      expect(handleHide).toHaveBeenCalledTimes(1);
    });
  });

  describe('purpose: required', () => {
    it('does not call onOpenChange when Escape is pressed', () => {
      const handleHide = vi.fn();

      render(
        <XDSDialog isShown={true} onOpenChange={handleHide} purpose="required">
          Content
        </XDSDialog>,
      );

      const dialog = screen.getByRole('dialog');
      const escapeEvent = new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        cancelable: true,
      });
      dialog.dispatchEvent(escapeEvent);
      expect(handleHide).not.toHaveBeenCalled();
    });

    it('prevents default on cancel event', () => {
      const handleHide = vi.fn();
      render(
        <XDSDialog isShown={true} onOpenChange={handleHide} purpose="required">
          Content
        </XDSDialog>,
      );

      const dialog = screen.getByRole('dialog');
      const cancelEvent = new Event('cancel', {cancelable: true});
      dialog.dispatchEvent(cancelEvent);

      expect(cancelEvent.defaultPrevented).toBe(true);
      expect(handleHide).not.toHaveBeenCalled();
    });
  });

  describe('variant: standard', () => {
    it('renders with default variant', () => {
      render(
        <XDSDialog isShown={true} onOpenChange={() => {}}>
          Content
        </XDSDialog>,
      );
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('accepts custom width', () => {
      render(
        <XDSDialog isShown={true} onOpenChange={() => {}} width={600}>
          Content
        </XDSDialog>,
      );
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('accepts custom maxHeight', () => {
      render(
        <XDSDialog isShown={true} onOpenChange={() => {}} maxHeight="50vh">
          Content
        </XDSDialog>,
      );
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('variant: fullscreen', () => {
    it('renders fullscreen variant', () => {
      render(
        <XDSDialog isShown={true} onOpenChange={() => {}} variant="fullscreen">
          Content
        </XDSDialog>,
      );
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('position prop', () => {
    it('accepts position configuration', () => {
      render(
        <XDSDialog
          isShown={true}
          onOpenChange={() => {}}
          position={{top: 100, right: 20}}>
          Content
        </XDSDialog>,
      );
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('handles string position values', () => {
      render(
        <XDSDialog
          isShown={true}
          onOpenChange={() => {}}
          position={{top: '10vh', left: '5vw'}}>
          Content
        </XDSDialog>,
      );
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  it('forwards additional props to dialog element', () => {
    render(
      <XDSDialog
        isShown={true}
        onOpenChange={() => {}}
        data-testid="custom-dialog">
        Content
      </XDSDialog>,
    );
    expect(screen.getByTestId('custom-dialog')).toBeInTheDocument();
  });
});
