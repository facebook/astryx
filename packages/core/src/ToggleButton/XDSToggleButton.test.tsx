/**
 * @file XDSToggleButton.test.tsx
 * @input Uses vitest, @testing-library/react, XDSToggleButton, XDSToggleButtonGroup
 * @output Unit tests for XDSToggleButton and XDSToggleButtonGroup
 *
 * SYNC: When XDSToggleButton.tsx or XDSToggleButtonGroup.tsx changes, update tests
 */

import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {useState} from 'react';
import {XDSToggleButton} from './XDSToggleButton';
import {XDSToggleButtonGroup} from './XDSToggleButtonGroup';

// =============================================================================
// XDSToggleButton — Standalone
// =============================================================================

describe('XDSToggleButton', () => {
  it('renders with label as visible text', () => {
    render(
      <XDSToggleButton
        label="Bold"
        isPressed={false}
        onPressedChange={() => {}}
      />,
    );
    expect(screen.getByRole('button', {name: 'Bold'})).toBeInTheDocument();
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
    expect(screen.getByRole('button')).toHaveTextContent('Custom content');
  });

  it('renders icon-only button with aria-label', () => {
    render(
      <XDSToggleButton
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
    expect(handleChange).toHaveBeenCalledWith(false);
  });

  it('renders pressedIcon when pressed', () => {
    render(
      <XDSToggleButton
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
      <XDSToggleButton
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

  it('does not render width reservation for icon-only buttons', () => {
    render(
      <XDSToggleButton
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

// =============================================================================
// XDSToggleButtonGroup — Single mode
// =============================================================================

describe('XDSToggleButtonGroup (single)', () => {
  function SingleGroup() {
    const [value, setValue] = useState<string | null>('list');
    return (
      <XDSToggleButtonGroup value={value} onChange={setValue} label="View mode">
        <XDSToggleButton
          value="list"
          label="List"
          icon={<span>≡</span>}
          isIconOnly
        />
        <XDSToggleButton
          value="grid"
          label="Grid"
          icon={<span>⊞</span>}
          isIconOnly
        />
        <XDSToggleButton
          value="card"
          label="Card"
          icon={<span>□</span>}
          isIconOnly
        />
      </XDSToggleButtonGroup>
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
// XDSToggleButtonGroup — Multiple mode
// =============================================================================

describe('XDSToggleButtonGroup (multiple)', () => {
  function MultipleGroup() {
    const [value, setValue] = useState<string[]>(['bold']);
    return (
      <XDSToggleButtonGroup
        type="multiple"
        value={value}
        onChange={setValue}
        label="Formatting">
        <XDSToggleButton
          value="bold"
          label="Bold"
          icon={<span>B</span>}
          isIconOnly
        />
        <XDSToggleButton
          value="italic"
          label="Italic"
          icon={<span>I</span>}
          isIconOnly
        />
        <XDSToggleButton
          value="underline"
          label="Underline"
          icon={<span>U</span>}
          isIconOnly
        />
      </XDSToggleButtonGroup>
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
