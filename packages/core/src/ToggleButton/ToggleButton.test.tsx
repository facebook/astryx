// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ToggleButton.test.tsx
 * @input Uses vitest, @testing-library/react, ToggleButton, ToggleButtonGroup
 * @output Unit tests for ToggleButton and ToggleButtonGroup
 *
 * SYNC: When ToggleButton.tsx or ToggleButtonGroup.tsx changes, update tests
 */

import {describe, it, expect, vi} from 'vitest';
import {render, screen, act, fireEvent, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {useState} from 'react';
import {ToggleButton} from './ToggleButton';
import {ToggleButtonGroup} from './ToggleButtonGroup';

// =============================================================================
// ToggleButton — Standalone
// =============================================================================

describe('ToggleButton', () => {
  it('renders with label as visible text', () => {
    render(
      <ToggleButton
        label="Bold"
        isPressed={false}
        onPressedChange={() => {}}
      />,
    );
    expect(screen.getByRole('button', {name: 'Bold'})).toBeInTheDocument();
  });

  it('renders children instead of label when provided', () => {
    render(
      <ToggleButton
        label="Toggle bold"
        isPressed={false}
        onPressedChange={() => {}}>
        Custom content
      </ToggleButton>,
    );
    expect(screen.getByRole('button')).toHaveTextContent('Custom content');
  });

  it('renders icon-only button with aria-label', () => {
    render(
      <ToggleButton
        label="Bold"
        isPressed={false}
        onPressedChange={() => {}}
        icon={<span data-testid="icon">B</span>}
        isIconOnly
      />,
    );
    const button = screen.getByRole('button', {name: 'Bold'});
    expect(button).toHaveAttribute('aria-label', 'Bold');
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('sets aria-pressed=false when not pressed', () => {
    render(
      <ToggleButton
        label="Bold"
        isPressed={false}
        onPressedChange={() => {}}
      />,
    );
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false');
  });

  it('sets aria-pressed=true when pressed', () => {
    render(
      <ToggleButton label="Bold" isPressed={true} onPressedChange={() => {}} />,
    );
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
  });

  it('calls onPressedChange with true when clicking unpressed button', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <ToggleButton
        label="Bold"
        isPressed={false}
        onPressedChange={handleChange}
      />,
    );

    await user.click(screen.getByRole('button'));
    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it('calls onPressedChange with false when clicking pressed button', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <ToggleButton
        label="Bold"
        isPressed={true}
        onPressedChange={handleChange}
      />,
    );

    await user.click(screen.getByRole('button'));
    expect(handleChange).toHaveBeenCalledWith(false);
  });

  it('renders pressedIcon when pressed', () => {
    render(
      <ToggleButton
        label="Favorite"
        isPressed={true}
        onPressedChange={() => {}}
        icon={<span data-testid="outline-icon">♡</span>}
        pressedIcon={<span data-testid="filled-icon">♥</span>}
        isIconOnly
      />,
    );
    expect(screen.getByTestId('filled-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('outline-icon')).not.toBeInTheDocument();
  });

  it('renders icon when not pressed even if pressedIcon provided', () => {
    render(
      <ToggleButton
        label="Favorite"
        isPressed={false}
        onPressedChange={() => {}}
        icon={<span data-testid="outline-icon">♡</span>}
        pressedIcon={<span data-testid="filled-icon">♥</span>}
        isIconOnly
      />,
    );
    expect(screen.getByTestId('outline-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('filled-icon')).not.toBeInTheDocument();
  });

  it('does not fire events when disabled', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <ToggleButton
        label="Bold"
        isPressed={false}
        onPressedChange={handleChange}
        isDisabled
      />,
    );

    await user.click(screen.getByRole('button'));
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('renders width reservation element for label text', () => {
    render(
      <ToggleButton
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

  it('does not render width reservation for icon-only buttons', () => {
    render(
      <ToggleButton
        label="Bold"
        isPressed={false}
        onPressedChange={() => {}}
        icon={<span>B</span>}
        isIconOnly
      />,
    );
    const button = screen.getByRole('button');
    const hiddenSpan = button.querySelector('[aria-hidden="true"]');
    expect(hiddenSpan).not.toBeInTheDocument();
  });

  it('passes data-testid through', () => {
    render(
      <ToggleButton
        label="Bold"
        isPressed={false}
        onPressedChange={() => {}}
        data-testid="bold-toggle"
      />,
    );
    expect(screen.getByTestId('bold-toggle')).toBeInTheDocument();
  });

  it('shows the optimistic pressed state immediately, before any spinner', async () => {
    const user = userEvent.setup();
    let resolveAction: (() => void) | undefined;
    const pressedChangeAction = vi.fn(
      async () =>
        new Promise<void>(resolve => {
          resolveAction = resolve;
        }),
    );

    render(
      <ToggleButton
        label="Favorite"
        isPressed={false}
        onPressedChange={() => {}}
        pressedChangeAction={pressedChangeAction}
      />,
    );

    const button = screen.getByRole('button', {name: 'Favorite'});
    expect(button).toHaveAttribute('aria-pressed', 'false');

    await user.click(button);

    // The optimistic state flips immediately. The spinner is debounced, so the
    // button is not disabled or aria-busy yet — it stays interruptible.
    expect(pressedChangeAction).toHaveBeenCalledWith(true);
    expect(button).toHaveAttribute('aria-pressed', 'true');
    expect(button).not.toBeDisabled();
    expect(button).not.toHaveAttribute('aria-busy', 'true');

    // Settle the action so the pending transition doesn't leak into later tests.
    await act(async () => {
      resolveAction?.();
      await Promise.resolve();
    });
  });

  it('shows a loading spinner once the action stays pending past the delay', async () => {
    const user = userEvent.setup();
    let resolveAction: (() => void) | undefined;
    const pressedChangeAction = vi.fn(
      async () =>
        new Promise<void>(resolve => {
          resolveAction = resolve;
        }),
    );

    render(
      <ToggleButton
        label="Favorite"
        isPressed={false}
        onPressedChange={() => {}}
        pressedChangeAction={pressedChangeAction}
      />,
    );

    const button = screen.getByRole('button', {name: 'Favorite'});
    await user.click(button);

    // The optimistic state shows immediately; the spinner is debounced and
    // appears only after the action stays pending past the delay window.
    expect(button).toHaveAttribute('aria-pressed', 'true');
    await waitFor(() => expect(button).toBeDisabled());
    expect(button).toHaveAttribute('aria-busy', 'true');

    await act(async () => {
      resolveAction?.();
      await Promise.resolve();
    });
    expect(button).not.toBeDisabled();
    expect(button).not.toHaveAttribute('aria-busy', 'true');
  });

  it('interrupts an in-flight action on re-click (true -> false -> true)', async () => {
    // Each click interrupts the previous transition. The actions are resolved
    // at the end so the pending transition doesn't leak into later tests.
    const resolvers: (() => void)[] = [];
    const pressedChangeAction = vi.fn(
      async () =>
        new Promise<void>(resolve => {
          resolvers.push(resolve);
        }),
    );

    render(
      <ToggleButton
        label="Favorite"
        isPressed={false}
        onPressedChange={() => {}}
        pressedChangeAction={pressedChangeAction}
      />,
    );

    const button = screen.getByRole('button', {name: 'Favorite'});

    // Each click derives the next state from the optimistic (in-progress)
    // value, so rapid clicks toggle rather than being dropped. fireEvent keeps
    // the clicks within the spinner debounce window so the button stays
    // interruptible.
    await act(async () => {
      fireEvent.click(button);
    });
    expect(button).toHaveAttribute('aria-pressed', 'true');
    await act(async () => {
      fireEvent.click(button);
    });
    expect(button).toHaveAttribute('aria-pressed', 'false');
    await act(async () => {
      fireEvent.click(button);
    });
    expect(button).toHaveAttribute('aria-pressed', 'true');

    expect(pressedChangeAction).toHaveBeenCalledTimes(3);
    expect(pressedChangeAction).toHaveBeenNthCalledWith(1, true);
    expect(pressedChangeAction).toHaveBeenNthCalledWith(2, false);
    expect(pressedChangeAction).toHaveBeenNthCalledWith(3, true);

    await act(async () => {
      resolvers.forEach(resolve => resolve());
      await Promise.resolve();
    });
  });

  it('supports a synchronous pressedChangeAction', async () => {
    const user = userEvent.setup();
    // A sync handler (e.g. a router navigation) with no returned promise.
    const pressedChangeAction = vi.fn((_next: boolean) => {});
    const onPressedChange = vi.fn();

    render(
      <ToggleButton
        label="Favorite"
        isPressed={false}
        onPressedChange={onPressedChange}
        pressedChangeAction={pressedChangeAction}
      />,
    );

    const button = screen.getByRole('button', {name: 'Favorite'});
    await user.click(button);

    expect(onPressedChange).toHaveBeenCalledWith(true);
    expect(pressedChangeAction).toHaveBeenCalledWith(true);
  });
});

// =============================================================================
// ToggleButtonGroup — Single mode
// =============================================================================

describe('ToggleButtonGroup (single)', () => {
  function SingleGroup() {
    const [value, setValue] = useState<string | null>('list');
    return (
      <ToggleButtonGroup value={value} onChange={setValue} label="View mode">
        <ToggleButton
          value="list"
          label="List"
          icon={<span>≡</span>}
          isIconOnly
        />
        <ToggleButton
          value="grid"
          label="Grid"
          icon={<span>⊞</span>}
          isIconOnly
        />
        <ToggleButton
          value="card"
          label="Card"
          icon={<span>□</span>}
          isIconOnly
        />
      </ToggleButtonGroup>
    );
  }

  it('renders a group with role="group" and aria-label', () => {
    render(<SingleGroup />);
    expect(screen.getByRole('group', {name: 'View mode'})).toBeInTheDocument();
  });

  it('marks the selected button as pressed', () => {
    render(<SingleGroup />);
    expect(screen.getByRole('button', {name: 'List'})).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', {name: 'Grid'})).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('selects a different button on click', async () => {
    const user = userEvent.setup();
    render(<SingleGroup />);

    await user.click(screen.getByRole('button', {name: 'Grid'}));

    expect(screen.getByRole('button', {name: 'Grid'})).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', {name: 'List'})).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('allows deselection by clicking the active button', async () => {
    const user = userEvent.setup();
    render(<SingleGroup />);

    await user.click(screen.getByRole('button', {name: 'List'}));

    expect(screen.getByRole('button', {name: 'List'})).toHaveAttribute(
      'aria-pressed',
      'false',
    );
    expect(screen.getByRole('button', {name: 'Grid'})).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });
});

// =============================================================================
// ToggleButtonGroup — Multiple mode
// =============================================================================

describe('ToggleButtonGroup (multiple)', () => {
  function MultipleGroup() {
    const [value, setValue] = useState<string[]>(['bold']);
    return (
      <ToggleButtonGroup
        type="multiple"
        value={value}
        onChange={setValue}
        label="Formatting">
        <ToggleButton
          value="bold"
          label="Bold"
          icon={<span>B</span>}
          isIconOnly
        />
        <ToggleButton
          value="italic"
          label="Italic"
          icon={<span>I</span>}
          isIconOnly
        />
        <ToggleButton
          value="underline"
          label="Underline"
          icon={<span>U</span>}
          isIconOnly
        />
      </ToggleButtonGroup>
    );
  }

  it('marks selected buttons as pressed', () => {
    render(<MultipleGroup />);
    expect(screen.getByRole('button', {name: 'Bold'})).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', {name: 'Italic'})).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('adds a value when clicking an unpressed button', async () => {
    const user = userEvent.setup();
    render(<MultipleGroup />);

    await user.click(screen.getByRole('button', {name: 'Italic'}));

    expect(screen.getByRole('button', {name: 'Bold'})).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', {name: 'Italic'})).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('removes a value when clicking a pressed button', async () => {
    const user = userEvent.setup();
    render(<MultipleGroup />);

    await user.click(screen.getByRole('button', {name: 'Bold'}));

    expect(screen.getByRole('button', {name: 'Bold'})).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });
});
