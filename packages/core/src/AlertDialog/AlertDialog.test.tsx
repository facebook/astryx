// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file AlertDialog.test.tsx
 * @input Uses vitest, @testing-library/react, AlertDialog component
 * @output Unit tests for AlertDialog component behavior
 * @position Testing; validates AlertDialog.tsx implementation
 *
 * SYNC: When AlertDialog.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, vi, beforeEach} from 'vitest';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {AlertDialog} from './AlertDialog';
import {useImperativeAlertDialog} from './useImperativeAlertDialog';

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

describe('AlertDialog', () => {
  const defaultProps = {
    isOpen: true,
    onOpenChange: vi.fn(),
    title: 'Delete item?',
    description: 'This action cannot be undone.',
    actionLabel: 'Delete',
    onAction: vi.fn(),
  };

  it('renders with alertdialog role', () => {
    render(<AlertDialog {...defaultProps} />);
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
  });

  it('renders title and description', () => {
    render(<AlertDialog {...defaultProps} />);
    expect(screen.getByText('Delete item?')).toBeInTheDocument();
    expect(
      screen.getByText('This action cannot be undone.'),
    ).toBeInTheDocument();
  });

  it('links title via aria-labelledby', () => {
    render(<AlertDialog {...defaultProps} />);
    const dialog = screen.getByRole('alertdialog');
    const labelledBy = dialog.getAttribute('aria-labelledby');
    expect(labelledBy).toBeTruthy();
    const titleEl = document.getElementById(labelledBy!);
    expect(titleEl).toHaveTextContent('Delete item?');
  });

  it('links description via aria-describedby', () => {
    render(<AlertDialog {...defaultProps} />);
    const dialog = screen.getByRole('alertdialog');
    const describedBy = dialog.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    const descEl = document.getElementById(describedBy!);
    expect(descEl).toHaveTextContent('This action cannot be undone.');
  });

  it('renders cancel and action buttons', () => {
    render(<AlertDialog {...defaultProps} />);
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('uses custom cancel label', () => {
    render(<AlertDialog {...defaultProps} cancelLabel="Never mind" />);
    expect(screen.getByText('Never mind')).toBeInTheDocument();
  });

  it('calls onOpenChange(false) when cancel is clicked', () => {
    const onOpenChange = vi.fn();
    render(<AlertDialog {...defaultProps} onOpenChange={onOpenChange} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('calls onAction when action is clicked', () => {
    const onAction = vi.fn();
    render(<AlertDialog {...defaultProps} onAction={onAction} />);
    fireEvent.click(screen.getByText('Delete'));
    expect(onAction).toHaveBeenCalled();
  });

  it('does not call onOpenChange when action is clicked', () => {
    const onOpenChange = vi.fn();
    render(<AlertDialog {...defaultProps} onOpenChange={onOpenChange} />);
    fireEvent.click(screen.getByText('Delete'));
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('does not render when isOpen is false', () => {
    render(<AlertDialog {...defaultProps} isOpen={false} />);
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('accepts custom width', () => {
    render(<AlertDialog {...defaultProps} width={600} />);
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
  });

  it('defaults cancel label to Cancel', () => {
    render(<AlertDialog {...defaultProps} />);
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  describe('keyboard', () => {
    it('calls onOpenChange(false) on Escape', async () => {
      const onOpenChange = vi.fn();
      render(<AlertDialog {...defaultProps} onOpenChange={onOpenChange} />);
      fireEvent.keyDown(screen.getByRole('alertdialog'), {key: 'Escape'});
      await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
    });

    it('does not call onAction on Escape', () => {
      const onAction = vi.fn();
      render(<AlertDialog {...defaultProps} onAction={onAction} />);
      fireEvent.keyDown(screen.getByRole('alertdialog'), {key: 'Escape'});
      expect(onAction).not.toHaveBeenCalled();
    });

    it('activates cancel with Enter', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      render(<AlertDialog {...defaultProps} onOpenChange={onOpenChange} />);
      screen.getByRole('button', {name: 'Cancel'}).focus();
      await user.keyboard('{Enter}');
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it('activates the action button with Space', async () => {
      const user = userEvent.setup();
      const onAction = vi.fn();
      render(<AlertDialog {...defaultProps} onAction={onAction} />);
      screen.getByRole('button', {name: 'Delete'}).focus();
      await user.keyboard(' ');
      expect(onAction).toHaveBeenCalled();
    });

    it('reaches both buttons by Tab, cancel first', async () => {
      const user = userEvent.setup();
      render(<AlertDialog {...defaultProps} />);
      const cancel = screen.getByRole('button', {name: 'Cancel'});
      const action = screen.getByRole('button', {name: 'Delete'});
      cancel.focus();
      expect(cancel).toHaveFocus();
      await user.tab();
      expect(action).toHaveFocus();
    });
  });

  describe('focus', () => {
    it('marks cancel as the initial focus target', () => {
      render(<AlertDialog {...defaultProps} />);
      // Dialog focuses [data-autofocus] itself after showModal(), so the
      // contract this component owns is which element carries the attribute.
      expect(screen.getByRole('button', {name: 'Cancel'})).toHaveAttribute(
        'data-autofocus',
      );
      expect(screen.getByRole('button', {name: 'Delete'})).not.toHaveAttribute(
        'data-autofocus',
      );
    });

    it('keeps the initial focus target on the least destructive action', () => {
      render(<AlertDialog {...defaultProps} cancelLabel="Never mind" />);
      expect(screen.getByRole('button', {name: 'Never mind'})).toHaveAttribute(
        'data-autofocus',
      );
    });

    it('returns focus to the trigger when it closes', async () => {
      const trigger = document.createElement('button');
      trigger.textContent = 'Open';
      document.body.appendChild(trigger);
      trigger.focus();

      const {rerender} = render(<AlertDialog {...defaultProps} />);
      rerender(<AlertDialog {...defaultProps} isOpen={false} />);

      await waitFor(() => expect(trigger).toHaveFocus());
      trigger.remove();
    });

    it('does not disable the cancel button while the action is loading', () => {
      render(<AlertDialog {...defaultProps} isActionLoading />);
      expect(screen.getByRole('button', {name: 'Cancel'})).toBeEnabled();
    });
  });

  describe('aria', () => {
    it('marks the action button busy while loading', () => {
      render(<AlertDialog {...defaultProps} isActionLoading />);
      expect(screen.getByRole('button', {name: /Delete/})).toHaveAttribute(
        'aria-busy',
        'true',
      );
    });

    it('is a modal alertdialog', () => {
      render(<AlertDialog {...defaultProps} />);
      expect(screen.getByRole('alertdialog')).toHaveAttribute(
        'aria-modal',
        'true',
      );
    });

    describe('the inline preview path', () => {
      it('does not claim the alertdialog role', () => {
        render(<AlertDialog {...defaultProps} isInline />);
        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
      });

      it('exposes a named group instead, with no aria-modal', () => {
        render(<AlertDialog {...defaultProps} isInline />);
        const group = screen.getByRole('group', {name: 'Delete item?'});
        expect(group).not.toHaveAttribute('aria-modal');
        const describedBy = group.getAttribute('aria-describedby');
        expect(describedBy).toBeTruthy();
        expect(document.getElementById(describedBy!)).toHaveTextContent(
          'This action cannot be undone.',
        );
      });
    });
  });
});

describe('useImperativeAlertDialog', () => {
  const noop = () => {};

  function Harness({onAction = noop}: {onAction?: () => unknown}) {
    const alert = useImperativeAlertDialog();
    return (
      <>
        <button
          type="button"
          onClick={() =>
            alert.show({
              title: 'Delete item?',
              description: 'This action cannot be undone.',
              actionLabel: 'Delete',
              onAction,
            })
          }>
          Open
        </button>
        <button type="button" onClick={alert.hide}>
          Close it
        </button>
        <span data-testid="is-open">{String(alert.isOpen)}</span>
        {alert.element}
      </>
    );
  }

  it('renders nothing until show is called', () => {
    render(<Harness />);
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(screen.getByTestId('is-open')).toHaveTextContent('false');
  });

  it('shows the dialog with the given options', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole('button', {name: 'Open'}));
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    expect(screen.getByText('Delete item?')).toBeInTheDocument();
    expect(
      screen.getByText('This action cannot be undone.'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('is-open')).toHaveTextContent('true');
  });

  it('hides on hide()', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole('button', {name: 'Open'}));
    await user.click(screen.getByRole('button', {name: 'Close it'}));
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(screen.getByTestId('is-open')).toHaveTextContent('false');
  });

  it('closes when the dialog cancels', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole('button', {name: 'Open'}));
    await user.click(screen.getByRole('button', {name: 'Cancel'}));
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(screen.getByTestId('is-open')).toHaveTextContent('false');
  });

  it('forwards onAction and leaves closing to the caller', async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    render(<Harness onAction={onAction} />);
    await user.click(screen.getByRole('button', {name: 'Open'}));
    await user.click(screen.getByRole('button', {name: 'Delete'}));
    expect(onAction).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
  });

  it('can be shown again after being hidden', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole('button', {name: 'Open'}));
    await user.click(screen.getByRole('button', {name: 'Close it'}));
    await user.click(screen.getByRole('button', {name: 'Open'}));
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    expect(screen.getByTestId('is-open')).toHaveTextContent('true');
  });
});
