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
import {XDSBadge} from '../Badge/XDSBadge';

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

  it('shows isLoading state with spinner', () => {
    render(<XDSButton label="Submit" isLoading />);
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
    render(<XDSButton label="Click me" isLoading onClick={handleClick} />);

    await user.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(<XDSButton label="Test" ref={ref} />);
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLButtonElement));
  });

  // endContent tests
  it('renders endContent after label', () => {
    render(
      <XDSButton
        label="Click me"
        endContent={<XDSBadge data-testid="end" label={3} />}
      />,
    );
    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('Click me');
    expect(screen.getByTestId('end')).toBeInTheDocument();
    expect(screen.getByTestId('end')).toHaveTextContent('3');
  });

  it('renders endContent with children', () => {
    render(
      <XDSButton
        label="Accessible name"
        endContent={<XDSBadge data-testid="end" label="New" />}>
        Custom content
      </XDSButton>,
    );
    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('Custom content');
    expect(screen.getByTestId('end')).toBeInTheDocument();
  });

  it('renders endContent with icon and children', () => {
    render(
      <XDSButton
        label="Settings"
        icon={<span data-testid="icon">⚙</span>}
        endContent={<XDSBadge data-testid="end" label="New" />}>
        Settings
      </XDSButton>,
    );
    const button = screen.getByRole('button');
    expect(screen.getByTestId('icon')).toBeInTheDocument();
    expect(button).toHaveTextContent('Settings');
    expect(screen.getByTestId('end')).toBeInTheDocument();
  });

  it('does not render endContent for icon-only buttons', () => {
    render(
      <XDSButton
        label="Settings"
        icon={<span data-testid="icon">⚙</span>}
        endContent={<XDSBadge data-testid="end" label={3} />}
      />,
    );
    expect(screen.getByTestId('icon')).toBeInTheDocument();
    expect(screen.queryByTestId('end')).not.toBeInTheDocument();
  });

  it('wraps endContent in a container for color inheritance', () => {
    render(
      <XDSButton
        label="Test"
        endContent={<XDSBadge data-testid="end" label={3} />}
      />,
    );
    const badge = screen.getByTestId('end');
    // The badge should be inside a wrapper span that inherits color
    const wrapper = badge.parentElement;
    expect(wrapper?.tagName).toBe('SPAN');
  });

  it('hides endContent content when loading', () => {
    render(
      <XDSButton
        label="Submit"
        isLoading
        endContent={<XDSBadge data-testid="end" label={3} />}
      />,
    );
    // endContent should still be in the DOM
    expect(screen.getByTestId('end')).toBeInTheDocument();
    // Button should be disabled and have aria-busy
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
  });

  it('renders xds-* class names for theme targeting', () => {
    render(<XDSButton label="Test" variant="secondary" size="sm" />);
    const button = screen.getByRole('button');
    expect(button.className).toContain('xds-button');
    expect(button.className).toContain('secondary');
    expect(button.className).toContain('sm');
  });

  // P0: onClick fires before onClickAction, onClickAction respects preventDefault
  it('fires onClick before onClickAction', async () => {
    const user = userEvent.setup();
    const order: string[] = [];
    const handleClick = vi.fn(() => order.push('onClick'));
    const handleAction = vi.fn(() => order.push('onClickAction'));
    render(
      <XDSButton
        label="Test"
        onClick={handleClick}
        onClickAction={handleAction}
      />,
    );

    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
    expect(handleAction).toHaveBeenCalledTimes(1);
    expect(order).toEqual(['onClick', 'onClickAction']);
  });

  it('does not call onClickAction when onClick calls preventDefault', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn((e: React.MouseEvent) => e.preventDefault());
    const handleAction = vi.fn();
    render(
      <XDSButton
        label="Test"
        onClick={handleClick}
        onClickAction={handleAction}
      />,
    );

    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
    expect(handleAction).not.toHaveBeenCalled();
  });

  // type/name/value/form props
  it('defaults type to button', () => {
    render(<XDSButton label="Test" />);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  it('passes type=submit', () => {
    render(<XDSButton label="Submit" type="submit" />);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
  });

  it('uses aria-disabled instead of disabled when tooltip is present and button is disabled', () => {
    render(<XDSButton label="Test" tooltip="Reason disabled" isDisabled />);
    const button = screen.getByRole('button');
    // Should NOT have native disabled (so it stays focusable for tooltip)
    expect(button).not.toHaveAttribute('disabled');
    expect(button).toHaveAttribute('aria-disabled', 'true');
  });

  it('does not fire handlers when aria-disabled via tooltip', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(
      <XDSButton
        label="Test"
        tooltip="Reason disabled"
        isDisabled
        onClick={handleClick}
      />,
    );
    await user.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('suppresses activation keys but passes other keys when aria-disabled via tooltip', async () => {
    const user = userEvent.setup();
    const handleKeyDown = vi.fn();
    render(
      <XDSButton
        label="Test"
        tooltip="Reason disabled"
        isDisabled
        onKeyDown={handleKeyDown}
      />,
    );
    const button = screen.getByRole('button');
    button.focus();
    await user.keyboard('{Enter}');
    // Activation keys (Enter) should be suppressed
    expect(handleKeyDown).not.toHaveBeenCalled();

    // Non-activation keys (Escape) should reach consumer handler
    await user.keyboard('{Escape}');
    expect(handleKeyDown).toHaveBeenCalledTimes(1);
  });

  it('has a live region that announces loading state', () => {
    const {rerender} = render(<XDSButton label="Submit" />);
    const button = screen.getByRole('button');
    const liveRegion = button.querySelector('[role="status"]');
    expect(liveRegion).toBeInTheDocument();
    expect(liveRegion).toHaveTextContent('');

    rerender(<XDSButton label="Submit" isLoading />);
    expect(liveRegion).toHaveTextContent('Loading');
  });
});
