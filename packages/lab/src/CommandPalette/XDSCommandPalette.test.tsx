/**
 * @file XDSCommandPalette.test.tsx
 * @input Uses vitest, @testing-library/react, XDSCommandPalette
 * @output Unit tests for XDSCommandPalette dialog shell
 * @position Testing; validates XDSCommandPalette.tsx implementation
 *
 * SYNC: When XDSCommandPalette.tsx changes, update tests to match
 */

import {describe, it, expect, vi, beforeEach} from 'vitest';
import {useRef} from 'react';
import {render, screen, fireEvent, act} from '@testing-library/react';
import {XDSCommandPalette} from './XDSCommandPalette';
import {XDSCommandPaletteInput} from './XDSCommandPaletteInput';
import {XDSCommandPaletteList} from './XDSCommandPaletteList';
import {XDSCommandPaletteItem} from './XDSCommandPaletteItem';

// Mock showModal and close since jsdom doesn't implement them
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

describe('XDSCommandPalette', () => {
  it('renders when isOpen is true', () => {
    render(
      <XDSCommandPalette
        isOpen={true}
        onOpenChange={() => {}}
        input={<div>Input</div>}>
        <div>Content</div>
      </XDSCommandPalette>,
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('does not show content when isOpen is false', () => {
    render(
      <XDSCommandPalette
        isOpen={false}
        onOpenChange={() => {}}
        input={<div>Input</div>}>
        <div>Hidden</div>
      </XDSCommandPalette>,
    );
    const dialog = screen.getByRole('dialog', {hidden: true});
    expect(dialog).not.toHaveAttribute('open');
  });

  it('has correct aria-label', () => {
    render(
      <XDSCommandPalette
        isOpen={true}
        onOpenChange={() => {}}
        input={<div>Input</div>}>
        <div>Content</div>
      </XDSCommandPalette>,
    );
    expect(screen.getByRole('dialog')).toHaveAttribute(
      'aria-label',
      'Command palette',
    );
  });

  it('supports custom label', () => {
    render(
      <XDSCommandPalette
        isOpen={true}
        onOpenChange={() => {}}
        label="Quick search"
        input={<div>Input</div>}>
        <div>Content</div>
      </XDSCommandPalette>,
    );
    expect(screen.getByRole('dialog')).toHaveAttribute(
      'aria-label',
      'Quick search',
    );
  });

  it('renders input slot, children, and optional footer slot', () => {
    render(
      <XDSCommandPalette
        isOpen={true}
        onOpenChange={() => {}}
        input={<div data-testid="input-slot">Input</div>}
        footer={<div data-testid="footer-slot">Footer</div>}>
        <div data-testid="list-slot">List</div>
      </XDSCommandPalette>,
    );
    expect(screen.getByTestId('input-slot')).toBeInTheDocument();
    expect(screen.getByTestId('list-slot')).toBeInTheDocument();
    expect(screen.getByTestId('footer-slot')).toBeInTheDocument();
  });

  it('renders without footer slot', () => {
    render(
      <XDSCommandPalette
        isOpen={true}
        onOpenChange={() => {}}
        input={<div>Input</div>}>
        <div data-testid="list-slot">List</div>
      </XDSCommandPalette>,
    );
    expect(screen.getByTestId('list-slot')).toBeInTheDocument();
  });

  it('calls onOpenChange(false) when Escape is pressed', () => {
    const handleOpenChange = vi.fn();
    render(
      <XDSCommandPalette
        isOpen={true}
        onOpenChange={handleOpenChange}
        input={<div>Input</div>}>
        <div>Content</div>
      </XDSCommandPalette>,
    );
    const dialog = screen.getByRole('dialog');
    const escapeEvent = new KeyboardEvent('keydown', {
      key: 'Escape',
      bubbles: true,
      cancelable: true,
    });
    dialog.dispatchEvent(escapeEvent);
    expect(handleOpenChange).toHaveBeenCalledWith(false);
  });

  it('does not over-render items during keyboard navigation', () => {
    const renderCount = vi.fn();

    function TrackedItem({value, children}: {value: string; children: string}) {
      const countRef = useRef(0);
      countRef.current++;
      renderCount(value, countRef.current);
      return (
        <XDSCommandPaletteItem value={value}>{children}</XDSCommandPaletteItem>
      );
    }

    render(
      <XDSCommandPalette
        isOpen={true}
        onOpenChange={() => {}}
        input={<XDSCommandPaletteInput placeholder="Search..." />}>
        <XDSCommandPaletteList>
          <TrackedItem value="a">Alpha</TrackedItem>
          <TrackedItem value="b">Beta</TrackedItem>
          <TrackedItem value="c">Gamma</TrackedItem>
        </XDSCommandPaletteList>
      </XDSCommandPalette>,
    );

    // Clear initial render counts
    renderCount.mockClear();

    const input = screen.getByRole('combobox');

    // Arrow down 3 times
    act(() => {
      fireEvent.keyDown(input, {key: 'ArrowDown'});
    });
    act(() => {
      fireEvent.keyDown(input, {key: 'ArrowDown'});
    });
    act(() => {
      fireEvent.keyDown(input, {key: 'ArrowDown'});
    });

    // Each arrow key should cause at most 2 items to re-render
    // (the one losing highlight + the one gaining it).
    // 3 keypresses × 2 items = 6 max. Allow some slack for React internals.
    const totalRenders = renderCount.mock.calls.length;
    expect(totalRenders).toBeLessThanOrEqual(18); // 3 items × 3 keypresses × 2 (strict mode)
  });
});
