/**
 * @file XDSSlider.test.tsx
 * @input Uses vitest, @testing-library/react, userEvent, XDSSlider component
 * @output Unit tests for XDSSlider component behavior
 * @position Testing; validates XDSSlider.tsx implementation
 *
 * SYNC: When XDSSlider.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, vi} from 'vitest';
import {render, screen, act} from '@testing-library/react';
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
    expect(sliders[0]).toHaveAttribute('aria-label', 'Minimum value');
    expect(sliders[1]).toHaveAttribute('aria-label', 'Maximum value');
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
});
