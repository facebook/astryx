// Copyright (c) Meta Platforms, Inc. and affiliates.

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
import {XDSDialogHeader} from './XDSDialogHeader';

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
      <XDSDialog isOpen={true} onOpenChange={() => {}}>
        Dialog content
      </XDSDialog>,
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Dialog content')).toBeInTheDocument();
  });

  it('calls showModal when opened', () => {
    render(
      <XDSDialog isOpen={true} onOpenChange={() => {}}>
        Content
      </XDSDialog>,
    );
    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled();
  });

  it('does not show when isOpen is false', () => {
    render(
      <XDSDialog isOpen={false} onOpenChange={() => {}}>
        Hidden content
      </XDSDialog>,
    );
    const dialog = screen.getByRole('dialog', {hidden: true});
    expect(dialog).not.toHaveAttribute('open');
  });

  it('has aria-modal attribute', () => {
    render(
      <XDSDialog isOpen={true} onOpenChange={() => {}}>
        Content
      </XDSDialog>,
    );
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
  });

  describe('purpose: info (default)', () => {
    it('calls onOpenChange(false) when Escape is pressed', () => {
      const handleHide = vi.fn();

      render(
        <XDSDialog isOpen={true} onOpenChange={handleHide} purpose="info">
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
        <XDSDialog isOpen={true} onOpenChange={handleHide} purpose="form">
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
        <XDSDialog isOpen={true} onOpenChange={handleHide} purpose="required">
          Content
        </XDSDialog>,
      );

      const dialog = screen.getByRole('alertdialog');
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
        <XDSDialog isOpen={true} onOpenChange={handleHide} purpose="required">
          Content
        </XDSDialog>,
      );

      const dialog = screen.getByRole('alertdialog');
      const cancelEvent = new Event('cancel', {cancelable: true});
      dialog.dispatchEvent(cancelEvent);

      expect(cancelEvent.defaultPrevented).toBe(true);
      expect(handleHide).not.toHaveBeenCalled();
    });
  });

  describe('variant: standard', () => {
    it('renders with default variant', () => {
      render(
        <XDSDialog isOpen={true} onOpenChange={() => {}}>
          Content
        </XDSDialog>,
      );
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('accepts custom width', () => {
      render(
        <XDSDialog isOpen={true} onOpenChange={() => {}} width={600}>
          Content
        </XDSDialog>,
      );
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('accepts custom maxHeight', () => {
      render(
        <XDSDialog isOpen={true} onOpenChange={() => {}} maxHeight="50vh">
          Content
        </XDSDialog>,
      );
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('variant: fullscreen', () => {
    it('renders fullscreen variant', () => {
      render(
        <XDSDialog isOpen={true} onOpenChange={() => {}} variant="fullscreen">
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
          isOpen={true}
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
        isOpen={true}
        onOpenChange={() => {}}
        data-testid="custom-dialog">
        Content
      </XDSDialog>,
    );
    expect(screen.getByTestId('custom-dialog')).toBeInTheDocument();
  });

  it('does not forward native open prop to dialog element', () => {
    render(
      <XDSDialog
        isOpen={false}
        onOpenChange={() => {}}
        {...({open: true} as Record<string, unknown>)}>
        Content
      </XDSDialog>,
    );
    const dialog = screen.getByRole('dialog', {hidden: true});
    // isOpen=false controls state; native open prop must not leak through
    expect(dialog).not.toHaveAttribute('open');
  });

  describe('alertdialog role', () => {
    it('sets role="alertdialog" when purpose is "required"', () => {
      render(
        <XDSDialog isOpen={true} onOpenChange={() => {}} purpose="required">
          Content
        </XDSDialog>,
      );
      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    });

    it('does not set role="alertdialog" when purpose is "info"', () => {
      render(
        <XDSDialog isOpen={true} onOpenChange={() => {}} purpose="info">
          Content
        </XDSDialog>,
      );
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('does not set role="alertdialog" when purpose is "form"', () => {
      render(
        <XDSDialog isOpen={true} onOpenChange={() => {}} purpose="form">
          Content
        </XDSDialog>,
      );
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('inner flex wrapper', () => {
    it('wraps children in a flex container for scroll support', () => {
      render(
        <XDSDialog isOpen={true} onOpenChange={() => {}}>
          <div data-testid="child">Content</div>
        </XDSDialog>,
      );
      const child = screen.getByTestId('child');
      const wrapper = child.parentElement!;
      expect(wrapper.tagName).toBe('DIV');
      expect(wrapper.parentElement!.tagName).toBe('DIALOG');
    });
  });

  describe('edge compensation isolation', () => {
    it('does not inherit edge compensation from ancestor containers', () => {
      // With container-driven edge compensation (via :has() + data attributes),
      // dialogs no longer need to reset CSS custom properties — the compensation
      // is scoped to each container's own slot wrappers.
      render(
        <div>
          <XDSDialog isOpen={true} onOpenChange={() => {}}>
            <div data-testid="child">Content</div>
          </XDSDialog>
        </div>,
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
    });
  });

  describe('isInline', () => {
    it('renders children in a div without a <dialog> element', () => {
      const {container} = render(
        <XDSDialog isOpen={true} isInline onOpenChange={() => {}}>
          <div data-testid="child">Inline content</div>
        </XDSDialog>,
      );
      expect(screen.getByText('Inline content')).toBeInTheDocument();
      expect(container.querySelector('dialog')).toBeNull();
    });

    it('renders nothing when isOpen is false', () => {
      const {container} = render(
        <XDSDialog isOpen={false} isInline onOpenChange={() => {}}>
          <div data-testid="child">Hidden content</div>
        </XDSDialog>,
      );
      expect(screen.queryByText('Hidden content')).not.toBeInTheDocument();
      expect(container.querySelector('dialog')).toBeNull();
    });

    it('does not call showModal', () => {
      render(
        <XDSDialog isOpen={true} isInline onOpenChange={() => {}}>
          Content
        </XDSDialog>,
      );
      expect(HTMLDialogElement.prototype.showModal).not.toHaveBeenCalled();
    });

    it('suppresses DialogHeader auto-focus', () => {
      const before = document.createElement('button');
      before.type = 'button';
      document.body.appendChild(before);
      before.focus();

      render(
        <XDSDialog isOpen={true} isInline onOpenChange={() => {}}>
          <XDSDialogHeader title="Inline title" />
        </XDSDialog>,
      );

      expect(before).toHaveFocus();
      before.remove();
    });
  });
});
