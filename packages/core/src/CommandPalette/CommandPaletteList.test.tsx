// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file CommandPaletteList.test.tsx
 * @input Uses vitest, @testing-library/react
 * @output Unit tests for CommandPaletteList
 */

import {describe, it, expect} from 'vitest';
import {createRef} from 'react';
import {render, screen} from '@testing-library/react';
import {createStaticSource} from '@astryxdesign/core/Typeahead';
import {CommandPalette} from './CommandPalette';
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

  it('is the listbox that the CommandPalette query field controls', async () => {
    render(
      <CommandPalette
        isOpen
        isInline
        onOpenChange={() => {}}
        searchSource={createStaticSource([{id: 'home', label: 'Home'}])}
      />,
    );

    const listbox = await screen.findByRole('listbox');
    expect(listbox.id).not.toBe('');
    expect(screen.getByRole('combobox')).toHaveAttribute(
      'aria-controls',
      listbox.id,
    );
  });

  it('connects ref to the listbox element', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <CommandPaletteList ref={ref}>
        <div>Item</div>
      </CommandPaletteList>,
    );

    expect(ref.current).toBe(screen.getByRole('listbox'));
  });

  it('combines consumer className and style with the list theme target', () => {
    render(
      <CommandPaletteList className="product-results" style={{minHeight: 120}}>
        <div>Item</div>
      </CommandPaletteList>,
    );

    const listbox = screen.getByRole('listbox');
    expect(listbox).toHaveClass(
      'astryx-command-palette-list',
      'product-results',
    );
    expect(listbox).toHaveStyle({minHeight: '120px'});
  });
});
