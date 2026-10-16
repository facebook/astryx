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

  it('drops edgeCompensation when edge is already set, whatever its value', async () => {
    const output =
      await applyTransform(`import {List} from '@astryxdesign/core/List';
const a = <List edge="bleed" edgeCompensation="inline" />;
const b = <List edge="flush" edgeCompensation={mode} />;`);

    expect(output).toContain('edge="bleed"');
    expect(output).toContain('edge="flush"');
    expect(output).not.toContain('edgeCompensation');
    expect(output).not.toContain('TODO');
  });

  it('leaves a TODO on a dynamic value and keeps it working', async () => {
    const output =
      await applyTransform(`import {List} from '@astryxdesign/core/List';
const a = <List edgeCompensation={mode} />;
const b = <List edgeCompensation={flag ? 'inline' : undefined} />;`);

    expect(output.match(/TODO\(astryx upgrade\)/g)).toHaveLength(2);
    expect(output).toContain('edgeCompensation={mode}');
    expect(output).toContain("edgeCompensation={flag ? 'inline' : undefined}");
  });

  it('leaves a TODO on a spread beside edgeCompensation, and only there', async () => {
    const output =
      await applyTransform(`import {List} from '@astryxdesign/core/List';
const a = <List {...rest} edgeCompensation="inline" />;
const b = <List {...rest} edgeCompensation={mode} />;
const c = <List {...props} />;
const d = <List {...rest} edge="padded" />;`);

    // a: migrated, but the spread may carry the old prop too. b: dynamic
    // value and spread. c: no evidence of the old prop, so unchanged; its
    // @deprecated type reports a typed use where the props are written.
    // d: edge is set, so edge wins either way.
    expect(output.match(/TODO\(astryx upgrade\)/g)).toHaveLength(3);
    expect(output).toContain("edge='outset'");
    expect(output).toContain('const c = <List {...props} />;');
    expect(output).toContain('edge="padded"');
  });

  it('leaves other components, other packages, and unrelated spreads alone', async () => {
    const source = `import {List} from '@astryxdesign/core/List';
import {TabList} from '@astryxdesign/core/TabList';
import {List as Other} from 'some-other-package';
const a = <TabList edgeCompensation="inline" {...props} />;
const b = <Other edgeCompensation="inline" {...props} />;
const c = <div {...props} />;`;
    expect(await applyTransform(source)).toBe(source);
  });

  it('changes nothing on a second run', async () => {
    const once =
      await applyTransform(`import {List} from '@astryxdesign/core/List';
const a = <List edgeCompensation="inline" />;
const b = <List edgeCompensation={mode} />;
const c = <List {...props} edgeCompensation="inline" />;
const d = <List edge="flush" edgeCompensation="inline" />;`);
    const twice = await applyTransform(once);

    expect(twice).toBe(once);
    expect(twice.match(/TODO\(astryx upgrade\)/g)).toHaveLength(2);
  });
});
