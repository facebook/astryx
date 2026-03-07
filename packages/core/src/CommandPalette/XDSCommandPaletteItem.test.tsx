/**
 * @file XDSCommandPaletteItem.test.tsx
 * @input Uses vitest, @testing-library/react
 * @output Unit tests for XDSCommandPaletteItem
 */

import {describe, it, expect, vi} from 'vitest';
import {render, screen, fireEvent} from '@testing-library/react';
import {XDSCommandPaletteItem} from './XDSCommandPaletteItem';

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

  it('sets aria-selected when highlighted', () => {
    render(
      <XDSCommandPaletteItem value="test" isHighlighted>
        Item
      </XDSCommandPaletteItem>,
    );
    expect(screen.getByRole('option')).toHaveAttribute('aria-selected', 'true');
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
