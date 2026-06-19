// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file CommandPaletteGroup.test.tsx
 * @input Uses vitest, @testing-library/react
 * @output Unit tests for CommandPaletteGroup
 */

import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {CommandPaletteGroup} from './CommandPaletteGroup';

describe('CommandPaletteGroup', () => {
  it('renders heading', () => {
    render(
      <CommandPaletteGroup heading="Navigation">
        <div>Item</div>
      </CommandPaletteGroup>,
    );
    expect(screen.getByText('Navigation')).toBeInTheDocument();
  });

  it('renders children', () => {
    render(
      <CommandPaletteGroup heading="Group">
        <div>Child 1</div>
        <div>Child 2</div>
      </CommandPaletteGroup>,
    );
    expect(screen.getByText('Child 1')).toBeInTheDocument();
    expect(screen.getByText('Child 2')).toBeInTheDocument();
  });

  it('has group role with aria-label', () => {
    render(
      <CommandPaletteGroup heading="Actions">
        <div>Item</div>
      </CommandPaletteGroup>,
    );
    expect(screen.getByRole('group')).toHaveAttribute('aria-label', 'Actions');
  });

  it('heading is aria-hidden', () => {
    render(
      <CommandPaletteGroup heading="Hidden Heading">
        <div>Item</div>
      </CommandPaletteGroup>,
    );
    expect(screen.getByText('Hidden Heading')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
  });
});
