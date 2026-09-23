// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file useTableStickyHeader.test.tsx
 * @input useTableStickyHeader, Table, React testing utilities
 * @output Functional tests for effective-ownership pinning, composition, cleanup
 * @position Test file; validates the block-size cap, conditional pinning, tiers
 *
 * Positioning and stacking tiers are inline because they are composition-critical
 * and must outrank classes from plugins that run later. The opaque background and
 * background clip remain StyleX classes, so jsdom covers their presence by class
 * identity while real-browser coverage owns their computed paint.
 *
 * jsdom lays nothing out, so the shared scroll hook can never measure overflow
 * here and correctly reports the table as fitting. That makes jsdom the right
 * place to prove the *fitting* half of `spec:AST-025` FR21 — a table with
 * nothing to scroll does not pin — while `hasPersistentContainment` exercises
 * the pinned half. Real-browser coverage owns the fitting→overflowing
 * transition itself.
 */

import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import {Table} from '../../Table';
import {useTableStickyHeader} from './useTableStickyHeader';
import {useTableStickyColumns} from '../stickyColumns';
import {useTableColumnResize} from '../columnResize';
import {STICKY_TIER} from '../stickyTiers.stylex';
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

const EXTENT_VAR = '--table-sticky-header-height';

function publishedExtent(): string {
  return getScrollWrapper().style.getPropertyValue(EXTENT_VAR);
}

/** The serialized inline style, so logical properties survive jsdom. */
function inlineStyle(el: HTMLElement): string {
  return el.getAttribute('style') ?? '';
}

/**
 * jsdom lays nothing out, so every box measures zero and the published extent
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
  it('caps the scroll container at a numeric maxBlockSize, in px', () => {
    function Harness() {
      const stickyHeader = useTableStickyHeader<Row>({maxBlockSize: 480});
      return <Table data={data} columns={columns} plugins={{stickyHeader}} />;
    }
    render(<Harness />);

    expect(inlineStyle(getScrollWrapper())).toContain('max-block-size: 480px');
  });

  it('passes a string maxBlockSize through untouched', () => {
    function Harness() {
      const stickyHeader = useTableStickyHeader<Row>({maxBlockSize: '60vh'});
      return <Table data={data} columns={columns} plugins={{stickyHeader}} />;
    }
    render(<Harness />);

    expect(inlineStyle(getScrollWrapper())).toContain('max-block-size: 60vh');
  });

  it('leaves the size alone when maxBlockSize is omitted, for callers whose ancestor already bounds the table', () => {
    function Harness() {
      const stickyHeader = useTableStickyHeader<Row>();
      return <Table data={data} columns={columns} plugins={{stickyHeader}} />;
    }
    render(<Harness />);

    expect(inlineStyle(getScrollWrapper())).not.toContain('max-block-size');
  });

  it('hands the scroll container to the shared scroll behavior', () => {
    function Harness() {
      const stickyHeader = useTableStickyHeader<Row>({maxBlockSize: 480});
      return <Table data={data} columns={columns} plugins={{stickyHeader}} />;
    }
    render(<Harness />);

    // `spec:AST-025` IR1: the wrapper is registered with the shared hook rather
    // than measured by a second detector the plugin owns. These attributes are
    // the hook's published viewport state — their absence means the plugin
    // silently went back to declaring its own overflow.
    expect(getScrollWrapper()).toHaveAttribute('data-scroll-axis', 'both');
  });

  it('does not pin while the table fits, so an outer scrollport keeps Sticky ownership', () => {
    function Harness() {
      const stickyHeader = useTableStickyHeader<Row>({maxBlockSize: 480});
      return <Table data={data} columns={columns} plugins={{stickyHeader}} />;
    }
    render(<Harness />);

    // `spec:AST-025` FR10/FR21 and DEC-3: scroll intent alone does not make the
    // wrapper an effective block owner, and a header pinned to a boundary that
    // cannot move would take Sticky away from whatever owns it outside.
    for (const cell of headerCells()) {
      expect(cell.style.position).toBe('');
    }

    // The opaque surface is not conditional: the header must not change colour
    // at the moment it starts pinning.
    expect(headerCells()[0].className).not.toBe('');
  });

  it('pins every header cell when containment is explicit', () => {
    function Harness() {
      const stickyHeader = useTableStickyHeader<Row>({
        maxBlockSize: 480,
        hasPersistentContainment: true,
      });
      return <Table data={data} columns={columns} plugins={{stickyHeader}} />;
    }
    render(<Harness />);

    const cells = headerCells();
    expect(cells).toHaveLength(3);

    // Every header cell is pinned, not just the first: a partially pinned
    // header row is the bug this guards against.
    for (const cell of cells) {
      expect(cell.style.position).toBe('sticky');
      expect(cell.style.insetBlockStart).toBe('0');
      expect(cell.style.zIndex).toBe(String(STICKY_TIER.HEADER_ROW));
    }
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
      const stickyHeader = useTableStickyHeader<Row>({maxBlockSize: 480});
      return <Table data={data} columns={columns} plugins={{stickyHeader}} />;
    }
    render(<Pinned />);
    const pinned = headerCells()[0].className;

    expect(pinned).not.toBe(bare);
    expect(pinned.length).toBeGreaterThan(bare.length);
  });

  it('keeps sticky positioning and corner tiers in either plugin order, even with resize last', () => {
    function Harness({headerFirst}: {headerFirst: boolean}) {
      const stickyHeader = useTableStickyHeader<Row>({
        maxBlockSize: 480,
        hasPersistentContainment: true,
      });
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
      expect(headers[0].style.zIndex).toBe(String(STICKY_TIER.HEADER_CORNER));
      expect(headers[1].style.position).toBe('sticky');
      expect(headers[1].style.zIndex).toBe(String(STICKY_TIER.HEADER_ROW));
      expect(firstBodyCell.style.position).toBe('sticky');
      expect(firstBodyCell.style.zIndex).toBe(String(STICKY_TIER.BODY_CELL));
      expect(container.querySelectorAll('[role="separator"]')).not.toHaveLength(
        0,
      );
      expect(inlineStyle(getScrollWrapper())).toContain(
        'max-block-size: 480px',
      );

      unmount();
    }
  });

  it('gives the group heading a tier of its own between the pinned column and the header row', () => {
    // The heading rests directly beneath the header row, so a shared tier would
    // leave their order to DOM position for the frame between a header resize
    // and the extent variable catching up. Separate tiers remove that window.
    expect(STICKY_TIER.BODY_CELL).toBeLessThan(STICKY_TIER.GROUP_HEADING);
    expect(STICKY_TIER.GROUP_HEADING).toBeLessThan(STICKY_TIER.HEADER_ROW);
    expect(STICKY_TIER.HEADER_ROW).toBeLessThan(STICKY_TIER.HEADER_CORNER);
  });

  it('publishes the header extent, so anything else pinning in the same scrollport can clear it', () => {
    const rect = mockLayoutHeight(44);
    function Harness() {
      const stickyHeader = useTableStickyHeader<Row>({maxBlockSize: 480});
      return <Table data={data} columns={columns} plugins={{stickyHeader}} />;
    }
    render(<Harness />);

    expect(publishedExtent()).toBe('44px');
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
      const stickyHeader = useTableStickyHeader<Row>({maxBlockSize: 480});
      return <Table data={data} columns={columns} plugins={{stickyHeader}} />;
    }
    render(<Harness />);

    // AST-025 FR1/FR3: the logical block axis resolves through the computed
    // writing mode before reading physical geometry.
    expect(publishedExtent()).toBe('120px');
    rect.mockRestore();
    computed.mockRestore();
  });

  it('publishes no extent when the plugin is absent, so a lone group heading falls back to the top edge', () => {
    const rect = mockLayoutHeight(44);
    render(<Table data={data} columns={columns} />);

    expect(publishedExtent()).toBe('');
    rect.mockRestore();
  });

  it('clears the published extent when the sticky-header plugin is removed', () => {
    const rect = mockLayoutHeight(44);
    function Harness({enabled}: {enabled: boolean}) {
      const stickyHeader = useTableStickyHeader<Row>({maxBlockSize: 480});
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
    expect(wrapper.style.getPropertyValue(EXTENT_VAR)).toBe('44px');

    rerender(<Harness enabled={false} />);

    expect(wrapper.style.getPropertyValue(EXTENT_VAR)).toBe('');
    rect.mockRestore();
  });

  it('keeps publishing the extent when another plugin also holds the wrapper ref', () => {
    const rect = mockLayoutHeight(44);
    function Harness() {
      const stickyHeader = useTableStickyHeader<Row>({maxBlockSize: 480});
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
    expect(publishedExtent()).toBe('44px');
    expect(
      getScrollWrapper().style.getPropertyValue('--table-sticky-shadow-start'),
    ).not.toBe('');
    rect.mockRestore();
  });

  it('is stable across re-renders once the scroll state has settled', () => {
    const seen: unknown[] = [];
    function Harness({tick}: {tick: number}) {
      const stickyHeader = useTableStickyHeader<Row>({maxBlockSize: 480});
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

    // The first render is before the shared hook has seen the viewport, so the
    // plugin it returns is legitimately replaced once measurement lands — that
    // replacement is what makes pinning follow effective ownership at all.
    // What must not churn is the settled state: identical renders afterwards
    // return the identical plugin, so Table's transform pipeline is not
    // rebuilt on every parent render.
    expect(seen.length).toBeGreaterThan(2);
    expect(seen[seen.length - 1]).toBe(seen[seen.length - 2]);
  });
});
