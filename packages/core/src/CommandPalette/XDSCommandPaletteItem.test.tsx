// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file XDSCommandPaletteItem.test.tsx
 * @input Uses vitest, @testing-library/react
 * @output Unit tests for XDSCommandPaletteItem
 */

import {afterEach, describe, it, expect, vi} from 'vitest';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import {XDSDialog} from '../Dialog/XDSDialog';
import {XDSCommandPaletteItem} from './XDSCommandPaletteItem';

const scrollIntoViewDescriptor = Object.getOwnPropertyDescriptor(
  HTMLElement.prototype,
  'scrollIntoView',
);

function mockScrollIntoView() {
  const scrollIntoView = vi.fn();
  Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
    configurable: true,
    value: scrollIntoView,
  });
  return scrollIntoView;
}

afterEach(() => {
  if (scrollIntoViewDescriptor) {
    Object.defineProperty(
      HTMLElement.prototype,
      'scrollIntoView',
      scrollIntoViewDescriptor,
    );
  } else {
    delete (HTMLElement.prototype as unknown as {scrollIntoView?: unknown})
      .scrollIntoView;
  }
});

describe('XDSCommandPaletteItem', () => {
  it('renders children', () => {
    render(
      <XDSCommandPaletteItem value="test">Test Item</XDSCommandPaletteItem>,
    );
    expect(screen.getByText('Test Item')).toBeInTheDocument();
  });

  it('has option role', () => {
    render(<XDSCommandPaletteItem value="test">Item</XDSCommandPaletteItem>);
    expect(screen.getByRole('option')).toBeInTheDocument();
  });

  it('calls onSelect when clicked', () => {
    const handleSelect = vi.fn();
    render(
      <XDSCommandPaletteItem value="test" onSelect={handleSelect}>
        Item
      </XDSCommandPaletteItem>,
    );
    fireEvent.click(screen.getByRole('option'));
    expect(handleSelect).toHaveBeenCalledWith('test');
  });

  it('does not call onSelect when disabled', () => {
    const handleSelect = vi.fn();
    render(
      <XDSCommandPaletteItem value="test" onSelect={handleSelect} isDisabled>
        Item
      </XDSCommandPaletteItem>,
    );
    fireEvent.click(screen.getByRole('option'));
    expect(handleSelect).not.toHaveBeenCalled();
  });

  it('sets aria-disabled when disabled', () => {
    render(
      <XDSCommandPaletteItem value="test" isDisabled>
        Item
      </XDSCommandPaletteItem>,
    );
    expect(screen.getByRole('option')).toHaveAttribute('aria-disabled', 'true');
  });

  it('sets aria-selected when selected (not highlighted)', () => {
    render(
      <XDSCommandPaletteItem value="test" isSelected>
        Item
      </XDSCommandPaletteItem>,
    );
    expect(screen.getByRole('option')).toHaveAttribute('aria-selected', 'true');
  });

  it('does not set aria-selected when only highlighted', () => {
    // Highlight is visual only — aria-activedescendant on the input conveys
    // keyboard focus, so aria-selected must not be set on highlight alone.
    render(
      <XDSCommandPaletteItem value="test" isHighlighted>
        Item
      </XDSCommandPaletteItem>,
    );
    expect(screen.getByRole('option')).toHaveAttribute(
      'aria-selected',
      'false',
    );
  });

  it('scrolls highlighted items into view by default', async () => {
    const scrollIntoView = mockScrollIntoView();

    render(
      <XDSCommandPaletteItem value="test" isHighlighted>
        Item
      </XDSCommandPaletteItem>,
    );

    await waitFor(() => {
      expect(scrollIntoView).toHaveBeenCalledWith({block: 'nearest'});
    });
  });

  it('does not scroll initially highlighted items in inline dialogs', () => {
    const scrollIntoView = mockScrollIntoView();

    render(
      <XDSDialog isOpen isInline onOpenChange={() => {}}>
        <XDSCommandPaletteItem value="test" isHighlighted>
          Item
        </XDSCommandPaletteItem>
      </XDSDialog>,
    );

    expect(scrollIntoView).not.toHaveBeenCalled();
  });

  it('scrolls inline dialog items after highlight changes', async () => {
    const scrollIntoView = mockScrollIntoView();

    const {rerender} = render(
      <XDSDialog isOpen isInline onOpenChange={() => {}}>
        <XDSCommandPaletteItem value="test" isHighlighted={false}>
          Item
        </XDSCommandPaletteItem>
      </XDSDialog>,
    );

    rerender(
      <XDSDialog isOpen isInline onOpenChange={() => {}}>
        <XDSCommandPaletteItem value="test" isHighlighted>
          Item
        </XDSCommandPaletteItem>
      </XDSDialog>,
    );

    await waitFor(() => {
      expect(scrollIntoView).toHaveBeenCalledWith({block: 'nearest'});
    });
  });

  it('sets data-value attribute', () => {
    render(
      <XDSCommandPaletteItem value="my-value">Item</XDSCommandPaletteItem>,
    );
    expect(screen.getByRole('option')).toHaveAttribute(
      'data-value',
      'my-value',
    );
  });
});
