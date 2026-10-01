// Copyright (c) Meta Platforms, Inc. and affiliates.

import stylexBabelPlugin from '@stylexjs/babel-plugin';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {afterEach, describe, expect, it} from 'vitest';
import {collectStyleXCSS} from './build-css.mjs';

const temporaryRoots = [];

afterEach(async () => {
  await Promise.all(
    temporaryRoots
      .splice(0)
      .map(root => fs.rm(root, {recursive: true, force: true})),
  );
});

async function fixture() {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'astryx-stylex-graph-'));
  temporaryRoots.push(root);
  const src = path.join(root, 'consumer');
  const external = path.join(root, 'external');
  await fs.mkdir(src, {recursive: true});
  await fs.mkdir(external, {recursive: true});
  return {root, src, external};
}

describe('build-css dependency extraction', () => {
  it('emits a referenced cross-package variable group and omits an unused group', async () => {
    const {src, external} = await fixture();
    await fs.writeFile(
      path.join(src, 'Consumer.ts'),
      `import {usedVars} from '@probe/used.stylex';\nexport const color = usedVars['--probe-used-a'];\n`,
    );
    await fs.writeFile(
      path.join(external, 'used.stylex.ts'),
      `import * as stylex from '@stylexjs/stylex';\nexport const usedVars = stylex.defineVars({'--probe-used-a': 'red', '--probe-used-b': 'blue'});\n`,
    );
    await fs.writeFile(
      path.join(external, 'unused.stylex.ts'),
      `import * as stylex from '@stylexjs/stylex';\nexport const unusedVars = stylex.defineVars({'--probe-unused': 'green'});\n`,
    );

    const rules = await collectStyleXCSS({
      src,
      aliases: {'@probe/*': [path.join(external, '*')]},
    });
    const css = stylexBabelPlugin.processStylexRules(rules, false);

    expect(css).toContain('--probe-used-a:red');
    expect(css).toContain('--probe-used-b:blue');
    expect(css).not.toContain('--probe-unused');
  });

  it('emits no variable group when no source entry imports one', async () => {
    const {src, external} = await fixture();
    await fs.writeFile(
      path.join(src, 'Consumer.ts'),
      'export const value = 1;\n',
    );
    await fs.writeFile(
      path.join(external, 'unused.stylex.ts'),
      `import * as stylex from '@stylexjs/stylex';\nexport const unusedVars = stylex.defineVars({'--probe-unused': 'green'});\n`,
    );

    const rules = await collectStyleXCSS({
      src,
      aliases: {'@probe/*': [path.join(external, '*')]},
    });

    expect(rules).toEqual([]);
  });

  it('ignores type-only imports and re-exports', async () => {
    const {src, external} = await fixture();
    await fs.writeFile(
      path.join(src, 'Consumer.ts'),
      `import type {ProbeToken} from '@probe/types.stylex';\nexport type {ProbeToken as ExportedProbeToken} from '@probe/types.stylex';\nexport type ConsumerToken = ProbeToken;\n`,
    );
    await fs.writeFile(
      path.join(src, 'InlineTypeConsumer.ts'),
      `import {type ProbeToken} from '@probe/types.stylex';\nexport type InlineConsumerToken = ProbeToken;\n`,
    );
    await fs.writeFile(
      path.join(external, 'types.stylex.ts'),
      `import * as stylex from '@stylexjs/stylex';\nexport const typeVars = stylex.defineVars({'--probe-type-only': 'green'});\nexport type ProbeToken = keyof typeof typeVars;\n`,
    );

    const rules = await collectStyleXCSS({
      src,
      aliases: {'@probe/*': [path.join(external, '*')]},
    });

    expect(rules).toEqual([]);
  });
});
