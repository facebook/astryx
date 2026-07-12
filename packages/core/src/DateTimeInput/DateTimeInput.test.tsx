// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file DateTimeInput.test.tsx
 * @input Uses vitest, @testing-library/react, DateTimeInput component
 * @output Unit tests for DateTimeInput component behavior
 * @position Testing; validates DateTimeInput.tsx implementation
 *
 * SYNC: When DateTimeInput.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, vi, beforeEach} from 'vitest';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {getButton, queryButton} from '../__tests__/fastRoleQueries';
import {DateTimeInput} from './DateTimeInput';
import type {ISODateTimeString} from './DateTimeInput';

describe('DateTimeInput', () => {
  it('renders with label', () => {
    render(<DateTimeInput label="Meeting time" onChange={() => {}} />);
    expect(screen.getByLabelText('Meeting time')).toBeInTheDocument();
  });

  it('derives the time input label from the field label (forms-15)', () => {
    render(<DateTimeInput label="Meeting time" onChange={() => {}} />);
    // Not a hardcoded "Time" — tied to the field label so it is localizable
    // and unambiguous when multiple date-time fields share a page.
    expect(screen.getByLabelText('Meeting time time')).toBeInTheDocument();
    expect(screen.queryByLabelText('Time')).not.toBeInTheDocument();
  });

  it('uses an explicit timeLabel when provided', () => {
    render(
      <DateTimeInput
        label="Meeting time"
        timeLabel="Start time"
        onChange={() => {}}
      />,
    );
    expect(screen.getByLabelText('Start time')).toBeInTheDocument();
  });

  it('renders with placeholder', () => {
    render(
      <DateTimeInput
        label="Time"
        onChange={() => {}}
        placeholder="Pick a date"
      />,
    );
    expect(screen.getByPlaceholderText('Pick a date')).toBeInTheDocument();
  });

  it('defaults the time portion placeholder to "Select a time"', () => {
    render(<DateTimeInput label="Meeting" onChange={() => {}} />);
    expect(screen.getByPlaceholderText('Select a time')).toBeInTheDocument();
  });

  it('applies a custom timePlaceholder to the time portion', () => {
    render(
      <DateTimeInput
        label="Meeting"
        onChange={() => {}}
        placeholder="Pick a date"
        timePlaceholder="Pick a time"
      />,
    );
    // Time portion uses the override; date portion keeps its own placeholder.
    expect(screen.getByPlaceholderText('Pick a time')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Pick a date')).toBeInTheDocument();
    expect(
      screen.queryByPlaceholderText('Select a time'),
    ).not.toBeInTheDocument();
  });

  it('renders both date and time inputs', () => {
    render(<DateTimeInput label="Meeting" onChange={() => {}} />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByLabelText('Meeting time')).toBeInTheDocument();
  });

  it('displays formatted date in date input when value is provided', () => {
    render(
      <DateTimeInput
        label="Meeting"
        value={'2026-03-15T14:30' as ISODateTimeString}
        onChange={() => {}}
      />,
    );
    expect(screen.getByDisplayValue('March 15, 2026')).toBeInTheDocument();
  });

  it('displays formatted time in time input when value is provided (12h)', () => {
    render(
      <DateTimeInput
        label="Meeting"
        value={'2026-03-15T14:30' as ISODateTimeString}
        onChange={() => {}}
      />,
    );
    expect(screen.getByDisplayValue('2:30 PM')).toBeInTheDocument();
  });

  it('displays formatted time in 24h format', () => {
    render(
      <DateTimeInput
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
      <DateTimeInput
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
    render(<DateTimeInput ref={ref} label="Meeting" onChange={() => {}} />);
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLInputElement));
  });

  it('visually hides label when isLabelHidden is true', () => {
    render(<DateTimeInput label="Meeting" isLabelHidden onChange={() => {}} />);
    const label = screen.getByText('Meeting');
    expect(label).toBeInTheDocument();
    expect(screen.getByLabelText('Meeting')).toBeInTheDocument();
  });

  it('sets aria-required when isRequired is true', () => {
    render(<DateTimeInput label="Meeting" isRequired onChange={() => {}} />);
    expect(screen.getByRole('combobox')).toHaveAttribute(
      'aria-required',
      'true',
    );
  });

  it('does not set aria-required when isRequired is false', () => {
    render(<DateTimeInput label="Meeting" onChange={() => {}} />);
    expect(screen.getByRole('combobox')).not.toHaveAttribute('aria-required');
  });

  it('sets disabled on both inputs when isDisabled is true', () => {
    render(<DateTimeInput label="Meeting" isDisabled onChange={() => {}} />);
    expect(screen.getByRole('combobox')).toBeDisabled();
    expect(screen.getByLabelText('Meeting time')).toBeDisabled();
  });

  it('is not disabled by default', () => {
    render(<DateTimeInput label="Meeting" onChange={() => {}} />);
    expect(screen.getByRole('combobox')).not.toBeDisabled();
    expect(screen.getByLabelText('Meeting time')).not.toBeDisabled();
  });

  it('date input has role="combobox"', () => {
    render(<DateTimeInput label="Meeting" onChange={() => {}} />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('date input has aria-haspopup="dialog"', () => {
    render(<DateTimeInput label="Meeting" onChange={() => {}} />);
    expect(screen.getByRole('combobox')).toHaveAttribute(
      'aria-haspopup',
      'dialog',
    );
  });

  it('date input has aria-expanded=false by default', () => {
    render(<DateTimeInput label="Meeting" onChange={() => {}} />);
    expect(screen.getByRole('combobox')).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  it('calendar button is focusable and clickable', () => {
    render(<DateTimeInput label="Meeting" onChange={() => {}} />);
    const button = getButton('Open calendar');
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
  });

  it('calendar button is disabled when isDisabled is true', () => {
    render(<DateTimeInput label="Meeting" isDisabled onChange={() => {}} />);
    const button = getButton('Open calendar');
    expect(button).toBeDisabled();
  });

  it('disables inputs and button when isLoading is true', () => {
    render(<DateTimeInput label="Meeting" isLoading onChange={() => {}} />);
    expect(screen.getByRole('combobox')).toBeDisabled();
    expect(screen.getByLabelText('Meeting time')).toBeDisabled();
    expect(getButton('Open calendar')).toBeDisabled();
  });

  it('sets aria-busy when isLoading is true', () => {
    render(<DateTimeInput label="Meeting" isLoading onChange={() => {}} />);
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-busy', 'true');
  });

  it('does not set aria-busy when not loading', () => {
    render(<DateTimeInput label="Meeting" onChange={() => {}} />);
    expect(screen.getByRole('combobox')).not.toHaveAttribute('aria-busy');
  });

  it('sets aria-busy on the time input when isLoading is true', () => {
    render(<DateTimeInput label="Meeting" isLoading onChange={() => {}} />);
    expect(screen.getByLabelText('Meeting time')).toHaveAttribute(
      'aria-busy',
      'true',
    );
  });

  it('does not set aria-busy on the time input when not loading', () => {
    render(<DateTimeInput label="Meeting" onChange={() => {}} />);
    expect(screen.getByLabelText('Meeting time')).not.toHaveAttribute(
      'aria-busy',
    );
  });

  it('renders status icon for error status', () => {
    render(
      <DateTimeInput
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
      <DateTimeInput
        label="Meeting"
        onChange={() => {}}
        status={{type: 'warning', message: 'Watch out'}}
      />,
    );
    expect(screen.getByRole('combobox')).not.toHaveAttribute('aria-invalid');
  });

  it('renders description and links via aria-describedby', () => {
    render(
      <DateTimeInput
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
      <DateTimeInput
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

  it('links the description to the time input via aria-describedby', () => {
    render(
      <DateTimeInput
        label="Meeting"
        description="Pick the meeting datetime"
        onChange={() => {}}
      />,
    );
    // The description covers both halves of the field, so the time input must
    // carry it too — a screen-reader user tabbing into the time half should
    // not lose the field's description.
    const timeInput = screen.getByLabelText('Meeting time');
    const describedBy = timeInput.getAttribute('aria-describedby')!;
    const ids = describedBy.split(' ');
    const found = ids.some(id =>
      document
        .getElementById(id)
        ?.textContent?.includes('Pick the meeting datetime'),
    );
    expect(found).toBe(true);
  });

  it('links the status message to the time input via aria-describedby', () => {
    render(
      <DateTimeInput
        label="Meeting"
        onChange={() => {}}
        status={{type: 'error', message: 'Invalid datetime'}}
      />,
    );
    const timeInput = screen.getByLabelText('Meeting time');
    const describedBy = timeInput.getAttribute('aria-describedby')!;
    const ids = describedBy.split(' ');
    const found = ids.some(id =>
      document.getElementById(id)?.textContent?.includes('Invalid datetime'),
    );
    expect(found).toBe(true);
  });

  it('links the disabled reason to the time input via aria-describedby', () => {
    HTMLElement.prototype.showPopover = vi.fn();
    HTMLElement.prototype.hidePopover = vi.fn();
    render(
      <DateTimeInput
        label="When"
        onChange={() => {}}
        isDisabled
        disabledMessage="You need the Editor role"
      />,
    );
    const timeInput = screen.getByLabelText('When time');
    const tooltip = screen.getByRole('tooltip', {hidden: true});
    expect(timeInput.getAttribute('aria-describedby')).toContain(tooltip.id);
  });

  it('handles Escape keydown on date input without error', () => {
    render(<DateTimeInput label="Meeting" onChange={() => {}} />);
    const input = screen.getByRole('combobox');
    fireEvent.keyDown(input, {key: 'Escape'});
  });

  // --- Date text input behavior ---

  it('calls onChange when valid date is typed', () => {
    const onChange = vi.fn();
    render(<DateTimeInput label="Meeting" onChange={onChange} />);

    const input = screen.getByRole('combobox');
    fireEvent.change(input, {target: {value: '03/15/2026'}});

    expect(onChange).toHaveBeenCalled();
    const calledValue = onChange.mock.calls[0][0] as string;
    expect(calledValue).toMatch(/^2026-03-15T/);
  });

  it('does not call onChange while typing invalid date', () => {
    const onChange = vi.fn();
    render(<DateTimeInput label="Meeting" onChange={onChange} />);

    const input = screen.getByRole('combobox');
    fireEvent.change(input, {target: {value: 'invalid'}});

    expect(onChange).not.toHaveBeenCalled();
  });

  it('reverts date input on blur when input is invalid', () => {
    const onChange = vi.fn();
    render(
      <DateTimeInput
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
    render(<DateTimeInput label="Meeting" onChange={onChange} />);

    const timeInput = screen.getByLabelText('Meeting time');
    fireEvent.change(timeInput, {target: {value: '3:45 pm'}});

    expect(onChange).not.toHaveBeenCalled();
  });

  it('calls onChange for time when date is already set', () => {
    const onChange = vi.fn();
    render(
      <DateTimeInput
        label="Meeting"
        value={'2026-03-15T10:00' as ISODateTimeString}
        onChange={onChange}
      />,
    );

    const timeInput = screen.getByLabelText('Meeting time');
    fireEvent.change(timeInput, {target: {value: '3:45 pm'}});

    expect(onChange).toHaveBeenCalledWith('2026-03-15T15:45');
  });

  it('renders with size="lg"', () => {
    render(
      <DateTimeInput label="Meeting time" onChange={() => {}} size="lg" />,
    );
    expect(screen.getByLabelText('Meeting time')).toBeInTheDocument();
  });

  describe('hasClear', () => {
    it('shows clear button when hasClear is true and value exists', () => {
      render(
        <DateTimeInput
          label="Meeting"
          value={'2026-03-15T14:30' as ISODateTimeString}
          onChange={() => {}}
          hasClear
        />,
      );
      expect(getButton('Clear Meeting')).toBeInTheDocument();
    });

    it('does not show clear button when value is undefined', () => {
      render(<DateTimeInput label="Meeting" onChange={() => {}} hasClear />);
      expect(queryButton('Clear Meeting')).not.toBeInTheDocument();
    });

    it('does not show clear button when hasClear is false', () => {
      render(
        <DateTimeInput
          label="Meeting"
          value={'2026-03-15T14:30' as ISODateTimeString}
          onChange={() => {}}
        />,
      );
      expect(queryButton('Clear Meeting')).not.toBeInTheDocument();
    });

    it('does not show clear button when disabled', () => {
      render(
        <DateTimeInput
          label="Meeting"
          value={'2026-03-15T14:30' as ISODateTimeString}
          onChange={() => {}}
          hasClear
          isDisabled
        />,
      );
      expect(queryButton('Clear Meeting')).not.toBeInTheDocument();
    });

    it('calls onChange with undefined when clear is clicked', () => {
      const onChange = vi.fn();
      render(
        <DateTimeInput
          label="Meeting"
          value={'2026-03-15T14:30' as ISODateTimeString}
          onChange={onChange}
          hasClear
        />,
      );
      fireEvent.click(getButton('Clear Meeting'));
      expect(onChange).toHaveBeenCalledWith(undefined);
    });
  });

  describe('external value changes', () => {
    it('clears pending date input when value changes externally', () => {
      const onChange = vi.fn();
      const {rerender} = render(
        <DateTimeInput
          label="Meeting"
          value={'2026-01-15T10:00' as ISODateTimeString}
          onChange={onChange}
        />,
      );

      const dateInput = screen.getByRole('combobox');
      expect(dateInput).toHaveValue('January 15, 2026');

      // User starts typing a new date
      fireEvent.change(dateInput, {target: {value: 'Feb'}});
      expect(dateInput).toHaveValue('Feb');

      // Value changes externally
      rerender(
        <DateTimeInput
          label="Meeting"
          value={'2026-03-20T10:00' as ISODateTimeString}
          onChange={onChange}
        />,
      );

      // Pending input should be cleared, showing the new formatted date
      expect(dateInput).toHaveValue('March 20, 2026');
    });
  });

  describe('invalid typed input feedback (WCAG 3.3.1)', () => {
    it('sets aria-invalid="true" on the date input when typed date is unparseable', () => {
      render(<DateTimeInput label="Meeting" onChange={() => {}} />);

      const dateInput = screen.getByRole('combobox');
      fireEvent.change(dateInput, {target: {value: '13/45/2024'}});

      expect(dateInput).toHaveAttribute('aria-invalid', 'true');
    });

    it('does not set aria-invalid on the date input when typed date is valid', () => {
      render(<DateTimeInput label="Meeting" onChange={() => {}} />);

      const dateInput = screen.getByRole('combobox');
      fireEvent.change(dateInput, {target: {value: '03/15/2026'}});

      expect(dateInput).not.toHaveAttribute('aria-invalid');
    });

    it('announces an alert message when the typed date is invalid', () => {
      render(<DateTimeInput label="Meeting" onChange={() => {}} />);

      const dateInput = screen.getByRole('combobox');
      fireEvent.change(dateInput, {target: {value: '13/45/2024'}});

      expect(screen.getByText('Invalid date')).toBeInTheDocument();
    });

    it('sets aria-invalid="true" on the time input when typed time is unparseable', () => {
      render(
        <DateTimeInput
          label="Meeting"
          value={'2026-03-15T10:00' as ISODateTimeString}
          onChange={() => {}}
        />,
      );

      const timeInput = screen.getByLabelText('Meeting time');
      fireEvent.change(timeInput, {target: {value: '99:99 zz'}});

      expect(timeInput).toHaveAttribute('aria-invalid', 'true');
    });

    it('does not set aria-invalid on the time input when typed time is valid', () => {
      render(
        <DateTimeInput
          label="Meeting"
          value={'2026-03-15T10:00' as ISODateTimeString}
          onChange={() => {}}
        />,
      );

      const timeInput = screen.getByLabelText('Meeting time');
      fireEvent.change(timeInput, {target: {value: '3:45 pm'}});

      expect(timeInput).not.toHaveAttribute('aria-invalid');
    });

    it('announces an alert message when the typed time is invalid', () => {
      render(
        <DateTimeInput
          label="Meeting"
          value={'2026-03-15T10:00' as ISODateTimeString}
          onChange={() => {}}
        />,
      );

      const timeInput = screen.getByLabelText('Meeting time');
      fireEvent.change(timeInput, {target: {value: '99:99 zz'}});

      expect(screen.getByText('Invalid time')).toBeInTheDocument();
    });
  });
  describe('disabledMessage', () => {
    // jsdom does not implement the Popover API used by the tooltip, so mock
    // showPopover/hidePopover to toggle a `popover-open` attribute the tests
    // can assert on.
    beforeEach(() => {
      HTMLElement.prototype.showPopover = vi.fn(function (this: HTMLElement) {
        this.setAttribute('popover-open', '');
      });
      HTMLElement.prototype.hidePopover = vi.fn(function (this: HTMLElement) {
        this.removeAttribute('popover-open');
      });
    });

    // jsdom popover content is in the DOM but not "visible" in the
    // accessibility tree; use hidden: true to find it.
    const h = {hidden: true} as const;

    it('shows the reason tooltip on hover when disabled with a reason', async () => {
      render(
        <DateTimeInput
          label="When"
          onChange={() => {}}
          isDisabled
          disabledMessage="You need the Editor role"
        />,
      );

      // The tooltip anchors on the outer row that wraps both inputs.
      const dateInput = screen.getByRole('combobox');
      const row = dateInput.parentElement?.parentElement as HTMLElement;
      const tooltip = screen.getByRole('tooltip', h);
      expect(tooltip).toHaveTextContent('You need the Editor role');

      fireEvent.mouseEnter(row);
      await waitFor(() => {
        expect(tooltip).toHaveAttribute('popover-open');
      });

      fireEvent.mouseLeave(row);
      await waitFor(() => {
        expect(tooltip).not.toHaveAttribute('popover-open');
      });
    });

    it('shows the reason tooltip on keyboard focus', async () => {
      const user = userEvent.setup();
      render(
        <DateTimeInput
          label="When"
          onChange={() => {}}
          isDisabled
          disabledMessage="You need the Editor role"
        />,
      );

      const tooltip = screen.getByRole('tooltip', h);
      await user.tab();
      expect(screen.getByRole('combobox')).toHaveFocus();
      await waitFor(() => {
        expect(tooltip).toHaveAttribute('popover-open');
      });
    });

    it('does not render a tooltip when not disabled', () => {
      render(
        <DateTimeInput
          label="When"
          onChange={() => {}}
          disabledMessage="You need the Editor role"
        />,
      );
      expect(screen.queryByRole('tooltip', h)).not.toBeInTheDocument();
    });

    it('does not render a tooltip when disabled without a reason', () => {
      render(<DateTimeInput label="When" onChange={() => {}} isDisabled />);
      expect(screen.queryByRole('tooltip', h)).not.toBeInTheDocument();
    });

    it('keeps both inputs focusable via aria-disabled when a reason is provided', () => {
      render(
        <DateTimeInput
          label="When"
          onChange={() => {}}
          isDisabled
          disabledMessage="You need the Editor role"
        />,
      );
      const dateInput = screen.getByRole('combobox');
      const timeInput = screen.getByLabelText('When time');
      expect(dateInput).not.toBeDisabled();
      expect(dateInput).toHaveAttribute('aria-disabled', 'true');
      expect(dateInput).toHaveAttribute('readonly');
      expect(timeInput).not.toBeDisabled();
      expect(timeInput).toHaveAttribute('aria-disabled', 'true');
      expect(timeInput).toHaveAttribute('readonly');
    });

    it('links the reason tooltip from the date input via aria-describedby', () => {
      render(
        <DateTimeInput
          label="When"
          onChange={() => {}}
          isDisabled
          disabledMessage="You need the Editor role"
        />,
      );
      const dateInput = screen.getByRole('combobox');
      const tooltip = screen.getByRole('tooltip', h);
      expect(dateInput.getAttribute('aria-describedby')).toContain(tooltip.id);
    });

    it('blocks value changes and opening while focusable-disabled', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <DateTimeInput
          label="When"
          onChange={onChange}
          isDisabled
          disabledMessage="You need the Editor role"
        />,
      );

      const dateInput = screen.getByRole('combobox');
      await user.click(dateInput);
      await user.type(dateInput, '2026-03-15');
      expect(dateInput).toHaveValue('');
      expect(dateInput).toHaveAttribute('aria-expanded', 'false');
      expect(onChange).not.toHaveBeenCalled();
    });

    it('remains natively disabled when disabled without a reason', () => {
      render(<DateTimeInput label="When" onChange={() => {}} isDisabled />);
      const dateInput = screen.getByRole('combobox');
      expect(dateInput).toBeDisabled();
      expect(dateInput).not.toHaveAttribute('aria-disabled');
    });

    it('does not swap in the time format-hint placeholder on focus while disabled', () => {
      render(
        <DateTimeInput
          label="When"
          onChange={() => {}}
          isDisabled
          disabledMessage="You need the Editor role"
        />,
      );
      const timeInput = screen.getByLabelText('When time');
      timeInput.focus();
      fireEvent.focus(timeInput);
      expect(timeInput).toHaveAttribute('placeholder', 'Select a time');
    });
  });

  describe('timeIncrement', () => {
    it('steps the time by timeIncrement minutes on ArrowUp', () => {
      const onChange = vi.fn();
      render(
        <DateTimeInput
          label="Meeting"
          value={'2026-03-15T14:30' as ISODateTimeString}
          timeIncrement={15}
          onChange={onChange}
        />,
      );

      const timeInput = screen.getByLabelText('Meeting time');
      fireEvent.keyDown(timeInput, {key: 'ArrowUp'});

      // 14:30 + 15min increment = 14:45
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange.mock.calls[0][0]).toContain('14:45');
    });

    it('defaults to a 1-minute increment', () => {
      const onChange = vi.fn();
      render(
        <DateTimeInput
          label="Meeting"
          value={'2026-03-15T14:30' as ISODateTimeString}
          onChange={onChange}
        />,
      );

      const timeInput = screen.getByLabelText('Meeting time');
      fireEvent.keyDown(timeInput, {key: 'ArrowUp'});

      // 14:30 + default 1min = 14:31
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange.mock.calls[0][0]).toContain('14:31');
    });
  });
});
