/**
 * @file XDSCommandPaletteList.test.tsx
 * @input Uses vitest, @testing-library/react
 * @output Unit tests for XDSCommandPaletteList
 */

import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {XDSCommandPaletteList} from './XDSCommandPaletteList';

describe('XDSCommandPaletteList', () => {
  it('renders children', () => {
    render(
      <XDSCommandPaletteList>
        <div>Item 1</div>
        <div>Item 2</div>
      </XDSCommandPaletteList>,
    );
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  it('has listbox role', () => {
    render(
      <XDSCommandPaletteList>
        <div>Item</div>
      </XDSCommandPaletteList>,
    );
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('has default aria-label', () => {
    render(
      <XDSCommandPaletteList>
        <div>Item</div>
      </XDSCommandPaletteList>,
    );
    expect(screen.getByRole('listbox')).toHaveAttribute(
      'aria-label',
      'Commands',
    );
  });

  it('supports custom label', () => {
    render(
      <XDSCommandPaletteList label="Search results">
        <div>Item</div>
      </XDSCommandPaletteList>,
    );
    expect(screen.getByRole('listbox')).toHaveAttribute(
      'aria-label',
      'Search results',
    );
  });
});
