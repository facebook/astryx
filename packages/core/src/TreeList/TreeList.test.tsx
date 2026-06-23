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
import {render, screen} from '@testing-library/react';
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
    const items: TreeListItemData[] = [
      {id: 'a', label: 'Clickable', onClick},
    ];
    render(<TreeList items={items} />);
    await user.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders an invisible anchor when href is provided', () => {
    const items: TreeListItemData[] = [
      {id: 'a', label: 'Link', href: '/docs'},
    ];
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

  it('applies xds-tree-list class name', () => {
    render(<TreeList items={simpleItems} data-testid="tree" />);
    const root = screen.getByTestId('tree');
    expect(root.className).toContain('astryx-tree-list');
  });
});
