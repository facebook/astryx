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
    expect(screen.getByRole('combobox')).toHaveAttribute(
      'aria-required',
      'true',
    );
  });

  it('does not set aria-required when isRequired is false', () => {
    render(<XDSDateInput label="Date" onChange={() => {}} />);
    expect(screen.getByRole('combobox')).not.toHaveAttribute('aria-required');
  });

  it('sets disabled attribute when isDisabled is true', () => {
    render(<XDSDateInput label="Date" isDisabled onChange={() => {}} />);
    expect(screen.getByRole('combobox')).toBeDisabled();
  });

  it('is not disabled by default', () => {
    render(<XDSDateInput label="Date" onChange={() => {}} />);
    expect(screen.getByRole('combobox')).not.toBeDisabled();
  });

  it('renders calendar icon', () => {
    render(<XDSDateInput label="Date" onChange={() => {}} />);
    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('combobox input has aria-haspopup="dialog" attribute', () => {
    render(<XDSDateInput label="Date" onChange={() => {}} />);
    expect(screen.getByRole('combobox')).toHaveAttribute(
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

    const input = screen.getByRole('combobox');
    fireEvent.change(input, {target: {value: 'invalid'}});

    expect(onChange).not.toHaveBeenCalled();
  });

  it('reverts to previous value on blur when input is invalid', async () => {
    const onChange = vi.fn();
    render(
      <XDSDateInput label="Date" value="2026-01-25" onChange={onChange} />,
    );

    const input = screen.getByRole('combobox');
    fireEvent.change(input, {target: {value: 'not a date'}});
    fireEvent.blur(input);

    expect(screen.getByDisplayValue('January 25, 2026')).toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('calls onChange on blur when input is valid', async () => {
    const onChange = vi.fn();
    render(<XDSDateInput label="Date" onChange={onChange} />);

    const input = screen.getByRole('combobox');
    fireEvent.change(input, {target: {value: '03/15/2026'}});
    fireEvent.blur(input);

    expect(onChange).toHaveBeenCalledWith('2026-03-15');
  });

  it('calls onChange immediately when input becomes valid', async () => {
    const onChange = vi.fn();
    render(<XDSDateInput label="Date" onChange={onChange} />);

    const input = screen.getByRole('combobox');
    fireEvent.change(input, {target: {value: '03/15/2026'}});

    expect(onChange).toHaveBeenCalledWith('2026-03-15');
  });

  // --- P0: Text input respects min/max/dateConstraints ---

  it('does not call onChange when typed date is before min', () => {
    const onChange = vi.fn();
    render(
      <XDSDateInput
        label="Date"
        onChange={onChange}
        min="2026-03-01"
        max="2026-12-31"
      />,
    );

    const input = screen.getByRole('combobox');
    fireEvent.change(input, {target: {value: '02/15/2026'}});

    expect(onChange).not.toHaveBeenCalled();
  });

  it('does not call onChange when typed date is after max', () => {
    const onChange = vi.fn();
    render(
      <XDSDateInput
        label="Date"
        onChange={onChange}
        min="2026-01-01"
        max="2026-03-01"
      />,
    );

    const input = screen.getByRole('combobox');
    fireEvent.change(input, {target: {value: '04/15/2026'}});

    expect(onChange).not.toHaveBeenCalled();
  });

  it('does not call onChange when typed date fails dateConstraints', () => {
    const onChange = vi.fn();
    // Constraint: no weekends
    const noWeekends = (date: Date) =>
      date.getDay() !== 0 && date.getDay() !== 6;
    render(
      <XDSDateInput
        label="Date"
        onChange={onChange}
        dateConstraints={[noWeekends]}
      />,
    );

    const input = screen.getByRole('combobox');
    // 2026-03-15 is a Sunday
    fireEvent.change(input, {target: {value: '03/15/2026'}});

    expect(onChange).not.toHaveBeenCalled();
  });

  it('calls onChange when typed date is within min/max range', () => {
    const onChange = vi.fn();
    render(
      <XDSDateInput
        label="Date"
        onChange={onChange}
        min="2026-01-01"
        max="2026-12-31"
      />,
    );

    const input = screen.getByRole('combobox');
    fireEvent.change(input, {target: {value: '06/15/2026'}});

    expect(onChange).toHaveBeenCalledWith('2026-06-15');
  });

  it('reverts on blur when typed date violates constraints', () => {
    const onChange = vi.fn();
    render(
      <XDSDateInput
        label="Date"
        onChange={onChange}
        value="2026-03-10"
        min="2026-03-01"
        max="2026-03-31"
      />,
    );

    const input = screen.getByRole('combobox');
    fireEvent.change(input, {target: {value: '04/15/2026'}});
    fireEvent.blur(input);

    // Should revert to previous value
    expect(screen.getByDisplayValue('March 10, 2026')).toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  // --- P1: Input disabled during isBusy (isLoading) ---

  it('disables input and button when isLoading is true', () => {
    render(<XDSDateInput label="Date" isLoading onChange={() => {}} />);
    expect(screen.getByRole('combobox')).toBeDisabled();
    expect(screen.getByRole('button', {name: 'Open calendar'})).toBeDisabled();
  });

  it('shows spinner when isLoading is true', () => {
    const {container} = render(
      <XDSDateInput label="Date" isLoading onChange={() => {}} />,
    );
    // XDSSpinner renders with role="status" or an SVG animation
    const spinner = container.querySelector('[aria-busy="true"]');
    expect(spinner).toBeInTheDocument();
  });

  // --- P1: Escape key handler ---

  it('handles Escape keydown without error', () => {
    render(<XDSDateInput label="Date" onChange={() => {}} />);
    const input = screen.getByRole('combobox');

    // Escape should not throw even when popover isn't open.
    // Full popover open/close behavior tested in Storybook.
    fireEvent.keyDown(input, {key: 'Escape'});
  });

  // --- P2: Input has role="combobox" ---

  it('input has role="combobox"', () => {
    render(<XDSDateInput label="Date" onChange={() => {}} />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('input has aria-expanded attribute', () => {
    render(<XDSDateInput label="Date" onChange={() => {}} />);
    expect(screen.getByRole('combobox')).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  it('input has aria-haspopup="dialog"', () => {
    render(<XDSDateInput label="Date" onChange={() => {}} />);
    expect(screen.getByRole('combobox')).toHaveAttribute(
      'aria-haspopup',
      'dialog',
    );
  });

  // --- P1: Tab order input-first, button-second ---

  it('renders input before button in DOM order', () => {
    const {container} = render(
      <XDSDateInput label="Date" onChange={() => {}} />,
    );
    const input = container.querySelector('input');
    const button = container.querySelector('button');
    // Input should come before button in the DOM
    expect(input!.compareDocumentPosition(button!)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
  });

  // --- P2: Status rendering ---

  it('renders status icon for error status', () => {
    render(
      <XDSDateInput
        label="Date"
        onChange={() => {}}
        status={{type: 'error', message: 'Bad date'}}
      />,
    );
    expect(screen.getByRole('combobox')).toHaveAttribute(
      'aria-invalid',
      'true',
    );
  });

  it('renders status icon for warning status', () => {
    render(
      <XDSDateInput
        label="Date"
        onChange={() => {}}
        status={{type: 'warning', message: 'Watch out'}}
      />,
    );
    // Should not be aria-invalid for warnings
    expect(screen.getByRole('combobox')).not.toHaveAttribute('aria-invalid');
  });

  it('renders status icon for success status', () => {
    render(
      <XDSDateInput
        label="Date"
        onChange={() => {}}
        status={{type: 'success', message: 'Looks good'}}
      />,
    );
    expect(screen.getByRole('combobox')).not.toHaveAttribute('aria-invalid');
  });

  // --- P1: Description and aria-describedby ---

  it('renders description and links via aria-describedby', () => {
    render(
      <XDSDateInput
        label="Date"
        description="Pick your preferred date"
        onChange={() => {}}
      />,
    );
    const input = screen.getByRole('combobox');
    expect(screen.getByText('Pick your preferred date')).toBeInTheDocument();
    expect(input).toHaveAttribute('aria-describedby');
    const describedBy = input.getAttribute('aria-describedby')!;
    const descEl = document.getElementById(describedBy);
    expect(descEl).toHaveTextContent('Pick your preferred date');
  });

  it('links status message via aria-describedby', () => {
    render(
      <XDSDateInput
        label="Date"
        onChange={() => {}}
        status={{type: 'error', message: 'Invalid date'}}
      />,
    );
    const input = screen.getByRole('combobox');
    const describedBy = input.getAttribute('aria-describedby')!;
    const ids = describedBy.split(' ');
    const found = ids.some(id => {
      const el = document.getElementById(id);
      return el?.textContent?.includes('Invalid date');
    });
    expect(found).toBe(true);
  });

  // --- P1: Clearing value on empty blur ---

  it('calls onChange with undefined when input is cleared and blurred', () => {
    const onChange = vi.fn();
    render(
      <XDSDateInput label="Date" value="2026-01-25" onChange={onChange} />,
    );

    const input = screen.getByRole('combobox');
    fireEvent.change(input, {target: {value: ''}});
    fireEvent.blur(input);

    expect(onChange).toHaveBeenCalledWith(undefined);
  });

  // --- P1: Disabled prevents onChange ---

  it('disables input when isDisabled is true', () => {
    render(<XDSDateInput label="Date" isDisabled onChange={() => {}} />);

    const input = screen.getByRole('combobox');
    expect(input).toBeDisabled();
  });

  // --- P1: aria-busy on input ---

  it('sets aria-busy on input when isLoading is true', () => {
    render(<XDSDateInput label="Date" isLoading onChange={() => {}} />);
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-busy', 'true');
  });

  it('does not set aria-busy when not loading', () => {
    render(<XDSDateInput label="Date" onChange={() => {}} />);
    expect(screen.getByRole('combobox')).not.toHaveAttribute('aria-busy');
  });

  // --- P1: Popover does not open when disabled ---

  it('does not open popover when clicking calendar button while disabled', () => {
    render(<XDSDateInput label="Date" isDisabled onChange={() => {}} />);
    const button = screen.getByRole('button', {name: 'Open calendar'});
    fireEvent.click(button);
    expect(screen.getByRole('combobox')).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  // --- Enter key commits typed date ---

  it('commits typed date and fires onChange on Enter key', () => {
    const onChange = vi.fn();
    render(<XDSDateInput label="Date" onChange={onChange} />);

    const input = screen.getByRole('combobox');
    fireEvent.change(input, {target: {value: '03/15/2026'}});
    onChange.mockClear();
    fireEvent.keyDown(input, {key: 'Enter'});

    expect(onChange).toHaveBeenCalledWith('2026-03-15');
  });

  // --- Arrow-down opens calendar popover ---

  // Note: Tests involving popover rendering (show/hide with calendar)
  // are limited because jsdom doesn't support the Popover API.
  // Full popover interaction is tested in the browser via Storybook.

  describe('hasClear', () => {
    it('shows clear button when hasClear is true and value exists', () => {
      render(
        <XDSDateInput
          label="Date"
          value="2026-01-15"
          onChange={() => {}}
          hasClear
        />,
      );
      expect(
        screen.getByRole('button', {name: 'Clear Date'}),
      ).toBeInTheDocument();
    });

    it('does not show clear button when value is undefined', () => {
      render(<XDSDateInput label="Date" onChange={() => {}} hasClear />);
      expect(
        screen.queryByRole('button', {name: 'Clear Date'}),
      ).not.toBeInTheDocument();
    });

    it('does not show clear button when hasClear is false', () => {
      render(
        <XDSDateInput label="Date" value="2026-01-15" onChange={() => {}} />,
      );
      expect(
        screen.queryByRole('button', {name: 'Clear Date'}),
      ).not.toBeInTheDocument();
    });

    it('does not show clear button when disabled', () => {
      render(
        <XDSDateInput
          label="Date"
          value="2026-01-15"
          onChange={() => {}}
          hasClear
          isDisabled
        />,
      );
      expect(
        screen.queryByRole('button', {name: 'Clear Date'}),
      ).not.toBeInTheDocument();
    });

    it('calls onChange with undefined when clear is clicked', () => {
      const onChange = vi.fn();
      render(
        <XDSDateInput
          label="Date"
          value="2026-01-15"
          onChange={onChange}
          hasClear
        />,
      );
      fireEvent.click(screen.getByRole('button', {name: 'Clear Date'}));
      expect(onChange).toHaveBeenCalledWith(undefined);
    });
  });
});
