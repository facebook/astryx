// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file XDSDateRangeInput.test.tsx
 * @input Uses vitest, @testing-library/react, XDSDateRangeInput component
 * @output Unit tests for XDSDateRangeInput component behavior
 * @position Testing; validates XDSDateRangeInput.tsx implementation
 *
 * SYNC: When XDSDateRangeInput.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, vi} from 'vitest';
import {render, screen, fireEvent} from '@testing-library/react';
import {XDSDateRangeInput} from './XDSDateRangeInput';
import type {DateRange} from './XDSDateRangeInput';

describe('XDSDateRangeInput', () => {
  it('renders with label', () => {
    render(
      <XDSDateRangeInput label="Date range" value={null} onChange={() => {}} />,
    );
    expect(screen.getByText('Date range')).toBeInTheDocument();
  });

  it('renders placeholder when value is null', () => {
    render(
      <XDSDateRangeInput label="Range" value={null} onChange={() => {}} />,
    );
    expect(screen.getByText('Select date range')).toBeInTheDocument();
  });

  it('renders custom placeholder', () => {
    render(
      <XDSDateRangeInput
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
      <XDSDateRangeInput
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
      <XDSDateRangeInput
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
      <XDSDateRangeInput
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
      <XDSDateRangeInput
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
      <XDSDateRangeInput label="Range" value={null} onChange={() => {}} />,
    );
    const trigger = screen.getByRole('button', {name: /Range/});
    expect(trigger).not.toHaveAttribute('aria-required');
  });

  it('disables trigger when isDisabled is true', () => {
    render(
      <XDSDateRangeInput
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
      <XDSDateRangeInput label="Range" value={null} onChange={() => {}} />,
    );
    const trigger = screen.getByRole('button', {name: /Range/});
    expect(trigger).not.toBeDisabled();
  });

  it('trigger has aria-haspopup="dialog"', () => {
    render(
      <XDSDateRangeInput label="Range" value={null} onChange={() => {}} />,
    );
    const trigger = screen.getByRole('button', {name: /Range/});
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
  });

  it('trigger has aria-expanded=false by default', () => {
    render(
      <XDSDateRangeInput label="Range" value={null} onChange={() => {}} />,
    );
    const trigger = screen.getByRole('button', {name: /Range/});
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('renders status icon for error status', () => {
    render(
      <XDSDateRangeInput
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
      <XDSDateRangeInput
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
      <XDSDateRangeInput
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
      <XDSDateRangeInput
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
      <XDSDateRangeInput label="Range" value={null} onChange={() => {}} />,
    );
    expect(
      screen.getByRole('button', {name: 'Open calendar'}),
    ).toBeInTheDocument();
  });

  it('calendar icon button is disabled when isDisabled', () => {
    render(
      <XDSDateRangeInput
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
      <XDSDateRangeInput
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
        <XDSDateRangeInput
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
        <XDSDateRangeInput
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
        <XDSDateRangeInput
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
        <XDSDateRangeInput
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
        <XDSDateRangeInput
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
