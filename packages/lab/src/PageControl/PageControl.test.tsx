// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file PageControl.test.tsx
 * @input vitest (jsdom), Testing Library, PageControl
 * @output Proves the control's semantics (one named slider reading "Page N
 *   of M"), its keyboard (arrows mirrored in RTL, Home, End), its measured
 *   geometry and alphas, the width cap, hidesForSinglePage, and a tap's step
 *   to either side of the current indicator
 * @position Testing; the real-touch proofs are
 *   __tests__/PageControl.interaction.browser.spec.ts
 */

import {describe, expect, it, vi} from 'vitest';
import {createRef} from 'react';
import {fireEvent, render, screen} from '@testing-library/react';
import {PageControl} from './PageControl';

function renderControl(
  props: Partial<React.ComponentProps<typeof PageControl>> = {},
) {
  const onChange = vi.fn();
  const result = render(
    <PageControl count={5} value={2} onChange={onChange} {...props} />,
  );
  return {onChange, ...result};
}

/**
 * A tap at `x` on `target` through the gesture host's touch path (jsdom boxes
 * are 0 px wide, so any x > 0 is the trailing side of the current dot).
 */
function tap(target: Element, x: number) {
  for (const type of ['touchstart', 'touchend'] as const) {
    const event = new Event(type, {bubbles: true, cancelable: true});
    const contact = {identifier: 1, clientX: x, clientY: 10, target};
    Object.defineProperty(event, 'changedTouches', {value: [contact]});
    Object.defineProperty(event, 'touches', {
      value: type === 'touchend' ? [] : [contact],
    });
    target.dispatchEvent(event);
  }
}

/** WCAG contrast of `fg` at `alpha` over `bg` against `bg`. */
function contrastOver(fg: number[], bg: number[], alpha: number): number {
  const luminance = (rgb: number[]) => {
    const [r, g, b] = rgb.map(value => {
      const v = value / 255;
      return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const mixed = fg.map((c, i) => c * alpha + bg[i] * (1 - alpha));
  return (luminance(bg) + 0.05) / (luminance(mixed) + 0.05);
}

describe('PageControl', () => {
  it('is one slider named "Page indicators" that reads "Page 3 of 5"', () => {
    renderControl();
    const slider = screen.getByRole('slider', {name: 'Page indicators'});
    expect(slider).toHaveAttribute('aria-valuemin', '1');
    expect(slider).toHaveAttribute('aria-valuemax', '5');
    expect(slider).toHaveAttribute('aria-valuenow', '3');
    expect(slider).toHaveAttribute('aria-valuetext', 'Page 3 of 5');
    expect(slider).toHaveAttribute('tabindex', '0');
  });

  it('takes a custom label', () => {
    renderControl({label: 'Onboarding'});
    expect(
      screen.getByRole('slider', {name: 'Onboarding'}),
    ).toBeInTheDocument();
  });

  it('arrow keys, Home and End ask for a page', () => {
    const {onChange} = renderControl();
    const slider = screen.getByRole('slider');
    fireEvent.keyDown(slider, {key: 'ArrowRight'});
    expect(onChange).toHaveBeenLastCalledWith(3);
    fireEvent.keyDown(slider, {key: 'ArrowLeft'});
    expect(onChange).toHaveBeenLastCalledWith(1);
    fireEvent.keyDown(slider, {key: 'ArrowUp'});
    expect(onChange).toHaveBeenLastCalledWith(3);
    fireEvent.keyDown(slider, {key: 'ArrowDown'});
    expect(onChange).toHaveBeenLastCalledWith(1);
    fireEvent.keyDown(slider, {key: 'Home'});
    expect(onChange).toHaveBeenLastCalledWith(0);
    fireEvent.keyDown(slider, {key: 'End'});
    expect(onChange).toHaveBeenLastCalledWith(4);
  });

  it('mirrors the horizontal arrows in RTL', () => {
    const onChange = vi.fn();
    // jsdom does not inherit `direction`: set it on the control itself.
    render(
      <PageControl
        count={5}
        value={2}
        onChange={onChange}
        style={{direction: 'rtl'}}
      />,
    );
    const slider = screen.getByRole('slider');
    fireEvent.keyDown(slider, {key: 'ArrowRight'});
    expect(onChange).toHaveBeenLastCalledWith(1);
    fireEvent.keyDown(slider, {key: 'ArrowLeft'});
    expect(onChange).toHaveBeenLastCalledWith(3);
  });

  it('asks for nothing past the first or last page', () => {
    const {onChange} = renderControl({value: 4});
    fireEvent.keyDown(screen.getByRole('slider'), {key: 'ArrowRight'});
    expect(onChange).not.toHaveBeenCalled();
  });

  it("draws UIPageControl's geometry: 9.67 px indicators, the current one opaque, the others at 48 % (UIKit's 45 % raised to 3:1)", () => {
    renderControl();
    const slider = screen.getByRole('slider');
    expect(slider.style.height).toBe('25.67px');
    expect(slider.style.width).toBe('108.35px');
    const indicators = Array.from(
      slider.firstElementChild?.children ?? [],
    ) as HTMLElement[];
    expect(indicators).toHaveLength(5);
    // A 10 px box scaled to 9.67 px: round wherever it falls (see the browser
    // proof "every indicator paints round").
    expect(indicators[0].style.width).toBe('10px');
    expect(Number(indicators[0].style.scale) * 10).toBeCloseTo(9.67, 5);
    expect(indicators.map(i => i.style.opacity)).toEqual([
      '0.48',
      '0.48',
      '1',
      '0.48',
      '0.48',
    ]);
  });

  it('never grows wider than 161.3 px; past that the row shifts to keep the current page in view', () => {
    renderControl({count: 50, value: 25});
    const slider = screen.getByRole('slider');
    expect(slider.style.width).toBe('161.3px');
    const strip = slider.firstElementChild as HTMLElement;
    expect(
      Number.parseFloat(strip.style.getPropertyValue('--_page-control-offset')),
    ).toBeGreaterThan(0);
  });

  it('a tap on the trailing side of the current dot asks for the next page', () => {
    const {onChange} = renderControl();
    tap(screen.getByRole('slider'), 50);
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it('taps work when the control first renders with no pages and the pages arrive later', () => {
    const onChange = vi.fn();
    const view = render(
      <PageControl count={0} value={0} onChange={onChange} />,
    );
    view.rerender(<PageControl count={5} value={2} onChange={onChange} />);
    tap(screen.getByRole('slider'), 50);
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it("a caller's onKeyDown runs first and can keep the page with preventDefault", () => {
    const onKeyDown = vi.fn((event: React.KeyboardEvent) => {
      if (event.key === 'End') {
        event.preventDefault();
      }
    });
    const {onChange} = renderControl({onKeyDown});
    const slider = screen.getByRole('slider');
    fireEvent.keyDown(slider, {key: 'ArrowRight'});
    expect(onKeyDown).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith(3);
    fireEvent.keyDown(slider, {key: 'End'});
    expect(onKeyDown).toHaveBeenCalledTimes(2);
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('forwards ref to the slider, and taps still page with a ref passed', () => {
    const ref = createRef<HTMLDivElement>();
    const onChange = vi.fn();
    render(<PageControl ref={ref} count={5} value={2} onChange={onChange} />);
    expect(ref.current).toBe(screen.getByRole('slider'));
    tap(screen.getByRole('slider'), 50);
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it("inactive dots reach 3:1 on Core's default page background (WCAG 1.4.11)", () => {
    renderControl();
    const dots = Array.from(
      screen.getByRole('slider').firstElementChild?.children ?? [],
    ) as HTMLElement[];
    // Page 1 of 5 is inactive (the value is page 3). Core's light defaults:
    // --color-text-primary #0A1317 on --color-background-body #F1F4F7.
    const alpha = Number(dots[0].style.opacity);
    expect(
      contrastOver([0x0a, 0x13, 0x17], [0xf1, 0xf4, 0xf7], alpha),
    ).toBeGreaterThanOrEqual(3);
  });

  it('with hidesForSinglePage, renders nothing for one page', () => {
    renderControl({count: 1, value: 0, hidesForSinglePage: true});
    expect(screen.queryByRole('slider')).toBeNull();
  });
});
