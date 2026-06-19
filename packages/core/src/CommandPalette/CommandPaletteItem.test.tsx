// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file CommandPaletteItem.test.tsx
 * @input Uses vitest, @testing-library/react
 * @output Unit tests for CommandPaletteItem
 */

import {afterEach, describe, it, expect, vi} from 'vitest';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import {Dialog} from '../Dialog/Dialog';
import {CommandPaletteItem} from './CommandPaletteItem';

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

describe('CommandPaletteItem', () => {
  it('renders children', () => {
    render(
      <CommandPaletteItem value="test">Test Item</CommandPaletteItem>,
    );
    expect(screen.getByText('Test Item')).toBeInTheDocument();
  });

  it('has option role', () => {
    render(<CommandPaletteItem value="test">Item</CommandPaletteItem>);
    expect(screen.getByRole('option')).toBeInTheDocument();
  });

  it('calls onSelect when clicked', () => {
    const handleSelect = vi.fn();
    render(
      <CommandPaletteItem value="test" onSelect={handleSelect}>
        Item
      </CommandPaletteItem>,
    );
    fireEvent.click(screen.getByRole('option'));
    expect(handleSelect).toHaveBeenCalledWith('test');
  });

  it('does not call onSelect when disabled', () => {
    const handleSelect = vi.fn();
    render(
      <CommandPaletteItem value="test" onSelect={handleSelect} isDisabled>
        Item
      </CommandPaletteItem>,
    );
    fireEvent.click(screen.getByRole('option'));
    expect(handleSelect).not.toHaveBeenCalled();
  });

  it('sets aria-disabled when disabled', () => {
    render(
      <CommandPaletteItem value="test" isDisabled>
        Item
      </CommandPaletteItem>,
    );
    expect(screen.getByRole('option')).toHaveAttribute('aria-disabled', 'true');
  });

  it('sets aria-selected when selected (not highlighted)', () => {
    render(
      <CommandPaletteItem value="test" isSelected>
        Item
      </CommandPaletteItem>,
    );
    expect(screen.getByRole('option')).toHaveAttribute('aria-selected', 'true');
  });

  it('does not set aria-selected when only highlighted', () => {
    // Highlight is visual only — aria-activedescendant on the input conveys
    // keyboard focus, so aria-selected must not be set on highlight alone.
    render(
      <CommandPaletteItem value="test" isHighlighted>
        Item
      </CommandPaletteItem>,
    );
    expect(screen.getByRole('option')).toHaveAttribute(
      'aria-selected',
      'false',
    );
  });

  it('scrolls highlighted items into view by default', async () => {
    const scrollIntoView = mockScrollIntoView();

    render(
      <CommandPaletteItem value="test" isHighlighted>
        Item
      </CommandPaletteItem>,
    );

    await waitFor(() => {
      expect(scrollIntoView).toHaveBeenCalledWith({block: 'nearest'});
    });
  });

  it('does not scroll initially highlighted items in inline dialogs', () => {
    const scrollIntoView = mockScrollIntoView();

    render(
      <Dialog isOpen isInline onOpenChange={() => {}}>
        <CommandPaletteItem value="test" isHighlighted>
          Item
        </CommandPaletteItem>
      </Dialog>,
    );

    expect(scrollIntoView).not.toHaveBeenCalled();
  });

  it('scrolls inline dialog items after highlight changes', async () => {
    const scrollIntoView = mockScrollIntoView();

    const {rerender} = render(
      <Dialog isOpen isInline onOpenChange={() => {}}>
        <CommandPaletteItem value="test" isHighlighted={false}>
          Item
        </CommandPaletteItem>
      </Dialog>,
    );

    rerender(
      <Dialog isOpen isInline onOpenChange={() => {}}>
        <CommandPaletteItem value="test" isHighlighted>
          Item
        </CommandPaletteItem>
      </Dialog>,
    );

    await waitFor(() => {
      expect(scrollIntoView).toHaveBeenCalledWith({block: 'nearest'});
    });
  });

  it('sets data-value attribute', () => {
    render(
      <CommandPaletteItem value="my-value">Item</CommandPaletteItem>,
    );
    expect(screen.getByRole('option')).toHaveAttribute(
      'data-value',
      'my-value',
    );
  });
});
