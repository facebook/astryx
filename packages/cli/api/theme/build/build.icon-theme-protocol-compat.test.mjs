// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Selected Theme metadata erasure and unsupported intent guards.
 * @input Two real constructors and Theme normalizers that erase A or individual role/state fields.
 * @output Early build/check failure with untouched outputs, including cleared selected ancestors.
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
      if (erasure.mode === 'componentIcons') {
        const {componentIcons: _mapping, ...rest} = theme;
        return rest;
      }
      if (
        erasure.mode === 'sizeOverrides' ||
        erasure.mode === 'roleSizeOverrides'
      )
        delete policy[erasure.mode];
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
    'componentIcons:{}',
    'componentIcons:{"fixture-leading":"close"}',
    'iconCapabilities:{roleSizeOverrides:{}}',
    'iconCapabilities:{roleSizeOverrides:{"fixture-leading":"sm"}}',
    'iconCapabilities:{presentation:{byState:{}}}',
  ])(
    'rejects captured role/state %s even when the constructor witness passes',
    async field => {
      write(
        'source.mjs',
        `import {defineTheme} from '@astryxdesign/core/theme';export default defineTheme({name:'retention',tokens:{'--color-accent':'#123456'},${field}});`,
      );
      await rejectsWithoutWrites('source.mjs', 'ERR_CORE_INCOMPATIBLE');
    },
  );
  it.each(
    ['componentIcons', 'roleSizeOverrides', 'byState'].flatMap(field =>
      [
        'selected',
        'raw',
        'inherited',
        'inherited-cleared',
        'spread',
        'built',
      ].map(form => [field, form]),
    ),
  )(
    'rejects partial %s erasure in %s data despite capability-aware constructors',
    async (field, form) => {
      erasure.mode = field;
      const input = `name:'retention',tokens:{'--color-accent':'#123456'},componentIcons:{'fixture-leading':'close'},iconCapabilities:{contract,sizeOverrides:{sm:'31px'},roleSizeOverrides:{'fixture-leading':'sm'},presentation:{default:{weight:525.5},bySize:{sm:{weight:700.25}},byState:{active:{appearance:'filled'}}}}`;
      let source;
      if (form === 'selected')
        source = `export default defineTheme({${input}});`;
      if (form === 'raw') source = `export default {${input}};`;
      if (form === 'inherited')
        source = `const parent=defineTheme({${input}});export default defineTheme({name:'retention',extends:parent});`;
      if (form === 'inherited-cleared')
        source = `const parent=defineTheme({${input}});export default defineTheme({name:'retention',extends:parent,componentIcons:{'fixture-leading':null},iconCapabilities:{roleSizeOverrides:{'fixture-leading':null},presentation:null}});`;
      if (form === 'spread')
        source = `const parent=defineTheme({${input}});export default {...parent};`;
      if (form === 'built')
        source = `export default {${input},__built:true,__axes:{}};`;
      write(
        'source.mjs',
        `import {defineTheme} from '@astryxdesign/core/theme';import {defineIconCapabilities} from '@astryxdesign/core/Icon';const contract=defineIconCapabilities({appearances:['outline','filled'],weights:{range:{min:100,max:900}}});${source}`,
      );
      await rejectsWithoutWrites('source.mjs', 'ERR_CORE_INCOMPATIBLE');
    },
  );
  it('retains forbidden ancestor evidence through spreads and a selected child', async () => {
    write(
      'source.mjs',
      "import {defineTheme} from '@astryxdesign/core/theme';const parent=defineTheme({name:'ancestor',componentIcons:{'fixture-leading':'library:mark'}});export default {...defineTheme({name:'retention',extends:{...parent},tokens:{'--color-accent':'#123456'}})};",
    );
    await rejectsWithoutWrites('source.mjs', 'ERR_THEME_INVALID');
  });
});
