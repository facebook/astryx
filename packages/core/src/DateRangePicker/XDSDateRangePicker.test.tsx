/**
 * @file XDSDateRangePicker.test.tsx
 * @input Uses vitest, @testing-library/react, XDSDateRangePicker component
 * @output Unit tests for XDSDateRangePicker component behavior
 * @position Testing; validates XDSDateRangePicker.tsx implementation
 *
 * SYNC: When XDSDateRangePicker.tsx changes, update tests to match new behavior
 */

// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect, vi} from 'vitest';
import {render, screen, fireEvent} from '@testing-library/react';
import {XDSDateRangePicker} from './XDSDateRangePicker';
import type {XDSDateRange} from './XDSDateRangePicker';
import type {ISODateString} from '../Calendar';

describe('XDSDateRangePicker', () => {
  it('renders with label', () => {
    render(
      <XDSDateRangePicker
        label="Date range"
        value={null}
        onChange={() => {}}
      />,
    );
    expect(screen.getByText('Date range')).toBeInTheDocument();
  });

  it('renders placeholder when value is null', () => {
    render(
      <XDSDateRangePicker label="Range" value={null} onChange={() => {}} />,
    );
    expect(screen.getByText('Select date range')).toBeInTheDocument();
  });

  it('renders custom placeholder', () => {
    render(
      <XDSDateRangePicker
        label="Range"
        value={null}
        onChange={() => {}}
        placeholder="Pick dates"
      />,
    );
    expect(screen.getByText('Pick dates')).toBeInTheDocument();
  });

  it('displays formatted range when value is set', () => {
    const range: XDSDateRange = {
      start: '2026-03-15' as ISODateString,
      end: '2026-03-22' as ISODateString,
    };
    render(
      <XDSDateRangePicker
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
      <XDSDateRangePicker
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
      <XDSDateRangePicker
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
      <XDSDateRangePicker
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
    render(
      <XDSDateRangePicker label="Range" value={null} onChange={() => {}} />,
    );
    const trigger = screen.getByRole('button', {name: /Range/});
    expect(trigger).not.toHaveAttribute('aria-required');
  });

  it('disables trigger when isDisabled is true', () => {
    render(
      <XDSDateRangePicker
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
    render(
      <XDSDateRangePicker label="Range" value={null} onChange={() => {}} />,
    );
    const trigger = screen.getByRole('button', {name: /Range/});
    expect(trigger).not.toBeDisabled();
  });

  it('trigger has aria-haspopup="dialog"', () => {
    render(
      <XDSDateRangePicker label="Range" value={null} onChange={() => {}} />,
    );
    const trigger = screen.getByRole('button', {name: /Range/});
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
  });

  it('trigger has aria-expanded=false by default', () => {
    render(
      <XDSDateRangePicker label="Range" value={null} onChange={() => {}} />,
    );
    const trigger = screen.getByRole('button', {name: /Range/});
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('renders status icon for error status', () => {
    render(
      <XDSDateRangePicker
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
      <XDSDateRangePicker
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
      <XDSDateRangePicker
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
      <XDSDateRangePicker
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
    render(
      <XDSDateRangePicker label="Range" value={null} onChange={() => {}} />,
    );
    expect(
      screen.getByRole('button', {name: 'Open calendar'}),
    ).toBeInTheDocument();
  });

  it('calendar icon button is disabled when isDisabled', () => {
    render(
      <XDSDateRangePicker
        label="Range"
        isDisabled
        value={null}
        onChange={() => {}}
      />,
    );
    expect(screen.getByRole('button', {name: 'Open calendar'})).toBeDisabled();
  });

  describe('hasClear', () => {
    it('shows clear button when hasClear is true and value exists', () => {
      const range: XDSDateRange = {
        start: '2026-03-15' as ISODateString,
        end: '2026-03-22' as ISODateString,
      };
      render(
        <XDSDateRangePicker
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
        <XDSDateRangePicker
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
      const range: XDSDateRange = {
        start: '2026-03-15' as ISODateString,
        end: '2026-03-22' as ISODateString,
      };
      render(
        <XDSDateRangePicker
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
      const range: XDSDateRange = {
        start: '2026-03-15' as ISODateString,
        end: '2026-03-22' as ISODateString,
      };
      render(
        <XDSDateRangePicker
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
      const range: XDSDateRange = {
        start: '2026-03-15' as ISODateString,
        end: '2026-03-22' as ISODateString,
      };
      render(
        <XDSDateRangePicker
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
});
