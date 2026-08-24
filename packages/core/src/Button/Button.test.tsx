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
import {ButtonGroup} from '../ButtonGroup/ButtonGroup';
import {Badge} from '../Badge/Badge';
import {InternationalizationProvider} from '../i18n';

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
    // Busy is announced via aria, never the native disabled attribute — a
    // natively disabled element cannot hold focus (#4871).
    expect(button).not.toHaveAttribute('disabled');
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).toHaveAttribute('aria-disabled', 'true');
  });

  it('sets aria-busy synchronously while clickAction is pending', async () => {
    // The spinner reveal is visually delayed (CSS animation-delay), but the
    // loading DOM state — aria-busy and aria-disabled — must not be delayed.
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
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).not.toHaveAttribute('disabled');

    await act(async () => {
      resolveAction?.();
      await Promise.resolve();
    });
    expect(button).not.toHaveAttribute('aria-busy', 'true');
    expect(button).not.toHaveAttribute('aria-disabled');
  });

  it('keeps the button focusable while a clickAction is pending (#4871)', async () => {
    // Busy must never use the native disabled attribute: a natively disabled
    // element cannot hold focus, so the browser drops focus to <body> the
    // moment the action starts and a keyboard user loses their place.
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
    // Pending: no native disabled, so the browser never drops focus. (jsdom
    // does not simulate the focus drop itself, so the attribute check is the
    // discriminating assertion.)
    expect(button).not.toHaveAttribute('disabled');
    button.focus();
    expect(button).toHaveFocus();

    await act(async () => {
      resolveAction?.();
      await Promise.resolve();
    });
    // Settled: focus never left, so the user's place is preserved.
    expect(button).toHaveFocus();
  });

  it('suppresses keyboard re-activation while a clickAction is pending (#4871)', async () => {
    // With no native disabled attribute, the keyboard path must be guarded in
    // the handlers: Enter/Space on the focused busy button must not re-fire
    // the action, while non-activation keys still reach consumer handlers.
    const user = userEvent.setup();
    const handleKeyDown = vi.fn();
    let resolveAction: (() => void) | undefined;
    const clickAction = vi.fn(
      async () =>
        new Promise<void>(resolve => {
          resolveAction = resolve;
        }),
    );
    render(
      <Button
        label="Save"
        clickAction={clickAction}
        onKeyDown={handleKeyDown}
      />,
    );
    const button = screen.getByRole('button');

    button.focus();
    await user.keyboard('{Enter}');
    expect(clickAction).toHaveBeenCalledTimes(1);
    const keyDownCallsBeforeBusy = handleKeyDown.mock.calls.length;

    // Re-activation while pending is suppressed for both activation keys, and
    // the suppressed keys do not reach the consumer handler.
    await user.keyboard('{Enter}');
    await user.keyboard(' ');
    expect(clickAction).toHaveBeenCalledTimes(1);
    expect(handleKeyDown.mock.calls.length).toBe(keyDownCallsBeforeBusy);

    // Non-activation keys still reach the consumer handler while busy.
    await user.keyboard('{Escape}');
    expect(handleKeyDown.mock.calls.length).toBe(keyDownCallsBeforeBusy + 1);

    await act(async () => {
      resolveAction?.();
      await Promise.resolve();
    });
    // Settled: activation works again.
    await user.keyboard('{Enter}');
    expect(clickAction).toHaveBeenCalledTimes(2);

    // Settle the second action too so no transition dangles into later tests.
    await act(async () => {
      resolveAction?.();
      await Promise.resolve();
    });
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

  it('does not fire keyboard activation when loading (#4871)', async () => {
    // The loading button is focusable (no native disabled), so Enter/Space
    // must be suppressed in the handlers instead of by the attribute.
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<Button label="Click me" isLoading onClick={handleClick} />);

    const button = screen.getByRole('button');
    button.focus();
    await user.keyboard('{Enter}');
    await user.keyboard(' ');
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('still uses the native disabled attribute for isDisabled (no tooltip)', () => {
    // #4871 changes busy, not disabled: isDisabled keeps the native attribute
    // (and with it non-focusability) exactly as before.
    render(<Button label="Test" isDisabled />);
    expect(screen.getByRole('button')).toBeDisabled();
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
    // Button announces busy via aria and stays focusable (#4871)
    const button = screen.getByRole('button');
    expect(button).not.toHaveAttribute('disabled');
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

  it('localizes the loading announcement through the i18n catalog', () => {
    render(
      <InternationalizationProvider
        locale="fr"
        overrides={{fr: {'@astryx.button.loading': 'Chargement'}}}>
        <Button label="Submit" isLoading />
      </InternationalizationProvider>,
    );
    const button = screen.getByRole('button');
    // The Spinner also has role="status", so grab the live region explicitly.
    const regions = button.querySelectorAll('[role="status"]');
    const liveRegion = regions[regions.length - 1];
    expect(liveRegion).toHaveTextContent('Chargement');
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

  it('keeps the anchor while busy instead of swapping to a disabled button (#4871)', () => {
    // Swapping <a> → <button disabled> mid-action drops focus the same way
    // native disabled does — the busy anchor must stay an anchor.
    render(<Button label="Docs" href="https://example.com" isLoading />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('aria-busy', 'true');
    expect(link).toHaveAttribute('aria-disabled', 'true');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('does not set aria-busy on the link-rendered button when not loading', () => {
    render(<Button label="Docs" href="https://example.com" />);
    const link = screen.getByRole('link');
    expect(link).not.toHaveAttribute('aria-busy');
  });

  describe('busy state edge cases (#4871)', () => {
    const pendingAction = () => {
      let resolveAction: (() => void) | undefined;
      const clickAction = vi.fn(
        async () =>
          new Promise<void>(resolve => {
            resolveAction = resolve;
          }),
      );
      const settle = async () =>
        act(async () => {
          resolveAction?.();
          await Promise.resolve();
        });
      return {clickAction, settle};
    };

    it('tooltip + busy: aria-disabled path, Enter suppressed, recovers on settle', async () => {
      const user = userEvent.setup();
      const {clickAction, settle} = pendingAction();
      render(
        <Button
          label="Save"
          tooltip="Saves the draft"
          clickAction={clickAction}
        />,
      );
      const button = screen.getByRole('button');

      button.focus();
      await user.keyboard('{Enter}');
      expect(clickAction).toHaveBeenCalledTimes(1);
      expect(button).not.toHaveAttribute('disabled');
      expect(button).toHaveAttribute('aria-disabled', 'true');
      expect(button).toHaveAttribute('aria-busy', 'true');

      await user.keyboard('{Enter}');
      expect(clickAction).toHaveBeenCalledTimes(1);

      await settle();
      expect(button).not.toHaveAttribute('aria-disabled');
      await user.keyboard('{Enter}');
      expect(clickAction).toHaveBeenCalledTimes(2);
      await settle();
    });

    it('isDisabled + isLoading (no tooltip): native disabled wins over busy', () => {
      // isBusy deliberately excludes hard-disabled: a button the consumer
      // disabled stays natively disabled even while showing a spinner.
      render(<Button label="Save" isDisabled isLoading />);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('aria-busy', 'true');
      expect(button).not.toHaveAttribute('aria-disabled');
    });

    it('isDisabled + isLoading + tooltip: aria-disabled path, no handlers fire', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(
        <Button
          label="Save"
          tooltip="Why disabled"
          isDisabled
          isLoading
          onClick={handleClick}
        />,
      );
      const button = screen.getByRole('button');
      expect(button).not.toHaveAttribute('disabled');
      expect(button).toHaveAttribute('aria-disabled', 'true');
      await user.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('ButtonGroup disabled: child stays natively disabled, busy or not', () => {
      render(
        <ButtonGroup label="Actions" isDisabled>
          <Button label="Copy" />
          <Button label="Save" isLoading />
        </ButtonGroup>,
      );
      expect(screen.getByRole('button', {name: 'Copy'})).toBeDisabled();
      expect(screen.getByRole('button', {name: 'Save'})).toBeDisabled();
    });

    it('ButtonGroup disabled + tooltip on child: aria-disabled path', () => {
      render(
        <ButtonGroup label="Actions" isDisabled>
          <Button label="Copy" tooltip="Nothing selected" />
        </ButtonGroup>,
      );
      const button = screen.getByRole('button', {name: 'Copy'});
      expect(button).not.toHaveAttribute('disabled');
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });

    it('isInterruptible busy: aria-busy without aria-disabled (still interactive)', async () => {
      const user = userEvent.setup();
      const {clickAction, settle} = pendingAction();
      render(
        <Button label="Toggle" isInterruptible clickAction={clickAction} />,
      );
      const button = screen.getByRole('button');

      await user.click(button);
      expect(button).toHaveAttribute('aria-busy', 'true');
      // Interruptible is genuinely interactive, so announcing it disabled
      // would be a lie to AT.
      expect(button).not.toHaveAttribute('aria-disabled');
      expect(button).not.toHaveAttribute('disabled');
      await settle();
    });

    it('isInterruptible + isDisabled: native disabled wins, clicks dead', async () => {
      const user = userEvent.setup();
      const clickAction = vi.fn();
      render(
        <Button
          label="Toggle"
          isInterruptible
          isDisabled
          clickAction={clickAction}
        />,
      );
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      await user.click(button);
      expect(clickAction).not.toHaveBeenCalled();
    });

    it('busy submit button does not submit its form; idle one does', async () => {
      const user = userEvent.setup();
      const handleSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
      const {rerender} = render(
        <form onSubmit={handleSubmit}>
          <Button label="Save" type="submit" isLoading />
        </form>,
      );
      await user.click(screen.getByRole('button'));
      expect(handleSubmit).not.toHaveBeenCalled();

      rerender(
        <form onSubmit={handleSubmit}>
          <Button label="Save" type="submit" />
        </form>,
      );
      await user.click(screen.getByRole('button'));
      expect(handleSubmit).toHaveBeenCalledTimes(1);
    });

    it('isDisabled + href still falls back to a native disabled button', () => {
      // The disabled-link anti-pattern fallback is unchanged; only busy keeps
      // the anchor.
      render(<Button label="Docs" href="https://example.com" isDisabled />);
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('busy link: focusable, but click activation is swallowed', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(
        <Button
          label="Docs"
          href="https://example.com"
          isLoading
          onClick={handleClick}
        />,
      );
      const link = screen.getByRole('link');
      link.focus();
      expect(link).toHaveFocus();
      await user.click(link);
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('recovers after a rejected clickAction: busy clears and it fires again', async () => {
      const user = userEvent.setup();
      const consoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      let rejectAction: ((e: Error) => void) | undefined;
      const clickAction = vi.fn(
        async () =>
          new Promise<void>((_resolve, reject) => {
            rejectAction = reject;
          }),
      );
      render(<Button label="Save" clickAction={clickAction} />);
      const button = screen.getByRole('button');

      await user.click(button);
      expect(button).toHaveAttribute('aria-busy', 'true');

      const failure = new Error('save failed');
      await act(async () => {
        rejectAction?.(failure);
        await Promise.resolve();
      });

      // A failed action must not strand the busy state: the transition
      // settles, the spinner leaves, and the user can retry. (Without the
      // catch in the action, isPending sticks and the button is bricked.)
      expect(button).not.toHaveAttribute('aria-busy', 'true');
      await user.click(button);
      expect(clickAction).toHaveBeenCalledTimes(2);

      // The rejection is reported (devError), not swallowed.
      expect(consoleError).toHaveBeenCalledWith(
        'Button: clickAction rejected:',
        failure,
      );

      // Settle the retry's action too so nothing dangles into later tests.
      await act(async () => {
        rejectAction?.(new Error('save failed'));
        await Promise.resolve();
      });
      consoleError.mockRestore();
    });
  });
});
