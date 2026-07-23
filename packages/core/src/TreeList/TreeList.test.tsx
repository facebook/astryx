// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file TreeList.test.tsx
 * @input Uses vitest, @testing-library/react, TreeList
 * @output Unit tests for TreeList component
 * @position Testing; validates TreeList.tsx implementation
 *
 * SYNC: When modified, update this header
 */

import {describe, it, expect, vi} from 'vitest';
import {render, screen, fireEvent} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {TreeList} from './TreeList';
import type {TreeListItemData} from './TreeListTypes';

const simpleItems: TreeListItemData[] = [
  {id: 'a', label: 'Item A'},
  {id: 'b', label: 'Item B'},
];

const nestedItems: TreeListItemData[] = [
  {
    id: 'parent',
    label: 'Parent',
    children: [
      {id: 'child-1', label: 'Child 1'},
      {id: 'child-2', label: 'Child 2'},
    ],
  },
  {id: 'sibling', label: 'Sibling'},
];

const nestedItemsExpanded: TreeListItemData[] = [
  {
    id: 'parent',
    label: 'Parent',
    isExpanded: true,
    children: [
      {id: 'child-1', label: 'Child 1'},
      {id: 'child-2', label: 'Child 2'},
    ],
  },
  {id: 'sibling', label: 'Sibling'},
];

const deepItems: TreeListItemData[] = [
  {
    id: 'root',
    label: 'Root',
    isExpanded: true,
    children: [
      {
        id: 'mid',
        label: 'Mid',
        isExpanded: true,
        children: [{id: 'leaf', label: 'Leaf'}],
      },
    ],
  },
];

// APG keyboard fixtures (module-level to satisfy no-unstable-default-props).
const flatItems: TreeListItemData[] = [
  {id: 'a', label: 'Apple'},
  {id: 'b', label: 'Banana'},
  {id: 'c', label: 'Cherry'},
];

const withDisabledItems: TreeListItemData[] = [
  {id: 'a', label: 'Apple'},
  {id: 'b', label: 'Banana', isDisabled: true},
  {id: 'c', label: 'Cherry'},
];

const collapsedParentItems: TreeListItemData[] = [
  {
    id: 'parent',
    label: 'Parent',
    children: [
      {id: 'child-1', label: 'Child 1'},
      {id: 'child-2', label: 'Child 2'},
    ],
  },
  {id: 'sibling', label: 'Sibling'},
];

const expandedParentItems: TreeListItemData[] = [
  {
    id: 'parent',
    label: 'Parent',
    isExpanded: true,
    children: [
      {id: 'child-1', label: 'Child 1'},
      {id: 'child-2', label: 'Child 2'},
    ],
  },
  {id: 'sibling', label: 'Sibling'},
];

describe('TreeList', () => {
  // ===========================================================================
  // Basic rendering
  // ===========================================================================

  it('renders items', () => {
    render(<TreeList items={simpleItems} />);
    expect(screen.getByText('Item A')).toBeInTheDocument();
    expect(screen.getByText('Item B')).toBeInTheDocument();
  });

  it('renders with data-testid', () => {
    render(<TreeList items={simpleItems} data-testid="tree" />);
    expect(screen.getByTestId('tree')).toBeInTheDocument();
  });

  it('renders description text', () => {
    const items: TreeListItemData[] = [
      {id: 'a', label: 'Label', description: 'Description text'},
    ];
    render(<TreeList items={items} />);
    expect(screen.getByText('Description text')).toBeInTheDocument();
  });

  // ===========================================================================
  // Semantic HTML
  // ===========================================================================

  it('renders a tree role on the list', () => {
    render(<TreeList items={simpleItems} />);
    expect(screen.getByRole('tree')).toBeInTheDocument();
  });

  it('renders treeitem role on items', () => {
    render(<TreeList items={simpleItems} />);
    const treeitems = screen.getAllByRole('treeitem');
    expect(treeitems).toHaveLength(2);
  });

  it('renders items as <li> elements', () => {
    const {container} = render(<TreeList items={simpleItems} />);
    const items = container.querySelectorAll('li');
    expect(items).toHaveLength(2);
  });

  // ===========================================================================
  // Header with aria-labelledby
  // ===========================================================================

  it('renders header and associates via aria-labelledby', () => {
    render(<TreeList items={simpleItems} header={<span>File Tree</span>} />);
    expect(screen.getByText('File Tree')).toBeInTheDocument();
    const tree = screen.getByRole('tree');
    const headerId = tree.getAttribute('aria-labelledby');
    expect(headerId).toBeTruthy();
    const headerEl = document.getElementById(headerId!);
    expect(headerEl?.textContent).toBe('File Tree');
  });

  it('does not render aria-labelledby when no header', () => {
    render(<TreeList items={simpleItems} />);
    const tree = screen.getByRole('tree');
    expect(tree).not.toHaveAttribute('aria-labelledby');
  });

  // ===========================================================================
  // Expansion (internal state)
  // ===========================================================================

  it('does not render children by default', () => {
    render(<TreeList items={nestedItems} />);
    expect(screen.getByText('Parent')).toBeInTheDocument();
    expect(screen.queryByText('Child 1')).not.toBeInTheDocument();
  });

  it('renders children when item has isExpanded: true', () => {
    render(<TreeList items={nestedItemsExpanded} />);
    expect(screen.getByText('Child 1')).toBeInTheDocument();
    expect(screen.getByText('Child 2')).toBeInTheDocument();
  });

  it('sets aria-expanded on items with children', () => {
    render(<TreeList items={nestedItemsExpanded} />);
    const parent = screen.getByText('Parent').closest('li');
    expect(parent).toHaveAttribute('aria-expanded', 'true');
  });

  it('sets aria-expanded=false on collapsed items with children', () => {
    render(<TreeList items={nestedItems} />);
    const parent = screen.getByText('Parent').closest('li');
    expect(parent).toHaveAttribute('aria-expanded', 'false');
  });

  it('does not set aria-expanded on leaf items', () => {
    render(<TreeList items={simpleItems} />);
    const item = screen.getByText('Item A').closest('li');
    expect(item).not.toHaveAttribute('aria-expanded');
  });

  it('renders a keyboard-focusable toggle button for parents without onClick/href', () => {
    render(<TreeList items={nestedItems} />);
    const toggle = screen.getByRole('button', {name: 'Toggle children'});
    expect(toggle).toBeInTheDocument();
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('expands a parent from the keyboard via the toggle button', async () => {
    const user = userEvent.setup();
    render(<TreeList items={nestedItems} />);
    // Collapsed: children are not rendered.
    expect(screen.queryByText('Child 1')).not.toBeInTheDocument();
    const toggle = screen.getByRole('button', {name: 'Toggle children'});
    toggle.focus();
    expect(toggle).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(screen.getByText('Child 1')).toBeInTheDocument();
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
  });

  it('renders group role for nested children', () => {
    render(<TreeList items={nestedItemsExpanded} />);
    const groups = document.querySelectorAll('[role="group"]');
    expect(groups.length).toBeGreaterThanOrEqual(1);
  });

  it('expands a collapsed item when clicked', async () => {
    const user = userEvent.setup();
    render(<TreeList items={nestedItems} />);
    expect(screen.queryByText('Child 1')).not.toBeInTheDocument();
    await user.click(screen.getByText('Parent'));
    expect(screen.getByText('Child 1')).toBeInTheDocument();
  });

  it('collapses an expanded item when clicked', async () => {
    const user = userEvent.setup();
    render(<TreeList items={nestedItemsExpanded} />);
    expect(screen.getByText('Child 1')).toBeInTheDocument();
    await user.click(screen.getByText('Parent'));
    expect(screen.queryByText('Child 1')).not.toBeInTheDocument();
  });

  // ===========================================================================
  // Deep nesting
  // ===========================================================================

  it('renders deeply nested items when all expanded', () => {
    render(<TreeList items={deepItems} />);
    expect(screen.getByText('Root')).toBeInTheDocument();
    expect(screen.getByText('Mid')).toBeInTheDocument();
    expect(screen.getByText('Leaf')).toBeInTheDocument();
  });

  // ===========================================================================
  // Focus-visible outline scoping (regression: focusing a parent row must not
  // leak the ring onto descendant rows — see #4130)
  // ===========================================================================

  it('scopes the focus-visible outline to the focused row, not its descendants', () => {
    render(<TreeList items={deepItems} />);
    const root = screen.getByText('Root').closest('li')!;
    const mid = screen.getByText('Mid').closest('li')!;
    const leaf = screen.getByText('Leaf').closest('li')!;

    // A keydown before .focus() establishes keyboard modality so jsdom's
    // :focus-visible heuristic applies deterministically, regardless of
    // pointer events left over from other tests in this file.
    fireEvent.keyDown(document.body, {key: 'Tab'});
    root.focus();
    expect(root).toHaveFocus();

    expect(
      getComputedStyle(root).getPropertyValue('--_tree-focus-outline'),
    ).toContain('solid');
    // Mid and Leaf are DOM descendants of Root's <li> (nested <ul role="group">
    // subtrees) — their own outline var must stay unset, not inherit Root's.
    expect(
      getComputedStyle(mid).getPropertyValue('--_tree-focus-outline'),
    ).toBe('none');
    expect(
      getComputedStyle(leaf).getPropertyValue('--_tree-focus-outline'),
    ).toBe('none');
  });

  // ===========================================================================
  // Interactive items
  // ===========================================================================

  it('renders an invisible button when onClick is provided', () => {
    const items: TreeListItemData[] = [
      {id: 'a', label: 'Clickable', onClick: () => {}},
    ];
    const {container} = render(<TreeList items={items} />);
    const button = container.querySelector('button');
    expect(button).toBeInTheDocument();
    expect(button?.textContent).toContain('Clickable');
  });

  it('fires onClick when invisible button is clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const items: TreeListItemData[] = [{id: 'a', label: 'Clickable', onClick}];
    render(<TreeList items={items} />);
    await user.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders an invisible anchor when href is provided', () => {
    const items: TreeListItemData[] = [{id: 'a', label: 'Link', href: '/docs'}];
    const {container} = render(<TreeList items={items} />);
    const anchor = container.querySelector('a');
    expect(anchor).toBeInTheDocument();
    expect(anchor).toHaveAttribute('href', '/docs');
  });

  it('does not render button or anchor for static items', () => {
    const {container} = render(<TreeList items={simpleItems} />);
    expect(container.querySelector('button')).not.toBeInTheDocument();
    expect(container.querySelector('a')).not.toBeInTheDocument();
  });

  // ===========================================================================
  // Disabled state
  // ===========================================================================

  it('applies aria-disabled when isDisabled', () => {
    const items: TreeListItemData[] = [
      {id: 'a', label: 'Disabled', isDisabled: true},
    ];
    render(<TreeList items={items} />);
    const li = screen.getByText('Disabled').closest('li');
    expect(li).toHaveAttribute('aria-disabled', 'true');
  });

  // ===========================================================================
  // Selected state
  // ===========================================================================

  it('applies aria-selected when isSelected', () => {
    const items: TreeListItemData[] = [
      {id: 'a', label: 'Selected', isSelected: true},
    ];
    render(<TreeList items={items} />);
    const li = screen.getByText('Selected').closest('li');
    expect(li).toHaveAttribute('aria-selected', 'true');
  });

  it('does not apply aria-selected when not selected', () => {
    render(<TreeList items={simpleItems} />);
    const li = screen.getByText('Item A').closest('li');
    expect(li).not.toHaveAttribute('aria-selected');
  });

  // ===========================================================================
  // startContent and endContent
  // ===========================================================================

  it('renders startContent', () => {
    const items: TreeListItemData[] = [
      {
        id: 'a',
        label: 'With Icon',
        startContent: <span data-testid="icon">★</span>,
      },
    ];
    render(<TreeList items={items} />);
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('renders endContent', () => {
    const items: TreeListItemData[] = [
      {
        id: 'a',
        label: 'With Badge',
        endContent: <span data-testid="badge">3</span>,
      },
    ];
    render(<TreeList items={items} />);
    expect(screen.getByTestId('badge')).toBeInTheDocument();
  });

  // ===========================================================================
  // Density
  // ===========================================================================

  it('renders with compact density', () => {
    render(<TreeList items={simpleItems} density="compact" />);
    expect(screen.getByRole('tree')).toBeInTheDocument();
  });

  it('renders with spacious density', () => {
    render(<TreeList items={simpleItems} density="spacious" />);
    expect(screen.getByRole('tree')).toBeInTheDocument();
  });

  // ===========================================================================
  // xds class name
  // ===========================================================================

  it('applies astryx-tree-list class name', () => {
    render(<TreeList items={simpleItems} data-testid="tree" />);
    const root = screen.getByTestId('tree');
    expect(root.className).toContain('astryx-tree-list');
  });

  // ===========================================================================
  // APG structural ARIA (aria-level / aria-posinset / aria-setsize)
  // ===========================================================================

  it('sets aria-level, aria-posinset, and aria-setsize at the top level', () => {
    render(<TreeList items={flatItems} />);
    const apple = screen.getByText('Apple').closest('li');
    expect(apple).toHaveAttribute('aria-level', '1');
    expect(apple).toHaveAttribute('aria-posinset', '1');
    expect(apple).toHaveAttribute('aria-setsize', '3');

    const cherry = screen.getByText('Cherry').closest('li');
    expect(cherry).toHaveAttribute('aria-posinset', '3');
    expect(cherry).toHaveAttribute('aria-setsize', '3');
  });

  it('sets aria-level/posinset/setsize correctly at deeper levels', () => {
    render(<TreeList items={expandedParentItems} />);
    const parent = screen.getByText('Parent').closest('li');
    expect(parent).toHaveAttribute('aria-level', '1');
    expect(parent).toHaveAttribute('aria-setsize', '2');

    const child1 = screen.getByText('Child 1').closest('li');
    expect(child1).toHaveAttribute('aria-level', '2');
    expect(child1).toHaveAttribute('aria-posinset', '1');
    expect(child1).toHaveAttribute('aria-setsize', '2');

    const child2 = screen.getByText('Child 2').closest('li');
    expect(child2).toHaveAttribute('aria-level', '2');
    expect(child2).toHaveAttribute('aria-posinset', '2');
  });

  it('sets aria-level across three depths', () => {
    render(<TreeList items={deepItems} />);
    expect(screen.getByText('Root').closest('li')).toHaveAttribute(
      'aria-level',
      '1',
    );
    expect(screen.getByText('Mid').closest('li')).toHaveAttribute(
      'aria-level',
      '2',
    );
    expect(screen.getByText('Leaf').closest('li')).toHaveAttribute(
      'aria-level',
      '3',
    );
  });

  // ===========================================================================
  // Roving tabindex
  // ===========================================================================

  it('makes exactly one treeitem tabbable by default (the first enabled)', () => {
    render(<TreeList items={flatItems} />);
    const treeitems = screen.getAllByRole('treeitem');
    const tabbable = treeitems.filter(
      el => el.getAttribute('tabindex') === '0',
    );
    expect(tabbable).toHaveLength(1);
    expect(tabbable[0]).toBe(screen.getByText('Apple').closest('li'));
    expect(screen.getByText('Banana').closest('li')).toHaveAttribute(
      'tabindex',
      '-1',
    );
  });

  it('defaults the tab stop to the selected item when one is selected', () => {
    const items: TreeListItemData[] = [
      {id: 'a', label: 'Apple'},
      {id: 'b', label: 'Banana', isSelected: true},
      {id: 'c', label: 'Cherry'},
    ];
    render(<TreeList items={items} />);
    expect(screen.getByText('Banana').closest('li')).toHaveAttribute(
      'tabindex',
      '0',
    );
    expect(screen.getByText('Apple').closest('li')).toHaveAttribute(
      'tabindex',
      '-1',
    );
  });

  it('moves the single tab stop when focus moves via keyboard', async () => {
    const user = userEvent.setup();
    render(<TreeList items={flatItems} />);
    const apple = screen.getByText('Apple').closest('li')!;
    apple.focus();
    await user.keyboard('{ArrowDown}');
    const treeitems = screen.getAllByRole('treeitem');
    const tabbable = treeitems.filter(
      el => el.getAttribute('tabindex') === '0',
    );
    expect(tabbable).toHaveLength(1);
    expect(tabbable[0]).toBe(screen.getByText('Banana').closest('li'));
  });

  // ===========================================================================
  // APG keyboard navigation
  // ===========================================================================

  it('ArrowDown / ArrowUp move focus between visible treeitems', async () => {
    const user = userEvent.setup();
    render(<TreeList items={flatItems} />);
    const apple = screen.getByText('Apple').closest('li')!;
    apple.focus();
    await user.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(
      screen.getByText('Banana').closest('li'),
    );
    await user.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(
      screen.getByText('Cherry').closest('li'),
    );
    await user.keyboard('{ArrowUp}');
    expect(document.activeElement).toBe(
      screen.getByText('Banana').closest('li'),
    );
  });

  it('ArrowDown / ArrowUp skip disabled treeitems', async () => {
    const user = userEvent.setup();
    render(<TreeList items={withDisabledItems} />);
    const apple = screen.getByText('Apple').closest('li')!;
    apple.focus();
    await user.keyboard('{ArrowDown}');
    // Banana is disabled → skipped, lands on Cherry.
    expect(document.activeElement).toBe(
      screen.getByText('Cherry').closest('li'),
    );
    await user.keyboard('{ArrowUp}');
    expect(document.activeElement).toBe(
      screen.getByText('Apple').closest('li'),
    );
  });

  it('ArrowRight expands a collapsed parent, then enters the first child', async () => {
    const user = userEvent.setup();
    render(<TreeList items={collapsedParentItems} />);
    const parent = screen.getByText('Parent').closest('li')!;
    parent.focus();
    expect(screen.queryByText('Child 1')).not.toBeInTheDocument();
    await user.keyboard('{ArrowRight}');
    // First ArrowRight expands.
    expect(screen.getByText('Child 1')).toBeInTheDocument();
    expect(document.activeElement).toBe(parent);
    await user.keyboard('{ArrowRight}');
    // Second ArrowRight moves into first child.
    expect(document.activeElement).toBe(
      screen.getByText('Child 1').closest('li'),
    );
  });

  it('ArrowRight on a leaf is a no-op', async () => {
    const user = userEvent.setup();
    render(<TreeList items={flatItems} />);
    const apple = screen.getByText('Apple').closest('li')!;
    apple.focus();
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(apple);
  });

  it('ArrowLeft collapses an expanded parent, then moves to parent', async () => {
    const user = userEvent.setup();
    render(<TreeList items={expandedParentItems} />);
    const parent = screen.getByText('Parent').closest('li')!;
    // Focus a child first.
    const child1 = screen.getByText('Child 1').closest('li')!;
    child1.focus();
    await user.keyboard('{ArrowLeft}');
    // Child is a leaf → ArrowLeft moves to parent.
    expect(document.activeElement).toBe(parent);
    await user.keyboard('{ArrowLeft}');
    // Parent is expanded → ArrowLeft collapses it.
    expect(screen.queryByText('Child 1')).not.toBeInTheDocument();
  });

  it('Home and End move to the first and last visible treeitems', async () => {
    const user = userEvent.setup();
    render(<TreeList items={flatItems} />);
    const banana = screen.getByText('Banana').closest('li')!;
    banana.focus();
    await user.keyboard('{End}');
    expect(document.activeElement).toBe(
      screen.getByText('Cherry').closest('li'),
    );
    await user.keyboard('{Home}');
    expect(document.activeElement).toBe(
      screen.getByText('Apple').closest('li'),
    );
  });

  it('Enter activates the item onClick', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const items: TreeListItemData[] = [{id: 'a', label: 'Apple', onClick}];
    render(<TreeList items={items} />);
    const apple = screen.getByText('Apple').closest('li')!;
    apple.focus();
    await user.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('Space activates the item onClick', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const items: TreeListItemData[] = [{id: 'a', label: 'Apple', onClick}];
    render(<TreeList items={items} />);
    const apple = screen.getByText('Apple').closest('li')!;
    apple.focus();
    await user.keyboard(' ');
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('Enter toggles expansion for a parent without its own action', async () => {
    const user = userEvent.setup();
    render(<TreeList items={collapsedParentItems} />);
    const parent = screen.getByText('Parent').closest('li')!;
    parent.focus();
    expect(screen.queryByText('Child 1')).not.toBeInTheDocument();
    await user.keyboard('{Enter}');
    expect(screen.getByText('Child 1')).toBeInTheDocument();
  });

  it('typeahead moves focus to the next item matching typed characters', async () => {
    const user = userEvent.setup();
    render(<TreeList items={flatItems} />);
    const apple = screen.getByText('Apple').closest('li')!;
    apple.focus();
    await user.keyboard('c');
    expect(document.activeElement).toBe(
      screen.getByText('Cherry').closest('li'),
    );
  });
});
