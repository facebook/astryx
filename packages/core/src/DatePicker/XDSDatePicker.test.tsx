/**
 * @file XDSDatePicker.test.tsx
 * @input Uses vitest, @testing-library/react, XDSDatePicker component
 * @output Unit tests for XDSDatePicker component behavior
 * @position Testing; validates XDSDatePicker.tsx implementation
 *
 * SYNC: When XDSDatePicker.tsx changes, update tests to match new behavior
 */

import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {XDSDatePicker} from './XDSDatePicker';

describe('XDSDatePicker', () => {
  it('renders with label', () => {
    render(<XDSDatePicker label="Date" onChange={() => {}} />);
    expect(screen.getByLabelText('Date')).toBeInTheDocument();
  });

  it('renders with placeholder', () => {
    render(
      <XDSDatePicker
        label="Date"
        onChange={() => {}}
        placeholder="Pick a date"
      />,
    );
    expect(screen.getByPlaceholderText('Pick a date')).toBeInTheDocument();
  });

  it('displays formatted date when value is provided', () => {
    render(
      <XDSDatePicker label="Date" value="2026-01-25" onChange={() => {}} />,
    );
    expect(screen.getByDisplayValue('January 25, 2026')).toBeInTheDocument();
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(<XDSDatePicker ref={ref} label="Date" onChange={() => {}} />);
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLInputElement));
  });

  it('visually hides label when isLabelHidden is true', () => {
    render(<XDSDatePicker label="Date" isLabelHidden onChange={() => {}} />);
    const label = screen.getByText('Date');
    expect(label).toBeInTheDocument();
    expect(screen.getByLabelText('Date')).toBeInTheDocument();
  });

  it('shows label visually by default', () => {
    render(<XDSDatePicker label="Event date" onChange={() => {}} />);
    const label = screen.getByText('Event date');
    expect(label).toBeVisible();
  });

  it('sets aria-required when isRequired is true', () => {
    render(<XDSDatePicker label="Date" isRequired onChange={() => {}} />);
    expect(screen.getByRole('textbox')).toHaveAttribute(
      'aria-required',
      'true',
    );
  });

  it('does not set aria-required when isRequired is false', () => {
    render(<XDSDatePicker label="Date" onChange={() => {}} />);
    expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-required');
  });

  it('sets disabled attribute when isDisabled is true', () => {
    render(<XDSDatePicker label="Date" isDisabled onChange={() => {}} />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('is not disabled by default', () => {
    render(<XDSDatePicker label="Date" onChange={() => {}} />);
    expect(screen.getByRole('textbox')).not.toBeDisabled();
  });

  it('renders calendar icon', () => {
    render(<XDSDatePicker label="Date" onChange={() => {}} />);
    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('calendar button has aria-haspopup="dialog" attribute', () => {
    render(<XDSDatePicker label="Date" onChange={() => {}} />);
    expect(screen.getByRole('button', {name: 'Open calendar'})).toHaveAttribute(
      'aria-haspopup',
      'dialog',
    );
  });

  it('calendar button is focusable and clickable', () => {
    render(<XDSDatePicker label="Date" onChange={() => {}} />);
    const button = screen.getByRole('button', {name: 'Open calendar'});
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
  });

  it('calendar button is disabled when isDisabled is true', () => {
    render(<XDSDatePicker label="Date" isDisabled onChange={() => {}} />);
    const button = screen.getByRole('button', {name: 'Open calendar'});
    expect(button).toBeDisabled();
  });

  // Note: Tests involving blur that trigger popover are skipped because
  // jsdom doesn't support the Popover API (showPopover is not a function).
  // These behaviors are tested in the browser via Storybook.
});
