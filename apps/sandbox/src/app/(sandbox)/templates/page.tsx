'use client';

import {useState, useCallback, useMemo, Suspense} from 'react';
import Link from 'next/link';
import {useSearchParams, useRouter} from 'next/navigation';
import {XDSHeading} from '@xds/core/Text';
import {XDSLayout, XDSLayoutHeader, XDSLayoutContent} from '@xds/core/Layout';
import {
  XDSTable,
  useXDSTableSortableState,
  useXDSTableSortable,
  useXDSTableColumnResize,
  useXDSTableFiltering,
  toSearchFilters,
  pixel,
} from '@xds/core/Table';
import type {XDSTableColumn, XDSTableSortState} from '@xds/core/Table';
import type {XDSTableFilterState, XDSTableFilterValue} from '@xds/core/Table';
import {usePowerSearchConfig} from '@xds/core/PowerSearch';
import type {PowerSearchFilter} from '@xds/core/PowerSearch';
import {XDSLink} from '@xds/core/Link';
import {XDSBadge} from '@xds/core/Badge';
import {templates} from '../../../generated/templateRegistry';
import {blocks} from '../../../generated/blockRegistry';

type TemplateRow = {
  id: string;
  name: string;
  description: string;
  href: string;
  type: 'Page' | 'Block';
  component: string;
  codePath: string;
  docPath: string;
  isReady: boolean;
};

const rows: TemplateRow[] = [
  ...templates.map(t => ({
    id: `page-${t.slug}`,
    name: t.name,
    description: t.description,
    href: t.href,
    type: 'Page' as const,
    component: 'n/a',
    codePath: `packages/cli/templates/pages/${t.slug}/page.tsx`,
    docPath: `packages/cli/templates/pages/${t.slug}/template.doc.mjs`,
    isReady: t.isReady,
  })),
  ...blocks.map(b => ({
    id: `block-${b.slug}`,
    name: b.name,
    description: b.description,
    href: b.href,
    type: 'Block' as const,
    component: b.component,
    codePath: `packages/cli/templates/blocks/components/${b.component}/${b.slug}.tsx`,
    docPath: `packages/cli/templates/blocks/components/${b.component}/${b.slug}.doc.mjs`,
    isReady: b.isReady,
  })),
];

const FILTER_PREFIX = 'filter.';

function parseSortFromParams(
  params: URLSearchParams,
): XDSTableSortState | undefined {
  const raw = params.get('sort');
  if (!raw) return undefined;
  const [sortKey, dir] = raw.split(':');
  if (!sortKey || (dir !== 'asc' && dir !== 'desc')) return undefined;
  return [{sortKey, direction: dir === 'asc' ? 'ascending' : 'descending'}];
}

function serializeSort(sort: XDSTableSortState): string | null {
  if (sort.length === 0) return null;
  const {sortKey, direction} = sort[0];
  return `${sortKey}:${direction === 'ascending' ? 'asc' : 'desc'}`;
}

function parseFiltersFromParams(params: URLSearchParams): XDSTableFilterState {
  const filters: XDSTableFilterState = {};
  params.forEach((value, key) => {
    if (key.startsWith(FILTER_PREFIX)) {
      filters[key.slice(FILTER_PREFIX.length)] = value;
    }
  });
  return filters;
}

function buildSearchParams(
  sort: XDSTableSortState,
  filters: XDSTableFilterState,
): string {
  const params = new URLSearchParams();
  const sortStr = serializeSort(sort);
  if (sortStr) params.set('sort', sortStr);
  for (const [key, value] of Object.entries(filters)) {
    if (value != null) params.set(`${FILTER_PREFIX}${key}`, String(value));
  }
  const str = params.toString();
  return str ? `?${str}` : '';
}

function useTableSearchParams() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const sort = useMemo(
    () =>
      parseSortFromParams(searchParams) ?? [
        {sortKey: 'name', direction: 'ascending' as const},
      ],
    [searchParams],
  );

  const filters = useMemo(
    () => parseFiltersFromParams(searchParams),
    [searchParams],
  );

  const updateURL = useCallback(
    (newSort: XDSTableSortState, newFilters: XDSTableFilterState) => {
      router.replace(buildSearchParams(newSort, newFilters), {scroll: false});
    },
    [router],
  );

  const onSortChange = useCallback(
    (newSort: XDSTableSortState) => updateURL(newSort, filters),
    [updateURL, filters],
  );

  const onFilterChange = useCallback(
    (key: string, value: XDSTableFilterValue | null) => {
      const next = {...filters};
      if (value == null) delete next[key];
      else next[key] = value;
      updateURL(sort, next);
    },
    [updateURL, sort, filters],
  );

  return {sort, onSortChange, filters, onFilterChange};
}

function CopyPath({path}: {path: string}) {
  return (
    <XDSLink
      label={`Copy path: ${path}`}
      onClick={() => navigator.clipboard.writeText(path)}
      style={{cursor: 'pointer'}}>
      Copy Path
    </XDSLink>
  );
}

const uniqueComponents = [...new Set(blocks.map(b => b.component))].sort();

const fieldDefs = [
  {key: 'name', type: 'string', label: 'Name'},
  {
    key: 'type',
    type: 'enum',
    label: 'Type',
    enumValues: [
      {value: 'Page', label: 'Page'},
      {value: 'Block', label: 'Block'},
    ],
  },
  {
    key: 'component',
    type: 'enum',
    label: 'Component',
    enumValues: [
      {value: 'n/a', label: 'n/a'},
      ...uniqueComponents.map(c => ({value: c, label: c})),
    ],
  },
] as const;

const columns: XDSTableColumn<TemplateRow>[] = [
  {
    key: 'type',
    header: 'Type',
    sortable: true,
    filter: 'type',
    width: pixel(100),
    renderCell: (row: TemplateRow) => (
      <XDSBadge
        label={row.type}
        variant={row.type === 'Page' ? 'info' : 'neutral'}
      />
    ),
  },
  {
    key: 'name',
    header: 'Name',
    sortable: true,
    filter: 'name',
    width: pixel(250),
    renderCell: (row: TemplateRow) => (
      <XDSLink label={row.name} href={row.href} as={Link} target="_blank">
        {row.name}
      </XDSLink>
    ),
  },
  {
    key: 'component',
    header: 'Component',
    sortable: true,
    filter: 'component',
    width: pixel(150),
  },
  {
    key: 'description',
    header: 'Summary',
    sortable: true,
  },
  {
    key: 'codePath',
    header: 'Code',
    width: pixel(50),
    renderCell: (row: TemplateRow) => <CopyPath path={row.codePath} />,
  },
  {
    key: 'docPath',
    header: 'Doc',
    width: pixel(50),
    renderCell: (row: TemplateRow) => <CopyPath path={row.docPath} />,
  },
];

export default function TemplatesPage() {
  return (
    <Suspense>
      <TemplatesPageInner />
    </Suspense>
  );
}

function TemplatesPageInner() {
  const {sort, onSortChange, filters, onFilterChange} = useTableSearchParams();

  const {config, applyFilters} = usePowerSearchConfig(fieldDefs);
  const filterPlugin = useXDSTableFiltering<TemplateRow>({
    filters,
    onFilterChange,
    searchConfig: config,
  });

  const filteredData = applyFilters(
    toSearchFilters(filters, columns, config) as PowerSearchFilter[],
    rows,
  );

  const {sortedData, sortConfig} = useXDSTableSortableState({
    data: filteredData,
    sort,
    onSortChange,
  });
  const sortPlugin = useXDSTableSortable<TemplateRow>(sortConfig);

  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
  const resizePlugin = useXDSTableColumnResize<TemplateRow>({
    columnWidths,
    columns: columns as XDSTableColumn<Record<string, unknown>>[],
    onColumnResizeEnd: updates =>
      setColumnWidths(prev => ({...prev, ...updates})),
  });

  return (
    <XDSLayout
      header={
        <XDSLayoutHeader hasDivider padding={6}>
          <XDSHeading level={1}>Official Templates</XDSHeading>
        </XDSLayoutHeader>
      }
      content={
        <XDSLayoutContent padding={6}>
          <XDSTable
            data={sortedData}
            columns={columns}
            idKey="id"
            hasHover
            plugins={{
              filter: filterPlugin,
              sort: sortPlugin,
              resize: resizePlugin,
            }}
          />
        </XDSLayoutContent>
      }
    />
  );
}
