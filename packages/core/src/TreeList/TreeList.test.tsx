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
import {defineTheme} from '../theme/defineTheme';
import {generateThemeCSS} from '../theme/generateThemeRules';

function generateThemeTestCSS(theme: Parameters<typeof generateThemeCSS>[0]) {
  const {prose, component} = generateThemeCSS(theme);
  return [prose, component].filter(Boolean).join('\n\n');
}
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
  // Variant (guide lines)
  // ===========================================================================

  describe('variant', () => {
    it('renders guide lines by default', () => {
      const {container} = render(<TreeList items={nestedItemsExpanded} />);
      expect(container.querySelector('.astryx-tree-list-guide')).not.toBeNull();
    });

    it("variant='lineGuides' renders guide lines (explicit == default)", () => {
      const {container} = render(
        <TreeList items={nestedItemsExpanded} variant="lineGuides" />,
      );
      expect(container.querySelector('.astryx-tree-list-guide')).not.toBeNull();
    });

    it("variant='noGuides' renders NO guide lines", () => {
      const {container} = render(
        <TreeList items={nestedItemsExpanded} variant="noGuides" />,
      );
      expect(container.querySelector('.astryx-tree-list-guide')).toBeNull();
    });

    it("variant='noGuides' preserves the tree structure and items", () => {
      render(<TreeList items={nestedItemsExpanded} variant="noGuides" />);
      // Rows, roles, and nesting are all intact — only the connectors are gone.
      expect(screen.getByRole('tree')).toBeInTheDocument();
      expect(screen.getAllByRole('treeitem')).toHaveLength(4);
      expect(screen.getByText('Parent')).toBeInTheDocument();
      expect(screen.getByText('Child 1')).toBeInTheDocument();
      expect(screen.getByText('Child 2')).toBeInTheDocument();
      expect(screen.getByText('Sibling')).toBeInTheDocument();
    });

    it("variant='noGuides' preserves per-level indentation on the rows", () => {
      // Indentation lives on the row's margin-inline-start (not the guide
      // element), so it must survive when the connectors are suppressed. The
      // per-row distance is published as the `--_tree-indent` custom property
      // (not an inline longhand — see #4308), so the theme layer can override
      // the `margin-inline-start` declaration. A deeper row is indented more
      // than a shallower one.
      const {container} = render(
        <TreeList items={deepItems} variant="noGuides" />,
      );
      const indentOf = (text: string): string => {
        const li = screen.getByText(text).closest('li')!;
        const styled = li.querySelector('[style*="--_tree-indent"]');
        return styled?.getAttribute('style') ?? '';
      };
      // Guides are gone…
      expect(container.querySelector('.astryx-tree-list-guide')).toBeNull();
      // …but each level still publishes an indent distance, and the level
      // multiplier grows with depth (0, 1, 2).
      expect(indentOf('Root')).toContain('--_tree-indent');
      expect(indentOf('Mid')).toContain('--_tree-indent');
      expect(indentOf('Leaf')).toContain('--_tree-indent');
      const level = (text: string): number => {
        const m = /calc\((\d+)/.exec(indentOf(text));
        return m ? Number(m[1]) : NaN;
      };
      expect(level('Mid')).toBeGreaterThan(level('Root'));
      expect(level('Leaf')).toBeGreaterThan(level('Mid'));
    });
  });

  // ===========================================================================
  // Guide theme target
  // ===========================================================================

  describe('guide theme target', () => {
    it('renders the astryx-tree-list-guide target on the connector lines', () => {
      const {container} = render(<TreeList items={nestedItemsExpanded} />);
      const guide = container.querySelector('.astryx-tree-list-guide');
      // A dedicated, stable target so a theme can recolor or hide the guides
      // without hiding the built-in connectors and reimplementing them.
      expect(guide).not.toBeNull();
    });

    it('exposes tree-list-guide as a themeable defineTheme target', () => {
      // jsdom cannot resolve the @layer cascade, so the generated CSS is what
      // proves a theme override reaches the guide element.
      const theme = defineTheme({
        name: 'tree-list-guide-test',
        components: {
          'tree-list-guide': {
            base: {backgroundColor: 'var(--color-accent)'},
          },
        },
      });
      const css = generateThemeTestCSS(theme);
      expect(css).toContain('.astryx-tree-list-guide {');
      expect(css).toContain('background-color: var(--color-accent)');
    });

    it('lets a theme hide the guides via display: none on the target', () => {
      // Hiding the guides is done through the theme target, not a prop — the
      // theme rule lands in @layer astryx-theme, above StyleX's base layer.
      const theme = defineTheme({
        name: 'tree-list-guide-hidden-test',
        components: {
          'tree-list-guide': {
            base: {display: 'none'},
          },
        },
      });
      const css = generateThemeTestCSS(theme);
      expect(css).toContain('.astryx-tree-list-guide {');
      expect(css).toContain('display: none');
    });
  });

  // ===========================================================================
  // Indent lever (--tree-list-indent)
  // ===========================================================================

  describe('indent lever', () => {
    it('lets a theme retune the indent step via the tree-list target', () => {
      // The per-level step is a public, themeable var (default --spacing-4) set
      // on the tree-list root, so a theme can retune the indent metric (e.g. to
      // --spacing-5) via defineTheme. jsdom cannot resolve the @layer cascade,
      // so the generated CSS is what proves the override reaches the lever.
      const theme = defineTheme({
        name: 'tree-list-indent-test',
        components: {
          'tree-list': {
            base: {'--tree-list-indent': 'var(--spacing-5)'},
          },
        },
      });
      const css = generateThemeTestCSS(theme);
      expect(css).toContain('.astryx-tree-list {');
      expect(css).toContain('--tree-list-indent: var(--spacing-5)');
    });

    it('rows consume the indent step in their published indent distance', () => {
      // Each row's --_tree-indent is calc(level * var(--tree-list-indent)),
      // so retuning the step scales every level uniformly.
      render(<TreeList items={deepItems} variant="noGuides" />);
      const indentOf = (text: string): string => {
        const li = screen.getByText(text).closest('li')!;
        const styled = li.querySelector('[style*="--_tree-indent"]');
        return styled?.getAttribute('style') ?? '';
      };
      expect(indentOf('Mid')).toContain('var(--tree-list-indent)');
      expect(indentOf('Leaf')).toContain('var(--tree-list-indent)');
    });
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
  // Chevron theme target
  // ===========================================================================

  describe('chevron theme target', () => {
    it('renders the astryx-tree-list-chevron target on the toggle button', () => {
      render(<TreeList items={nestedItems} />);
      const toggle = screen
        .getByText('Parent')
        .closest('li')!
        .querySelector('[data-tree-toggle]')!;

      // Dedicated, stable theme target on the expand/collapse control, so a
      // theme can restyle the chevron without a fragile [data-tree-toggle] hook.
      expect(toggle).toHaveClass('astryx-tree-list-chevron');
      // Open/closed state is reflected so a theme can target each state alone.
      expect(toggle).toHaveAttribute('data-state', 'collapsed');
    });

    it('reflects the expanded state on the toggle when open', () => {
      render(<TreeList items={nestedItemsExpanded} />);
      const toggle = screen
        .getByText('Parent')
        .closest('li')!
        .querySelector('[data-tree-toggle]')!;

      expect(toggle).toHaveClass('astryx-tree-list-chevron');
      expect(toggle).toHaveAttribute('data-state', 'expanded');
    });

    it('keeps the functional data-tree-toggle hook alongside the new target', () => {
      // The theme target is additive — the toggle is still a real <button> and
      // still carries the functional activation attribute TreeList relies on.
      render(<TreeList items={nestedItems} />);
      const toggle = screen
        .getByText('Parent')
        .closest('li')!
        .querySelector('[data-tree-toggle]')!;
      expect(toggle.tagName).toBe('BUTTON');
      expect(toggle).toHaveAttribute('data-tree-toggle');
    });

    it('exposes tree-list-chevron as a themeable defineTheme target', () => {
      // The generated CSS is what proves the target is reachable by a theme:
      // jsdom cannot resolve the @layer cascade, so the DOM-class assertions
      // above and this generation assertion together cover the seam.
      const theme = defineTheme({
        name: 'tree-list-chevron-test',
        components: {
          'tree-list-chevron': {
            base: {color: 'var(--color-accent)'},
            'state:expanded': {color: 'var(--color-text-primary)'},
          },
        },
      });
      const css = generateThemeTestCSS(theme);
      expect(css).toContain('.astryx-tree-list-chevron {');
      expect(css).toContain('color: var(--color-accent)');
      expect(css).toContain('.astryx-tree-list-chevron.expanded');
      expect(css).toContain('color: var(--color-text-primary)');
    });
  });

  // ===========================================================================
  // Item label theme target
  // ===========================================================================

  describe('item label theme target', () => {
    it('renders the astryx-tree-list-item-label target on the label span', () => {
      render(<TreeList items={simpleItems} />);
      const label = screen.getByText('Item A');

      // Dedicated, stable theme target on the label text, so a theme can style
      // just the label without a fragile `button:not([data-tree-toggle]) > span`
      // structural selector.
      expect(label).toHaveClass('astryx-tree-list-item-label');
      // A non-selected item's label carries no selected reflection.
      expect(label).not.toHaveAttribute('data-selected');
    });

    it('reflects the selected state on the selected item label', () => {
      render(
        <TreeList items={[{id: 'a', label: 'Item A', isSelected: true}]} />,
      );
      const label = screen.getByText('Item A');
      expect(label).toHaveClass('astryx-tree-list-item-label');
      expect(label).toHaveAttribute('data-selected', 'selected');
    });

    it('keeps the label linked to its row via aria-labelledby', () => {
      // The theme target is additive — the label still owns the id the
      // interactive row references for its accessible name.
      render(
        <TreeList items={[{id: 'a', label: 'Item A', onClick: () => {}}]} />,
      );
      const label = screen.getByText('Item A');
      const action = screen.getByRole('button');
      expect(action).toHaveAttribute('aria-labelledby', label.id);
    });

    it('exposes tree-list-item-label as a themeable defineTheme target', () => {
      // The generated CSS is what proves the target is reachable by a theme:
      // jsdom cannot resolve the @layer cascade, so the DOM-class assertions
      // above and this generation assertion together cover the seam.
      const theme = defineTheme({
        name: 'tree-list-item-label-test',
        components: {
          'tree-list-item-label': {
            base: {color: 'var(--color-text-primary)'},
            selected: {fontWeight: 'var(--font-weight-bold)'},
          },
        },
      });
      const css = generateThemeTestCSS(theme);
      expect(css).toContain('.astryx-tree-list-item-label {');
      expect(css).toContain('color: var(--color-text-primary)');
      expect(css).toContain('.astryx-tree-list-item-label.selected');
      expect(css).toContain('font-weight: var(--font-weight-bold)');
    });
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
