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
}: {
  initialExpanded?: Set<string>;
  isItemExpandable?: (item: Row) => boolean;
  renderExpanded?: (item: Row) => React.ReactNode;
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
    <Table data={rows} columns={columns} idKey="id" plugins={{expansion}} />
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
