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
  it('renders when isOpen is true', () => {
    render(
      <XDSDialog isOpen={true} onHide={() => {}}>
        Dialog content
      </XDSDialog>,
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Dialog content')).toBeInTheDocument();
  });

  it('calls showModal when opened', () => {
    render(
      <XDSDialog isOpen={true} onHide={() => {}}>
        Content
      </XDSDialog>,
    );
    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled();
  });

  it('does not show when isOpen is false', () => {
    render(
      <XDSDialog isOpen={false} onHide={() => {}}>
        Hidden content
      </XDSDialog>,
    );
    const dialog = screen.getByRole('dialog', {hidden: true});
    expect(dialog).not.toHaveAttribute('open');
  });

  it('has aria-modal attribute', () => {
    render(
      <XDSDialog isOpen={true} onHide={() => {}}>
        Content
      </XDSDialog>,
    );
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
  });

  describe('purpose: info (default)', () => {
    it('calls onHide when Escape is pressed', () => {
      const handleHide = vi.fn();

      render(
        <XDSDialog isOpen={true} onHide={handleHide} purpose="info">
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
    it('calls onHide when Escape is pressed', () => {
      const handleHide = vi.fn();

      render(
        <XDSDialog isOpen={true} onHide={handleHide} purpose="form">
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
    it('does not call onHide when Escape is pressed', () => {
      const handleHide = vi.fn();

      render(
        <XDSDialog isOpen={true} onHide={handleHide} purpose="required">
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
        <XDSDialog isOpen={true} onHide={handleHide} purpose="required">
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
        <XDSDialog isOpen={true} onHide={() => {}}>
          Content
        </XDSDialog>,
      );
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('accepts custom width', () => {
      render(
        <XDSDialog isOpen={true} onHide={() => {}} width={600}>
          Content
        </XDSDialog>,
      );
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('accepts custom maxHeight', () => {
      render(
        <XDSDialog isOpen={true} onHide={() => {}} maxHeight="50vh">
          Content
        </XDSDialog>,
      );
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('variant: fullscreen', () => {
    it('renders fullscreen variant', () => {
      render(
        <XDSDialog isOpen={true} onHide={() => {}} variant="fullscreen">
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
          isOpen={true}
          onHide={() => {}}
          position={{top: 100, right: 20}}>
          Content
        </XDSDialog>,
      );
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('handles string position values', () => {
      render(
        <XDSDialog
          isOpen={true}
          onHide={() => {}}
          position={{top: '10vh', left: '5vw'}}>
          Content
        </XDSDialog>,
      );
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  it('forwards additional props to dialog element', () => {
    render(
      <XDSDialog isOpen={true} onHide={() => {}} data-testid="custom-dialog">
        Content
      </XDSDialog>,
    );
    expect(screen.getByTestId('custom-dialog')).toBeInTheDocument();
  });
});
