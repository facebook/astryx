// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Item.test.tsx
 * @input Uses vitest, @testing-library/react, Item component
 * @output Unit tests for Item
 * @position Testing; validates Item component implementation
 *
 * SYNC: When Item component changes, update tests to match new behavior
 */

import {useRef} from 'react';
import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {Item} from './Item';

/**
 * Item in delegation mode: `interactiveRef` points at a nested control that
 * owns the row's keyboard access and action. The row is an enlarged tap target
 * that forwards surface clicks to that control (useClickableContainer).
 */
function DelegatingItem({onToggle}: {onToggle?: () => void}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <Item
      label="Row"
      interactiveRef={ref}
      startContent={
        <input
          ref={ref}
          type="checkbox"
          aria-label="Pick row"
          onChange={onToggle}
        />
      }
    />
  );
}

describe('Item', () => {
  // ===========================================================================
  // Basic rendering
  // ===========================================================================

  it('renders label text', () => {
    render(<Item label="Contact Name" />);
    expect(screen.getByText('Contact Name')).toBeInTheDocument();
  });

  it('renders label and description', () => {
    render(<Item label="Settings" description="Manage your preferences" />);
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Manage your preferences')).toBeInTheDocument();
  });

  it('renders marker', () => {
    render(<Item label="Item" marker={<span data-testid="marker">•</span>} />);
    expect(screen.getByTestId('marker')).toBeInTheDocument();
  });

  it('renders startContent', () => {
    render(
      <Item label="Item" startContent={<span data-testid="avatar">A</span>} />,
    );
    expect(screen.getByTestId('avatar')).toBeInTheDocument();
  });

  it('renders endContent', () => {
    render(
      <Item label="Item" endContent={<span data-testid="badge">3</span>} />,
    );
    expect(screen.getByTestId('badge')).toBeInTheDocument();
  });

  it('renders all slots together', () => {
    render(
      <Item
        marker={<span data-testid="marker">•</span>}
        startContent={<span data-testid="start">S</span>}
        label="Label"
        description="Description"
        endContent={<span data-testid="end">E</span>}
      />,
    );
    expect(screen.getByTestId('marker')).toBeInTheDocument();
    expect(screen.getByTestId('start')).toBeInTheDocument();
    expect(screen.getByText('Label')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByTestId('end')).toBeInTheDocument();
  });

  it('supports data-testid', () => {
    render(<Item label="Item" data-testid="my-item" />);
    expect(screen.getByTestId('my-item')).toBeInTheDocument();
  });

  it('renders as a div element', () => {
    const {container} = render(<Item label="Item" />);
    expect(container.firstChild?.nodeName).toBe('DIV');
  });

  // ===========================================================================
  // Ref forwarding
  // ===========================================================================

  it('forwards ref to the root element', () => {
    let refValue: HTMLElement | null = null;
    render(
      <Item
        label="Item"
        ref={el => {
          refValue = el;
        }}
      />,
    );
    expect(refValue).toBeInstanceOf(HTMLDivElement);
  });

  // ===========================================================================
  // Interactive — onClick (invisible button pattern)
  // ===========================================================================

  it('renders an invisible button when onClick is provided', () => {
    const onClick = vi.fn();
    const {container} = render(<Item label="Clickable" onClick={onClick} />);
    const button = container.querySelector('button');
    expect(button).toBeInTheDocument();
    expect(button?.textContent).toContain('Clickable');
  });

  it('fires onClick when invisible button is clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Item label="Clickable" onClick={onClick} />);
    await user.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('fires onClick when container area is clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Item
        label="Clickable"
        onClick={onClick}
        data-testid="item"
        startContent={<span data-testid="start">S</span>}
      />,
    );
    await user.click(screen.getByTestId('start'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not fire item onClick when endContent interactive element is clicked', async () => {
    const user = userEvent.setup();
    const itemClick = vi.fn();
    const buttonClick = vi.fn();
    render(
      <Item
        label="Item"
        onClick={itemClick}
        endContent={
          <button type="button" onClick={buttonClick}>
            Action
          </button>
        }
      />,
    );
    await user.click(screen.getByText('Action'));
    expect(buttonClick).toHaveBeenCalledTimes(1);
    expect(itemClick).not.toHaveBeenCalled();
  });

  it('does not fire item onClick when startContent interactive element is clicked', async () => {
    const user = userEvent.setup();
    const itemClick = vi.fn();
    const buttonClick = vi.fn();
    render(
      <Item
        label="Item"
        onClick={itemClick}
        startContent={
          <button type="button" onClick={buttonClick}>
            Open
          </button>
        }
      />,
    );
    await user.click(screen.getByText('Open'));
    expect(buttonClick).toHaveBeenCalledTimes(1);
    expect(itemClick).not.toHaveBeenCalled();
  });

  it('invisible button is focusable via keyboard', async () => {
    const user = userEvent.setup();
    render(<Item label="Focusable" onClick={() => {}} />);
    await user.tab();
    expect(screen.getByRole('button')).toHaveFocus();
  });

  it('invisible button can be activated via keyboard', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Item label="Pressable" onClick={onClick} />);
    await user.tab();
    await user.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not render nested buttons — only one invisible button', () => {
    const {container} = render(<Item label="Item" onClick={() => {}} />);
    const buttons = container.querySelectorAll('div button');
    expect(buttons).toHaveLength(1);
  });

  // ===========================================================================
  // Interactive — interactiveRef (delegation to a nested control)
  // ===========================================================================

  it('renders no invisible button in interactiveRef (delegation) mode', () => {
    const {container} = render(<DelegatingItem />);
    // The nested control provides keyboard access — the row must not add a
    // second focusable control for the same action (WCAG 4.1.2).
    expect(container.querySelector('button')).not.toBeInTheDocument();
  });

  it('keeps the nested control as the only tab stop in interactiveRef mode', async () => {
    const user = userEvent.setup();
    render(<DelegatingItem />);
    await user.tab();
    expect(screen.getByRole('checkbox')).toHaveFocus();
    // Next tab leaves the item entirely — the row itself is not focusable.
    await user.tab();
    expect(screen.getByRole('checkbox')).not.toHaveFocus();
    expect(document.body).toHaveFocus();
  });

  it('delegates a row-surface click to the interactive control', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(<DelegatingItem onToggle={onToggle} />);
    // Clicking the label (row surface) is forwarded to the checkbox.
    await user.click(screen.getByText('Row'));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('does not double-fire when the interactive control itself is clicked', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(<DelegatingItem onToggle={onToggle} />);
    await user.click(screen.getByRole('checkbox'));
    // The row must not re-forward the control's own click back to it.
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('ignores onClick when interactiveRef is set (delegation wins, single tab stop)', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    function ItemWithBoth() {
      const ref = useRef<HTMLInputElement>(null);
      return (
        <Item
          label="Row"
          onClick={onClick}
          interactiveRef={ref}
          startContent={
            <input ref={ref} type="checkbox" aria-label="Pick row" />
          }
        />
      );
    }
    const {container} = render(<ItemWithBoth />);
    // No invisible button (onClick is ignored in delegation mode)...
    expect(container.querySelector('button')).not.toBeInTheDocument();
    // ...and the checkbox is still the sole tab stop.
    await user.tab();
    expect(screen.getByRole('checkbox')).toHaveFocus();
  });

  // ===========================================================================
  // Interactive — href (invisible anchor pattern)
  // ===========================================================================

  it('renders an invisible anchor when href is provided', () => {
    const {container} = render(<Item label="Link" href="/docs" />);
    const anchor = container.querySelector('a');
    expect(anchor).toBeInTheDocument();
    expect(anchor).toHaveAttribute('href', '/docs');
    expect(anchor?.textContent).toContain('Link');
  });

  it('sets target on anchor when provided', () => {
    const {container} = render(
      <Item label="External" href="https://example.com" target="_blank" />,
    );
    const anchor = container.querySelector('a');
    expect(anchor).toHaveAttribute('target', '_blank');
    expect(anchor).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('preserves existing rel tokens when target is blank', () => {
    const {container} = render(
      <Item
        label="External"
        href="https://example.com"
        target="_blank"
        rel="sponsored noopener"
      />,
    );
    const anchor = container.querySelector('a');
    expect(anchor).toHaveAttribute('rel', 'sponsored noopener noreferrer');
  });

  it('does not render button or anchor for static items', () => {
    const {container} = render(<Item label="Static" />);
    expect(container.querySelector('button')).not.toBeInTheDocument();
    expect(container.querySelector('a')).not.toBeInTheDocument();
  });

  // ===========================================================================
  // Disabled state
  // ===========================================================================

  it('applies aria-disabled when isDisabled', () => {
    render(<Item label="Disabled" isDisabled data-testid="item" />);
    expect(screen.getByTestId('item')).toHaveAttribute('aria-disabled', 'true');
  });

  it('disables the invisible button when isDisabled', () => {
    const {container} = render(
      <Item label="Disabled" onClick={() => {}} isDisabled />,
    );
    const button = container.querySelector('button');
    expect(button).toBeDisabled();
  });

  it('does not fire onClick when disabled item is clicked', async () => {
    const onClick = vi.fn();
    render(
      <Item label="Disabled" onClick={onClick} isDisabled data-testid="item" />,
    );
    const item = screen.getByTestId('item');
    item.dispatchEvent(new MouseEvent('click', {bubbles: true}));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('does not set aria-disabled when not disabled', () => {
    render(<Item label="Item" data-testid="item" />);
    expect(screen.getByTestId('item')).not.toHaveAttribute('aria-disabled');
  });

  // ===========================================================================
  // Selected state
  // ===========================================================================

  it('conveys selection via aria-current on the default div root', () => {
    // aria-selected is invalid ARIA on a generic div (axe: aria-allowed-attr),
    // so selection is exposed via aria-current, which is valid on any element.
    render(<Item label="Selected" isSelected data-testid="item" />);
    const item = screen.getByTestId('item');
    expect(item).not.toHaveAttribute('aria-selected');
    expect(item).toHaveAttribute('aria-current', 'true');
  });

  it('applies aria-selected (not aria-current) when the role permits it', () => {
    render(
      <Item label="Selected" isSelected role="option" data-testid="item" />,
    );
    const item = screen.getByTestId('item');
    expect(item).toHaveAttribute('aria-selected', 'true');
    // A permitted role uses aria-selected; aria-current would be redundant.
    expect(item).not.toHaveAttribute('aria-current');
  });

  it('falls back to aria-current when the role does not permit aria-selected', () => {
    render(
      <Item label="Selected" isSelected role="menuitem" data-testid="item" />,
    );
    const item = screen.getByTestId('item');
    expect(item).not.toHaveAttribute('aria-selected');
    expect(item).toHaveAttribute('aria-current', 'true');
  });

  it('applies neither aria-selected nor aria-current when not selected', () => {
    render(<Item label="Not Selected" role="option" data-testid="item" />);
    const item = screen.getByTestId('item');
    expect(item).not.toHaveAttribute('aria-selected');
    expect(item).not.toHaveAttribute('aria-current');
  });

  it('lets a consumer-provided aria-current win over the selection default', () => {
    render(
      <Item label="Step" isSelected aria-current="step" data-testid="item" />,
    );
    expect(screen.getByTestId('item')).toHaveAttribute('aria-current', 'step');
  });

  // ===========================================================================
  // Highlighted state
  // ===========================================================================

  it('renders with isHighlighted without errors', () => {
    render(<Item label="Highlighted" isHighlighted data-testid="item" />);
    expect(screen.getByTestId('item')).toBeInTheDocument();
  });

  // ===========================================================================
  // Marker, start, and end slot positions
  // ===========================================================================

  it('marker, startContent, and endContent are siblings to invisible button', () => {
    const {container} = render(
      <Item
        label="Item"
        onClick={() => {}}
        marker={<span data-testid="marker">•</span>}
        startContent={<span data-testid="start">S</span>}
        endContent={<span data-testid="end">E</span>}
      />,
    );
    const button = container.querySelector('button');
    const root = container.firstElementChild;
    expect(root?.querySelector('[data-testid="marker"]')).toBeInTheDocument();
    expect(root?.querySelector('[data-testid="start"]')).toBeInTheDocument();
    expect(root?.querySelector('[data-testid="end"]')).toBeInTheDocument();
    expect(
      button?.querySelector('[data-testid="marker"]'),
    ).not.toBeInTheDocument();
    expect(
      button?.querySelector('[data-testid="start"]'),
    ).not.toBeInTheDocument();
    expect(
      button?.querySelector('[data-testid="end"]'),
    ).not.toBeInTheDocument();
  });

  // ===========================================================================
  // Density variants
  // ===========================================================================

  it('renders with balanced density by default', () => {
    render(<Item label="Item" data-testid="item" />);
    expect(screen.getByTestId('item')).toBeInTheDocument();
    expect(screen.getByTestId('item').className).toContain('balanced');
  });

  it('renders with compact density', () => {
    render(<Item label="Item" density="compact" data-testid="item" />);
    expect(screen.getByTestId('item')).toBeInTheDocument();
  });

  it('renders with spacious density', () => {
    render(<Item label="Item" density="spacious" data-testid="item" />);
    expect(screen.getByTestId('item')).toBeInTheDocument();
    expect(screen.getByTestId('item').className).toContain('spacious');
  });

  // ===========================================================================
  // Alignment
  // ===========================================================================

  it('renders with center alignment by default', () => {
    render(<Item label="Item" data-testid="item" />);
    expect(screen.getByTestId('item')).toBeInTheDocument();
  });

  it('renders with start alignment', () => {
    render(<Item label="Item" align="start" data-testid="item" />);
    expect(screen.getByTestId('item')).toBeInTheDocument();
  });

  // ===========================================================================
  // Description rendering
  // ===========================================================================

  it('does not render description when not provided', () => {
    render(<Item label="Label Only" />);
    expect(screen.getByText('Label Only')).toBeInTheDocument();
    expect(screen.queryByText('undefined')).not.toBeInTheDocument();
  });

  it('accepts ReactNode as description', () => {
    render(
      <Item
        label="Item"
        description={
          <div>
            <span>Rich</span> <span>description</span>
          </div>
        }
      />,
    );
    expect(screen.getByText('Rich')).toBeInTheDocument();
    expect(screen.getByText('description')).toBeInTheDocument();
  });

  it('accepts ReactNode as label', () => {
    render(
      <Item
        label={
          <span>
            <b>Alice</b> commented
          </span>
        }
      />,
    );
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText(/commented/)).toBeInTheDocument();
  });
  it('puts the label and description in one row when layout is inline', () => {
    const stacked = render(
      <Item label="Private" description="Only members can access" />,
    );
    const stackedRow = screen.getByText('Private').parentElement;
    stacked.unmount();

    render(
      <Item
        label="Private"
        description="Only members can access"
        layout="inline"
      />,
    );
    const inlineRow = screen.getByText('Private').parentElement;

    // Same container, different styling: the shared content box switches from
    // a column to a row, so its class list must differ from the stacked one.
    expect(inlineRow?.className).not.toBe(stackedRow?.className);
  });

  it('ellipsizes a ReactNode description when layout is inline', () => {
    // A stacked ReactNode description is left alone (it may wrap); an inline
    // one is one line by definition, so it truncates like a string does.
    const stacked = render(
      <Item
        label="Private"
        description={<span>Only members can access</span>}
      />,
    );
    const stackedDescription = screen.getByText('Only members can access')
      .parentElement?.className;
    stacked.unmount();

    render(
      <Item
        label="Private"
        description={<span>Only members can access</span>}
        layout="inline"
      />,
    );
    expect(
      screen.getByText('Only members can access').parentElement?.className,
    ).not.toBe(stackedDescription);
  });

  it('ignores inline layout when there is no description', () => {
    render(<Item label="Private" layout="inline" />);
    expect(screen.getByText('Private')).toBeInTheDocument();
  });
});
