// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect, vi, beforeAll} from 'vitest';
import {render, screen, fireEvent} from '@testing-library/react';
import {useXDSImperativeDialog} from './useXDSImperativeDialog';

// jsdom doesn't support dialog.showModal/close
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = vi.fn();
  HTMLDialogElement.prototype.close = vi.fn();
});

function TestHarness() {
  const dialog = useXDSImperativeDialog({width: 400});

  return (
    <div>
      <button onClick={() => dialog.show(<div>Dialog content</div>)}>
        Open
      </button>
      <button onClick={() => dialog.hide()}>Close</button>
      <span data-testid="status">{dialog.isOpen ? 'open' : 'closed'}</span>
      {dialog.element}
    </div>
  );
}

describe('useXDSImperativeDialog', () => {
  it('starts closed', () => {
    render(<TestHarness />);
    expect(screen.getByTestId('status').textContent).toBe('closed');
  });

  it('opens on show()', () => {
    render(<TestHarness />);
    fireEvent.click(screen.getByText('Open'));
    expect(screen.getByTestId('status').textContent).toBe('open');
  });

  it('renders content when open', () => {
    render(<TestHarness />);
    fireEvent.click(screen.getByText('Open'));
    expect(screen.getByText('Dialog content')).toBeInTheDocument();
  });

  it('closes on hide()', () => {
    render(<TestHarness />);
    fireEvent.click(screen.getByText('Open'));
    expect(screen.getByTestId('status').textContent).toBe('open');
    fireEvent.click(screen.getByText('Close'));
    expect(screen.getByTestId('status').textContent).toBe('closed');
  });

  it('can show with options', () => {
    function OptionsHarness() {
      const dialog = useXDSImperativeDialog();
      return (
        <div>
          <button onClick={() => dialog.show(<div>Wide content</div>, {width: 720})}>
            Open Wide
          </button>
          <span data-testid="status">{dialog.isOpen ? 'open' : 'closed'}</span>
          {dialog.element}
        </div>
      );
    }
    render(<OptionsHarness />);
    fireEvent.click(screen.getByText('Open Wide'));
    expect(screen.getByTestId('status').textContent).toBe('open');
    expect(screen.getByText('Wide content')).toBeInTheDocument();
  });
});
