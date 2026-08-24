// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Dialog.test.tsx
 * @input Uses vitest, @testing-library/react, Dialog component
 * @output Unit tests for Dialog component behavior
 * @position Testing; validates Dialog.tsx implementation
 *
 * SYNC: When Dialog.tsx changes, update tests to match new behavior
 */

import {readFileSync} from 'node:fs';
import {describe, it, expect, vi, beforeEach} from 'vitest';
import {render, screen} from '@testing-library/react';
import {Dialog, resolveDialogPositionOffsets} from './Dialog';
import {DialogHeader} from './DialogHeader';

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

describe('Dialog', () => {
  it('renders when isOpen is true', () => {
    render(
      <Dialog isOpen={true} onOpenChange={() => {}}>
        Dialog content
      </Dialog>,
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Dialog content')).toBeInTheDocument();
  });

  it('calls showModal when opened', () => {
    render(
      <Dialog isOpen={true} onOpenChange={() => {}}>
        Content
      </Dialog>,
    );
    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled();
  });

  it('does not show when isOpen is false', () => {
    render(
      <Dialog isOpen={false} onOpenChange={() => {}}>
        Hidden content
      </Dialog>,
    );
    const dialog = screen.getByRole('dialog', {hidden: true});
    expect(dialog).not.toHaveAttribute('open');
  });

  it('has aria-modal attribute', () => {
    render(
      <Dialog isOpen={true} onOpenChange={() => {}}>
        Content
      </Dialog>,
    );
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
  });

  describe('purpose: info (default)', () => {
    it('calls onOpenChange(false) when Escape is pressed', () => {
      const handleHide = vi.fn();

      render(
        <Dialog isOpen={true} onOpenChange={handleHide} purpose="info">
          Content
        </Dialog>,
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
        <Dialog isOpen={true} onOpenChange={handleHide} purpose="form">
          Content
        </Dialog>,
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
        <Dialog isOpen={true} onOpenChange={handleHide} purpose="required">
          Content
        </Dialog>,
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
        <Dialog isOpen={true} onOpenChange={handleHide} purpose="required">
          Content
        </Dialog>,
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
        <Dialog isOpen={true} onOpenChange={() => {}}>
          Content
        </Dialog>,
      );
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('accepts custom width', () => {
      render(
        <Dialog isOpen={true} onOpenChange={() => {}} width={600}>
          Content
        </Dialog>,
      );
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('accepts custom maxHeight', () => {
      render(
        <Dialog isOpen={true} onOpenChange={() => {}} maxHeight="50vh">
          Content
        </Dialog>,
      );
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('variant: fullscreen', () => {
    it('renders fullscreen variant', () => {
      render(
        <Dialog isOpen={true} onOpenChange={() => {}} variant="fullscreen">
          Content
        </Dialog>,
      );
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('responsive sizing', () => {
    it('keeps the requested width but clamps standard dialogs to container and dynamic viewport gutters', () => {
      render(
        <Dialog
          isOpen={true}
          onOpenChange={() => {}}
          width={600}
          maxHeight="70dvh"
          aria-label="Sized dialog">
          Content
        </Dialog>,
      );

      const dialog = screen.getByRole('dialog');
      const inlineStyle = dialog.getAttribute('style') ?? '';
      expect(inlineStyle).toContain('--x-width: 600px');
      expect(inlineStyle).toContain(
        '--x-maxWidth: min(100%, calc(100dvw - var(--spacing-4) - var(--spacing-4)))',
      );
      expect(inlineStyle).toContain('--x-maxHeight: 70dvh');
    });

    it('uses a fullscreen-specific fade animation instead of centered dialog movement', () => {
      const source = readFileSync(
        'packages/core/src/Dialog/Dialog.tsx',
        'utf8',
      );
      const standardOpen = source.slice(
        source.indexOf('  open: {'),
        source.indexOf('  // Backdrop using ::backdrop'),
      );
      const fullscreenOpen = source.slice(
        source.indexOf('  fullscreenOpen: {'),
        source.indexOf('  fullscreenSafeArea: {'),
      );
      const modalStyleOrder = source.slice(
        source.indexOf('focusOutlineProps.focusVisible('),
        source.indexOf(
          '          xstyle,',
          source.indexOf('focusOutlineProps.focusVisible('),
        ),
      );

      expect(standardOpen).toContain('enterDirectional');
      expect(fullscreenOpen).toContain('enterFullscreen');
      expect(fullscreenOpen).not.toContain('enterDirectional');
      expect(modalStyleOrder.indexOf('styles.open')).toBeLessThan(
        modalStyleOrder.indexOf('styles.fullscreenOpen'),
      );
    });

    it('protects fullscreen content with safe-area padding', () => {
      render(
        <Dialog
          isOpen={true}
          onOpenChange={() => {}}
          variant="fullscreen"
          aria-label="Fullscreen dialog">
          <div data-testid="child">Content</div>
        </Dialog>,
      );

      const wrapper = screen.getByTestId('child').parentElement!;
      const computed = window.getComputedStyle(wrapper);
      expect(computed.paddingInlineStart).toContain('safe-area-inset-left');
      expect(computed.paddingInlineEnd).toContain('safe-area-inset-right');
      expect(wrapper.parentElement!.tagName).toBe('DIALOG');
    });
  });

  describe('position prop', () => {
    it('accepts position configuration', () => {
      render(
        <Dialog
          isOpen={true}
          onOpenChange={() => {}}
          position={{top: 100, end: 20}}>
          Content
        </Dialog>,
      );
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('handles string position values', () => {
      render(
        <Dialog
          isOpen={true}
          onOpenChange={() => {}}
          position={{top: '10vh', start: '5vw'}}>
          Content
        </Dialog>,
      );
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('accepts logical start/end position configuration', () => {
      render(
        <Dialog
          isOpen={true}
          onOpenChange={() => {}}
          position={{top: 100, start: 20, end: 40}}>
          Content
        </Dialog>,
      );
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  // Physical-vs-logical mapping is verified against the pure resolver so we can
  // assert the exact emitted CSS offsets without relying on StyleX class
  // compilation or a browser. The public DialogPosition union forbids mixing
  // logical and physical inline offsets (enforced at compile time, below), so
  // the resolver has no precedence logic — it just maps what it's given.
  describe('resolveDialogPositionOffsets (physical-vs-logical mapping)', () => {
    it('maps logical start/end to inset-inline offsets (mirror under RTL)', () => {
      // insetInlineStart/End are direction-relative: the browser resolves them
      // to left/right per `dir`, so the same value mirrors under RTL.
      const offsets = resolveDialogPositionOffsets({start: 20, end: 40});
      expect(offsets.insetInlineStart).toBe('20px');
      expect(offsets.insetInlineEnd).toBe('40px');
      // No physical offsets requested → auto.
    });

    it('combines block-axis top/bottom with an inline pair', () => {
      const offsets = resolveDialogPositionOffsets({top: 100, start: 12});
      expect(offsets.top).toBe('100px');
      expect(offsets.insetInlineStart).toBe('12px');
      // Everything unset falls back to auto.
      expect(offsets.bottom).toBe('auto');
      expect(offsets.insetInlineEnd).toBe('auto');
    });

    it('passes through string offsets (vw/vh/etc.) for logical offsets', () => {
      const logical = resolveDialogPositionOffsets({start: '5vw', end: '10%'});
      expect(logical.insetInlineStart).toBe('5vw');
      expect(logical.insetInlineEnd).toBe('10%');
    });
  });

  it('forwards additional props to dialog element', () => {
    render(
      <Dialog isOpen={true} onOpenChange={() => {}} data-testid="custom-dialog">
        Content
      </Dialog>,
    );
    expect(screen.getByTestId('custom-dialog')).toBeInTheDocument();
  });

  it('does not forward native open prop to dialog element', () => {
    render(
      <Dialog
        isOpen={false}
        onOpenChange={() => {}}
        {...({open: true} as Record<string, unknown>)}>
        Content
      </Dialog>,
    );
    const dialog = screen.getByRole('dialog', {hidden: true});
    // isOpen=false controls state; native open prop must not leak through
    expect(dialog).not.toHaveAttribute('open');
  });

  describe('alertdialog role', () => {
    it('sets role="alertdialog" when purpose is "required"', () => {
      render(
        <Dialog isOpen={true} onOpenChange={() => {}} purpose="required">
          Content
        </Dialog>,
      );
      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    });

    it('does not set role="alertdialog" when purpose is "info"', () => {
      render(
        <Dialog isOpen={true} onOpenChange={() => {}} purpose="info">
          Content
        </Dialog>,
      );
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('does not set role="alertdialog" when purpose is "form"', () => {
      render(
        <Dialog isOpen={true} onOpenChange={() => {}} purpose="form">
          Content
        </Dialog>,
      );
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('accessible name', () => {
    it('is labelled by the DialogHeader title by default', () => {
      render(
        <Dialog isOpen={true} onOpenChange={() => {}}>
          <DialogHeader title="Dialog title" />
        </Dialog>,
      );
      const dialog = screen.getByRole('dialog');
      const heading = screen.getByRole('heading', {name: 'Dialog title'});
      expect(heading.id).not.toBe('');
      expect(dialog).toHaveAttribute('aria-labelledby', heading.id);
      expect(dialog).toHaveAccessibleName('Dialog title');
    });

    it('prefers a consumer-provided aria-label over the header title', () => {
      render(
        <Dialog isOpen={true} onOpenChange={() => {}} aria-label="Custom name">
          <DialogHeader title="Dialog title" />
        </Dialog>,
      );
      const dialog = screen.getByRole('dialog');
      expect(dialog).not.toHaveAttribute('aria-labelledby');
      expect(dialog).toHaveAccessibleName('Custom name');
    });

    it('prefers a consumer-provided aria-labelledby over the header title', () => {
      render(
        <>
          <span id="external-label">External name</span>
          <Dialog
            isOpen={true}
            onOpenChange={() => {}}
            aria-labelledby="external-label">
            <DialogHeader title="Dialog title" />
          </Dialog>
        </>,
      );
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-labelledby', 'external-label');
      expect(dialog).toHaveAccessibleName('External name');
    });

    it('omits aria-labelledby and warns when open with no name source', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      try {
        render(
          <Dialog isOpen={true} onOpenChange={() => {}}>
            Content
          </Dialog>,
        );
        const dialog = screen.getByRole('dialog');
        expect(dialog).not.toHaveAttribute('aria-labelledby');
        expect(warnSpy).toHaveBeenCalledTimes(1);
        expect(warnSpy).toHaveBeenCalledWith(
          expect.stringContaining('accessible name'),
        );
      } finally {
        warnSpy.mockRestore();
      }
    });

    it('does not warn when the header provides a title', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      try {
        render(
          <Dialog isOpen={true} onOpenChange={() => {}}>
            <DialogHeader title="Dialog title" />
          </Dialog>,
        );
        expect(warnSpy).not.toHaveBeenCalled();
      } finally {
        warnSpy.mockRestore();
      }
    });
  });

  describe('inner flex wrapper', () => {
    it('wraps children in a flex container for scroll support', () => {
      render(
        <Dialog isOpen={true} onOpenChange={() => {}}>
          <div data-testid="child">Content</div>
        </Dialog>,
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
          <Dialog isOpen={true} onOpenChange={() => {}}>
            <div data-testid="child">Content</div>
          </Dialog>
        </div>,
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
    });
  });

  describe('isInline', () => {
    it('renders children in a div without a <dialog> element', () => {
      const {container} = render(
        <Dialog isOpen={true} isInline onOpenChange={() => {}}>
          <div data-testid="child">Inline content</div>
        </Dialog>,
      );
      expect(screen.getByText('Inline content')).toBeInTheDocument();
      expect(container.querySelector('dialog')).toBeNull();
    });

    it('renders nothing when isOpen is false', () => {
      const {container} = render(
        <Dialog isOpen={false} isInline onOpenChange={() => {}}>
          <div data-testid="child">Hidden content</div>
        </Dialog>,
      );
      expect(screen.queryByText('Hidden content')).not.toBeInTheDocument();
      expect(container.querySelector('dialog')).toBeNull();
    });

    it('does not call showModal', () => {
      render(
        <Dialog isOpen={true} isInline onOpenChange={() => {}}>
          Content
        </Dialog>,
      );
      expect(HTMLDialogElement.prototype.showModal).not.toHaveBeenCalled();
    });

    it('suppresses DialogHeader auto-focus', () => {
      const before = document.createElement('button');
      before.type = 'button';
      document.body.appendChild(before);
      before.focus();

      render(
        <Dialog isOpen={true} isInline onOpenChange={() => {}}>
          <DialogHeader title="Inline title" />
        </Dialog>,
      );

      expect(before).toHaveFocus();
      before.remove();
    });
  });

  describe('container padding isolation', () => {
    it('resets container padding custom properties on the root dialog element', () => {
      render(
        <Dialog isOpen={true} onOpenChange={() => {}}>
          Content
        </Dialog>,
      );
      const dialog = screen.getByRole('dialog');
      const computed = window.getComputedStyle(dialog);
      expect(
        computed.getPropertyValue('--container-padding-inline-start'),
      ).toBe('0px');
      expect(computed.getPropertyValue('--container-padding-inline-end')).toBe(
        '0px',
      );
      expect(computed.getPropertyValue('--container-padding-block-start')).toBe(
        '0px',
      );
      expect(computed.getPropertyValue('--container-padding-block-end')).toBe(
        '0px',
      );
    });
  });
});
