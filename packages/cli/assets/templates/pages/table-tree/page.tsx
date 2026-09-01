// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * A cloud bill you can drill into: account, then service, then resource, in one
 * table whose parent rows carry the sum of everything beneath them.
 *
 * A tree table earns its complexity when the parents are *arithmetic* on the
 * children. A folder listing does not qualify — a folder has no size of its
 * own, so a tree view is enough. Spend does: "us-east-1 costs $48k" and
 * "us-east-1's database service costs $19k of it" are the same question asked
 * at two zoom levels, and the value of the table is that you can move between
 * them without losing the columns. If your parent rows would be mostly empty
 * cells, you want a tree view or a grouped table, not this.
 *
 * ## Extending this template
 *
 * **Two hooks, and neither one is the tree.** `useTableTreeState` owns the
 * expanded set and flattens the nested data into the visible rows;
 * `useTableTreeData` is the render plugin that draws the per-level indent and
 * the chevron in the tree column. You pass the first one's `treeConfig`
 * straight into the second. Hand-rolling this — a Set of open ids plus a
 * recursive flatten on every render — is the usual way tree tables get built,
 * and it costs you the ARIA (`aria-level`, `aria-expanded`), the expand-all
 * control, and the guarantee that every level shares one column grid.
 *
 * **Sorting composes with the hierarchy instead of flattening it.**
 * `useTableSortableState` returns an `applySort` that is handed to the tree's
 * `sortSiblings`, so a sort reorders each sibling group in place and children
 * stay under their parent. Sorting by spend descending gives you the most
 * expensive account first, and within it the most expensive service — which is
 * the actual question. Feeding `sortedData` to the table directly instead would
 * dissolve the tree into a flat list.
 *
 * **Totals are computed from the leaves, never stored.** `withRollups` walks the
 * fixture once and derives every parent's spend and prior-month figure by
 * summing its descendants, so a parent can never disagree with its children.
 * Hardcoding a parent total is the bug this shape exists to prevent — the
 * numbers drift the first time someone edits a leaf. Real data usually arrives
 * pre-aggregated from the warehouse; keep the derivation anyway as a check.
 *
 * **Search prunes the tree and takes the chevrons with it.** A query keeps any
 * branch with a match anywhere beneath it and force-expands what survives, so
 * results are never hidden behind a collapsed parent. While a query is active
 * the expanded set is derived rather than stored, and manual toggling is
 * suspended; clearing the box restores exactly the expansion state the user had
 * before searching. The alternative — letting people collapse a branch that
 * only exists because it matched — reads as the search being broken.
 *
 * **A pruned tree has to be re-totalled.** `withRollups` runs again on the
 * pruned result, because removing children changes what every ancestor
 * contains. Skipping that second pass is the subtle bug in most filtered tree
 * tables: the rows are correct, the parents are stale, and a branch quietly
 * claims more than the children beneath it add up to. If you add a filter of
 * any kind, re-roll after it.
 *
 * **The tree column wraps and does not truncate.** That is a documented
 * limitation of `useTableTreeData`: `textOverflow="truncate"` does not reach
 * inside the tree column, because the indent and expander need the cell to be a
 * flex row. Long resource names wrap to a second line. Keep the tree column
 * `proportional()` and everything else `pixel()` so only that column absorbs
 * the slack.
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
import {Button} from '@astryxdesign/core/Button';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Icon} from '@astryxdesign/core/Icon';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Token} from '@astryxdesign/core/Token';
import {
  Table,
  pixel,
  proportional,
  useTableSortable,
  useTableSortableState,
  useTableTreeData,
  useTableTreeState,
} from '@astryxdesign/core/Table';
import type {TableColumn} from '@astryxdesign/core/Table';
import {
  ArrowDownTrayIcon,
  CloudIcon,
  CubeIcon,
  MagnifyingGlassIcon,
  Squares2X2Icon,
} from '@heroicons/react/24/outline';

// ============= DATA =============

type NodeKind = 'account' | 'service' | 'resource';

interface CostNode extends Record<string, unknown> {
  id: string;
  name: string;
  kind: NodeKind;
  owner: string;
  /** Month-to-date spend in cents. Zero on branches — `withRollups` fills it. */
  spendCents: number;
  /** Prior-month spend in cents, same rollup treatment. */
  priorCents: number;
  children?: CostNode[];
}

const KIND_ICON: Record<
  NodeKind,
  React.ComponentType<React.SVGProps<SVGSVGElement>>
> = {
  account: CloudIcon,
  service: Squares2X2Icon,
  resource: CubeIcon,
};

function leaf(
  id: string,
  name: string,
  owner: string,
  spend: number,
  prior: number,
): CostNode {
  return {
    id,
    name,
    kind: 'resource',
    owner,
    spendCents: spend,
    priorCents: prior,
  };
}

function service(id: string, name: string, children: CostNode[]): CostNode {
  return {
    id,
    name,
    kind: 'service',
    owner: '—',
    spendCents: 0,
    priorCents: 0,
    children,
  };
}

const COST_TREE: CostNode[] = [
  {
    id: 'prod-us',
    name: 'Production — us-east-1',
    kind: 'account',
    owner: 'Platform',
    spendCents: 0,
    priorCents: 0,
    children: [
      service('prod-us/compute', 'Compute', [
        leaf(
          'prod-us/compute/web',
          'EKS node group — prod-web',
          'Web',
          1_842_000,
          1_710_500,
        ),
        leaf(
          'prod-us/compute/api',
          'EKS node group — prod-api',
          'API',
          2_318_400,
          2_402_000,
        ),
        leaf(
          'prod-us/compute/batch',
          'Batch worker fleet',
          'Platform',
          684_200,
          902_600,
        ),
      ]),
      service('prod-us/storage', 'Storage', [
        leaf(
          'prod-us/storage/media',
          'S3 — media assets',
          'Web',
          1_120_800,
          1_048_200,
        ),
        leaf(
          'prod-us/storage/logs',
          'S3 — log archive',
          'SRE',
          412_600,
          386_400,
        ),
        leaf(
          'prod-us/storage/ebs',
          'EBS volumes',
          'Platform',
          596_300,
          601_100,
        ),
      ]),
      service('prod-us/database', 'Database', [
        leaf(
          'prod-us/database/primary',
          'Aurora PostgreSQL — primary',
          'API',
          2_940_000,
          2_880_000,
        ),
        leaf(
          'prod-us/database/replica',
          'Aurora read replicas ×3',
          'API',
          1_764_000,
          1_176_000,
        ),
        leaf(
          'prod-us/database/cache',
          'ElastiCache cluster',
          'API',
          486_500,
          470_200,
        ),
      ]),
      service('prod-us/network', 'Networking', [
        leaf(
          'prod-us/network/cdn',
          'CloudFront distribution',
          'Web',
          918_400,
          1_064_900,
        ),
        leaf('prod-us/network/nat', 'NAT gateways ×4', 'SRE', 241_600, 238_800),
        leaf(
          'prod-us/network/transfer',
          'Inter-AZ data transfer',
          'SRE',
          372_900,
          318_500,
        ),
      ]),
    ],
  },
  {
    id: 'prod-eu',
    name: 'Production — eu-west-1',
    kind: 'account',
    owner: 'Platform',
    spendCents: 0,
    priorCents: 0,
    children: [
      service('prod-eu/compute', 'Compute', [
        leaf(
          'prod-eu/compute/web',
          'EKS node group — eu-web',
          'Web',
          1_204_500,
          1_188_000,
        ),
        leaf(
          'prod-eu/compute/batch',
          'Batch worker fleet',
          'Platform',
          318_700,
          402_400,
        ),
      ]),
      service('prod-eu/storage', 'Storage', [
        leaf(
          'prod-eu/storage/media',
          'S3 — media assets',
          'Web',
          642_300,
          598_700,
        ),
        leaf(
          'prod-eu/storage/ebs',
          'EBS volumes',
          'Platform',
          288_400,
          291_000,
        ),
      ]),
      service('prod-eu/database', 'Database', [
        leaf(
          'prod-eu/database/primary',
          'Aurora PostgreSQL — eu primary',
          'API',
          1_486_000,
          1_452_000,
        ),
      ]),
      service('prod-eu/network', 'Networking', [
        leaf(
          'prod-eu/network/cdn',
          'CloudFront distribution',
          'Web',
          508_200,
          544_100,
        ),
        leaf(
          'prod-eu/network/transfer',
          'Cross-region transfer',
          'SRE',
          196_400,
          142_800,
        ),
      ]),
    ],
  },
  {
    id: 'data',
    name: 'Data platform',
    kind: 'account',
    owner: 'Data',
    spendCents: 0,
    priorCents: 0,
    children: [
      service('data/compute', 'Compute', [
        leaf(
          'data/compute/spark',
          'Spark clusters — nightly ETL',
          'Data',
          2_106_800,
          1_642_300,
        ),
        leaf(
          'data/compute/airflow',
          'Airflow scheduler + workers',
          'Data',
          384_900,
          372_100,
        ),
      ]),
      service('data/storage', 'Storage', [
        leaf(
          'data/storage/lake',
          'S3 — data lake',
          'Data',
          1_498_200,
          1_312_400,
        ),
        leaf(
          'data/storage/glacier',
          'Glacier deep archive',
          'Data',
          164_700,
          158_900,
        ),
      ]),
      service('data/warehouse', 'Warehouse', [
        leaf(
          'data/warehouse/redshift',
          'Redshift cluster',
          'Data',
          2_640_000,
          2_640_000,
        ),
      ]),
    ],
  },
  {
    id: 'staging',
    name: 'Staging',
    kind: 'account',
    owner: 'SRE',
    spendCents: 0,
    priorCents: 0,
    children: [
      service('staging/compute', 'Compute', [
        leaf(
          'staging/compute/eks',
          'EKS node group — staging',
          'Platform',
          462_800,
          618_200,
        ),
      ]),
      service('staging/storage', 'Storage', [
        leaf(
          'staging/storage/artifacts',
          'S3 — build artifacts',
          'Platform',
          148_300,
          139_600,
        ),
      ]),
      service('staging/database', 'Database', [
        leaf(
          'staging/database/primary',
          'Aurora PostgreSQL — staging',
          'API',
          386_400,
          402_000,
        ),
      ]),
    ],
  },
];

/**
 * Replace every branch's spend and prior figures with the sum of its
 * descendants, so no parent row can contradict the rows beneath it.
 */
function withRollups(nodes: CostNode[]): CostNode[] {
  return nodes.map(node => {
    if (!node.children || node.children.length === 0) {
      return node;
    }
    const children = withRollups(node.children);
    return {
      ...node,
      children,
      spendCents: children.reduce(
        (total, child) => total + child.spendCents,
        0,
      ),
      priorCents: children.reduce(
        (total, child) => total + child.priorCents,
        0,
      ),
    };
  });
}

const ROLLED_UP = withRollups(COST_TREE);

const GRAND_TOTAL_CENTS = ROLLED_UP.reduce(
  (total, account) => total + account.spendCents,
  0,
);

const DEFAULT_EXPANDED = ['prod-us'];

// ============= SEARCH =============

/** Keep any branch with a match at or beneath it; drop everything else. */
function pruneTree(nodes: CostNode[], needle: string): CostNode[] {
  const kept: CostNode[] = [];
  for (const node of nodes) {
    const isSelfMatch =
      node.name.toLowerCase().includes(needle) ||
      node.owner.toLowerCase().includes(needle);
    const children = node.children ? pruneTree(node.children, needle) : [];
    if (isSelfMatch || children.length > 0) {
      kept.push(
        node.children
          ? {
              ...node,
              children:
                isSelfMatch && children.length === 0 ? node.children : children,
            }
          : node,
      );
    }
  }
  return kept;
}

function collectIds(nodes: CostNode[], into: Set<string>): Set<string> {
  for (const node of nodes) {
    if (node.children && node.children.length > 0) {
      into.add(node.id);
      collectIds(node.children, into);
    }
  }
  return into;
}

// ============= FORMATTING =============

// Pinned locale keeps the rendered output identical in every environment.
const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});
const percent = new Intl.NumberFormat('en-US', {
  style: 'percent',
  maximumFractionDigits: 1,
});

function money(cents: number): string {
  return currency.format(cents / 100);
}

// ============= COLUMNS =============

const columns: TableColumn<CostNode>[] = [
  {
    key: 'name',
    header: 'Account / service / resource',
    width: proportional(3),
    sortable: true,
    renderCell: node => (
      <HStack gap={2} vAlign="center">
        <Icon icon={KIND_ICON[node.kind]} size="sm" color="secondary" />
        <Text weight={node.kind === 'account' ? 'semibold' : 'normal'}>
          {node.name}
        </Text>
      </HStack>
    ),
  },
  {
    key: 'owner',
    header: 'Owner',
    width: pixel(120),
    renderCell: node => <Text color="secondary">{node.owner}</Text>,
  },
  {
    key: 'spend',
    header: 'Spend (MTD)',
    width: pixel(150),
    align: 'end',
    sortable: true,
    renderCell: node => (
      <Text
        hasTabularNumbers
        weight={node.kind === 'account' ? 'semibold' : 'normal'}>
        {money(node.spendCents)}
      </Text>
    ),
  },
  {
    key: 'share',
    header: 'Share',
    width: pixel(100),
    align: 'end',
    renderCell: node => (
      <Text hasTabularNumbers color="secondary">
        {percent.format(node.spendCents / GRAND_TOTAL_CENTS)}
      </Text>
    ),
  },
  {
    key: 'change',
    header: 'vs last month',
    width: pixel(150),
    align: 'end',
    sortable: true,
    renderCell: node => {
      const delta = node.spendCents - node.priorCents;
      if (delta === 0) {
        return <Text color="secondary">—</Text>;
      }
      const isUp = delta > 0;
      return (
        <Token
          size="sm"
          // Rising cloud spend is the bad direction, so up reads red.
          color={isUp ? 'red' : 'green'}
          label={`${isUp ? '+' : '−'}${money(Math.abs(delta))}`}
        />
      );
    },
  },
];

// ============= PAGE =============

export default function CloudCostTreeTemplate() {
  const [query, setQuery] = useState('');
  const [manualExpandedIds, setManualExpandedIds] = useState<
    ReadonlySet<string>
  >(() => new Set(DEFAULT_EXPANDED));

  const needle = query.trim().toLowerCase();
  const isSearching = needle.length > 0;

  // Pruning changes what a parent contains, so the totals have to be recomputed
  // from the survivors. Reusing the unpruned rollups would leave a parent row
  // claiming more spend than the children visible underneath it add up to.
  const data = useMemo(
    () => (isSearching ? withRollups(pruneTree(ROLLED_UP, needle)) : ROLLED_UP),
    [isSearching, needle],
  );

  // While searching, expansion is derived from the pruned tree so no match can
  // hide behind a collapsed parent; manual state is parked, not overwritten.
  const searchExpandedIds = useMemo(
    () => (isSearching ? collectIds(data, new Set<string>()) : null),
    [isSearching, data],
  );

  const sortable = useTableSortableState<CostNode>({
    data,
    comparators: {
      name: (a, b) => a.name.localeCompare(b.name),
      spend: (a, b) => a.spendCents - b.spendCents,
      change: (a, b) =>
        a.spendCents - a.priorCents - (b.spendCents - b.priorCents),
    },
  });

  const {visibleData, treeConfig, expandAll, collapseAll, isAllExpanded} =
    useTableTreeState<CostNode>({
      data,
      idKey: 'id',
      expandedIds: searchExpandedIds ?? manualExpandedIds,
      onExpandedIdsChange: isSearching ? () => {} : setManualExpandedIds,
      // Reorders each sibling group in place, so children never leave their
      // parent — this is what keeps sorting and hierarchy compatible.
      sortSiblings: sortable.applySort,
    });

  const tree = useTableTreeData({...treeConfig, hasExpandAllControl: true});
  const sort = useTableSortable<CostNode>(sortable.sortConfig);

  const visibleTotal = data.reduce(
    (total, account) => total + account.spendCents,
    0,
  );

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider padding={4}>
          <VStack gap={4}>
            <HStack gap={3} vAlign="center" wrap="wrap">
              <StackItem size="fill">
                <VStack gap={0.5}>
                  <Heading level={1}>Cloud spend</Heading>
                  <Text type="supporting">
                    March 2026 · {money(GRAND_TOTAL_CENTS)} across 4 accounts
                  </Text>
                </VStack>
              </StackItem>
              <Button
                label={isAllExpanded === true ? 'Collapse all' : 'Expand all'}
                variant="ghost"
                isDisabled={isSearching}
                onClick={() =>
                  isAllExpanded === true ? collapseAll() : expandAll()
                }
              />
              <Button
                label="Export CSV"
                variant="secondary"
                icon={<Icon icon={ArrowDownTrayIcon} size="sm" />}
              />
            </HStack>
            <HStack gap={3} vAlign="center">
              <StackItem size="fill">
                <TextInput
                  label="Search accounts, services, and resources"
                  isLabelHidden
                  placeholder="Search resources or owners…"
                  startIcon={MagnifyingGlassIcon}
                  value={query}
                  onChange={setQuery}
                  hasClear
                />
              </StackItem>
              {isSearching && data.length > 0 && (
                <Text type="supporting">
                  {money(visibleTotal)} in matching spend
                </Text>
              )}
            </HStack>
          </VStack>
        </LayoutHeader>
      }
      content={
        <LayoutContent padding={4}>
          {data.length === 0 ? (
            <EmptyState
              title="No matching resources"
              description="No account, service, resource, or owner matches your search."
              actions={
                <Button
                  label="Clear search"
                  variant="secondary"
                  onClick={() => setQuery('')}
                />
              }
            />
          ) : (
            <Table<CostNode>
              data={visibleData}
              columns={columns}
              idKey="id"
              density="compact"
              dividers="rows"
              hasHover
              plugins={{tree, sort}}
            />
          )}
        </LayoutContent>
      }
    />
  );
}
