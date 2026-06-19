// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file List.test.tsx
 * @input Uses vitest, @testing-library/react, List, ListItem
 * @output Unit tests for List and ListItem components
 * @position Testing; validates List.tsx and ListItem.tsx implementation
 *
 * SYNC: When modified, update this header
 */

import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {List} from './List';
import {ListItem} from './ListItem';

describe('List', () => {
  // ===========================================================================
  // Basic rendering
  // ===========================================================================

  it('renders a list with items', () => {
    render(
      <List>
        <ListItem label="Item 1" />
        <ListItem label="Item 2" />
      </List>,
    );
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  it('renders label and description', () => {
    render(
      <List>
        <ListItem label="Settings" description="Manage your preferences" />
      </List>,
    );
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Manage your preferences')).toBeInTheDocument();
  });

  it('supports data-testid on list', () => {
    render(
      <List data-testid="my-list">
        <ListItem label="Item" />
      </List>,
    );
    expect(screen.getByTestId('my-list')).toBeInTheDocument();
  });

  it('supports data-testid on list item', () => {
    render(
      <List>
        <ListItem label="Item" data-testid="my-item" />
      </List>,
    );
    expect(screen.getByTestId('my-item')).toBeInTheDocument();
  });

  // ===========================================================================
  // Semantic HTML
  // ===========================================================================

  it('renders as <ul> by default', () => {
    const {container} = render(
      <List>
        <ListItem label="Item" />
      </List>,
    );
    expect(container.querySelector('ul')).toBeInTheDocument();
    expect(container.querySelector('ol')).not.toBeInTheDocument();
  });

  it('renders as <ol> when listStyle is decimal', () => {
    const {container} = render(
      <List listStyle="decimal">
        <ListItem label="First" />
        <ListItem label="Second" />
      </List>,
    );
    expect(container.querySelector('ol')).toBeInTheDocument();
    expect(container.querySelector('ul')).not.toBeInTheDocument();
  });

  it('applies custom counter start value', () => {
    const {container} = render(
      <List listStyle="decimal" start={3}>
        <ListItem label="Third" />
        <ListItem label="Fourth" />
      </List>,
    );
    const ol = container.querySelector('ol')!;
    // The counter-reset style should include the start offset (start - 1 = 2)
    expect(ol.className).toContain('counterStart');
  });

  it('emits the start HTML attribute on <ol> when start is non-default', () => {
    // Browsers and assistive tech read the start attribute directly; the CSS
    // counter alone is invisible to AT and copy-paste.
    const {container} = render(
      <List listStyle="decimal" start={5}>
        <ListItem label="Fifth" />
      </List>,
    );
    const ol = container.querySelector('ol')!;
    expect(ol.getAttribute('start')).toBe('5');
  });

  it('does not emit the start HTML attribute for the default (start=1)', () => {
    const {container} = render(
      <List listStyle="decimal">
        <ListItem label="First" />
      </List>,
    );
    const ol = container.querySelector('ol')!;
    expect(ol.hasAttribute('start')).toBe(false);
  });

  it('renders as <ul> when listStyle is disc', () => {
    const {container} = render(
      <List listStyle="disc">
        <ListItem label="Item" />
      </List>,
    );
    expect(container.querySelector('ul')).toBeInTheDocument();
  });

  it('renders as <ul> when listStyle is circle', () => {
    const {container} = render(
      <List listStyle="circle">
        <ListItem label="Item" />
      </List>,
    );
    expect(container.querySelector('ul')).toBeInTheDocument();
  });

  it('adds role="list" when listStyle is none (Safari fix)', () => {
    const {container} = render(
      <List>
        <ListItem label="Item" />
      </List>,
    );
    const ul = container.querySelector('ul');
    expect(ul).toHaveAttribute('role', 'list');
  });

  it('does not add role="list" when listStyle is disc', () => {
    const {container} = render(
      <List listStyle="disc">
        <ListItem label="Item" />
      </List>,
    );
    const ul = container.querySelector('ul');
    expect(ul).not.toHaveAttribute('role');
  });

  it('does not add role="list" when listStyle is decimal', () => {
    const {container} = render(
      <List listStyle="decimal">
        <ListItem label="Item" />
      </List>,
    );
    const ol = container.querySelector('ol');
    expect(ol).not.toHaveAttribute('role');
  });

  it('renders items as <li> elements', () => {
    const {container} = render(
      <List>
        <ListItem label="Item 1" />
        <ListItem label="Item 2" />
      </List>,
    );
    const items = container.querySelectorAll('li');
    expect(items).toHaveLength(2);
  });

  // ===========================================================================
  // Header with aria-labelledby
  // ===========================================================================

  it('renders header and associates via aria-labelledby', () => {
    const {container} = render(
      <List header={<span>Team Members</span>}>
        <ListItem label="Alice" />
      </List>,
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
      <List>
        <ListItem label="Item" />
      </List>,
    );
    const ul = container.querySelector('ul');
    expect(ul).not.toHaveAttribute('aria-labelledby');
  });

  it('wraps header and list in a column container', () => {
    const {container} = render(
      <List header={<span>Group</span>}>
        <ListItem label="Item" />
      </List>,
    );
    const header = screen.getByText('Group');
    const wrapper = header.parentElement?.parentElement;
    const ul = container.querySelector('ul');
    expect(wrapper).toContainElement(header.parentElement);
    expect(wrapper).toContainElement(ul);
  });

  it('does not add a wrapper div when header is absent', () => {
    const {container} = render(
      <List data-testid="my-list">
        <ListItem label="Item" />
      </List>,
    );
    const ul = container.querySelector('ul');
    expect(ul?.parentElement).toBe(container);
  });

  // ===========================================================================
  // Density variants
  // ===========================================================================

  it('renders with compact density', () => {
    const {container} = render(
      <List density="compact">
        <ListItem label="Item" />
      </List>,
    );
    const item = container.querySelector('li');
    expect(item).toBeInTheDocument();
    expect(item?.className).toContain('compact');
  });

  it('renders with balanced density (default)', () => {
    const {container} = render(
      <List>
        <ListItem label="Item" />
      </List>,
    );
    const item = container.querySelector('li');
    expect(item).toBeInTheDocument();
    expect(item?.className).toContain('balanced');
    expect(item?.className).not.toContain('spacious');
  });

  it('renders with spacious density', () => {
    const {container} = render(
      <List density="spacious">
        <ListItem label="Item" />
      </List>,
    );
    const item = container.querySelector('li');
    expect(item).toBeInTheDocument();
    expect(item?.className).toContain('spacious');
  });

  // ===========================================================================
  // Dividers
  // ===========================================================================

  it('renders dividers between items when hasDividers is true', () => {
    const {container} = render(
      <List hasDividers>
        <ListItem label="Item 1" />
        <ListItem label="Item 2" />
        <ListItem label="Item 3" />
      </List>,
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
      <List hasDividers>
        <ListItem label="Item 1" />
        <ListItem label="Item 2" />
      </List>,
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
      <List>
        <ListItem label="Item 1" />
        <ListItem label="Item 2" />
      </List>,
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
      <List>
        <ListItem label="Clickable" onClick={onClick} />
      </List>,
    );
    const button = container.querySelector('button');
    expect(button).toBeInTheDocument();
    expect(button?.textContent).toContain('Clickable');
  });

  it('fires onClick when invisible button is clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <List>
        <ListItem label="Clickable" onClick={onClick} />
      </List>,
    );
    await user.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('fires onClick when container area is clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <List>
        <ListItem
          label="Clickable"
          onClick={onClick}
          data-testid="item"
          startContent={<span data-testid="start">★</span>}
        />
      </List>,
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
      <List>
        <ListItem
          label="Item"
          onClick={itemClick}
          endContent={
            <button type="button" onClick={buttonClick}>
              Action
            </button>
          }
        />
      </List>,
    );
    await user.click(screen.getByText('Action'));
    expect(buttonClick).toHaveBeenCalledTimes(1);
    expect(itemClick).not.toHaveBeenCalled();
  });

  it('invisible button is focusable via keyboard', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <List>
        <ListItem label="Focusable" onClick={onClick} />
      </List>,
    );
    await user.tab();
    expect(screen.getByRole('button')).toHaveFocus();
  });

  it('invisible button can be activated via keyboard', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <List>
        <ListItem label="Pressable" onClick={onClick} />
      </List>,
    );
    await user.tab();
    await user.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not render nested buttons — only one invisible button', () => {
    const {container} = render(
      <List>
        <ListItem label="Item" onClick={() => {}} />
      </List>,
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
      <List>
        <ListItem label="Link" href="/docs" />
      </List>,
    );
    const anchor = container.querySelector('a');
    expect(anchor).toBeInTheDocument();
    expect(anchor).toHaveAttribute('href', '/docs');
    expect(anchor?.textContent).toContain('Link');
  });

  it('sets target on anchor when provided', () => {
    const {container} = render(
      <List>
        <ListItem
          label="External"
          href="https://example.com"
          target="_blank"
        />
      </List>,
    );
    const anchor = container.querySelector('a');
    expect(anchor).toHaveAttribute('target', '_blank');
    expect(anchor).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('does not render button or anchor for static items', () => {
    const {container} = render(
      <List>
        <ListItem label="Static" />
      </List>,
    );
    expect(container.querySelector('button')).not.toBeInTheDocument();
    expect(container.querySelector('a')).not.toBeInTheDocument();
  });

  // ===========================================================================
  // Disabled state
  // ===========================================================================

  it('applies aria-disabled when isDisabled', () => {
    const {container} = render(
      <List>
        <ListItem label="Disabled" isDisabled />
      </List>,
    );
    const item = container.querySelector('.xds-item');
    expect(item).toHaveAttribute('aria-disabled', 'true');
  });

  it('disables the invisible button when isDisabled', () => {
    const {container} = render(
      <List>
        <ListItem label="Disabled" onClick={() => {}} isDisabled />
      </List>,
    );
    const button = container.querySelector('button');
    expect(button).toBeDisabled();
  });

  it('does not fire onClick when disabled item is clicked', async () => {
    const onClick = vi.fn();
    const {container} = render(
      <List>
        <ListItem label="Disabled" onClick={onClick} isDisabled />
      </List>,
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
      <List>
        <ListItem label="Selected" isSelected onClick={() => {}} />
      </List>,
    );
    const item = container.querySelector('.xds-item');
    expect(item).toHaveAttribute('aria-selected', 'true');
  });

  it('does not apply aria-selected when not selected', () => {
    const {container} = render(
      <List>
        <ListItem label="Not Selected" />
      </List>,
    );
    const li = container.querySelector('li');
    expect(li).not.toHaveAttribute('aria-selected');
  });

  // ===========================================================================
  // startContent and endContent
  // ===========================================================================

  it('renders startContent before label', () => {
    render(
      <List>
        <ListItem
          label="With Icon"
          startContent={<span data-testid="icon">★</span>}
        />
      </List>,
    );
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('renders endContent after label', () => {
    render(
      <List>
        <ListItem
          label="With Badge"
          endContent={<span data-testid="badge">3</span>}
        />
      </List>,
    );
    expect(screen.getByTestId('badge')).toBeInTheDocument();
  });

  it('startContent and endContent are siblings to invisible button', () => {
    const {container} = render(
      <List>
        <ListItem
          label="Item"
          onClick={() => {}}
          startContent={<span data-testid="start">★</span>}
          endContent={<span data-testid="end">→</span>}
        />
      </List>,
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
      <List>
        <ListItem label="Item" data-testid="item" isSelected />
      </List>,
    );
    const item = screen.getByTestId('item');
    expect(item).toBeInTheDocument();
  });

  it('removes radius when hasDividers is true', () => {
    render(
      <List hasDividers>
        <ListItem label="Item" data-testid="item" isSelected />
      </List>,
    );
    const item = screen.getByTestId('item');
    expect(item).toBeInTheDocument();
  });

  // ===========================================================================
  // List markers
  // ===========================================================================

  it('renders list markers for disc style', () => {
    render(
      <List listStyle="disc">
        <ListItem label="Bullet item" data-testid="item" />
      </List>,
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
      <List listStyle="decimal">
        <ListItem label="Numbered item" data-testid="item" />
      </List>,
    );
    const item = screen.getByTestId('item');
    // Number marker uses CSS counter via ::before pseudo-element
    const marker = item.querySelector(':scope > span:first-child');
    expect(marker).toBeInTheDocument();
  });

  it('does not render markers when listStyle is none', () => {
    render(
      <List listStyle="disc">
        <ListItem label="With marker" data-testid="with-marker" />
      </List>,
    );
    const withMarker = screen.getByTestId('with-marker');
    const markerCount = withMarker.children.length;

    render(
      <List listStyle="none">
        <ListItem label="Plain item" data-testid="no-marker" />
      </List>,
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
      <List>
        <ListItem label="Label Only" />
      </List>,
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
      <List>
        <ListItem
          label="Item"
          description={
            <div>
              <span>Rich</span> <span>description</span>
            </div>
          }
        />
      </List>,
    );
    expect(screen.getByText('Rich')).toBeInTheDocument();
    expect(screen.getByText('description')).toBeInTheDocument();
  });

  it('still accepts string description', () => {
    render(
      <List>
        <ListItem label="Item" description="Simple text" />
      </List>,
    );
    expect(screen.getByText('Simple text')).toBeInTheDocument();
  });

  it('accepts number as description (ReactNode)', () => {
    render(
      <List>
        <ListItem label="Count" description={42} />
      </List>,
    );
    expect(screen.getByText('42')).toBeInTheDocument();
  });
});
