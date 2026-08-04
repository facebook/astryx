// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {
  Table,
  useTableRowExpansion,
  useTableRowExpansionState,
  proportional,
  pixel,
} from '@astryxdesign/core/Table';

interface FileNode extends Record<string, unknown> {
  id: string;
  name: string;
  type: 'folder' | 'file';
  size: string;
  children?: FileNode[];
}

const fileTree: FileNode[] = [
  {
    id: 'src',
    name: 'src',
    type: 'folder',
    size: '—',
    children: [
      {
        id: 'src/components',
        name: 'components',
        type: 'folder',
        size: '—',
        children: [
          {
            id: 'src/components/Button.tsx',
            name: 'Button.tsx',
            type: 'file',
            size: '4.2 KB',
            children: [],
          },
          {
            id: 'src/components/Table.tsx',
            name: 'Table.tsx',
            type: 'file',
            size: '12.8 KB',
            children: [],
          },
        ],
      },
      {
        id: 'src/index.ts',
        name: 'index.ts',
        type: 'file',
        size: '0.4 KB',
        children: [],
      },
    ],
  },
  {
    id: 'package.json',
    name: 'package.json',
    type: 'file',
    size: '1.8 KB',
    children: [],
  },
];

const columns = [
  {key: 'name', header: 'Name', width: proportional(2)},
  {key: 'type', header: 'Type', width: pixel(80)},
  {key: 'size', header: 'Size', width: pixel(90)},
];

export default function TableRowExpansionTable() {
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(
    new Set(['src']),
  );

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
}
