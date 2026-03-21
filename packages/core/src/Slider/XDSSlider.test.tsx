/**
 * @file XDSSlider.test.tsx
 * @input Uses vitest, @testing-library/react, userEvent, XDSSlider component
 * @output Unit tests for XDSSlider component behavior
 * @position Testing; validates XDSSlider.tsx implementation
 *
 * SYNC: When XDSSlider.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, vi} from 'vitest';
import {render, screen, act, fireEvent} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {XDSSlider} from './XDSSlider';

describe('XDSSlider', () => {
  it('renders with label', () => {
    render(<XDSSlider label="Volume" value={50} />);
    expect(screen.getByText('Volume')).toBeInTheDocument();
  });

  it('single value mode renders one slider thumb', () => {
    render(<XDSSlider label="Volume" value={50} />);
    const sliders = screen.getAllByRole('slider');
    expect(sliders).toHaveLength(1);
  });

  it('range mode renders two slider thumbs', () => {
    render(
      <XDSSlider label="Price range" value={[20, 80] as [number, number]} />,
    );
    const sliders = screen.getAllByRole('slider');
    expect(sliders).toHaveLength(2);
  });

  it('sets aria-valuemin, aria-valuemax, aria-valuenow', () => {
    render(<XDSSlider label="Volume" value={50} min={0} max={100} />);
    const slider = screen.getByRole('slider');
    expect(slider).toHaveAttribute('aria-valuemin', '0');
    expect(slider).toHaveAttribute('aria-valuemax', '100');
    expect(slider).toHaveAttribute('aria-valuenow', '50');
  });

  it('sets aria-valuetext with formatValue', () => {
    render(
      <XDSSlider label="Temperature" value={72} formatValue={v => `${v}°F`} />,
    );
    const slider = screen.getByRole('slider');
    expect(slider).toHaveAttribute('aria-valuetext', '72°F');
  });

  it('does not set aria-valuetext without formatValue', () => {
    render(<XDSSlider label="Volume" value={50} />);
    const slider = screen.getByRole('slider');
    expect(slider).not.toHaveAttribute('aria-valuetext');
  });

  it('disables thumbs when isDisabled is true', () => {
    render(<XDSSlider label="Volume" value={50} isDisabled />);
    const slider = screen.getByRole('slider');
    expect(slider).toHaveAttribute('aria-disabled', 'true');
    expect(slider).toHaveAttribute('tabIndex', '-1');
  });

  it('arrow right increases value by step', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <XDSSlider label="Volume" value={50} step={5} onChange={handleChange} />,
    );
    const slider = screen.getByRole('slider');
    act(() => {
      slider.focus();
    });
    await user.keyboard('{ArrowRight}');
    expect(handleChange).toHaveBeenCalledWith(55);
  });

  it('arrow left decreases value by step', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <XDSSlider label="Volume" value={50} step={5} onChange={handleChange} />,
    );
    const slider = screen.getByRole('slider');
    act(() => {
      slider.focus();
    });
    await user.keyboard('{ArrowLeft}');
    expect(handleChange).toHaveBeenCalledWith(45);
  });

  it('Home key sets value to min', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <XDSSlider
        label="Volume"
        value={50}
        min={10}
        max={100}
        onChange={handleChange}
      />,
    );
    const slider = screen.getByRole('slider');
    act(() => {
      slider.focus();
    });
    await user.keyboard('{Home}');
    expect(handleChange).toHaveBeenCalledWith(10);
  });

  it('End key sets value to max', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <XDSSlider
        label="Volume"
        value={50}
        min={0}
        max={90}
        onChange={handleChange}
      />,
    );
    const slider = screen.getByRole('slider');
    act(() => {
      slider.focus();
    });
    await user.keyboard('{End}');
    expect(handleChange).toHaveBeenCalledWith(90);
  });

  it('does not change value on keyboard when disabled', () => {
    const handleChange = vi.fn();
    render(
      <XDSSlider
        label="Volume"
        value={50}
        onChange={handleChange}
        isDisabled
      />,
    );
    const slider = screen.getByRole('slider');
    // Disabled slider has tabIndex=-1, so it won't receive keyboard events
    // via normal tabbing. We verify the aria-disabled attribute instead.
    expect(slider).toHaveAttribute('aria-disabled', 'true');
    expect(slider).toHaveAttribute('tabIndex', '-1');
  });

  it('renders marks', () => {
    render(
      <XDSSlider
        label="Volume"
        value={50}
        marks={[{value: 0}, {value: 50}, {value: 100}]}
      />,
    );
    const marks = screen.getAllByTestId('slider-mark');
    expect(marks).toHaveLength(3);
  });

  it('renders mark labels', () => {
    render(
      <XDSSlider
        label="Volume"
        value={50}
        marks={[
          {value: 0, label: 'Low'},
          {value: 100, label: 'High'},
        ]}
      />,
    );
    expect(screen.getByText('Low')).toBeInTheDocument();
    expect(screen.getByText('High')).toBeInTheDocument();
  });

  it('renders status messages', () => {
    render(
      <XDSSlider
        label="Volume"
        value={50}
        status={{type: 'error', message: 'Value too high'}}
      />,
    );
    expect(screen.getByText('Value too high')).toBeInTheDocument();
  });

  it('sets aria-invalid when status type is error', () => {
    render(
      <XDSSlider
        label="Volume"
        value={50}
        status={{type: 'error', message: 'Value too high'}}
      />,
    );
    const slider = screen.getByRole('slider');
    expect(slider).toHaveAttribute('aria-invalid', 'true');
  });

  it('applies data-testid', () => {
    render(<XDSSlider label="Volume" value={50} data-testid="volume-slider" />);
    expect(screen.getByTestId('volume-slider')).toBeInTheDocument();
  });

  it('sets aria-orientation for vertical', () => {
    render(<XDSSlider label="Volume" value={50} orientation="vertical" />);
    const slider = screen.getByRole('slider');
    expect(slider).toHaveAttribute('aria-orientation', 'vertical');
  });

  it('sets aria-orientation for horizontal', () => {
    render(<XDSSlider label="Volume" value={50} />);
    const slider = screen.getByRole('slider');
    expect(slider).toHaveAttribute('aria-orientation', 'horizontal');
  });

  it('range thumbs have correct aria-labels', () => {
    render(
      <XDSSlider label="Price range" value={[20, 80] as [number, number]} />,
    );
    const sliders = screen.getAllByRole('slider');
    expect(sliders[0]).toHaveAttribute('aria-label', 'Price range, minimum value');
    expect(sliders[1]).toHaveAttribute('aria-label', 'Price range, maximum value');
  });

  it('single thumb uses label as aria-label', () => {
    render(<XDSSlider label="Volume" value={50} />);
    const slider = screen.getByRole('slider');
    expect(slider).toHaveAttribute('aria-label', 'Volume');
  });

  it('uses custom min and max', () => {
    render(<XDSSlider label="Temperature" value={72} min={60} max={90} />);
    const slider = screen.getByRole('slider');
    expect(slider).toHaveAttribute('aria-valuemin', '60');
    expect(slider).toHaveAttribute('aria-valuemax', '90');
    expect(slider).toHaveAttribute('aria-valuenow', '72');
  });

  it('range mode sets correct aria values on both thumbs', () => {
    render(
      <XDSSlider
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

  it('fires onChangeEnd on keyboard ArrowRight', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    const handleChangeEnd = vi.fn();
    render(
      <XDSSlider
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
      <XDSSlider
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

  it('fires onChangeEnd on pointer up after pointer down', () => {
    const handleChange = vi.fn();
    const handleChangeEnd = vi.fn();
    render(
      <XDSSlider
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

    // Mock getBoundingClientRect for position calculation
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

  it('fires onChangeEnd with correct value for range mode on keyboard', async () => {
    const user = userEvent.setup();
    const handleChangeEnd = vi.fn();
    render(
      <XDSSlider
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

  it('focuses closest thumb on track click', () => {
    render(
      <XDSSlider
        label="Volume"
        value={50}
        min={0}
        max={100}
        onChange={vi.fn()}
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

    expect(document.activeElement).toBe(slider);
  });

  it('renders description text', () => {
    render(
      <XDSSlider
        label="Volume"
        value={50}
        description="Adjust the volume level"
      />,
    );
    expect(screen.getByText('Adjust the volume level')).toBeInTheDocument();
  });

  it('associates description via aria-describedby', () => {
    render(
      <XDSSlider
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
      <XDSSlider
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

  it('forwards ref to the track container', () => {
    const ref = vi.fn();
    render(<XDSSlider label="Volume" value={50} ref={ref} />);
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
  });

  it('visually hides label when isLabelHidden is true', () => {
    render(<XDSSlider label="Volume" value={50} isLabelHidden />);
    // Label text should still exist in the DOM for screen readers
    expect(screen.getByText('Volume')).toBeInTheDocument();
  });

  it('PageUp increases value by step * 10', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <XDSSlider label="Volume" value={50} step={2} onChange={handleChange} />,
    );
    const slider = screen.getByRole('slider');
    act(() => {
      slider.focus();
    });
    await user.keyboard('{PageUp}');
    expect(handleChange).toHaveBeenCalledWith(70);
  });

  it('PageDown decreases value by step * 10', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <XDSSlider label="Volume" value={50} step={2} onChange={handleChange} />,
    );
    const slider = screen.getByRole('slider');
    act(() => {
      slider.focus();
    });
    await user.keyboard('{PageDown}');
    expect(handleChange).toHaveBeenCalledWith(30);
  });

  it('does not fire onChange on pointer down when disabled', () => {
    const handleChange = vi.fn();
    render(
      <XDSSlider
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
      <XDSSlider
        label="Volume"
        value={50}
        onChange={handleChange}
        isDisabled
      />,
    );
    const slider = screen.getByRole('slider');
    fireEvent.keyDown(slider, {key: 'ArrowRight'});
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('clamps value at max boundary', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <XDSSlider
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
      <XDSSlider
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

  it('renders formatted value with text display', () => {
    render(
      <XDSSlider
        label="Opacity"
        value={75}
        formatValue={v => `${v}%`}
        valueDisplay="text"
      />,
    );
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('renders range formatted values with text display', () => {
    render(
      <XDSSlider
        label="Range"
        value={[20, 80] as [number, number]}
        formatValue={v => `$${v}`}
        valueDisplay="text"
      />,
    );
    expect(screen.getByText('$20 – $80')).toBeInTheDocument();
  });

  it('decorative track elements have aria-hidden', () => {
    const {container} = render(<XDSSlider label="Volume" value={50} />);
    const ariaHidden = container.querySelectorAll('[aria-hidden="true"]');
    expect(ariaHidden.length).toBeGreaterThanOrEqual(2);
  });
});
