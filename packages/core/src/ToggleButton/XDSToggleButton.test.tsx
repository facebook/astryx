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
