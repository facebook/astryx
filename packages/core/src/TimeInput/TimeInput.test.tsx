// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file TimeInput.test.tsx
 * @input Uses vitest, @testing-library/react, TimeInput component
 * @output Unit tests for TimeInput component behavior
 * @position Testing; validates TimeInput.tsx implementation
 *
 * SYNC: When TimeInput.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, vi, beforeEach} from 'vitest';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {TimeInput} from './TimeInput';
import type {ISOTimeString} from '../utils';

describe('TimeInput', () => {
  it('renders with label', () => {
    render(<TimeInput label="Time" onChange={() => {}} />);
    expect(screen.getByLabelText('Time')).toBeInTheDocument();
  });

  it('renders with placeholder', () => {
    render(
      <TimeInput label="Time" onChange={() => {}} placeholder="Pick a time" />,
    );
    expect(screen.getByPlaceholderText('Pick a time')).toBeInTheDocument();
  });

  it('displays formatted time in 12h format', () => {
    render(
      <TimeInput
        label="Time"
        value={'14:30' as ISOTimeString}
        onChange={() => {}}
      />,
    );
    expect(screen.getByDisplayValue('2:30 PM')).toBeInTheDocument();
  });

  it('displays formatted time in 24h format', () => {
    render(
      <TimeInput
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
      <TimeInput
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
    render(<TimeInput ref={ref} label="Time" onChange={() => {}} />);
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLInputElement));
  });

  it('visually hides label when isLabelHidden is true', () => {
    render(<TimeInput label="Time" isLabelHidden onChange={() => {}} />);
    const label = screen.getByText('Time');
    expect(label).toBeInTheDocument();
    expect(screen.getByLabelText('Time')).toBeInTheDocument();
  });

  it('sets aria-required when isRequired is true', () => {
    render(<TimeInput label="Time" isRequired onChange={() => {}} />);
    expect(screen.getByRole('textbox')).toHaveAttribute(
      'aria-required',
      'true',
    );
  });

  it('disables input when isDisabled is true', () => {
    render(<TimeInput label="Time" isDisabled onChange={() => {}} />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('shows clear button when hasClear is true and value exists', () => {
    render(
      <TimeInput
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
    render(<TimeInput label="Time" onChange={() => {}} hasClear />);
    expect(
      screen.queryByRole('button', {name: 'Clear Time'}),
    ).not.toBeInTheDocument();
  });

  it('calls onChange with undefined when clear button is clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <TimeInput
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
    render(<TimeInput label="Time" onChange={onChange} />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'invalid');

    // onChange should not be called while typing
    expect(onChange).not.toHaveBeenCalled();
  });

  it('reverts to previous value on blur when input is invalid', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <TimeInput
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
    render(<TimeInput label="Time" onChange={onChange} />);

    const input = screen.getByRole('textbox');
    await user.type(input, '3:45 pm');
    await user.tab(); // blur

    expect(onChange).toHaveBeenCalledWith('15:45');
  });

  it('calls onChange immediately when input becomes valid', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TimeInput label="Time" onChange={onChange} />);

    const input = screen.getByRole('textbox');
    await user.type(input, '3:45 pm');

    // onChange should be called immediately when input is valid, not waiting for blur
    expect(onChange).toHaveBeenCalledWith('15:45');
  });

  it('focuses input when clicking the clock icon', () => {
    render(<TimeInput label="Time" onChange={() => {}} />);

    const input = screen.getByRole('textbox');
    const wrapper = input.parentElement!;
    // The icon container is the first child div (before the input)
    const iconContainer = wrapper.querySelector(':scope > div') as HTMLElement;

    fireEvent.click(iconContainer);
    expect(input).toHaveFocus();
  });

  it('focuses input when clicking the wrapper padding', () => {
    render(<TimeInput label="Time" onChange={() => {}} />);

    const input = screen.getByRole('textbox');
    const wrapper = input.parentElement!;

    // Simulate clicking padding area by dispatching click directly on wrapper
    // with wrapper as both target and currentTarget
    fireEvent.click(wrapper);
    expect(input).toHaveFocus();
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
        <TimeInput
          label="Time"
          isDisabled
          disabledMessage="You need the Editor role"
        />,
      );

      const container = screen.getByLabelText('Time')
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
        <TimeInput
          label="Time"
          isDisabled
          disabledMessage="You need the Editor role"
        />,
      );

      const tooltip = screen.getByRole('tooltip', h);
      await user.tab();
      expect(screen.getByLabelText('Time')).toHaveFocus();
      await waitFor(() => {
        expect(tooltip).toHaveAttribute('popover-open');
      });
    });

    it('does not render a tooltip when not disabled', () => {
      render(
        <TimeInput label="Time" disabledMessage="You need the Editor role" />,
      );
      expect(screen.queryByRole('tooltip', h)).not.toBeInTheDocument();
    });

    it('does not render a tooltip when disabled without a reason', () => {
      render(<TimeInput label="Time" isDisabled />);
      expect(screen.queryByRole('tooltip', h)).not.toBeInTheDocument();
    });

    it('keeps the input focusable via aria-disabled when a reason is provided', () => {
      render(
        <TimeInput
          label="Time"
          isDisabled
          disabledMessage="You need the Editor role"
        />,
      );
      const input = screen.getByLabelText('Time');
      expect(input).not.toBeDisabled();
      expect(input).toHaveAttribute('aria-disabled', 'true');
      expect(input).toHaveAttribute('readonly');
    });

    it('links the reason tooltip from the input via aria-describedby', () => {
      render(
        <TimeInput
          label="Time"
          isDisabled
          disabledMessage="You need the Editor role"
        />,
      );
      const input = screen.getByLabelText('Time');
      const tooltip = screen.getByRole('tooltip', h);
      expect(input.getAttribute('aria-describedby')).toContain(tooltip.id);
    });

    it('blocks typing and arrow-key changes while focusable-disabled', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <TimeInput
          label="Time"
          onChange={onChange}
          isDisabled
          disabledMessage="You need the Editor role"
        />,
      );

      const input = screen.getByLabelText('Time');
      await user.type(input, '2:30 PM');
      expect(input).toHaveValue('');
      input.focus();
      fireEvent.keyDown(input, {key: 'ArrowUp'});
      expect(onChange).not.toHaveBeenCalled();
    });

    it('remains natively disabled when disabled without a reason', () => {
      render(<TimeInput label="Time" isDisabled />);
      const input = screen.getByLabelText('Time');
      expect(input).toBeDisabled();
      expect(input).not.toHaveAttribute('aria-disabled');
    });

    it('does not swap in the format-hint placeholder on focus while disabled', () => {
      render(
        <TimeInput
          label="Time"
          isDisabled
          disabledMessage="You need the Editor role"
          placeholder="Select a time"
        />,
      );
      const input = screen.getByLabelText('Time');
      input.focus();
      fireEvent.focus(input);
      expect(input).toHaveAttribute('placeholder', 'Select a time');
    });
  });
});
