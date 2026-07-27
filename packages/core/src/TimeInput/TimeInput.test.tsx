// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file TimeInput.test.tsx
 * @input Uses vitest, @testing-library/react, TimeInput component
 * @output Unit tests for TimeInput component behavior
 * @position Testing; validates TimeInput.tsx implementation
 *
 * SYNC: When TimeInput.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {TimeInput} from './TimeInput';
import {InputGroup, InputGroupText} from '../InputGroup';
import type {ISOTimeString} from '../utils';
import {__resetLiveRegionsForTest} from '../hooks/useAnnounce';

function politeRegion(): HTMLElement | null {
  return document.querySelector('[data-astryx-live-region="polite"]');
}
function assertiveRegion(): HTMLElement | null {
  return document.querySelector('[data-astryx-live-region="assertive"]');
}

afterEach(() => {
  __resetLiveRegionsForTest();
});

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

  it('sets aria-invalid="true" when typed input is out of range', () => {
    render(<TimeInput label="Time" onChange={() => {}} />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, {target: {value: '25:99'}});

    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('does not set aria-invalid when typed input is a valid time', () => {
    render(<TimeInput label="Time" onChange={() => {}} />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, {target: {value: '3:45 pm'}});

    expect(input).not.toHaveAttribute('aria-invalid');
  });

  it('announces an alert message when typed input is invalid', () => {
    render(<TimeInput label="Time" onChange={() => {}} />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, {target: {value: '25:99'}});

    expect(screen.getByRole('alert')).toHaveTextContent('Invalid time');
  });

  it('does not announce an alert message when input is valid', () => {
    render(<TimeInput label="Time" onChange={() => {}} />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, {target: {value: '3:45 pm'}});

    expect(screen.getByRole('alert')).toHaveTextContent('');
    expect(screen.queryByText('Invalid time')).not.toBeInTheDocument();
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
  describe('InputGroup integration', () => {
    it('labels grouped TimeInput from the group and inner input labels', () => {
      render(
        <InputGroup label="Schedule" description="Use local time">
          <InputGroupText>Starts</InputGroupText>
          <TimeInput
            label="Start time"
            isLabelHidden
            value={'09:00' as ISOTimeString}
            onChange={() => {}}
          />
        </InputGroup>,
      );

      const group = screen.getByRole('group', {name: 'Schedule'});
      const groupLabelID = group.getAttribute('aria-labelledby');
      const input = screen.getByRole('textbox', {
        name: 'Schedule Start time',
      });
      const labelledByIDs =
        input.getAttribute('aria-labelledby')?.split(' ') ?? [];

      expect(labelledByIDs).toHaveLength(2);
      expect(labelledByIDs[0]).toBe(groupLabelID);
      expect(document.getElementById(labelledByIDs[1])).toHaveTextContent(
        'Start time',
      );
      expect(input).not.toHaveAttribute('aria-label');
      expect(input).toHaveAttribute(
        'aria-describedby',
        group.getAttribute('aria-describedby'),
      );
    });

    it('includes group and local described-by content when grouped', () => {
      render(
        <InputGroup
          label="Schedule"
          description="Use local time"
          status={{type: 'warning', message: 'Schedule is unusual'}}>
          <InputGroupText>Starts</InputGroupText>
          <TimeInput
            label="Start time"
            isLabelHidden
            value={'09:00' as ISOTimeString}
            onChange={() => {}}
            description="Business hours only"
            status={{type: 'error', message: 'Start time is required'}}
            isDisabled
            disabledMessage="Time edits are locked"
          />
        </InputGroup>,
      );

      const input = screen.getByRole('textbox', {
        name: 'Schedule Start time',
      });
      const describedByIDs =
        input.getAttribute('aria-describedby')?.split(' ') ?? [];
      const describedText = describedByIDs
        .map(id => document.getElementById(id)?.textContent)
        .join(' ');

      expect(describedText).toContain('Use local time');
      expect(describedText).toContain('Schedule is unusual');
      expect(describedText).toContain('Business hours only');
      expect(describedText).toContain('Start time is required');
      expect(describedText).toContain('Time edits are locked');
    });

    it('does not render duplicate Field label chrome when grouped', () => {
      render(
        <InputGroup label="Schedule">
          <InputGroupText>Starts</InputGroupText>
          <TimeInput
            label="Start time"
            isLabelHidden
            value={'09:00' as ISOTimeString}
            onChange={() => {}}
          />
        </InputGroup>,
      );

      expect(screen.getByText('Schedule')).toBeInTheDocument();
      expect(screen.getByText('Start time')).toBeInTheDocument();
      expect(screen.getByText('Start time').tagName).toBe('SPAN');
      expect(document.querySelector('label')).toBeNull();
    });

    it('suppresses the local status icon when grouped', () => {
      const {container} = render(
        <InputGroup label="Schedule">
          <InputGroupText>Starts</InputGroupText>
          <TimeInput
            label="Start time"
            isLabelHidden
            value={'09:00' as ISOTimeString}
            onChange={() => {}}
            status={{type: 'error'}}
          />
        </InputGroup>,
      );

      // The clock icon remains, but the trailing status icon is suppressed in
      // grouped mode so the shared InputGroup border/status treatment is not
      // duplicated.
      expect(container.querySelectorAll('svg')).toHaveLength(1);
    });

    // The grouped status node exists only for aria-describedby; announcing
    // happens through the persistent useAnnounce regions because a live
    // region mounted together with its content is not reliably announced.
    it('keeps the grouped status node role-free while announcing via the persistent region', async () => {
      render(
        <InputGroup label="Schedule">
          <InputGroupText>Starts</InputGroupText>
          <TimeInput
            label="Start time"
            isLabelHidden
            value={'09:00' as ISOTimeString}
            onChange={() => {}}
            status={{type: 'error', message: 'Start time is required'}}
          />
        </InputGroup>,
      );

      const input = screen.getByRole('textbox', {
        name: 'Schedule Start time',
      });
      const describedByIDs =
        input.getAttribute('aria-describedby')?.split(' ') ?? [];
      const statusNode = describedByIDs
        .map(id => document.getElementById(id))
        .find(el => el?.textContent === 'Start time is required');
      expect(statusNode).toBeTruthy();
      expect(statusNode).not.toHaveAttribute('role');
      expect(statusNode).not.toHaveAttribute('aria-live');

      await waitFor(() => {
        expect(assertiveRegion()).toHaveTextContent('Start time is required');
      });
    });

    // Regression: a grouped status message appearing after mount (the common
    // validation flow) must land in the persistent announce region.
    it('announces a grouped status message that appears after mount', async () => {
      const grouped = (status?: {
        type: 'error' | 'warning';
        message: string;
      }) => (
        <InputGroup label="Schedule">
          <InputGroupText>Starts</InputGroupText>
          <TimeInput
            label="Start time"
            isLabelHidden
            value={'09:00' as ISOTimeString}
            onChange={() => {}}
            status={status}
          />
        </InputGroup>
      );
      const {rerender} = render(grouped());
      expect(politeRegion()).toBeNull();

      rerender(grouped({type: 'warning', message: 'Schedule is unusual'}));
      await waitFor(() => {
        expect(politeRegion()).toHaveTextContent('Schedule is unusual');
      });
      // Non-error statuses stay on the polite channel.
      expect(assertiveRegion()).toHaveTextContent('');
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
