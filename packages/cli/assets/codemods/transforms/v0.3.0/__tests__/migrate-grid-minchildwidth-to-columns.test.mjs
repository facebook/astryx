// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';

async function applyTransform(source) {
  const {default: transform} =
    await import('../migrate-grid-minchildwidth-to-columns.mjs');
  const jscodeshift = (await import('jscodeshift')).default;
  const j = jscodeshift.withParser('tsx');
  const api = {jscodeshift: j, stats: () => {}, report: () => {}};
  const file = {source, path: 'test.tsx'};
  const result = transform(file, api);
  return result ?? source;
}

/** Collapse whitespace (and space padding inside braces) so formatting of
 * pretty-printed multiline objects does not matter for assertions. */
function normalize(str) {
  return str
    .replace(/\s+/g, ' ')
    .replace(/\{\s+/g, '{')
    .replace(/\s+\}/g, '}')
    .trim();
}

describe('migrate-grid-minchildwidth-to-columns', () => {
  it('migrates minChildWidth only to columns={{minWidth, repeat: "fit"}}', async () => {
    const input = `import {Grid} from '@astryxdesign/core';
const t = <Grid minChildWidth={280}><Item /></Grid>;`;
    const output = await applyTransform(input);
    expect(output).not.toContain('minChildWidth');
    expect(normalize(output)).toContain(
      normalize("columns={{minWidth: 280, repeat: 'fit'}}"),
    );
  });

  it('migrates columns={n} + minChildWidth to columns={{minWidth, max, repeat: "fit"}}', async () => {
    const input = `import {Grid} from '@astryxdesign/core';
const t = <Grid columns={3} minChildWidth={280}><Item /></Grid>;`;
    const output = await applyTransform(input);
    expect(output).not.toContain('minChildWidth');
    expect(normalize(output)).toContain(
      normalize("columns={{minWidth: 280, max: 3, repeat: 'fit'}}"),
    );
  });

  it('preserves other attributes (gap) when migrating the combo', async () => {
    const input = `import {Grid} from '@astryxdesign/core';
const t = <Grid columns={5} gap={5} minChildWidth={140}><Item /></Grid>;`;
    const output = await applyTransform(input);
    expect(output).not.toContain('minChildWidth');
    expect(normalize(output)).toContain(
      normalize("columns={{minWidth: 140, max: 5, repeat: 'fit'}}"),
    );
    expect(output).toContain('gap={5}');
  });

  it('bails when columns is already an object (ambiguous)', async () => {
    const input = `import {Grid} from '@astryxdesign/core';
const t = <Grid columns={{minWidth: 100}} minChildWidth={280}><Item /></Grid>;`;
    const output = await applyTransform(input);
    // Unchanged: object columns is ambiguous, so it is left as-is.
    expect(output).toBe(input);
  });

  it('bails when columns is a non-numeric/dynamic expression', async () => {
    const input = `import {Grid} from '@astryxdesign/core';
const t = <Grid columns={cols} minChildWidth={280}><Item /></Grid>;`;
    const output = await applyTransform(input);
    expect(output).toBe(input);
  });

  it('is alias-aware and supports the subpath import source', async () => {
    const input = `import {Grid as G} from '@astryxdesign/core/Grid';
const t = <G columns={4} minChildWidth={200}><Item /></G>;`;
    const output = await applyTransform(input);
    expect(output).not.toContain('minChildWidth');
    expect(normalize(output)).toContain(
      normalize("columns={{minWidth: 200, max: 4, repeat: 'fit'}}"),
    );
  });
});
