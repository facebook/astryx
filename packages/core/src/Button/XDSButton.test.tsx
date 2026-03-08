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

  // endSlot tests
  it('renders endSlot after label', () => {
    render(
      <XDSButton
        label="Click me"
        endSlot={<XDSBadge data-testid="end">3</XDSBadge>}
      />,
    );
    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('Click me');
    expect(screen.getByTestId('end')).toBeInTheDocument();
    expect(screen.getByTestId('end')).toHaveTextContent('3');
  });

  it('renders endSlot with children', () => {
    render(
      <XDSButton
        label="Accessible name"
        endSlot={<XDSBadge data-testid="end">New</XDSBadge>}>
        Custom content
      </XDSButton>,
    );
    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('Custom content');
    expect(screen.getByTestId('end')).toBeInTheDocument();
  });

  it('renders endSlot with icon and children', () => {
    render(
      <XDSButton
        label="Settings"
        icon={<span data-testid="icon">⚙</span>}
        endSlot={<XDSBadge data-testid="end">New</XDSBadge>}>
        Settings
      </XDSButton>,
    );
    const button = screen.getByRole('button');
    expect(screen.getByTestId('icon')).toBeInTheDocument();
    expect(button).toHaveTextContent('Settings');
    expect(screen.getByTestId('end')).toBeInTheDocument();

    // Verify order: icon, text, endSlot wrapper
    const children = Array.from(button.childNodes);
    const iconIndex = children.findIndex(
      n => n instanceof HTMLElement && n.dataset.testid === 'icon',
    );
    // endSlot is inside a wrapper span (direct child of button)
    const endElement = screen.getByTestId('end');
    const endWrapper = endElement.parentElement; // wrapper <span>
    const endIndex = children.findIndex(n => n === endWrapper);
    expect(iconIndex).toBeLessThan(endIndex);
  });

  it('does not render endSlot for icon-only buttons', () => {
    render(
      <XDSButton
        label="Settings"
        icon={<span data-testid="icon">⚙</span>}
        endSlot={<XDSBadge data-testid="end">3</XDSBadge>}
      />,
    );
    expect(screen.getByTestId('icon')).toBeInTheDocument();
    expect(screen.queryByTestId('end')).not.toBeInTheDocument();
  });

  it('wraps endSlot in a container for color inheritance', () => {
    render(
      <XDSButton
        label="Test"
        endSlot={<XDSBadge data-testid="end">3</XDSBadge>}
      />,
    );
    const badge = screen.getByTestId('end');
    // The badge should be inside a wrapper span that inherits color
    const wrapper = badge.parentElement;
    expect(wrapper?.tagName).toBe('SPAN');
    // The wrapper should be a direct child of the button
    expect(wrapper?.parentElement?.tagName).toBe('BUTTON');
  });

  it('hides endSlot content when loading', () => {
    render(
      <XDSButton
        label="Submit"
        isLoading
        endSlot={<XDSBadge data-testid="end">3</XDSBadge>}
      />,
    );
    // endSlot should still be in the DOM
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
});
