// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input None
 * @output Table Lab — a tool to test any combination of Table plugins with
 *   live scroll-perf, FPS, dropped-frame, and re-render metrics.
 * @position Sandbox tool page (/pages/table-lab)
 *
 * ADDING A NEW PLUGIN: add one entry to PLUGIN_ORDER + a colocated block in
 * `useLabPlugins`. Everything else (toggle, perf, config panel) is generic.
 */

import {
  useState,
  useMemo,
  useRef,
  useCallback,
  useEffect,
  Profiler,
} from 'react';
import * as stylex from '@stylexjs/stylex';

import {VStack, HStack} from '@astryxdesign/core/Layout';
import {Text, Heading} from '@astryxdesign/core/Text';
import {Card} from '@astryxdesign/core/Card';
import {Button} from '@astryxdesign/core/Button';
import {Badge} from '@astryxdesign/core/Badge';
import {Switch} from '@astryxdesign/core/Switch';
import {Divider} from '@astryxdesign/core/Divider';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';

import {
  Table,
  useTableSelection,
  useTableSelectionState,
  useTableSortable,
  useTableSortableState,
  useTablePagination,
  paginateData,
  useTableColumnResize,
  useTableStickyColumns,
  useTableRowExpansion,
  useTableRowExpansionState,
  useTableGroupedRows,
} from '@astryxdesign/core/Table';
import type {TablePlugin, TableSortState} from '@astryxdesign/core/Table';

import {generateRows, labColumns, type LabRow} from './tableLabData';
import {
  usePerfMetrics,
  type RenderStats,
  type ScrollStats,
} from './usePerfMetrics';

// =============================================================================
// Plugin registry — the single place that describes toggleable plugins.
// To add a new one: add an id here + a block in useLabPlugins below.
// =============================================================================

type PluginId =
  | 'selection'
  | 'sortable'
  | 'pagination'
  | 'columnResize'
  | 'stickyColumns'
  | 'rowExpansion'
  | 'groupedRows';

interface PluginMeta {
  id: PluginId;
  label: string;
  description: string;
}

const PLUGIN_REGISTRY: PluginMeta[] = [
  {
    id: 'selection',
    label: 'Selection',
    description: 'Row checkboxes + select-all',
  },
  {id: 'sortable', label: 'Sortable', description: 'Click headers to sort'},
  {
    id: 'pagination',
    label: 'Pagination',
    description: 'Paginate rows (page size 25)',
  },
  {
    id: 'columnResize',
    label: 'Column Resize',
    description: 'Drag column edges to resize',
  },
  {
    id: 'stickyColumns',
    label: 'Sticky Columns',
    description: 'Pin Name (start) + Joined (end)',
  },
  {
    id: 'rowExpansion',
    label: 'Row Expansion',
    description: 'Expandable tree rows (grouped by team)',
  },
  {
    id: 'groupedRows',
    label: 'Grouped Rows',
    description: 'Collapsible sections grouped by team',
  },
];

// =============================================================================
// Plugin wiring — every hook is called unconditionally (React rules); only the
// enabled ones are added to the plugins map handed to <Table>.
// =============================================================================

interface UseLabPluginsArgs {
  enabled: Record<PluginId, boolean>;
  baseData: LabRow[];
}

interface UseLabPluginsResult {
  data: LabRow[];
  plugins: Record<string, TablePlugin<LabRow>>;
  /** idKey passed to <Table>. Grouped rows override this to key synthetic headers. */
  idKey: (keyof LabRow & string) | ((item: LabRow) => string);
  /** Summary chips for the active-plugin state (selected count, page, etc). */
  summary: string[];
}

function useLabPlugins({
  enabled,
  baseData,
}: UseLabPluginsArgs): UseLabPluginsResult {
  const summary: string[] = [];

  // --- selection ---
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const {selectionConfig} = useTableSelectionState<LabRow>({
    data: baseData,
    idKey: 'id',
    selectedKeys,
    setSelectedKeys,
  });
  const selectionPlugin = useTableSelection<LabRow>(selectionConfig);
  if (enabled.selection) {
    summary.push(`${selectedKeys.size} selected`);
  }

  // --- sortable ---
  const [sort, setSort] = useState<TableSortState>([]);
  const {sortedData, sortConfig} = useTableSortableState<LabRow>({
    data: baseData,
    sort,
    onSortChange: setSort,
  });
  const sortPlugin = useTableSortable<LabRow>(sortConfig);
  const dataAfterSort = enabled.sortable ? sortedData : baseData;
  if (enabled.sortable && sort.length > 0) {
    summary.push(
      `sorted by ${sort[0].sortKey} ${sort[0].direction === 'ascending' ? '↑' : '↓'}`,
    );
  }

  // --- pagination ---
  const PAGE_SIZE = 25;
  const [page, setPage] = useState(1);
  const paginationPlugin = useTablePagination<LabRow>({
    page,
    onPageChange: setPage,
    totalItems: dataAfterSort.length,
    pageSize: PAGE_SIZE,
  });
  const dataAfterPage = enabled.pagination
    ? paginateData(dataAfterSort, page, PAGE_SIZE)
    : dataAfterSort;
  if (enabled.pagination) {
    const totalPages = Math.max(1, Math.ceil(dataAfterSort.length / PAGE_SIZE));
    summary.push(`page ${page}/${totalPages}`);
  }

  // --- column resize ---
  const columnResizePlugin = useTableColumnResize<LabRow>({});

  // --- sticky columns ---
  const stickyPlugin = useTableStickyColumns<LabRow>({
    startKeys: ['name'],
    endKeys: ['joined'],
  });

  // --- row expansion (flat rows; no real tree in the synthetic data) ---
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());
  const {expansionConfig} = useTableRowExpansionState<LabRow>({
    baseData: dataAfterPage,
    getChildren: () => [],
    getRowKey: item => item.id,
    expandedKeys,
    setExpandedKeys,
  });
  const rowExpansionPlugin = useTableRowExpansion(expansionConfig);
  if (enabled.rowExpansion) {
    summary.push(`${expandedKeys.size} expanded`);
  }

  // --- grouped rows (collapsible sections by team) ---
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(
    new Set(),
  );
  const toggleGroup = useCallback((key: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);
  const grouped = useTableGroupedRows<LabRow>({
    data: dataAfterPage,
    groupBy: item => item.team,
    collapsedGroups,
    onToggleGroup: toggleGroup,
    getRowKey: item => item.id,
  });
  if (enabled.groupedRows) {
    summary.push(`${collapsedGroups.size} groups collapsed`);
  }

  // Assemble enabled plugins in a stable order.
  const plugins: Record<string, TablePlugin<LabRow>> = {};
  if (enabled.groupedRows) {
    plugins.grouped = grouped.plugin;
  }
  if (enabled.sortable) {
    plugins.sort = sortPlugin;
  }
  if (enabled.selection) {
    plugins.selection = selectionPlugin;
  }
  if (enabled.rowExpansion) {
    plugins.expansion = rowExpansionPlugin;
  }
  if (enabled.stickyColumns) {
    plugins.sticky = stickyPlugin;
  }
  if (enabled.columnResize) {
    plugins.resize = columnResizePlugin;
  }
  if (enabled.pagination) {
    plugins.pagination = paginationPlugin;
  }

  return {
    data: enabled.groupedRows ? grouped.data : dataAfterPage,
    plugins,
    idKey: enabled.groupedRows ? grouped.idKey : 'id',
    summary,
  };
}

// =============================================================================
// Data-size presets
// =============================================================================

const SIZE_PRESETS = [
  {value: '50', label: '50'},
  {value: '500', label: '500'},
  {value: '2000', label: '2k'},
  {value: '10000', label: '10k'},
];

// =============================================================================
// Metric HUD
// =============================================================================

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: 'good' | 'warn' | 'bad';
}) {
  const color =
    tone === 'good'
      ? 'var(--color-text-green)'
      : tone === 'warn'
        ? 'var(--color-text-orange)'
        : tone === 'bad'
          ? 'var(--color-text-red)'
          : 'var(--color-text-primary)';
  return (
    <VStack gap={4} {...stylex.props(styles.metric)}>
      <Text type="supporting" color="secondary">
        {label}
      </Text>
      <span
        style={{
          fontSize: 22,
          fontWeight: 700,
          fontVariantNumeric: 'tabular-nums',
          color,
        }}>
        {value}
      </span>
    </VStack>
  );
}

/**
 * Isolated perf HUD. Reads live render stats from a ref via its own rAF ticker
 * (throttled to ~10Hz) and renders in a sibling subtree of the profiled Table,
 * so its updates never re-render — and therefore never re-profile — the Table.
 * That's what prevents the Profiler setState → commit → onRender feedback loop.
 */
function PerfHud({
  renderStatsRef,
  scroll,
  renderedRows,
}: {
  renderStatsRef: React.RefObject<RenderStats>;
  scroll: ScrollStats;
  renderedRows: number;
}) {
  const [display, setDisplay] = useState<RenderStats>({
    count: 0,
    lastMs: null,
    totalMs: 0,
  });

  useEffect(() => {
    let raf = 0;
    let last = 0;
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (now - last > 100) {
        last = now;
        const r = renderStatsRef.current;
        setDisplay(prev =>
          prev.count === r.count && prev.lastMs === r.lastMs
            ? prev
            : {count: r.count, lastMs: r.lastMs, totalMs: r.totalMs},
        );
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [renderStatsRef]);

  const fpsTone =
    scroll.fps == null
      ? undefined
      : scroll.fps >= 55
        ? 'good'
        : scroll.fps >= 30
          ? 'warn'
          : 'bad';
  const dropTone =
    scroll.drops === 0 ? 'good' : scroll.drops < 5 ? 'warn' : 'bad';

  return (
    <Card>
      <HStack gap={2} wrap="wrap" {...stylex.props(styles.hud)}>
        <Metric
          label="Scroll FPS"
          value={scroll.fps == null ? '—' : String(scroll.fps)}
          tone={fpsTone}
        />
        <Metric
          label="Frame drops"
          value={scroll.fps == null ? '—' : String(scroll.drops)}
          tone={scroll.fps == null ? undefined : dropTone}
        />
        <Metric
          label="Frames sampled"
          value={scroll.frames ? String(scroll.frames) : '—'}
        />
        <Divider orientation="vertical" />
        <Metric label="Renders" value={String(display.count)} />
        <Metric
          label="Last commit"
          value={
            display.lastMs == null ? '—' : `${display.lastMs.toFixed(1)}ms`
          }
        />
        <Metric
          label="Total commit"
          value={display.totalMs ? `${display.totalMs.toFixed(0)}ms` : '—'}
        />
        <Divider orientation="vertical" />
        <Metric label="Rendered rows" value={String(renderedRows)} />
      </HStack>
    </Card>
  );
}

// =============================================================================
// Page
// =============================================================================

export default function TableLabPage() {
  const [rowCount, setRowCount] = useState(500);
  const [enabled, setEnabled] = useState<Record<PluginId, boolean>>({
    selection: false,
    sortable: true,
    pagination: false,
    columnResize: false,
    stickyColumns: false,
    rowExpansion: false,
    groupedRows: false,
  });

  const baseData = useMemo(() => generateRows(rowCount), [rowCount]);
  const {data, plugins, idKey, summary} = useLabPlugins({enabled, baseData});

  const {
    renderStatsRef,
    onRender,
    resetRenders,
    scroll,
    runScrollTest,
    resetScroll,
  } = usePerfMetrics();

  const scrollWrapRef = useRef<HTMLDivElement>(null);
  const getScrollContainer = useCallback(() => scrollWrapRef.current, []);

  const togglePlugin = useCallback(
    (id: PluginId, on: boolean) => {
      setEnabled(prev => ({...prev, [id]: on}));
      resetScroll();
    },
    [resetScroll],
  );

  const enabledCount = Object.values(enabled).filter(Boolean).length;

  return (
    <VStack gap={6} {...stylex.props(styles.root)}>
      <VStack gap={4}>
        <Heading level={2}>Table Lab</Heading>
        <Text color="secondary">
          Toggle any combination of Table plugins and measure scroll FPS,
          dropped frames, and React re-renders on datasets up to 10k rows.
        </Text>
      </VStack>

      {/* Controls */}
      <Card>
        <VStack gap={5} {...stylex.props(styles.controls)}>
          <HStack gap={3} vAlign="center" justify="between" wrap="wrap">
            <VStack gap={2}>
              <Text type="supporting" color="secondary">
                Rows
              </Text>
              <SegmentedControl
                value={String(rowCount)}
                onChange={v => {
                  setRowCount(Number(v));
                  resetRenders();
                  resetScroll();
                }}
                label="Row count">
                {SIZE_PRESETS.map(p => (
                  <SegmentedControlItem
                    key={p.value}
                    value={p.value}
                    label={p.label}
                  />
                ))}
              </SegmentedControl>
            </VStack>

            <HStack gap={2} wrap="wrap">
              <Button
                variant="primary"
                label={scroll.isScrolling ? 'Scrolling…' : 'Run scroll test'}
                onClick={() => runScrollTest(getScrollContainer())}
                isDisabled={scroll.isScrolling}
              />
              <Button
                variant="secondary"
                label="Reset renders"
                onClick={resetRenders}
              />
            </HStack>
          </HStack>

          <Divider />

          {/* Plugin toggles */}
          <VStack gap={3}>
            <HStack gap={2} vAlign="center">
              <Text weight="medium">Plugins</Text>
              <Badge variant="neutral" label={`${enabledCount} active`} />
            </HStack>
            <div {...stylex.props(styles.toggleGrid)}>
              {PLUGIN_REGISTRY.map(p => (
                <div key={p.id} {...stylex.props(styles.toggleCell)}>
                  <Switch
                    label={p.label}
                    description={p.description}
                    value={enabled[p.id]}
                    onChange={on => togglePlugin(p.id, on)}
                  />
                </div>
              ))}
            </div>
          </VStack>

          {summary.length > 0 && (
            <>
              <Divider />
              <HStack gap={2} wrap="wrap">
                {summary.map(s => (
                  <Badge key={s} variant="neutral" label={s} />
                ))}
              </HStack>
            </>
          )}
        </VStack>
      </Card>

      {/* Perf HUD — self-contained: reads render stats from a ref via its own
          ticker so its updates never re-render (and re-profile) the Table. */}
      <PerfHud
        renderStatsRef={renderStatsRef}
        scroll={scroll}
        renderedRows={data.length}
      />

      {/* The Table under test */}
      <Card>
        <div ref={scrollWrapRef} {...stylex.props(styles.tableViewport)}>
          <Profiler id="table-lab" onRender={onRender}>
            <Table
              data={data}
              columns={labColumns}
              idKey={idKey}
              hasHover
              isStriped
              plugins={plugins}
            />
          </Profiler>
        </div>
      </Card>
    </VStack>
  );
}

const styles = stylex.create({
  root: {
    padding: 24,
    maxWidth: 1200,
    marginInline: 'auto',
    width: '100%',
  },
  controls: {
    padding: 16,
  },
  hud: {
    padding: 16,
    alignItems: 'center',
  },
  metric: {
    minWidth: 90,
  },
  toggleGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: 12,
  },
  toggleCell: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'var(--color-background-muted)',
  },
  tableViewport: {
    // Fixed-height scroll viewport so the scroll test has something to scroll.
    height: 480,
    overflowY: 'auto',
    overflowX: 'auto',
    position: 'relative',
  },
});
