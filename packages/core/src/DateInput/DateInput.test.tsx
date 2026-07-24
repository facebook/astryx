// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file DateInput.test.tsx
 * @input Uses vitest, @testing-library/react, DateInput component
 * @output Unit tests for DateInput component behavior
 * @position Testing; validates DateInput.tsx implementation
 *
 * SYNC: When DateInput.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, vi, beforeEach} from 'vitest';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {getButton, queryButton} from '../__tests__/fastRoleQueries';
import {DateInput} from './DateInput';
import {InputGroup} from '../InputGroup';
import {InputGroupText} from '../InputGroup/InputGroupText';

describe('DateInput', () => {
  it('renders with label', () => {
    render(<DateInput label="Date" onChange={() => {}} />);
    expect(screen.getByLabelText('Date')).toBeInTheDocument();
  });

  it('renders with placeholder', () => {
    render(
      <DateInput label="Date" onChange={() => {}} placeholder="Pick a date" />,
    );
    expect(screen.getByPlaceholderText('Pick a date')).toBeInTheDocument();
  });

  it('displays formatted date when value is provided', () => {
    render(<DateInput label="Date" value="2026-01-25" onChange={() => {}} />);
    expect(screen.getByDisplayValue('January 25, 2026')).toBeInTheDocument();
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(<DateInput ref={ref} label="Date" onChange={() => {}} />);
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLInputElement));
  });

  it('visually hides label when isLabelHidden is true', () => {
    render(<DateInput label="Date" isLabelHidden onChange={() => {}} />);
    const label = screen.getByText('Date');
    expect(label).toBeInTheDocument();
    expect(screen.getByLabelText('Date')).toBeInTheDocument();
  });

  it('shows label visually by default', () => {
    render(<DateInput label="Event date" onChange={() => {}} />);
    const label = screen.getByText('Event date');
    expect(label).toBeVisible();
  });

  it('sets aria-required when isRequired is true', () => {
    render(<DateInput label="Date" isRequired onChange={() => {}} />);
    expect(screen.getByRole('combobox')).toHaveAttribute(
      'aria-required',
      'true',
    );
  });

  it('does not set aria-required when isRequired is false', () => {
    render(<DateInput label="Date" onChange={() => {}} />);
    expect(screen.getByRole('combobox')).not.toHaveAttribute('aria-required');
  });

  it('sets disabled attribute when isDisabled is true', () => {
    render(<DateInput label="Date" isDisabled onChange={() => {}} />);
    expect(screen.getByRole('combobox')).toBeDisabled();
  });

  it('is not disabled by default', () => {
    render(<DateInput label="Date" onChange={() => {}} />);
    expect(screen.getByRole('combobox')).not.toBeDisabled();
  });

  it('renders calendar icon', () => {
    render(<DateInput label="Date" onChange={() => {}} />);
    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('combobox input has aria-haspopup="dialog" attribute', () => {
    render(<DateInput label="Date" onChange={() => {}} />);
    expect(screen.getByRole('combobox')).toHaveAttribute(
      'aria-haspopup',
      'dialog',
    );
  });

  it('calendar button is focusable and clickable', () => {
    render(<DateInput label="Date" onChange={() => {}} />);
    const button = getButton('Open calendar');
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
  });

  it('calendar button is disabled when isDisabled is true', () => {
    render(<DateInput label="Date" isDisabled onChange={() => {}} />);
    const button = getButton('Open calendar');
    expect(button).toBeDisabled();
  });

  it('does not call onChange while typing invalid input', async () => {
    const onChange = vi.fn();
    render(<DateInput label="Date" onChange={onChange} />);

    const input = screen.getByRole('combobox');
    fireEvent.change(input, {target: {value: 'invalid'}});

    expect(onChange).not.toHaveBeenCalled();
  });

  it('sets aria-invalid="true" when typed input is unparseable', () => {
    render(<DateInput label="Date" onChange={() => {}} />);

    const input = screen.getByRole('combobox');
    fireEvent.change(input, {target: {value: '13/45/2024'}});

    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('does not set aria-invalid when typed input is a valid date', () => {
    render(<DateInput label="Date" onChange={() => {}} />);

    const input = screen.getByRole('combobox');
    fireEvent.change(input, {target: {value: '03/15/2026'}});

    expect(input).not.toHaveAttribute('aria-invalid');
  });

  it('announces an alert message when typed input is invalid', () => {
    // Scope to the component's own container: the embedded Calendar uses the
    // shared `useAnnounce` hook, whose global polite/assertive live-region pair
    // (both mounted on document.body by any announce) would otherwise make a
    // document-wide `getByRole('alert')` ambiguous.
    const {container} = render(<DateInput label="Date" onChange={() => {}} />);

    const input = screen.getByRole('combobox');
    fireEvent.change(input, {target: {value: '13/45/2024'}});

    expect(within(container).getByRole('alert')).toHaveTextContent(
      'Invalid date',
    );
  });

  it('does not announce an alert message when input is valid', () => {
    const {container} = render(<DateInput label="Date" onChange={() => {}} />);

    const input = screen.getByRole('combobox');
    fireEvent.change(input, {target: {value: '03/15/2026'}});

    expect(within(container).getByRole('alert')).toHaveTextContent('');
    expect(screen.queryByText('Invalid date')).not.toBeInTheDocument();
  });

  it('reverts to previous value on blur when input is invalid', async () => {
    const onChange = vi.fn();
    render(<DateInput label="Date" value="2026-01-25" onChange={onChange} />);

    const input = screen.getByRole('combobox');
    fireEvent.change(input, {target: {value: 'not a date'}});
    fireEvent.blur(input);

    expect(screen.getByDisplayValue('January 25, 2026')).toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('calls onChange on blur when input is valid', async () => {
    const onChange = vi.fn();
    render(<DateInput label="Date" onChange={onChange} />);

    const input = screen.getByRole('combobox');
    fireEvent.change(input, {target: {value: '03/15/2026'}});
    fireEvent.blur(input);

    expect(onChange).toHaveBeenCalledWith('2026-03-15');
  });

  it('calls onChange immediately when input becomes valid', async () => {
    const onChange = vi.fn();
    render(<DateInput label="Date" onChange={onChange} />);

    const input = screen.getByRole('combobox');
    fireEvent.change(input, {target: {value: '03/15/2026'}});

    expect(onChange).toHaveBeenCalledWith('2026-03-15');
  });

  // --- P0: Text input respects min/max/dateConstraints ---

  it('does not call onChange when typed date is before min', () => {
    const onChange = vi.fn();
    render(
      <DateInput
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
      <DateInput
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
      <DateInput
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
      <DateInput
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
      <DateInput
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
    render(<DateInput label="Date" isLoading onChange={() => {}} />);
    expect(screen.getByRole('combobox')).toBeDisabled();
    expect(getButton('Open calendar')).toBeDisabled();
  });

  it('shows spinner when isLoading is true', () => {
    const {container} = render(
      <DateInput label="Date" isLoading onChange={() => {}} />,
    );
    // Spinner renders with role="status" or an SVG animation
    const spinner = container.querySelector('[aria-busy="true"]');
    expect(spinner).toBeInTheDocument();
  });

  // --- P1: Escape key handler ---

  it('handles Escape keydown without error', () => {
    render(<DateInput label="Date" onChange={() => {}} />);
    const input = screen.getByRole('combobox');

    // Escape should not throw even when popover isn't open.
    // Full popover open/close behavior tested in Storybook.
    fireEvent.keyDown(input, {key: 'Escape'});
  });

  // --- P2: Input has role="combobox" ---

  it('input has role="combobox"', () => {
    render(<DateInput label="Date" onChange={() => {}} />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('input has aria-expanded attribute', () => {
    render(<DateInput label="Date" onChange={() => {}} />);
    expect(screen.getByRole('combobox')).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  it('opens the calendar popover on ArrowDown (keyboard, forms-13)', () => {
    render(<DateInput label="Date" onChange={() => {}} />);
    const input = screen.getByRole('combobox');
    expect(input).toHaveAttribute('aria-expanded', 'false');
    fireEvent.keyDown(input, {key: 'ArrowDown'});
    expect(input).toHaveAttribute('aria-expanded', 'true');
  });

  it('opens the calendar popover on Alt+ArrowDown (keyboard, forms-13)', () => {
    render(<DateInput label="Date" onChange={() => {}} />);
    const input = screen.getByRole('combobox');
    fireEvent.keyDown(input, {key: 'ArrowDown', altKey: true});
    expect(input).toHaveAttribute('aria-expanded', 'true');
  });

  it('does not open on ArrowDown when disabled', () => {
    render(<DateInput label="Date" isDisabled onChange={() => {}} />);
    const input = screen.getByRole('combobox');
    fireEvent.keyDown(input, {key: 'ArrowDown'});
    expect(input).toHaveAttribute('aria-expanded', 'false');
  });

  it('input has aria-haspopup="dialog"', () => {
    render(<DateInput label="Date" onChange={() => {}} />);
    expect(screen.getByRole('combobox')).toHaveAttribute(
      'aria-haspopup',
      'dialog',
    );
  });

  // --- P1: Tab order: calendar button first, then input ---

  it('renders calendar button before input in DOM order', () => {
    const {container} = render(<DateInput label="Date" onChange={() => {}} />);
    const input = container.querySelector('input');
    const button = container.querySelector('button');
    // Calendar button should come before input in the DOM
    expect(button!.compareDocumentPosition(input!)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
  });

  // --- P2: Status rendering ---

  it('renders status icon for error status', () => {
    render(
      <DateInput
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
      <DateInput
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
      <DateInput
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
      <DateInput
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
      <DateInput
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
    render(<DateInput label="Date" value="2026-01-25" onChange={onChange} />);

    const input = screen.getByRole('combobox');
    fireEvent.change(input, {target: {value: ''}});
    fireEvent.blur(input);

    expect(onChange).toHaveBeenCalledWith(undefined);
  });

  // --- P1: Disabled prevents onChange ---

  it('disables input when isDisabled is true', () => {
    render(<DateInput label="Date" isDisabled onChange={() => {}} />);

    const input = screen.getByRole('combobox');
    expect(input).toBeDisabled();
  });

  // --- P1: aria-busy on input ---

  it('sets aria-busy on input when isLoading is true', () => {
    render(<DateInput label="Date" isLoading onChange={() => {}} />);
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-busy', 'true');
  });

  it('does not set aria-busy when not loading', () => {
    render(<DateInput label="Date" onChange={() => {}} />);
    expect(screen.getByRole('combobox')).not.toHaveAttribute('aria-busy');
  });

  // --- P1: Popover does not open when disabled ---

  it('does not open popover when clicking calendar button while disabled', () => {
    render(<DateInput label="Date" isDisabled onChange={() => {}} />);
    const button = getButton('Open calendar');
    fireEvent.click(button);
    expect(screen.getByRole('combobox')).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  // --- Enter key commits typed date ---

  it('commits typed date and fires onChange on Enter key', () => {
    const onChange = vi.fn();
    render(<DateInput label="Date" onChange={onChange} />);

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
        <DateInput
          label="Date"
          value="2026-01-15"
          onChange={() => {}}
          hasClear
        />,
      );
      expect(getButton('Clear Date')).toBeInTheDocument();
    });

    it('does not show clear button when value is undefined', () => {
      render(<DateInput label="Date" onChange={() => {}} hasClear />);
      expect(queryButton('Clear Date')).not.toBeInTheDocument();
    });

    it('does not show clear button when hasClear is false', () => {
      render(<DateInput label="Date" value="2026-01-15" onChange={() => {}} />);
      expect(queryButton('Clear Date')).not.toBeInTheDocument();
    });

    it('does not show clear button when disabled', () => {
      render(
        <DateInput
          label="Date"
          value="2026-01-15"
          onChange={() => {}}
          hasClear
          isDisabled
        />,
      );
      expect(queryButton('Clear Date')).not.toBeInTheDocument();
    });

    it('calls onChange with undefined when clear is clicked', () => {
      const onChange = vi.fn();
      render(
        <DateInput
          label="Date"
          value="2026-01-15"
          onChange={onChange}
          hasClear
        />,
      );
      fireEvent.click(getButton('Clear Date'));
      expect(onChange).toHaveBeenCalledWith(undefined);
    });
  });

  // --- Regression: in-progress / leading-zero input must not crash ---

  describe('incomplete typed input', () => {
    it('does not crash or fire onChange when first digit typed is 0', () => {
      const onChange = vi.fn();
      render(<DateInput label="Date" onChange={onChange} />);

      const input = screen.getByRole('combobox');
      // Typing a leading "0" (e.g. starting "01" for January) must be treated
      // as incomplete input, not coerced into an (invalid) date that crashes.
      expect(() =>
        fireEvent.change(input, {target: {value: '0'}}),
      ).not.toThrow();

      expect(onChange).not.toHaveBeenCalled();
      expect(input).toHaveValue('0');
    });

    it('does not crash or fire onChange when first digit typed is 1', () => {
      const onChange = vi.fn();
      render(<DateInput label="Date" onChange={onChange} />);

      const input = screen.getByRole('combobox');
      expect(() =>
        fireEvent.change(input, {target: {value: '1'}}),
      ).not.toThrow();

      expect(onChange).not.toHaveBeenCalled();
      expect(input).toHaveValue('1');
    });

    it('does not crash while progressively typing a numeric date', () => {
      const onChange = vi.fn();
      render(<DateInput label="Date" onChange={onChange} />);

      const input = screen.getByRole('combobox');
      // Simulate keystroke-by-keystroke entry of "01/15/2026". The leading
      // single-digit keystrokes must not crash (the original bug).
      for (const partial of ['0', '01', '01/', '01/1', '01/15', '01/15/']) {
        expect(() =>
          fireEvent.change(input, {target: {value: partial}}),
        ).not.toThrow();
      }

      // Completing the date commits it without error.
      expect(() =>
        fireEvent.change(input, {target: {value: '01/15/2026'}}),
      ).not.toThrow();
      expect(onChange).toHaveBeenCalledWith('2026-01-15');
    });

    it('does not crash on blur after typing an incomplete value', () => {
      const onChange = vi.fn();
      render(<DateInput label="Date" onChange={onChange} />);

      const input = screen.getByRole('combobox');
      fireEvent.change(input, {target: {value: '0'}});
      expect(() => fireEvent.blur(input)).not.toThrow();
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('external value changes', () => {
    it('clears pending input when value changes externally', () => {
      const onChange = vi.fn();
      const {rerender} = render(
        <DateInput label="Date" value="2026-01-15" onChange={onChange} />,
      );

      const input = screen.getByRole('combobox');
      expect(input).toHaveValue('January 15, 2026');

      // User starts typing — sets pending input
      fireEvent.change(input, {target: {value: 'Feb'}});
      expect(input).toHaveValue('Feb');

      // Value changes externally (e.g. parent resets the date)
      rerender(
        <DateInput label="Date" value="2026-03-20" onChange={onChange} />,
      );

      // Pending input should be cleared, showing the new formatted value
      expect(input).toHaveValue('March 20, 2026');
    });
  });

  describe('InputGroup', () => {
    it('uses group ARIA and skips standalone Field chrome when grouped', () => {
      render(
        <InputGroup
          label="Availability"
          description="Choose a start date"
          status={{type: 'error', message: 'Date is required'}}>
          <InputGroupText>Starts</InputGroupText>
          <DateInput label="Date" isLabelHidden onChange={() => {}} />
        </InputGroup>,
      );

      const group = screen.getByRole('group', {name: 'Availability'});
      const input = screen.getByRole('combobox', {
        name: 'Availability Date',
      });

      expect(document.querySelectorAll('.astryx-field')).toHaveLength(1);
      expect(input).toHaveAttribute('aria-labelledby');
      expect(input.getAttribute('aria-labelledby')).toContain(
        group.getAttribute('aria-labelledby'),
      );
      expect(input).toHaveAttribute(
        'aria-describedby',
        group.getAttribute('aria-describedby'),
      );
      expect(input).not.toHaveAttribute('aria-invalid');
      expect(screen.getByText('Date is required')).toBeInTheDocument();
    });

    it('preserves disabledMessage tooltip wiring when grouped', () => {
      render(
        <InputGroup label="Availability">
          <InputGroupText>Starts</InputGroupText>
          <DateInput
            label="Date"
            isLabelHidden
            isDisabled
            disabledMessage="Scheduling is locked"
            onChange={() => {}}
          />
        </InputGroup>,
      );

      const input = screen.getByRole('combobox', {name: 'Availability Date'});
      const tooltip = screen.getByRole('tooltip', {hidden: true});

      expect(input).not.toBeDisabled();
      expect(input).toHaveAttribute('aria-disabled', 'true');
      expect(input.getAttribute('aria-describedby')).toContain(tooltip.id);
      expect(tooltip).toHaveTextContent('Scheduling is locked');
      expect(getButton('Open calendar')).toBeDisabled();
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
        <DateInput
          label="Date"
          isDisabled
          disabledMessage="You need the Editor role"
        />,
      );

      const container = screen.getByRole('combobox')
        .parentElement as HTMLElement;
      const tooltip = screen.getByRole('tooltip', h);
      expect(tooltip).toHaveTextContent('You need the Editor role');

      fireEvent.mouseEnter(container);
      await waitFor(() => {
        expect(tooltip).toHaveAttribute('popover-open');
      });

      fireEvent.mouseLeave(container);
      await waitFor(() => {
        expect(tooltip).not.toHaveAttribute('popover-open');
      });
    });

    it('shows the reason tooltip on keyboard focus', async () => {
      const user = userEvent.setup();
      render(
        <DateInput
          label="Date"
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
        <DateInput label="Date" disabledMessage="You need the Editor role" />,
      );
      expect(screen.queryByRole('tooltip', h)).not.toBeInTheDocument();
    });

    it('does not render a tooltip when disabled without a reason', () => {
      render(<DateInput label="Date" isDisabled />);
      expect(screen.queryByRole('tooltip', h)).not.toBeInTheDocument();
    });

    it('keeps the input focusable via aria-disabled when a reason is provided', () => {
      render(
        <DateInput
          label="Date"
          isDisabled
          disabledMessage="You need the Editor role"
        />,
      );
      const input = screen.getByRole('combobox');
      expect(input).not.toBeDisabled();
      expect(input).toHaveAttribute('aria-disabled', 'true');
      expect(input).toHaveAttribute('readonly');
    });

    it('links the reason tooltip from the input via aria-describedby', () => {
      render(
        <DateInput
          label="Date"
          isDisabled
          disabledMessage="You need the Editor role"
        />,
      );
      const input = screen.getByRole('combobox');
      const tooltip = screen.getByRole('tooltip', h);
      expect(input.getAttribute('aria-describedby')).toContain(tooltip.id);
    });

    it('blocks value changes and opening while focusable-disabled', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <DateInput
          label="Date"
          onChange={onChange}
          isDisabled
          disabledMessage="You need the Editor role"
        />,
      );

      const input = screen.getByRole('combobox');
      await user.click(input);
      await user.type(input, '2026-03-15');
      expect(input).toHaveValue('');
      expect(input).toHaveAttribute('aria-expanded', 'false');
      expect(onChange).not.toHaveBeenCalled();
    });

    it('remains natively disabled when disabled without a reason', () => {
      render(<DateInput label="Date" isDisabled />);
      const input = screen.getByRole('combobox');
      expect(input).toBeDisabled();
      expect(input).not.toHaveAttribute('aria-disabled');
    });
  });
});
