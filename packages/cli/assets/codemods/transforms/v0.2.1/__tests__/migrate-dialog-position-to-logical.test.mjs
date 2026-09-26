// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';

async function applyTransform(source) {
  const {default: transform} = await import(
    '../migrate-dialog-position-to-logical.mjs'
  );
  const jscodeshift = (await import('jscodeshift')).default;
  const j = jscodeshift.withParser('tsx');
  const api = {jscodeshift: j, stats: () => {}, report: () => {}};
  const file = {source, path: 'test.tsx'};
  const result = transform(file, api);
  return result ?? source;
}

describe('migrate-dialog-position-to-logical', () => {
  it('renames left->start and right->end in position object', async () => {
    const input = `import {Dialog} from '@astryxdesign/core';
const d = <Dialog isOpen position={{left: 20, right: 40, top: 10}}>x</Dialog>;`;
    const output = await applyTransform(input);
    expect(output).toContain('start: 20');
    expect(output).toContain('end: 40');
    expect(output).toContain('top: 10');
    expect(output).not.toMatch(/\bleft:/);
    expect(output).not.toMatch(/\bright:/);
  });

  it('renames only left when only left is present', async () => {
    const input = `import {Dialog} from '@astryxdesign/core';
const d = <Dialog position={{left: 5, top: 0}}>x</Dialog>;`;
    const output = await applyTransform(input);
    expect(output).toContain('start: 5');
    expect(output).not.toMatch(/\bleft:/);
  });

  it('is alias-aware', async () => {
    const input = `import {Dialog as Modal} from '@astryxdesign/core';
const d = <Modal position={{right: 8}}>x</Modal>;`;
    const output = await applyTransform(input);
    expect(output).toContain('end: 8');
    expect(output).not.toMatch(/\bright:/);
  });

  it('handles the subpath import source', async () => {
    const input = `import {Dialog} from '@astryxdesign/core/Dialog';
const d = <Dialog position={{left: 1, right: 2}}>x</Dialog>;`;
    const output = await applyTransform(input);
    expect(output).toContain('start: 1');
    expect(output).toContain('end: 2');
  });

  it('handles the @xds/core import source', async () => {
    const input = `import {Dialog} from '@xds/core';
const d = <Dialog position={{left: 3}}>x</Dialog>;`;
    const output = await applyTransform(input);
    expect(output).toContain('start: 3');
  });

  it('preserves string offset values', async () => {
    const input = `import {Dialog} from '@astryxdesign/core';
const d = <Dialog position={{left: '5vw', right: '10%'}}>x</Dialog>;`;
    const output = await applyTransform(input);
    expect(output).toContain("start: '5vw'");
    expect(output).toContain("end: '10%'");
  });

  it('leaves an already-logical position untouched (no-op)', async () => {
    const input = `import {Dialog} from '@astryxdesign/core';
const d = <Dialog position={{start: 20, end: 40}}>x</Dialog>;`;
    const {default: transform} = await import(
      '../migrate-dialog-position-to-logical.mjs'
    );
    const jscodeshift = (await import('jscodeshift')).default;
    const j = jscodeshift.withParser('tsx');
    const api = {jscodeshift: j, stats: () => {}, report: () => {}};
    const result = transform({source: input, path: 'test.tsx'}, api);
    expect(result).toBeUndefined();
  });

  it('does not clobber left when start is already present (ambiguous)', async () => {
    const input = `import {Dialog} from '@astryxdesign/core';
const d = <Dialog position={{left: 20, start: 5}}>x</Dialog>;`;
    const output = await applyTransform(input);
    // start already present — leave both for a human to reconcile.
    expect(output).toContain('left: 20');
    expect(output).toContain('start: 5');
  });

  it('does not touch a position passed as a variable (unknown shape)', async () => {
    const input = `import {Dialog} from '@astryxdesign/core';
const pos = {left: 20};
const d = <Dialog position={pos}>x</Dialog>;`;
    const output = await applyTransform(input);
    // The object is not inline on the JSX attribute — leave it alone.
    expect(output).toContain('const pos = {left: 20}');
  });

  it('does not touch left/right on non-Dialog components', async () => {
    const input = `import {Dialog} from '@astryxdesign/core';
const d = <SomeOther position={{left: 20, right: 40}} />;`;
    const output = await applyTransform(input);
    expect(output).toContain('left: 20');
    expect(output).toContain('right: 40');
  });

  it('returns undefined (no-op) when no Dialog import is found', async () => {
    const input = `import {Button} from '@astryxdesign/core';
const b = <Button label="x" />;`;
    const {default: transform} = await import(
      '../migrate-dialog-position-to-logical.mjs'
    );
    const jscodeshift = (await import('jscodeshift')).default;
    const j = jscodeshift.withParser('tsx');
    const api = {jscodeshift: j, stats: () => {}, report: () => {}};
    const result = transform({source: input, path: 'test.tsx'}, api);
    expect(result).toBeUndefined();
  });
});
