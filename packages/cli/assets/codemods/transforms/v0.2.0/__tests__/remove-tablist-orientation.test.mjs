// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';

async function applyTransform(source) {
  const {default: transform} = await import('../remove-tablist-orientation.mjs');
  const jscodeshift = (await import('jscodeshift')).default;
  const j = jscodeshift.withParser('tsx');
  const api = {jscodeshift: j, stats: () => {}, report: () => {}};
  const file = {source, path: 'test.tsx'};
  const result = transform(file, api);
  return result ?? source;
}

describe('remove-tablist-orientation', () => {
  it('removes orientation="horizontal" from TabList', async () => {
    const input = `import {TabList} from '@astryxdesign/core';
const t = <TabList value="a" onChange={onChange} orientation="horizontal"><Tab value="a" label="A" /></TabList>;`;
    const output = await applyTransform(input);
    expect(output).not.toContain('orientation');
    expect(output).toContain('value="a"');
  });

  it('removes orientation="vertical" from TabList', async () => {
    const input = `import {TabList} from '@astryxdesign/core';
const t = <TabList value="a" onChange={onChange} orientation="vertical"><Tab value="a" label="A" /></TabList>;`;
    const output = await applyTransform(input);
    expect(output).not.toContain('orientation');
    expect(output).toContain('value="a"');
  });

  it('removes orientation from a TabList with expression value', async () => {
    const input = `import {TabList} from '@astryxdesign/core';
const t = <TabList value={active} orientation={'horizontal'} onChange={fn}><Tab value="a" label="A" /></TabList>;`;
    const output = await applyTransform(input);
    expect(output).not.toContain('orientation');
  });

  it('is alias-aware', async () => {
    const input = `import {TabList as Tabs} from '@astryxdesign/core';
const t = <Tabs value="a" onChange={fn} orientation="vertical"><Tab value="a" label="A" /></Tabs>;`;
    const output = await applyTransform(input);
    expect(output).not.toContain('orientation');
  });

  it('handles the subpath import source', async () => {
    const input = `import {TabList} from '@astryxdesign/core/TabList';
const t = <TabList value="a" onChange={fn} orientation="horizontal"><Tab value="a" label="A" /></TabList>;`;
    const output = await applyTransform(input);
    expect(output).not.toContain('orientation');
  });

  it('does not touch orientation on other components', async () => {
    const input = `import {TabList} from '@astryxdesign/core';
const t = <SomeOtherComponent orientation="vertical" />;`;
    const output = await applyTransform(input);
    // SomeOtherComponent is not a TabList; orientation is preserved
    expect(output).toContain('orientation="vertical"');
  });

  it('returns undefined (no-op) when no TabList import is found', async () => {
    const input = `import {Button} from '@astryxdesign/core';
const t = <Button label="Click" />;`;
    const {default: transform} = await import('../remove-tablist-orientation.mjs');
    const jscodeshift = (await import('jscodeshift')).default;
    const j = jscodeshift.withParser('tsx');
    const api = {jscodeshift: j, stats: () => {}, report: () => {}};
    const file = {source: input, path: 'test.tsx'};
    const result = transform(file, api);
    // No TabList import means no-op: transform returns undefined
    expect(result).toBeUndefined();
  });

  it('leaves TabList with no orientation prop unchanged', async () => {
    const input = `import {TabList} from '@astryxdesign/core';
const t = <TabList value="a" onChange={fn}><Tab value="a" label="A" /></TabList>;`;
    const output = await applyTransform(input);
    // Source is returned unchanged (transform returns undefined, applyTransform falls back)
    expect(output).toBe(input);
  });
});
