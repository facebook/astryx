// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';

async function applyTransform(source) {
  const {default: transform} = await import(
    '../migrate-table-rowexpansion-to-tree.mjs'
  );
  const jscodeshift = (await import('jscodeshift')).default;
  const j = jscodeshift.withParser('tsx');
  const api = {jscodeshift: j, stats: () => {}, report: () => {}};
  const file = {source, path: 'test.tsx'};
  const result = transform(file, api);
  return result ?? source;
}

function normalize(str) {
  return str
    .replace(/\s+/g, ' ')
    .replace(/\{\s+/g, '{')
    .replace(/\s+\}/g, '}')
    .trim();
}

describe('migrate-table-rowexpansion-to-tree', () => {
  it('rewrites the useTableRowExpansionState import to useTableTreeState', async () => {
    const input = `import {Table, useTableRowExpansion, useTableRowExpansionState} from '@astryxdesign/core';
function C() {
  const {data, expansionConfig} = useTableRowExpansionState({
    baseData: tree,
    getChildren: item => item.children ?? [],
    getRowKey: item => item.id,
    expandedKeys,
    setExpandedKeys,
  });
  const expansion = useTableRowExpansion(expansionConfig);
  return <Table data={data} columns={cols} idKey="id" plugins={{expansion}} />;
}`;
    const output = await applyTransform(input);
    expect(output).not.toContain('useTableRowExpansionState');
    expect(output).toContain('useTableTreeState');
    expect(output).toContain('useTableTreeData');
  });

  it('maps baseData to data and getChildren to childrenKey', async () => {
    const input = `import {Table, useTableRowExpansion, useTableRowExpansionState} from '@astryxdesign/core';
function C() {
  const {data, expansionConfig} = useTableRowExpansionState({
    baseData: tree,
    getChildren: item => item.children ?? [],
    getRowKey: item => item.id,
    expandedKeys,
    setExpandedKeys,
  });
  const expansion = useTableRowExpansion(expansionConfig);
  return <Table data={data} columns={cols} idKey="id" plugins={{expansion}} />;
}`;
    const output = await applyTransform(input);
    const n = normalize(output);
    expect(n).toContain('data: tree');
    expect(n).toContain("childrenKey: 'children'");
    expect(output).not.toContain('baseData');
    expect(output).not.toContain('getChildren');
  });

  it('maps getRowKey to idKey preserving the accessor function', async () => {
    const input = `import {Table, useTableRowExpansion, useTableRowExpansionState} from '@astryxdesign/core';
function C() {
  const {data, expansionConfig} = useTableRowExpansionState({
    baseData: tree,
    getChildren: item => item.children ?? [],
    getRowKey: item => item.id,
    expandedKeys,
    setExpandedKeys,
  });
  const expansion = useTableRowExpansion(expansionConfig);
  return <Table data={data} columns={cols} idKey="id" plugins={{expansion}} />;
}`;
    const output = await applyTransform(input);
    const n = normalize(output);
    expect(n).toContain('idKey: item => item.id');
    expect(output).not.toContain('getRowKey');
  });

  it('swaps the useTableRowExpansion plugin call for useTableTreeData', async () => {
    const input = `import {Table, useTableRowExpansion, useTableRowExpansionState} from '@astryxdesign/core';
function C() {
  const {data, expansionConfig} = useTableRowExpansionState({
    baseData: tree,
    getChildren: item => item.children ?? [],
    getRowKey: item => item.id,
    expandedKeys,
    setExpandedKeys,
  });
  const expansion = useTableRowExpansion(expansionConfig);
  return <Table data={data} columns={cols} idKey="id" plugins={{expansion}} />;
}`;
    const output = await applyTransform(input);
    // The state hook now returns treeConfig; the plugin consumes it.
    expect(output).toContain('treeConfig');
    expect(output).toContain('useTableTreeData(treeConfig)');
    expect(output).not.toMatch(/useTableRowExpansion\(/);
  });

  it('maps getIsItemExpandable to isItemExpandable', async () => {
    const input = `import {Table, useTableRowExpansion, useTableRowExpansionState} from '@astryxdesign/core';
function C() {
  const {data, expansionConfig} = useTableRowExpansionState({
    baseData: tree,
    getChildren: item => item.children ?? [],
    getRowKey: item => item.id,
    getIsItemExpandable: item => item.type === 'folder',
    expandedKeys,
    setExpandedKeys,
  });
  const expansion = useTableRowExpansion(expansionConfig);
  return <Table data={data} columns={cols} idKey="id" plugins={{expansion}} />;
}`;
    const output = await applyTransform(input);
    expect(output).toContain('isItemExpandable');
    expect(output).not.toContain('getIsItemExpandable');
  });

  it('leaves the new detail-panel usage (renderExpanded) untouched', async () => {
    const input = `import {Table, useTableRowExpansion} from '@astryxdesign/core';
function C() {
  const expansion = useTableRowExpansion({
    expandedKeys,
    onToggle,
    getRowKey: item => item.id,
    renderExpanded: item => <Details item={item} />,
  });
  return <Table data={rows} columns={cols} idKey="id" plugins={{expansion}} />;
}`;
    const output = await applyTransform(input);
    // No useTableRowExpansionState import here, and renderExpanded present:
    // this is the new detail-panel API. The codemod must not touch it.
    expect(output).toBe(input);
  });

  it('does not touch files that never imported the row-expansion hooks', async () => {
    const input = `import {Table, useTableSelection} from '@astryxdesign/core';
const t = <Table data={rows} columns={cols} idKey="id" />;`;
    const output = await applyTransform(input);
    expect(output).toBe(input);
  });

  it('supports the @xds/core import source alias', async () => {
    const input = `import {Table, useTableRowExpansion, useTableRowExpansionState} from '@xds/core';
function C() {
  const {data, expansionConfig} = useTableRowExpansionState({
    baseData: tree,
    getChildren: item => item.children ?? [],
    getRowKey: item => item.id,
    expandedKeys,
    setExpandedKeys,
  });
  const expansion = useTableRowExpansion(expansionConfig);
  return <Table data={data} columns={cols} idKey="id" plugins={{expansion}} />;
}`;
    const output = await applyTransform(input);
    expect(output).toContain('useTableTreeState');
    expect(output).not.toContain('useTableRowExpansionState');
  });

  it('emits treeConfig as a shorthand (not treeConfig: treeConfig)', async () => {
    const input = `import {Table, useTableRowExpansion, useTableRowExpansionState} from '@astryxdesign/core';
function C() {
  const {data, expansionConfig} = useTableRowExpansionState({
    baseData: tree,
    getChildren: item => item.children ?? [],
    getRowKey: item => item.id,
    expandedKeys,
    setExpandedKeys,
  });
  const expansion = useTableRowExpansion(expansionConfig);
  return <Table data={data} columns={cols} idKey="id" plugins={{expansion}} />;
}`;
    const output = await applyTransform(input);
    expect(output).not.toContain('treeConfig: treeConfig');
    expect(normalize(output)).toContain('visibleData: data');
  });

  it('leaves a migration guidance comment about expansion state', async () => {
    const input = `import {Table, useTableRowExpansion, useTableRowExpansionState} from '@astryxdesign/core';
function C() {
  const {data, expansionConfig} = useTableRowExpansionState({
    baseData: tree,
    getChildren: item => item.children ?? [],
    getRowKey: item => item.id,
    expandedKeys,
    setExpandedKeys,
  });
  const expansion = useTableRowExpansion(expansionConfig);
  return <Table data={data} columns={cols} idKey="id" plugins={{expansion}} />;
}`;
    const output = await applyTransform(input);
    expect(output).toContain('astryx-migration');
    expect(output).toContain('defaultExpandedIds');
  });
});
