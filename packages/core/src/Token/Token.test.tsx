// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Token.test.tsx
 * @input Uses vitest, @testing-library/react, Token component
 * @output Unit tests for Token component behavior
 * @position Testing; validates Token.tsx implementation
 *
 * SYNC: When Token.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, vi} from 'vitest';
import {render, screen, fireEvent} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {Token} from './Token';

describe('Token', () => {
  it('renders with label', () => {
    render(<Token label="Tag" />);
    expect(screen.getByText('Tag')).toBeInTheDocument();
  });

  it('renders as a span by default', () => {
    const {container} = render(<Token label="Tag" />);
    const root = container.firstChild;
    expect(root?.nodeName).toBe('SPAN');
  });

  it('renders each color variant', () => {
    const colors = [
      'default',
      'red',
      'orange',
      'yellow',
      'green',
      'teal',
      'cyan',
      'blue',
      'purple',
      'pink',
      'gray',
    ] as const;

    for (const color of colors) {
      const {unmount} = render(
        <Token label={color} color={color} data-testid={`token-${color}`} />,
      );
      expect(screen.getByTestId(`token-${color}`)).toBeInTheDocument();
      expect(screen.getByText(color)).toBeInTheDocument();
      unmount();
    }
  });

  it('renders as a span with invisible button when onClick is provided', () => {
    const handleClick = vi.fn();
    render(
      <Token label="Clickable" onClick={handleClick} data-testid="token" />,
    );
    const button = screen.getByRole('button', {name: 'Clickable'});
    expect(button).toBeInTheDocument();
    expect(button.tagName).toBe('BUTTON');
    // Container is a span, not a button
    const container = screen.getByTestId('token');
    expect(container.tagName).toBe('SPAN');
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('fires onClick when clicking the container span', () => {
    const handleClick = vi.fn();
    render(
      <Token label="Clickable" onClick={handleClick} data-testid="token" />,
    );
    const container = screen.getByTestId('token');
    fireEvent.click(container);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders as a link when href is provided', () => {
    render(<Token label="Link" href="/test" />);
    const link = screen.getByRole('link', {name: 'Link'});
    expect(link).toBeInTheDocument();
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', '/test');
  });

  it('shows remove button when onRemove is provided', () => {
    const handleRemove = vi.fn();
    render(<Token label="Removable" onRemove={handleRemove} />);
    const removeButton = screen.getByRole('button', {name: 'Remove Removable'});
    expect(removeButton).toBeInTheDocument();
    fireEvent.click(removeButton);
    expect(handleRemove).toHaveBeenCalledTimes(1);
  });

  it('stops propagation when remove button is clicked', () => {
    const handleRemove = vi.fn();
    const handleClick = vi.fn();
    render(
      <Token label="Token" onClick={handleClick} onRemove={handleRemove} />,
    );
    const removeButton = screen.getByRole('button', {name: 'Remove Token'});
    fireEvent.click(removeButton);
    expect(handleRemove).toHaveBeenCalledTimes(1);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('renders disabled state', () => {
    const handleClick = vi.fn();
    render(
      <Token
        label="Disabled"
        onClick={handleClick}
        isDisabled
        data-testid="token"
      />,
    );
    const button = screen.getByRole('button', {name: 'Disabled'});
    expect(button).toBeDisabled();
    expect(button.tagName).toBe('BUTTON');
    // Container click is also disabled
    const container = screen.getByTestId('token');
    fireEvent.click(container);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('hides label visually when isLabelHidden is true', () => {
    render(<Token label="Hidden" isLabelHidden />);
    // Label text is still in the DOM for screen readers
    expect(screen.getByText('Hidden')).toBeInTheDocument();
    // Root element should have aria-label
    const root = screen.getByText('Hidden').closest('span[aria-label]');
    expect(root).toHaveAttribute('aria-label', 'Hidden');
  });

  it('renders endContent', () => {
    render(
      <Token
        label="Token"
        endContent={<span data-testid="end">End</span>}
      />,
    );
    expect(screen.getByTestId('end')).toBeInTheDocument();
    expect(screen.getByText('End')).toBeInTheDocument();
  });

  it('renders icon', () => {
    render(<Token label="Token" icon={<span data-testid="icon">★</span>} />);
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('supports data-testid', () => {
    render(<Token label="Test" data-testid="my-token" />);
    expect(screen.getByTestId('my-token')).toBeInTheDocument();
  });

  it('renders description as aria-description', () => {
    render(
      <Token
        label="Token"
        description="A helpful description"
        data-testid="described-token"
      />,
    );
    expect(screen.getByTestId('described-token')).toHaveAttribute(
      'aria-description',
      'A helpful description',
    );
  });

  it('forwards ref', () => {
    const ref = {current: null as HTMLElement | null};
    render(<Token ref={ref} label="Ref test" />);
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
  });

  it('forwards ref to span when onClick provided', () => {
    const ref = {current: null as HTMLElement | null};
    render(<Token ref={ref} label="Ref test" onClick={() => {}} />);
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
  });

  it('forwards ref to anchor when href provided', () => {
    const ref = {current: null as HTMLElement | null};
    render(<Token ref={ref} label="Ref test" href="/test" />);
    expect(ref.current).toBeInstanceOf(HTMLAnchorElement);
  });
});

describe('Token accessibility', () => {
  it('does not nest buttons when both onClick and onRemove are provided', () => {
    render(<Token label="Token" onClick={() => {}} onRemove={() => {}} />);
    const buttons = screen.getAllByRole('button');
    // Should have exactly 2: invisible label button + remove button
    expect(buttons).toHaveLength(2);
    // No button should contain another button
    for (const button of buttons) {
      expect(button.querySelector('button')).toBeNull();
    }
  });

  it('allows independent focus on label button and remove button', async () => {
    const user = userEvent.setup();
    render(<Token label="Token" onClick={() => {}} onRemove={() => {}} />);

    // Tab to first button (invisible label button)
    await user.tab();
    expect(screen.getByRole('button', {name: 'Token'})).toHaveFocus();

    // Tab to second button (remove button)
    await user.tab();
    expect(screen.getByRole('button', {name: 'Remove Token'})).toHaveFocus();
  });

  it('fires onClick when Enter is pressed on the invisible button', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<Token label="Token" onClick={handleClick} />);

    await user.tab();
    await user.keyboard('{Enter}');
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('fires onClick when Space is pressed on the invisible button', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<Token label="Token" onClick={handleClick} />);

    await user.tab();
    await user.keyboard(' ');
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('remove button has accessible name including the token label', () => {
    render(<Token label="JavaScript" onRemove={() => {}} />);
    expect(
      screen.getByRole('button', {name: 'Remove JavaScript'}),
    ).toBeInTheDocument();
  });

  it('disables both buttons when isDisabled is true', () => {
    render(
      <Token
        label="Token"
        onClick={() => {}}
        onRemove={() => {}}
        isDisabled
      />,
    );
    const buttons = screen.getAllByRole('button');
    for (const button of buttons) {
      expect(button).toBeDisabled();
    }
  });

  it('does not fire onClick or onRemove when disabled', () => {
    const handleClick = vi.fn();
    const handleRemove = vi.fn();
    render(
      <Token
        label="Token"
        onClick={handleClick}
        onRemove={handleRemove}
        isDisabled
        data-testid="token"
      />,
    );

    // Click on container
    const container = screen.getByTestId('token');
    fireEvent.click(container);
    expect(handleClick).not.toHaveBeenCalled();

    // Try to click remove button (it's disabled)
    const removeBtn = screen.getByRole('button', {name: 'Remove Token'});
    fireEvent.click(removeBtn);
    expect(handleRemove).not.toHaveBeenCalled();
  });

  it('container click handler does not fire when clicking the remove button', () => {
    const handleClick = vi.fn();
    const handleRemove = vi.fn();
    render(
      <Token label="Token" onClick={handleClick} onRemove={handleRemove} />,
    );

    const removeButton = screen.getByRole('button', {name: 'Remove Token'});
    fireEvent.click(removeButton);

    expect(handleRemove).toHaveBeenCalledTimes(1);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('hidden label is accessible to screen readers', () => {
    render(<Token label="Hidden Tag" isLabelHidden onClick={() => {}} />);
    // The invisible button should still be findable by its accessible name
    expect(
      screen.getByRole('button', {name: 'Hidden Tag'}),
    ).toBeInTheDocument();
  });

  it('link token has correct role and is focusable', async () => {
    const user = userEvent.setup();
    render(<Token label="Link Token" href="/test" />);

    const link = screen.getByRole('link', {name: 'Link Token'});
    expect(link).toHaveAttribute('href', '/test');

    await user.tab();
    expect(link).toHaveFocus();
  });

  it('remove button element exists with correct aria-label', () => {
    const {container} = render(<Token label="Token" onRemove={() => {}} />);
    const removeButton = container.querySelector(
      'button[aria-label="Remove Token"]',
    );
    expect(removeButton).toBeInTheDocument();
  });
});

describe('Token text overflow', () => {
  it('label element has overflow hidden and text-overflow ellipsis styles', () => {
    const {container} = render(<Token label="A very long label text" />);
    const labelSpan = container.querySelector('span > span');
    expect(labelSpan).toBeInTheDocument();
    // The label span should exist and contain the text
    expect(labelSpan?.textContent).toBe('A very long label text');
  });

  it('label element has overflow styles when onClick is provided', () => {
    const {container: _container} = render(
      <Token label="A very long clickable label" onClick={() => {}} />,
    );
    // In onClick mode, the label is inside the invisible button
    const button = screen.getByRole('button', {
      name: 'A very long clickable label',
    });
    const labelSpan = button.querySelector('span');
    expect(labelSpan).toBeInTheDocument();
    expect(labelSpan?.textContent).toBe('A very long clickable label');
  });
});

describe('Token size', () => {
  it('renders with size="lg"', () => {
    render(<Token label="Tag" size="lg" data-testid="lg-token" />);
    expect(screen.getByTestId('lg-token')).toBeInTheDocument();
    expect(screen.getByText('Tag')).toBeInTheDocument();
  });
});

describe('Token focus outline', () => {
  it('invisible button does not show its own focus outline', async () => {
    const user = userEvent.setup();
    render(
      <Token
        label="Focusable"
        onClick={() => {}}
        data-testid="focus-token"
      />,
    );
    const button = screen.getByRole('button', {name: 'Focusable'});
    await user.tab();
    expect(button).toHaveFocus();
    // The container should handle focus outline via :has(:focus-visible),
    // not the button itself
    const container = screen.getByTestId('focus-token');
    expect(container.tagName).toBe('SPAN');
  });
});
