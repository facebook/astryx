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
import {Rating} from './Rating';

/** Grab the interactive/display track element by its role. */
function getTrack(interactive = true): HTMLElement {
  return screen.getByRole(interactive ? 'slider' : 'img');
}

/** Click the Nth star (1-based). */
function clickStar(index: number) {
  const star = document.querySelector(`[data-rating-index="${index}"]`);
  expect(star).not.toBeNull();
  fireEvent.click(star as Element);
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
    expect(track).toHaveAttribute('aria-valuetext', '2 of 5');
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
    // Value stays at the controlled prop until the parent updates it.
    expect(getTrack()).toHaveAttribute('aria-valuenow', '2');
  });

  it('clears back to 0 when the current value is selected again', () => {
    const onChange = vi.fn();
    render(<Rating label="Rate" defaultValue={3} onChange={onChange} />);
    clickStar(3);
    expect(onChange).toHaveBeenCalledWith(0);
  });

  it('does not clear when isClearable is false', () => {
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
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it('adjusts the value with arrow keys', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Rating label="Rate" defaultValue={2} onChange={onChange} />);
    const track = getTrack();
    track.focus();
    await user.keyboard('{ArrowRight}');
    expect(onChange).toHaveBeenLastCalledWith(3);
    await user.keyboard('{ArrowLeft}');
    expect(onChange).toHaveBeenLastCalledWith(2);
    await user.keyboard('{Home}');
    expect(onChange).toHaveBeenLastCalledWith(0);
    await user.keyboard('{End}');
    expect(onChange).toHaveBeenLastCalledWith(5);
  });

  it('steps by 0.5 with hasHalfIcons', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Rating label="Rate" defaultValue={2} hasHalfIcons onChange={onChange} />,
    );
    getTrack().focus();
    await user.keyboard('{ArrowRight}');
    expect(onChange).toHaveBeenLastCalledWith(2.5);
  });

  it('clamps at the bounds', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Rating label="Rate" defaultValue={5} onChange={onChange} />);
    getTrack().focus();
    await user.keyboard('{ArrowRight}');
    expect(onChange).toHaveBeenLastCalledWith(5);
  });

  it('renders as a non-interactive image in read-only mode', () => {
    const onChange = vi.fn();
    render(<Rating label="Score" value={4} isReadOnly onChange={onChange} />);
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

  it('shows a value label when hasValueLabel is set', () => {
    render(<Rating label="Score" value={3} isReadOnly hasValueLabel />);
    expect(screen.getByText('3 of 5')).toBeInTheDocument();
  });

  it('uses a custom value label formatter', () => {
    render(
      <Rating
        label="Score"
        value={4}
        isReadOnly
        hasValueLabel
        formatValueLabel={(v, m) => `${v}/${m} stars`}
      />,
    );
    expect(screen.getByText('4/5 stars')).toBeInTheDocument();
  });

  it('visually hides the label but keeps it accessible', () => {
    render(<Rating label="Hidden label" isLabelHidden />);
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
});
