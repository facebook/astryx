// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file XDSCommandPaletteGroup.test.tsx
 * @input Uses vitest, @testing-library/react
 * @output Unit tests for XDSCommandPaletteGroup
 */

import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {XDSCommandPaletteGroup} from './XDSCommandPaletteGroup';

describe('XDSCommandPaletteGroup', () => {
  it('renders heading', () => {
    render(
      <XDSCommandPaletteGroup heading="Navigation">
        <div>Item</div>
      </XDSCommandPaletteGroup>,
    );
    expect(screen.getByText('Navigation')).toBeInTheDocument();
  });

  it('renders children', () => {
    render(
      <XDSCommandPaletteGroup heading="Group">
        <div>Child 1</div>
        <div>Child 2</div>
      </XDSCommandPaletteGroup>,
    );
    expect(screen.getByText('Child 1')).toBeInTheDocument();
    expect(screen.getByText('Child 2')).toBeInTheDocument();
  });

  it('has group role with aria-label', () => {
    render(
      <XDSCommandPaletteGroup heading="Actions">
        <div>Item</div>
      </XDSCommandPaletteGroup>,
    );
    expect(screen.getByRole('group')).toHaveAttribute('aria-label', 'Actions');
  });

  it('heading is aria-hidden', () => {
    render(
      <XDSCommandPaletteGroup heading="Hidden Heading">
        <div>Item</div>
      </XDSCommandPaletteGroup>,
    );
    expect(screen.getByText('Hidden Heading')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
  });
});
