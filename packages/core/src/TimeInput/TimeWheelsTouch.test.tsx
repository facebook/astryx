// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file TimeWheelsTouch.test.tsx
 * @input Uses vitest, Testing Library, TimeInput and DateTimeInput
 * @output Tests that the bottom sheet's time wheels follow UIDatePicker under
 *   a finger, on iOS WebKit and on Android alike: the AM/PM column follows the
 *   hour and `increment` steps the minutes; under a mouse the sheet keeps
 *   today's independent columns
 * @position Testing; the touch gate of TouchTimeField and TouchDateTimeField
 */

import {useState} from 'react';
import {afterEach, beforeAll, describe, expect, it, vi} from 'vitest';
import {fireEvent, render, screen, within} from '@testing-library/react';
import {TimeInput} from './TimeInput';
import {DateTimeInput} from '../DateTimeInput/DateTimeInput';
import {IOS_SUPPORTS_QUERY} from '../utils/touchPresentation';
import type {
  DateTimeInputTimeIncrement,
  ISODateTimeString,
} from '../DateTimeInput/DateTimeInput';
import type {ISOTimeString} from '../utils';

class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

/**
 * A device: a finger or a mouse, and whether the engine is iOS WebKit. The
 * sheet's behaviour depends only on the pointer; the engine is stubbed to
 * show that an iPhone and an Android finger get the same wheels.
 */
function stubDevice({
  isCoarse,
  isIosWebKit,
}: {
  isCoarse: boolean;
  isIosWebKit: boolean;
}): void {
  vi.stubGlobal('matchMedia', (query: string) => ({
    // No reduced-motion preference; the policy's combined query names the
    // pointer too, so the preference is checked first.
    matches: query.includes('prefers-reduced-motion')
      ? false
      : /pointer:\s*coarse/.test(query)
        ? isCoarse
        : /pointer:\s*fine/.test(query)
          ? !isCoarse
          : false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }));
  vi.stubGlobal('CSS', {
    supports: (condition: string) =>
      isIosWebKit && condition === IOS_SUPPORTS_QUERY,
  });
  vi.stubGlobal('ResizeObserver', MockResizeObserver);
}

const IOS = {isCoarse: true, isIosWebKit: true};
const ANDROID = {isCoarse: true, isIosWebKit: false};
const MOUSE = {isCoarse: false, isIosWebKit: false};

beforeAll(() => {
  window.scrollTo = vi.fn();
  Element.prototype.scrollTo = vi.fn();
  Element.prototype.scrollIntoView = vi.fn();
  HTMLDialogElement.prototype.showModal = vi.fn(function (
    this: HTMLDialogElement,
  ) {
    this.open = true;
  });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    this.open = false;
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function ControlledTime({
  initial,
  increment,
  onChange,
}: {
  initial: ISOTimeString;
  increment?: number;
  onChange: (value: ISOTimeString | undefined) => void;
}) {
  const [value, setValue] = useState<ISOTimeString | undefined>(initial);
  return (
    <TimeInput
      label="Alarm"
      presentation="bottom-sheet"
      value={value}
      increment={increment}
      onChange={next => {
        onChange(next);
        setValue(next);
      }}
    />
  );
}

function openTimeSheet() {
  fireEvent.click(screen.getByRole('combobox', {name: 'Alarm'}));
  return {
    hour: screen.getByRole('listbox', {name: 'Hour'}),
    minute: screen.getByRole('listbox', {name: 'Minute'}),
  };
}

describe('TimeInput sheet wheels under a finger and a mouse', () => {
  it.each([
    ['an iPhone', IOS],
    ['an Android', ANDROID],
  ])('turns AM to PM from 11 to 12 under %s finger', (_, device) => {
    stubDevice(device);
    const onChange = vi.fn();
    render(
      <ControlledTime initial={'11:58' as ISOTimeString} onChange={onChange} />,
    );
    fireEvent.keyDown(openTimeSheet().hour, {key: 'ArrowDown'});
    expect(onChange).toHaveBeenLastCalledWith('12:58');
  });

  it('keeps today’s independent columns under a mouse', () => {
    stubDevice(MOUSE);
    expect(matchMedia('(pointer: coarse)').matches).toBe(false);
    const onChange = vi.fn();
    render(
      <ControlledTime initial={'11:58' as ISOTimeString} onChange={onChange} />,
    );
    fireEvent.keyDown(openTimeSheet().hour, {key: 'ArrowDown'});
    expect(onChange).toHaveBeenLastCalledWith('00:58');
  });

  it('steps the minutes by `increment` under a finger only', () => {
    stubDevice(ANDROID);
    const {unmount} = render(
      <ControlledTime
        initial={'09:00' as ISOTimeString}
        increment={15}
        onChange={() => {}}
      />,
    );
    expect(
      within(openTimeSheet().minute)
        .getAllByRole('option')
        .map(option => option.textContent),
    ).toEqual(['00', '15', '30', '45']);
    unmount();

    stubDevice(MOUSE);
    expect(matchMedia('(pointer: coarse)').matches).toBe(false);
    render(
      <ControlledTime
        initial={'09:00' as ISOTimeString}
        increment={15}
        onChange={() => {}}
      />,
    );
    expect(within(openTimeSheet().minute).getAllByRole('option')).toHaveLength(
      60,
    );
  });
});

describe('TimeInput sheet wheels: a short minute list loops like the full list', () => {
  /** The minute column's drawn rows, the short loop's copies included. */
  function drumLabels(minute: HTMLElement): string[] {
    const column = minute.closest('[data-wheel]') ?? minute;
    return [
      ...column.querySelectorAll<HTMLElement>(
        '[data-wheel-strip] > [data-label]',
      ),
    ].map(row => row.dataset.label!);
  }

  it.each([
    [15, '10:45', '10:00', ['00', '15', '30', '45']],
    [30, '10:30', '10:00', ['00', '30']],
  ] as const)(
    'under a finger, a minute column stepped by %i wraps both ways without carrying the hour, its copies filling the column',
    (increment, initial, next, options) => {
      stubDevice(IOS);
      const onChange = vi.fn();
      render(
        <ControlledTime
          initial={initial as ISOTimeString}
          increment={increment}
          onChange={onChange}
        />,
      );
      const {minute} = openTimeSheet();
      // One option per step for assistive technology; copies on the drum.
      expect(
        within(minute)
          .getAllByRole('option')
          .map(option => option.textContent),
      ).toEqual(options);
      expect(
        drumLabels(minute).filter(label => label === '00').length,
      ).toBeGreaterThan(1);
      // UIDatePicker: 10:45 + 1 row is 10:00, and back.
      fireEvent.keyDown(minute, {key: 'ArrowDown'});
      expect(onChange).toHaveBeenLastCalledWith(next);
      fireEvent.keyDown(screen.getByRole('listbox', {name: 'Minute'}), {
        key: 'ArrowUp',
      });
      expect(onChange).toHaveBeenLastCalledWith(initial);
    },
  );
});

describe('opening a bounded sheet never changes an untouched value', () => {
  it.each([
    ['an iPhone', IOS],
    ['an Android', ANDROID],
  ])(
    'TimeInput under %s finger: 8:00 under a 9:00 minimum stays 8:00, and an empty field stays empty',
    (_, device) => {
      stubDevice(device);
      const onChange = vi.fn();
      const {unmount} = render(
        <TimeInput
          label="Alarm"
          presentation="bottom-sheet"
          value={'08:00' as ISOTimeString}
          min={'09:00' as ISOTimeString}
          max={'17:00' as ISOTimeString}
          onChange={onChange}
        />,
      );
      const {hour} = openTimeSheet();
      expect(
        document.getElementById(hour.getAttribute('aria-activedescendant')!)
          ?.textContent,
      ).toBe('8');
      expect(onChange).not.toHaveBeenCalled();
      unmount();

      render(
        <TimeInput
          label="Alarm"
          presentation="bottom-sheet"
          min={'09:00' as ISOTimeString}
          max={'17:00' as ISOTimeString}
          onChange={onChange}
        />,
      );
      openTimeSheet();
      expect(onChange).not.toHaveBeenCalled();
      expect(screen.getByRole('combobox', {name: 'Alarm'})).toHaveValue('');
    },
  );

  it('DateTimeInput: a time before the minimum stays, and an empty field stays empty', () => {
    stubDevice(ANDROID);
    const onChange = vi.fn();
    const {unmount} = render(
      <DateTimeInput
        label="Meeting"
        presentation="bottom-sheet"
        value={'2026-03-15T08:00' as ISODateTimeString}
        min={'2026-03-15T09:00' as ISODateTimeString}
        max={'2026-03-15T17:00' as ISODateTimeString}
        onChange={onChange}
      />,
    );
    const hour = openTimePanel();
    expect(
      document.getElementById(hour.getAttribute('aria-activedescendant')!)
        ?.textContent,
    ).toBe('8');
    expect(onChange).not.toHaveBeenCalled();
    unmount();

    render(
      <DateTimeInput
        label="Meeting"
        presentation="bottom-sheet"
        min={'2026-03-15T09:00' as ISODateTimeString}
        max={'2026-03-15T17:00' as ISODateTimeString}
        onChange={onChange}
      />,
    );
    openTimePanel();
    expect(onChange).not.toHaveBeenCalled();
  });
});

function ControlledDateTime({
  initial = '2026-03-15T11:58' as ISODateTimeString,
  timeIncrement,
  onChange,
}: {
  initial?: ISODateTimeString;
  timeIncrement?: DateTimeInputTimeIncrement;
  onChange: (value: ISODateTimeString | undefined) => void;
}) {
  const [value, setValue] = useState<ISODateTimeString | undefined>(initial);
  return (
    <DateTimeInput
      label="Meeting"
      presentation="bottom-sheet"
      value={value}
      timeIncrement={timeIncrement}
      onChange={next => {
        onChange(next);
        setValue(next);
      }}
    />
  );
}

function openTimePanel() {
  fireEvent.click(screen.getAllByRole('button', {name: /^Open /})[0]);
  fireEvent.click(screen.getByRole('radio', {name: 'Time'}));
  return screen.getByRole('listbox', {name: 'Hour'});
}

describe('DateTimeInput sheet wheels under a finger and a mouse', () => {
  it.each([
    ['an iPhone', IOS],
    ['an Android', ANDROID],
  ])('turns AM to PM from 11 to 12 under %s finger', (_, device) => {
    stubDevice(device);
    const onChange = vi.fn();
    render(<ControlledDateTime onChange={onChange} />);
    fireEvent.keyDown(openTimePanel(), {key: 'ArrowDown'});
    expect(onChange).toHaveBeenLastCalledWith('2026-03-15T12:58');
  });

  it('under a finger, wraps a minute column stepped by 15 at 11:45 PM onto 11:00 PM the same evening, and back', () => {
    stubDevice(ANDROID);
    const onChange = vi.fn();
    render(
      <ControlledDateTime
        initial={'2026-03-15T23:45' as ISODateTimeString}
        timeIncrement={15}
        onChange={onChange}
      />,
    );
    openTimePanel();
    fireEvent.keyDown(screen.getByRole('listbox', {name: 'Minute'}), {
      key: 'ArrowDown',
    });
    expect(onChange).toHaveBeenLastCalledWith('2026-03-15T23:00');
    fireEvent.keyDown(screen.getByRole('listbox', {name: 'Minute'}), {
      key: 'ArrowUp',
    });
    expect(onChange).toHaveBeenLastCalledWith('2026-03-15T23:45');
  });

  it('keeps a stepped minute wheel on the same evening at 11:58 PM', () => {
    stubDevice(ANDROID);
    const onChange = vi.fn();
    render(
      <ControlledDateTime
        initial={'2026-03-15T23:58' as ISODateTimeString}
        timeIncrement={15}
        onChange={onChange}
      />,
    );
    const hour = openTimePanel();
    const restingLabel = (name: string) => {
      const list = screen.getByRole('listbox', {name});
      const id = list.getAttribute('aria-activedescendant');
      return id == null ? null : document.getElementById(id)?.textContent;
    };
    // 23:58 shows as 11:45 PM, the last step of the day, not 12:00 AM.
    expect(hour).toBeInTheDocument();
    expect(restingLabel('Hour')).toBe('11');
    expect(restingLabel('Minute')).toBe('45');
    expect(restingLabel('AM/PM')).toBe('PM');
    fireEvent.keyDown(screen.getByRole('listbox', {name: 'Minute'}), {
      key: 'ArrowUp',
    });
    expect(onChange).toHaveBeenLastCalledWith('2026-03-15T23:30');
  });

  it('keeps today’s independent columns under a mouse', () => {
    stubDevice(MOUSE);
    expect(matchMedia('(pointer: coarse)').matches).toBe(false);
    const onChange = vi.fn();
    render(<ControlledDateTime onChange={onChange} />);
    fireEvent.keyDown(openTimePanel(), {key: 'ArrowDown'});
    expect(onChange).toHaveBeenLastCalledWith('2026-03-15T00:58');
  });
});
