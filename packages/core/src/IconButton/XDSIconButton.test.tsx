/**
 * @file XDSIconButton.test.tsx
 * @input Uses vitest, @testing-library/react, XDSIconButton component
 * @output Unit tests for XDSIconButton component behavior
 * @position Testing; validates XDSIconButton.tsx implementation
 *
 * SYNC: When XDSIconButton.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {XDSIconButton} from './XDSIconButton';

describe('XDSIconButton', () => {
  it('renders as an icon-only button with aria-label', () => {
    render(
      <XDSIconButton
        label="Settings"
        icon={<span data-testid="icon">⚙</span>}
      />,
    );
    const button = screen.getByRole('button', {name: 'Settings'});
    expect(button).toHaveAttribute('aria-label', 'Settings');
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('does not render label as visible text', () => {
    render(
      <XDSIconButton
        label="Settings"
        icon={<span data-testid="icon">⚙</span>}
      />,
    );
    const button = screen.getByRole('button');
    // The label text should not appear as visible content
    const visibleText = button.textContent;
    expect(visibleText).not.toContain('Settings');
  });

  it('forwards variant prop', () => {
    render(
      <XDSIconButton
        label="Delete"
        icon={<span>🗑</span>}
        variant="destructive"
      />,
    );
    expect(screen.getByRole('button', {name: 'Delete'})).toBeInTheDocument();
  });

  it('forwards size prop', () => {
    render(<XDSIconButton label="Add" icon={<span>+</span>} size="sm" />);
    expect(screen.getByRole('button', {name: 'Add'})).toBeInTheDocument();
  });

  it('handles click events', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(
      <XDSIconButton
        label="Close"
        icon={<span>✕</span>}
        onClick={handleClick}
      />,
    );

    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when isDisabled is true', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(
      <XDSIconButton
        label="Close"
        icon={<span>✕</span>}
        isDisabled
        onClick={handleClick}
      />,
    );

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    await user.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('shows loading state', () => {
    render(<XDSIconButton label="Save" icon={<span>💾</span>} isLoading />);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(<XDSIconButton label="Action" icon={<span>⚡</span>} ref={ref} />);
    expect(ref).toHaveBeenCalled();
    expect(ref.mock.calls[0][0]).toBeInstanceOf(HTMLButtonElement);
  });

  it('has displayName set', () => {
    expect(XDSIconButton.displayName).toBe('XDSIconButton');
  });
});
