/**
 * @file XDSConfirmationModal.test.tsx
 * @input Uses vitest, @testing-library/react, userEvent, XDSConfirmationModal
 * @output Unit tests for XDSConfirmationModal component
 * @position Testing; validates XDSConfirmationModal.tsx implementation
 *
 * SYNC: When XDSConfirmationModal.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, vi, beforeEach} from 'vitest';
import {render, screen, waitFor, act} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {XDSConfirmationModal} from './XDSConfirmationModal';

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

describe('XDSConfirmationModal', () => {
  const defaultProps = {
    isShown: true,
    title: 'Confirm action',
    description: 'Are you sure you want to proceed?',
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
  };

  it('renders title and description', () => {
    render(<XDSConfirmationModal {...defaultProps} />);
    expect(screen.getByText('Confirm action')).toBeInTheDocument();
    expect(
      screen.getByText('Are you sure you want to proceed?'),
    ).toBeInTheDocument();
  });

  it('renders default button labels', () => {
    render(<XDSConfirmationModal {...defaultProps} />);
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Confirm')).toBeInTheDocument();
  });

  it('renders custom button labels', () => {
    render(
      <XDSConfirmationModal
        {...defaultProps}
        confirmLabel="Delete"
        cancelLabel="Keep"
      />,
    );
    expect(screen.getByText('Keep')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(<XDSConfirmationModal {...defaultProps} onCancel={onCancel} />);

    await user.click(screen.getByText('Cancel'));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('calls onConfirm when confirm button is clicked', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(<XDSConfirmationModal {...defaultProps} onConfirm={onConfirm} />);

    await user.click(screen.getByText('Confirm'));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('renders ReactNode description', () => {
    render(
      <XDSConfirmationModal
        {...defaultProps}
        description={
          <div>
            <strong>Warning:</strong> This is permanent.
          </div>
        }
      />,
    );
    expect(screen.getByText('Warning:')).toBeInTheDocument();
    expect(screen.getByText('This is permanent.')).toBeInTheDocument();
  });

  it('uses role="alertdialog"', () => {
    render(<XDSConfirmationModal {...defaultProps} />);
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
  });

  it('has aria-describedby linking to description', () => {
    render(<XDSConfirmationModal {...defaultProps} />);
    const dialog = screen.getByRole('alertdialog');
    const describedBy = dialog.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    const descriptionEl = document.getElementById(describedBy!);
    expect(descriptionEl).toBeInTheDocument();
    expect(descriptionEl?.textContent).toContain(
      'Are you sure you want to proceed?',
    );
  });

  it('passes data-testid to dialog', () => {
    render(
      <XDSConfirmationModal {...defaultProps} data-testid="confirm-modal" />,
    );
    expect(screen.getByTestId('confirm-modal')).toBeInTheDocument();
  });

  describe('async onConfirm', () => {
    it('manages loading state automatically for Promise-returning onConfirm', async () => {
      let resolveConfirm: () => void;
      const onConfirm = vi.fn(
        () =>
          new Promise<void>(resolve => {
            resolveConfirm = resolve;
          }),
      );

      render(<XDSConfirmationModal {...defaultProps} onConfirm={onConfirm} />);

      const confirmButton = screen.getByText('Confirm').closest('button')!;

      // Click confirm — should start loading
      await act(async () => {
        confirmButton.click();
      });

      expect(onConfirm).toHaveBeenCalledTimes(1);
      expect(confirmButton).toHaveAttribute('aria-busy', 'true');

      // Resolve the promise — should stop loading
      await act(async () => {
        resolveConfirm!();
      });

      await waitFor(() => {
        expect(confirmButton).not.toHaveAttribute('aria-busy', 'true');
      });
    });

    it('clears loading state even if onConfirm rejects', async () => {
      // Suppress expected unhandled rejection
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const onConfirm = vi.fn(() => Promise.reject(new Error('fail')));

      render(<XDSConfirmationModal {...defaultProps} onConfirm={onConfirm} />);

      const confirmButton = screen.getByText('Confirm').closest('button')!;

      await act(async () => {
        confirmButton.click();
        // Wait for the microtask queue to flush
        await Promise.resolve();
      });

      await waitFor(() => {
        expect(confirmButton).not.toHaveAttribute('aria-busy', 'true');
      });

      spy.mockRestore();
    });
  });

  describe('external isLoading', () => {
    it('shows loading state when isLoading is true', () => {
      render(<XDSConfirmationModal {...defaultProps} isLoading={true} />);

      const confirmButton = screen.getByText('Confirm').closest('button')!;
      expect(confirmButton).toHaveAttribute('aria-busy', 'true');
    });

    it('disables cancel button when loading', () => {
      render(<XDSConfirmationModal {...defaultProps} isLoading={true} />);

      const cancelButton = screen.getByText('Cancel').closest('button')!;
      expect(cancelButton).toBeDisabled();
    });
  });

  describe('variant', () => {
    it('renders standard variant by default', () => {
      render(<XDSConfirmationModal {...defaultProps} />);
      // Confirm button should exist (primary styling is default)
      expect(screen.getByText('Confirm')).toBeInTheDocument();
    });

    it('renders destructive variant', () => {
      render(<XDSConfirmationModal {...defaultProps} variant="destructive" />);
      expect(screen.getByText('Confirm')).toBeInTheDocument();
    });
  });

  it('does not render when isShown is false', () => {
    render(<XDSConfirmationModal {...defaultProps} isShown={false} />);
    const dialog = screen.getByRole('alertdialog', {hidden: true});
    expect(dialog).not.toHaveAttribute('open');
  });
});
