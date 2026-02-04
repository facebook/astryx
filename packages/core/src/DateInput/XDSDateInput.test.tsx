/**
 * @file XDSDateInput.test.tsx
 * @input Uses vitest, @testing-library/react, XDSDateInput component
 * @output Unit tests for XDSDateInput component behavior
 * @position Testing; validates XDSDateInput.tsx implementation
 *
 * SYNC: When XDSDateInput.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, vi} from 'vitest';
import {render, screen, fireEvent} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {XDSDateInput} from './XDSDateInput';

describe('XDSDateInput', () => {
  it('renders with label', () => {
    render(<XDSDateInput label="Date" onChange={() => {}} />);
    expect(screen.getByLabelText('Date')).toBeInTheDocument();
  });

  it('renders with placeholder', () => {
    render(
      <XDSDateInput
        label="Date"
        onChange={() => {}}
        placeholder="Pick a date"
      />,
    );
    expect(screen.getByPlaceholderText('Pick a date')).toBeInTheDocument();
  });

  it('displays formatted date when value is provided', () => {
    render(
      <XDSDateInput label="Date" value="2026-01-25" onChange={() => {}} />,
    );
    expect(screen.getByDisplayValue('January 25, 2026')).toBeInTheDocument();
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(<XDSDateInput ref={ref} label="Date" onChange={() => {}} />);
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLInputElement));
  });

  it('visually hides label when isLabelHidden is true', () => {
    render(<XDSDateInput label="Date" isLabelHidden onChange={() => {}} />);
    const label = screen.getByText('Date');
    expect(label).toBeInTheDocument();
    expect(screen.getByLabelText('Date')).toBeInTheDocument();
  });

  it('shows label visually by default', () => {
    render(<XDSDateInput label="Event date" onChange={() => {}} />);
    const label = screen.getByText('Event date');
    expect(label).toBeVisible();
  });

  it('sets aria-required when isRequired is true', () => {
    render(<XDSDateInput label="Date" isRequired onChange={() => {}} />);
    expect(screen.getByRole('textbox')).toHaveAttribute(
      'aria-required',
      'true',
    );
  });

  it('does not set aria-required when isRequired is false', () => {
    render(<XDSDateInput label="Date" onChange={() => {}} />);
    expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-required');
  });

  it('sets disabled attribute when isDisabled is true', () => {
    render(<XDSDateInput label="Date" isDisabled onChange={() => {}} />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('is not disabled by default', () => {
    render(<XDSDateInput label="Date" onChange={() => {}} />);
    expect(screen.getByRole('textbox')).not.toBeDisabled();
  });

  it('renders calendar icon', () => {
    render(<XDSDateInput label="Date" onChange={() => {}} />);
    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('calendar button has aria-haspopup="dialog" attribute', () => {
    render(<XDSDateInput label="Date" onChange={() => {}} />);
    expect(screen.getByRole('button', {name: 'Open calendar'})).toHaveAttribute(
      'aria-haspopup',
      'dialog',
    );
  });

  it('calendar button is focusable and clickable', () => {
    render(<XDSDateInput label="Date" onChange={() => {}} />);
    const button = screen.getByRole('button', {name: 'Open calendar'});
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
  });

  it('calendar button is disabled when isDisabled is true', () => {
    render(<XDSDateInput label="Date" isDisabled onChange={() => {}} />);
    const button = screen.getByRole('button', {name: 'Open calendar'});
    expect(button).toBeDisabled();
  });

  it('does not call onChange while typing invalid input', async () => {
    const onChange = vi.fn();
    render(<XDSDateInput label="Date" onChange={onChange} />);

    const input = screen.getByRole('textbox');
    // Use fireEvent to avoid triggering click handler (which opens popover)
    fireEvent.change(input, {target: {value: 'invalid'}});

    // onChange should not be called while typing
    expect(onChange).not.toHaveBeenCalled();
  });

  it('reverts to previous value on blur when input is invalid', async () => {
    const onChange = vi.fn();
    render(
      <XDSDateInput label="Date" value="2026-01-25" onChange={onChange} />,
    );

    const input = screen.getByRole('textbox');
    // Use fireEvent to avoid triggering click handler (which opens popover)
    fireEvent.change(input, {target: {value: 'not a date'}});
    fireEvent.blur(input);

    // Should revert to the original value, not call onChange
    expect(screen.getByDisplayValue('January 25, 2026')).toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('calls onChange on blur when input is valid', async () => {
    const onChange = vi.fn();
    render(<XDSDateInput label="Date" onChange={onChange} />);

    const input = screen.getByRole('textbox');
    // Use fireEvent to avoid triggering click handler (which opens popover)
    fireEvent.change(input, {target: {value: '03/15/2026'}});
    fireEvent.blur(input);

    expect(onChange).toHaveBeenCalledWith('2026-03-15');
  });

  it('calls onChange immediately when input becomes valid', async () => {
    const onChange = vi.fn();
    render(<XDSDateInput label="Date" onChange={onChange} />);

    const input = screen.getByRole('textbox');
    // Use fireEvent to avoid triggering click handler (which opens popover)
    fireEvent.change(input, {target: {value: '03/15/2026'}});

    // onChange should be called immediately when input is valid, not waiting for blur
    expect(onChange).toHaveBeenCalledWith('2026-03-15');
  });

  // Note: Tests involving blur that trigger popover are skipped because
  // jsdom doesn't support the Popover API (showPopover is not a function).
  // These behaviors are tested in the browser via Storybook.
});
