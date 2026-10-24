// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file useToggleFade.test.tsx
 * @input useToggleFade, toggleFadeCurve, the UIKit constants table
 * @output Unit tests: the toggle's fade is UIDatePicker's 0.25 s on the
 *   ease-in-ease-out from the value on screen, and the hook places its element
 *   without a fade on mount and fades it on each change
 * @position Colocated test of useToggleFade.ts
 */

import {render} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import {cubicBezier} from '../motion/bezier';
import {datePicker} from '../motion/uikit/datePicker';
import {timing} from '../motion/uikit/timing';
import {toggleFadeCurve, useToggleFade} from './useToggleFade';

const ease = cubicBezier(timing.curves.easeInOut);
const FADE_S = datePicker.calendar.monthYearToggle.fadeMs / 1000;

describe('toggleFadeCurve', () => {
  it('runs the table\u2019s 0.25 s on UIView.animate\u2019s ease-in-ease-out', () => {
    const curve = toggleFadeCurve(0, 1);
    expect(curve.duration).toBeCloseTo(FADE_S, 9);
    expect(FADE_S).toBe(0.25);
    for (const t of [0, 0.05, 0.1, 0.125, 0.2, 0.25]) {
      expect(curve.at(t)).toBeCloseTo(ease(t / FADE_S), 9);
    }
    expect(curve.at(0.125)).toBeCloseTo(0.5, 6);
    expect(curve.velocity(0)).toBe(0);
    expect(curve.velocity(FADE_S)).toBe(0);
    expect(curve.velocity(0.125)).toBeGreaterThan(0);
  });

  it('begins from the value on screen and still takes the whole 0.25 s', () => {
    // A second tap mid-fade: UIView.animate with beginFromCurrentState.
    const curve = toggleFadeCurve(0.4, 0);
    expect(curve.duration).toBeCloseTo(FADE_S, 9);
    expect(curve.at(0)).toBeCloseTo(0.4, 9);
    expect(curve.at(FADE_S)).toBeCloseTo(0, 9);
    expect(curve.at(0.125)).toBeCloseTo(0.2, 6);
    expect(curve.velocity(0.125)).toBeLessThan(0);
  });
});

function Faded({isShown}: {isShown: boolean}) {
  const ref = useToggleFade(isShown);
  return <div ref={ref} data-testid="faded" />;
}

describe('useToggleFade', () => {
  it('places its element without a fade, then fades it to each new state', () => {
    const {getByTestId, rerender} = render(<Faded isShown={false} />);
    const element = getByTestId('faded');
    expect(element.style.opacity).toBe('0');
    // The inline style holds the value the fade ends on.
    rerender(<Faded isShown />);
    expect(element.style.opacity).toBe('1');
    rerender(<Faded isShown={false} />);
    expect(element.style.opacity).toBe('0');
  });

  it('starts shown when it mounts shown', () => {
    const {getByTestId, rerender} = render(<Faded isShown />);
    const element = getByTestId('faded');
    // Opacity 1 is the identity: nothing to write until it fades.
    expect(element.style.opacity).not.toBe('0');
    rerender(<Faded isShown={false} />);
    expect(element.style.opacity).toBe('0');
  });
});
