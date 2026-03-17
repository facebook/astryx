/**
 * @file XDSCommandPaletteFooter.test.tsx
 * @input Uses vitest, @testing-library/react
 * @output Unit tests for XDSCommandPaletteFooter
 */

import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {XDSCommandPaletteFooter} from './XDSCommandPaletteFooter';

describe('XDSCommandPaletteFooter', () => {
  it('renders default keyboard hints', () => {
    render(<XDSCommandPaletteFooter />);
    expect(screen.getByText(/Navigate/)).toBeInTheDocument();
    expect(screen.getByText(/Select/)).toBeInTheDocument();
    expect(screen.getByText(/Close/)).toBeInTheDocument();
  });

  it('renders custom children instead of defaults', () => {
    render(
      <XDSCommandPaletteFooter>
        <span>Custom footer content</span>
      </XDSCommandPaletteFooter>,
    );
    expect(screen.getByText('Custom footer content')).toBeInTheDocument();
    expect(screen.queryByText(/Navigate/)).not.toBeInTheDocument();
  });

  it('renders a divider', () => {
    render(<XDSCommandPaletteFooter />);
    expect(screen.getByRole('separator')).toBeInTheDocument();
  });
});
