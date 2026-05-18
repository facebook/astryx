/**
 * @file XDSDateTimePicker.test.tsx
 * @input Uses vitest, @testing-library/react, XDSDateTimePicker component
 * @output Unit tests for XDSDateTimePicker component behavior
 * @position Testing; validates XDSDateTimePicker.tsx implementation
 *
 * SYNC: When XDSDateTimePicker.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, vi} from 'vitest';
import {render, screen, fireEvent} from '@testing-library/react';
import {XDSDateTimePicker} from './XDSDateTimePicker';
import type {ISODateTimeString} from './XDSDateTimePicker';

describe('XDSDateTimePicker', () => {
  it('renders with label', () => {
    render(<XDSDateTimePicker label="Meeting time" onChange={() => {}} />);
    expect(screen.getByLabelText('Meeting time')).toBeInTheDocument();
  });

  it('renders with placeholder', () => {
    render(
      <XDSDateTimePicker
        label="Time"
        onChange={() => {}}
        placeholder="Pick a date"
      />,
    );
    expect(screen.getByPlaceholderText('Pick a date')).toBeInTheDocument();
  });

  it('renders both date and time inputs', () => {
    render(<XDSDateTimePicker label="Meeting" onChange={() => {}} />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByLabelText('Time')).toBeInTheDocument();
  });

  it('displays formatted date in date input when value is provided', () => {
    render(
      <XDSDateTimePicker
        label="Meeting"
        value={'2026-03-15T14:30' as ISODateTimeString}
        onChange={() => {}}
      />,
    );
    expect(screen.getByDisplayValue('March 15, 2026')).toBeInTheDocument();
  });

  it('displays formatted time in time input when value is provided (12h)', () => {
    render(
      <XDSDateTimePicker
        label="Meeting"
        value={'2026-03-15T14:30' as ISODateTimeString}
        onChange={() => {}}
      />,
    );
    expect(screen.getByDisplayValue('2:30 PM')).toBeInTheDocument();
  });

  it('displays formatted time in 24h format', () => {
    render(
      <XDSDateTimePicker
        label="Meeting"
        value={'2026-03-15T14:30' as ISODateTimeString}
        onChange={() => {}}
        hourFormat="24h"
      />,
    );
    expect(screen.getByDisplayValue('14:30')).toBeInTheDocument();
  });

  it('displays time with seconds', () => {
    render(
      <XDSDateTimePicker
        label="Timestamp"
        value={'2026-03-15T14:30:45' as ISODateTimeString}
        onChange={() => {}}
        hasSeconds
      />,
    );
    expect(screen.getByDisplayValue('2:30:45 PM')).toBeInTheDocument();
  });

  it('forwards ref to date input', () => {
    const ref = vi.fn();
    render(<XDSDateTimePicker ref={ref} label="Meeting" onChange={() => {}} />);
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLInputElement));
  });

  it('visually hides label when isLabelHidden is true', () => {
    render(
      <XDSDateTimePicker label="Meeting" isLabelHidden onChange={() => {}} />,
    );
    const label = screen.getByText('Meeting');
    expect(label).toBeInTheDocument();
    expect(screen.getByLabelText('Meeting')).toBeInTheDocument();
  });

  it('sets aria-required when isRequired is true', () => {
    render(
      <XDSDateTimePicker label="Meeting" isRequired onChange={() => {}} />,
    );
    expect(screen.getByRole('combobox')).toHaveAttribute(
      'aria-required',
      'true',
    );
  });

  it('does not set aria-required when isRequired is false', () => {
    render(<XDSDateTimePicker label="Meeting" onChange={() => {}} />);
    expect(screen.getByRole('combobox')).not.toHaveAttribute('aria-required');
  });

  it('sets disabled on both inputs when isDisabled is true', () => {
    render(
      <XDSDateTimePicker label="Meeting" isDisabled onChange={() => {}} />,
    );
    expect(screen.getByRole('combobox')).toBeDisabled();
    expect(screen.getByLabelText('Time')).toBeDisabled();
  });

  it('is not disabled by default', () => {
    render(<XDSDateTimePicker label="Meeting" onChange={() => {}} />);
    expect(screen.getByRole('combobox')).not.toBeDisabled();
    expect(screen.getByLabelText('Time')).not.toBeDisabled();
  });

  it('date input has role="combobox"', () => {
    render(<XDSDateTimePicker label="Meeting" onChange={() => {}} />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('date input has aria-haspopup="dialog"', () => {
    render(<XDSDateTimePicker label="Meeting" onChange={() => {}} />);
    expect(screen.getByRole('combobox')).toHaveAttribute(
      'aria-haspopup',
      'dialog',
    );
  });

  it('date input has aria-expanded=false by default', () => {
    render(<XDSDateTimePicker label="Meeting" onChange={() => {}} />);
    expect(screen.getByRole('combobox')).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  it('calendar button is focusable and clickable', () => {
    render(<XDSDateTimePicker label="Meeting" onChange={() => {}} />);
    const button = screen.getByRole('button', {name: 'Open calendar'});
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
  });

  it('calendar button is disabled when isDisabled is true', () => {
    render(
      <XDSDateTimePicker label="Meeting" isDisabled onChange={() => {}} />,
    );
    const button = screen.getByRole('button', {name: 'Open calendar'});
    expect(button).toBeDisabled();
  });

  it('disables inputs and button when isLoading is true', () => {
    render(<XDSDateTimePicker label="Meeting" isLoading onChange={() => {}} />);
    expect(screen.getByRole('combobox')).toBeDisabled();
    expect(screen.getByLabelText('Time')).toBeDisabled();
    expect(screen.getByRole('button', {name: 'Open calendar'})).toBeDisabled();
  });

  it('sets aria-busy when isLoading is true', () => {
    render(<XDSDateTimePicker label="Meeting" isLoading onChange={() => {}} />);
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-busy', 'true');
  });

  it('does not set aria-busy when not loading', () => {
    render(<XDSDateTimePicker label="Meeting" onChange={() => {}} />);
    expect(screen.getByRole('combobox')).not.toHaveAttribute('aria-busy');
  });

  it('renders status icon for error status', () => {
    render(
      <XDSDateTimePicker
        label="Meeting"
        onChange={() => {}}
        status={{type: 'error', message: 'Invalid datetime'}}
      />,
    );
    expect(screen.getByRole('combobox')).toHaveAttribute(
      'aria-invalid',
      'true',
    );
  });

  it('does not set aria-invalid for warning status', () => {
    render(
      <XDSDateTimePicker
        label="Meeting"
        onChange={() => {}}
        status={{type: 'warning', message: 'Watch out'}}
      />,
    );
    expect(screen.getByRole('combobox')).not.toHaveAttribute('aria-invalid');
  });

  it('renders description and links via aria-describedby', () => {
    render(
      <XDSDateTimePicker
        label="Meeting"
        description="Pick the meeting datetime"
        onChange={() => {}}
      />,
    );
    const input = screen.getByRole('combobox');
    expect(screen.getByText('Pick the meeting datetime')).toBeInTheDocument();
    expect(input).toHaveAttribute('aria-describedby');
  });

  it('links status message via aria-describedby', () => {
    render(
      <XDSDateTimePicker
        label="Meeting"
        onChange={() => {}}
        status={{type: 'error', message: 'Invalid datetime'}}
      />,
    );
    const input = screen.getByRole('combobox');
    const describedBy = input.getAttribute('aria-describedby')!;
    const ids = describedBy.split(' ');
    const found = ids.some(id => {
      const el = document.getElementById(id);
      return el?.textContent?.includes('Invalid datetime');
    });
    expect(found).toBe(true);
  });

  it('handles Escape keydown on date input without error', () => {
    render(<XDSDateTimePicker label="Meeting" onChange={() => {}} />);
    const input = screen.getByRole('combobox');
    fireEvent.keyDown(input, {key: 'Escape'});
  });

  // --- Date text input behavior ---

  it('calls onChange when valid date is typed', () => {
    const onChange = vi.fn();
    render(<XDSDateTimePicker label="Meeting" onChange={onChange} />);

    const input = screen.getByRole('combobox');
    fireEvent.change(input, {target: {value: '03/15/2026'}});

    expect(onChange).toHaveBeenCalled();
    const calledValue = onChange.mock.calls[0][0] as string;
    expect(calledValue).toMatch(/^2026-03-15T/);
  });

  it('does not call onChange while typing invalid date', () => {
    const onChange = vi.fn();
    render(<XDSDateTimePicker label="Meeting" onChange={onChange} />);

    const input = screen.getByRole('combobox');
    fireEvent.change(input, {target: {value: 'invalid'}});

    expect(onChange).not.toHaveBeenCalled();
  });

  it('reverts date input on blur when input is invalid', () => {
    const onChange = vi.fn();
    render(
      <XDSDateTimePicker
        label="Meeting"
        value={'2026-01-25T10:00' as ISODateTimeString}
        onChange={onChange}
      />,
    );

    const input = screen.getByRole('combobox');
    fireEvent.change(input, {target: {value: 'not a date'}});
    fireEvent.blur(input);

    expect(screen.getByDisplayValue('January 25, 2026')).toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  // --- Time input behavior ---

  it('does not call onChange for time when no date is set', () => {
    const onChange = vi.fn();
    render(<XDSDateTimePicker label="Meeting" onChange={onChange} />);

    const timeInput = screen.getByLabelText('Time');
    fireEvent.change(timeInput, {target: {value: '3:45 pm'}});

    expect(onChange).not.toHaveBeenCalled();
  });

  it('calls onChange for time when date is already set', () => {
    const onChange = vi.fn();
    render(
      <XDSDateTimePicker
        label="Meeting"
        value={'2026-03-15T10:00' as ISODateTimeString}
        onChange={onChange}
      />,
    );

    const timeInput = screen.getByLabelText('Time');
    fireEvent.change(timeInput, {target: {value: '3:45 pm'}});

    expect(onChange).toHaveBeenCalledWith('2026-03-15T15:45');
  });

  describe('hasClear', () => {
    it('shows clear button when hasClear is true and value exists', () => {
      render(
        <XDSDateTimePicker
          label="Meeting"
          value={'2026-03-15T14:30' as ISODateTimeString}
          onChange={() => {}}
          hasClear
        />,
      );
      expect(
        screen.getByRole('button', {name: 'Clear Meeting'}),
      ).toBeInTheDocument();
    });

    it('does not show clear button when value is undefined', () => {
      render(
        <XDSDateTimePicker label="Meeting" onChange={() => {}} hasClear />,
      );
      expect(
        screen.queryByRole('button', {name: 'Clear Meeting'}),
      ).not.toBeInTheDocument();
    });

    it('does not show clear button when hasClear is false', () => {
      render(
        <XDSDateTimePicker
          label="Meeting"
          value={'2026-03-15T14:30' as ISODateTimeString}
          onChange={() => {}}
        />,
      );
      expect(
        screen.queryByRole('button', {name: 'Clear Meeting'}),
      ).not.toBeInTheDocument();
    });

    it('does not show clear button when disabled', () => {
      render(
        <XDSDateTimePicker
          label="Meeting"
          value={'2026-03-15T14:30' as ISODateTimeString}
          onChange={() => {}}
          hasClear
          isDisabled
        />,
      );
      expect(
        screen.queryByRole('button', {name: 'Clear Meeting'}),
      ).not.toBeInTheDocument();
    });

    it('calls onChange with undefined when clear is clicked', () => {
      const onChange = vi.fn();
      render(
        <XDSDateTimePicker
          label="Meeting"
          value={'2026-03-15T14:30' as ISODateTimeString}
          onChange={onChange}
          hasClear
        />,
      );
      fireEvent.click(screen.getByRole('button', {name: 'Clear Meeting'}));
      expect(onChange).toHaveBeenCalledWith(undefined);
    });
  });
});
