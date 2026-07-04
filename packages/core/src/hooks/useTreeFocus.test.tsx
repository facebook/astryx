// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file useTreeFocus.test.tsx
 * @input Uses vitest, @testing-library/react, useTreeFocus hook
 * @output Unit tests for useTreeFocus APG tree keyboard navigation
 * @position Testing; validates useTreeFocus.ts keyboard model
 *
 * SYNC: When useTreeFocus.ts changes, update tests to match new behavior
 */

import {describe, it, expect, vi} from 'vitest';
import {useState} from 'react';
import {render, screen, fireEvent} from '@testing-library/react';
import {useTreeFocus} from './useTreeFocus';

interface Node {
  id: string;
  label: string;
  level: number;
  disabled?: boolean;
  /** 'expanded' | 'collapsed' | undefined (leaf) */
  expanded?: boolean;
}

const NO_NODES: Node[] = [];

/**
 * Minimal generic tree harness driven by a flat list of visible nodes. Mirrors
 * the DOM contract TreeList exposes: role="treeitem", aria-level, aria-expanded,
 * data-tree-id, data-tree-disabled. Expansion is faked by swapping the visible
 * node list on toggle so ArrowRight/ArrowLeft can be exercised.
 */
function Tree({
  collapsed = NO_NODES,
  expanded = NO_NODES,
  onActivate,
}: {
  collapsed?: Node[];
  expanded?: Node[];
  onActivate?: (id: string | undefined) => boolean | undefined;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const nodes = isOpen && expanded.length > 0 ? expanded : collapsed;
  const {treeRef, handleKeyDown} = useTreeFocus<HTMLUListElement>({
    onToggleExpand: () => setIsOpen(o => !o),
    onActivate: onActivate ? (_item, id) => onActivate(id) : undefined,
  });
  return (
    <ul ref={treeRef} role="tree" onKeyDown={handleKeyDown}>
      {nodes.map(n => (
        <li
          key={n.id}
          role="treeitem"
          aria-level={n.level}
          aria-expanded={n.expanded}
          data-tree-id={n.id}
          data-tree-disabled={n.disabled || undefined}
          tabIndex={-1}
          data-testid={n.id}>
          {n.label}
        </li>
      ))}
    </ul>
  );
}

const FLAT: Node[] = [
  {id: 'a', label: 'Apple', level: 1},
  {id: 'b', label: 'Banana', level: 1},
  {id: 'c', label: 'Cherry', level: 1},
];

describe('useTreeFocus linear navigation', () => {
  it('ArrowDown / ArrowUp move between visible treeitems', () => {
    render(<Tree collapsed={FLAT} />);
    const tree = screen.getByRole('tree');
    screen.getByTestId('a').focus();

    fireEvent.keyDown(tree, {key: 'ArrowDown'});
    expect(screen.getByTestId('b')).toHaveFocus();
    fireEvent.keyDown(tree, {key: 'ArrowDown'});
    expect(screen.getByTestId('c')).toHaveFocus();
    fireEvent.keyDown(tree, {key: 'ArrowUp'});
    expect(screen.getByTestId('b')).toHaveFocus();
  });

  it('ArrowDown / ArrowUp skip disabled treeitems', () => {
    const nodes: Node[] = [
      {id: 'a', label: 'Apple', level: 1},
      {id: 'b', label: 'Banana', level: 1, disabled: true},
      {id: 'c', label: 'Cherry', level: 1},
    ];
    render(<Tree collapsed={nodes} />);
    const tree = screen.getByRole('tree');
    screen.getByTestId('a').focus();

    fireEvent.keyDown(tree, {key: 'ArrowDown'});
    expect(screen.getByTestId('c')).toHaveFocus();
    fireEvent.keyDown(tree, {key: 'ArrowUp'});
    expect(screen.getByTestId('a')).toHaveFocus();
  });

  it('Home / End move to the first and last visible treeitems', () => {
    render(<Tree collapsed={FLAT} />);
    const tree = screen.getByRole('tree');
    screen.getByTestId('b').focus();

    fireEvent.keyDown(tree, {key: 'End'});
    expect(screen.getByTestId('c')).toHaveFocus();
    fireEvent.keyDown(tree, {key: 'Home'});
    expect(screen.getByTestId('a')).toHaveFocus();
  });

  it('ArrowDown does not wrap past the last item', () => {
    render(<Tree collapsed={FLAT} />);
    const tree = screen.getByRole('tree');
    screen.getByTestId('c').focus();
    fireEvent.keyDown(tree, {key: 'ArrowDown'});
    expect(screen.getByTestId('c')).toHaveFocus();
  });
});

describe('useTreeFocus tree semantics (Arrow Left/Right)', () => {
  const COLLAPSED: Node[] = [
    {id: 'p', label: 'Parent', level: 1, expanded: false},
  ];
  const EXPANDED: Node[] = [
    {id: 'p', label: 'Parent', level: 1, expanded: true},
    {id: 'c1', label: 'Child 1', level: 2},
    {id: 'c2', label: 'Child 2', level: 2},
  ];

  it('ArrowRight expands a collapsed parent, then enters the first child', () => {
    render(<Tree collapsed={COLLAPSED} expanded={EXPANDED} />);
    const tree = screen.getByRole('tree');
    screen.getByTestId('p').focus();

    expect(screen.queryByTestId('c1')).not.toBeInTheDocument();
    fireEvent.keyDown(tree, {key: 'ArrowRight'});
    // Expanded now.
    expect(screen.getByTestId('c1')).toBeInTheDocument();
    // Focus stayed on parent.
    expect(screen.getByTestId('p')).toHaveFocus();

    fireEvent.keyDown(tree, {key: 'ArrowRight'});
    expect(screen.getByTestId('c1')).toHaveFocus();
  });

  it('ArrowRight on a leaf is a no-op', () => {
    render(<Tree collapsed={FLAT} />);
    const tree = screen.getByRole('tree');
    screen.getByTestId('a').focus();
    fireEvent.keyDown(tree, {key: 'ArrowRight'});
    expect(screen.getByTestId('a')).toHaveFocus();
  });

  it('ArrowLeft on a child moves to the parent; on an expanded parent collapses', () => {
    render(<Tree collapsed={COLLAPSED} expanded={EXPANDED} />);
    const tree = screen.getByRole('tree');
    // Start expanded.
    screen.getByTestId('p').focus();
    fireEvent.keyDown(tree, {key: 'ArrowRight'}); // expand
    fireEvent.keyDown(tree, {key: 'ArrowRight'}); // into child 1
    expect(screen.getByTestId('c1')).toHaveFocus();

    fireEvent.keyDown(tree, {key: 'ArrowLeft'}); // child leaf → parent
    expect(screen.getByTestId('p')).toHaveFocus();

    fireEvent.keyDown(tree, {key: 'ArrowLeft'}); // expanded parent → collapse
    expect(screen.queryByTestId('c1')).not.toBeInTheDocument();
  });
});

describe('useTreeFocus activation + typeahead', () => {
  it('Enter/Space call onActivate for the focused item', () => {
    const onActivate = vi.fn(() => true);
    render(<Tree collapsed={FLAT} onActivate={onActivate} />);
    const tree = screen.getByRole('tree');
    screen.getByTestId('a').focus();

    fireEvent.keyDown(tree, {key: 'Enter'});
    expect(onActivate).toHaveBeenCalledWith('a');

    fireEvent.keyDown(tree, {key: ' '});
    expect(onActivate).toHaveBeenCalledTimes(2);
  });

  it('Enter toggles expansion when onActivate does not handle it', () => {
    const COLLAPSED: Node[] = [
      {id: 'p', label: 'Parent', level: 1, expanded: false},
    ];
    const EXPANDED: Node[] = [
      {id: 'p', label: 'Parent', level: 1, expanded: true},
      {id: 'c1', label: 'Child 1', level: 2},
    ];
    render(<Tree collapsed={COLLAPSED} expanded={EXPANDED} />);
    const tree = screen.getByRole('tree');
    screen.getByTestId('p').focus();
    expect(screen.queryByTestId('c1')).not.toBeInTheDocument();
    fireEvent.keyDown(tree, {key: 'Enter'});
    expect(screen.getByTestId('c1')).toBeInTheDocument();
  });

  it('typeahead moves focus to the next item matching typed characters', () => {
    render(<Tree collapsed={FLAT} />);
    const tree = screen.getByRole('tree');
    screen.getByTestId('a').focus();
    fireEvent.keyDown(tree, {key: 'c'});
    expect(screen.getByTestId('c')).toHaveFocus();
  });
});
