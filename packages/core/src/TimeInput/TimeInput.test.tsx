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
import {act, render, screen, fireEvent, waitFor} from '@testing-library/react';
import * as stylex from '@stylexjs/stylex';
import userEvent from '@testing-library/user-event';
import {TimeInput} from './TimeInput';
import {InputGroup, InputGroupText} from '../InputGroup';
import {FormLayout} from '../FormLayout';
import {InternationalizationProvider} from '../i18n';
import type {ISOTimeString} from '../utils';
import {__resetLiveRegionsForTest} from '../hooks/useAnnounce';

const testStyles = stylex.create({
  field: {paddingTop: 7},
});

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

  it('does not step the time on a composing ArrowUp/ArrowDown (IME)', () => {
    const onChange = vi.fn();
    render(
      <TimeInput
        label="Time"
        value={'14:30' as ISOTimeString}
        onChange={onChange}
      />,
    );
    const input = screen.getByLabelText('Time');

    // An IME candidate window navigates with the arrows; a composing keydown
    // (isComposing / legacy keyCode 229) must not step the time value.
    fireEvent.keyDown(input, {key: 'ArrowUp', isComposing: true});
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.keyDown(input, {key: 'ArrowDown', keyCode: 229});
    expect(onChange).not.toHaveBeenCalled();

    // A real, non-composing ArrowUp still steps the time by one minute.
    fireEvent.keyDown(input, {key: 'ArrowUp'});
    expect(onChange).toHaveBeenCalledWith('14:31');
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

  it('resolves the invalid-time announcement from the i18n catalog', () => {
    render(
      <InternationalizationProvider
        locale="en"
        overrides={{en: {'@astryx.timeInput.invalidTime': 'Ungültige Zeit'}}}>
        <TimeInput label="Time" onChange={() => {}} />
      </InternationalizationProvider>,
    );

    fireEvent.change(screen.getByRole('textbox'), {target: {value: '25:99'}});

    expect(screen.getByRole('alert')).toHaveTextContent('Ungültige Zeit');
  });

  // Arrow-key stepping mutates a plain textbox programmatically, and screen
  // readers do not announce programmatic textbox changes — the new value must
  // be announced through the polite live region (WCAG 4.1.2).
  it('politely announces the new time after ArrowUp stepping', async () => {
    const onChange = vi.fn();
    render(
      <TimeInput
        label="Time"
        value={'14:30' as ISOTimeString}
        onChange={onChange}
      />,
    );

    fireEvent.keyDown(screen.getByRole('textbox'), {key: 'ArrowUp'});

    expect(onChange).toHaveBeenCalledWith('14:31');
    await waitFor(() => {
      expect(politeRegion()).toHaveTextContent('2:31 PM');
    });
  });

  it('politely announces the new time after ArrowDown stepping', async () => {
    const onChange = vi.fn();
    render(
      <TimeInput
        label="Time"
        value={'14:30' as ISOTimeString}
        onChange={onChange}
      />,
    );

    fireEvent.keyDown(screen.getByRole('textbox'), {key: 'ArrowDown'});

    expect(onChange).toHaveBeenCalledWith('14:29');
    await waitFor(() => {
      expect(politeRegion()).toHaveTextContent('2:29 PM');
    });
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

describe('TimeInput statusVariant forwarding', () => {
  it('defaults to attached (status renders with data-variant="attached")', () => {
    const {container} = render(
      <TimeInput
        label="Start"
        value={undefined}
        onChange={() => {}}
        status={{type: 'error', message: 'Required'}}
      />,
    );
    expect(container.querySelector('.astryx-field-status')).toHaveAttribute(
      'data-variant',
      'attached',
    );
  });

  it('forwards statusVariant="detached" to the underlying Field status', () => {
    const {container} = render(
      <TimeInput
        label="Start"
        value={undefined}
        onChange={() => {}}
        status={{type: 'error', message: 'Required'}}
        statusVariant="detached"
      />,
    );
    expect(container.querySelector('.astryx-field-status')).toHaveAttribute(
      'data-variant',
      'detached',
    );
  });
});

describe('TimeInput disabled theme state', () => {
  it('reflects disabled on the root target so themes can gate paint on it', () => {
    const {container} = render(
      <TimeInput label="Time" onChange={() => {}} isDisabled />,
    );
    const root = container.querySelector('.astryx-time-input');
    expect(root).toHaveAttribute('data-disabled', 'disabled');
  });

  it('omits data-disabled when enabled, like status does', () => {
    const {container} = render(<TimeInput label="Time" onChange={() => {}} />);
    const root = container.querySelector('.astryx-time-input');
    expect(root).not.toHaveAttribute('data-disabled');
  });
});

describe('TimeInput pass-through props', () => {
  it('preserves the typed input role and visible label over runtime collisions', () => {
    render(
      <TimeInput
        label="Time"
        nativePicker="never"
        role={'button' as never}
        aria-label={'Override' as never}
      />,
    );
    const input = screen.getByRole('textbox', {name: 'Time'});
    expect(input).not.toHaveAttribute('role');
    expect(input).not.toHaveAttribute('aria-label');
  });

  it('routes styling exclusively to the painted control in horizontal-label layouts', () => {
    render(
      <FormLayout direction="horizontal-labels">
        <TimeInput
          label="Time"
          className="custom-control"
          style={{marginTop: 4}}
          xstyle={testStyles.field}
          hidden
          data-testid="time-control"
        />
      </FormLayout>,
    );
    const input = screen.getByTestId('time-control');
    const control = input.closest('.astryx-time-input')!;
    const field = input.closest('.astryx-field')!;
    expect(control).toHaveClass('custom-control');
    expect(control).toHaveStyle({marginTop: '4px'});
    expect(getComputedStyle(control).paddingTop).toBe('7px');
    expect(control).not.toHaveAttribute('hidden');
    expect(field).not.toHaveClass('custom-control');
    expect(field).not.toHaveStyle({marginTop: '4px'});
    expect(getComputedStyle(field).paddingTop).not.toBe('7px');
    expect(field).toHaveAttribute('hidden');
  });

  it.each([
    {hidden: true},
    {inert: true},
    {'aria-hidden': true},
    {'aria-hidden': 'true' as const},
  ])('suppresses hidden grouped status writes for %j', visibility => {
    vi.useFakeTimers();
    try {
      render(
        <InputGroup label="Schedule">
          <TimeInput
            label="Time"
            status={{type: 'error', message: 'Required'}}
            {...visibility}
          />
        </InputGroup>,
      );
      act(() => {
        vi.advanceTimersByTime(50);
      });
      expect(assertiveRegion()?.textContent ?? '').toBe('');
      expect(politeRegion()?.textContent ?? '').toBe('');
    } finally {
      vi.useRealTimers();
    }
  });

  it('announces grouped status with aria-hidden="false"', async () => {
    render(
      <InputGroup label="Schedule">
        <TimeInput
          label="Time"
          aria-hidden="false"
          status={{type: 'warning', message: 'Check time'}}
        />
      </InputGroup>,
    );
    await waitFor(() => expect(politeRegion()).toHaveTextContent('Check time'));
  });

  it.each(['error', 'warning'] as const)(
    'clears queued and current grouped %s status on its last announced channel',
    type => {
      vi.useFakeTimers();
      try {
        const grouped = (hidden: boolean) => (
          <InputGroup label="Schedule">
            <TimeInput
              label="Other"
              status={{
                type: type === 'error' ? 'warning' : 'error',
                message: 'Other status',
              }}
            />
            <TimeInput
              label="Time"
              hidden={hidden}
              status={{
                type: hidden ? (type === 'error' ? 'warning' : 'error') : type,
                message: 'Check time',
              }}
            />
          </InputGroup>
        );
        const {rerender} = render(grouped(false));
        const region = type === 'error' ? assertiveRegion : politeRegion;
        const otherRegion = type === 'error' ? politeRegion : assertiveRegion;
        const write = vi.spyOn(region()!, 'textContent', 'set');
        rerender(grouped(true));
        act(() => {
          vi.advanceTimersByTime(50);
        });
        expect(region()?.textContent).toBe('');
        expect(write).not.toHaveBeenCalledWith('Check time');
        expect(otherRegion()).toHaveTextContent('Other status');
        rerender(grouped(false));
        act(() => {
          vi.advanceTimersByTime(50);
        });
        expect(region()).toHaveTextContent('Check time');
        rerender(grouped(true));
        expect(region()?.textContent).toBe('');
        write.mockRestore();
      } finally {
        vi.useRealTimers();
      }
    },
  );

  it('forwards pass-through props to the input element', () => {
    render(
      <TimeInput
        label="Time"
        onChange={() => {}}
        data-tracking="meeting-time"
        data-analytics-id="start-time"
      />,
    );
    const input = screen.getByLabelText('Time');
    expect(input).toHaveAttribute('data-tracking', 'meeting-time');
    expect(input).toHaveAttribute('data-analytics-id', 'start-time');
  });

  it('routes semantic props to the input and field-wide props to Field', () => {
    render(
      <TimeInput
        label="Time"
        onChange={() => {}}
        className="custom-field"
        style={{marginTop: 4}}
        xstyle={testStyles.field}
        data-testid="time-control"
        hidden
        inert
        dir="rtl"
        aria-hidden
      />,
    );

    const input = screen.getByTestId('time-control');
    const field = input.closest('.custom-field');
    expect(field).not.toBeNull();
    expect(field).toHaveStyle({marginTop: '4px'});
    expect(getComputedStyle(field!).paddingTop).toBe('7px');
    expect(field).toHaveAttribute('hidden');
    expect(field).toHaveAttribute('inert');
    expect(field).toHaveAttribute('dir', 'rtl');
    expect(field).toHaveAttribute('aria-hidden', 'true');
    expect(input).not.toHaveAttribute('hidden');
    expect(input).not.toHaveAttribute('inert');
    expect(input).not.toHaveAttribute('dir');
    expect(input).not.toHaveAttribute('aria-hidden');
    expect(getComputedStyle(input).paddingTop).not.toBe('7px');
  });

  it('keeps field-wide props on the control wrapper inside InputGroup', () => {
    render(
      <InputGroup label="Schedule">
        <TimeInput
          label="Time"
          onChange={() => {}}
          className="custom-field"
          style={{marginTop: 4}}
          xstyle={testStyles.field}
          data-testid="time-control"
          hidden
          dir="rtl"
          aria-hidden
        />
      </InputGroup>,
    );

    const input = screen.getByTestId('time-control');
    const wrapper = input.closest('.custom-field');
    expect(wrapper).not.toBeNull();
    expect(wrapper).toHaveStyle({marginTop: '4px'});
    expect(getComputedStyle(wrapper!).paddingTop).toBe('7px');
    expect(wrapper).toHaveAttribute('hidden');
    expect(wrapper).toHaveAttribute('dir', 'rtl');
    expect(wrapper).toHaveAttribute('aria-hidden', 'true');
    expect(input).not.toHaveClass('custom-field');
    expect(getComputedStyle(input).paddingTop).not.toBe('7px');
  });

  it('runs a consumer onKeyDown for keys the component does not consume', () => {
    const onKeyDown = vi.fn();
    render(
      <TimeInput label="Time" onChange={() => {}} onKeyDown={onKeyDown} />,
    );
    fireEvent.keyDown(screen.getByLabelText('Time'), {key: '1'});
    expect(onKeyDown).toHaveBeenCalledOnce();
  });

  it('keeps arrow stepping when a consumer onKeyDown cancels', () => {
    const onChange = vi.fn();
    const onKeyDown = vi.fn((e: React.KeyboardEvent) => {
      e.preventDefault();
    });
    render(
      <TimeInput
        label="Time"
        value={'14:30' as ISOTimeString}
        onChange={onChange}
        onKeyDown={onKeyDown}
      />,
    );
    fireEvent.keyDown(screen.getByLabelText('Time'), {key: 'ArrowUp'});
    expect(onChange).toHaveBeenCalledWith('14:31');
    // Stepping consumes the arrow (preventDefault), so the consumer handler
    // does not observe it — component-first composition by design.
    expect(onKeyDown).not.toHaveBeenCalled();
  });

  it('honors a caller id and composes a caller aria-describedby', () => {
    render(
      <>
        <span id="consumer-help">External help</span>
        <TimeInput
          label="Time"
          onChange={() => {}}
          id="meeting-time"
          aria-describedby="consumer-help"
          description="Built-in help"
        />
      </>,
    );
    const input = screen.getByLabelText('Time');
    expect(input).toHaveAttribute('id', 'meeting-time');
    const ids = input.getAttribute('aria-describedby')?.split(/\s+/) ?? [];
    expect(ids).toContain('consumer-help');
    expect(ids.length).toBeGreaterThan(1);
  });

  it('composes a caller aria-labelledby ahead of any owned label ids', () => {
    render(
      <>
        <span id="consumer-label">External label</span>
        <TimeInput
          label="Time"
          onChange={() => {}}
          aria-labelledby="consumer-label"
        />
      </>,
    );
    const input = screen.getByRole('textbox');
    const ids = input.getAttribute('aria-labelledby')?.split(/\s+/) ?? [];
    expect(ids).toContain('consumer-label');
    // The visible label stays in the accessible name alongside the caller's.
    expect(input).toHaveAccessibleName('External label Time');
  });

  it('keeps blur formatting when a consumer onBlur cancels', () => {
    const onChange = vi.fn();
    render(
      <TimeInput
        label="Time"
        onChange={onChange}
        onBlur={e => e.preventDefault()}
      />,
    );
    const input = screen.getByLabelText('Time');
    fireEvent.focus(input);
    fireEvent.change(input, {target: {value: '2:30 PM'}});
    fireEvent.blur(input);
    // The owned blur handler still parses and commits despite the cancel.
    expect(onChange).toHaveBeenCalledWith('14:30');
  });

  it('composes a caller aria-labelledby with the group label ids in InputGroup', () => {
    render(
      <>
        <span id="consumer-label">External label</span>
        <InputGroup label="Meeting">
          <TimeInput
            label="Time"
            onChange={() => {}}
            aria-labelledby="consumer-label"
          />
        </InputGroup>
      </>,
    );
    const input = screen.getByRole('textbox');
    const ids = input.getAttribute('aria-labelledby')?.split(/\s+/) ?? [];
    expect(ids).toContain('consumer-label');
    // The owned group + input label ids survive alongside the caller's.
    expect(ids.length).toBeGreaterThan(1);
  });

  it('runs a consumer onFocus and onBlur alongside the built-in handlers', () => {
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    render(
      <TimeInput
        label="Time"
        onChange={() => {}}
        onFocus={onFocus}
        onBlur={onBlur}
      />,
    );
    const input = screen.getByLabelText('Time');
    fireEvent.focus(input);
    expect(onFocus).toHaveBeenCalledOnce();
    fireEvent.blur(input);
    expect(onBlur).toHaveBeenCalledOnce();
  });
});
