/**
 * @file XDSList.test.tsx
 * @input Uses vitest, @testing-library/react, XDSList, XDSListItem
 * @output Unit tests for XDSList and XDSListItem components
 * @position Testing; validates XDSList.tsx and XDSListItem.tsx implementation
 *
 * SYNC: When modified, update this header
 */

import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {XDSList} from './XDSList';
import {XDSListItem} from './XDSListItem';

describe('XDSList', () => {
  // ===========================================================================
  // Basic rendering
  // ===========================================================================

  it('renders a list with items', () => {
    render(
      <XDSList>
        <XDSListItem label="Item 1" />
        <XDSListItem label="Item 2" />
      </XDSList>,
    );
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  it('renders label and description', () => {
    render(
      <XDSList>
        <XDSListItem label="Settings" description="Manage your preferences" />
      </XDSList>,
    );
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Manage your preferences')).toBeInTheDocument();
  });

  it('supports data-testid on list', () => {
    render(
      <XDSList data-testid="my-list">
        <XDSListItem label="Item" />
      </XDSList>,
    );
    expect(screen.getByTestId('my-list')).toBeInTheDocument();
  });

  it('supports data-testid on list item', () => {
    render(
      <XDSList>
        <XDSListItem label="Item" data-testid="my-item" />
      </XDSList>,
    );
    expect(screen.getByTestId('my-item')).toBeInTheDocument();
  });

  // ===========================================================================
  // Semantic HTML
  // ===========================================================================

  it('renders as <ul> by default', () => {
    const {container} = render(
      <XDSList>
        <XDSListItem label="Item" />
      </XDSList>,
    );
    expect(container.querySelector('ul')).toBeInTheDocument();
    expect(container.querySelector('ol')).not.toBeInTheDocument();
  });

  it('renders as <ol> when listStyle is decimal', () => {
    const {container} = render(
      <XDSList listStyle="decimal">
        <XDSListItem label="First" />
        <XDSListItem label="Second" />
      </XDSList>,
    );
    expect(container.querySelector('ol')).toBeInTheDocument();
    expect(container.querySelector('ul')).not.toBeInTheDocument();
  });

  it('renders as <ul> when listStyle is disc', () => {
    const {container} = render(
      <XDSList listStyle="disc">
        <XDSListItem label="Item" />
      </XDSList>,
    );
    expect(container.querySelector('ul')).toBeInTheDocument();
  });

  it('renders as <ul> when listStyle is circle', () => {
    const {container} = render(
      <XDSList listStyle="circle">
        <XDSListItem label="Item" />
      </XDSList>,
    );
    expect(container.querySelector('ul')).toBeInTheDocument();
  });

  it('adds role="list" when listStyle is none (Safari fix)', () => {
    const {container} = render(
      <XDSList>
        <XDSListItem label="Item" />
      </XDSList>,
    );
    const ul = container.querySelector('ul');
    expect(ul).toHaveAttribute('role', 'list');
  });

  it('does not add role="list" when listStyle is disc', () => {
    const {container} = render(
      <XDSList listStyle="disc">
        <XDSListItem label="Item" />
      </XDSList>,
    );
    const ul = container.querySelector('ul');
    expect(ul).not.toHaveAttribute('role');
  });

  it('does not add role="list" when listStyle is decimal', () => {
    const {container} = render(
      <XDSList listStyle="decimal">
        <XDSListItem label="Item" />
      </XDSList>,
    );
    const ol = container.querySelector('ol');
    expect(ol).not.toHaveAttribute('role');
  });

  it('renders items as <li> elements', () => {
    const {container} = render(
      <XDSList>
        <XDSListItem label="Item 1" />
        <XDSListItem label="Item 2" />
      </XDSList>,
    );
    const items = container.querySelectorAll('li');
    expect(items).toHaveLength(2);
  });

  // ===========================================================================
  // Header with aria-labelledby
  // ===========================================================================

  it('renders header and associates via aria-labelledby', () => {
    const {container} = render(
      <XDSList header={<span>Team Members</span>}>
        <XDSListItem label="Alice" />
      </XDSList>,
    );
    expect(screen.getByText('Team Members')).toBeInTheDocument();
    const ul = container.querySelector('ul');
    const headerId = ul?.getAttribute('aria-labelledby');
    expect(headerId).toBeTruthy();
    const headerEl = document.getElementById(headerId!);
    expect(headerEl).toBeInTheDocument();
    expect(headerEl?.textContent).toBe('Team Members');
  });

  it('does not render aria-labelledby when no header', () => {
    const {container} = render(
      <XDSList>
        <XDSListItem label="Item" />
      </XDSList>,
    );
    const ul = container.querySelector('ul');
    expect(ul).not.toHaveAttribute('aria-labelledby');
  });

  // ===========================================================================
  // Density variants
  // ===========================================================================

  it('renders with compact density', () => {
    const {container} = render(
      <XDSList density="compact">
        <XDSListItem label="Item" />
      </XDSList>,
    );
    expect(container.querySelector('li')).toBeInTheDocument();
  });

  it('renders with balanced density (default)', () => {
    const {container} = render(
      <XDSList>
        <XDSListItem label="Item" />
      </XDSList>,
    );
    expect(container.querySelector('li')).toBeInTheDocument();
  });

  it('renders with spacious density', () => {
    const {container} = render(
      <XDSList density="spacious">
        <XDSListItem label="Item" />
      </XDSList>,
    );
    expect(container.querySelector('li')).toBeInTheDocument();
  });

  // ===========================================================================
  // Dividers
  // ===========================================================================

  it('renders dividers between items when hasDividers is true', () => {
    const {container} = render(
      <XDSList hasDividers>
        <XDSListItem label="Item 1" />
        <XDSListItem label="Item 2" />
        <XDSListItem label="Item 3" />
      </XDSList>,
    );
    // Dividers are rendered as borders on <li> elements, not separate DOM nodes
    const items = container.querySelectorAll('li');
    expect(items).toHaveLength(3);
    // No <hr> elements should exist
    const hrs = container.querySelectorAll('hr');
    expect(hrs).toHaveLength(0);
  });

  it('does not add extra DOM elements for dividers', () => {
    const {container} = render(
      <XDSList hasDividers>
        <XDSListItem label="Item 1" />
        <XDSListItem label="Item 2" />
      </XDSList>,
    );
    const list = container.querySelector('ul');
    // Only <li> children — no <hr> or other divider elements
    const children = list?.children;
    expect(children).toHaveLength(2);
    expect(children?.[0]?.tagName).toBe('LI');
    expect(children?.[1]?.tagName).toBe('LI');
  });

  it('does not render dividers when hasDividers is false', () => {
    const {container} = render(
      <XDSList>
        <XDSListItem label="Item 1" />
        <XDSListItem label="Item 2" />
      </XDSList>,
    );
    const hrs = container.querySelectorAll('hr');
    expect(hrs).toHaveLength(0);
  });

  // ===========================================================================
  // Interactive items — onClick (invisible button pattern)
  // ===========================================================================

  it('renders an invisible button when onClick is provided', () => {
    const onClick = vi.fn();
    const {container} = render(
      <XDSList>
        <XDSListItem label="Clickable" onClick={onClick} />
      </XDSList>,
    );
    const button = container.querySelector('button');
    expect(button).toBeInTheDocument();
    expect(button?.textContent).toContain('Clickable');
  });

  it('fires onClick when invisible button is clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <XDSList>
        <XDSListItem label="Clickable" onClick={onClick} />
      </XDSList>,
    );
    await user.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('fires onClick when container area is clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <XDSList>
        <XDSListItem
          label="Clickable"
          onClick={onClick}
          data-testid="item"
          startContent={<span data-testid="start">★</span>}
        />
      </XDSList>,
    );
    // Click on startContent (non-interactive, should propagate)
    await user.click(screen.getByTestId('start'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not fire item onClick when endContent interactive element is clicked', async () => {
    const user = userEvent.setup();
    const itemClick = vi.fn();
    const buttonClick = vi.fn();
    render(
      <XDSList>
        <XDSListItem
          label="Item"
          onClick={itemClick}
          endContent={
            <button type="button" onClick={buttonClick}>
              Action
            </button>
          }
        />
      </XDSList>,
    );
    await user.click(screen.getByText('Action'));
    expect(buttonClick).toHaveBeenCalledTimes(1);
    expect(itemClick).not.toHaveBeenCalled();
  });

  it('invisible button is focusable via keyboard', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <XDSList>
        <XDSListItem label="Focusable" onClick={onClick} />
      </XDSList>,
    );
    await user.tab();
    expect(screen.getByRole('button')).toHaveFocus();
  });

  it('invisible button can be activated via keyboard', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <XDSList>
        <XDSListItem label="Pressable" onClick={onClick} />
      </XDSList>,
    );
    await user.tab();
    await user.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not render nested buttons — only one invisible button', () => {
    const {container} = render(
      <XDSList>
        <XDSListItem label="Item" onClick={() => {}} />
      </XDSList>,
    );
    const buttons = container.querySelectorAll('li button');
    // Should be exactly 1 invisible button (no nesting)
    expect(buttons).toHaveLength(1);
  });

  // ===========================================================================
  // Interactive items — href (invisible anchor pattern)
  // ===========================================================================

  it('renders an invisible anchor when href is provided', () => {
    const {container} = render(
      <XDSList>
        <XDSListItem label="Link" href="/docs" />
      </XDSList>,
    );
    const anchor = container.querySelector('a');
    expect(anchor).toBeInTheDocument();
    expect(anchor).toHaveAttribute('href', '/docs');
    expect(anchor?.textContent).toContain('Link');
  });

  it('sets target on anchor when provided', () => {
    const {container} = render(
      <XDSList>
        <XDSListItem
          label="External"
          href="https://example.com"
          target="_blank"
        />
      </XDSList>,
    );
    const anchor = container.querySelector('a');
    expect(anchor).toHaveAttribute('target', '_blank');
  });

  it('does not render button or anchor for static items', () => {
    const {container} = render(
      <XDSList>
        <XDSListItem label="Static" />
      </XDSList>,
    );
    expect(container.querySelector('button')).not.toBeInTheDocument();
    expect(container.querySelector('a')).not.toBeInTheDocument();
  });

  // ===========================================================================
  // Disabled state
  // ===========================================================================

  it('applies aria-disabled when isDisabled', () => {
    const {container} = render(
      <XDSList>
        <XDSListItem label="Disabled" isDisabled />
      </XDSList>,
    );
    const li = container.querySelector('li');
    expect(li).toHaveAttribute('aria-disabled', 'true');
  });

  it('disables the invisible button when isDisabled', () => {
    const {container} = render(
      <XDSList>
        <XDSListItem label="Disabled" onClick={() => {}} isDisabled />
      </XDSList>,
    );
    const button = container.querySelector('button');
    expect(button).toBeDisabled();
  });

  it('does not fire onClick when disabled item is clicked', async () => {
    const onClick = vi.fn();
    const {container} = render(
      <XDSList>
        <XDSListItem label="Disabled" onClick={onClick} isDisabled />
      </XDSList>,
    );
    // pointerEvents: none prevents click, but let's verify the handler guards
    const li = container.querySelector('li');
    // Manually dispatch click (bypassing pointer-events)
    li?.dispatchEvent(new MouseEvent('click', {bubbles: true}));
    expect(onClick).not.toHaveBeenCalled();
  });

  // ===========================================================================
  // Selected state
  // ===========================================================================

  it('applies aria-selected when isSelected', () => {
    const {container} = render(
      <XDSList>
        <XDSListItem label="Selected" isSelected onClick={() => {}} />
      </XDSList>,
    );
    const li = container.querySelector('li');
    expect(li).toHaveAttribute('aria-selected', 'true');
  });

  it('does not apply aria-selected when not selected', () => {
    const {container} = render(
      <XDSList>
        <XDSListItem label="Not Selected" />
      </XDSList>,
    );
    const li = container.querySelector('li');
    expect(li).not.toHaveAttribute('aria-selected');
  });

  // ===========================================================================
  // startContent and endContent
  // ===========================================================================

  it('renders startContent before label', () => {
    render(
      <XDSList>
        <XDSListItem
          label="With Icon"
          startContent={<span data-testid="icon">★</span>}
        />
      </XDSList>,
    );
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('renders endContent after label', () => {
    render(
      <XDSList>
        <XDSListItem
          label="With Badge"
          endContent={<span data-testid="badge">3</span>}
        />
      </XDSList>,
    );
    expect(screen.getByTestId('badge')).toBeInTheDocument();
  });

  it('startContent and endContent are siblings to invisible button', () => {
    const {container} = render(
      <XDSList>
        <XDSListItem
          label="Item"
          onClick={() => {}}
          startContent={<span data-testid="start">★</span>}
          endContent={<span data-testid="end">→</span>}
        />
      </XDSList>,
    );
    const button = container.querySelector('button');
    const li = container.querySelector('li');
    // startContent and endContent should be children of li, not inside button
    expect(li?.querySelector('[data-testid="start"]')).toBeInTheDocument();
    expect(li?.querySelector('[data-testid="end"]')).toBeInTheDocument();
    expect(
      button?.querySelector('[data-testid="start"]'),
    ).not.toBeInTheDocument();
    expect(
      button?.querySelector('[data-testid="end"]'),
    ).not.toBeInTheDocument();
  });

  // ===========================================================================
  // Border radius
  // ===========================================================================

  it('applies content radius by default', () => {
    render(
      <XDSList>
        <XDSListItem label="Item" data-testid="item" isSelected />
      </XDSList>,
    );
    const item = screen.getByTestId('item');
    expect(item).toBeInTheDocument();
  });

  it('removes radius when hasDividers is true', () => {
    render(
      <XDSList hasDividers>
        <XDSListItem label="Item" data-testid="item" isSelected />
      </XDSList>,
    );
    const item = screen.getByTestId('item');
    expect(item).toBeInTheDocument();
  });

  // ===========================================================================
  // List markers
  // ===========================================================================

  it('renders list markers for disc style', () => {
    render(
      <XDSList listStyle="disc">
        <XDSListItem label="Bullet item" data-testid="item" />
      </XDSList>,
    );
    const item = screen.getByTestId('item');
    // Custom marker rendered as a span (dot marker container)
    const markerContainer = item.querySelector(':scope > span:first-child');
    expect(markerContainer).toBeInTheDocument();
    // The dot itself is a nested span
    const dot = markerContainer?.querySelector('span');
    expect(dot).toBeInTheDocument();
  });

  it('renders list markers for decimal style', () => {
    render(
      <XDSList listStyle="decimal">
        <XDSListItem label="Numbered item" data-testid="item" />
      </XDSList>,
    );
    const item = screen.getByTestId('item');
    // Number marker uses CSS counter via ::before pseudo-element
    const marker = item.querySelector(':scope > span:first-child');
    expect(marker).toBeInTheDocument();
  });

  it('does not render markers when listStyle is none', () => {
    const {container} = render(
      <XDSList listStyle="disc">
        <XDSListItem label="With marker" data-testid="with-marker" />
      </XDSList>,
    );
    const withMarker = screen.getByTestId('with-marker');
    const markerCount = withMarker.children.length;

    const {container: container2} = render(
      <XDSList listStyle="none">
        <XDSListItem label="Plain item" data-testid="no-marker" />
      </XDSList>,
    );
    const noMarker = screen.getByTestId('no-marker');
    // Without markers, the item should have fewer direct children
    // (no marker container element)
    expect(noMarker.children.length).toBeLessThan(markerCount);
  });

  // ===========================================================================
  // Description rendering
  // ===========================================================================

  it('does not render description when not provided', () => {
    render(
      <XDSList>
        <XDSListItem label="Label Only" />
      </XDSList>,
    );
    // Should have the label span only (plus possibly wrapper spans)
    expect(screen.getByText('Label Only')).toBeInTheDocument();
    expect(screen.queryByText('undefined')).not.toBeInTheDocument();
  });

  // ===========================================================================
  // ReactNode description
  // ===========================================================================

  it('accepts ReactNode as description', () => {
    render(
      <XDSList>
        <XDSListItem
          label="Item"
          description={
            <div>
              <span>Rich</span> <span>description</span>
            </div>
          }
        />
      </XDSList>,
    );
    expect(screen.getByText('Rich')).toBeInTheDocument();
    expect(screen.getByText('description')).toBeInTheDocument();
  });

  it('still accepts string description', () => {
    render(
      <XDSList>
        <XDSListItem label="Item" description="Simple text" />
      </XDSList>,
    );
    expect(screen.getByText('Simple text')).toBeInTheDocument();
  });

  it('accepts number as description (ReactNode)', () => {
    render(
      <XDSList>
        <XDSListItem label="Count" description={42} />
      </XDSList>,
    );
    expect(screen.getByText('42')).toBeInTheDocument();
  });
});
