// Copyright (c) Meta Platforms, Inc. and affiliates.

import React, {useMemo, useRef, useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {
  Table,
  useTableRowExpansion,
  useTableStickyColumns,
  pixel,
  proportional,
} from '@astryxdesign/core/Table';
import {useAnimatedLayout} from '@astryxdesign/core/hooks';
import type {TableColumn} from '@astryxdesign/core/Table';
import {VStack, HStack} from '@astryxdesign/core/Stack';
import {Text, Heading} from '@astryxdesign/core/Text';
import {Badge} from '@astryxdesign/core/Badge';

// =============================================================================
// Sample Data: orders with expandable detail panels
// =============================================================================

interface Order extends Record<string, unknown> {
  id: string;
  customer: string;
  status: string;
  total: string;
  placed: string;
  items: {name: string; qty: number; price: string}[];
}

const orders: Order[] = [
  {
    id: 'ord-1001',
    customer: 'Ada Lovelace',
    status: 'Shipped',
    total: '$248.00',
    placed: '2026-06-20',
    items: [
      {name: 'Mechanical keyboard', qty: 1, price: '$180.00'},
      {name: 'Wrist rest', qty: 2, price: '$34.00'},
    ],
  },
  {
    id: 'ord-1002',
    customer: 'Alan Turing',
    status: 'Processing',
    total: '$52.00',
    placed: '2026-06-21',
    items: [{name: 'USB-C cable', qty: 4, price: '$13.00'}],
  },
  {
    id: 'ord-1003',
    customer: 'Grace Hopper',
    status: 'Delivered',
    total: '$1,200.00',
    placed: '2026-06-18',
    items: [{name: 'Standing desk', qty: 1, price: '$1,200.00'}],
  },
];

const columns: TableColumn<Order>[] = [
  {key: 'customer', header: 'Customer', width: proportional(2)},
  {key: 'status', header: 'Status', width: pixel(130)},
  {key: 'total', header: 'Total', width: pixel(110)},
  {key: 'placed', header: 'Placed', width: pixel(120)},
];

function OrderItems({order}: {order: Order}) {
  return (
    <VStack gap={2}>
      <Heading level={4}>Line items</Heading>
      {order.items.map(line => (
        <HStack key={line.name} gap={3}>
          <Badge label={`x${line.qty}`} variant="info" />
          <Text type="body">{line.name}</Text>
          <Text type="body" color="secondary">
            {line.price}
          </Text>
        </HStack>
      ))}
    </VStack>
  );
}

function toggleKey(keys: Set<string>, key: string): Set<string> {
  const next = new Set(keys);
  if (next.has(key)) {
    next.delete(key);
  } else {
    next.add(key);
  }
  return next;
}

// =============================================================================
// Stories
// =============================================================================

const meta: Meta = {
  title: 'Core/TableRowExpansion',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

/**
 * Each row expands a full-width detail panel below it, rendered by
 * `renderExpanded(item)`. Click the chevron (or right-click, then
 * "Expand/Collapse row") to toggle the panel. The consumer owns the
 * `expandedKeys` set.
 *
 * For hierarchical data (child rows that reuse the parent columns), use
 * `useTableTreeData` + `useTableTreeState` instead.
 */
export const DetailPanel: Story = {
  render: () => {
    const [expandedKeys, setExpandedKeys] = useState<Set<string>>(
      new Set(['ord-1001']),
    );

    const expansion = useTableRowExpansion<Order>({
      expandedKeys,
      onToggle: key => setExpandedKeys(prev => toggleKey(prev, key)),
      getRowKey: item => item.id,
      renderExpanded: item => <OrderItems order={item} />,
    });

    return (
      <Table
        data={orders}
        columns={columns}
        idKey="id"
        hasHover
        plugins={{expansion}}
      />
    );
  },
};

/**
 * `getIsItemExpandable` restricts which rows can expand. Here only orders with
 * more than one line item are expandable; the rest show no chevron and no
 * context-menu action.
 */
export const NotAllRowsExpandable: Story = {
  render: () => {
    const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());

    const expansion = useTableRowExpansion<Order>({
      expandedKeys,
      onToggle: key => setExpandedKeys(prev => toggleKey(prev, key)),
      getRowKey: item => item.id,
      getIsItemExpandable: item => item.items.length > 1,
      renderExpanded: item => <OrderItems order={item} />,
    });

    return (
      <Table
        data={orders}
        columns={columns}
        idKey="id"
        hasHover
        plugins={{expansion}}
      />
    );
  },
};

const manyOrders: Order[] = Array.from({length: 2000}, (_, index) => ({
  ...orders[index % orders.length],
  id: `ord-${String(index + 1).padStart(4, '0')}`,
}));
const sevenOrders = manyOrders.slice(0, 7);

/**
 * With an `animatedLayout` handle, opening or closing a row's panel glides the
 * rows after it instead of jumping them, the panel plays in on the same
 * motion, and each row's divider moves with its row. The Customer column is
 * pinned and the table scrolls horizontally, so the pinned cells' own
 * dividers move too. Under Reduce Motion, and with `dividers="grid"` (the
 * `grid` control), the rows change at once. The `themed` control sets a blue
 * theme border and an app's red border on the third row's cells.
 */
export const GlidingRows: StoryObj<{themed?: boolean; grid?: boolean}> = {
  args: {themed: false, grid: false},
  render: ({themed, grid}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const animatedLayout = useAnimatedLayout({containerRef});
    const [expandedKeys, setExpandedKeys] = useState<Set<string>>(
      () => new Set(),
    );
    const expansion = useTableRowExpansion<Order>({
      expandedKeys,
      onToggle: key => setExpandedKeys(prev => toggleKey(prev, key)),
      getRowKey: item => item.id,
      renderExpanded: item => <OrderItems order={item} />,
      animatedLayout,
    });
    const sticky = useTableStickyColumns<Order>({startKeys: ['customer']});
    const wideColumns = useMemo(
      () => columns.map(column => ({...column, width: pixel(220)})),
      [],
    );
    const style: React.CSSProperties & Record<string, string | number> = {
      maxWidth: 640,
      ...(themed === true ? {'--color-border': 'rgb(37, 99, 235)'} : {}),
    };
    return (
      <div ref={containerRef} data-testid="gliding-rows" style={style}>
        {themed && (
          <style>{`[data-testid="gliding-rows"] tbody tr:nth-child(3) td { border-bottom-color: rgb(220, 38, 38); }`}</style>
        )}
        <Table
          data={sevenOrders}
          columns={wideColumns}
          dividers={grid === true ? 'grid' : undefined}
          idKey="id"
          hasHover
          plugins={{expansion, sticky}}
        />
        <p>Content after the table glides too.</p>
      </div>
    );
  },
};

/**
 * A long table (2,000 rows, not virtualized) with an `animatedLayout`
 * handle: a glide moves only the rows near the visible part, so opening a
 * panel costs the same as in a short table.
 */
export const GlidingRowsLongTable: StoryObj<{glide?: boolean}> = {
  args: {glide: true},
  render: ({glide}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const animatedLayout = useAnimatedLayout({containerRef});
    const [expandedKeys, setExpandedKeys] = useState<Set<string>>(
      () => new Set(),
    );
    const expansion = useTableRowExpansion<Order>({
      expandedKeys,
      onToggle: key => setExpandedKeys(prev => toggleKey(prev, key)),
      getRowKey: item => item.id,
      renderExpanded: item => <OrderItems order={item} />,
      animatedLayout: glide === false ? undefined : animatedLayout,
    });
    return (
      <div
        ref={containerRef}
        data-testid="gliding-rows-long"
        style={{maxWidth: 720, height: 520, overflow: 'auto'}}>
        <Table
          data={manyOrders}
          columns={columns}
          idKey="id"
          plugins={{expansion}}
        />
      </div>
    );
  },
};
