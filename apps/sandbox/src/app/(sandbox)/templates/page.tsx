'use client';

import {useState} from 'react';
import Link from 'next/link';
import {XDSHeading} from '@xds/core/Text';
import {XDSLayout, XDSLayoutHeader, XDSLayoutContent} from '@xds/core/Layout';
import {
  XDSTable,
  useXDSTableSortableState,
  useXDSTableSortable,
  useXDSTableColumnResize,
  useXDSTableFiltering,
  useXDSTableFilterState,
  toSearchFilters,
  pixel,
} from '@xds/core/Table';
import type {XDSTableColumn} from '@xds/core/Table';
import {usePowerSearchConfig} from '@xds/core/PowerSearch';
import type {PowerSearchFilter} from '@xds/core/PowerSearch';
import {XDSLink} from '@xds/core/Link';
import {XDSBadge} from '@xds/core/Badge';
import {templates} from '../../../generated/templateRegistry';
import {blocks} from '../../../generated/blockRegistry';

interface TemplateRow {
  id: string;
  name: string;
  description: string;
  href: string;
  type: 'Page' | 'Block';
  component: string;
  codePath: string;
  docPath: string;
  isReady: boolean;
}

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

function CopyPath({path}: {path: string}) {
  return (
    <XDSLink
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
      <XDSLink href={row.href} as={Link}>
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
  const {config, applyFilters} = usePowerSearchConfig(fieldDefs);
  const {filters, onFilterChange} = useXDSTableFilterState();
  const filterPlugin = useXDSTableFiltering<TemplateRow>({
    filters,
    onFilterChange,
    searchConfig: config,
  });

  const filteredData = applyFilters(
    toSearchFilters(filters, columns, config) as PowerSearchFilter[],
    rows,
  );

  const {sortedData, ...sortConfig} = useXDSTableSortableState({
    data: filteredData,
    defaultSort: [{sortKey: 'name', direction: 'ascending'}],
  });
  const sortPlugin = useXDSTableSortable(sortConfig);

  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
  const resizePlugin = useXDSTableColumnResize({
    columnWidths,
    columns,
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
