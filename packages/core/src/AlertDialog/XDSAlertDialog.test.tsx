/**
 * @file XDSAlertDialog.test.tsx
 * @input Uses vitest, @testing-library/react, XDSAlertDialog component
 * @output Unit tests for XDSAlertDialog component behavior
 * @position Testing; validates XDSAlertDialog.tsx implementation
 *
 * SYNC: When XDSAlertDialog.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, vi, beforeEach} from 'vitest';
import {render, screen, fireEvent} from '@testing-library/react';
import {XDSAlertDialog} from './XDSAlertDialog';

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

describe('XDSAlertDialog', () => {
  const defaultProps = {
    isOpen: true,
    onOpenChange: vi.fn(),
    title: 'Delete item?',
    description: 'This action cannot be undone.',
    cancel: <button>Cancel</button>,
    action: <button>Delete</button>,
  };

  it('renders with alertdialog role', () => {
    render(<XDSAlertDialog {...defaultProps} />);
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
  });

  it('renders title and description', () => {
    render(<XDSAlertDialog {...defaultProps} />);
    expect(screen.getByText('Delete item?')).toBeInTheDocument();
    expect(
      screen.getByText('This action cannot be undone.'),
    ).toBeInTheDocument();
  });

  it('links title via aria-labelledby', () => {
    render(<XDSAlertDialog {...defaultProps} />);
    const dialog = screen.getByRole('alertdialog');
    const labelledBy = dialog.getAttribute('aria-labelledby');
    expect(labelledBy).toBeTruthy();
    const titleEl = document.getElementById(labelledBy!);
    expect(titleEl).toHaveTextContent('Delete item?');
  });

  it('links description via aria-describedby', () => {
    render(<XDSAlertDialog {...defaultProps} />);
    const dialog = screen.getByRole('alertdialog');
    const describedBy = dialog.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    const descEl = document.getElementById(describedBy!);
    expect(descEl).toHaveTextContent('This action cannot be undone.');
  });

  it('renders cancel and action buttons', () => {
    render(<XDSAlertDialog {...defaultProps} />);
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('calls onOpenChange(false) when cancel is clicked', () => {
    const onOpenChange = vi.fn();
    render(<XDSAlertDialog {...defaultProps} onOpenChange={onOpenChange} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('does not auto-close when action is clicked', () => {
    const onOpenChange = vi.fn();
    render(<XDSAlertDialog {...defaultProps} onOpenChange={onOpenChange} />);
    fireEvent.click(screen.getByText('Delete'));
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('does not auto-close when disabled cancel is clicked', () => {
    const onOpenChange = vi.fn();
    render(
      <XDSAlertDialog
        {...defaultProps}
        onOpenChange={onOpenChange}
        cancel={<button aria-disabled="true">Cancel</button>}
      />,
    );
    fireEvent.click(screen.getByText('Cancel'));
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('does not render when isOpen is false', () => {
    render(<XDSAlertDialog {...defaultProps} isOpen={false} />);
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('accepts custom width', () => {
    render(<XDSAlertDialog {...defaultProps} width={600} />);
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
  });

  it('has data-autofocus on cancel wrapper', () => {
    render(<XDSAlertDialog {...defaultProps} />);
    const cancelBtn = screen.getByText('Cancel');
    const wrapper = cancelBtn.closest('[data-autofocus]');
    expect(wrapper).toBeInTheDocument();
  });
});
