// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Button.test.tsx
 * @input Uses vitest, @testing-library/react, Button component
 * @output Unit tests for Button component behavior
 * @position Testing; validates Button.tsx implementation
 *
 * SYNC: When Button.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, vi} from 'vitest';
import {render, screen, fireEvent, act} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {Button} from './Button';
import {Badge} from '../Badge/Badge';

describe('Button', () => {
  it('renders label as visible text', () => {
    render(<Button label="Click me" />);
    expect(screen.getByRole('button', {name: 'Click me'})).toBeInTheDocument();
  });

  it('renders children instead of label when provided', () => {
    render(<Button label="Accessible name">Custom content</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('Custom content');
  });

  it('renders with different variants', () => {
    const {rerender} = render(<Button label="Primary" variant="primary" />);
    expect(screen.getByRole('button')).toBeInTheDocument();

    rerender(<Button label="Secondary" variant="secondary" />);
    expect(screen.getByRole('button')).toBeInTheDocument();

    rerender(<Button label="Ghost" variant="ghost" />);
    expect(screen.getByRole('button')).toBeInTheDocument();

    rerender(<Button label="Destructive" variant="destructive" />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('renders icon-only button with aria-label', () => {
    render(
      <Button
        label="Settings"
        icon={<span data-testid="icon">⚙</span>}
        isIconOnly
      />,
    );
    const button = screen.getByRole('button', {name: 'Settings'});
    expect(button).toHaveAttribute('aria-label', 'Settings');
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('renders icon with text when both icon and children provided', () => {
    render(
      <Button label="Settings" icon={<span data-testid="icon">⚙</span>} />,
    );
    const button = screen.getByRole('button');
    expect(button).not.toHaveAttribute('aria-label');
    expect(button).toHaveTextContent('Settings');
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('shows isLoading state with spinner', () => {
    render(<Button label="Submit" isLoading />);
    const button = screen.getByRole('button');
    // Button should be disabled when loading
    expect(button).toBeDisabled();
  });

  it('sets aria-busy synchronously while clickAction is pending', async () => {
    // The spinner reveal is visually delayed (CSS animation-delay), but the
    // loading DOM state — aria-busy and disabled — must not be delayed.
    const user = userEvent.setup();
    let resolveAction: (() => void) | undefined;
    const clickAction = vi.fn(
      async () =>
        new Promise<void>(resolve => {
          resolveAction = resolve;
        }),
    );
    render(<Button label="Save" clickAction={clickAction} />);
    const button = screen.getByRole('button');

    await user.click(button);
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).toBeDisabled();

    await act(async () => {
      resolveAction?.();
      await Promise.resolve();
    });
    expect(button).not.toHaveAttribute('aria-busy', 'true');
    expect(button).not.toBeDisabled();
  });

  it('renders the loading spinner with the inherit shade for every variant (#2717)', () => {
    // The spinner must follow the button's resolved foreground color rather
    // than a hardcoded white, so it keeps contrast on themed variants like the
    // neutral theme's muted-red destructive button.
    for (const variant of [
      'primary',
      'secondary',
      'ghost',
      'destructive',
    ] as const) {
      const {container, unmount} = render(
        <Button label="Submit" variant={variant} isLoading />,
      );
      const spinner = container.querySelector('.astryx-spinner');
      expect(spinner).not.toBeNull();
      expect(spinner).toHaveAttribute('data-shade', 'inherit');
      unmount();
    }
  });

  it('handles click events', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<Button label="Click me" onClick={handleClick} />);

    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not fire click when disabled', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<Button label="Click me" isDisabled onClick={handleClick} />);

    await user.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('does not fire click when loading', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<Button label="Click me" isLoading onClick={handleClick} />);

    await user.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(<Button label="Test" ref={ref} />);
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLButtonElement));
  });

  // endContent tests
  it('renders endContent after label', () => {
    render(
      <Button
        label="Click me"
        endContent={<Badge data-testid="end" label={3} />}
      />,
    );
    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('Click me');
    expect(screen.getByTestId('end')).toBeInTheDocument();
    expect(screen.getByTestId('end')).toHaveTextContent('3');
  });

  it('renders endContent with children', () => {
    render(
      <Button
        label="Accessible name"
        endContent={<Badge data-testid="end" label="New" />}>
        Custom content
      </Button>,
    );
    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('Custom content');
    expect(screen.getByTestId('end')).toBeInTheDocument();
  });

  it('renders endContent with icon and children', () => {
    render(
      <Button
        label="Settings"
        icon={<span data-testid="icon">⚙</span>}
        endContent={<Badge data-testid="end" label="New" />}
      />,
    );
    const button = screen.getByRole('button');
    expect(screen.getByTestId('icon')).toBeInTheDocument();
    expect(button).toHaveTextContent('Settings');
    expect(screen.getByTestId('end')).toBeInTheDocument();
  });

  it('does not render endContent for icon-only buttons', () => {
    render(
      <Button
        label="Settings"
        icon={<span data-testid="icon">⚙</span>}
        endContent={<Badge data-testid="end" label={3} />}
        isIconOnly
      />,
    );
    expect(screen.getByTestId('icon')).toBeInTheDocument();
    expect(screen.queryByTestId('end')).not.toBeInTheDocument();
  });

  it('wraps endContent in a container for color inheritance', () => {
    render(
      <Button
        label="Test"
        endContent={<Badge data-testid="end" label={3} />}
      />,
    );
    const badge = screen.getByTestId('end');
    // The badge should be inside a wrapper span that inherits color
    const wrapper = badge.parentElement;
    expect(wrapper?.tagName).toBe('SPAN');
  });

  it('hides endContent content when loading', () => {
    render(
      <Button
        label="Submit"
        isLoading
        endContent={<Badge data-testid="end" label={3} />}
      />,
    );
    // endContent should still be in the DOM
    expect(screen.getByTestId('end')).toBeInTheDocument();
    // Button should be disabled and have aria-busy
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
  });

  it('renders astryx-* classes and data attributes for theme targeting', () => {
    render(<Button label="Test" variant="secondary" size="sm" />);
    const button = screen.getByRole('button');
    expect(button.className).toContain('astryx-button');
    expect(button.className).toContain('secondary');
    expect(button.className).toContain('sm');
    expect(button).toHaveAttribute('data-variant', 'secondary');
    expect(button).toHaveAttribute('data-size', 'sm');
  });

  it('applies string width as-is', () => {
    render(<Button label="Sign in" width="100%" />);
    const button = screen.getByRole('button');
    // StyleX compiles the dynamic width to an inline CSS custom property.
    expect(button.getAttribute('style')).toContain('100%');
    expect(button.className).toContain('dynamicStyles.width');
  });

  it('applies numeric width as pixels', () => {
    render(<Button label="Sign in" width={240} />);
    expect(screen.getByRole('button').getAttribute('style')).toContain('240');
  });

  it('omits width styling when the prop is not provided', () => {
    render(<Button label="Sign in" />);
    expect(screen.getByRole('button').className).not.toContain(
      'dynamicStyles.width',
    );
  });

  it('applies width when rendered as a link via href', () => {
    render(<Button label="Sign in" href="https://example.com" width="100%" />);
    expect(
      screen.getByRole('link', {name: 'Sign in'}).getAttribute('style'),
    ).toContain('100%');
  });

  // P0: onClick fires before clickAction, clickAction respects preventDefault
  it('fires onClick before clickAction', async () => {
    const user = userEvent.setup();
    const order: string[] = [];
    const handleClick = vi.fn(() => {
      order.push('onClick');
    });
    const handleAction = vi.fn(() => {
      order.push('clickAction');
    });
    render(
      <Button label="Test" onClick={handleClick} clickAction={handleAction} />,
    );

    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
    expect(handleAction).toHaveBeenCalledTimes(1);
    expect(order).toEqual(['onClick', 'clickAction']);
  });

  it('does not call clickAction when onClick calls preventDefault', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn((e: React.MouseEvent) => e.preventDefault());
    const handleAction = vi.fn();
    render(
      <Button label="Test" onClick={handleClick} clickAction={handleAction} />,
    );

    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
    expect(handleAction).not.toHaveBeenCalled();
  });

  it('fires clickAction once on a fast double-click (no double-submit)', async () => {
    let resolveAction: (() => void) | undefined;
    const handleAction = vi.fn(
      async () =>
        new Promise<void>(resolve => {
          resolveAction = resolve;
        }),
    );
    render(<Button label="Pay" clickAction={handleAction} />);

    const button = screen.getByRole('button');
    await act(async () => {
      fireEvent.click(button);
      fireEvent.click(button);
    });
    expect(handleAction).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveAction?.();
      await Promise.resolve();
    });
  });

  it('stays clickable (not disabled) while a clickAction is pending when isInterruptible', async () => {
    const user = userEvent.setup();
    let resolveAction: (() => void) | undefined;
    const clickAction = vi.fn(
      async () =>
        new Promise<void>(resolve => {
          resolveAction = resolve;
        }),
    );
    render(<Button label="Toggle" isInterruptible clickAction={clickAction} />);
    const button = screen.getByRole('button');

    await user.click(button);
    // Loading is announced via aria-busy, but the button is not disabled so it
    // can be re-clicked to interrupt the in-flight action.
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).not.toBeDisabled();

    await act(async () => {
      resolveAction?.();
      await Promise.resolve();
    });
    expect(button).not.toHaveAttribute('aria-busy', 'true');
    expect(button).not.toBeDisabled();
  });

  it('re-fires clickAction on re-click while pending when isInterruptible (no dedupe)', async () => {
    // Unlike the fire-once default, an interruptible action is not deduped: a
    // re-click while pending starts a fresh action that interrupts the prior.
    const resolvers: (() => void)[] = [];
    const clickAction = vi.fn(
      async () =>
        new Promise<void>(resolve => {
          resolvers.push(resolve);
        }),
    );
    render(<Button label="Toggle" isInterruptible clickAction={clickAction} />);

    const button = screen.getByRole('button');
    await act(async () => {
      fireEvent.click(button);
    });
    await act(async () => {
      fireEvent.click(button);
    });
    expect(clickAction).toHaveBeenCalledTimes(2);

    await act(async () => {
      resolvers.forEach(resolve => resolve());
      await Promise.resolve();
    });
  });

  // type/name/value/form props
  it('defaults type to button', () => {
    render(<Button label="Test" />);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  it('passes type=submit', () => {
    render(<Button label="Submit" type="submit" />);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
  });

  it('uses aria-disabled instead of disabled when tooltip is present and button is disabled', () => {
    render(<Button label="Test" tooltip="Reason disabled" isDisabled />);
    const button = screen.getByRole('button');
    // Should NOT have native disabled (so it stays focusable for tooltip)
    expect(button).not.toHaveAttribute('disabled');
    expect(button).toHaveAttribute('aria-disabled', 'true');
  });

  it('does not fire handlers when aria-disabled via tooltip', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(
      <Button
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
      <Button
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
    const {rerender} = render(<Button label="Submit" />);
    const button = screen.getByRole('button');
    const liveRegion = button.querySelector('[role="status"]');
    expect(liveRegion).toBeInTheDocument();
    expect(liveRegion).toHaveTextContent('');

    rerender(<Button label="Submit" isLoading />);
    expect(liveRegion).toHaveTextContent('Loading');
  });

  describe('elevation', () => {
    it('renders a distinct class for each elevation level', () => {
      const classFor = (elevation: 'none' | 'low' | 'med' | 'high') => {
        const {container} = render(
          <Button label="Save" elevation={elevation} />,
        );
        return container.querySelector('button')!.className;
      };
      const classes = new Set([
        classFor('none'),
        classFor('low'),
        classFor('med'),
        classFor('high'),
      ]);
      expect(classes.size).toBe(4);
    });

    it('defaults to flat (elevation none)', () => {
      const {container: def} = render(<Button label="Save" />);
      const {container: none} = render(
        <Button label="Save" elevation="none" />,
      );
      expect(def.querySelector('button')!.className).toBe(
        none.querySelector('button')!.className,
      );
    });
  });

  it('exposes aria-busy on the link-rendered button while loading', () => {
    // Non-interruptible loading disables the button, which falls back to
    // <button> rendering — so an anchor only shows loading when interruptible.
    render(
      <Button
        label="Docs"
        href="https://example.com"
        isLoading
        isInterruptible
      />,
    );
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('aria-busy', 'true');
  });

  it('does not set aria-busy on the link-rendered button when not loading', () => {
    render(<Button label="Docs" href="https://example.com" />);
    const link = screen.getByRole('link');
    expect(link).not.toHaveAttribute('aria-busy');
  });
});
