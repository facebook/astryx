// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file DateTimeInputTouch.test.tsx
 * @input Uses vitest, @testing-library/react, DateTimeInput touch surface
 * @output Focused coverage for DateTimeInput's coarse-pointer bottom-sheet picker
 * @position Test file for /packages/core/src/DateTimeInput/
 *
 * The touch surface reuses DateInput's sheet/calendar primitives, so this file
 * keeps coverage at the DateTimeInput integration seams: surface selection,
 * segmented switching, date/time combination, constraints, and field parity.
 */

import {
  describe,
  it,
  expect,
  vi,
  beforeAll,
  afterAll,
  beforeEach,
  afterEach,
} from 'vitest';
import {readFileSync} from 'node:fs';
import {render, screen, fireEvent, within} from '@testing-library/react';
import {DateTimeInput} from './DateTimeInput';
import type {ISODateTimeString} from './DateTimeInput';

class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

const HOVER_CAPABLE = /\(\s*hover\s*:\s*hover\s*\)/;
const SCROLLPORT_WIDTH = 360;

function stubMedia(pointer: 'coarse' | 'fine', anyPointer = pointer): void {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: /any-pointer:\s*coarse/.test(query)
      ? anyPointer === 'coarse'
      : /pointer:\s*coarse/.test(query)
        ? pointer === 'coarse'
        : /pointer:\s*fine/.test(query)
          ? pointer === 'fine'
          : HOVER_CAPABLE.test(query),
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }));
}

function withMonthLayout<T>(fn: () => T): T {
  Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
    configurable: true,
    get(this: HTMLElement) {
      return this.dataset?.scroller === 'months' ? SCROLLPORT_WIDTH : 0;
    },
  });
  try {
    return fn();
  } finally {
    delete (HTMLElement.prototype as {clientWidth?: unknown}).clientWidth;
  }
}

function openSheet(): HTMLElement {
  const field = screen.getByRole('combobox');
  fireEvent.click(field);
  return field;
}

function openTimePanel(): void {
  fireEvent.click(screen.getByRole('radio', {name: 'Time'}));
}

function optionIn(listName: string, optionName: string): HTMLElement {
  return within(screen.getByRole('listbox', {name: listName})).getByRole(
    'option',
    {name: optionName},
  );
}

beforeAll(() => {
  window.scrollTo = vi.fn();
  Element.prototype.scrollTo = vi.fn();
  Element.prototype.scrollIntoView = vi.fn();
  HTMLDialogElement.prototype.showModal = vi.fn(function (
    this: HTMLDialogElement,
  ) {
    this.open = true;
  });
  HTMLDialogElement.prototype.show = vi.fn(function (this: HTMLDialogElement) {
    this.open = true;
  });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    this.open = false;
  });
});

afterAll(() => {
  vi.useRealTimers();
});

beforeEach(() => {
  vi.setSystemTime(new Date(2026, 2, 15, 9, 30, 45));
  vi.stubGlobal('ResizeObserver', MockResizeObserver);
  stubMedia('coarse');
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('DateTimeInput touch surface', () => {
  it('uses the bottom-sheet picker on a coarse pointer', () => {
    withMonthLayout(() => {
      render(<DateTimeInput label="Meeting" onChange={() => {}} />);
      const field = screen.getByRole('combobox');

      expect(field).toHaveAttribute('readonly');
      expect(field).toHaveAttribute('inputmode', 'none');
      expect(field).toHaveAttribute('aria-expanded', 'false');

      fireEvent.click(field);
      expect(field).toHaveAttribute('aria-expanded', 'true');
      expect(
        screen.getByRole('radiogroup', {name: 'Date/time section'}),
      ).toBeInTheDocument();
      expect(screen.getByRole('radio', {name: 'Date'})).toHaveAttribute(
        'aria-checked',
        'true',
      );
    });
  });

  it('keeps the desktop two-field surface on a fine primary pointer', () => {
    stubMedia('fine', 'coarse');
    render(<DateTimeInput label="Meeting" onChange={() => {}} />);

    expect(screen.getByRole('combobox')).not.toHaveAttribute('readonly');
    expect(screen.getByLabelText('Meeting time')).toBeInTheDocument();
  });

  it('switches between inert date and time panels with the pill control', () => {
    withMonthLayout(() => {
      const {container} = render(
        <DateTimeInput label="Meeting" onChange={() => {}} />,
      );
      openSheet();

      const datePanel = container.querySelector(
        '[data-panel="date"]',
      ) as HTMLElement;
      const timePanel = container.querySelector(
        '[data-panel="time"]',
      ) as HTMLElement;
      expect(datePanel).not.toHaveAttribute('aria-hidden');
      expect(timePanel).toHaveAttribute('aria-hidden', 'true');

      openTimePanel();
      expect(datePanel).toHaveAttribute('aria-hidden', 'true');
      expect(timePanel).not.toHaveAttribute('aria-hidden');
      expect(screen.getByRole('radio', {name: 'Time'})).toHaveAttribute(
        'aria-checked',
        'true',
      );
    });
  });

  it('selects a date with the drafted/default time and leaves the Date panel active', () => {
    const onChange = vi.fn();
    withMonthLayout(() => {
      render(<DateTimeInput label="Meeting" onChange={onChange} />);
      openSheet();

      fireEvent.click(
        screen.getByRole('button', {name: 'Saturday, March 21, 2026'}),
      );

      expect(onChange).toHaveBeenCalledWith('2026-03-21T09:30');
      expect(screen.getByRole('radio', {name: 'Date'})).toHaveAttribute(
        'aria-checked',
        'true',
      );
    });
  });

  it('does not lose a time chosen before the date exists', () => {
    const onChange = vi.fn();
    withMonthLayout(() => {
      render(<DateTimeInput label="Meeting" onChange={onChange} />);
      openSheet();
      openTimePanel();

      fireEvent.click(optionIn('AM/PM', 'PM'));
      fireEvent.click(optionIn('Hour', '3'));
      fireEvent.click(optionIn('Minute', '45'));
      expect(onChange).not.toHaveBeenCalled();

      fireEvent.click(screen.getByRole('radio', {name: 'Date'}));
      fireEvent.click(
        screen.getByRole('button', {name: 'Saturday, March 21, 2026'}),
      );
      expect(onChange).toHaveBeenCalledWith('2026-03-21T15:45');
    });
  });

  it('commits 12-hour wheel changes against the controlled date', () => {
    const onChange = vi.fn();
    render(
      <DateTimeInput
        label="Meeting"
        value={'2026-03-15T14:30' as ISODateTimeString}
        onChange={onChange}
      />,
    );
    openSheet();
    openTimePanel();

    fireEvent.click(optionIn('Hour', '3'));
    expect(onChange).toHaveBeenCalledWith('2026-03-15T15:30');
  });

  it('commits 24-hour wheel changes', () => {
    const onChange = vi.fn();
    render(
      <DateTimeInput
        label="Meeting"
        value={'2026-03-15T14:30' as ISODateTimeString}
        hourFormat="24h"
        onChange={onChange}
      />,
    );
    openSheet();
    openTimePanel();

    fireEvent.click(optionIn('Hour', '09'));
    expect(onChange).toHaveBeenCalledWith('2026-03-15T09:30');
  });

  it('commits seconds when hasSeconds is set', () => {
    const onChange = vi.fn();
    render(
      <DateTimeInput
        label="Meeting"
        value={'2026-03-15T14:30:00' as ISODateTimeString}
        hasSeconds
        onChange={onChange}
      />,
    );
    openSheet();
    openTimePanel();

    fireEvent.click(optionIn('Second', '45'));
    expect(onChange).toHaveBeenCalledWith('2026-03-15T14:30:45');
  });

  it('disables out-of-range hours on the min/max boundary date', () => {
    render(
      <DateTimeInput
        label="Meeting"
        value={'2026-03-15T10:00' as ISODateTimeString}
        min={'2026-03-15T09:00' as ISODateTimeString}
        max={'2026-03-15T17:00' as ISODateTimeString}
        hourFormat="24h"
        onChange={() => {}}
      />,
    );
    openSheet();
    openTimePanel();

    expect(optionIn('Hour', '08')).toHaveAttribute('aria-disabled', 'true');
    expect(optionIn('Hour', '09')).not.toHaveAttribute('aria-disabled');
    expect(optionIn('Hour', '18')).toHaveAttribute('aria-disabled', 'true');
  });

  it('preserves the browsed month when switching Date to Time and back', () => {
    withMonthLayout(() => {
      render(<DateTimeInput label="Meeting" onChange={() => {}} />);
      openSheet();

      fireEvent.click(screen.getByRole('button', {name: 'Next month'}));
      expect(screen.getByText('April 2026')).toBeInTheDocument();

      openTimePanel();
      fireEvent.click(screen.getByRole('radio', {name: 'Date'}));
      expect(screen.getByText('April 2026')).toBeInTheDocument();
      expect(document.querySelector('[data-scroller="months"]')).not.toBeNull();
    });
  });

  it('bounds grid panel min-content width so MonthScroller cannot feed back through its spacer', () => {
    const source = readFileSync(
      'packages/core/src/DateTimeInput/TouchDateTimeField.tsx',
      'utf8',
    );
    const styleBlock = (name: string): string => {
      const match = new RegExp(`${name}: \\{([\\s\\S]*?)\\n  \\},`).exec(
        source,
      );
      if (match == null) {
        throw new Error(`missing style block ${name}`);
      }
      return match[1];
    };

    for (const name of [
      'touchSheetBody',
      'touchSurface',
      'touchPanelStack',
      'touchPanel',
      'touchDateSurfaceStack',
      'touchDateSurface',
      'touchTimeWheels',
    ]) {
      expect(styleBlock(name)).toContain("inlineSize: '100%'");
      expect(styleBlock(name)).toContain('minInlineSize: 0');
    }
  });

  it('keeps accepting in-sheet edits while a changeAction is pending', () => {
    const onChange = vi.fn();
    const changeAction = vi.fn(async () => new Promise<void>(() => {}));
    render(
      <DateTimeInput
        label="Meeting"
        value={'2026-03-15T14:30' as ISODateTimeString}
        onChange={onChange}
        changeAction={changeAction}
      />,
    );
    openSheet();
    openTimePanel();

    fireEvent.click(optionIn('Hour', '3'));
    expect(onChange).toHaveBeenCalledWith('2026-03-15T15:30');
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-busy', 'true');

    fireEvent.click(optionIn('Minute', '45'));
    expect(onChange).toHaveBeenCalledWith('2026-03-15T15:45');
    expect(changeAction).toHaveBeenCalledTimes(2);
  });

  it('clamps drafted time to the selected date boundary', () => {
    const onChange = vi.fn();
    withMonthLayout(() => {
      render(
        <DateTimeInput
          label="Meeting"
          min={'2026-03-21T09:00' as ISODateTimeString}
          onChange={onChange}
        />,
      );
      openSheet();
      openTimePanel();
      fireEvent.click(optionIn('Hour', '3'));

      fireEvent.click(screen.getByRole('radio', {name: 'Date'}));
      fireEvent.click(
        screen.getByRole('button', {name: 'Saturday, March 21, 2026'}),
      );

      expect(onChange).toHaveBeenCalledWith('2026-03-21T09:00');
    });
  });

  it('honors dateConstraints in the Date panel', () => {
    const onChange = vi.fn();
    withMonthLayout(() => {
      render(
        <DateTimeInput
          label="Meeting"
          dateConstraints={[date => date.getDate() !== 21]}
          onChange={onChange}
        />,
      );
      openSheet();
      const disabledDay = screen.getByRole('button', {
        name: 'Saturday, March 21, 2026',
      });

      expect(disabledDay).toHaveAttribute('aria-disabled', 'true');
      fireEvent.click(disabledDay);
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  it('Reset clears the value and leaves the sheet open on the Date panel', () => {
    const onChange = vi.fn();
    withMonthLayout(() => {
      render(
        <DateTimeInput
          label="Meeting"
          value={'2026-03-15T10:00' as ISODateTimeString}
          onChange={onChange}
        />,
      );
      const field = openSheet();

      fireEvent.click(screen.getByRole('button', {name: 'Reset'}));
      expect(onChange).toHaveBeenCalledWith(undefined);
      expect(field).toHaveAttribute('aria-expanded', 'true');
      expect(screen.getByRole('radio', {name: 'Date'})).toHaveAttribute(
        'aria-checked',
        'true',
      );
    });
  });

  it('Save closes the sheet without changing the value', () => {
    const onChange = vi.fn();
    withMonthLayout(() => {
      render(<DateTimeInput label="Meeting" onChange={onChange} />);
      const field = openSheet();

      fireEvent.click(screen.getByRole('button', {name: 'Save'}));
      expect(field).toHaveAttribute('aria-expanded', 'false');
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  it('disables out-of-range seconds on the min/max boundary time', () => {
    render(
      <DateTimeInput
        label="Meeting"
        value={'2026-03-15T14:30:30' as ISODateTimeString}
        min={'2026-03-15T14:30:30' as ISODateTimeString}
        max={'2026-03-15T14:30:30' as ISODateTimeString}
        hasSeconds
        onChange={() => {}}
      />,
    );
    openSheet();
    openTimePanel();

    expect(optionIn('Second', '29')).toHaveAttribute('aria-disabled', 'true');
    expect(optionIn('Second', '30')).not.toHaveAttribute('aria-disabled');
    expect(optionIn('Second', '31')).toHaveAttribute('aria-disabled', 'true');
  });

  it('reflects controlled value changes in the closed field', () => {
    const {rerender} = render(
      <DateTimeInput
        label="Meeting"
        value={'2026-03-15T10:00' as ISODateTimeString}
        onChange={() => {}}
      />,
    );
    expect(
      screen.getByDisplayValue('March 15, 2026, 10:00 AM'),
    ).toBeInTheDocument();

    rerender(
      <DateTimeInput
        label="Meeting"
        value={'2026-03-16T18:45' as ISODateTimeString}
        onChange={() => {}}
      />,
    );
    expect(
      screen.getByDisplayValue('March 16, 2026, 6:45 PM'),
    ).toBeInTheDocument();
  });

  it('clears the whole datetime and restores focus on the next task', () => {
    vi.useFakeTimers();
    const onChange = vi.fn();
    render(
      <DateTimeInput
        label="Meeting"
        value={'2026-03-15T10:00' as ISODateTimeString}
        hasClear
        onChange={onChange}
      />,
    );
    const field = screen.getByRole('combobox');
    const focusSpy = vi.spyOn(field, 'focus');

    fireEvent.click(screen.getByRole('button', {name: 'Clear Meeting'}));
    expect(onChange).toHaveBeenCalledWith(undefined);
    expect(focusSpy).not.toHaveBeenCalled();

    vi.runAllTimers();
    expect(focusSpy).toHaveBeenCalledWith({preventScroll: true});
    vi.useRealTimers();
  });

  it('blocks opening, clearing and in-sheet edits while loading', () => {
    const onChange = vi.fn();
    const {rerender} = render(
      <DateTimeInput
        label="Meeting"
        value={'2026-03-15T14:30' as ISODateTimeString}
        isLoading
        hasClear
        onChange={onChange}
      />,
    );
    const loadingField = screen.getByRole('combobox');
    fireEvent.click(loadingField);
    expect(loadingField).toHaveAttribute('aria-expanded', 'false');
    expect(
      screen.queryByRole('button', {name: 'Clear Meeting'}),
    ).not.toBeInTheDocument();

    rerender(
      <DateTimeInput
        label="Meeting"
        value={'2026-03-15T14:30' as ISODateTimeString}
        hasClear
        onChange={onChange}
      />,
    );
    const field = screen.getByRole('combobox');
    fireEvent.click(field);
    openTimePanel();
    expect(field).toHaveAttribute('aria-expanded', 'true');

    rerender(
      <DateTimeInput
        label="Meeting"
        value={'2026-03-15T14:30' as ISODateTimeString}
        isLoading
        hasClear
        onChange={onChange}
      />,
    );
    expect(field).toHaveAttribute('aria-expanded', 'false');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('keeps a disabled reason reachable while blocking activation', () => {
    render(
      <DateTimeInput
        label="Meeting"
        isDisabled
        disabledMessage="Choose a project first"
        onChange={() => {}}
      />,
    );
    const field = screen.getByRole('combobox');

    expect(field).not.toBeDisabled();
    expect(field).toHaveAttribute('aria-disabled', 'true');
    expect(field.getAttribute('aria-describedby')).toContain(
      screen.getByRole('tooltip', {hidden: true}).id,
    );
    fireEvent.click(field);
    expect(field).toHaveAttribute('aria-expanded', 'false');
  });
});
