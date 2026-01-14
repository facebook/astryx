/**
 * @file Button.test.tsx
 * @input Uses vitest, @testing-library/react, XDSButton component
 * @output Unit tests for XDSButton component behavior
 * @position Testing; validates Button.tsx implementation
 *
 * SYNC: When Button.tsx changes, update tests to match new behavior
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { XDSButton } from './Button';

describe('XDSButton', () => {
  it('renders children correctly', () => {
    render(<XDSButton>Click me</XDSButton>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('renders with different variants', () => {
    const { rerender } = render(<XDSButton variant="primary">Primary</XDSButton>);
    expect(screen.getByRole('button')).toBeInTheDocument();

    rerender(<XDSButton variant="secondary">Secondary</XDSButton>);
    expect(screen.getByRole('button')).toBeInTheDocument();

    rerender(<XDSButton variant="ghost">Ghost</XDSButton>);
    expect(screen.getByRole('button')).toBeInTheDocument();

    rerender(<XDSButton variant="destructive">Destructive</XDSButton>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('shows loading state with spinner', () => {
    render(<XDSButton loading>Submit</XDSButton>);
    const button = screen.getByRole('button');
    // Button should be disabled when loading
    expect(button).toBeDisabled();
    // Children text should still be present (but visually hidden)
    expect(button).toHaveTextContent('Submit');
  });

  it('handles click events', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<XDSButton onClick={handleClick}>Click me</XDSButton>);

    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not fire click when disabled', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<XDSButton disabled onClick={handleClick}>Click me</XDSButton>);

    await user.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('does not fire click when loading', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<XDSButton loading onClick={handleClick}>Click me</XDSButton>);

    await user.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(<XDSButton ref={ref}>Test</XDSButton>);
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLButtonElement));
  });
});
