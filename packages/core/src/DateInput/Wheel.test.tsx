// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Wheel.test.tsx
 * @input Uses Vitest, Testing Library, the Wheel column and a stubbed
 *   matchMedia (and CSS.supports, to show the engine does not matter)
 * @output Proves where today's wheel rests when it stops on a row it cannot
 *   commit, and which column (and which frame) each primary pointer draws
 * @position Unit coverage for Wheel.tsx: the switch and today's column
 *   (PickerWheel.test.tsx covers the touch column); the wheels inside the
 *   DateInput, DateTimeInput and TimeInput sheets are covered by their own
 *   touch suites
 */

import {act, fireEvent, render, screen} from '@testing-library/react';
import {createRef} from 'react';
import {afterEach, beforeAll, describe, expect, it, vi} from 'vitest';
import {
  nearestEnabledIndex,
  ScrollWheel,
  Wheel,
  type WheelHandle,
  type WheelOption,
} from './Wheel';

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
  function renderWheel(value: number, Column: typeof ScrollWheel = Wheel) {
    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
      configurable: true,
      get(this: HTMLElement) {
        return this.getAttribute('role') === 'option' ? ROW : 0;
      },
    });
    const onChange = vi.fn();
    const scrollTo = vi.fn();
    const {rerender} = render(
      <Column label="Hour" options={HOURS} value={value} onChange={onChange} />,
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

  it('opening on a value outside the bounds parks on it without travelling or committing', () => {
    // 08:00 with 09:00-17:00 bounds: the sheet opens, the wheel parks on 8,
    // and the browser reports that scroll's rest. Nobody touched the wheel,
    // so nothing may move or commit.
    const {onChange, scrollTo, stopOn} = renderWheel(8);
    stopOn(8);
    expect(scrollTo).not.toHaveBeenCalled();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('a stop on another disabled row still travels to the bounds', () => {
    const {onChange, scrollTo, stopOn} = renderWheel(8);
    stopOn(6);
    expect(scrollTo).toHaveBeenCalledWith({top: 9 * ROW, behavior: 'smooth'});
    stopOn(9);
    expect(onChange).toHaveBeenCalledWith(9);
  });

  describe('under reduced motion', () => {
    afterEach(() => {
      vi.unstubAllGlobals();
      vi.useRealTimers();
    });

    /** Reduced motion on, with a fine or a coarse primary pointer. */
    function stubReducedMotion(pointer: 'fine' | 'coarse') {
      vi.stubGlobal('matchMedia', (query: string) => ({
        matches:
          query === '(prefers-reduced-motion: reduce)' ||
          (query === '(pointer: coarse)' && pointer === 'coarse'),
        media: query,
        addEventListener: () => {},
        removeEventListener: () => {},
      }));
    }

    it('lands on the nearest row in bounds at once with a mouse', () => {
      stubReducedMotion('fine');
      expect(window.matchMedia('(pointer: coarse)').matches).toBe(false);
      const {scrollTo, stopOn} = renderWheel(10);
      stopOn(7);
      expect(scrollTo).toHaveBeenCalledWith({top: 9 * ROW, behavior: 'auto'});
      expect(scrollTo).not.toHaveBeenCalledWith(
        expect.objectContaining({behavior: 'smooth'}),
      );
    });

    it('cross-fades onto it after a touch: opacity only, 200 ms', () => {
      // A touch screen whose primary pointer is fine (a laptop's): today's
      // column, and a touch release fades (DR2).
      stubReducedMotion('fine');
      vi.useFakeTimers();
      const {scrollTo, stopOn} = renderWheel(10);
      const scroller = screen.getByRole('listbox', {name: 'Hour'});
      fireEvent.pointerDown(scroller, {pointerType: 'touch'});
      const animate = vi.fn();
      scroller.animate = animate as HTMLElement['animate'];
      stopOn(7);
      expect(animate).toHaveBeenCalledTimes(1);
      const [keyframes, timing] = animate.mock.calls[0];
      // Out and back in, opacity alone.
      expect((keyframes as Keyframe[]).map(frame => frame.opacity)).toEqual([
        1, 0, 1,
      ]);
      for (const frame of keyframes as Keyframe[]) {
        expect(
          Object.keys(frame).filter(
            key => key !== 'offset' && key !== 'easing',
          ),
        ).toEqual(['opacity']);
      }
      expect(timing.duration).toBeLessThanOrEqual(200);
      // The rows land at the dip's midpoint, with no travel.
      expect(scrollTo).not.toHaveBeenCalled();
      act(() => {
        vi.advanceTimersByTime(timing.duration / 2);
      });
      expect(scrollTo).toHaveBeenCalledWith({top: 9 * ROW, behavior: 'auto'});
    });

    it('steps with the arrow keys at once with a keyboard', () => {
      stubReducedMotion('fine');
      const {scrollTo} = renderWheel(10);
      const scroller = screen.getByRole('listbox', {name: 'Hour'});
      act(() => {
        scroller.dispatchEvent(
          new KeyboardEvent('keydown', {key: 'ArrowDown', bubbles: true}),
        );
      });
      expect(scrollTo).toHaveBeenCalledWith({
        top: 11 * ROW,
        behavior: 'auto',
      });
    });

    /** Steps the wheel down one row with the keyboard. */
    function pressArrowDown() {
      const scroller = screen.getByRole('listbox', {name: 'Hour'});
      act(() => {
        scroller.dispatchEvent(
          new KeyboardEvent('keydown', {key: 'ArrowDown', bubbles: true}),
        );
      });
    }

    it('lands an arrow key step on a coarse pointer under its cross-fade, not before', () => {
      // A finger gets the touch column (PickerWheel.test.tsx); today's
      // column keeps its dip for a coarse pointer wherever it is rendered.
      stubReducedMotion('coarse');
      vi.useFakeTimers();
      const {onChange, scrollTo, rerender} = renderWheel(10, ScrollWheel);
      const scroller = screen.getByRole('listbox', {name: 'Hour'});
      const animate = vi.fn();
      scroller.animate = animate as HTMLElement['animate'];
      pressArrowDown();
      expect(onChange).toHaveBeenCalledWith(11);
      // The parent takes the step. The new value must not move the rows
      // while they are still fully visible: they land under the dip.
      rerender(
        <ScrollWheel
          label="Hour"
          options={HOURS}
          value={11}
          onChange={onChange}
        />,
      );
      expect(animate).toHaveBeenCalledTimes(1);
      expect(scrollTo).not.toHaveBeenCalled();
      const [, timing] = animate.mock.calls[0];
      act(() => {
        vi.advanceTimersByTime(timing.duration / 2);
      });
      expect(scrollTo.mock.calls).toEqual([
        [{top: 11 * ROW, behavior: 'auto'}],
      ]);
    });

    it('starts a second step’s dip where the first one’s fade-in has the column', () => {
      // design:reduced-motion DR2: a leaving element fades out where it is,
      // so a step during the last dip's fade-in never pops back to opaque.
      // A finger gets the touch column (PickerWheel.test.tsx); today's
      // column keeps its dip for a coarse pointer wherever it is rendered.
      stubReducedMotion('coarse');
      vi.useFakeTimers();
      renderWheel(10, ScrollWheel);
      const scroller = screen.getByRole('listbox', {name: 'Hour'});
      const animate = vi.fn();
      scroller.animate = animate as HTMLElement['animate'];
      pressArrowDown();
      const [first, timing] = animate.mock.calls[0];
      expect((first as Keyframe[])[0].opacity).toBe(1);
      // Past the midpoint: the rows have landed and the column fades back in.
      act(() => {
        vi.advanceTimersByTime(timing.duration / 2 + 40);
      });
      scroller.style.opacity = '0.5';
      pressArrowDown();
      expect(animate).toHaveBeenCalledTimes(2);
      const [second] = animate.mock.calls[1];
      expect((second as Keyframe[]).map(frame => frame.opacity)).toEqual([
        0.5, 0, 1,
      ]);
    });

    it('changes at once after an earlier touch on a fine pointer, for a key or a tap', () => {
      // A touch screen whose primary pointer is fine (a laptop's): only a
      // touch drag's release fades (DR2); a key step or a row tap is
      // immediate (DR3).
      stubReducedMotion('fine');
      const {scrollTo} = renderWheel(10);
      const scroller = screen.getByRole('listbox', {name: 'Hour'});
      const animate = vi.fn();
      scroller.animate = animate as HTMLElement['animate'];
      fireEvent.pointerDown(scroller, {pointerType: 'touch'});
      pressArrowDown();
      expect(scrollTo).toHaveBeenLastCalledWith({
        top: 11 * ROW,
        behavior: 'auto',
      });
      fireEvent.pointerDown(scroller, {pointerType: 'touch'});
      fireEvent.click(screen.getByRole('option', {name: '13'}));
      expect(scrollTo).toHaveBeenLastCalledWith({
        top: 13 * ROW,
        behavior: 'auto',
      });
      expect(animate).not.toHaveBeenCalled();
    });

    it('cross-fades the travel after a touch drag on a fine pointer', () => {
      stubReducedMotion('fine');
      vi.useFakeTimers();
      const {scrollTo, stopOn} = renderWheel(10);
      const scroller = screen.getByRole('listbox', {name: 'Hour'});
      const animate = vi.fn();
      scroller.animate = animate as HTMLElement['animate'];
      fireEvent.pointerDown(scroller, {pointerType: 'touch'});
      stopOn(7);
      expect(animate).toHaveBeenCalledTimes(1);
      expect(scrollTo).not.toHaveBeenCalled();
      act(() => {
        vi.advanceTimersByTime(animate.mock.calls[0][1].duration / 2);
      });
      expect(scrollTo).toHaveBeenCalledWith({top: 9 * ROW, behavior: 'auto'});
    });

    it('travels at once after a trackpad scroll that follows a touch, on a fine pointer', () => {
      stubReducedMotion('fine');
      const {scrollTo, stopOn} = renderWheel(10);
      const scroller = screen.getByRole('listbox', {name: 'Hour'});
      const animate = vi.fn();
      scroller.animate = animate as HTMLElement['animate'];
      fireEvent.pointerDown(scroller, {pointerType: 'touch'});
      fireEvent.wheel(scroller, {deltaY: -120});
      stopOn(7);
      expect(animate).not.toHaveBeenCalled();
      expect(scrollTo).toHaveBeenCalledWith({top: 9 * ROW, behavior: 'auto'});
    });
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

describe('Wheel — by pointer', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  /**
   * The pointer and the engine: `(pointer: coarse)` is a finger, and
   * `-webkit-touch-callout` exists only in WebKit on iOS, which must not
   * matter.
   */
  function stubDevice({ios, coarse}: {ios: boolean; coarse: boolean}) {
    vi.stubGlobal('CSS', {
      supports: (condition: string) =>
        ios && condition.includes('-webkit-touch-callout'),
    });
    vi.stubGlobal(
      'matchMedia',
      vi.fn((query: string) => ({
        matches: query === '(pointer: coarse)' && coarse,
        media: query,
        addEventListener: () => {},
        removeEventListener: () => {},
      })),
    );
  }

  function renderPicker() {
    const ref = createRef<WheelHandle>();
    const onChange = vi.fn();
    const view = render(
      <Wheel
        ref={ref}
        label="Hour"
        options={HOURS}
        value={12}
        onChange={onChange}
      />,
    );
    return {...view, ref, onChange};
  }

  it.each([
    ['iOS WebKit', true],
    ['Android Chrome', false],
  ])('draws the touch column under a finger, on %s', (_, ios) => {
    stubDevice({ios, coarse: true});
    const {container} = renderPicker();
    expect(container.querySelector('[data-wheel]')).not.toBeNull();
    // Each option is a drawn row, once.
    expect(container.querySelectorAll('[data-wheel-row]')).toHaveLength(
      HOURS.length,
    );
  });

  it.each([
    ['a mouse', false],
    ['iOS WebKit with a mouse', true],
  ])('keeps the scrolling column, with no frame, for %s', (_, ios) => {
    stubDevice({ios, coarse: false});
    const {container} = renderPicker();
    expect(container.querySelector('[data-wheel]')).toBeNull();
    // Today's column, straight in its container: no group frame around it.
    expect(
      screen.getByRole('listbox', {name: 'Hour'}).parentElement?.parentElement,
    ).toBe(container);
  });

  it('commits a spin at once under a fine pointer', async () => {
    stubDevice({ios: false, coarse: false});
    expect(window.matchMedia('(pointer: coarse)').matches).toBe(false);
    const {ref, onChange} = renderPicker();
    await expect(ref.current?.spinTo(14)).resolves.toBe(true);
    expect(onChange).toHaveBeenCalledWith(14);
    // A disabled row is not a place to rest.
    await expect(ref.current?.spinTo(3)).resolves.toBe(false);
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
