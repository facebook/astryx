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
      slider.firstElementChild?.children ?? [],
    ) as HTMLElement[];
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

  it('never grows wider than 161.3 px; past that the row shifts to keep the current page in view', () => {
    renderControl({count: 50, value: 25});
    const slider = screen.getByRole('slider');
    expect(slider.style.width).toBe('161.3px');
    const strip = slider.firstElementChild as HTMLElement;
    expect(
      Number.parseFloat(strip.style.getPropertyValue('--_page-control-offset')),
    ).toBeGreaterThan(0);
  });

  it('with hidesForSinglePage, renders nothing for one page', () => {
    renderControl({count: 1, value: 0, hidesForSinglePage: true});
    expect(screen.queryByRole('slider')).toBeNull();
  });
});
