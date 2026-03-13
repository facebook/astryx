/**
 * @file XDSTreeList.test.tsx
 * @input Uses vitest, @testing-library/react, XDSTreeList
 * @output Unit tests for XDSTreeList component
 * @position Testing; validates XDSTreeList.tsx implementation
 *
 * SYNC: When modified, update this header
 */

import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {XDSTreeList} from './XDSTreeList';
import type {XDSTreeListItemData} from './XDSTreeListTypes';

const simpleItems: XDSTreeListItemData[] = [
  {id: 'a', label: 'Item A'},
  {id: 'b', label: 'Item B'},
];

const nestedItems: XDSTreeListItemData[] = [
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

const nestedItemsExpanded: XDSTreeListItemData[] = [
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

const deepItems: XDSTreeListItemData[] = [
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

describe('XDSTreeList', () => {
  // ===========================================================================
  // Basic rendering
  // ===========================================================================

  it('renders items', () => {
    render(<XDSTreeList items={simpleItems} />);
    expect(screen.getByText('Item A')).toBeInTheDocument();
    expect(screen.getByText('Item B')).toBeInTheDocument();
  });

  it('renders with data-testid', () => {
    render(<XDSTreeList items={simpleItems} data-testid="tree" />);
    expect(screen.getByTestId('tree')).toBeInTheDocument();
  });

  it('renders description text', () => {
    const items: XDSTreeListItemData[] = [
      {id: 'a', label: 'Label', description: 'Description text'},
    ];
    render(<XDSTreeList items={items} />);
    expect(screen.getByText('Description text')).toBeInTheDocument();
  });

  // ===========================================================================
  // Semantic HTML
  // ===========================================================================

  it('renders a tree role on the list', () => {
    render(<XDSTreeList items={simpleItems} />);
    expect(screen.getByRole('tree')).toBeInTheDocument();
  });

  it('renders treeitem role on items', () => {
    render(<XDSTreeList items={simpleItems} />);
    const treeitems = screen.getAllByRole('treeitem');
    expect(treeitems).toHaveLength(2);
  });

  it('renders items as <li> elements', () => {
    const {container} = render(<XDSTreeList items={simpleItems} />);
    const items = container.querySelectorAll('li');
    expect(items).toHaveLength(2);
  });

  // ===========================================================================
  // Header with aria-labelledby
  // ===========================================================================

  it('renders header and associates via aria-labelledby', () => {
    render(<XDSTreeList items={simpleItems} header={<span>File Tree</span>} />);
    expect(screen.getByText('File Tree')).toBeInTheDocument();
    const tree = screen.getByRole('tree');
    const headerId = tree.getAttribute('aria-labelledby');
    expect(headerId).toBeTruthy();
    const headerEl = document.getElementById(headerId!);
    expect(headerEl?.textContent).toBe('File Tree');
  });

  it('does not render aria-labelledby when no header', () => {
    render(<XDSTreeList items={simpleItems} />);
    const tree = screen.getByRole('tree');
    expect(tree).not.toHaveAttribute('aria-labelledby');
  });

  // ===========================================================================
  // Expansion (internal state)
  // ===========================================================================

  it('does not render children by default', () => {
    render(<XDSTreeList items={nestedItems} />);
    expect(screen.getByText('Parent')).toBeInTheDocument();
    expect(screen.queryByText('Child 1')).not.toBeInTheDocument();
  });

  it('renders children when item has isExpanded: true', () => {
    render(<XDSTreeList items={nestedItemsExpanded} />);
    expect(screen.getByText('Child 1')).toBeInTheDocument();
    expect(screen.getByText('Child 2')).toBeInTheDocument();
  });

  it('sets aria-expanded on items with children', () => {
    render(<XDSTreeList items={nestedItemsExpanded} />);
    const parent = screen.getByText('Parent').closest('li');
    expect(parent).toHaveAttribute('aria-expanded', 'true');
  });

  it('sets aria-expanded=false on collapsed items with children', () => {
    render(<XDSTreeList items={nestedItems} />);
    const parent = screen.getByText('Parent').closest('li');
    expect(parent).toHaveAttribute('aria-expanded', 'false');
  });

  it('does not set aria-expanded on leaf items', () => {
    render(<XDSTreeList items={simpleItems} />);
    const item = screen.getByText('Item A').closest('li');
    expect(item).not.toHaveAttribute('aria-expanded');
  });

  it('renders group role for nested children', () => {
    render(<XDSTreeList items={nestedItemsExpanded} />);
    const groups = document.querySelectorAll('[role="group"]');
    expect(groups.length).toBeGreaterThanOrEqual(1);
  });

  it('expands a collapsed item when clicked', async () => {
    const user = userEvent.setup();
    render(<XDSTreeList items={nestedItems} />);
    expect(screen.queryByText('Child 1')).not.toBeInTheDocument();
    await user.click(screen.getByText('Parent'));
    expect(screen.getByText('Child 1')).toBeInTheDocument();
  });

  it('collapses an expanded item when clicked', async () => {
    const user = userEvent.setup();
    render(<XDSTreeList items={nestedItemsExpanded} />);
    expect(screen.getByText('Child 1')).toBeInTheDocument();
    await user.click(screen.getByText('Parent'));
    expect(screen.queryByText('Child 1')).not.toBeInTheDocument();
  });

  // ===========================================================================
  // Deep nesting
  // ===========================================================================

  it('renders deeply nested items when all expanded', () => {
    render(<XDSTreeList items={deepItems} />);
    expect(screen.getByText('Root')).toBeInTheDocument();
    expect(screen.getByText('Mid')).toBeInTheDocument();
    expect(screen.getByText('Leaf')).toBeInTheDocument();
  });

  // ===========================================================================
  // Interactive items
  // ===========================================================================

  it('renders an invisible button when onClick is provided', () => {
    const items: XDSTreeListItemData[] = [
      {id: 'a', label: 'Clickable', onClick: () => {}},
    ];
    const {container} = render(<XDSTreeList items={items} />);
    const button = container.querySelector('button');
    expect(button).toBeInTheDocument();
    expect(button?.textContent).toContain('Clickable');
  });

  it('fires onClick when invisible button is clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const items: XDSTreeListItemData[] = [
      {id: 'a', label: 'Clickable', onClick},
    ];
    render(<XDSTreeList items={items} />);
    await user.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders an invisible anchor when href is provided', () => {
    const items: XDSTreeListItemData[] = [
      {id: 'a', label: 'Link', href: '/docs'},
    ];
    const {container} = render(<XDSTreeList items={items} />);
    const anchor = container.querySelector('a');
    expect(anchor).toBeInTheDocument();
    expect(anchor).toHaveAttribute('href', '/docs');
  });

  it('does not render button or anchor for static items', () => {
    const {container} = render(<XDSTreeList items={simpleItems} />);
    expect(container.querySelector('button')).not.toBeInTheDocument();
    expect(container.querySelector('a')).not.toBeInTheDocument();
  });

  // ===========================================================================
  // Disabled state
  // ===========================================================================

  it('applies aria-disabled when isDisabled', () => {
    const items: XDSTreeListItemData[] = [
      {id: 'a', label: 'Disabled', isDisabled: true},
    ];
    render(<XDSTreeList items={items} />);
    const li = screen.getByText('Disabled').closest('li');
    expect(li).toHaveAttribute('aria-disabled', 'true');
  });

  // ===========================================================================
  // Selected state
  // ===========================================================================

  it('applies aria-selected when isSelected', () => {
    const items: XDSTreeListItemData[] = [
      {id: 'a', label: 'Selected', isSelected: true},
    ];
    render(<XDSTreeList items={items} />);
    const li = screen.getByText('Selected').closest('li');
    expect(li).toHaveAttribute('aria-selected', 'true');
  });

  it('does not apply aria-selected when not selected', () => {
    render(<XDSTreeList items={simpleItems} />);
    const li = screen.getByText('Item A').closest('li');
    expect(li).not.toHaveAttribute('aria-selected');
  });

  // ===========================================================================
  // startContent and endContent
  // ===========================================================================

  it('renders startContent', () => {
    const items: XDSTreeListItemData[] = [
      {
        id: 'a',
        label: 'With Icon',
        startContent: <span data-testid="icon">★</span>,
      },
    ];
    render(<XDSTreeList items={items} />);
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('renders endContent', () => {
    const items: XDSTreeListItemData[] = [
      {
        id: 'a',
        label: 'With Badge',
        endContent: <span data-testid="badge">3</span>,
      },
    ];
    render(<XDSTreeList items={items} />);
    expect(screen.getByTestId('badge')).toBeInTheDocument();
  });

  // ===========================================================================
  // Density
  // ===========================================================================

  it('renders with compact density', () => {
    render(<XDSTreeList items={simpleItems} density="compact" />);
    expect(screen.getByRole('tree')).toBeInTheDocument();
  });

  it('renders with spacious density', () => {
    render(<XDSTreeList items={simpleItems} density="spacious" />);
    expect(screen.getByRole('tree')).toBeInTheDocument();
  });

  // ===========================================================================
  // Branch alignment
  // ===========================================================================

  it('renders with top branch alignment', () => {
    render(<XDSTreeList items={nestedItemsExpanded} branchAlignment="top" />);
    expect(screen.getByText('Child 1')).toBeInTheDocument();
  });

  // ===========================================================================
  // xds class name
  // ===========================================================================

  it('applies xds-tree-list class name', () => {
    render(<XDSTreeList items={simpleItems} data-testid="tree" />);
    const root = screen.getByTestId('tree');
    expect(root.className).toContain('xds-tree-list');
  });
});
