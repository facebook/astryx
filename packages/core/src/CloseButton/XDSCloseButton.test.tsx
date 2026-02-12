/**
 * @file XDSCloseButton.test.tsx
 * @input Uses vitest, @testing-library/react, XDSCloseButton component
 * @output Unit tests for XDSCloseButton component behavior
 * @position Testing; validates XDSCloseButton.tsx implementation
 *
 * SYNC: When XDSCloseButton.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {XDSCloseButton} from './XDSCloseButton';

describe('XDSCloseButton', () => {
  it('renders a button element', () => {
    render(<XDSCloseButton />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('has aria-label="Close" by default', () => {
    render(<XDSCloseButton />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Close');
  });

  it('allows custom label for aria-label', () => {
    render(<XDSCloseButton label="Dismiss" />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Dismiss');
  });

  it('uses label as tooltip content via aria-describedby', () => {
    render(<XDSCloseButton label="Dismiss notification" />);
    const button = screen.getByRole('button');
    // XDSTooltip sets aria-describedby on the button
    expect(button).toHaveAttribute('aria-describedby');
  });

  it('has tooltip with default "Close" label', () => {
    render(<XDSCloseButton />);
    const button = screen.getByRole('button');
    // XDSTooltip sets aria-describedby on the button
    expect(button).toHaveAttribute('aria-describedby');
  });

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<XDSCloseButton onClick={handleClick} />);

    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<XDSCloseButton onClick={handleClick} isDisabled />);

    await user.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('renders with type="button"', () => {
    render(<XDSCloseButton />);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  it('can be disabled', () => {
    render(<XDSCloseButton isDisabled />);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('renders an SVG icon', () => {
    render(<XDSCloseButton />);
    const button = screen.getByRole('button');
    const svg = button.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });

  describe('sizes', () => {
    it('renders with default md size', () => {
      render(<XDSCloseButton />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('renders with sm size', () => {
      render(<XDSCloseButton size="sm" />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('renders with lg size', () => {
      render(<XDSCloseButton size="lg" />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });
});
