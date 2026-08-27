// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file IconButton.test.tsx
 * @input Uses vitest, @testing-library/react, IconButton component
 * @output Unit tests for IconButton component behavior
 * @position Testing; validates IconButton.tsx implementation
 *
 * SYNC: When IconButton.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {IconButton} from './IconButton';

describe('IconButton', () => {
  it('renders as an icon-only button with aria-label', () => {
    render(
      <IconButton label="Settings" icon={<span data-testid="icon">⚙</span>} />,
    );
    const button = screen.getByRole('button', {name: 'Settings'});
    expect(button).toHaveAttribute('aria-label', 'Settings');
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('does not render label as visible text', () => {
    render(
      <IconButton label="Settings" icon={<span data-testid="icon">⚙</span>} />,
    );
    const button = screen.getByRole('button');
    // The label text should not appear as visible content
    const visibleText = button.textContent;
    expect(visibleText).not.toContain('Settings');
  });

  it('forwards variant prop', () => {
    render(
      <IconButton label="Delete" icon={<span>🗑</span>} variant="destructive" />,
    );
    expect(screen.getByRole('button', {name: 'Delete'})).toBeInTheDocument();
  });

  it('forwards size prop', () => {
    render(<IconButton label="Add" icon={<span>+</span>} size="sm" />);
    expect(screen.getByRole('button', {name: 'Add'})).toBeInTheDocument();
  });

  it('handles click events', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(
      <IconButton label="Close" icon={<span>✕</span>} onClick={handleClick} />,
    );

    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when isDisabled is true', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(
      <IconButton
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
    render(<IconButton label="Save" icon={<span>💾</span>} isLoading />);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(<IconButton label="Action" icon={<span>⚡</span>} ref={ref} />);
    expect(ref).toHaveBeenCalled();
    expect(ref.mock.calls[0][0]).toBeInstanceOf(HTMLButtonElement);
  });

  it('has displayName set', () => {
    expect(IconButton.displayName).toBe('IconButton');
  });

  it('forwards the elevation prop through to the underlying button', () => {
    const classFor = (elevation: 'none' | 'med') => {
      const {container} = render(
        <IconButton label="Add" icon={<span>+</span>} elevation={elevation} />,
      );
      return container.querySelector('button')!.className;
    };
    // A raised FAB must render differently from the default flat icon button.
    expect(classFor('med')).not.toBe(classFor('none'));
  });
});
