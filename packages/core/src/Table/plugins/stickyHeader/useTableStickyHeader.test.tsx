// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file useTableStickyHeader.test.tsx
 * @input useTableStickyHeader, Table, React testing utilities
 * @output Functional tests for sticky-header pinning, composition, and cleanup
 * @position Test file; validates the height cap, header pinning, composition
 *
 * Positioning and stacking tiers are inline because they are composition-critical
 * and must outrank classes from plugins that run later. The opaque background and
 * background clip remain StyleX classes, so jsdom covers their presence by class
 * identity while real-browser coverage owns their computed paint.
 */

import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import {Table} from '../../Table';
import {useTableStickyHeader} from './useTableStickyHeader';
import {useTableStickyColumns} from '../stickyColumns';
import {useTableColumnResize} from '../columnResize';
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

  it('keeps sticky positioning and corner tiers in either plugin order, even with resize last', () => {
    function Harness({headerFirst}: {headerFirst: boolean}) {
      const stickyHeader = useTableStickyHeader<Row>({maxHeight: 480});
      const stickyColumns = useTableStickyColumns<Row>({startKeys: ['name']});
      const columnResize = useTableColumnResize<Row>({});
      return (
        <Table
          data={data}
          columns={columns}
          plugins={
            headerFirst
              ? {stickyHeader, stickyColumns, columnResize}
              : {stickyColumns, stickyHeader, columnResize}
          }
        />
      );
    }

    for (const headerFirst of [true, false]) {
      const {container, unmount} = render(
        <Harness headerFirst={headerFirst} />,
      );
      const headers = headerCells();
      const firstBodyCell = screen.getAllByRole('cell')[0];

      // The intersection stays above the ordinary header and pinned body run.
      // Inline styles also outrank columnResize's later `position: relative`
      // class, so the resize handle cannot disable either sticky axis.
      expect(headers[0].style.position).toBe('sticky');
      expect(headers[0].style.insetBlockStart).toBe('0');
      expect(headers[0].style.insetInlineStart).toBe('0px');
      expect(headers[0].style.zIndex).toBe('3');
      expect(headers[1].style.position).toBe('sticky');
      expect(headers[1].style.zIndex).toBe('2');
      expect(firstBodyCell.style.position).toBe('sticky');
      expect(firstBodyCell.style.zIndex).toBe('1');
      expect(container.querySelectorAll('[role="separator"]')).not.toHaveLength(
        0,
      );
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

  it('publishes the block-axis extent in vertical writing modes, where block is horizontal', () => {
    const rect = vi
      .spyOn(Element.prototype, 'getBoundingClientRect')
      .mockReturnValue({
        height: 44,
        width: 120,
        top: 0,
        left: 0,
        right: 120,
        bottom: 44,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      });
    // jsdom does not implement writing-mode; pretend the thead is vertical.
    const original = window.getComputedStyle.bind(window);
    const computed = vi
      .spyOn(window, 'getComputedStyle')
      .mockImplementation((el: Element) => {
        if (el.tagName === 'THEAD') {
          return {writingMode: 'vertical-rl'} as CSSStyleDeclaration;
        }
        return original(el);
      });
    function Harness() {
      const stickyHeader = useTableStickyHeader<Row>({maxHeight: 480});
      return <Table data={data} columns={columns} plugins={{stickyHeader}} />;
    }
    render(<Harness />);

    // AST-025 FR1/FR3: the logical block axis resolves through the computed
    // writing mode before reading physical geometry.
    expect(publishedHeight()).toBe('120px');
    rect.mockRestore();
    computed.mockRestore();
  });

  it('publishes no height when the header is not pinned, so a lone group heading falls back to the top edge', () => {
    const rect = mockLayoutHeight(44);
    render(<Table data={data} columns={columns} />);

    expect(publishedHeight()).toBe('');
    rect.mockRestore();
  });

  it('clears the published height when the sticky-header plugin is removed', () => {
    const rect = mockLayoutHeight(44);
    function Harness({enabled}: {enabled: boolean}) {
      const stickyHeader = useTableStickyHeader<Row>({maxHeight: 480});
      return (
        <Table
          data={data}
          columns={columns}
          plugins={enabled ? {stickyHeader} : undefined}
        />
      );
    }
    const {rerender} = render(<Harness enabled />);
    const wrapper = getScrollWrapper();
    expect(wrapper.style.getPropertyValue(HEIGHT_VAR)).toBe('44px');

    rerender(<Harness enabled={false} />);

    expect(wrapper.style.getPropertyValue(HEIGHT_VAR)).toBe('');
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
