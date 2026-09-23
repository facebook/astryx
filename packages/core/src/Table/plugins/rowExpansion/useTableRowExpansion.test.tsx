// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect, vi, beforeEach} from 'vitest';
import {render, screen, fireEvent} from '@testing-library/react';
import {useState} from 'react';
import {Table} from '../../Table';
import type {TableColumn} from '../../types';
import {useTableRowExpansion} from './useTableRowExpansion';
import {InternationalizationProvider} from '../../../i18n';

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

interface Row extends Record<string, unknown> {
  id: string;
  name: string;
  bio: string;
}

const rows: Row[] = [
  {id: 'a', name: 'Ada', bio: 'Ada bio'},
  {id: 'b', name: 'Bo', bio: 'Bo bio'},
  {id: 'c', name: 'Cy', bio: 'Cy bio'},
];

const columns: TableColumn<Row>[] = [{key: 'name', header: 'Name'}];

const EMPTY_KEYS = new Set<string>();

const defaultRenderExpanded = (item: Row) => (
  <div data-testid="panel">{`${item.name}: ${item.bio}`}</div>
);

function Harness({
  initialExpanded = EMPTY_KEYS,
  isItemExpandable,
  renderExpanded = defaultRenderExpanded,
  dividers,
  isStriped,
}: {
  initialExpanded?: Set<string>;
  isItemExpandable?: (item: Row) => boolean;
  renderExpanded?: (item: Row) => React.ReactNode;
  dividers?: 'rows' | 'columns' | 'grid' | 'none';
  isStriped?: boolean;
}) {
  const [expandedKeys, setExpandedKeys] = useState(initialExpanded);
  const expansion = useTableRowExpansion<Row>({
    expandedKeys,
    onToggle: key =>
      setExpandedKeys(prev => {
        const next = new Set(prev);
        if (next.has(key)) {
          next.delete(key);
        } else {
          next.add(key);
        }
        return next;
      }),
    getRowKey: item => item.id,
    renderExpanded,
    getIsItemExpandable: isItemExpandable,
  });
  return (
    <Table
      data={rows}
      columns={columns}
      idKey="id"
      dividers={dividers}
      isStriped={isStriped}
      plugins={{expansion}}
    />
  );
}

describe('useTableRowExpansion (detail panel)', () => {
  it('renders an "Expand row" chevron button for every expandable row', () => {
    render(<Harness />);
    expect(screen.getAllByRole('button', {name: /expand row/i})).toHaveLength(
      3,
    );
  });

  it('does not render the detail panel while collapsed', () => {
    render(<Harness />);
    expect(screen.queryByTestId('panel')).not.toBeInTheDocument();
  });

  it('renders the detail panel below the row when expanded', () => {
    render(<Harness initialExpanded={new Set(['a'])} />);
    const panel = screen.getByTestId('panel');
    expect(panel).toBeInTheDocument();
    expect(panel).toHaveTextContent('Ada: Ada bio');
  });

  it('renders renderExpanded content with the row item', () => {
    render(
      <Harness
        initialExpanded={new Set(['b'])}
        renderExpanded={item => <span data-testid="panel">bio={item.bio}</span>}
      />,
    );
    expect(screen.getByTestId('panel')).toHaveTextContent('bio=Bo bio');
  });

  it('toggles the panel open on chevron click', () => {
    render(<Harness />);
    expect(screen.queryByTestId('panel')).not.toBeInTheDocument();
    fireEvent.click(screen.getAllByRole('button', {name: /expand row/i})[0]);
    expect(screen.getByTestId('panel')).toBeInTheDocument();
  });

  it('relabels the chevron "Collapse row" and sets aria-expanded when open', () => {
    render(<Harness initialExpanded={new Set(['a'])} />);
    const collapse = screen.getByRole('button', {name: /collapse row/i});
    expect(collapse).toHaveAttribute('aria-expanded', 'true');
  });

  it('marks the chevron aria-expanded=false when collapsed', () => {
    render(<Harness />);
    expect(
      screen.getAllByRole('button', {name: /expand row/i})[0],
    ).toHaveAttribute('aria-expanded', 'false');
  });

  it('renders one detail panel per expanded row', () => {
    render(<Harness initialExpanded={new Set(['a', 'c'])} />);
    expect(screen.getAllByTestId('panel')).toHaveLength(2);
  });

  it('renders the expanded panel as a full-width cell spanning all columns', () => {
    const multiCol: TableColumn<Row>[] = [
      {key: 'name', header: 'Name'},
      {key: 'bio', header: 'Bio'},
    ];
    function H() {
      const [keys, setKeys] = useState(new Set(['a']));
      const expansion = useTableRowExpansion<Row>({
        expandedKeys: keys,
        onToggle: () => setKeys(keys),
        getRowKey: item => item.id,
        renderExpanded: item => <div data-testid="panel">{item.bio}</div>,
      });
      return (
        <Table
          data={rows}
          columns={multiCol}
          idKey="id"
          plugins={{expansion}}
        />
      );
    }
    render(<H />);
    const panelCell = screen.getByTestId('panel').closest('td');
    expect(panelCell).not.toBeNull();
    // 2 user columns + 1 injected chevron column = colSpan 3
    expect(panelCell).toHaveAttribute('colspan', '3');
  });

  it('hides the chevron for non-expandable rows and never shows their panel', () => {
    render(<Harness isItemExpandable={item => item.id !== 'b'} />);
    // Only a and c are expandable
    expect(screen.getAllByRole('button', {name: /expand row/i})).toHaveLength(
      2,
    );
  });

  it('does not render a panel for a non-expandable row even if its key is in expandedKeys', () => {
    render(
      <Harness
        initialExpanded={new Set(['b'])}
        isItemExpandable={item => item.id !== 'b'}
      />,
    );
    expect(screen.queryByTestId('panel')).not.toBeInTheDocument();
  });

  it('contributes a context-menu action on expandable rows', () => {
    render(<Harness />);
    fireEvent.contextMenu(screen.getByText('Ada'));
    expect(
      screen.getAllByRole('menuitem', {name: /expand row/i, hidden: true})
        .length,
    ).toBeGreaterThan(0);
  });

  it('turns the glyph without turning the button beneath it', () => {
    // The button is the hit target and carries the hover chip. Rotating it
    // swings that rounded rectangle around with the arrow, so the transform
    // has to sit on the glyph instead.
    render(<Harness initialExpanded={new Set(['a'])} />);
    const button = screen.getAllByRole('button', {name: /collapse row/i})[0];
    const glyph = button.querySelector('svg')?.parentElement;
    expect(glyph).toHaveStyle({transform: 'rotate(90deg)'});
    expect(button).not.toHaveStyle({transform: 'rotate(90deg)'});
  });

  describe('row divider placement', () => {
    const panelCell = () =>
      screen.getByTestId('panel').closest('td') as HTMLTableCellElement;
    const cellsOf = (name: string) => [
      ...(screen.getByText(name).closest('tr') as HTMLTableRowElement).cells,
    ];

    it('closes the pair below the panel rather than splitting it', () => {
      // The row and its panel are one unit. A divider between them cuts the
      // row off from the detail it opened, and leaves the panel running flush
      // into the next row — the wrong way round on both counts.
      render(<Harness initialExpanded={new Set(['a'])} />);
      for (const cell of cellsOf('Ada')) {
        expect(cell).toHaveStyle({borderBottomWidth: '0'});
      }
      expect(panelCell()).toHaveStyle({
        borderBottomWidth: 'var(--border-width)',
      });
    });

    it('leaves collapsed rows keeping their own divider', () => {
      render(<Harness initialExpanded={new Set(['a'])} />);
      for (const cell of cellsOf('Bo')) {
        expect(cell).not.toHaveStyle({borderBottomWidth: '0'});
      }
    });

    it('draws no panel divider on a table without row dividers', () => {
      render(<Harness initialExpanded={new Set(['a'])} dividers="none" />);
      expect(panelCell()).not.toHaveStyle({
        borderBottomWidth: 'var(--border-width)',
      });
    });

    it('draws the panel divider under grid dividers too', () => {
      render(<Harness initialExpanded={new Set(['a'])} dividers="grid" />);
      expect(panelCell()).toHaveStyle({
        borderBottomWidth: 'var(--border-width)',
      });
    });
  });

  describe('zebra striping', () => {
    /**
     * jsdom's selector engine does not implement `:nth-child(… of S)` — it
     * matches nothing and reports no error — so the paint itself cannot be
     * asserted here; the browser-side check is the visual regression suite.
     * What this can pin is the two halves of the contract: the panel is a
     * sibling row in the same tbody (which is what makes an exclusion
     * necessary at all), and every stripe rule counts only rows that are not
     * panels.
     */
    const stripeRules = () => {
      const out: string[] = [];
      for (const sheet of Array.from(document.styleSheets)) {
        try {
          for (const rule of Array.from(sheet.cssRules)) {
            if (rule.cssText.includes(':nth-child(even')) {
              out.push(rule.cssText);
            }
          }
        } catch {
          // cross-origin sheet; nothing of ours lives there
        }
      }
      return out;
    };

    it('counts stripes over data rows only, so an open panel cannot flip them', () => {
      render(<Harness isStriped initialExpanded={new Set(['a'])} />);

      // The panel really is a row among the rows — left in the count, it takes
      // the stripe meant for the row below it and inverts everything after.
      const bodyRows = Array.from(
        document.querySelectorAll<HTMLTableRowElement>('tbody > tr'),
      );
      expect(bodyRows).toHaveLength(4);
      expect(bodyRows[1]).toHaveAttribute('data-expansion-panel');

      const rules = stripeRules();
      expect(rules.length).toBeGreaterThan(0);
      for (const rule of rules) {
        expect(rule).toContain('of :not([data-expansion-panel])');
      }
    });

    it('marks the panel row so the stripe rule can skip it', () => {
      // The attribute is what the selector keys off, so it is contract, not
      // decoration — losing it silently restores the parity shift above.
      render(<Harness initialExpanded={new Set(['a'])} isStriped />);
      const panels = Array.from(
        document.querySelectorAll<HTMLTableRowElement>('tbody tr'),
      ).filter(r => r.hasAttribute('data-expansion-panel'));
      expect(panels).toHaveLength(1);
      expect(panels[0]).toHaveTextContent('Ada: Ada bio');
    });
  });

  it('localizes the chevron aria-label through the i18n catalog', () => {
    render(
      <InternationalizationProvider
        locale="fr"
        overrides={{
          fr: {'@astryx.tableRowExpansion.expandRow': 'Développer la ligne'},
        }}>
        <Harness />
      </InternationalizationProvider>,
    );
    expect(
      screen.getAllByRole('button', {name: 'Développer la ligne'}).length,
    ).toBeGreaterThan(0);
  });
});
