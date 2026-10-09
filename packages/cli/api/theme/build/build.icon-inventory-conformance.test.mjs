// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Actual theme artifacts checked by the inventory conformance comparator.
 * @input Source, built and extending-built role/state policies from an importable library
 * @output Failures if mappings, role sizing or byState data disappear in the build
 * @position Existing native CLI build lane; uses fresh local Core, not a mock catalog
 */
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import {themeBuild} from './build.mjs';
import {assertIconPolicyParity} from '../../../../../scripts/lib/icon-role-inventory.mjs';

let directory;
beforeEach(() => {
  directory = fs.mkdtempSync(
    path.join(import.meta.dirname, '.tmp-inventory-conformance-'),
  );
  fs.writeFileSync(path.join(directory, 'package.json'), '{"type":"module"}');
  const core = path.resolve(import.meta.dirname, '../../../../core');
  const scope = path.join(directory, 'node_modules/@astryxdesign');
  fs.mkdirSync(scope, {recursive: true});
  fs.symlinkSync(core, path.join(scope, 'core'), 'dir');
  expect(
    createRequire(path.join(directory, 'package.json')).resolve(
      '@astryxdesign/core/Icon',
    ),
  ).toBe(path.join(core, 'dist/Icon/index.js'));
  write(
    'artwork.mjs',
    `import {createElement} from 'react';
import {defineIconCapabilities,defineAdaptiveIcon} from '@astryxdesign/core/Icon';
export const contract=defineIconCapabilities({appearances:['outline','filled']});
export const check=defineAdaptiveIcon(contract,{default:createElement('svg'),byAppearance:{filled:createElement('svg',{'data-filled':true})}});
export const icons={check};`,
  );
  write(
    'source.mjs',
    `import {defineTheme} from '@astryxdesign/core/theme';import {icons,contract} from './artwork.mjs';
export default defineTheme({name:'inventory-conformance',icons,componentIcons:{'inventory-action':'check'},iconCapabilities:{contract,roleSizeOverrides:{'inventory-action':'sm'},presentation:{default:{appearance:'outline'},byState:{busy:{appearance:'filled'}}}}});`,
  );
});
afterEach(() => fs.rmSync(directory, {recursive: true, force: true}));
function write(file, source) {
  fs.writeFileSync(path.join(directory, file), source);
}
async function build(file) {
  const result = await themeBuild(file, {}, {cwd: directory});
  expect(result.data.warnings).toEqual([]);
  const check = await themeBuild(file, {check: true}, {cwd: directory});
  expect(check.data.upToDate).toBe(true);
}
function native(code) {
  return JSON.parse(
    execFileSync(process.execPath, ['--input-type=module', '--eval', code], {
      cwd: directory,
      encoding: 'utf8',
      timeout: 15000,
    }),
  );
}
const snapshot = `const snapshot=theme=>({componentIcons:theme.componentIcons,iconCapabilities:{roleSizeOverrides:theme.iconCapabilities?.roleSizeOverrides,presentation:theme.iconCapabilities?.presentation}});`;
describe('inventory conformance on actual built policy', () => {
  it('preserves role-size/byState/mappings through source, built and extending built, even after source deletion', async () => {
    await build('source.mjs');
    const [source, built] = native(
      `import source from './source.mjs';import {inventoryConformanceTheme as built} from './inventory-conformance.js';${snapshot}console.log(JSON.stringify([source,built].map(snapshot)));`,
    );
    assertIconPolicyParity(source, built);
    expect(built.iconCapabilities.roleSizeOverrides).toEqual({
      'inventory-action': 'sm',
    });
    expect(built.iconCapabilities.presentation.byState).toEqual({
      busy: {appearance: 'filled'},
    });
    write(
      'extended.mjs',
      `import {defineTheme} from '@astryxdesign/core/theme';import {inventoryConformanceTheme as base} from './inventory-conformance.js';export default defineTheme({name:'inventory-extended',extends:base,iconCapabilities:{roleSizeOverrides:{'inventory-action':null}}});`,
    );
    await build('extended.mjs');
    const [extended, extendedBuilt] = native(
      `import source from './extended.mjs';import {inventoryExtendedTheme as built} from './inventory-extended.js';${snapshot}console.log(JSON.stringify([source,built].map(snapshot)));`,
    );
    assertIconPolicyParity(extended, extendedBuilt);
    expect(extendedBuilt.iconCapabilities.roleSizeOverrides).toEqual({
      'inventory-action': null,
    });
    fs.rmSync(path.join(directory, 'source.mjs'));
    fs.rmSync(path.join(directory, 'extended.mjs'));
    const after = native(
      `import {inventoryExtendedTheme as built} from './inventory-extended.js';${snapshot}console.log(JSON.stringify(snapshot(built)));`,
    );
    assertIconPolicyParity(extendedBuilt, after);
  });
});
