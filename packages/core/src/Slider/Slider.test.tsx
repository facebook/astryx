// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Slider.test.tsx
 * @input Uses vitest, @testing-library/react, userEvent, Slider component
 * @output Unit tests for Slider component behavior
 * @position Testing; validates Slider.tsx implementation
 *
 * SYNC: When Slider.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, vi, beforeEach} from 'vitest';
import {render, screen, act, fireEvent, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {Slider} from './Slider';

// Mock showPopover/hidePopover (not implemented in jsdom) so the tooltip layer
// reflects its open state via a `popover-open` attribute the tests can assert.
beforeEach(() => {
  HTMLElement.prototype.showPopover = vi.fn(function (this: HTMLElement) {
    this.setAttribute('popover-open', '');
    const event = new Event('toggle', {bubbles: false});
    Object.defineProperty(event, 'newState', {value: 'open'});
    this.dispatchEvent(event);
  });
  HTMLElement.prototype.hidePopover = vi.fn(function (this: HTMLElement) {
    this.removeAttribute('popover-open');
    const event = new Event('toggle', {bubbles: false});
    Object.defineProperty(event, 'newState', {value: 'closed'});
    this.dispatchEvent(event);
  });
  const originalMatches = HTMLElement.prototype.matches;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (HTMLElement.prototype as any).matches = function (
    selector: string,
  ): boolean {
    if (selector === ':popover-open') {
      return this.hasAttribute('popover-open');
    }
    // jsdom does not derive :focus-visible from keyboard focus for a
    // div[role="slider"] thumb; treat the focused thumb as focus-visible so the
    // disabled-reason tooltip's keyboard-focus path can be exercised.
    if (selector === ':focus-visible') {
      return this === document.activeElement;
    }
    return originalMatches.call(this, selector);
  };
});

describe('Slider', () => {
  // --- Aria labels ---

  it('single thumb uses label as aria-label', () => {
    render(<Slider label="Volume" value={50} />);
    const slider = screen.getByRole('slider');
    expect(slider).toHaveAttribute('aria-label', 'Volume');
  });

  it('range thumbs have correct aria-labels', () => {
    render(<Slider label="Price range" value={[20, 80] as [number, number]} />);
    const sliders = screen.getAllByRole('slider');
    expect(sliders[0]).toHaveAttribute(
      'aria-label',
      'Price range, minimum value',
    );
    expect(sliders[1]).toHaveAttribute(
      'aria-label',
      'Price range, maximum value',
    );
  });

  it('sets aria-valuetext with formatValue', () => {
    render(
      <Slider label="Temperature" value={72} formatValue={v => `${v}°F`} />,
    );
    const slider = screen.getByRole('slider');
    expect(slider).toHaveAttribute('aria-valuetext', '72°F');
  });

  it('uses custom min and max', () => {
    render(<Slider label="Temperature" value={72} min={60} max={90} />);
    const slider = screen.getByRole('slider');
    expect(slider).toHaveAttribute('aria-valuemin', '60');
    expect(slider).toHaveAttribute('aria-valuemax', '90');
    expect(slider).toHaveAttribute('aria-valuenow', '72');
  });

  it('range mode sets correct aria values on both thumbs', () => {
    render(
      <Slider
        label="Range"
        value={[25, 75] as [number, number]}
        min={0}
        max={100}
      />,
    );
    const sliders = screen.getAllByRole('slider');
    expect(sliders[0]).toHaveAttribute('aria-valuenow', '25');
    expect(sliders[1]).toHaveAttribute('aria-valuenow', '75');
  });

  it('sets aria-orientation for vertical', () => {
    render(<Slider label="Volume" value={50} orientation="vertical" />);
    const slider = screen.getByRole('slider');
    expect(slider).toHaveAttribute('aria-orientation', 'vertical');
  });

  it('sets aria-invalid when status type is error', () => {
    render(
      <Slider
        label="Volume"
        value={50}
        status={{type: 'error', message: 'Value too high'}}
      />,
    );
    const slider = screen.getByRole('slider');
    expect(slider).toHaveAttribute('aria-invalid', 'true');
  });

  it('associates description via aria-describedby', () => {
    render(
      <Slider
        label="Volume"
        value={50}
        description="Adjust the volume level"
      />,
    );
    const slider = screen.getByRole('slider');
    const describedby = slider.getAttribute('aria-describedby');
    expect(describedby).toBeTruthy();
    const descEl = document.getElementById(describedby!.split(' ')[0]);
    expect(descEl).toHaveTextContent('Adjust the volume level');
  });

  it('associates status message via aria-describedby', () => {
    render(
      <Slider
        label="Volume"
        value={50}
        description="Adjust the volume level"
        status={{type: 'error', message: 'Too loud'}}
      />,
    );
    const slider = screen.getByRole('slider');
    const describedby = slider.getAttribute('aria-describedby');
    expect(describedby).toBeTruthy();
    // Should have at least two IDs (description + status message)
    const ids = describedby!.split(' ');
    expect(ids.length).toBeGreaterThanOrEqual(2);
  });

  it('decorative track elements have aria-hidden', () => {
    const {container} = render(<Slider label="Volume" value={50} />);
    const ariaHidden = container.querySelectorAll('[aria-hidden="true"]');
    expect(ariaHidden.length).toBeGreaterThanOrEqual(2);
  });

  // --- Disabled guards ---

  it('disables thumbs when isDisabled is true', () => {
    render(<Slider label="Volume" value={50} isDisabled />);
    const slider = screen.getByRole('slider');
    expect(slider).toHaveAttribute('aria-disabled', 'true');
    expect(slider).toHaveAttribute('tabIndex', '-1');
  });

  it('does not fire onChange on pointer down when disabled', () => {
    const handleChange = vi.fn();
    render(
      <Slider
        label="Volume"
        value={50}
        min={0}
        max={100}
        onChange={handleChange}
        isDisabled
      />,
    );
    const slider = screen.getByRole('slider');
    const trackContainer = slider.parentElement!;

    trackContainer.getBoundingClientRect = () => ({
      left: 0,
      top: 0,
      right: 200,
      bottom: 20,
      width: 200,
      height: 20,
      x: 0,
      y: 0,
      toJSON: () => {},
    });

    fireEvent.pointerDown(trackContainer, {
      clientX: 100,
      clientY: 10,
      pointerId: 1,
    });

    expect(handleChange).not.toHaveBeenCalled();
  });

  it('does not fire onChange on keyboard when disabled', () => {
    const handleChange = vi.fn();
    render(
      <Slider label="Volume" value={50} onChange={handleChange} isDisabled />,
    );
    const slider = screen.getByRole('slider');
    fireEvent.keyDown(slider, {key: 'ArrowRight'});
    expect(handleChange).not.toHaveBeenCalled();
  });

  // --- onChangeEnd on keyboard ---

  it('fires onChangeEnd on keyboard ArrowRight', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    const handleChangeEnd = vi.fn();
    render(
      <Slider
        label="Volume"
        value={50}
        step={5}
        onChange={handleChange}
        onChangeEnd={handleChangeEnd}
      />,
    );
    const slider = screen.getByRole('slider');
    act(() => {
      slider.focus();
    });
    await user.keyboard('{ArrowRight}');
    expect(handleChange).toHaveBeenCalledWith(55);
    expect(handleChangeEnd).toHaveBeenCalledWith(55);
  });

  it('fires onChangeEnd on keyboard Home/End with correct value', async () => {
    const user = userEvent.setup();
    const handleChangeEnd = vi.fn();
    render(
      <Slider
        label="Volume"
        value={50}
        min={0}
        max={100}
        onChange={vi.fn()}
        onChangeEnd={handleChangeEnd}
      />,
    );
    const slider = screen.getByRole('slider');
    act(() => {
      slider.focus();
    });
    await user.keyboard('{Home}');
    expect(handleChangeEnd).toHaveBeenCalledWith(0);
  });

  it('fires onChangeEnd with correct value for range mode on keyboard', async () => {
    const user = userEvent.setup();
    const handleChangeEnd = vi.fn();
    render(
      <Slider
        label="Range"
        value={[20, 80] as [number, number]}
        min={0}
        max={100}
        step={5}
        onChange={vi.fn()}
        onChangeEnd={handleChangeEnd}
      />,
    );
    const sliders = screen.getAllByRole('slider');
    act(() => {
      sliders[0].focus();
    });
    await user.keyboard('{ArrowRight}');
    expect(handleChangeEnd).toHaveBeenCalledWith([25, 80]);
  });

  // --- Pointer handling ---

  it('fires onChangeEnd on pointer up after pointer down', () => {
    const handleChange = vi.fn();
    const handleChangeEnd = vi.fn();
    render(
      <Slider
        label="Volume"
        value={50}
        min={0}
        max={100}
        onChange={handleChange}
        onChangeEnd={handleChangeEnd}
      />,
    );
    const slider = screen.getByRole('slider');
    const trackContainer = slider.parentElement!;

    trackContainer.getBoundingClientRect = () => ({
      left: 0,
      top: 0,
      right: 200,
      bottom: 20,
      width: 200,
      height: 20,
      x: 0,
      y: 0,
      toJSON: () => {},
    });

    fireEvent.pointerDown(trackContainer, {
      clientX: 100,
      clientY: 10,
      pointerId: 1,
    });
    fireEvent.pointerUp(trackContainer, {
      clientX: 100,
      clientY: 10,
      pointerId: 1,
    });

    expect(handleChangeEnd).toHaveBeenCalledTimes(1);
  });

  it('focuses closest thumb on track click', () => {
    render(
      <Slider label="Volume" value={50} min={0} max={100} onChange={vi.fn()} />,
    );
    const slider = screen.getByRole('slider');
    const trackContainer = slider.parentElement!;

    trackContainer.getBoundingClientRect = () => ({
      left: 0,
      top: 0,
      right: 200,
      bottom: 20,
      width: 200,
      height: 20,
      x: 0,
      y: 0,
      toJSON: () => {},
    });

    fireEvent.pointerDown(trackContainer, {
      clientX: 100,
      clientY: 10,
      pointerId: 1,
    });

    expect(document.activeElement).toBe(slider);
  });

  // --- Mark label click snapping ---

  it('clicking a mark label snaps to that mark value, not pointer position', () => {
    const handleChange = vi.fn();
    render(
      <Slider
        label="Volume"
        value={50}
        min={0}
        max={100}
        onChange={handleChange}
        marks={[{value: 100, label: '100'}]}
      />,
    );
    const markLabel = screen.getByTestId('slider-mark-label');

    // Simulate a click on the left edge of the "100" label — pointer X would
    // map to ~99 if calculated from position, but should snap to 100.
    fireEvent.pointerDown(markLabel, {clientX: 1, clientY: 10, pointerId: 1});

    expect(handleChange).toHaveBeenCalledWith(100);
  });

  // --- Boundary clamping ---

  it('clamps value at max boundary', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <Slider
        label="Volume"
        value={99}
        min={0}
        max={100}
        step={5}
        onChange={handleChange}
      />,
    );
    const slider = screen.getByRole('slider');
    act(() => {
      slider.focus();
    });
    await user.keyboard('{ArrowRight}');
    expect(handleChange).toHaveBeenCalledWith(100);
  });

  it('clamps value at min boundary', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <Slider
        label="Volume"
        value={1}
        min={0}
        max={100}
        step={5}
        onChange={handleChange}
      />,
    );
    const slider = screen.getByRole('slider');
    act(() => {
      slider.focus();
    });
    await user.keyboard('{ArrowLeft}');
    expect(handleChange).toHaveBeenCalledWith(0);
  });

  describe('disabledMessage', () => {
    const h = {hidden: true} as const;

    function getTrack(): HTMLElement {
      return screen.getByRole('slider').parentElement!;
    }

    it('shows the reason tooltip on hover when disabled with a reason', async () => {
      render(
        <Slider
          label="Volume"
          value={50}
          valueDisplay="none"
          isDisabled
          disabledMessage="Volume is locked while sharing your screen"
        />,
      );
      const tooltip = screen.getByRole('tooltip', h);
      expect(tooltip).toHaveTextContent(
        'Volume is locked while sharing your screen',
      );
      fireEvent.mouseEnter(getTrack());
      await waitFor(() => expect(tooltip).toHaveAttribute('popover-open'));
      fireEvent.mouseLeave(getTrack());
      await waitFor(() => expect(tooltip).not.toHaveAttribute('popover-open'));
    });

    it('shows the reason tooltip on keyboard focus', async () => {
      const user = userEvent.setup();
      render(
        <Slider
          label="Volume"
          value={50}
          valueDisplay="none"
          isDisabled
          disabledMessage="Volume is locked while sharing your screen"
        />,
      );
      const tooltip = screen.getByRole('tooltip', h);
      await user.tab();
      expect(screen.getByRole('slider')).toHaveFocus();
      await waitFor(() => expect(tooltip).toHaveAttribute('popover-open'));
    });

    it('does not render a tooltip when not disabled', () => {
      render(
        <Slider
          label="Volume"
          value={50}
          valueDisplay="none"
          disabledMessage="Volume is locked while sharing your screen"
        />,
      );
      expect(screen.queryByRole('tooltip', h)).not.toBeInTheDocument();
    });

    it('does not render a tooltip when disabled without a reason', () => {
      render(
        <Slider label="Volume" value={50} valueDisplay="none" isDisabled />,
      );
      expect(screen.queryByRole('tooltip', h)).not.toBeInTheDocument();
    });

    it('keeps the thumb focusable via aria-disabled when a reason is provided', () => {
      render(
        <Slider
          label="Volume"
          value={50}
          valueDisplay="none"
          isDisabled
          disabledMessage="Volume is locked while sharing your screen"
        />,
      );
      const thumb = screen.getByRole('slider');
      expect(thumb).toHaveAttribute('aria-disabled', 'true');
      expect(thumb).toHaveAttribute('tabindex', '0');
    });

    it('links the reason tooltip via aria-describedby', () => {
      render(
        <Slider
          label="Volume"
          value={50}
          valueDisplay="none"
          isDisabled
          disabledMessage="Volume is locked while sharing your screen"
        />,
      );
      const thumb = screen.getByRole('slider');
      const tooltip = screen.getByRole('tooltip', h);
      expect(thumb.getAttribute('aria-describedby')).toContain(tooltip.id);
    });

    it('blocks value changes while focusable-disabled', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <Slider
          label="Volume"
          value={50}
          valueDisplay="none"
          onChange={onChange}
          isDisabled
          disabledMessage="Volume is locked while sharing your screen"
        />,
      );
      const thumb = screen.getByRole('slider');
      thumb.focus();
      await user.keyboard('{ArrowRight}');
      expect(onChange).not.toHaveBeenCalled();
    });

    it('remains non-focusable when disabled without a reason', () => {
      render(
        <Slider label="Volume" value={50} valueDisplay="none" isDisabled />,
      );
      expect(screen.getByRole('slider')).toHaveAttribute('tabindex', '-1');
    });
  });
});
