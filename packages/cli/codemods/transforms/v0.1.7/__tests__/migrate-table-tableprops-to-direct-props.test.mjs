// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';

async function applyTransform(source) {
  const {default: transform} = await import(
    '../migrate-table-tableprops-to-direct-props.mjs'
  );
  const jscodeshift = (await import('jscodeshift')).default;
  const j = jscodeshift.withParser('tsx');
  const api = {jscodeshift: j, stats: () => {}, report: () => {}};
  const file = {source, path: 'test.tsx'};
  const result = transform(file, api);
  return result ?? source;
}

const TODO = 'TODO(astryx): tableProps is deprecated';

describe('migrate-table-tableprops-to-direct-props', () => {
  it('lifts className and style to sibling props', async () => {
    const input = `import {Table} from '@astryxdesign/core';
const x = <Table tableProps={{className: 'striped', style: {width: 400}}} columns={cols} />;`;
    const output = await applyTransform(input);
    expect(output).toContain(`className='striped'`);
    expect(output).toContain('style={{width: 400}}');
    expect(output).not.toContain('tableProps');
  });

  it(`lifts 'aria-label' and 'data-testid' string keys to hyphenated props`, async () => {
    const input = `import {Table} from '@astryxdesign/core/Table';
const x = <Table tableProps={{'aria-label': 'Users', 'data-testid': 'users-table'}} />;`;
    const output = await applyTransform(input);
    expect(output).toContain(`aria-label='Users'`);
    expect(output).toContain(`data-testid='users-table'`);
    expect(output).not.toContain('tableProps');
  });

  it('lifts id and an onClick handler', async () => {
    const input = `import {Table} from '@xds/core';
const x = <Table tableProps={{id: 'users', onClick: (e) => handle(e)}} />;`;
    const output = await applyTransform(input);
    expect(output).toContain(`id='users'`);
    expect(output).toContain('onClick={(e) => handle(e)}');
    expect(output).not.toContain('tableProps');
  });

  it('keeps colliding keys in a shrunken tableProps with a TODO comment', async () => {
    const input = `import {Table} from '@astryxdesign/core';
const x = <Table className='mine' tableProps={{className: 'theirs', id: 'users'}} />;`;
    const output = await applyTransform(input);
    // Non-colliding key lifted
    expect(output).toContain(`id='users'`);
    // Existing sibling wins; colliding key stays inside tableProps
    expect(output).toContain(`className='mine'`);
    expect(output).toContain('tableProps={{');
    expect(output).toContain(`className: 'theirs'`);
    expect(output).not.toContain('id: ');
    expect(output).toContain(TODO);
  });

  it('leaves a dynamic tableProps={identifier} untouched with a TODO comment', async () => {
    const input = `import {Table} from '@astryxdesign/core';
const x = <Table tableProps={props} />;`;
    const output = await applyTransform(input);
    expect(output).toContain('tableProps={props}');
    expect(output).toContain(TODO);
  });

  it('leaves an object containing a spread untouched with a TODO comment (no partial lift)', async () => {
    const input = `import {Table} from '@astryxdesign/core';
const x = <Table tableProps={{className: 'x', ...rest}} />;`;
    const output = await applyTransform(input);
    expect(output).toContain(`tableProps={{className: 'x', ...rest}}`);
    expect(output).not.toContain(`<Table className=`);
    expect(output).toContain(TODO);
  });

  it('transforms aliased Table imports', async () => {
    const input = `import {Table as DataTable} from '@astryxdesign/core';
const x = <DataTable tableProps={{className: 'x'}} />;`;
    const output = await applyTransform(input);
    expect(output).toContain(`<DataTable className='x' />`);
    expect(output).not.toContain('tableProps');
  });

  it('does not touch other components with a tableProps attribute', async () => {
    const input = `import {Table} from '@astryxdesign/core';
const a = <Table tableProps={{id: 'users'}} />;
const b = <OtherComponent tableProps={{className: 'x'}} />;`;
    const output = await applyTransform(input);
    expect(output).toContain(`<Table id='users' />`);
    expect(output).toContain(`<OtherComponent tableProps={{className: 'x'}} />`);
  });

  it('returns undefined for files without a Table import', async () => {
    const {default: transform} = await import(
      '../migrate-table-tableprops-to-direct-props.mjs'
    );
    const jscodeshift = (await import('jscodeshift')).default;
    const j = jscodeshift.withParser('tsx');
    const api = {jscodeshift: j, stats: () => {}, report: () => {}};
    const source = `import {Grid} from '@astryxdesign/core';
const x = <Table tableProps={{className: 'x'}} />;`;
    const result = transform({source, path: 'test.tsx'}, api);
    expect(result).toBeUndefined();
  });

  it('returns undefined for already-migrated files (no tableProps)', async () => {
    const {default: transform} = await import(
      '../migrate-table-tableprops-to-direct-props.mjs'
    );
    const jscodeshift = (await import('jscodeshift')).default;
    const j = jscodeshift.withParser('tsx');
    const api = {jscodeshift: j, stats: () => {}, report: () => {}};
    const source = `import {Table} from '@astryxdesign/core';
const x = <Table className='x' />;`;
    const result = transform({source, path: 'test.tsx'}, api);
    expect(result).toBeUndefined();
  });
});
