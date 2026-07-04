// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file DateRangeInput.test.tsx
 * @input Uses vitest, @testing-library/react, DateRangeInput component
 * @output Unit tests for DateRangeInput component behavior
 * @position Testing; validates DateRangeInput.tsx implementation
 *
 * SYNC: When DateRangeInput.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, vi, beforeEach} from 'vitest';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {DateRangeInput} from './DateRangeInput';
import type {DateRange} from './DateRangeInput';

describe('DateRangeInput', () => {
  it('renders with label', () => {
    render(
      <DateRangeInput label="Date range" value={null} onChange={() => {}} />,
    );
    expect(screen.getByText('Date range')).toBeInTheDocument();
  });

  it('renders placeholder when value is null', () => {
    render(<DateRangeInput label="Range" value={null} onChange={() => {}} />);
    expect(screen.getByText('Select date range')).toBeInTheDocument();
  });

  it('renders custom placeholder', () => {
    render(
      <DateRangeInput
        label="Range"
        value={null}
        onChange={() => {}}
        placeholder="Pick dates"
      />,
    );
    expect(screen.getByText('Pick dates')).toBeInTheDocument();
  });

  it('displays formatted range when value is set', () => {
    const range: DateRange = {
      start: '2026-03-15',
      end: '2026-03-22',
    };
    render(
      <DateRangeInput
        label="Range"
        value={range}
        onChange={() => {}}
        hasClear={false}
      />,
    );
    const trigger = screen.getByRole('button', {name: /Range:/});
    expect(trigger.textContent).toMatch(/Mar/);
    expect(trigger.textContent).toMatch(/15/);
    expect(trigger.textContent).toMatch(/22/);
  });

  it('forwards ref to trigger button', () => {
    const ref = vi.fn();
    render(
      <DateRangeInput
        ref={ref}
        label="Range"
        value={null}
        onChange={() => {}}
      />,
    );
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLButtonElement));
  });

  it('visually hides label when isLabelHidden is true', () => {
    render(
      <DateRangeInput
        label="Range"
        isLabelHidden
        value={null}
        onChange={() => {}}
      />,
    );
    expect(screen.getByText('Range')).toBeInTheDocument();
  });

  it('sets aria-required when isRequired is true', () => {
    render(
      <DateRangeInput
        label="Range"
        isRequired
        value={null}
        onChange={() => {}}
      />,
    );
    const trigger = screen.getByRole('button', {name: /Range/});
    expect(trigger).toHaveAttribute('aria-required', 'true');
  });

  it('does not set aria-required when isRequired is false', () => {
    render(<DateRangeInput label="Range" value={null} onChange={() => {}} />);
    const trigger = screen.getByRole('button', {name: /Range/});
    expect(trigger).not.toHaveAttribute('aria-required');
  });

  it('disables trigger when isDisabled is true', () => {
    render(
      <DateRangeInput
        label="Range"
        isDisabled
        value={null}
        onChange={() => {}}
      />,
    );
    const trigger = screen.getByRole('button', {name: /Range/});
    expect(trigger).toBeDisabled();
  });

  it('is not disabled by default', () => {
    render(<DateRangeInput label="Range" value={null} onChange={() => {}} />);
    const trigger = screen.getByRole('button', {name: /Range/});
    expect(trigger).not.toBeDisabled();
  });

  it('trigger has aria-haspopup="dialog"', () => {
    render(<DateRangeInput label="Range" value={null} onChange={() => {}} />);
    const trigger = screen.getByRole('button', {name: /Range/});
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
  });

  it('trigger has aria-expanded=false by default', () => {
    render(<DateRangeInput label="Range" value={null} onChange={() => {}} />);
    const trigger = screen.getByRole('button', {name: /Range/});
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('renders status icon for error status', () => {
    render(
      <DateRangeInput
        label="Range"
        value={null}
        onChange={() => {}}
        status={{type: 'error', message: 'Required'}}
      />,
    );
    const trigger = screen.getByRole('button', {name: /Range/});
    expect(trigger).toHaveAttribute('aria-invalid', 'true');
  });

  it('does not set aria-invalid for warning status', () => {
    render(
      <DateRangeInput
        label="Range"
        value={null}
        onChange={() => {}}
        status={{type: 'warning', message: 'Watch out'}}
      />,
    );
    const trigger = screen.getByRole('button', {name: /Range/});
    expect(trigger).not.toHaveAttribute('aria-invalid');
  });

  it('renders description', () => {
    render(
      <DateRangeInput
        label="Range"
        description="Pick a date range"
        value={null}
        onChange={() => {}}
      />,
    );
    expect(screen.getByText('Pick a date range')).toBeInTheDocument();
  });

  it('links status message via aria-describedby', () => {
    render(
      <DateRangeInput
        label="Range"
        value={null}
        onChange={() => {}}
        status={{type: 'error', message: 'Please select dates'}}
      />,
    );
    const trigger = screen.getByRole('button', {name: /Range/});
    const describedBy = trigger.getAttribute('aria-describedby')!;
    const ids = describedBy.split(' ');
    const found = ids.some(id => {
      const el = document.getElementById(id);
      return el?.textContent?.includes('Please select dates');
    });
    expect(found).toBe(true);
  });

  it('calendar icon button is present', () => {
    render(<DateRangeInput label="Range" value={null} onChange={() => {}} />);
    expect(
      screen.getByRole('button', {name: 'Open calendar'}),
    ).toBeInTheDocument();
  });

  it('calendar icon button is disabled when isDisabled', () => {
    render(
      <DateRangeInput
        label="Range"
        isDisabled
        value={null}
        onChange={() => {}}
      />,
    );
    expect(screen.getByRole('button', {name: 'Open calendar'})).toBeDisabled();
  });

  it('renders with size="lg"', () => {
    render(
      <DateRangeInput
        label="Date range"
        value={null}
        onChange={() => {}}
        size="lg"
      />,
    );
    expect(screen.getByText('Date range')).toBeInTheDocument();
  });

  describe('hasClear', () => {
    it('shows clear button when hasClear is true and value exists', () => {
      const range: DateRange = {
        start: '2026-03-15',
        end: '2026-03-22',
      };
      render(
        <DateRangeInput
          label="Range"
          value={range}
          onChange={() => {}}
          hasClear
        />,
      );
      expect(
        screen.getByRole('button', {name: 'Clear Range'}),
      ).toBeInTheDocument();
    });

    it('does not show clear button when value is null', () => {
      render(
        <DateRangeInput
          label="Range"
          value={null}
          onChange={() => {}}
          hasClear
        />,
      );
      expect(
        screen.queryByRole('button', {name: 'Clear Range'}),
      ).not.toBeInTheDocument();
    });

    it('does not show clear button when hasClear is false', () => {
      const range: DateRange = {
        start: '2026-03-15',
        end: '2026-03-22',
      };
      render(
        <DateRangeInput
          label="Range"
          value={range}
          onChange={() => {}}
          hasClear={false}
        />,
      );
      expect(
        screen.queryByRole('button', {name: 'Clear Range'}),
      ).not.toBeInTheDocument();
    });

    it('does not show clear button when disabled', () => {
      const range: DateRange = {
        start: '2026-03-15',
        end: '2026-03-22',
      };
      render(
        <DateRangeInput
          label="Range"
          value={range}
          onChange={() => {}}
          hasClear
          isDisabled
        />,
      );
      expect(
        screen.queryByRole('button', {name: 'Clear Range'}),
      ).not.toBeInTheDocument();
    });

    it('calls onChange with null when clear is clicked', () => {
      const onChange = vi.fn();
      const range: DateRange = {
        start: '2026-03-15',
        end: '2026-03-22',
      };
      render(
        <DateRangeInput
          label="Range"
          value={range}
          onChange={onChange}
          hasClear
        />,
      );
      fireEvent.click(screen.getByRole('button', {name: 'Clear Range'}));
      expect(onChange).toHaveBeenCalledWith(null);
    });
  });

  describe('presets', () => {
    const presets = [
      {
        label: 'Last 7 days',
        getRange: (): DateRange => ({
          start: '2026-03-01',
          end: '2026-03-07',
        }),
      },
      {
        label: 'This month',
        getRange: (): DateRange => ({
          start: '2026-03-01',
          end: '2026-03-31',
        }),
      },
    ];

    it('renders presets as a labeled group of buttons, not a listbox (forms-5)', () => {
      render(
        <DateRangeInput
          label="Range"
          value={null}
          onChange={() => {}}
          presets={presets}
        />,
      );
      // The preset sidebar is a group of action buttons — not a listbox of
      // options (which would announce a Tab-navigable listbox it isn't).
      expect(
        screen.queryByRole('listbox', {hidden: true}),
      ).not.toBeInTheDocument();
      expect(
        screen.getByRole('group', {name: 'Preset date ranges', hidden: true}),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', {name: 'Last 7 days', hidden: true}),
      ).toBeInTheDocument();
    });

    it('marks the applied preset with aria-current, not aria-selected', () => {
      render(
        <DateRangeInput
          label="Range"
          value={{start: '2026-03-01', end: '2026-03-07'}}
          onChange={() => {}}
          presets={presets}
        />,
      );
      const active = screen.getByRole('button', {
        name: 'Last 7 days',
        hidden: true,
      });
      expect(active).toHaveAttribute('aria-current', 'true');
      expect(active).not.toHaveAttribute('aria-selected');
      const inactive = screen.getByRole('button', {
        name: 'This month',
        hidden: true,
      });
      expect(inactive).not.toHaveAttribute('aria-current');
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

    function renderDisabled(props?: {disabledMessage?: string}) {
      return render(
        <DateRangeInput
          label="Range"
          value={null}
          onChange={() => {}}
          isDisabled
          {...props}
        />,
      );
    }

    it('shows the reason tooltip on hover when disabled with a reason', async () => {
      renderDisabled({disabledMessage: 'You need the Editor role'});

      const trigger = screen.getByRole('button', {name: /Range:/, ...h});
      const container = trigger.parentElement as HTMLElement;
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
      renderDisabled({disabledMessage: 'You need the Editor role'});

      const tooltip = screen.getByRole('tooltip', h);
      await user.tab();
      expect(screen.getByRole('button', {name: /Range:/, ...h})).toHaveFocus();
      await waitFor(() => {
        expect(tooltip).toHaveAttribute('popover-open');
      });
    });

    it('does not render a tooltip when not disabled', () => {
      render(
        <DateRangeInput
          label="Range"
          value={null}
          onChange={() => {}}
          disabledMessage="You need the Editor role"
        />,
      );
      expect(screen.queryByRole('tooltip', h)).not.toBeInTheDocument();
    });

    it('does not render a tooltip when disabled without a reason', () => {
      renderDisabled();
      expect(screen.queryByRole('tooltip', h)).not.toBeInTheDocument();
    });

    it('keeps the trigger focusable via aria-disabled when a reason is provided', () => {
      renderDisabled({disabledMessage: 'You need the Editor role'});
      const trigger = screen.getByRole('button', {name: /Range:/, ...h});
      expect(trigger).not.toBeDisabled();
      expect(trigger).toHaveAttribute('aria-disabled', 'true');
    });

    it('links the reason tooltip from the trigger via aria-describedby', () => {
      renderDisabled({disabledMessage: 'You need the Editor role'});
      const trigger = screen.getByRole('button', {name: /Range:/, ...h});
      const tooltip = screen.getByRole('tooltip', h);
      expect(trigger.getAttribute('aria-describedby')).toContain(tooltip.id);
    });

    it('blocks activation while focusable-disabled', async () => {
      const user = userEvent.setup();
      renderDisabled({disabledMessage: 'You need the Editor role'});

      const trigger = screen.getByRole('button', {name: /Range:/, ...h});
      await user.click(trigger);
      expect(trigger).toHaveAttribute('aria-expanded', 'false');

      await user.keyboard('{Enter}');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    it('remains natively disabled when disabled without a reason', () => {
      renderDisabled();
      const trigger = screen.getByRole('button', {name: /Range:/, ...h});
      expect(trigger).toBeDisabled();
      expect(trigger).not.toHaveAttribute('aria-disabled');
    });
  });
});
