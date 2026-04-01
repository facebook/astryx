/**
 * @file XDSCommandPaletteInput.test.tsx
 * @input Uses vitest, @testing-library/react, XDSCommandPaletteInput
 * @output Unit tests for XDSCommandPaletteInput component
 * @position Testing; validates XDSCommandPaletteInput.tsx implementation
 */

import {describe, it, expect, vi} from 'vitest';
import {render, screen, fireEvent} from '@testing-library/react';
import {XDSCommandPaletteInput} from './XDSCommandPaletteInput';

describe('XDSCommandPaletteInput', () => {
  it('renders with default placeholder', () => {
    render(<XDSCommandPaletteInput />);
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
  });

  it('renders with custom placeholder', () => {
    render(<XDSCommandPaletteInput placeholder="Type a command..." />);
    expect(
      screen.getByPlaceholderText('Type a command...'),
    ).toBeInTheDocument();
  });

  it('has combobox role', () => {
    render(<XDSCommandPaletteInput />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('calls onChange when typing', () => {
    const handleChange = vi.fn();
    render(<XDSCommandPaletteInput onChange={handleChange} />);

    const input = screen.getByRole('combobox');
    fireEvent.change(input, {target: {value: 'test'}});

    expect(handleChange).toHaveBeenCalledWith('test', expect.any(Object));
  });

  it('displays controlled value', () => {
    render(<XDSCommandPaletteInput value="hello" onChange={() => {}} />);
    expect(screen.getByRole('combobox')).toHaveValue('hello');
  });

  it('calls onChangeAction when typing', () => {
    const handleAction = vi.fn();

    render(<XDSCommandPaletteInput onChangeAction={handleAction} />);

    const input = screen.getByRole('combobox');
    fireEvent.change(input, {target: {value: 'x'}});

    expect(handleAction).toHaveBeenCalledWith('x', expect.any(Object));
  });

  it('has aria-expanded and aria-autocomplete', () => {
    render(<XDSCommandPaletteInput />);
    const input = screen.getByRole('combobox');
    expect(input).toHaveAttribute('aria-expanded', 'true');
    expect(input).toHaveAttribute('aria-autocomplete', 'list');
  });
});
