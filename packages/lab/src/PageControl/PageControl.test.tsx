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
import {fireEvent, render, screen} from '@testing-library/react';
import {PageControl} from './PageControl';

/** A finger on WebKit for iOS: a coarse pointer and -webkit-touch-callout. */
function asIos() {
  vi.stubGlobal('CSS', {
    supports: (query: string) =>
      query.replace(/\s/g, '') === '(-webkit-touch-callout:none)',
  });
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({
      matches: query.includes('pointer: coarse'),
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

  it("draws UIPageControl's geometry: 9.67 px indicators, the current one opaque, the others at 45 %", () => {
    renderControl();
    const slider = screen.getByRole('slider');
    expect(slider.style.height).toBe('25.67px');
    expect(slider.style.width).toBe('108.35px');
    const indicators = Array.from(
      slider.querySelectorAll<HTMLElement>('[data-page]'),
    );
    expect(indicators).toHaveLength(5);
    expect(indicators[0].style.width).toBe('9.67px');
    expect(indicators.map(i => i.style.opacity)).toEqual([
      '0.45',
      '0.45',
      '1',
      '0.45',
      '0.45',
    ]);
  });

  it('never grows wider than 161.3 px; on iOS, with more than ten pages it renders the window around the current page', () => {
    asIos();
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

  it('outside iOS (Android, a mouse), a long control is the full row of pages, cropped', () => {
    renderControl({count: 50, value: 25});
    const slider = screen.getByRole('slider');
    expect(slider.style.width).toBe('161.3px');
    const dots = Array.from(
      slider.querySelectorAll<HTMLElement>('[data-page]'),
    );
    expect(dots).toHaveLength(50);
    // No fades and no shrinking slots outside iOS.
    expect(dots.every(dot => dot.style.transition === 'none')).toBe(true);
  });

  it("on iOS, a theme's --motion-page-control-… values reach the fades", () => {
    asIos();
    const onChange = vi.fn();
    const {rerender} = render(
      <div
        data-astryx-theme="page-control-test"
        style={
          {
            '--motion-page-control-fade-out-ms': '500ms',
            '--motion-page-control-fade-out-curve': 'cubic-bezier(0, 0, 1, 1)',
          } as React.CSSProperties
        }>
        <PageControl count={5} value={2} onChange={onChange} />
      </div>,
    );
    rerender(
      <div
        data-astryx-theme="page-control-test"
        style={
          {
            '--motion-page-control-fade-out-ms': '500ms',
            '--motion-page-control-fade-out-curve': 'cubic-bezier(0, 0, 1, 1)',
          } as React.CSSProperties
        }>
        <PageControl count={5} value={3} onChange={onChange} />
      </div>,
    );
    const slider = screen.getByRole('slider');
    const old = slider.querySelector<HTMLElement>('[data-page="2"]');
    expect(old?.style.transition).toBe('opacity 0.5s cubic-bezier(0, 0, 1, 1)');
  });

  it('with hidesForSinglePage, renders nothing for one page', () => {
    renderControl({count: 1, value: 0, hidesForSinglePage: true});
    expect(screen.queryByRole('slider')).toBeNull();
  });
});
