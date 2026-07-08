// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Rating.test.tsx
 * @input Uses vitest, @testing-library/react, userEvent, Rating component
 * @output Unit tests for Rating component behavior
 * @position Testing; validates Rating.tsx implementation
 *
 * SYNC: When Rating.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, vi} from 'vitest';
import {render, screen, fireEvent} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type {SVGProps} from 'react';
import {Rating} from './Rating';

function getTrack(interactive = true): HTMLElement {
  return screen.getByRole(interactive ? 'slider' : 'img');
}

function clickStar(index: number) {
  const star = document.querySelector(`[data-rating-index="${index}"]`);
  expect(star).not.toBeNull();
  fireEvent.click(star as Element);
}

function HeartIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path d="M12 21 4 13a5 5 0 1 1 8-6 5 5 0 1 1 8 6z" />
    </svg>
  );
}

describe('Rating', () => {
  it('renders the label and the requested number of icons', () => {
    render(<Rating label="Rate this" max={4} />);
    expect(screen.getByText('Rate this')).toBeInTheDocument();
    expect(document.querySelectorAll('[data-rating-index]')).toHaveLength(4);
  });

  it('defaults to 5 icons', () => {
    render(<Rating label="Rate" />);
    expect(document.querySelectorAll('[data-rating-index]')).toHaveLength(5);
  });

  it('exposes the slider role with value bounds when interactive', () => {
    render(<Rating label="Rate" defaultValue={2} />);
    const track = getTrack();
    expect(track).toHaveAttribute('aria-valuemin', '0');
    expect(track).toHaveAttribute('aria-valuemax', '5');
    expect(track).toHaveAttribute('aria-valuenow', '2');
  });

  it('sets the value on click (uncontrolled)', () => {
    const onChange = vi.fn();
    render(<Rating label="Rate" onChange={onChange} />);
    clickStar(3);
    expect(onChange).toHaveBeenCalledWith(3);
    expect(getTrack()).toHaveAttribute('aria-valuenow', '3');
  });

  it('does not update its own value when controlled', () => {
    const onChange = vi.fn();
    render(<Rating label="Rate" value={2} onChange={onChange} />);
    clickStar(4);
    expect(onChange).toHaveBeenCalledWith(4);
    expect(getTrack()).toHaveAttribute('aria-valuenow', '2');
  });

  it('clears back to 0 when the current value is selected again', () => {
    const onChange = vi.fn();
    render(<Rating label="Rate" defaultValue={3} onChange={onChange} />);
    clickStar(3);
    expect(onChange).toHaveBeenCalledWith(0);
  });

  it('does not clear (or fire onChange) when isClearable is false and value is unchanged', () => {
    const onChange = vi.fn();
    render(
      <Rating
        label="Rate"
        defaultValue={3}
        isClearable={false}
        onChange={onChange}
      />,
    );
    clickStar(3);
    expect(onChange).not.toHaveBeenCalled();
    expect(getTrack()).toHaveAttribute('aria-valuenow', '3');
  });

  it('adjusts the value with arrow keys', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Rating label="Rate" defaultValue={2} onChange={onChange} />);
    getTrack().focus();
    await user.keyboard('{ArrowRight}');
    expect(onChange).toHaveBeenLastCalledWith(3);
    await user.keyboard('{ArrowLeft}');
    expect(onChange).toHaveBeenLastCalledWith(2);
    await user.keyboard('{Home}');
    expect(onChange).toHaveBeenLastCalledWith(0);
    await user.keyboard('{End}');
    expect(onChange).toHaveBeenLastCalledWith(5);
  });

  it('steps by precision', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Rating
        label="Rate"
        defaultValue={2}
        precision={0.5}
        onChange={onChange}
      />,
    );
    getTrack().focus();
    await user.keyboard('{ArrowRight}');
    expect(onChange).toHaveBeenLastCalledWith(2.5);
  });

  it('clamps at the bounds and does not fire onChange when unchanged', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Rating label="Rate" defaultValue={5} onChange={onChange} />);
    getTrack().focus();
    await user.keyboard('{ArrowRight}');
    expect(onChange).not.toHaveBeenCalled();
    expect(getTrack()).toHaveAttribute('aria-valuenow', '5');
  });

  it('renders as a non-interactive image in display mode', () => {
    const onChange = vi.fn();
    render(
      <Rating label="Score" value={4} mode="display" onChange={onChange} />,
    );
    const track = getTrack(false);
    expect(track).toHaveAttribute('aria-label', '4 of 5');
    expect(track).not.toHaveAttribute('tabindex');
    fireEvent.click(track);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('blocks interaction when disabled', () => {
    const onChange = vi.fn();
    render(<Rating label="Rate" isDisabled onChange={onChange} />);
    const track = getTrack(false);
    expect(track).toHaveAttribute('aria-disabled', 'true');
    clickStar(2);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('renders a skeleton and no slider while loading', () => {
    render(<Rating label="Rate" isLoading max={5} />);
    expect(screen.queryByRole('slider')).toBeNull();
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(document.querySelectorAll('[data-rating-index]')).toHaveLength(0);
  });

  it('shows the numeric value when hasValueText is set', () => {
    render(
      <Rating
        label="Score"
        value={4.2}
        mode="display"
        precision={0.1}
        hasValueText
      />,
    );
    expect(screen.getByText('4.2')).toBeInTheDocument();
  });

  it('shows a review count', () => {
    render(
      <Rating label="Score" value={4} mode="display" reviewCount={2341} />,
    );
    expect(screen.getByText('(2,341 reviews)')).toBeInTheDocument();
  });

  it('shows a descriptive label and uses it for aria-valuetext', () => {
    render(
      <Rating
        label="Rate"
        defaultValue={3}
        descriptiveLabels={['Poor', 'Fair', 'Good', 'Very Good', 'Excellent']}
      />,
    );
    expect(getTrack()).toHaveAttribute('aria-valuetext', 'Good');
  });

  it('uses a custom value formatter', () => {
    render(
      <Rating
        label="Score"
        value={4}
        mode="display"
        hasValueText
        formatValue={(v, m) => `${v}/${m}`}
      />,
    );
    expect(screen.getByText('4/5')).toBeInTheDocument();
  });

  it('visually hides the label but keeps it accessible', () => {
    render(<Rating label="Hidden label" labelPlacement="hidden" />);
    expect(getTrack()).toHaveAccessibleName('Hidden label');
  });

  it('renders a hidden input for form submission', () => {
    const {container} = render(
      <Rating label="Rate" defaultValue={3} htmlName="score" />,
    );
    const input = container.querySelector('input[type="hidden"]');
    expect(input).toHaveAttribute('name', 'score');
    expect(input).toHaveAttribute('value', '3');
  });

  it('renders each star as an SVG by default', () => {
    render(<Rating label="Rate" max={5} />);
    const stars = document.querySelectorAll('[data-rating-index] svg');
    expect(stars.length).toBeGreaterThanOrEqual(5);
  });

  it('renders empty and filled layers per unit', () => {
    render(<Rating label="Rate" max={4} defaultValue={2} />);
    const units = document.querySelectorAll('[data-rating-index]');
    expect(units).toHaveLength(4);
    // Each unit stacks an empty layer + a filled layer (two SVGs).
    units.forEach(u => {
      expect(u.querySelectorAll('svg').length).toBe(2);
    });
  });

  it('applies a custom CSS color', () => {
    const {container} = render(
      <Rating label="Rate" defaultValue={3} color="#E11D48" />,
    );
    expect(container.innerHTML).toContain('#E11D48');
  });

  it('emits clean fractional values (no floating-point drift)', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Rating
        label="Rate"
        defaultValue={4}
        precision={0.1}
        onChange={onChange}
      />,
    );
    getTrack().focus();
    await user.keyboard('{ArrowRight}');
    expect(onChange).toHaveBeenLastCalledWith(4.1);
  });

  it('forwards pass-through props (id, data-*) to the root', () => {
    const {container} = render(
      <Rating label="Rate" defaultValue={3} id="my-rating" data-testid="rt" />,
    );
    const root = container.querySelector('#my-rating');
    expect(root).not.toBeNull();
    expect(root).toHaveAttribute('data-testid', 'rt');
  });

  it('renders custom icons when provided', () => {
    render(
      <Rating
        label="Love"
        defaultValue={2}
        icons={{filled: HeartIcon}}
        max={3}
      />,
    );
    // 3 units, each with an empty + filled custom icon layer.
    expect(document.querySelectorAll('[data-rating-index]')).toHaveLength(3);
    expect(
      document.querySelectorAll('[data-rating-index] svg').length,
    ).toBeGreaterThanOrEqual(3);
  });
});
