// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file CommandPaletteList.test.tsx
 * @input Uses vitest, @testing-library/react
 * @output Unit tests for CommandPaletteList
 */

import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {CommandPaletteList} from './CommandPaletteList';

describe('CommandPaletteList', () => {
  it('renders children', () => {
    render(
      <CommandPaletteList>
        <div>Item 1</div>
        <div>Item 2</div>
      </CommandPaletteList>,
    );
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  it('has listbox role', () => {
    render(
      <CommandPaletteList>
        <div>Item</div>
      </CommandPaletteList>,
    );
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('has default aria-label', () => {
    render(
      <CommandPaletteList>
        <div>Item</div>
      </CommandPaletteList>,
    );
    expect(screen.getByRole('listbox')).toHaveAttribute(
      'aria-label',
      'Commands',
    );
  });

  it('supports custom label', () => {
    render(
      <CommandPaletteList label="Search results">
        <div>Item</div>
      </CommandPaletteList>,
    );
    expect(screen.getByRole('listbox')).toHaveAttribute(
      'aria-label',
      'Search results',
    );
  });
});
