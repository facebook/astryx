// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Capability-blind Core pairing with captured selected Icon inputs.
 * @input Older constructor namespace, plain registry and erased ancestor policy.
 * @output Fixed-only compatibility and fail-closed build/check before any output write.
 * @position CLI independent-peer regressions; released native suites remain unchanged.
 */
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
vi.mock('@astryxdesign/core/Icon', async importActual => {
  const {defineAdaptiveIcon: _adaptive, ...older} = await importActual();
  return older;
});
vi.mock('@astryxdesign/core/theme', async importActual => {
  const actual = await importActual();
  const erase = input => {
    if (!input || typeof input !== 'object') return input;
    const {
      iconCapabilities: _policy,
      __iconSources: _sources,
      __iconContracts: _contracts,
      ...rest
    } = input;
    if (rest.extends) rest.extends = erase(rest.extends);
    return rest;
  };
  return {
    ...actual,
    defineTheme: input => erase(actual.defineTheme(erase(input))),
  };
});
const {themeBuild} = await import('./build.mjs');
let directory;
beforeEach(() => {
  directory = fs.mkdtempSync(
    path.join(import.meta.dirname, '.tmp-older-icon-'),
  );
  write('package.json', '{"type":"module"}\n');
});
afterEach(() => fs.rmSync(directory, {recursive: true, force: true}));
function write(file, source) {
  fs.writeFileSync(path.join(directory, file), source);
}
async function rejectsWithoutWrites() {
  const outputs = ['css', 'css.d.ts', 'js', 'd.ts'].map(
    extension => `older-icons.${extension}`,
  );
  for (const file of outputs) write(file, `sentinel:${file}`);
  for (const check of [false, true]) {
    await expect(
      themeBuild('source.mjs', {check}, {cwd: directory}),
    ).rejects.toMatchObject({code: 'ERR_CORE_INCOMPATIBLE'});
    for (const file of outputs)
      expect(fs.readFileSync(path.join(directory, file), 'utf8')).toBe(
        `sentinel:${file}`,
      );
  }
}
describe('older Core Icon compatibility', () => {
  it('preserves a direct fixed-only registry without metadata or new constructor calls', async () => {
    write('icons.mjs', "export const icons={close:'legacy-close'};");
    write(
      'source.mjs',
      "import {icons} from './icons.mjs';export default {name:'older-icons',tokens:{'--color-accent':'#123456'},icons};",
    );
    expect((await themeBuild('source.mjs', {}, {cwd: directory}))?.type).toBe(
      'theme.build',
    );
    const generated = fs.readFileSync(
      path.join(directory, 'older-icons.js'),
      'utf8',
    );
    expect(generated).toContain('icons: icons,');
    expect(generated).not.toContain('__iconSources');
    expect(generated).not.toContain('defineIconCapabilities');
  });
  it('rejects even empty or explicit-null present policy intent', async () => {
    write(
      'source.mjs',
      "export default {name:'older-icons',tokens:{'--color-accent':'#123456'},iconCapabilities:{presentation:null}};",
    );
    await rejectsWithoutWrites();
  });
  it('finds erased overridden ancestor input through exact captured lineage', async () => {
    write(
      'source.mjs',
      "import {defineTheme} from '@astryxdesign/core/theme';const parent=defineTheme({name:'older-parent',iconCapabilities:{}});export default {...defineTheme({name:'older-icons',extends:{...parent},tokens:{'--color-accent':'#123456'}})};",
    );
    await rejectsWithoutWrites();
  });
});
