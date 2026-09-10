// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file useTableStickyHeader.test.tsx
 * @input useTableStickyHeader, Table, React testing utilities
 * @output Functional tests for the sticky-header plugin
 * @position Test file; validates the height cap, header pinning, composition
 *
 * Note: `position: sticky`, the background and the z-index are applied via
 * StyleX (compiled to classNames), which jsdom does not resolve to
 * `element.style`. The height cap is the one value the plugin writes as an
 * inline style, so that is asserted directly; the StyleX-applied rules are
 * asserted by class identity — every header cell carries the same plugin class,
 * and it is absent when the plugin is not installed.
 */

import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import {Table} from '../../Table';
import {useTableStickyHeader} from './useTableStickyHeader';
import {useTableStickyColumns} from '../stickyColumns';
import {pixel} from '../../columnUtils';
import type {TableColumn} from '../../types';

// =============================================================================
// Test Data
// =============================================================================

interface Row extends Record<string, unknown> {
  id: string;
  name: string;
  email: string;
  team: string;
}

const data: Row[] = [
  {id: '1', name: 'Alice', email: 'a@x.com', team: 'DS'},
  {id: '2', name: 'Bob', email: 'b@x.com', team: 'Plat'},
];

const columns: TableColumn<Row>[] = [
  {key: 'name', header: 'Name', width: pixel(180)},
  {key: 'email', header: 'Email', width: pixel(220)},
  {key: 'team', header: 'Team', width: pixel(160)},
];

function getScrollWrapper(): HTMLElement {
  const wrapper = document.querySelector('.astryx-table-scroll-wrapper');
  if (!(wrapper instanceof HTMLElement)) {
    throw new Error('scroll wrapper not found');
  }
  return wrapper;
}

function headerCells(): HTMLElement[] {
  return screen.getAllByRole('columnheader');
}

const HEIGHT_VAR = '--table-sticky-header-height';

function publishedHeight(): string {
  return getScrollWrapper().style.getPropertyValue(HEIGHT_VAR);
}

/**
 * jsdom lays nothing out, so every box measures zero and the published height
 * would be `0px` whatever the plugin did. Forcing a height is what makes the
 * assertion about the plugin rather than about jsdom.
 */
function mockLayoutHeight(height: number) {
  return vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
    height,
    width: 0,
    top: 0,
    left: 0,
    right: 0,
    bottom: height,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  });
}

// =============================================================================
// Tests
// =============================================================================

describe('useTableStickyHeader', () => {
  it('caps the scroll container at a numeric maxHeight, in px', () => {
    function Harness() {
      const stickyHeader = useTableStickyHeader<Row>({maxHeight: 480});
      return <Table data={data} columns={columns} plugins={{stickyHeader}} />;
    }
    render(<Harness />);

    expect(getScrollWrapper().style.maxHeight).toBe('480px');
  });

  it('passes a string maxHeight through untouched', () => {
    function Harness() {
      const stickyHeader = useTableStickyHeader<Row>({maxHeight: '60vh'});
      return <Table data={data} columns={columns} plugins={{stickyHeader}} />;
    }
    render(<Harness />);

    expect(getScrollWrapper().style.maxHeight).toBe('60vh');
  });

  it('leaves the height alone when maxHeight is omitted, for callers whose ancestor already bounds the table', () => {
    function Harness() {
      const stickyHeader = useTableStickyHeader<Row>();
      return <Table data={data} columns={columns} plugins={{stickyHeader}} />;
    }
    render(<Harness />);

    expect(getScrollWrapper().style.maxHeight).toBe('');
  });

  it('applies one pinning class to every header cell', () => {
    function Harness() {
      const stickyHeader = useTableStickyHeader<Row>({maxHeight: 480});
      return <Table data={data} columns={columns} plugins={{stickyHeader}} />;
    }
    render(<Harness />);

    const cells = headerCells();
    expect(cells).toHaveLength(3);

    // Every header cell is pinned, not just the first: a partially pinned
    // header row is the bug this guards against.
    const classSets = cells.map(cell => cell.className);
    expect(new Set(classSets).size).toBe(1);
    expect(classSets[0]).not.toBe('');
  });

  it('adds classes the same table does not have without the plugin', () => {
    function Bare() {
      return <Table data={data} columns={columns} />;
    }
    const {unmount} = render(<Bare />);
    const bare = headerCells()[0].className;
    unmount();

    function Pinned() {
      const stickyHeader = useTableStickyHeader<Row>({maxHeight: 480});
      return <Table data={data} columns={columns} plugins={{stickyHeader}} />;
    }
    render(<Pinned />);
    const pinned = headerCells()[0].className;

    expect(pinned).not.toBe(bare);
    expect(pinned.length).toBeGreaterThan(bare.length);
  });

  it('composes with useTableStickyColumns in either plugin order', () => {
    function Harness({headerFirst}: {headerFirst: boolean}) {
      const stickyHeader = useTableStickyHeader<Row>({maxHeight: 480});
      const stickyColumns = useTableStickyColumns<Row>({startKeys: ['name']});
      return (
        <Table
          data={data}
          columns={columns}
          plugins={
            headerFirst
              ? {stickyHeader, stickyColumns}
              : {stickyColumns, stickyHeader}
          }
        />
      );
    }

    for (const headerFirst of [true, false]) {
      const {unmount} = render(<Harness headerFirst={headerFirst} />);

      // The corner cell keeps the column plugin's inline offset, so both
      // plugins reached it rather than one replacing the other's work.
      expect(headerCells()[0].style.insetInlineStart).toBe('0px');
      expect(getScrollWrapper().style.maxHeight).toBe('480px');

      unmount();
    }
  });

  it('publishes the header height, so anything else pinning in the same scrollport can clear it', () => {
    const rect = mockLayoutHeight(44);
    function Harness() {
      const stickyHeader = useTableStickyHeader<Row>({maxHeight: 480});
      return <Table data={data} columns={columns} plugins={{stickyHeader}} />;
    }
    render(<Harness />);

    expect(publishedHeight()).toBe('44px');
    rect.mockRestore();
  });

  it('publishes no height when the header is not pinned, so a lone group heading falls back to the top edge', () => {
    const rect = mockLayoutHeight(44);
    render(<Table data={data} columns={columns} />);

    expect(publishedHeight()).toBe('');
    rect.mockRestore();
  });

  it('keeps publishing the height when another plugin also holds the wrapper ref', () => {
    const rect = mockLayoutHeight(44);
    function Harness() {
      const stickyHeader = useTableStickyHeader<Row>({maxHeight: 480});
      const stickyColumns = useTableStickyColumns<Row>({startKeys: ['name']});
      return (
        <Table
          data={data}
          columns={columns}
          plugins={{stickyColumns, stickyHeader}}
        />
      );
    }
    render(<Harness />);

    // Both plugins want a ref on the same element. If either overwrote the
    // other's rather than composing, one of these variables would be missing.
    expect(publishedHeight()).toBe('44px');
    expect(
      getScrollWrapper().style.getPropertyValue('--table-sticky-shadow-start'),
    ).not.toBe('');
    rect.mockRestore();
  });

  it('is stable across re-renders with the same config', () => {
    const seen: unknown[] = [];
    function Harness({tick}: {tick: number}) {
      const stickyHeader = useTableStickyHeader<Row>({maxHeight: 480});
      seen.push(stickyHeader);
      return (
        <Table
          data={data}
          columns={columns}
          plugins={{stickyHeader}}
          aria-label={`tick-${tick}`}
        />
      );
    }
    const {rerender} = render(<Harness tick={1} />);
    rerender(<Harness tick={2} />);

    expect(seen.length).toBeGreaterThan(1);
    expect(seen[0]).toBe(seen[seen.length - 1]);
  });
});
