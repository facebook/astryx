// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Selected Theme metadata erasure and unsupported intent guards.
 * @input A minimal two-constructor namespace and a capability-blind Theme normalizer.
 * @output Early build/check failure with untouched output sentinels, not namespace-name acceptance.
 * @position Independent-peer CLI tests; constructors are real, registration is not probed.
 */
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
const erasure = vi.hoisted(() => ({mode: 'all'}));
vi.mock('@astryxdesign/core/Icon', async importActual => {
  const actual = await importActual();
  return {
    defineIconCapabilities: actual.defineIconCapabilities,
    defineAdaptiveIcon: actual.defineAdaptiveIcon,
  };
});
vi.mock('@astryxdesign/core/theme', async importActual => {
  const actual = await importActual();
  const erase = input => {
    if (!input || typeof input !== 'object') return input;
    const {
      iconCapabilities: _policy,
      __iconSources: _sources,
      __iconContracts: _contracts,
      componentIcons: _unsupported,
      ...rest
    } = input;
    if (rest.extends) rest.extends = erase(rest.extends);
    return rest;
  };
  return {
    ...actual,
    generateAdaptationCSS: undefined,
    defineTheme: input => {
      if (erasure.mode === 'all')
        return erase(actual.defineTheme(erase(input)));
      const theme = actual.defineTheme(input);
      const policy = {
        ...theme.iconCapabilities,
        presentation: {...theme.iconCapabilities?.presentation},
      };
      if (erasure.mode === 'sizeOverrides') delete policy.sizeOverrides;
      else delete policy.presentation[erasure.mode];
      return {...theme, iconCapabilities: policy};
    },
  };
});
const {themeBuild} = await import('./build.mjs');
let directory;
beforeEach(() => {
  erasure.mode = 'all';
  directory = fs.mkdtempSync(
    path.join(import.meta.dirname, '.tmp-icon-retention-'),
  );
  write('package.json', '{"type":"module"}\n');
});
afterEach(() => fs.rmSync(directory, {recursive: true, force: true}));
function write(file, source) {
  fs.writeFileSync(path.join(directory, file), source);
}
async function rejectsWithoutWrites(file, code) {
  const outputs = ['css', 'css.d.ts', 'js', 'd.ts'].map(
    extension => `retention.${extension}`,
  );
  for (const file of outputs) write(file, `sentinel:${file}`);
  for (const check of [false, true]) {
    await expect(
      themeBuild(file, {check}, {cwd: directory}),
    ).rejects.toMatchObject({code});
    for (const file of outputs)
      expect(fs.readFileSync(path.join(directory, file), 'utf8')).toBe(
        `sentinel:${file}`,
      );
  }
}
describe('actual selected Icon metadata retention', () => {
  it('captures fixed native CJS input with only two constructors and no optional adaptation compiler', async () => {
    write(
      'plain.cjs',
      "const {defineTheme}=require('@astryxdesign/core/theme');module.exports=defineTheme({name:'retention',tokens:{'--color-accent':'#123456'}});",
    );
    write(
      'source.mjs',
      "import theme from './plain.cjs';export default theme;",
    );
    expect((await themeBuild('source.mjs', {}, {cwd: directory}))?.type).toBe(
      'theme.build',
    );
    expect(
      (await themeBuild('source.mjs', {check: true}, {cwd: directory}))?.data
        .upToDate,
    ).toBe(true);
  });
  it('does not reject a fixed, policy-free theme for missing optional exports', async () => {
    write(
      'source.mjs',
      "import {defineTheme} from '@astryxdesign/core/theme';export default defineTheme({name:'plain-retention',tokens:{'--color-accent':'#123456'}});",
    );
    expect((await themeBuild('source.mjs', {}, {cwd: directory}))?.type).toBe(
      'theme.build',
    );
  });
  it('fails an erasing Theme even when the two constructors return the exact bound witness', async () => {
    write(
      'source.mjs',
      "import {defineTheme} from '@astryxdesign/core/theme';export default defineTheme({name:'retention',tokens:{'--color-accent':'#123456'},iconCapabilities:{presentation:{default:{weight:525.5}}}});",
    );
    await rejectsWithoutWrites('source.mjs', 'ERR_CORE_INCOMPATIBLE');
  });
  it.each(['default', 'bySize', 'sizeOverrides'])(
    'rejects partial %s erasure with real admitted contract and retained metadata',
    async field => {
      erasure.mode = field;
      write(
        'source.mjs',
        "import {defineTheme} from '@astryxdesign/core/theme';import {defineIconCapabilities} from '@astryxdesign/core/Icon';const contract=defineIconCapabilities({weights:{range:{min:100,max:900}}});export default defineTheme({name:'retention',tokens:{'--color-accent':'#123456'},iconCapabilities:{contract,sizeOverrides:{sm:'31px'},presentation:{default:{weight:525.5},bySize:{sm:{weight:700.25}}}}});",
      );
      await rejectsWithoutWrites('source.mjs', 'ERR_CORE_INCOMPATIBLE');
    },
  );
  it.each([
    'componentIcons:undefined',
    'componentIcons:{}',
    'iconCapabilities:{roleSizeOverrides:{}}',
    'iconCapabilities:{presentation:{byState:{}}}',
  ])(
    'rejects captured unsupported %s before erased data can reach output',
    async field => {
      write(
        'source.mjs',
        `import {defineTheme} from '@astryxdesign/core/theme';export default defineTheme({name:'retention',tokens:{'--color-accent':'#123456'},${field}});`,
      );
      await rejectsWithoutWrites('source.mjs', 'ERR_THEME_INVALID');
    },
  );
  it('retains forbidden ancestor evidence through spreads and a selected child', async () => {
    write(
      'source.mjs',
      "import {defineTheme} from '@astryxdesign/core/theme';const parent=defineTheme({name:'ancestor',componentIcons:{}});export default {...defineTheme({name:'retention',extends:{...parent},tokens:{'--color-accent':'#123456'}})};",
    );
    await rejectsWithoutWrites('source.mjs', 'ERR_THEME_INVALID');
  });
});
