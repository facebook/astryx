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
    expect(screen.getByRole('textbox')).toHaveAttribute(
      'aria-required',
      'true',
    );
  });

  it('disables input when isDisabled is true', () => {
    render(<XDSTimeInput label="Time" isDisabled onChange={() => {}} />);
    expect(screen.getByRole('textbox')).toBeDisabled();
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
      screen.getByRole('button', {name: 'Clear Time'}),
    ).toBeInTheDocument();
  });

  it('does not show clear button when value is empty', () => {
    render(<XDSTimeInput label="Time" onChange={() => {}} hasClear />);
    expect(
      screen.queryByRole('button', {name: 'Clear Time'}),
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

    await user.click(screen.getByRole('button', {name: 'Clear Time'}));
    expect(onChange).toHaveBeenCalledWith(undefined);
  });

  it('does not call onChange while typing invalid input', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<XDSTimeInput label="Time" onChange={onChange} />);

    const input = screen.getByRole('textbox');
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

    const input = screen.getByRole('textbox');
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

    const input = screen.getByRole('textbox');
    await user.type(input, '3:45 pm');
    await user.tab(); // blur

    expect(onChange).toHaveBeenCalledWith('15:45');
  });

  it('calls onChange immediately when input becomes valid', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<XDSTimeInput label="Time" onChange={onChange} />);

    const input = screen.getByRole('textbox');
    await user.type(input, '3:45 pm');

    // onChange should be called immediately when input is valid, not waiting for blur
    expect(onChange).toHaveBeenCalledWith('15:45');
  });
});
