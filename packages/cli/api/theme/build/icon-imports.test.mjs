// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Static Icon provenance with exact captured input pointers.
 * @input Virtual module source graphs and observable normalized theme evidence.
 * @output Safe standalone references, complete overridden contributor plans and import spelling.
 * @position Pure CLI importer tests; no Core loading, build output or source execution.
 */
import {describe, expect, it} from 'vitest';
import * as path from 'node:path';
import {resolveIconImports} from './icon-imports.mjs';

async function resolve(modules, theme, inputs = new Map(), options = {}) {
  const directory = path.resolve('/virtual-icon-fixture');
  return resolveIconImports(path.join(directory, 'source.mjs'), 'default', {
    hasIcons: Object.keys(theme.__iconSources ?? theme.icons ?? {}).length > 0,
    theme,
    inputOf: value => inputs.get(value) ?? value,
    readSource: filename => {
      const source = modules[path.basename(filename)];
      if (!source) throw new Error(`Missing virtual module ${filename}`);
      return source;
    },
    resolveModule: (specifier, from) => {
      let filename = path.resolve(path.dirname(from), specifier);
      if (!path.extname(filename)) filename += '.mjs';
      return filename;
    },
    ...options,
  });
}

describe('standalone Icon contributor provenance', () => {
  it('never blesses a selected nested theme by proving an unrelated outer package export', async () => {
    const bad = {name: 'bad-selected', __axes: {}};
    const child = {name: 'child', __axes: {}};
    const iconFreeInputs = new Set();
    await resolve(
      {
        'source.mjs':
          "import {defineTheme} from '@astryxdesign/core/theme';import {holder} from '@fixture/parent';export default defineTheme({name:'child',extends:holder.tokens.bad});",
        'parent.mjs':
          "import {defineTheme} from '@astryxdesign/core/theme';const bad=defineTheme({name:'bad-selected',componentIcons:{}});export const holder=defineTheme({name:'holder',tokens:{bad}});",
      },
      child,
      new Map([[child, {extends: bad}]]),
      {iconFreeInputs},
    );
    expect(iconFreeInputs.has(bad)).toBe(false);
  });
  it.each([
    '',
    ',componentIcons:{}',
    ',iconCapabilities:{presentation:{default:{weight:525.5}}}',
    ',...unknown',
  ])(
    'proves only the exact Icon-free exported package input %s',
    async fields => {
      const parent = {name: 'foreign', __axes: {}};
      const theme = {name: 'child', __axes: {}};
      const iconFreeInputs = new Set();
      await resolve(
        {
          'source.mjs':
            "import {defineTheme} from '@astryxdesign/core/theme';import {parent} from '@fixture/parent';export default defineTheme({name:'child',extends:parent});",
          'parent.mjs': `import {defineTheme} from '@astryxdesign/core/theme';export const parent=defineTheme({name:'foreign',tokens:{'--color-accent':'#123456'}${fields}});`,
        },
        theme,
        new Map([[theme, {extends: parent}]]),
        {iconFreeInputs},
      );
      expect(iconFreeInputs.has(parent)).toBe(fields === '');
    },
  );
  it('retains both independently authored equal overridden source contributors', async () => {
    const one = {},
      two = {};
    const first = {close: {capabilities: one, tree: {default: 'one'}}};
    const second = {close: {capabilities: two, tree: {default: 'two'}}};
    const parent = {__axes: {}, __iconSources: first, __iconContracts: [one]};
    const theme = {
      __axes: {},
      __iconSources: second,
      __iconContracts: [one, two],
    };
    const inputs = new Map([
      [parent, {icons: first}],
      [theme, {extends: parent, icons: second}],
    ]);
    const modules = {
      'one.mjs':
        "import {defineIconCapabilities,defineAdaptiveIcon} from '@astryxdesign/core/Icon';export const C=defineIconCapabilities({});export const icons={close:defineAdaptiveIcon(C,{default:'one'})};",
      'two.mjs':
        "import {defineIconCapabilities,defineAdaptiveIcon} from '@astryxdesign/core/Icon';export const C=defineIconCapabilities({});export const icons={close:defineAdaptiveIcon(C,{default:'two'})};",
      'parent.mjs':
        "import {defineTheme} from '@astryxdesign/core/theme';import {icons} from './one.mjs';export const parent=defineTheme({name:'parent',icons});",
      'source.mjs':
        "import {defineTheme} from '@astryxdesign/core/theme';import {parent} from './parent.mjs';import {icons} from './two.mjs';export default defineTheme({name:'child',extends:parent,icons});",
    };
    const info = await resolve(modules, theme, inputs);
    expect(info.contractReferences.map(value => value.contract)).toEqual([
      one,
      two,
    ]);
    expect(info.contractReferences[0].contract).toBe(one);
    expect(info.contractReferences[1].contract).toBe(two);
    expect(info.imports.map(value => value.importPath)).toEqual([
      './one.mjs',
      './two.mjs',
    ]);
    expect(info.imports).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({importPath: './parent.mjs'}),
      ]),
    );
  });
  it('bypasses a mixed Theme barrel to the standalone policy constructor', async () => {
    const contract = {appearances: ['filled']};
    const input = {iconCapabilities: {contract}};
    const theme = {
      __axes: {},
      iconCapabilities: {contract},
      __iconContracts: [contract],
    };
    const modules = {
      'contract.mjs':
        "import {defineIconCapabilities} from '@astryxdesign/core/Icon';export const C=defineIconCapabilities({appearances:['filled']});",
      'base.mjs':
        "import {defineTheme} from '@astryxdesign/core/theme';export const base=defineTheme({name:'base'});",
      'barrel.mjs':
        "export {C} from './contract.mjs';export {base} from './base.mjs';",
      'source.mjs':
        "import {defineTheme} from '@astryxdesign/core/theme';import {C} from './barrel.mjs';export default defineTheme({name:'child',iconCapabilities:{contract:C}});",
    };
    const info = await resolve(modules, theme, new Map([[theme, input]]));
    expect(info.policyContractExpression).toBeTruthy();
    expect(info.contractReferences[0].contract).toBe(contract);
    expect(info.imports.map(value => value.importPath)).toEqual([
      './contract.mjs',
    ]);
    expect(info.exportName).toBe('');
  });
  it('does not keep a policy module whose dependencies execute a source Theme', async () => {
    const contract = {};
    const theme = {iconCapabilities: {contract}};
    const info = await resolve(
      {
        'contract.mjs':
          "import './base.mjs';import {defineIconCapabilities} from '@astryxdesign/core/Icon';export const C=defineIconCapabilities({});",
        'base.mjs':
          "import {defineTheme} from '@astryxdesign/core/theme';export const base=defineTheme({name:'base'});",
        'source.mjs':
          "import {defineTheme} from '@astryxdesign/core/theme';import {C} from './contract.mjs';export default defineTheme({name:'child',iconCapabilities:{contract:C}});",
      },
      theme,
    );
    expect(info).toBe(null);
  });
  it('preserves extensionless direct import spelling and module override identity', async () => {
    const contract = {};
    const icons = {close: {capabilities: contract, tree: {default: 'close'}}};
    const info = await resolve(
      {
        'icons.mjs':
          "import {defineIconCapabilities,defineAdaptiveIcon} from '@astryxdesign/core/Icon';export const C=defineIconCapabilities({});export const icons={close:defineAdaptiveIcon(C,{default:'close'})};",
        'source.mjs':
          "import {defineTheme} from '@astryxdesign/core/theme';import {icons,C} from './icons';export default defineTheme({name:'child',icons,iconCapabilities:{contract:C}});",
      },
      {icons, iconCapabilities: {contract}},
    );
    expect(info.iconsSpecifierImportPath).toBe('./icons');
    expect(info.sourceFile).toBe('/virtual-icon-fixture/source.mjs');
    expect(info.imports).toContainEqual(
      expect.objectContaining({importPath: './icons', importedName: 'icons'}),
    );
  });
});
