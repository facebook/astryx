// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Wheel.test.tsx
 * @input Uses Vitest, Testing Library and the Wheel column
 * @output Proves where a wheel rests when it stops on a row it cannot commit
 * @position Unit coverage for Wheel.tsx's rest rule; the wheels inside the
 *   DateInput, DateTimeInput and TimeInput sheets are covered by their own
 *   touch suites
 */

import {act, render, screen} from '@testing-library/react';
import {afterEach, beforeAll, describe, expect, it, vi} from 'vitest';
import {nearestEnabledIndex, Wheel, type WheelOption} from './Wheel';

const ROW = 28;

beforeAll(() => {
  // jsdom implements no scrolling; the wheel parks its committed row on mount.
  Element.prototype.scrollTo = vi.fn();
});

/** Hours 0-23 with 09:00-17:00 bounds: 0-8 and 18-23 are disabled. */
const HOURS: WheelOption[] = Array.from({length: 24}, (_, hour) => ({
  value: hour,
  label: String(hour).padStart(2, '0'),
  isDisabled: hour < 9 || hour > 17,
}));

describe('nearestEnabledIndex', () => {
  it('keeps an enabled row', () => {
    expect(nearestEnabledIndex(HOURS, 12, 10)).toBe(12);
  });

  it('goes to the bound on the side the wheel stopped on', () => {
    expect(nearestEnabledIndex(HOURS, 7, 10)).toBe(9);
    expect(nearestEnabledIndex(HOURS, 0, 10)).toBe(9);
    expect(nearestEnabledIndex(HOURS, 20, 10)).toBe(17);
    expect(nearestEnabledIndex(HOURS, 23, 10)).toBe(17);
  });

  it('breaks a tie toward the committed row', () => {
    const gap: WheelOption[] = [
      {value: 0, label: '0'},
      {value: 1, label: '1', isDisabled: true},
      {value: 2, label: '2'},
    ];
    expect(nearestEnabledIndex(gap, 1, 0)).toBe(0);
    expect(nearestEnabledIndex(gap, 1, 2)).toBe(2);
  });

  it('stays on the committed row when no row is enabled', () => {
    const none = HOURS.map(option => ({...option, isDisabled: true}));
    expect(nearestEnabledIndex(none, 3, 10)).toBe(10);
  });
});

describe('Wheel — where it comes to rest', () => {
  afterEach(() => {
    // @ts-expect-error - deleting the shadow restores Element's own getter
    delete HTMLElement.prototype.offsetHeight;
  });

  /**
   * jsdom has no layout: rows get a height, and the scroller's scrollTop
   * and scrollTo are recorded so a test can stop the wheel on any row.
   */
  function renderWheel(value: number) {
    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
      configurable: true,
      get(this: HTMLElement) {
        return this.getAttribute('role') === 'option' ? ROW : 0;
      },
    });
    const onChange = vi.fn();
    const scrollTo = vi.fn();
    const {rerender} = render(
      <Wheel label="Hour" options={HOURS} value={value} onChange={onChange} />,
    );
    const scroller = screen.getByRole('listbox', {name: 'Hour'});
    let top = value * ROW;
    Object.defineProperty(scroller, 'scrollTop', {
      configurable: true,
      get: () => top,
      set: (next: number) => {
        top = next;
      },
    });
    scroller.scrollTo = ((options: ScrollToOptions) => {
      scrollTo(options);
    }) as HTMLElement['scrollTo'];
    /** The wheel scrolls to `row` and stops there. */
    const stopOn = (row: number) => {
      act(() => {
        top = row * ROW;
        scroller.dispatchEvent(new Event('scroll'));
        scroller.dispatchEvent(new Event('scrollend'));
      });
    };
    return {onChange, scrollTo, stopOn, rerender};
  }

  it('commits an enabled row it stops on', () => {
    const {onChange, scrollTo, stopOn} = renderWheel(10);
    stopOn(12);
    expect(scrollTo).not.toHaveBeenCalled();
    expect(onChange).toHaveBeenCalledWith(12);
  });

  it('stopping below the minimum travels on to the minimum and commits it there', () => {
    const {onChange, scrollTo, stopOn} = renderWheel(10);
    stopOn(7);
    // Not back to the committed 10: on to 9, the nearest hour in bounds.
    expect(scrollTo).toHaveBeenCalledWith({top: 9 * ROW, behavior: 'smooth'});
    expect(onChange).not.toHaveBeenCalled();
    // The second rest, on 9, commits it.
    stopOn(9);
    expect(onChange).toHaveBeenCalledWith(9);
  });

  it('stopping past the maximum travels back to the maximum', () => {
    const {onChange, scrollTo, stopOn} = renderWheel(10);
    stopOn(21);
    expect(scrollTo).toHaveBeenCalledWith({
      top: 17 * ROW,
      behavior: 'smooth',
    });
    stopOn(17);
    expect(onChange).toHaveBeenCalledWith(17);
  });

  it('never commits a disabled row, even with nowhere valid to go', () => {
    const none = HOURS.map(option => ({...option, isDisabled: true}));
    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
      configurable: true,
      get(this: HTMLElement) {
        return this.getAttribute('role') === 'option' ? ROW : 0;
      },
    });
    const onChange = vi.fn();
    render(
      <Wheel label="Hour" options={none} value={10} onChange={onChange} />,
    );
    const scroller = screen.getByRole('listbox', {name: 'Hour'});
    let top = 10 * ROW;
    Object.defineProperty(scroller, 'scrollTop', {
      configurable: true,
      get: () => top,
    });
    scroller.scrollTo = vi.fn() as HTMLElement['scrollTo'];
    act(() => {
      top = 4 * ROW;
      scroller.dispatchEvent(new Event('scroll'));
      scroller.dispatchEvent(new Event('scrollend'));
    });
    expect(scroller.scrollTo).toHaveBeenCalledWith({
      top: 10 * ROW,
      behavior: 'smooth',
    });
    expect(onChange).not.toHaveBeenCalled();
  });
});
