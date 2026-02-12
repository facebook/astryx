/**
 * @file XDSButton.test.tsx
 * @input Uses vitest, @testing-library/react, XDSButton component
 * @output Unit tests for XDSButton component behavior
 * @position Testing; validates XDSButton.tsx implementation
 *
 * SYNC: When XDSButton.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {XDSButton} from './XDSButton';

describe('XDSButton', () => {
  it('renders label as visible text', () => {
    render(<XDSButton label="Click me" />);
    expect(screen.getByRole('button', {name: 'Click me'})).toBeInTheDocument();
  });

  it('renders children instead of label when provided', () => {
    render(<XDSButton label="Accessible name">Custom content</XDSButton>);
    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('Custom content');
  });

  it('renders with different variants', () => {
    const {rerender} = render(<XDSButton label="Primary" variant="primary" />);
    expect(screen.getByRole('button')).toBeInTheDocument();

    rerender(<XDSButton label="Secondary" variant="secondary" />);
    expect(screen.getByRole('button')).toBeInTheDocument();

    rerender(<XDSButton label="Ghost" variant="ghost" />);
    expect(screen.getByRole('button')).toBeInTheDocument();

    rerender(<XDSButton label="Destructive" variant="destructive" />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('renders icon-only button with aria-label', () => {
    render(
      <XDSButton label="Settings" icon={<span data-testid="icon">⚙</span>} />,
    );
    const button = screen.getByRole('button', {name: 'Settings'});
    expect(button).toHaveAttribute('aria-label', 'Settings');
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('renders icon with text when both icon and children provided', () => {
    render(
      <XDSButton label="Settings" icon={<span data-testid="icon">⚙</span>}>
        Settings
      </XDSButton>,
    );
    const button = screen.getByRole('button');
    expect(button).not.toHaveAttribute('aria-label');
    expect(button).toHaveTextContent('Settings');
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('shows loading state with spinner', () => {
    render(<XDSButton label="Submit" loading />);
    const button = screen.getByRole('button');
    // Button should be disabled when loading
    expect(button).toBeDisabled();
  });

  it('handles click events', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<XDSButton label="Click me" onClick={handleClick} />);

    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not fire click when disabled', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<XDSButton label="Click me" isDisabled onClick={handleClick} />);

    await user.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('does not fire click when loading', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<XDSButton label="Click me" loading onClick={handleClick} />);

    await user.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(<XDSButton label="Test" ref={ref} />);
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLButtonElement));
  });
});
