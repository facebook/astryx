// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Native role/state policy artifact parity without component enrollment.
 * @input Selected source/raw/built/family themes and importable artwork contributors.
 * @output Map/null/atomic-policy parity, complete contributor identity and pre-write rejection.
 * @position CLI C integration tests; require fresh workspace Core output, never public resolver plumbing.
 */
import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {themeBuild, themeBuildFamily} from './build.mjs';

let directory;
beforeEach(() => {
  directory = fs.mkdtempSync(
    path.join(import.meta.dirname, '.tmp-icon-role-state-'),
  );
  write('package.json', '{"type":"module"}\n');
  // Shared dependency storage must not select another worktree's compiled Core.
  const coreRoot = path.resolve(import.meta.dirname, '../../../../core');
  const scope = path.join(directory, 'node_modules', '@astryxdesign');
  fs.mkdirSync(scope, {recursive: true});
  fs.symlinkSync(coreRoot, path.join(scope, 'core'), 'dir');
  expect(
    createRequire(path.join(directory, 'package.json')).resolve(
      '@astryxdesign/core/Icon',
    ),
  ).toBe(path.join(coreRoot, 'dist/Icon/index.js'));
});
afterEach(() => fs.rmSync(directory, {recursive: true, force: true}));
function write(file, source) {
  fs.writeFileSync(path.join(directory, file), source);
}
function native(code) {
  return JSON.parse(
    execFileSync(process.execPath, ['--input-type=module', '--eval', code], {
      cwd: directory,
      encoding: 'utf8',
      timeout: 15000,
      env: {...process.env, NODE_ENV: 'development'},
    }),
  );
}
async function build(file, options = {}) {
  const receipt = await themeBuild(file, options, {cwd: directory});
  expect(receipt?.type).toBe(
    options.check ? 'theme.build.check' : 'theme.build',
  );
  expect(receipt?.data.warnings ?? []).toEqual([]);
  if (options.check) expect(receipt.data.upToDate).toBe(true);
  return receipt;
}
function fixture() {
  write(
    'icons.mjs',
    `import {createElement} from 'react';
import {defineIconCapabilities,defineAdaptiveIcon} from '@astryxdesign/core/Icon';
export const artworkContract=defineIconCapabilities({sizes:{compact:{default:'16px'},roomy:{default:'28px'}},appearances:['outline','filled'],weights:{values:[400,600]}});
export const baseContract=defineIconCapabilities({sizes:{spacious:{default:'32px'}},appearances:['duotone'],weights:{range:{min:100,max:900}}});
export const childContract=defineIconCapabilities({sizes:{policy:{default:'40px'}},appearances:['policy-only']});
const svg=label=>createElement('svg',{'data-icon':label},createElement('path',{d:'M0 0h1'}));
export const icons={close:defineAdaptiveIcon(artworkContract,{default:svg('close'),bySize:{compact:{default:svg('compact'),byAppearance:{filled:{default:svg('compact-filled'),byWeight:{600:svg('compact-filled-600')}}}},roomy:{default:svg('roomy')}}}),menu:svg('menu')};
export const childIcons={close:defineAdaptiveIcon(childContract,{default:svg('child-close')})};`,
  );
  write(
    'base.mjs',
    `import {defineTheme} from '@astryxdesign/core/theme';import {icons,baseContract} from './icons.mjs';
export default defineTheme({name:'role-base',tokens:{'--color-accent':'#123456'},icons,componentIcons:{'fixture-leading':'close','fixture-trailing':'menu','fixture-fallback':undefined},iconCapabilities:{contract:baseContract,sizeOverrides:{compact:'17px'},roleSizeOverrides:{'fixture-leading':'compact','fixture-trailing':'spacious'},presentation:{default:{appearance:'filled',weight:400},bySize:{compact:{weight:600}},byState:{busy:{appearance:'duotone'},active:{appearance:'outline'}}}}});`,
  );
  const childFields = `icons:childIcons,componentIcons:{'fixture-leading':null,'fixture-trailing':undefined},iconCapabilities:{contract:childContract,roleSizeOverrides:{'fixture-leading':null,'fixture-trailing':undefined,'fixture-extra':'policy'},presentation:{default:{weight:525.5},bySize:{spacious:{weight:600}},byState:{busy:{appearance:'filled'}}}}`;
  write(
    'source-child.mjs',
    `import {defineTheme} from '@astryxdesign/core/theme';import base from './base.mjs';import {childIcons,childContract} from './icons.mjs';export default defineTheme({name:'role-source-child',extends:base,${childFields}});`,
  );
  write(
    'built-child.mjs',
    `import {defineTheme} from '@astryxdesign/core/theme';import {roleBaseTheme as base} from './role-base.js';import {childIcons,childContract} from './icons.mjs';export default defineTheme({name:'role-built-child',extends:base,${childFields}});`,
  );
  write(
    'grandchild.mjs',
    `import {defineTheme} from '@astryxdesign/core/theme';import {roleBuiltChildTheme as base} from './role-built-child.js';export default defineTheme({name:'role-grandchild',extends:base,componentIcons:{'fixture-leading':'menu','fixture-trailing':null},iconCapabilities:{roleSizeOverrides:{'fixture-leading':'roomy','fixture-extra':null},presentation:null}});`,
  );
}
const compare = `
import assert from 'node:assert/strict';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {Theme} from '@astryxdesign/core/theme';
import {Icon} from '@astryxdesign/core/Icon';
import {artworkContract,baseContract,childContract} from './icons.mjs';
const warnings=[];console.warn=message=>warnings.push(message);
const expectedWarnings=new Set(['Icon: Supplied artwork does not support size; using its safe default.','Icon: Supplied artwork does not support appearance; using its safe default.','Icon: Supplied artwork does not support weight; using its safe default.']);
function snapshot(theme){return {componentIcons:theme.componentIcons,iconCapabilities:theme.iconCapabilities,contracts:theme.__iconContracts};}
function render(theme){const html=renderToStaticMarkup(createElement(Theme,{theme},createElement(Icon,{icon:'close',size:'compact',appearance:'filled',weight:600}))).replace(/<style\\b[^>]*>[\\s\\S]*?<\\/style>/gu,'').replace(/data-astryx-theme="[^"]*"/gu,'data-astryx-theme="theme"');for(const warning of warnings)assert.ok(expectedWarnings.has(warning),'unexpected public Icon warning: '+warning);return html;}
function equivalent(source,built){assert.deepEqual(snapshot(source),snapshot(built));assert.equal(render(source),render(built));for(const name of Object.keys(source.__iconSources??{})){const one=source.__iconSources[name],two=built.__iconSources[name];if(one?.capabilities){assert.equal(one.capabilities,two.capabilities);assert.deepEqual(one.tree,two.tree);}else assert.deepEqual(one,two);}}
function contributors(theme,child=false){assert.ok(theme.__iconContracts.includes(artworkContract));assert.ok(theme.__iconContracts.includes(baseContract));if(child)assert.ok(theme.__iconContracts.includes(childContract));}
`;

async function rejectsWithoutWrites(file, family = false) {
  const stem = family ? 'invalid-family' : 'role-invalid';
  const outputs = ['css', 'css.d.ts', 'js', 'd.ts'].map(
    extension => `${stem}.${extension}`,
  );
  for (const output of outputs) write(output, `sentinel:${output}`);
  const before = fs.readdirSync(directory).sort();
  for (const check of [false, true]) {
    const result = family
      ? themeBuildFamily(
          ['good.mjs', file],
          {familyKey: stem, check},
          {cwd: directory},
        )
      : themeBuild(file, {check}, {cwd: directory});
    await expect(result).rejects.toMatchObject({code: 'ERR_THEME_INVALID'});
    expect(fs.readdirSync(directory).sort()).toEqual(before);
    for (const output of outputs)
      expect(fs.readFileSync(path.join(directory, output), 'utf8')).toBe(
        `sentinel:${output}`,
      );
  }
}

describe('native role/state field parity', () => {
  it('preserves standalone, extended-source, extending-built and extended-built data with all contributor lineage', async () => {
    fixture();
    for (const file of [
      'base.mjs',
      'source-child.mjs',
      'built-child.mjs',
      'grandchild.mjs',
    ]) {
      await build(file);
      await build(file, {check: true});
    }
    const before = native(
      compare +
        `
import base from './base.mjs';import sourceChild from './source-child.mjs';import builtChild from './built-child.mjs';import grandchild from './grandchild.mjs';
import {roleBaseTheme as baseBuilt} from './role-base.js';import {roleSourceChildTheme as sourceChildBuilt} from './role-source-child.js';import {roleBuiltChildTheme as builtChildBuilt} from './role-built-child.js';import {roleGrandchildTheme as grandchildBuilt} from './role-grandchild.js';
for(const [source,built] of [[base,baseBuilt],[sourceChild,sourceChildBuilt],[builtChild,builtChildBuilt],[grandchild,grandchildBuilt]])equivalent(source,built);
assert.deepEqual(snapshot(sourceChild),snapshot(builtChild));
assert.equal(builtChildBuilt.componentIcons['fixture-leading'],null);assert.equal(builtChildBuilt.componentIcons['fixture-trailing'],'menu');
assert.equal(builtChildBuilt.iconCapabilities.roleSizeOverrides['fixture-leading'],null);assert.equal(builtChildBuilt.iconCapabilities.roleSizeOverrides['fixture-trailing'],'spacious');
assert.equal(builtChildBuilt.iconCapabilities.presentation.byState.active,undefined);assert.equal(builtChildBuilt.iconCapabilities.presentation.default.appearance,undefined);
assert.equal(grandchildBuilt.iconCapabilities.presentation,null);assert.equal(grandchildBuilt.componentIcons['fixture-trailing'],null);assert.equal(grandchildBuilt.iconCapabilities.roleSizeOverrides['fixture-extra'],null);
contributors(baseBuilt);contributors(sourceChildBuilt,true);contributors(builtChildBuilt,true);contributors(grandchildBuilt,true);
console.log(JSON.stringify([baseBuilt,sourceChildBuilt,builtChildBuilt,grandchildBuilt].map(snapshot)));`,
    );
    for (const file of [
      'base.mjs',
      'source-child.mjs',
      'built-child.mjs',
      'grandchild.mjs',
    ])
      fs.rmSync(path.join(directory, file));
    expect(
      native(
        compare +
          `import {roleBaseTheme as base} from './role-base.js';import {roleSourceChildTheme as sourceChild} from './role-source-child.js';import {roleBuiltChildTheme as child} from './role-built-child.js';import {roleGrandchildTheme as grandchild} from './role-grandchild.js';contributors(base);for(const theme of [sourceChild,child,grandchild])contributors(theme,true);console.log(JSON.stringify([base,sourceChild,child,grandchild].map(snapshot)));`,
      ),
    ).toEqual(before);
    write(
      'post-delete.mjs',
      `import {defineTheme} from '@astryxdesign/core/theme';import {roleGrandchildTheme as base} from './role-grandchild.js';export default defineTheme({name:'role-post-delete',extends:base,componentIcons:{'fixture-leading':null},iconCapabilities:{roleSizeOverrides:{'fixture-leading':null}}});`,
    );
    await build('post-delete.mjs');
    await build('post-delete.mjs', {check: true});
    expect(
      native(
        compare +
          `import {rolePostDeleteTheme as theme} from './role-post-delete.js';contributors(theme,true);assert.equal(theme.componentIcons['fixture-leading'],null);assert.equal(theme.iconCapabilities.roleSizeOverrides['fixture-leading'],null);assert.equal(theme.iconCapabilities.presentation,null);console.log(JSON.stringify({parity:true}));`,
      ),
    ).toEqual({parity: true});
    for (const file of [
      'role-base.js',
      'role-source-child.js',
      'role-built-child.js',
      'role-grandchild.js',
      'role-post-delete.js',
    ]) {
      const generated = fs.readFileSync(path.join(directory, file), 'utf8');
      expect(generated).not.toMatch(
        /from ['"]\.\/(?:base|source-child|built-child|grandchild)\.mjs['"]/u,
      );
      expect(generated).not.toMatch(
        /resolveIcon|inspectIcon|declareComponentIconRole|normalizeIconThemeCapabilities/u,
      );
    }
  });
  it('preserves selected family policies and contributor identities after theme-source deletion', async () => {
    fixture();
    const receipt = await themeBuildFamily(
      ['base.mjs', 'source-child.mjs'],
      {familyKey: 'role-family'},
      {cwd: directory},
    );
    expect(receipt?.type).toBe('theme.build');
    expect(receipt?.data.warnings ?? []).toEqual([]);
    expect(
      (
        await themeBuildFamily(
          ['base.mjs', 'source-child.mjs'],
          {familyKey: 'role-family', check: true},
          {cwd: directory},
        )
      )?.data.upToDate,
    ).toBe(true);
    const before = native(
      compare +
        `import base from './base.mjs';import child from './source-child.mjs';import {roleBaseTheme as baseBuilt,roleSourceChildTheme as childBuilt} from './role-family.js';equivalent(base,baseBuilt);equivalent(child,childBuilt);contributors(baseBuilt);contributors(childBuilt,true);console.log(JSON.stringify([baseBuilt,childBuilt].map(snapshot)));`,
    );
    fs.rmSync(path.join(directory, 'base.mjs'));
    fs.rmSync(path.join(directory, 'source-child.mjs'));
    expect(
      native(
        compare +
          `import {roleBaseTheme as base,roleSourceChildTheme as child} from './role-family.js';contributors(base);contributors(child,true);console.log(JSON.stringify([base,child].map(snapshot)));`,
      ),
    ).toEqual(before);
    write(
      'family-extension.mjs',
      `import {defineTheme} from '@astryxdesign/core/theme';import {roleSourceChildTheme as base} from './role-family.js';export default defineTheme({name:'role-family-extension',extends:base,componentIcons:{'fixture-leading':'menu'},iconCapabilities:{roleSizeOverrides:{'fixture-leading':'roomy'},presentation:{byState:{active:{appearance:'outline'}}}}});`,
    );
    await build('family-extension.mjs');
    await build('family-extension.mjs', {check: true});
    expect(
      native(
        compare +
          `import source from './family-extension.mjs';import {roleFamilyExtensionTheme as built} from './role-family-extension.js';equivalent(source,built);contributors(built,true);assert.deepEqual(built.iconCapabilities.presentation,{byState:{active:{appearance:'outline'}}});console.log(JSON.stringify({parity:true}));`,
      ),
    ).toEqual({parity: true});
  });
  it('preserves componentIcons-only input, empty maps and post-capture map/policy spreads without adding fields to plain themes', async () => {
    write(
      'source.mjs',
      `import {defineTheme} from '@astryxdesign/core/theme';const base=defineTheme({name:'role-map',tokens:{'--color-accent':'#123456'},componentIcons:{'fixture-leading':'close'}});export default {...base,componentIcons:{'fixture-leading':null,'fixture-fallback':undefined}};`,
    );
    await build('source.mjs');
    await build('source.mjs', {check: true});
    expect(
      native(
        `import source from './source.mjs';import {roleMapTheme as built} from './role-map.js';console.log(JSON.stringify({same:JSON.stringify(source.componentIcons)===JSON.stringify(built.componentIcons),cleared:built.componentIcons['fixture-leading']===null,capabilities:built.iconCapabilities!==undefined}));`,
      ),
    ).toEqual({same: true, cleared: true, capabilities: false});
    for (const [name, fields] of [
      ['role-empty', 'componentIcons:{}'],
      ['role-plain', ''],
    ]) {
      write(
        'source.mjs',
        `export default {name:'${name}',tokens:{'--color-accent':'#123456'},${fields}};`,
      );
      await build('source.mjs');
      const generated = fs.readFileSync(
        path.join(directory, `${name}.js`),
        'utf8',
      );
      expect(generated.includes('componentIcons:')).toBe(name === 'role-empty');
      expect(generated).not.toMatch(/roleSizeOverrides|byState/u);
    }
  });
  it('normalizes hidden own-data fields into lossless enumerable built maps', async () => {
    write(
      'source.mjs',
      `import {defineTheme} from '@astryxdesign/core/theme';import {defineIconCapabilities} from '@astryxdesign/core/Icon';const contract=defineIconCapabilities({appearances:['filled']});const componentIcons=Object.defineProperty({},'fixture-leading',{value:'close'});const roleSizeOverrides=Object.defineProperty({},'fixture-leading',{value:'sm'});const byState=Object.defineProperty({},'active',{value:Object.defineProperty({},'appearance',{value:'filled'})});const input={name:'role-hidden',tokens:{'--color-accent':'#123456'},componentIcons};Object.defineProperty(input,'iconCapabilities',{value:{contract,roleSizeOverrides,presentation:{byState}}});export default defineTheme(input);`,
    );
    await build('source.mjs');
    await build('source.mjs', {check: true});
    expect(
      native(
        `import assert from 'node:assert/strict';import source from './source.mjs';import {roleHiddenTheme as built} from './role-hidden.js';assert.deepEqual(source.componentIcons,built.componentIcons);assert.deepEqual(source.iconCapabilities,built.iconCapabilities);assert.equal(Object.getOwnPropertyDescriptor(built.iconCapabilities.presentation.byState.active,'appearance').enumerable,true);console.log(JSON.stringify({parity:true}));`,
      ),
    ).toEqual({parity: true});
  });
  it('omits optional undefined states across source, built extensions and family artifacts without per-key inheritance', async () => {
    write(
      'base.mjs',
      `import {defineTheme} from '@astryxdesign/core/theme';import {defineIconCapabilities} from '@astryxdesign/core/Icon';const contract=defineIconCapabilities({appearances:['filled']});export default defineTheme({name:'state-optional-base',tokens:{'--color-accent':'#123456'},iconCapabilities:{contract,presentation:{byState:{selected:{appearance:'filled'},busy:undefined}}}});`,
    );
    write(
      'child.mjs',
      `import {defineTheme} from '@astryxdesign/core/theme';import base from './base.mjs';export default defineTheme({name:'state-optional-child',extends:base,iconCapabilities:{presentation:{byState:{selected:undefined,busy:{appearance:'filled'}}}}});`,
    );
    await build('base.mjs');
    await build('child.mjs');
    write(
      'built-child.mjs',
      `import {defineTheme} from '@astryxdesign/core/theme';import {stateOptionalBaseTheme as base} from './state-optional-base.js';export default defineTheme({name:'state-optional-built-child',extends:base,iconCapabilities:{presentation:{byState:{selected:undefined,busy:{appearance:'filled'}}}}});`,
    );
    await build('built-child.mjs');
    for (const file of ['base.mjs', 'child.mjs', 'built-child.mjs'])
      await build(file, {check: true});
    await themeBuildFamily(
      ['base.mjs', 'child.mjs'],
      {familyKey: 'state-optional-family'},
      {cwd: directory},
    );
    expect(
      (
        await themeBuildFamily(
          ['base.mjs', 'child.mjs'],
          {familyKey: 'state-optional-family', check: true},
          {cwd: directory},
        )
      )?.data.upToDate,
    ).toBe(true);
    const code = `import assert from 'node:assert/strict';import {stateOptionalBaseTheme as base} from './state-optional-base.js';import {stateOptionalChildTheme as child} from './state-optional-child.js';import {stateOptionalBuiltChildTheme as builtChild} from './state-optional-built-child.js';import {stateOptionalBaseTheme as familyBase,stateOptionalChildTheme as familyChild} from './state-optional-family.js';assert.deepEqual(base.iconCapabilities.presentation,{byState:{selected:{appearance:'filled'}}});for(const theme of [child,builtChild,familyChild]){assert.deepEqual(theme.iconCapabilities.presentation,{byState:{busy:{appearance:'filled'}}});assert.equal(Object.hasOwn(theme.iconCapabilities.presentation.byState,'selected'),false);}assert.deepEqual(familyBase.iconCapabilities,base.iconCapabilities);`;
    expect(
      native(
        code +
          `import baseSource from './base.mjs';import childSource from './child.mjs';assert.deepEqual(baseSource.iconCapabilities,base.iconCapabilities);assert.deepEqual(childSource.iconCapabilities,child.iconCapabilities);console.log(JSON.stringify({parity:true}));`,
      ),
    ).toEqual({parity: true});
    for (const file of ['base.mjs', 'child.mjs', 'built-child.mjs'])
      fs.rmSync(path.join(directory, file));
    expect(
      native(code + `console.log(JSON.stringify({parity:true}));`),
    ).toEqual({parity: true});
  });
  it('admits source policy before any role declaration is imported', async () => {
    write(
      'source.mjs',
      `import {defineTheme} from '@astryxdesign/core/theme';import {defineIconCapabilities} from '@astryxdesign/core/Icon';const contract=defineIconCapabilities({appearances:['filled']});export default defineTheme({name:'role-late',tokens:{'--color-accent':'#123456'},componentIcons:{'not-yet-declared-leading':'close'},iconCapabilities:{contract,roleSizeOverrides:{'not-yet-declared-leading':'sm'},presentation:{byState:{'not-yet-declared-state':{appearance:'filled'}}}}});`,
    );
    await build('source.mjs');
    await build('source.mjs', {check: true});
  });
});

describe('role/state invalid-intent fail-before-write sentinels', () => {
  const fields = [
    ['component-map', `componentIcons:{'fixture-leading':'library:close'}`],
    ['shared-name', `componentIcons:{'fixture-leading':'notAnIcon'}`],
    [
      'role-size-shape',
      `iconCapabilities:{roleSizeOverrides:{'fixture-leading':16}}`,
    ],
    [
      'role-size-membership',
      `iconCapabilities:{roleSizeOverrides:{'fixture-leading':'notAdmitted'}}`,
    ],
    [
      'state-weight',
      `iconCapabilities:{presentation:{byState:{active:{weight:600}}}}`,
    ],
    [
      'state-weight-undefined',
      `iconCapabilities:{presentation:{byState:{active:{weight:undefined}}}}`,
    ],
    ['state-null', `iconCapabilities:{presentation:{byState:{active:null}}}`],
    [
      'state-accessor',
      `iconCapabilities:{presentation:{byState:{active:Object.defineProperty({},'appearance',{enumerable:true,get(){fs.writeFileSync(new URL('./getter-called',import.meta.url),'called');return 'filled';}})}}}`,
    ],
    [
      'state-appearance',
      `iconCapabilities:{presentation:{byState:{active:{appearance:'notAdmitted'}}}}`,
    ],
  ];
  it.each(
    fields.flatMap(([field, input]) =>
      ['selected', 'raw', 'inherited', 'spread', 'built'].map(form => [
        field,
        form,
        input,
      ]),
    ),
  )(
    'rejects %s in %s data before standalone build/check writes',
    async (_field, form, input) => {
      const bad = `{name:'role-invalid',tokens:{'--color-accent':'#123456'},${input}}`;
      let source;
      if (form === 'selected')
        source =
          _field === 'state-accessor'
            ? `const selected={...defineTheme({name:'role-invalid',tokens:{'--color-accent':'#123456'}})};Object.defineProperty(selected,'iconCapabilities',{value:(${bad}).iconCapabilities});export default selected;`
            : `export default defineTheme(${bad});`;
      if (form === 'raw') source = `export default ${bad};`;
      if (form === 'inherited')
        source = `const parent={...${bad},__built:true,__axes:{}};export default {name:'role-invalid',tokens:{'--color-accent':'#123456'},extends:parent,iconCapabilities:{presentation:null}};`;
      if (form === 'spread')
        source = `const parent=defineTheme({name:'role-invalid',tokens:{'--color-accent':'#123456'}});export default {...parent,...${bad}};`;
      if (form === 'built')
        source = `export default {...${bad},__built:true,__axes:{}};`;
      write(
        'source.mjs',
        `import * as fs from 'node:fs';import {defineTheme} from '@astryxdesign/core/theme';${source}`,
      );
      await rejectsWithoutWrites('source.mjs');
    },
  );
  it.each(fields)(
    'rejects %s in a family before replacing any artifact',
    async (_field, input) => {
      write(
        'good.mjs',
        `export default {name:'role-good',tokens:{'--color-accent':'#123456'}};`,
      );
      write(
        'source.mjs',
        `import * as fs from 'node:fs';export default {name:'role-invalid',tokens:{'--color-accent':'#123456'},${input},__built:true,__axes:{}};`,
      );
      await rejectsWithoutWrites('source.mjs', true);
    },
  );
});
