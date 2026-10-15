// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it} from 'vitest';
import transform from '../migrate-list-edge-compensation-to-edge.mjs';

async function applyTransform(source) {
  const jscodeshift = (await import('jscodeshift')).default;
  const j = jscodeshift.withParser('tsx');
  const api = {jscodeshift: j, stats: () => {}, report: () => {}};
  return transform({source, path: 'test.tsx'}, api) ?? source;
}

describe('migrate-list-edge-compensation-to-edge', () => {
  it("renames edgeCompensation='inline' to edge='outset'", async () => {
    const output =
      await applyTransform(`import {List, ListItem} from '@astryxdesign/core/List';
const a = <List edgeCompensation="inline"><ListItem label="a" /></List>;
const b = <List hasDividers edgeCompensation={'inline'} />;`);

    expect(output).not.toContain('edgeCompensation');
    expect(output.match(/edge='outset'/g)).toHaveLength(2);
    expect(output).toContain('hasDividers');
  });

  it('follows aliases and the package root import', async () => {
    const output =
      await applyTransform(`import {List as Rows} from '@astryxdesign/core';
const a = <Rows edgeCompensation="inline" />;`);

    expect(output).toContain("<Rows edge='outset' />");
  });

  it('drops edgeCompensation when edge is already set', async () => {
    const output =
      await applyTransform(`import {List} from '@astryxdesign/core/List';
const a = <List edge="bleed" edgeCompensation="inline" />;`);

    expect(output).toContain('edge="bleed"');
    expect(output).not.toContain('edgeCompensation');
  });

  it('leaves dynamic values, other components, and other packages unchanged', async () => {
    const source = `import {List} from '@astryxdesign/core/List';
import {TabList} from '@astryxdesign/core/TabList';
import {List as Other} from 'some-other-package';
const a = <List edgeCompensation={mode} />;
const b = <TabList edgeCompensation="inline" />;
const c = <Other edgeCompensation="inline" />;`;
    expect(await applyTransform(source)).toBe(source);
  });
});
