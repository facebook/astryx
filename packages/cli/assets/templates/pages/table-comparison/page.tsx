// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * A comparison matrix: candidates across the top, criteria down the side, and a
 * label column that stays put while the candidates scroll past it.
 *
 * This is the transpose of every other table in the set. Elsewhere a row is a
 * record and a column is a field; here a *column* is the record — one compute
 * instance — and a row is a single attribute measured across all of them. That
 * flip is what makes the layout work: comparison is a vertical scan, and a
 * vertical scan only works if the thing being compared shares a column.
 *
 * It is also the shape that makes `useTableGroupedRows` correct, where
 * `table-grouped` made it wrong. Every group here — capacity, throughput,
 * pricing, efficiency — is measured against the same eight instances, so one
 * header row is true of every section beneath it. Groups are a way to chunk a
 * long criteria list, not a sign that the records differ.
 *
 * ## Extending this template
 *
 * **The matrix is derived, not authored.** Eight instances times twelve
 * criteria is ninety-six cells, and hand-writing them guarantees a typo nobody
 * finds. Instead `INSTANCES` holds each machine's real specs once, `SPEC_ROWS`
 * declares each criterion as a `get(instance)` accessor, and the table is the
 * product of the two. Memory-per-vCPU and both cost-efficiency rows are pure
 * functions of the columns above them, so they cannot drift. Add an instance
 * and every row gains a cell; add a criterion and every instance gains a value.
 *
 * **Columns are generated, which is the point.** `columns` is built by mapping
 * over `INSTANCES`, so the candidate set is data. A comparison table with
 * hardcoded columns is a comparison table that nobody will extend — the moment
 * the list comes from an API you are rewriting it. Note the cost: because the
 * columns are dynamic, their widths must be `pixel()` for the sticky plugin to
 * compute offsets, so the table scrolls rather than compresses.
 *
 * **The label column is pinned because the row labels are the axis.** Scrolled
 * horizontally, an unpinned matrix becomes a grid of anonymous numbers.
 * `useTableStickyColumns({startKeys: ['spec']})` keeps the criterion visible;
 * `endKeys` does the same for a trailing run if you want a fixed reference
 * column on the right. The plugin needs pixel widths to compute its offsets,
 * which is the real constraint behind the previous point.
 *
 * **Best-in-row is computed, and only where "best" means something.** A
 * criterion declares `better: 'higher' | 'lower'`, and rows that declare
 * neither — a processor name, a yes/no — get no winner at all. This is the part
 * teams get wrong: marking a winner on a row where the values are merely
 * different, not better or worse, quietly tells the reader a preference that
 * the data does not support. Winners render semibold, so a column that is
 * strong overall reads as a vertical run of bold rather than as a colour.
 *
 * **Ties are winners too.** `isBest` compares against the extreme value rather
 * than picking one index, so identical values are all marked. Choosing an
 * arbitrary winner among equals is a bug that survives review because it looks
 * decisive.
 */

import {useMemo, useState} from 'react';

import {
  HStack,
  Layout,
  LayoutContent,
  LayoutHeader,
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Icon} from '@astryxdesign/core/Icon';
import {
  Table,
  pixel,
  useTableGroupedRows,
  useTableStickyColumns,
} from '@astryxdesign/core/Table';
import type {TableColumn} from '@astryxdesign/core/Table';
import {ArrowDownTrayIcon} from '@heroicons/react/24/outline';

// ============= CANDIDATES =============

/** One machine's specs, stated once. Every cell in the table derives from here. */
interface Instance {
  id: string;
  name: string;
  family: string;
  vcpu: number;
  memoryGib: number;
  /** Attached NVMe in GB; 0 means EBS-only. */
  nvmeGb: number;
  networkGbps: number;
  ebsGbps: number;
  ebsIops: number;
  /** Dollars per hour. */
  onDemand: number;
  reserved: number;
  spot: number;
  isShortlisted?: boolean;
}

const INSTANCES: Instance[] = [
  {
    id: 'm6i-large',
    name: 'm6i.large',
    family: 'General purpose',
    vcpu: 2,
    memoryGib: 8,
    nvmeGb: 0,
    networkGbps: 5,
    ebsGbps: 4.75,
    ebsIops: 20_000,
    onDemand: 0.096,
    reserved: 0.06,
    spot: 0.037,
  },
  {
    id: 'm6i-xlarge',
    name: 'm6i.xlarge',
    family: 'General purpose',
    vcpu: 4,
    memoryGib: 16,
    nvmeGb: 0,
    networkGbps: 8,
    ebsGbps: 6.5,
    ebsIops: 26_700,
    onDemand: 0.192,
    reserved: 0.121,
    spot: 0.074,
  },
  {
    id: 'm6i-2xlarge',
    name: 'm6i.2xlarge',
    family: 'General purpose',
    vcpu: 8,
    memoryGib: 32,
    nvmeGb: 0,
    networkGbps: 12.5,
    ebsGbps: 10,
    ebsIops: 40_000,
    onDemand: 0.384,
    reserved: 0.242,
    spot: 0.148,
    isShortlisted: true,
  },
  {
    id: 'c6i-2xlarge',
    name: 'c6i.2xlarge',
    family: 'Compute optimized',
    vcpu: 8,
    memoryGib: 16,
    nvmeGb: 0,
    networkGbps: 12.5,
    ebsGbps: 10,
    ebsIops: 40_000,
    onDemand: 0.34,
    reserved: 0.214,
    spot: 0.131,
  },
  {
    id: 'c6i-4xlarge',
    name: 'c6i.4xlarge',
    family: 'Compute optimized',
    vcpu: 16,
    memoryGib: 32,
    nvmeGb: 0,
    networkGbps: 20,
    ebsGbps: 16,
    ebsIops: 60_000,
    onDemand: 0.68,
    reserved: 0.428,
    spot: 0.262,
  },
  {
    id: 'r6i-2xlarge',
    name: 'r6i.2xlarge',
    family: 'Memory optimized',
    vcpu: 8,
    memoryGib: 64,
    nvmeGb: 0,
    networkGbps: 12.5,
    ebsGbps: 10,
    ebsIops: 40_000,
    onDemand: 0.504,
    reserved: 0.317,
    spot: 0.194,
  },
  {
    id: 'r6id-2xlarge',
    name: 'r6id.2xlarge',
    family: 'Memory optimized',
    vcpu: 8,
    memoryGib: 64,
    nvmeGb: 474,
    networkGbps: 12.5,
    ebsGbps: 10,
    ebsIops: 40_000,
    onDemand: 0.605,
    reserved: 0.381,
    spot: 0.233,
  },
  {
    id: 'r6i-4xlarge',
    name: 'r6i.4xlarge',
    family: 'Memory optimized',
    vcpu: 16,
    memoryGib: 128,
    nvmeGb: 0,
    networkGbps: 20,
    ebsGbps: 16,
    ebsIops: 60_000,
    onDemand: 1.008,
    reserved: 0.635,
    spot: 0.388,
  },
];

// ============= FORMATTING =============

// Pinned locale keeps the rendered output identical in every environment.
const decimal = new Intl.NumberFormat('en-US', {maximumFractionDigits: 2});
const rate = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 3,
  maximumFractionDigits: 3,
});
const fineRate = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 4,
  maximumFractionDigits: 4,
});

// ============= CRITERIA =============

type GroupKey = 'Capacity' | 'Throughput' | 'Pricing' | 'Efficiency';

const GROUP_ORDER: GroupKey[] = [
  'Capacity',
  'Throughput',
  'Pricing',
  'Efficiency',
];

interface SpecRow extends Record<string, unknown> {
  id: string;
  group: GroupKey;
  label: string;
  /** Suffix shown under the label, never repeated in every cell. */
  unit?: string;
  /** Omitted when the values differ without one being better. */
  better?: 'higher' | 'lower';
  get: (instance: Instance) => number;
  format: (value: number) => string;
}

const SPEC_ROWS: SpecRow[] = [
  {
    id: 'vcpu',
    group: 'Capacity',
    label: 'vCPUs',
    better: 'higher',
    get: i => i.vcpu,
    format: v => decimal.format(v),
  },
  {
    id: 'memory',
    group: 'Capacity',
    label: 'Memory',
    unit: 'GiB',
    better: 'higher',
    get: i => i.memoryGib,
    format: v => decimal.format(v),
  },
  {
    id: 'mem-per-vcpu',
    group: 'Capacity',
    label: 'Memory per vCPU',
    unit: 'GiB',
    better: 'higher',
    get: i => i.memoryGib / i.vcpu,
    format: v => decimal.format(v),
  },
  {
    id: 'nvme',
    group: 'Capacity',
    label: 'Local NVMe',
    unit: 'GB',
    better: 'higher',
    get: i => i.nvmeGb,
    format: v => (v === 0 ? 'EBS only' : decimal.format(v)),
  },
  {
    id: 'network',
    group: 'Throughput',
    label: 'Network bandwidth',
    unit: 'Gbps',
    better: 'higher',
    get: i => i.networkGbps,
    format: v => decimal.format(v),
  },
  {
    id: 'ebs',
    group: 'Throughput',
    label: 'EBS bandwidth',
    unit: 'Gbps',
    better: 'higher',
    get: i => i.ebsGbps,
    format: v => decimal.format(v),
  },
  {
    id: 'iops',
    group: 'Throughput',
    label: 'Max EBS IOPS',
    better: 'higher',
    get: i => i.ebsIops,
    format: v => decimal.format(v),
  },
  {
    id: 'on-demand',
    group: 'Pricing',
    label: 'On-demand',
    unit: 'per hour',
    better: 'lower',
    get: i => i.onDemand,
    format: v => rate.format(v),
  },
  {
    id: 'reserved',
    group: 'Pricing',
    label: '1-year reserved',
    unit: 'per hour',
    better: 'lower',
    get: i => i.reserved,
    format: v => rate.format(v),
  },
  {
    id: 'spot',
    group: 'Pricing',
    label: 'Spot average',
    unit: 'per hour',
    better: 'lower',
    get: i => i.spot,
    format: v => rate.format(v),
  },
  {
    id: 'per-vcpu',
    group: 'Efficiency',
    label: 'Cost per vCPU-hour',
    better: 'lower',
    get: i => i.onDemand / i.vcpu,
    format: v => fineRate.format(v),
  },
  {
    id: 'per-gib',
    group: 'Efficiency',
    label: 'Cost per GiB-hour',
    better: 'lower',
    get: i => i.onDemand / i.memoryGib,
    format: v => fineRate.format(v),
  },
];

/**
 * The extreme value for a row, or null when the row declares no direction.
 * Comparing against the extreme rather than picking an index means ties are all
 * marked instead of one being chosen arbitrarily.
 */
function bestValue(row: SpecRow): number | null {
  if (!row.better) {
    return null;
  }
  const values = INSTANCES.map(row.get);
  return row.better === 'higher' ? Math.max(...values) : Math.min(...values);
}

const BEST_BY_ROW = new Map(SPEC_ROWS.map(row => [row.id, bestValue(row)]));

// ============= COLUMNS =============

const SPEC_COLUMN_WIDTH = 220;
const INSTANCE_COLUMN_WIDTH = 168;

// Widths are pixel-valued because useTableStickyColumns resolves its offsets
// from them; a proportional column would fall back to its min width and the
// pinned cells would sit in the wrong place.
const columns: TableColumn<SpecRow>[] = [
  {
    key: 'spec',
    header: 'Criterion',
    width: pixel(SPEC_COLUMN_WIDTH),
    renderCell: row => (
      <VStack gap={0}>
        <Text>{row.label}</Text>
        {row.unit != null && <Text type="supporting">{row.unit}</Text>}
      </VStack>
    ),
  },
  ...INSTANCES.map<TableColumn<SpecRow>>(instance => ({
    key: instance.id,
    width: pixel(INSTANCE_COLUMN_WIDTH),
    align: 'end',
    header: (
      <VStack gap={0.5} hAlign="end">
        <Text weight="semibold">{instance.name}</Text>
        {instance.isShortlisted ? (
          <Badge variant="info" label="Shortlisted" />
        ) : (
          <Text type="supporting">{instance.family}</Text>
        )}
      </VStack>
    ),
    renderCell: row => {
      const value = row.get(instance);
      const best = BEST_BY_ROW.get(row.id);
      const isBest = best != null && value === best;
      return (
        <Text hasTabularNumbers weight={isBest ? 'semibold' : 'normal'}>
          {row.format(value)}
        </Text>
      );
    },
  })),
];

// ============= PAGE =============

export default function InstanceComparisonTemplate() {
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(
    () => new Set(),
  );

  const toggleGroup = (groupKey: string) => {
    setCollapsedGroups(previous => {
      const next = new Set(previous);
      if (next.has(groupKey)) {
        next.delete(groupKey);
      } else {
        next.add(groupKey);
      }
      return next;
    });
  };

  const grouped = useTableGroupedRows<SpecRow>({
    data: SPEC_ROWS,
    groupBy: row => row.group,
    groupOrder: GROUP_ORDER,
    collapsedGroups,
    onToggleGroup: toggleGroup,
    getRowKey: row => row.id,
    // A group header is one cell spanning every column, so the sticky-columns
    // plugin has nothing to pin it to and the label scrolls off with the rest
    // of the row — leaving a blank band. Sticking the label itself to the
    // scrollport edge keeps each section named at any scroll position.
    renderGroupHeader: (groupKey, count) => (
      <HStack
        gap={2}
        vAlign="center"
        style={{position: 'sticky', insetInlineStart: 0, width: 'fit-content'}}>
        <Text weight="semibold">{groupKey}</Text>
        <Text type="supporting">
          {count} {count === 1 ? 'criterion' : 'criteria'}
        </Text>
      </HStack>
    ),
  });

  // T cannot be inferred from the config alone, so it is named explicitly.
  const sticky = useTableStickyColumns<SpecRow>({startKeys: ['spec']});

  const shortlisted = useMemo(
    () => INSTANCES.find(instance => instance.isShortlisted),
    [],
  );

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider padding={4}>
          <HStack gap={3} vAlign="center" wrap="wrap">
            <StackItem size="fill">
              <VStack gap={0.5}>
                <Heading level={1}>Instance comparison</Heading>
                <Text type="supporting">
                  {INSTANCES.length} candidates across {SPEC_ROWS.length}{' '}
                  criteria
                  {shortlisted != null &&
                    ` · ${shortlisted.name} shortlisted for the API tier`}
                </Text>
              </VStack>
            </StackItem>
            <Button
              label="Export comparison"
              variant="secondary"
              icon={<Icon icon={ArrowDownTrayIcon} size="sm" />}
            />
          </HStack>
        </LayoutHeader>
      }
      content={
        <LayoutContent padding={4}>
          <VStack gap={3}>
            <Table<SpecRow>
              data={grouped.data}
              columns={columns}
              idKey={grouped.idKey}
              density="compact"
              dividers="grid"
              plugins={{grouped: grouped.plugin, sticky}}
            />
            <Text type="supporting">
              Bold marks the best value in a row. Rows without a better
              direction are left unmarked.
            </Text>
          </VStack>
        </LayoutContent>
      }
    />
  );
}
