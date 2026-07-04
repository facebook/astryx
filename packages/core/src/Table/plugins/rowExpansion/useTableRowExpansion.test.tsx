// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect, vi, beforeEach} from 'vitest';
import {render, screen, fireEvent} from '@testing-library/react';
import {useState} from 'react';
import {Table} from '../../Table';
import type {TableColumn} from '../../types';
import {
  useTableRowExpansion,
  useTableRowExpansionState,
} from './useTableRowExpansion';

// popover mock for context-menu tests
beforeEach(() => {
  HTMLElement.prototype.showPopover = vi.fn(function (this: HTMLElement) {
    this.setAttribute('popover-open', '');
    const event = new Event('toggle', {bubbles: false});
    Object.defineProperty(event, 'newState', {value: 'open'});
    this.dispatchEvent(event);
  });
  HTMLElement.prototype.hidePopover = vi.fn(function (this: HTMLElement) {
    this.removeAttribute('popover-open');
    const event = new Event('toggle', {bubbles: false});
    Object.defineProperty(event, 'newState', {value: 'closed'});
    this.dispatchEvent(event);
  });
  const originalMatches = HTMLElement.prototype.matches;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (HTMLElement.prototype as any).matches = function (
    selector: string,
  ): boolean {
    if (selector === ':popover-open') {
      return this.hasAttribute('popover-open');
    }
    return originalMatches.call(this, selector);
  };
});

interface TreeItem extends Record<string, unknown> {
  id: string;
  name: string;
  children: TreeItem[];
}

const treeData: TreeItem[] = [
  {
    id: 'a',
    name: 'Folder A',
    children: [
      {id: 'a1', name: 'File A1', children: []},
      {id: 'a2', name: 'File A2', children: []},
    ],
  },
  {
    id: 'b',
    name: 'Folder B',
    children: [{id: 'b1', name: 'File B1', children: []}],
  },
  {id: 'c', name: 'Leaf C', children: []},
];

const columns: TableColumn<TreeItem>[] = [{key: 'name', header: 'Name'}];

const EMPTY_KEYS = new Set<string>();

function Harness({
  initialExpanded = EMPTY_KEYS,
}: {
  initialExpanded?: Set<string>;
}) {
  const [expandedKeys, setExpandedKeys] = useState(initialExpanded);
  const {data, expansionConfig} = useTableRowExpansionState<TreeItem>({
    baseData: treeData,
    getChildren: item => item.children,
    getRowKey: item => item.id,
    expandedKeys,
    setExpandedKeys,
  });
  const expansion = useTableRowExpansion(expansionConfig);
  return (
    <Table data={data} columns={columns} idKey="id" plugins={{expansion}} />
  );
}

describe('useTableRowExpansion', () => {
  it('renders a chevron button for expandable rows', () => {
    render(<Harness />);
    const buttons = screen.getAllByRole('button', {name: /expand row/i});
    // Folder A and Folder B are expandable (top-level with children)
    expect(buttons.length).toBe(2);
  });

  it('shows child rows when expanded', () => {
    render(<Harness initialExpanded={new Set(['a'])} />);
    expect(screen.getByText('File A1')).toBeInTheDocument();
    expect(screen.getByText('File A2')).toBeInTheDocument();
  });

  it('hides child rows when collapsed', () => {
    render(<Harness />);
    expect(screen.queryByText('File A1')).not.toBeInTheDocument();
  });

  it('toggles expansion on chevron click', () => {
    render(<Harness />);
    expect(screen.queryByText('File A1')).not.toBeInTheDocument();
    fireEvent.click(screen.getAllByRole('button', {name: /expand row/i})[0]);
    expect(screen.getByText('File A1')).toBeInTheDocument();
  });

  it('contributes a context-menu action on expandable rows', () => {
    render(<Harness />);
    fireEvent.contextMenu(screen.getByText('Folder A'));
    const items = screen.getAllByRole('menuitem', {
      name: /expand row/i,
      hidden: true,
    });
    expect(items.length).toBeGreaterThan(0);
  });

  it('does not show chevron for leaf nodes', () => {
    render(<Harness />);
    // Leaf C has no children
    expect(screen.getByText('Leaf C')).toBeInTheDocument();
    // only 2 expand buttons (Folder A, Folder B), not 3
    expect(
      screen.getAllByRole('button', {name: /expand row|collapse row/i}).length,
    ).toBe(2);
  });

  it('renders an expand-all toggle in the header', () => {
    render(<Harness />);
    expect(
      screen.getByRole('button', {name: /expand all rows/i}),
    ).toBeInTheDocument();
  });

  it('expand-all toggle expands every expandable row', () => {
    render(<Harness />);
    expect(screen.queryByText('File A1')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', {name: /expand all rows/i}));
    // Both folders' children become visible.
    expect(screen.getByText('File A1')).toBeInTheDocument();
    expect(screen.getByText('File A2')).toBeInTheDocument();
    expect(screen.getByText('File B1')).toBeInTheDocument();
  });

  it('collapse-all toggle collapses every row', () => {
    render(<Harness initialExpanded={new Set(['a', 'b'])} />);
    expect(screen.getByText('File A1')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', {name: /collapse all rows/i}));
    expect(screen.queryByText('File A1')).not.toBeInTheDocument();
    expect(screen.queryByText('File B1')).not.toBeInTheDocument();
  });
});
