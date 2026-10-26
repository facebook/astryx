// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file PageControl.test.tsx
 * @input vitest (jsdom), Testing Library, PageControl
 * @output Proves the control's semantics (one named slider reading "Page N
 *   of M"), its keyboard (arrows mirrored in RTL, Home, End), its measured
 *   geometry and alphas, the width cap and the window it renders, and
 *   hidesForSinglePage
 * @position Testing; the real-touch proofs are
 *   __tests__/PageControl.interaction.browser.spec.ts
 */

import {afterEach, describe, expect, it, vi} from 'vitest';
import {createRef} from 'react';
import {renderToString} from 'react-dom/server';
import {fireEvent, render, screen} from '@testing-library/react';
import {PageControl} from './PageControl';

/**
 * A finger: a coarse primary pointer, on any engine (one touch model; nothing
 * asks for iOS); `reduced` turns Reduce Motion on.
 */
function asTouch({reduced = false}: {reduced?: boolean} = {}) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({
      matches:
        query.includes('pointer: coarse') ||
        (reduced && query.includes('prefers-reduced-motion: reduce')),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );
}

/** A mouse: a fine primary pointer, on any engine. */
function asMouse() {
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({
      matches: query.includes('pointer: fine'),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );
  // The case's pointer, as the control will read it.
  expect(window.matchMedia('(pointer: coarse)').matches).toBe(false);
}

afterEach(() => {
  vi.unstubAllGlobals();
});

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
      slider.querySelectorAll<HTMLElement>('[data-page]'),
    );
    expect(indicators).toHaveLength(5);
    // A 10 px box scaled to 9.67 px: round wherever it falls (see the browser
    // proof "every indicator paints round").
    expect(indicators[0].style.width).toBe('10px');
    // The animator writes `scale` as "x y".
    expect(Number.parseFloat(indicators[0].style.scale) * 10).toBeCloseTo(
      9.67,
      3,
    );
    expect(indicators.map(i => i.style.opacity)).toEqual([
      '0.48',
      '0.48',
      '1',
      '0.48',
      '0.48',
    ]);
  });

  it('never grows wider than 161.3 px; under a finger, with more than ten pages it renders the window around the current page', () => {
    asTouch();
    renderControl({count: 50, value: 25});
    const slider = screen.getByRole('slider');
    expect(slider.style.width).toBe('161.3px');
    // From page 0, page 25 sits in the window's last full slot: the window
    // starts at page 18 (pages 20–25 full); three slots on each side render
    // for the slide.
    const pages = Array.from(
      slider.querySelectorAll<HTMLElement>('[data-page]'),
      i => Number(i.dataset.page),
    );
    expect(pages[0]).toBe(15);
    expect(pages[pages.length - 1]).toBe(30);
  });

  it('an Android finger (no -webkit-touch-callout) gets the window too: one touch model, no platform idiom', () => {
    asTouch();
    vi.stubGlobal('CSS', {supports: () => false});
    render(<PageControl count={50} value={25} onChange={() => {}} />);
    const dots = screen
      .getByRole('slider')
      .querySelectorAll<HTMLElement>('[data-page]');
    // The window and its render margin, not the full row of 50.
    expect(dots.length).toBeLessThan(50);
  });

  it('with a mouse, a long control is the full row of pages, cropped', () => {
    asMouse();
    renderControl({count: 50, value: 25});
    const slider = screen.getByRole('slider');
    expect(slider.style.width).toBe('161.3px');
    const dots = Array.from(
      slider.querySelectorAll<HTMLElement>('[data-page]'),
    );
    expect(dots).toHaveLength(50);
    // No fades and no shrinking slots with a mouse.
    expect(dots.every(dot => dot.style.transition === 'none')).toBe(true);
  });

  // Touch motion stays internal: no theme role, so no variable retunes it.
  it("under a finger, the old indicator fades on the table's measured 250 ms and curve, and a --motion-page-control-… variable changes nothing", () => {
    asTouch();
    const onChange = vi.fn();
    const themed = (value: number) => (
      <div
        data-astryx-theme="page-control-test"
        style={
          {
            '--motion-page-control-fade-out-ms': '500ms',
            '--motion-page-control-fade-out-curve': 'cubic-bezier(0, 0, 1, 1)',
          } as React.CSSProperties
        }>
        <PageControl count={5} value={value} onChange={onChange} />
      </div>
    );
    const {rerender} = render(themed(2));
    rerender(themed(3));
    const slider = screen.getByRole('slider');
    const old = slider.querySelector<HTMLElement>('[data-page="2"]');
    expect(old?.style.transition).toBe(
      'opacity 0.25s cubic-bezier(0, 0, 0.58, 1)',
    );
  });

  it('under a finger and Reduce Motion, every opacity change fades in 200 ms on easeInOut, whatever the theme (design:reduced-motion DR2)', () => {
    asTouch({reduced: true});
    const onChange = vi.fn();
    const themed = (value: number) => (
      <div
        style={
          {
            '--motion-page-control-fade-out-ms': '500ms',
          } as React.CSSProperties
        }>
        <PageControl count={5} value={value} onChange={onChange} />
      </div>
    );
    const {rerender} = render(themed(2));
    rerender(themed(3));
    const dots = Array.from(
      screen.getByRole('slider').querySelectorAll<HTMLElement>('[data-page]'),
    );
    expect(dots.length).toBe(5);
    for (const dot of dots) {
      expect(dot.style.transition).toBe(
        'opacity 0.2s cubic-bezier(0.42, 0, 0.58, 1)',
      );
    }
  });

  it('with a mouse, a tap on the trailing side of the current dot asks for the next page', () => {
    asMouse();
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

  it('a page the app declines can be asked for again', async () => {
    // The app keeps its value: no render follows onChange.
    const {onChange} = renderControl();
    tap(screen.getByRole('slider'), 50);
    await new Promise(resolve => setTimeout(resolve, 0));
    tap(screen.getByRole('slider'), 50);
    expect(onChange).toHaveBeenCalledTimes(2);
    fireEvent.keyDown(screen.getByRole('slider'), {key: 'ArrowRight'});
    expect(onChange).toHaveBeenCalledTimes(2);
    await new Promise(resolve => setTimeout(resolve, 0));
    fireEvent.keyDown(screen.getByRole('slider'), {key: 'ArrowRight'});
    expect(onChange).toHaveBeenCalledTimes(3);
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
    const dot = screen
      .getByRole('slider')
      .querySelector('[data-page="0"]') as HTMLElement;
    // Core's light defaults: --color-text-primary #0A1317 on
    // --color-background-body #F1F4F7.
    expect(
      contrastOver(
        [0x0a, 0x13, 0x17],
        [0xf1, 0xf4, 0xf7],
        Number(dot.style.opacity),
      ),
    ).toBeGreaterThanOrEqual(3);
  });

  it('server-rendered, a long control already carries its resting offset and sizes', () => {
    const html = renderToString(
      <PageControl count={50} value={26} onChange={() => {}} />,
    );
    const rest = /--_page-control-rest:\s*([\d.]+)px/.exec(html);
    expect(rest).not.toBeNull();
    expect(Number(rest?.[1])).toBeGreaterThan(0);
    expect(html).toMatch(/--_page-control-scale:\s*0\.967/);
  });

  it('with hidesForSinglePage, renders nothing for one page', () => {
    renderControl({count: 1, value: 0, hidesForSinglePage: true});
    expect(screen.queryByRole('slider')).toBeNull();
  });
});
