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
  density,
  hasRowClickExpansion,
  columnsOverride,
  panelVariant,
  dividers,
}: {
  initialExpanded?: Set<string>;
  isItemExpandable?: (item: Row) => boolean;
  renderExpanded?: (item: Row) => React.ReactNode;
  density?: 'compact' | 'balanced' | 'spacious';
  hasRowClickExpansion?: boolean;
  columnsOverride?: TableColumn<Row>[];
  panelVariant?: 'muted' | 'transparent';
  dividers?: 'rows' | 'columns' | 'grid' | 'none';
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
    hasRowClickExpansion,
    panelVariant,
  });
  return (
    <Table
      data={rows}
      columns={columnsOverride ?? columns}
      idKey="id"
      density={density}
      dividers={dividers}
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

  it('starts the panel at the first column, not at the row edge', () => {
    // Left to itself the panel begins under the chevron, a column to the left
    // of every label it describes. It should start where the first column's
    // content does: the chevron column's width plus a cell's own padding.
    render(<Harness initialExpanded={new Set(['a'])} />);
    expect(screen.getByTestId('panel').closest('td')).toHaveStyle({
      paddingInlineStart: 'calc(40px + var(--spacing-3))',
    });
  });

  it('tracks the table density it is rendered at', () => {
    render(<Harness initialExpanded={new Set(['a'])} density="spacious" />);
    expect(screen.getByTestId('panel').closest('td')).toHaveStyle({
      paddingInlineStart: 'calc(40px + var(--spacing-4))',
    });
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

  describe('panel variant', () => {
    const panelRow = () =>
      screen.getByTestId('panel').closest('tr') as HTMLTableRowElement;

    it('washes the panel by default', () => {
      render(<Harness initialExpanded={new Set(['a'])} />);
      expect(panelRow()).toHaveStyle({
        backgroundColor: 'var(--color-background-muted)',
      });
    });

    it('leaves the panel on the surface behind the table when transparent', () => {
      render(
        <Harness initialExpanded={new Set(['a'])} panelVariant="transparent" />,
      );
      expect(panelRow()).not.toHaveStyle({
        backgroundColor: 'var(--color-background-muted)',
      });
    });
  });

  describe('whole-row-click expansion', () => {
    const rowFor = (name: string) =>
      screen.getByText(name).closest('tr') as HTMLTableRowElement;

    it('leaves the row body inert by default', () => {
      render(<Harness />);
      fireEvent.click(screen.getByText('Ada'));
      expect(screen.queryByTestId('panel')).not.toBeInTheDocument();
    });

    it('expands a collapsed row when its body is clicked', () => {
      // The collapsed row is the one that has to respond: the early return
      // that skips panel rendering must not skip the click handler with it.
      render(<Harness hasRowClickExpansion />);
      fireEvent.click(screen.getByText('Ada'));
      expect(screen.getByTestId('panel')).toHaveTextContent('Ada: Ada bio');
    });

    it('collapses an expanded row when its body is clicked', () => {
      render(<Harness hasRowClickExpansion initialExpanded={new Set(['a'])} />);
      fireEvent.click(screen.getByText('Ada'));
      expect(screen.queryByTestId('panel')).not.toBeInTheDocument();
    });

    it('does not double-toggle when the chevron itself is clicked', () => {
      // The chevron stops propagation, so the row handler must not also fire —
      // two toggles would land back where they started.
      render(<Harness hasRowClickExpansion />);
      fireEvent.click(screen.getAllByRole('button', {name: /expand row/i})[0]);
      expect(screen.getByTestId('panel')).toBeInTheDocument();
    });

    it('yields to interactive cell content', () => {
      // A composed link or action button does not stop propagation the way the
      // chevron does, so the row handler has to check what was hit.
      const onAction = vi.fn();
      render(
        <Harness
          hasRowClickExpansion
          columnsOverride={[
            {
              key: 'name',
              header: 'Name',
              renderCell: item => (
                <button type="button" onClick={onAction}>
                  {`Act on ${item.name}`}
                </button>
              ),
            },
          ]}
        />,
      );
      fireEvent.click(screen.getByText('Act on Ada'));
      expect(onAction).toHaveBeenCalledTimes(1);
      expect(screen.queryByTestId('panel')).not.toBeInTheDocument();
    });

    it('yields to a text selection', () => {
      // Dragging across a cell to copy it ends in a click. Toggling then would
      // shift the row out from under the text the reader just selected.
      render(<Harness hasRowClickExpansion />);
      const selection = {toString: () => 'Ada'} as Selection;
      const spy = vi.spyOn(window, 'getSelection').mockReturnValue(selection);
      fireEvent.click(screen.getByText('Ada'));
      expect(screen.queryByTestId('panel')).not.toBeInTheDocument();
      spy.mockRestore();
    });

    it('leaves non-expandable rows inert', () => {
      render(
        <Harness
          hasRowClickExpansion
          isItemExpandable={item => item.id !== 'a'}
        />,
      );
      fireEvent.click(screen.getByText('Ada'));
      expect(screen.queryByTestId('panel')).not.toBeInTheDocument();
      fireEvent.click(screen.getByText('Bo'));
      expect(screen.getByTestId('panel')).toHaveTextContent('Bo: Bo bio');
    });

    it('marks the row as interactive only when the click is wired up', () => {
      const {unmount} = render(<Harness hasRowClickExpansion />);
      expect(rowFor('Ada')).toHaveStyle({cursor: 'pointer'});
      unmount();
      render(<Harness />);
      expect(rowFor('Ada')).not.toHaveStyle({cursor: 'pointer'});
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
