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

  it('calls onValueChange when typing', () => {
    const handleChange = vi.fn();
    render(<XDSCommandPaletteInput onValueChange={handleChange} />);

    const input = screen.getByRole('combobox');
    fireEvent.change(input, {target: {value: 'test'}});

    expect(handleChange).toHaveBeenCalledWith('test');
  });

  it('displays controlled value', () => {
    render(<XDSCommandPaletteInput value="hello" onValueChange={() => {}} />);
    expect(screen.getByRole('combobox')).toHaveValue('hello');
  });

  it('forwards native onChange alongside onValueChange', () => {
    const handleChange = vi.fn();
    const handleNativeChange = vi.fn();

    render(
      <XDSCommandPaletteInput
        onValueChange={handleChange}
        onChange={handleNativeChange}
      />,
    );

    const input = screen.getByRole('combobox');
    fireEvent.change(input, {target: {value: 'x'}});

    expect(handleChange).toHaveBeenCalledWith('x');
    expect(handleNativeChange).toHaveBeenCalled();
  });

  it('has aria-expanded and aria-autocomplete', () => {
    render(<XDSCommandPaletteInput />);
    const input = screen.getByRole('combobox');
    expect(input).toHaveAttribute('aria-expanded', 'true');
    expect(input).toHaveAttribute('aria-autocomplete', 'list');
  });
});
