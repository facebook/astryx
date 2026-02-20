/**
 * @file XDSToggleButton.test.tsx
 * @input Uses vitest, @testing-library/react, XDSToggleButton component
 * @output Unit tests for XDSToggleButton component behavior
 * @position Testing; validates XDSToggleButton.tsx implementation
 *
 * SYNC: When XDSToggleButton.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {XDSToggleButton} from './XDSToggleButton';

describe('XDSToggleButton', () => {
  // =========================================================================
  // Rendering
  // =========================================================================

  it('renders label as visible text', () => {
    render(
      <XDSToggleButton
        label="Bold"
        isPressed={false}
        onPressedChange={() => {}}
      />,
    );
    expect(screen.getByRole('button', {name: 'Bold'})).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveTextContent('Bold');
  });

  it('renders children instead of label when provided', () => {
    render(
      <XDSToggleButton
        label="Toggle bold"
        isPressed={false}
        onPressedChange={() => {}}>
        Custom content
      </XDSToggleButton>,
    );
    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('Custom content');
  });

  it('renders icon-only button with aria-label', () => {
    render(
      <XDSToggleButton
        label="Bold"
        isPressed={false}
        onPressedChange={() => {}}
        icon={<span data-testid="icon">B</span>}
      />,
    );
    const button = screen.getByRole('button', {name: 'Bold'});
    expect(button).toHaveAttribute('aria-label', 'Bold');
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('renders icon with text when both icon and children provided', () => {
    render(
      <XDSToggleButton
        label="Bold"
        isPressed={false}
        onPressedChange={() => {}}
        icon={<span data-testid="icon">B</span>}>
        Bold
      </XDSToggleButton>,
    );
    const button = screen.getByRole('button');
    expect(button).not.toHaveAttribute('aria-label');
    expect(button).toHaveTextContent('Bold');
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  // =========================================================================
  // pressedIcon
  // =========================================================================

  it('renders pressedIcon when pressed', () => {
    render(
      <XDSToggleButton
        label="Favorite"
        isPressed={true}
        onPressedChange={() => {}}
        icon={<span data-testid="outline-icon">♡</span>}
        pressedIcon={<span data-testid="filled-icon">♥</span>}
      />,
    );
    expect(screen.getByTestId('filled-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('outline-icon')).not.toBeInTheDocument();
  });

  it('renders icon when not pressed even if pressedIcon provided', () => {
    render(
      <XDSToggleButton
        label="Favorite"
        isPressed={false}
        onPressedChange={() => {}}
        icon={<span data-testid="outline-icon">♡</span>}
        pressedIcon={<span data-testid="filled-icon">♥</span>}
      />,
    );
    expect(screen.getByTestId('outline-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('filled-icon')).not.toBeInTheDocument();
  });

  it('falls back to icon when pressed and no pressedIcon', () => {
    render(
      <XDSToggleButton
        label="Star"
        isPressed={true}
        onPressedChange={() => {}}
        icon={<span data-testid="default-icon">☆</span>}
      />,
    );
    expect(screen.getByTestId('default-icon')).toBeInTheDocument();
  });

  // =========================================================================
  // pressedIconColor
  // =========================================================================

  it('applies pressedIconColor to icon wrapper when pressed', () => {
    render(
      <XDSToggleButton
        label="Favorite"
        isPressed={true}
        onPressedChange={() => {}}
        icon={<span data-testid="icon">★</span>}
        pressedIconColor="#F2C00B"
      />,
    );
    const icon = screen.getByTestId('icon');
    const wrapper = icon.parentElement;
    expect(wrapper).toHaveStyle({color: '#F2C00B'});
  });

  it('does not apply pressedIconColor when not pressed', () => {
    render(
      <XDSToggleButton
        label="Favorite"
        isPressed={false}
        onPressedChange={() => {}}
        icon={<span data-testid="icon">☆</span>}
        pressedIconColor="#F2C00B"
      />,
    );
    const icon = screen.getByTestId('icon');
    // Icon should not be wrapped in a color span
    expect(icon.parentElement?.tagName).toBe('BUTTON');
  });

  // =========================================================================
  // Emphasized text (font-weight shift prevention)
  // =========================================================================

  it('renders width reservation element for label text', () => {
    render(
      <XDSToggleButton
        label="Bold"
        isPressed={false}
        onPressedChange={() => {}}
      />,
    );
    const button = screen.getByRole('button');
    const hiddenSpan = button.querySelector('[aria-hidden="true"]');
    expect(hiddenSpan).toBeInTheDocument();
    expect(hiddenSpan).toHaveTextContent('Bold');
  });

  it('renders width reservation element for children text', () => {
    render(
      <XDSToggleButton
        label="Toggle bold"
        isPressed={false}
        onPressedChange={() => {}}
        icon={<span data-testid="icon">B</span>}>
        Bold
      </XDSToggleButton>,
    );
    const button = screen.getByRole('button');
    const hiddenSpan = button.querySelector('[aria-hidden="true"]');
    expect(hiddenSpan).toBeInTheDocument();
    expect(hiddenSpan).toHaveTextContent('Bold');
  });

  it('does not render width reservation for icon-only buttons', () => {
    render(
      <XDSToggleButton
        label="Bold"
        isPressed={false}
        onPressedChange={() => {}}
        icon={<span data-testid="icon">B</span>}
      />,
    );
    const button = screen.getByRole('button');
    const hiddenSpan = button.querySelector('[aria-hidden="true"]');
    expect(hiddenSpan).not.toBeInTheDocument();
  });

  // =========================================================================
  // aria-pressed
  // =========================================================================

  it('sets aria-pressed=false when not pressed', () => {
    render(
      <XDSToggleButton
        label="Bold"
        isPressed={false}
        onPressedChange={() => {}}
      />,
    );
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false');
  });

  it('sets aria-pressed=true when pressed', () => {
    render(
      <XDSToggleButton
        label="Bold"
        isPressed={true}
        onPressedChange={() => {}}
      />,
    );
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
  });

  // =========================================================================
  // Interaction
  // =========================================================================

  it('calls onPressedChange with true when clicking unpressed button', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <XDSToggleButton
        label="Bold"
        isPressed={false}
        onPressedChange={handleChange}
      />,
    );

    await user.click(screen.getByRole('button'));
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it('calls onPressedChange with false when clicking pressed button', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <XDSToggleButton
        label="Bold"
        isPressed={true}
        onPressedChange={handleChange}
      />,
    );

    await user.click(screen.getByRole('button'));
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith(false);
  });

  it('calls onClick in addition to onPressedChange', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    const handleChange = vi.fn();
    render(
      <XDSToggleButton
        label="Bold"
        isPressed={false}
        onPressedChange={handleChange}
        onClick={handleClick}
      />,
    );

    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  // =========================================================================
  // onPressedChangeAction (async transitions)
  // =========================================================================

  it('calls onPressedChangeAction with new state', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    const handleAction = vi.fn().mockResolvedValue(undefined);
    render(
      <XDSToggleButton
        label="Favorite"
        isPressed={false}
        onPressedChange={handleChange}
        onPressedChangeAction={handleAction}
      />,
    );

    await user.click(screen.getByRole('button'));
    expect(handleChange).toHaveBeenCalledWith(true);
    expect(handleAction).toHaveBeenCalledWith(true);
  });

  // =========================================================================
  // Disabled state
  // =========================================================================

  it('does not fire events when disabled', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <XDSToggleButton
        label="Bold"
        isPressed={false}
        onPressedChange={handleChange}
        isDisabled
      />,
    );

    await user.click(screen.getByRole('button'));
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('does not fire events when loading', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <XDSToggleButton
        label="Bold"
        isPressed={false}
        onPressedChange={handleChange}
        isLoading
      />,
    );

    await user.click(screen.getByRole('button'));
    expect(handleChange).not.toHaveBeenCalled();
  });

  // =========================================================================
  // Read-only state
  // =========================================================================

  it('does not fire events when read-only', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <XDSToggleButton
        label="Favorite"
        isPressed={true}
        onPressedChange={handleChange}
        isReadOnly
      />,
    );

    await user.click(screen.getByRole('button'));
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('sets aria-readonly when read-only', () => {
    render(
      <XDSToggleButton
        label="Favorite"
        isPressed={true}
        onPressedChange={() => {}}
        isReadOnly
      />,
    );
    expect(screen.getByRole('button')).toHaveAttribute('aria-readonly', 'true');
  });

  it('is not disabled when read-only (preserves focusability)', () => {
    render(
      <XDSToggleButton
        label="Favorite"
        isPressed={true}
        onPressedChange={() => {}}
        isReadOnly
      />,
    );
    expect(screen.getByRole('button')).not.toBeDisabled();
  });

  // =========================================================================
  // hasTooltip
  // =========================================================================

  it('does not render tooltip when hasTooltip is false for icon-only', () => {
    const {container} = render(
      <XDSToggleButton
        label="Bold"
        isPressed={false}
        onPressedChange={() => {}}
        icon={<span>B</span>}
        hasTooltip={false}
      />,
    );
    // Without tooltip, the button should be rendered directly (no tooltip wrapper)
    const button = screen.getByRole('button');
    expect(button.parentElement).toBe(container);
  });

  it('renders tooltip when hasTooltip is true for labeled button', () => {
    const {container} = render(
      <XDSToggleButton
        label="Bold"
        isPressed={false}
        onPressedChange={() => {}}
        hasTooltip={true}
      />,
    );
    // With tooltip, the button should be wrapped
    const button = screen.getByRole('button');
    expect(button.parentElement).not.toBe(container);
  });

  // =========================================================================
  // Variants
  // =========================================================================

  it('renders with different variants', () => {
    const {rerender} = render(
      <XDSToggleButton
        label="Toggle"
        isPressed={false}
        onPressedChange={() => {}}
        variant="ghost"
      />,
    );
    expect(screen.getByRole('button')).toBeInTheDocument();

    rerender(
      <XDSToggleButton
        label="Toggle"
        isPressed={false}
        onPressedChange={() => {}}
        variant="secondary"
      />,
    );
    expect(screen.getByRole('button')).toBeInTheDocument();

    rerender(
      <XDSToggleButton
        label="Toggle"
        isPressed={false}
        onPressedChange={() => {}}
        variant="outline"
      />,
    );
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  // =========================================================================
  // Ref forwarding
  // =========================================================================

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(
      <XDSToggleButton
        label="Bold"
        isPressed={false}
        onPressedChange={() => {}}
        ref={ref}
      />,
    );
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLButtonElement));
  });

  // =========================================================================
  // Button type
  // =========================================================================

  it('has type="button" to prevent form submission', () => {
    render(
      <XDSToggleButton
        label="Bold"
        isPressed={false}
        onPressedChange={() => {}}
      />,
    );
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  // =========================================================================
  // data-testid
  // =========================================================================

  it('passes data-testid through', () => {
    render(
      <XDSToggleButton
        label="Bold"
        isPressed={false}
        onPressedChange={() => {}}
        data-testid="bold-toggle"
      />,
    );
    expect(screen.getByTestId('bold-toggle')).toBeInTheDocument();
  });
});
