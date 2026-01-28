/**
 * @file XDSTextInput.test.tsx
 * @input Uses vitest, @testing-library/react, XDSTextInput component
 * @output Unit tests for XDSTextInput component behavior
 * @position Testing; validates XDSTextInput.tsx implementation
 *
 * SYNC: When XDSTextInput.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {MagnifyingGlassIcon} from '@heroicons/react/24/outline';
import {XDSTextInput} from './XDSTextInput';

describe('XDSTextInput', () => {
  it('renders with label', () => {
    render(<XDSTextInput label="Name" value="" onChange={() => {}} />);
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
  });

  it('renders with placeholder', () => {
    render(
      <XDSTextInput
        label="Name"
        value=""
        onChange={() => {}}
        placeholder="Enter text"
      />
    );
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('calls onChange with value and event when typing', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<XDSTextInput label="Name" value="" onChange={handleChange} />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'Hi');
    expect(handleChange).toHaveBeenCalledTimes(2);
    expect(handleChange).toHaveBeenLastCalledWith('i', expect.any(Object));
  });

  it('works with state setter function directly', async () => {
    const user = userEvent.setup();
    const setValue = vi.fn();
    render(<XDSTextInput label="Name" value="" onChange={setValue} />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'A');
    expect(setValue).toHaveBeenCalledWith('A', expect.any(Object));
  });

  it('displays controlled value', () => {
    render(
      <XDSTextInput label="Name" value="Controlled value" onChange={() => {}} />
    );
    expect(screen.getByRole('textbox')).toHaveValue('Controlled value');
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(
      <XDSTextInput ref={ref} label="Name" value="" onChange={() => {}} />
    );
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLInputElement));
  });

  it('visually hides label when isLabelHidden is true', () => {
    render(
      <XDSTextInput label="Search" isLabelHidden value="" onChange={() => {}} />
    );
    const label = screen.getByText('Search');
    expect(label).toBeInTheDocument();
    // Label should still be accessible
    expect(screen.getByLabelText('Search')).toBeInTheDocument();
  });

  it('shows label visually by default', () => {
    render(<XDSTextInput label="Email" value="" onChange={() => {}} />);
    const label = screen.getByText('Email');
    expect(label).toBeVisible();
  });

  it('sets aria-required when isRequired is true', () => {
    render(
      <XDSTextInput label="Username" isRequired value="" onChange={() => {}} />
    );
    expect(screen.getByRole('textbox')).toHaveAttribute(
      'aria-required',
      'true'
    );
  });

  it('does not set aria-required when isRequired is false', () => {
    render(<XDSTextInput label="Username" value="" onChange={() => {}} />);
    expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-required');
  });

  it('sets disabled attribute when isDisabled is true', () => {
    render(
      <XDSTextInput label="Name" isDisabled value="" onChange={() => {}} />
    );
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('does not fire onChange when disabled', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <XDSTextInput label="Name" isDisabled value="" onChange={handleChange} />
    );

    const input = screen.getByRole('textbox');
    await user.type(input, 'test');
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('is not disabled by default', () => {
    render(<XDSTextInput label="Name" value="" onChange={() => {}} />);
    expect(screen.getByRole('textbox')).not.toBeDisabled();
  });

  it('renders with startIcon', () => {
    render(
      <XDSTextInput
        label="Search"
        value=""
        onChange={() => {}}
        startIcon={MagnifyingGlassIcon}
      />
    );
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    // Icon should be rendered (as an SVG element)
    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('renders without icon wrapper when startIcon is not provided', () => {
    const {container} = render(
      <XDSTextInput label="Name" value="" onChange={() => {}} />
    );
    // No SVG should be present
    expect(container.querySelector('svg')).not.toBeInTheDocument();
  });
});
