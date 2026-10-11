// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file A-only native source, built, extending-built and family Icon parity.
 * @input Public Icon/getIcon rendering, sparse trees and supplied fractional renderers.
 * @output Imported identity, node-default snapshots, policy/null parity and unchanged CSS.
 * @position CLI artifact integration; requires freshly built workspace Core.
 */
import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import {execFileSync} from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {themeBuild, themeBuildFamily} from './build.mjs';

let directory;
beforeEach(() => {
  directory = fs.mkdtempSync(
    path.join(import.meta.dirname, '.tmp-icon-engine-'),
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
export const exactContract=defineIconCapabilities({sizes:{compact:{default:'16px'},roomy:{default:'28px'}},appearances:['outline','filled'],weights:{values:[400,600]}});
export const rangeContract=defineIconCapabilities({sizes:{wide:{default:'32px'}},appearances:['duotone'],weights:{range:{min:100,max:900}}});
export const policyContract=defineIconCapabilities({sizes:{policy:{default:'40px'}},appearances:['policy-only']});
const svg=label=>createElement('svg',{'data-icon':label},createElement('path',{d:'M0 0h1'}));
export function FractionalRenderer({weight}) {return svg('range:'+String(weight));}
export const fixed=svg('fixed');
export const bareTree={default:svg('root'),bySize:{compact:{default:svg('compact'),byAppearance:{filled:{default:svg('compact-filled'),byWeight:{600:svg('compact-filled-600')}}}},roomy:{default:svg('roomy'),byAppearance:{outline:{default:svg('roomy-outline')}}}}};
export const baseIcons={close:bareTree,menu:fixed,'library:mark':defineAdaptiveIcon(rangeContract,{default:{render:FractionalRenderer,weightRange:{min:200,max:800}},byAppearance:{duotone:{default:svg('duotone')}}})};
export const childIcons={close:defineAdaptiveIcon(rangeContract,{default:svg('child-root'),byAppearance:{duotone:{default:svg('child-duotone')}}})};`,
  );
  write(
    'base.mjs',
    `import {defineTheme} from '@astryxdesign/core/theme';import {baseIcons,exactContract} from './icons.mjs';export default defineTheme({name:'engine-base',tokens:{'--color-accent':'#123456'},icons:baseIcons,iconCapabilities:{contract:exactContract,sizeOverrides:{compact:'17px',roomy:'29px'},presentation:{default:{appearance:'filled',weight:400},bySize:{compact:{weight:600}}}}});`,
  );
}
const compare = `
import assert from 'node:assert/strict';
import {createElement,isValidElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {Theme} from '@astryxdesign/core/theme';
import {Icon,getIcon} from '@astryxdesign/core/Icon';
const warnings=[];
console.warn=(...messages)=>warnings.push(messages.map(String).join(' '));
function summary(node) {return isValidElement(node)?{type:typeof node.type==='function'?node.type.name:node.type,props:node.props}:node;}
function render(theme,name,request={}) {
 const start=warnings.length;
 const html=renderToStaticMarkup(createElement(Theme,{theme},createElement(Icon,{icon:name,...request}))).replace(/<style\\b[^>]*>[\\s\\S]*?<\\/style>/gu,'');
 // Source Theme injects CSS; a built Theme loads its separate stylesheet.
 // Compare the public Icon/provider markup, not CSS enrollment differences.
 return {html,warnings:warnings.slice(start)};
}
function equivalent(source,built) {
 assert.deepEqual(built.iconCapabilities,source.iconCapabilities);
 assert.deepEqual(built.__iconContracts,source.__iconContracts);
 for (const [name,requests] of Object.entries({close:[{},{size:'compact',appearance:'filled',weight:600},{size:'roomy',appearance:'filled',weight:600},{size:'wide',appearance:'duotone',weight:525.5}],menu:[{}],'library:mark':[{}, {weight:525.5},{appearance:'duotone',weight:525.5}]})) {
  assert.deepEqual(summary(getIcon(name,built)),summary(getIcon(name,source)));
  for (const request of requests) assert.equal(render(built,name,request).html,render(source,name,request).html);
 }
 for (const name of Object.keys(source.icons)) {
  assert.ok(isValidElement(built.icons[name]));
  assert.deepEqual(summary(built.icons[name]),summary(source.icons[name]));
 }
 const expectedWarnings=new Set(['Icon: Supplied artwork does not support size; using its safe default.','Icon: Supplied artwork does not support appearance; using its safe default.','Icon: Supplied artwork does not support weight; using its safe default.']);
 for (const warning of warnings) assert.ok(expectedWarnings.has(warning),'unexpected public Icon warning: '+warning);
}
`;

describe('A-only native Icon artifacts', () => {
  it('captures unsupported intent through native CJS require of ESM Core before build/check writes', async () => {
    write(
      'missed.cjs',
      "const {defineTheme}=require('@astryxdesign/core/theme');module.exports=defineTheme({name:'missed-icons',tokens:{'--color-accent':'#123456'},componentIcons:{}});",
    );
    write(
      'source.mjs',
      "import theme from './missed.cjs';export default theme;",
    );
    const outputs = ['css', 'css.d.ts', 'js', 'd.ts'].map(
      extension => `missed-icons.${extension}`,
    );
    for (const file of outputs) write(file, `sentinel:${file}`);
    const before = fs.readdirSync(directory).sort();
    for (const check of [false, true]) {
      await expect(
        themeBuild('source.mjs', {check}, {cwd: directory}),
      ).rejects.toMatchObject({code: 'ERR_THEME_INVALID'});
      expect(fs.readdirSync(directory).sort()).toEqual(before);
      for (const file of outputs)
        expect(fs.readFileSync(path.join(directory, file), 'utf8')).toBe(
          `sentinel:${file}`,
        );
    }
  });
  it('preserves a fixed raw native CJS factory without constructor or registration assumptions', async () => {
    write(
      'plain.cjs',
      "module.exports=(()=>({name:'plain-native',tokens:{'--color-accent':'#123456'}}))();",
    );
    write(
      'source.mjs',
      "import theme from './plain.cjs';export default theme;",
    );
    await build('source.mjs');
    await build('source.mjs', {check: true});
  });
  it('preserves an intentional post-capture policy spread instead of restoring the original request', async () => {
    write(
      'icons.mjs',
      "import {defineIconCapabilities} from '@astryxdesign/core/Icon';export const contract=defineIconCapabilities({weights:{range:{min:100,max:900}}});",
    );
    write(
      'source.mjs',
      "import {defineTheme} from '@astryxdesign/core/theme';import {contract} from './icons.mjs';const base=defineTheme({name:'spread-base',tokens:{'--color-accent':'#123456'},iconCapabilities:{contract,presentation:{default:{weight:525.5}}}});export default {...base,name:'spread-child',iconCapabilities:{...base.iconCapabilities,presentation:{default:{weight:700.25}}}};",
    );
    await build('source.mjs');
    await build('source.mjs', {check: true});
    const result = native(
      "import source from './source.mjs';import {spreadChildTheme as built} from './spread-child.js';console.log(JSON.stringify([source.iconCapabilities.presentation.default.weight,built.iconCapabilities.presentation.default.weight]));",
    );
    expect(result).toEqual([700.25, 700.25]);
  });
  it('preserves source/build/extension rendering, contract identity, fractional artwork and own defaults', async () => {
    fixture();
    await build('base.mjs');
    await build('base.mjs', {check: true});
    const generated = fs.readFileSync(
      path.join(directory, 'engine-base.js'),
      'utf8',
    );
    expect(generated).not.toContain("from './base.mjs'");
    expect(generated).not.toContain('function FractionalRenderer');
    expect(generated).not.toMatch(
      /componentIcons|roleSizeOverrides|byState|resolveIcon|inspectIcon/,
    );
    write(
      'child.mjs',
      `import {defineTheme} from '@astryxdesign/core/theme';import {engineBaseTheme as base} from './engine-base.js';import {childIcons,policyContract} from './icons.mjs';export default defineTheme({name:'engine-child',extends:base,icons:childIcons,iconCapabilities:{contract:policyContract,sizeOverrides:{compact:null},presentation:{default:{weight:525.5},bySize:{compact:{weight:600}}}}});`,
    );
    await build('child.mjs');
    await build('child.mjs', {check: true});
    expect(
      native(
        compare +
          `
import source from './base.mjs';import child from './child.mjs';
import {engineBaseTheme as built} from './engine-base.js';import {engineChildTheme as childBuilt} from './engine-child.js';
import {exactContract,rangeContract,policyContract,FractionalRenderer} from './icons.mjs';
equivalent(source,built);equivalent(child,childBuilt);
assert.equal(built.iconCapabilities.contract,exactContract);
assert.equal(built.__iconSources.close.capabilities,exactContract);
assert.equal(built.__iconSources['library:mark'].capabilities,rangeContract);
assert.equal(built.icons['library:mark'].type,FractionalRenderer);
assert.equal(Object.hasOwn(built.icons['library:mark'].props,'weight'),false);
assert.equal(childBuilt.iconCapabilities.contract,policyContract);
assert.ok(childBuilt.__iconContracts.includes(exactContract));
assert.ok(childBuilt.__iconContracts.includes(rangeContract));
assert.ok(childBuilt.__iconContracts.includes(policyContract));
assert.ok(render(built,'library:mark',{weight:525.5}).html.includes('range:525.5'));
assert.ok(render(built,'close',{size:'compact'}).html.includes('17px'));
console.log(JSON.stringify({parity:true}));`,
      ),
    ).toEqual({parity: true});
  });
  it('keeps family output self-contained and preserves each selected contributor', async () => {
    fixture();
    write(
      'family-child.mjs',
      `import {defineTheme} from '@astryxdesign/core/theme';import base from './base.mjs';import {childIcons,policyContract} from './icons.mjs';export default defineTheme({name:'engine-child',extends:base,icons:childIcons,iconCapabilities:{contract:policyContract,presentation:null}});`,
    );
    expect(
      (
        await themeBuildFamily(
          ['base.mjs', 'family-child.mjs'],
          {familyKey: 'engine-family'},
          {cwd: directory},
        )
      )?.type,
    ).toBe('theme.build');
    const generated = fs.readFileSync(
      path.join(directory, 'engine-family.js'),
      'utf8',
    );
    expect(generated).not.toContain("from './base.mjs'");
    expect(generated).not.toContain("from './family-child.mjs'");
    expect(
      native(
        compare +
          `import source from './base.mjs';import child from './family-child.mjs';import {engineBaseTheme as built,engineChildTheme as childBuilt} from './engine-family.js';equivalent(source,built);equivalent(child,childBuilt);console.log(JSON.stringify({parity:true}));`,
      ),
    ).toEqual({parity: true});
    fs.rmSync(path.join(directory, 'base.mjs'));
    fs.rmSync(path.join(directory, 'family-child.mjs'));
    expect(
      native(
        `import {engineChildTheme as built} from './engine-family.js';import {exactContract,rangeContract,policyContract} from './icons.mjs';console.log(JSON.stringify({exact:built.__iconContracts.includes(exactContract),range:built.__iconContracts.includes(rangeContract),policy:built.iconCapabilities.contract===policyContract}));`,
      ),
    ).toEqual({exact: true, range: true, policy: true});
  });
});
