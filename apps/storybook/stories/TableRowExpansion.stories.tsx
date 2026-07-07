// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {
  Table,
  useTableRowExpansion,
  useTableRowExpansionState,
  pixel,
  proportional,
} from '@astryxdesign/core/Table';
import type {TableColumn} from '@astryxdesign/core/Table';

// =============================================================================
// Sample Data — tree structure (file system)
// =============================================================================

interface FileNode extends Record<string, unknown> {
  id: string;
  name: string;
  type: 'folder' | 'file';
  size: string;
  modified: string;
  children?: FileNode[];
}

const fileTree: FileNode[] = [
  {
    id: 'src',
    name: 'src',
    type: 'folder',
    size: '—',
    modified: '2026-06-20',
    children: [
      {
        id: 'src/components',
        name: 'components',
        type: 'folder',
        size: '—',
        modified: '2026-06-19',
        children: [
          {
            id: 'src/components/Button.tsx',
            name: 'Button.tsx',
            type: 'file',
            size: '4.2 KB',
            modified: '2026-06-18',
            children: [],
          },
          {
            id: 'src/components/Table.tsx',
            name: 'Table.tsx',
            type: 'file',
            size: '12.8 KB',
            modified: '2026-06-20',
            children: [],
          },
          {
            id: 'src/components/Dialog.tsx',
            name: 'Dialog.tsx',
            type: 'file',
            size: '6.1 KB',
            modified: '2026-06-15',
            children: [],
          },
        ],
      },
      {
        id: 'src/utils',
        name: 'utils',
        type: 'folder',
        size: '—',
        modified: '2026-06-17',
        children: [
          {
            id: 'src/utils/format.ts',
            name: 'format.ts',
            type: 'file',
            size: '1.3 KB',
            modified: '2026-06-17',
            children: [],
          },
          {
            id: 'src/utils/merge.ts',
            name: 'merge.ts',
            type: 'file',
            size: '0.8 KB',
            modified: '2026-06-10',
            children: [],
          },
        ],
      },
      {
        id: 'src/index.ts',
        name: 'index.ts',
        type: 'file',
        size: '0.4 KB',
        modified: '2026-06-20',
        children: [],
      },
    ],
  },
  {
    id: 'public',
    name: 'public',
    type: 'folder',
    size: '—',
    modified: '2026-06-01',
    children: [
      {
        id: 'public/favicon.ico',
        name: 'favicon.ico',
        type: 'file',
        size: '15 KB',
        modified: '2026-05-20',
        children: [],
      },
    ],
  },
  {
    id: 'package.json',
    name: 'package.json',
    type: 'file',
    size: '1.8 KB',
    modified: '2026-06-22',
    children: [],
  },
  {
    id: 'tsconfig.json',
    name: 'tsconfig.json',
    type: 'file',
    size: '0.6 KB',
    modified: '2026-06-01',
    children: [],
  },
];

const columns: TableColumn<FileNode>[] = [
  {key: 'name', header: 'Name', width: proportional(2)},
  {key: 'type', header: 'Type', width: pixel(80)},
  {key: 'size', header: 'Size', width: pixel(90)},
  {key: 'modified', header: 'Modified', width: pixel(120)},
];

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
 * A file tree rendered as a table with expandable folder rows. Child rows
 * inherit the parent's columns and are indented based on depth. Click the
 * chevron (or right-click → "Expand/Collapse row") to expand a folder.
 */
export const InheritedColumns: Story = {
  render: () => {
    const [expandedKeys, setExpandedKeys] = useState<Set<string>>(
      new Set(['src']),
    );

    // The state hook flattens the tree, tracks depth, and derives the
    // expand/collapse + expand-all handlers — no boilerplate in the consumer.
    const {data, expansionConfig} = useTableRowExpansionState<FileNode>({
      baseData: fileTree,
      getChildren: item => item.children ?? [],
      getRowKey: item => item.id,
      expandedKeys,
      setExpandedKeys,
    });

    const expansion = useTableRowExpansion(expansionConfig);

    return (
      <Table
        data={data}
        columns={columns}
        idKey="id"
        hasHover
        plugins={{expansion}}
      />
    );
  },
};

/**
 * Only folders are expandable (files have no children). The chevron and
 * context-menu action are hidden for leaf nodes.
 */
export const LeafNodesNotExpandable: Story = {
  render: () => {
    const [expandedKeys, setExpandedKeys] = useState<Set<string>>(
      new Set(['src', 'src/components']),
    );

    // `getIsItemExpandable` restricts expandability (and expand-all) to folders.
    const {data, expansionConfig} = useTableRowExpansionState<FileNode>({
      baseData: fileTree,
      getChildren: item => item.children ?? [],
      getRowKey: item => item.id,
      getIsItemExpandable: item => item.type === 'folder',
      expandedKeys,
      setExpandedKeys,
    });

    const expansion = useTableRowExpansion(expansionConfig);

    return (
      <Table
        data={data}
        columns={columns}
        idKey="id"
        hasHover
        plugins={{expansion}}
      />
    );
  },
};

/**
 * `hasRowClickExpansion: true` — clicking anywhere on the row toggles expansion
 * (in addition to the chevron). The row shows a pointer cursor.
 */
export const ExpandOnRowClick: Story = {
  render: () => {
    const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());

    const {data, expansionConfig} = useTableRowExpansionState<FileNode>({
      baseData: fileTree,
      getChildren: item => item.children ?? [],
      getRowKey: item => item.id,
      expandedKeys,
      setExpandedKeys,
    });

    // Opt into row-click expansion by extending the derived config.
    const expansion = useTableRowExpansion({
      ...expansionConfig,
      hasRowClickExpansion: true,
    });

    return (
      <Table
        data={data}
        columns={columns}
        idKey="id"
        hasHover
        plugins={{expansion}}
      />
    );
  },
};
