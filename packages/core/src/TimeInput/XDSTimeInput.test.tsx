/**
 * @file XDSTimeInput.test.tsx
 * @input Uses vitest, @testing-library/react, XDSTimeInput component
 * @output Unit tests for XDSTimeInput component behavior
 * @position Testing; validates XDSTimeInput.tsx implementation
 *
 * SYNC: When XDSTimeInput.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {XDSTimeInput} from './XDSTimeInput';
import type {ISOTimeString} from '../utils';

describe('XDSTimeInput', () => {
  it('renders with label', () => {
    render(<XDSTimeInput label="Time" onChange={() => {}} />);
    expect(screen.getByLabelText('Time')).toBeInTheDocument();
  });

  it('renders with placeholder', () => {
    render(
      <XDSTimeInput
        label="Time"
        onChange={() => {}}
        placeholder="Pick a time"
      />,
    );
    expect(screen.getByPlaceholderText('Pick a time')).toBeInTheDocument();
  });

  it('displays formatted time in 12h format', () => {
    render(
      <XDSTimeInput
        label="Time"
        value={'14:30' as ISOTimeString}
        onChange={() => {}}
      />,
    );
    expect(screen.getByDisplayValue('2:30 PM')).toBeInTheDocument();
  });

  it('displays formatted time in 24h format', () => {
    render(
      <XDSTimeInput
        label="Time"
        value={'14:30' as ISOTimeString}
        onChange={() => {}}
        hourFormat="24h"
      />,
    );
    expect(screen.getByDisplayValue('14:30')).toBeInTheDocument();
  });

  it('displays time with seconds', () => {
    render(
      <XDSTimeInput
        label="Time"
        value={'14:30:45' as ISOTimeString}
        onChange={() => {}}
        hasSeconds
      />,
    );
    expect(screen.getByDisplayValue('2:30:45 PM')).toBeInTheDocument();
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(<XDSTimeInput ref={ref} label="Time" onChange={() => {}} />);
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLInputElement));
  });

  it('visually hides label when isLabelHidden is true', () => {
    render(<XDSTimeInput label="Time" isLabelHidden onChange={() => {}} />);
    const label = screen.getByText('Time');
    expect(label).toBeInTheDocument();
    expect(screen.getByLabelText('Time')).toBeInTheDocument();
  });

  it('sets aria-required when isRequired is true', () => {
    render(<XDSTimeInput label="Time" isRequired onChange={() => {}} />);
    expect(screen.getByRole('spinbutton')).toHaveAttribute(
      'aria-required',
      'true',
    );
  });

  it('disables input when isDisabled is true', () => {
    render(<XDSTimeInput label="Time" isDisabled onChange={() => {}} />);
    expect(screen.getByRole('spinbutton')).toBeDisabled();
  });

  it('shows clear button when hasClear is true and value exists', () => {
    render(
      <XDSTimeInput
        label="Time"
        value={'14:30' as ISOTimeString}
        onChange={() => {}}
        hasClear
      />,
    );
    expect(
      screen.getByRole('button', {name: 'Clear time'}),
    ).toBeInTheDocument();
  });

  it('does not show clear button when value is empty', () => {
    render(<XDSTimeInput label="Time" onChange={() => {}} hasClear />);
    expect(
      screen.queryByRole('button', {name: 'Clear time'}),
    ).not.toBeInTheDocument();
  });

  it('calls onChange with undefined when clear button is clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <XDSTimeInput
        label="Time"
        value={'14:30' as ISOTimeString}
        onChange={onChange}
        hasClear
      />,
    );

    await user.click(screen.getByRole('button', {name: 'Clear time'}));
    expect(onChange).toHaveBeenCalledWith(undefined);
  });

  it('does not call onChange while typing invalid input', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<XDSTimeInput label="Time" onChange={onChange} />);

    const input = screen.getByRole('spinbutton');
    await user.type(input, 'invalid');

    // onChange should not be called while typing
    expect(onChange).not.toHaveBeenCalled();
  });

  it('reverts to previous value on blur when input is invalid', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <XDSTimeInput
        label="Time"
        value={'14:30' as ISOTimeString}
        onChange={onChange}
      />,
    );

    const input = screen.getByRole('spinbutton');
    await user.clear(input);
    await user.type(input, 'not a time');
    await user.tab(); // blur

    // Should revert to the original value, not call onChange
    expect(screen.getByDisplayValue('2:30 PM')).toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('calls onChange on blur when input is valid', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<XDSTimeInput label="Time" onChange={onChange} />);

    const input = screen.getByRole('spinbutton');
    await user.type(input, '3:45 pm');
    await user.tab(); // blur

    expect(onChange).toHaveBeenCalledWith('15:45');
  });

  it('calls onChange immediately when input becomes valid', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<XDSTimeInput label="Time" onChange={onChange} />);

    const input = screen.getByRole('spinbutton');
    await user.type(input, '3:45 pm');

    // onChange should be called immediately when input is valid, not waiting for blur
    expect(onChange).toHaveBeenCalledWith('15:45');
  });

  // --- Arrow key navigation ---

  it('increments time on ArrowUp', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <XDSTimeInput
        label="Time"
        value={'14:30' as ISOTimeString}
        onChange={onChange}
      />,
    );

    const input = screen.getByRole('spinbutton');
    await user.click(input);
    await user.keyboard('{ArrowUp}');

    expect(onChange).toHaveBeenCalledWith('14:31');
  });

  it('decrements time on ArrowDown', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <XDSTimeInput
        label="Time"
        value={'14:30' as ISOTimeString}
        onChange={onChange}
      />,
    );

    const input = screen.getByRole('spinbutton');
    await user.click(input);
    await user.keyboard('{ArrowDown}');

    expect(onChange).toHaveBeenCalledWith('14:29');
  });

  it('uses custom increment for arrow keys', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <XDSTimeInput
        label="Time"
        value={'14:30' as ISOTimeString}
        onChange={onChange}
        increment={15}
      />,
    );

    const input = screen.getByRole('spinbutton');
    await user.click(input);
    await user.keyboard('{ArrowUp}');

    expect(onChange).toHaveBeenCalledWith('14:45');
  });

  it('seeds from midnight when no value on arrow key', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<XDSTimeInput label="Time" onChange={onChange} />);

    const input = screen.getByRole('spinbutton');
    await user.click(input);
    await user.keyboard('{ArrowUp}');

    expect(onChange).toHaveBeenCalledWith('00:01');
  });

  it('clamps to max boundary on ArrowUp', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <XDSTimeInput
        label="Time"
        value={'16:55' as ISOTimeString}
        onChange={onChange}
        max={'17:00' as ISOTimeString}
        increment={15}
      />,
    );

    const input = screen.getByRole('spinbutton');
    await user.click(input);
    await user.keyboard('{ArrowUp}');

    expect(onChange).toHaveBeenCalledWith('17:00');
  });

  it('clamps to min boundary on ArrowDown', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <XDSTimeInput
        label="Time"
        value={'09:05' as ISOTimeString}
        onChange={onChange}
        min={'09:00' as ISOTimeString}
        increment={15}
      />,
    );

    const input = screen.getByRole('spinbutton');
    await user.click(input);
    await user.keyboard('{ArrowDown}');

    expect(onChange).toHaveBeenCalledWith('09:00');
  });

  // --- Enter and Escape ---

  it('commits pending input on Enter', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<XDSTimeInput label="Time" onChange={onChange} />);

    const input = screen.getByRole('spinbutton');
    await user.type(input, '3:45 pm');
    onChange.mockClear();
    await user.keyboard('{Enter}');

    // Input should be committed (cleared pending state)
    // The value was already committed via immediate validation,
    // Enter just finalizes the pending input state
    expect(input).toHaveValue('');
  });

  it('reverts pending input on Escape', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <XDSTimeInput
        label="Time"
        value={'14:30' as ISOTimeString}
        onChange={onChange}
      />,
    );

    const input = screen.getByRole('spinbutton');
    await user.clear(input);
    await user.type(input, 'garbage');
    await user.keyboard('{Escape}');

    // Should revert to the formatted value
    expect(screen.getByDisplayValue('2:30 PM')).toBeInTheDocument();
  });

  // --- isBusy behavior ---

  it('disables input during isBusy (isLoading)', () => {
    render(
      <XDSTimeInput
        label="Time"
        value={'14:30' as ISOTimeString}
        onChange={() => {}}
        isLoading
      />,
    );
    expect(screen.getByRole('spinbutton')).toBeDisabled();
  });

  it('hides clear button during isBusy', () => {
    render(
      <XDSTimeInput
        label="Time"
        value={'14:30' as ISOTimeString}
        onChange={() => {}}
        hasClear
        isLoading
      />,
    );
    expect(
      screen.queryByRole('button', {name: 'Clear time'}),
    ).not.toBeInTheDocument();
  });

  // --- role="spinbutton" ---

  it('has role="spinbutton" on input', () => {
    render(<XDSTimeInput label="Time" onChange={() => {}} />);
    expect(screen.getByRole('spinbutton')).toBeInTheDocument();
  });

  // --- hasSeconds mismatch normalization ---

  it('normalizes HH:MM value when hasSeconds is true', () => {
    render(
      <XDSTimeInput
        label="Time"
        value={'14:30' as ISOTimeString}
        onChange={() => {}}
        hasSeconds
      />,
    );
    expect(screen.getByDisplayValue('2:30:00 PM')).toBeInTheDocument();
  });

  it('normalizes HH:MM:SS value when hasSeconds is false', () => {
    render(
      <XDSTimeInput
        label="Time"
        value={'14:30:45' as ISOTimeString}
        onChange={() => {}}
      />,
    );
    // Should display without seconds
    expect(screen.getByDisplayValue('2:30 PM')).toBeInTheDocument();
  });

  // --- Focused format hint respects hasSeconds ---

  it('shows format hint with seconds when hasSeconds and focused', async () => {
    const user = userEvent.setup();
    render(
      <XDSTimeInput label="Time" onChange={() => {}} hasSeconds />,
    );

    const input = screen.getByRole('spinbutton');
    await user.click(input);

    expect(input).toHaveAttribute('placeholder', 'e.g., 2:30:00 PM');
  });

  it('shows format hint without seconds when focused', async () => {
    const user = userEvent.setup();
    render(<XDSTimeInput label="Time" onChange={() => {}} />);

    const input = screen.getByRole('spinbutton');
    await user.click(input);

    expect(input).toHaveAttribute('placeholder', 'e.g., 2:30 PM');
  });

  // --- aria attributes for spinbutton ---

  it('sets aria-valuenow from current value', () => {
    render(
      <XDSTimeInput
        label="Time"
        value={'14:30' as ISOTimeString}
        onChange={() => {}}
      />,
    );
    // 14*3600 + 30*60 = 52200
    expect(screen.getByRole('spinbutton')).toHaveAttribute(
      'aria-valuenow',
      '52200',
    );
  });

  it('sets aria-valuetext to the display value', () => {
    render(
      <XDSTimeInput
        label="Time"
        value={'14:30' as ISOTimeString}
        onChange={() => {}}
      />,
    );
    expect(screen.getByRole('spinbutton')).toHaveAttribute(
      'aria-valuetext',
      '2:30 PM',
    );
  });

  it('sets aria-valuemin and aria-valuemax from min/max props', () => {
    render(
      <XDSTimeInput
        label="Time"
        onChange={() => {}}
        min={'09:00' as ISOTimeString}
        max={'17:00' as ISOTimeString}
      />,
    );
    const input = screen.getByRole('spinbutton');
    // 9*3600 = 32400, 17*3600 = 61200
    expect(input).toHaveAttribute('aria-valuemin', '32400');
    expect(input).toHaveAttribute('aria-valuemax', '61200');
  });

  it('handles aria-valuemin/max with seconds correctly', () => {
    render(
      <XDSTimeInput
        label="Time"
        onChange={() => {}}
        min={'09:00:30' as ISOTimeString}
        max={'17:00:00' as ISOTimeString}
        hasSeconds
      />,
    );
    const input = screen.getByRole('spinbutton');
    // 9*3600 + 0*60 + 30 = 32430
    expect(input).toHaveAttribute('aria-valuemin', '32430');
    expect(input).toHaveAttribute('aria-valuemax', '61200');
  });

  // --- status and aria-invalid ---

  it('sets aria-invalid when status type is error', () => {
    render(
      <XDSTimeInput
        label="Time"
        onChange={() => {}}
        status={{type: 'error', message: 'Invalid time'}}
      />,
    );
    expect(screen.getByRole('spinbutton')).toHaveAttribute(
      'aria-invalid',
      'true',
    );
  });

  it('does not set aria-invalid for warning status', () => {
    render(
      <XDSTimeInput
        label="Time"
        onChange={() => {}}
        status={{type: 'warning', message: 'Check this'}}
      />,
    );
    expect(screen.getByRole('spinbutton')).not.toHaveAttribute('aria-invalid');
  });

  it('renders status message in the DOM', () => {
    render(
      <XDSTimeInput
        label="Time"
        onChange={() => {}}
        status={{type: 'error', message: 'Time is required'}}
      />,
    );
    expect(screen.getByText('Time is required')).toBeInTheDocument();
  });

  // --- aria-busy ---

  it('sets aria-busy when isLoading is true', () => {
    render(
      <XDSTimeInput
        label="Time"
        value={'14:30' as ISOTimeString}
        onChange={() => {}}
        isLoading
      />,
    );
    expect(screen.getByRole('spinbutton')).toHaveAttribute(
      'aria-busy',
      'true',
    );
  });

  // --- description and aria-describedby ---

  it('renders description text', () => {
    render(
      <XDSTimeInput
        label="Time"
        onChange={() => {}}
        description="Enter your preferred time"
      />,
    );
    expect(
      screen.getByText('Enter your preferred time'),
    ).toBeInTheDocument();
  });

  it('associates description with input via aria-describedby', () => {
    render(
      <XDSTimeInput
        label="Time"
        onChange={() => {}}
        description="Enter your preferred time"
      />,
    );
    const input = screen.getByRole('spinbutton');
    expect(input).toHaveAttribute('aria-describedby');
    const describedByID = input.getAttribute('aria-describedby')!;
    const description = document.getElementById(describedByID);
    expect(description).toHaveTextContent('Enter your preferred time');
  });

  // --- disabled prevents interaction ---

  it('does not call onChange when disabled and user types', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <XDSTimeInput
        label="Time"
        onChange={onChange}
        isDisabled
      />,
    );

    const input = screen.getByRole('spinbutton');
    await user.click(input);
    await user.type(input, '3:45 pm');
    expect(onChange).not.toHaveBeenCalled();
  });

  // --- clear button hidden when disabled ---

  it('does not show clear button when disabled even with value', () => {
    render(
      <XDSTimeInput
        label="Time"
        value={'14:30' as ISOTimeString}
        onChange={() => {}}
        hasClear
        isDisabled
      />,
    );
    expect(
      screen.queryByRole('button', {name: 'Clear time'}),
    ).not.toBeInTheDocument();
  });

  // --- min > max warning ---

  it('warns when min > max', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <XDSTimeInput
        label="Time"
        onChange={() => {}}
        min={'17:00' as ISOTimeString}
        max={'09:00' as ISOTimeString}
      />,
    );
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('`min`'),
      '17:00',
      '09:00',
    );
    warnSpy.mockRestore();
  });
});
