// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Native direct-adapter parity across source and portable theme artifacts.
 * @input An importable adapter library and the actual built public Icon package.
 * @output Supplied defaults, mapped fractional requests, shared contract identity and source deletion safety.
 * @position Focused draft B artifact evidence; does not introduce CLI production or resolver APIs.
 */
import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import {execFileSync} from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {themeBuild} from './build.mjs';

let directory;
beforeEach(() => {
  directory = fs.mkdtempSync(
    path.join(import.meta.dirname, '.tmp-icon-adapter-'),
  );
  write('package.json', '{"type":"module"}\n');
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
function outputs(name) {
  return ['css', 'css.d.ts', 'js', 'd.ts'].map(
    extension => `${name}.${extension}`,
  );
}
function contents(name) {
  return outputs(name).map(file =>
    fs.readFileSync(path.join(directory, file), 'utf8'),
  );
}
async function build(file, name) {
  const receipt = await themeBuild(file, {}, {cwd: directory});
  expect(receipt?.type).toBe('theme.build');
  expect(receipt?.data.warnings ?? []).toEqual([]);
  const before = contents(name);
  const checked = await themeBuild(file, {check: true}, {cwd: directory});
  expect(checked?.type).toBe('theme.build.check');
  expect(checked?.data.upToDate).toBe(true);
  expect(checked?.data.warnings ?? []).toEqual([]);
  expect(contents(name)).toEqual(before);
}
function fixture() {
  write(
    'adapter-library.mjs',
    `
import {createElement} from 'react';
import {createIconAdapter,defineIconCapabilities} from '@astryxdesign/core/Icon';
export const contract=defineIconCapabilities({sizes:{md:{default:'20px'},sm:{default:'16px'}},appearances:['outline','filled'],weights:{range:{min:100,max:900}}});
export const trace={rendering:false,requests:[]};
export function mapPresentation(request) {
  if(!trace.rendering) throw new Error('Adapter mapper must not execute during theme compilation.');
  trace.requests.push({...request});
  return {
    ...(request.appearance===undefined?{}:{nativeLibraryAppearance:request.appearance==='filled'?'library-filled':'library-outline'}),
    ...(request.weight===undefined?{}:{nativeLibraryWeight:request.weight}),
  };
}
export function LibraryIcon({nativeLibraryAppearance='library-default',nativeLibraryWeight=310.25,...svgProps}) {
  return createElement('svg',{...svgProps,'data-library-appearance':nativeLibraryAppearance,'data-library-weight':String(nativeLibraryWeight)},createElement('path',{d:'M0 0h1'}));
}
export const adapterFactory=createIconAdapter({capabilities:contract,propNames:['nativeLibraryAppearance','nativeLibraryWeight'],resolveProps:mapPresentation});
export const ProductIcon=adapterFactory(LibraryIcon);
export const ReusedProductIcon=adapterFactory(LibraryIcon);
export const fixedRegistry={menu:createElement('svg',{'data-fixed-artwork':'baseline'},createElement('path',{d:'M0 0h1'}))};
`,
  );
  write(
    'source-theme.mjs',
    `
import {defineTheme} from '@astryxdesign/core/theme';
import {contract,fixedRegistry} from './adapter-library.mjs';
export default defineTheme({name:'adapter-base',tokens:{'--color-accent':'#123456'},icons:fixedRegistry,iconCapabilities:{contract}});
`,
  );
}
const renderers = `
import assert from 'node:assert/strict';
import {createElement,isValidElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {Theme} from '@astryxdesign/core/theme';
import {Icon,getIcon} from '@astryxdesign/core/Icon';
import {contract,adapterFactory,mapPresentation,LibraryIcon,ProductIcon,ReusedProductIcon,fixedRegistry,trace} from './adapter-library.mjs';
assert.equal(typeof adapterFactory,'function');
assert.equal(typeof mapPresentation,'function');
assert.equal(ProductIcon,ReusedProductIcon);
const warnings=[];
console.warn=(...messages)=>warnings.push(messages.map(String).join(' '));
function render(theme,component,request={}) {
  trace.requests.length=0;
  trace.rendering=true;
  try {
    const html=renderToStaticMarkup(createElement(Theme,{theme},createElement(Icon,{icon:component,label:'Adapter bridge','data-probe':'adapter-bridge',...request}))).replace(/<style\\b[^>]*>[\\s\\S]*?<\\/style>/gu,'');
    assert.ok(html.includes('data-probe="adapter-bridge"'));
    assert.ok(html.includes('aria-label="Adapter bridge"'));
    assert.doesNotMatch(html,/\\s(?:appearance|weight|size|capabilities|resolveProps|propNames)=/u);
    return {html,requests:trace.requests.map(value=>({...value}))};
  } finally {trace.rendering=false;}
}
function identity(theme) {
  assert.equal(theme.iconCapabilities.contract,contract);
  assert.equal(theme.__iconContracts.filter(value=>value===contract).length,1);
  assert.equal(getIcon('menu',theme),fixedRegistry.menu);
  assert.ok(isValidElement(getIcon('menu',theme)));
}
function selected(result,appearance,weight) {
  assert.equal(result.requests.length,1);
  assert.equal(result.requests[0].appearance,appearance);
  assert.equal(result.requests[0].weight,weight);
  assert.ok(result.html.includes('data-library-appearance="'+(appearance==='filled'?'library-filled':'library-outline')+'"'));
  assert.ok(result.html.includes('data-library-weight="'+String(weight)+'"'));
}
function snapshots(base,child) {
  identity(base);identity(child);
  const defaultFirst=render(base,ProductIcon);
  const defaultReused=render(base,ReusedProductIcon);
  assert.deepEqual(defaultFirst.requests,[]);
  assert.deepEqual(defaultReused.requests,[]);
  assert.equal(defaultFirst.html,render(base,LibraryIcon).html);
  assert.equal(defaultFirst.html,defaultReused.html);
  assert.ok(defaultFirst.html.includes('data-library-appearance="library-default"'));
  assert.ok(defaultFirst.html.includes('data-library-weight="310.25"'));
  const sizeOnly=render(base,ProductIcon,{size:'md'});
  assert.equal(sizeOnly.requests.length,1);
  assert.equal(sizeOnly.requests[0].size,'md');
  assert.equal(sizeOnly.html,defaultFirst.html);
  const explicit=render(base,ProductIcon,{appearance:'filled',weight:525.5});
  const reused=render(base,ReusedProductIcon,{appearance:'filled',weight:525.5});
  selected(explicit,'filled',525.5);selected(reused,'filled',525.5);
  assert.deepEqual(reused,explicit);
  const themeDefault=render(child,ProductIcon);
  const bySize=render(child,ProductIcon,{size:'sm'});
  const override=render(child,ProductIcon,{size:'sm',appearance:'filled',weight:625.75});
  selected(themeDefault,'outline',575.25);
  selected(bySize,'outline',700.25);
  selected(override,'filled',625.75);
  assert.deepEqual(warnings,[]);
  return {defaultFirst,defaultReused,sizeOnly,explicit,reused,themeDefault,bySize,override};
}
`;

describe('native direct-adapter theme artifacts', () => {
  it('preserves defaults, mapped requests and imported contracts after source/build/extension and source deletion', async () => {
    fixture();
    await build('source-theme.mjs', 'adapter-base');
    write(
      'extending-theme.mjs',
      `
import {defineTheme} from '@astryxdesign/core/theme';
import {adapterBaseTheme as base} from './adapter-base.js';
import {contract} from './adapter-library.mjs';
export default defineTheme({name:'adapter-child',extends:base,iconCapabilities:{contract,presentation:{default:{appearance:'outline',weight:575.25},bySize:{sm:{weight:700.25}}}}});
`,
    );
    await build('extending-theme.mjs', 'adapter-child');
    for (const name of ['adapter-base', 'adapter-child']) {
      const generated = fs.readFileSync(
        path.join(directory, `${name}.js`),
        'utf8',
      );
      expect(generated).toContain('./adapter-library.mjs');
      expect(generated).not.toContain('./source-theme.mjs');
      expect(generated).not.toContain('./extending-theme.mjs');
      expect(generated).not.toMatch(
        /function (?:LibraryIcon|mapPresentation)|createIconAdapter|Adapter mapper must not execute/u,
      );
    }
    const before = native(
      renderers +
        `
import source from './source-theme.mjs';
import extendingSource from './extending-theme.mjs';
import {adapterBaseTheme as built} from './adapter-base.js';
import {adapterChildTheme as extendingBuilt} from './adapter-child.js';
assert.deepEqual(snapshots(source,extendingSource),snapshots(built,extendingBuilt));
console.log(JSON.stringify(snapshots(built,extendingBuilt)));
`,
    );
    fs.rmSync(path.join(directory, 'source-theme.mjs'));
    fs.rmSync(path.join(directory, 'extending-theme.mjs'));
    expect(
      native(
        renderers +
          `
import {adapterBaseTheme as built} from './adapter-base.js';
import {adapterChildTheme as extendingBuilt} from './adapter-child.js';
console.log(JSON.stringify(snapshots(built,extendingBuilt)));
`,
      ),
    ).toEqual(before);
  });
  it('rejects invalid supported policy before build/check can touch existing artifacts', async () => {
    fixture();
    write(
      'invalid-theme.mjs',
      `
import {defineTheme} from '@astryxdesign/core/theme';
import {contract} from './adapter-library.mjs';
export default defineTheme({name:'adapter-invalid',tokens:{'--color-accent':'#123456'},iconCapabilities:{contract,presentation:{default:{weight:950.5}}}});
`,
    );
    for (const file of outputs('adapter-invalid'))
      write(file, 'sentinel:' + file);
    const beforeFiles = fs.readdirSync(directory).sort();
    const beforeContents = contents('adapter-invalid');
    for (const check of [false, true]) {
      await expect(
        themeBuild('invalid-theme.mjs', {check}, {cwd: directory}),
      ).rejects.toThrow();
      expect(fs.readdirSync(directory).sort()).toEqual(beforeFiles);
      expect(contents('adapter-invalid')).toEqual(beforeContents);
    }
  });
});
