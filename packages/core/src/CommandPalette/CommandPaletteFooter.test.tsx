// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file CommandPaletteFooter.test.tsx
 * @input Uses vitest, @testing-library/react
 * @output Unit tests for CommandPaletteFooter
 */

import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {CommandPaletteFooter} from './CommandPaletteFooter';

describe('CommandPaletteFooter', () => {
  it('renders default keyboard hints', () => {
    render(<CommandPaletteFooter />);
    expect(screen.getByText(/Navigate/)).toBeInTheDocument();
    expect(screen.getByText(/Select/)).toBeInTheDocument();
    expect(screen.getByText(/Close/)).toBeInTheDocument();
  });

  it('renders custom children instead of defaults', () => {
    render(
      <CommandPaletteFooter>
        <span>Custom footer content</span>
      </CommandPaletteFooter>,
    );
    expect(screen.getByText('Custom footer content')).toBeInTheDocument();
    expect(screen.queryByText(/Navigate/)).not.toBeInTheDocument();
  });

  it('renders a single root element (separator is CSS border, not a DOM node)', () => {
    const {container} = render(<CommandPaletteFooter />);
    // The top separator is a borderBlockStart CSS property — no extra DOM node.
    expect(container.firstChild).toBeInTheDocument();
    expect(screen.queryByRole('separator')).not.toBeInTheDocument();
  });
});
