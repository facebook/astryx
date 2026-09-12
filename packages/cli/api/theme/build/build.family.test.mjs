// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file build.family.test.mjs
 * @input Real defineTheme base, child, grandchild, sibling, and zero-delta sources
 * @output One keyed family generation through the programmatic build seam
 * @position End-to-end AST-034 family artifact contract tests
 */

import {execFileSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {themeBuildFamily} from './build.mjs';

vi.setConfig({testTimeout: 120_000});

let fixtureDir;
beforeEach(() => {
  fixtureDir = fs.mkdtempSync(
    path.join(import.meta.dirname, '.tmp-theme-family-'),
  );
  fs.writeFileSync(
    path.join(fixtureDir, 'ocean.mjs'),
    `import {defineTheme} from '@astryxdesign/core/theme';
export const oceanTheme = defineTheme({
  name: 'ocean',
  localTokens: {'--demo-selection-ink': '#073b4c'},
  tokens: {'--color-accent': '#0077b6', '--radius-container': '16px'},
  components: {button: {base: {color: 'var(--demo-selection-ink)'}}},
  icons: {close: 'inline-close'},
});
`,
  );
  fs.writeFileSync(
    path.join(fixtureDir, 'ocean-deep.mjs'),
    `import {defineTheme} from '@astryxdesign/core/theme';
import {oceanTheme} from './ocean.mjs';
export const oceanDeepTheme = defineTheme({
  name: 'ocean-deep',
  extends: oceanTheme,
  tokens: {'--color-accent': '#023e8a'},
});
`,
  );
  fs.writeFileSync(
    path.join(fixtureDir, 'ocean-midnight.mjs'),
    `import {defineTheme} from '@astryxdesign/core/theme';
import {oceanDeepTheme} from './ocean-deep.mjs';
export const oceanMidnightTheme = defineTheme({
  name: 'ocean-midnight',
  extends: oceanDeepTheme,
  adaptations: {rules: [{when: {pointer: 'coarse'}, value: {tokens: {'--radius-container': '20px'}}}]},
});
`,
  );
  fs.writeFileSync(
    path.join(fixtureDir, 'ocean-zero.mjs'),
    `import {defineTheme} from '@astryxdesign/core/theme';
import {oceanTheme} from './ocean.mjs';
export const oceanZeroTheme = defineTheme({name: 'ocean-zero', extends: oceanTheme});
`,
  );
});
afterEach(() => {
  fs.rmSync(fixtureDir, {recursive: true, force: true});
});

const files = [
  'ocean.mjs',
  'ocean-deep.mjs',
  'ocean-midnight.mjs',
  'ocean-zero.mjs',
];

function current(name) {
  return path.join(fixtureDir, 'ocean-family', 'current', name);
}

describe('themeBuildFamily', () => {
  it('emits one complete keyed artifact set with every member', async () => {
    const result = await themeBuildFamily(
      [...files].reverse(),
      {familyKey: 'ocean-family'},
      {cwd: fixtureDir},
    );

    expect(result.type).toBe('theme.build');
    expect(result.data.name).toBe('ocean-family');
    expect(result.data.outputs).toEqual({
      css: 'ocean-family/current/ocean-family.css',
      js: 'ocean-family/current/ocean-family.js',
      dts: 'ocean-family/current/ocean-family.d.ts',
    });
    for (const name of [
      'ocean-family.css',
      'ocean-family.js',
      'ocean-family.d.ts',
      'ocean-family.manifest.json',
      'receipts/build.json',
    ]) {
      expect(fs.existsSync(current(name))).toBe(true);
    }
    for (const member of [
      'ocean',
      'ocean-deep',
      'ocean-midnight',
      'ocean-zero',
    ]) {
      expect(fs.existsSync(current(`${member}.css`))).toBe(false);
      expect(fs.existsSync(current(`${member}.js`))).toBe(false);
      expect(fs.existsSync(current(`${member}.d.ts`))).toBe(false);
    }

    const css = fs.readFileSync(current('ocean-family.css'), 'utf8');
    expect(css).toContain('[data-astryx-theme="ocean"]');
    expect(css).toContain('[data-astryx-theme="ocean-deep"]');
    expect(css).toContain('[data-astryx-theme="ocean-midnight"]');
    expect(css).toContain('[data-astryx-theme="ocean-zero"]');
    expect(css).toContain('--demo-selection-ink: #073b4c');

    const jsSource = fs.readFileSync(current('ocean-family.js'), 'utf8');
    expect(jsSource).not.toMatch(/(?:import|from)\s*['"][^'"]+\.css['"]/);
    const module = await import(
      `${pathToFileURL(current('ocean-family.js')).href}?test=${Date.now()}`
    );
    expect(Object.keys(module).sort()).toEqual([
      'oceanDeepTheme',
      'oceanMidnightTheme',
      'oceanTheme',
      'oceanZeroTheme',
    ]);
    expect(module.oceanTheme.icons).toEqual({close: 'inline-close'});
    expect(module.oceanMidnightTheme.tokens['--color-accent']).toBe('#023e8a');
    expect(module.oceanZeroTheme.__localTokenLineage).toEqual([
      'ocean',
      'ocean-zero',
    ]);

    const manifest = JSON.parse(
      fs.readFileSync(current('ocean-family.manifest.json'), 'utf8'),
    );
    expect(manifest.members.map(member => member.name)).toEqual([
      'ocean',
      'ocean-deep',
      'ocean-midnight',
      'ocean-zero',
    ]);
    expect(
      manifest.members.every(member => fs.existsSync(current(member.receipt))),
    ).toBe(true);
  });

  it('ships one declaration that resolves every family export', async () => {
    await themeBuildFamily(
      files,
      {familyKey: 'ocean-family'},
      {cwd: fixtureDir},
    );
    fs.writeFileSync(
      path.join(fixtureDir, 'consumer.ts'),
      `import {oceanTheme, oceanDeepTheme, oceanMidnightTheme, oceanZeroTheme} from './ocean-family/current/ocean-family.js';\n` +
        `const names: string[] = [oceanTheme.name, oceanDeepTheme.name, oceanMidnightTheme.name, oceanZeroTheme.name];\n` +
        `export {names};\n`,
    );
    fs.writeFileSync(
      path.join(fixtureDir, 'tsconfig.json'),
      `${JSON.stringify(
        {
          compilerOptions: {
            module: 'esnext',
            target: 'es2022',
            moduleResolution: 'bundler',
            strict: true,
            skipLibCheck: true,
          },
          include: ['consumer.ts', 'ocean-family/current/ocean-family.d.ts'],
        },
        null,
        2,
      )}\n`,
    );

    expect(() =>
      execFileSync(
        'pnpm',
        ['exec', 'tsc', '--project', 'tsconfig.json', '--noEmit'],
        {cwd: fixtureDir, stdio: 'pipe'},
      ),
    ).not.toThrow();
  });

  it('is byte-identical across shuffled input order and clean in check mode', async () => {
    await themeBuildFamily(
      files,
      {familyKey: 'ocean-family'},
      {cwd: fixtureDir},
    );
    const names = [
      'ocean-family.css',
      'ocean-family.js',
      'ocean-family.d.ts',
      'ocean-family.manifest.json',
      'receipts/build.json',
    ];
    const before = new Map(
      names.map(name => [name, fs.readFileSync(current(name))]),
    );

    await themeBuildFamily(
      [...files].reverse(),
      {familyKey: 'ocean-family'},
      {cwd: fixtureDir},
    );
    for (const name of names) {
      expect(fs.readFileSync(current(name))).toEqual(before.get(name));
    }

    const checked = await themeBuildFamily(
      ['ocean-zero.mjs', 'ocean-midnight.mjs', 'ocean.mjs', 'ocean-deep.mjs'],
      {familyKey: 'ocean-family', check: true},
      {cwd: fixtureDir},
    );
    expect(checked).toMatchObject({
      type: 'theme.build.check',
      data: {name: 'ocean-family', upToDate: true, stale: []},
    });
  });

  it('detects missing output, a lost zero-delta identity, and a renamed member without publishing', async () => {
    await themeBuildFamily(
      files,
      {familyKey: 'ocean-family'},
      {cwd: fixtureDir},
    );
    const familyRoot = path.join(fixtureDir, 'ocean-family');
    const currentTarget = fs.readlinkSync(path.join(familyRoot, 'current'));
    const generationsBefore = fs.readdirSync(
      path.join(familyRoot, 'generations'),
    );
    const jsPath = current('ocean-family.js');
    const completeJS = fs.readFileSync(jsPath, 'utf8');

    fs.rmSync(jsPath);
    const missing = await themeBuildFamily(
      files,
      {familyKey: 'ocean-family', check: true},
      {cwd: fixtureDir},
    );
    expect(missing.data.stale).toContainEqual(
      expect.objectContaining({
        path: expect.stringMatching(/ocean-family\.js$/),
        reason: 'missing',
      }),
    );

    fs.writeFileSync(
      jsPath,
      completeJS.replace(/oceanZeroTheme/g, 'lostZeroTheme'),
    );
    const lostZero = await themeBuildFamily(
      files,
      {familyKey: 'ocean-family', check: true},
      {cwd: fixtureDir},
    );
    expect(lostZero.data.stale).toContainEqual(
      expect.objectContaining({
        path: expect.stringMatching(/ocean-family\.js$/),
        reason: 'outdated',
      }),
    );

    fs.writeFileSync(jsPath, completeJS);
    const zeroSource = path.join(fixtureDir, 'ocean-zero.mjs');
    fs.writeFileSync(
      zeroSource,
      fs
        .readFileSync(zeroSource, 'utf8')
        .replaceAll('ocean-zero', 'ocean-renamed'),
    );
    const renamed = await themeBuildFamily(
      files,
      {familyKey: 'ocean-family', check: true},
      {cwd: fixtureDir},
    );
    expect(renamed.data.upToDate).toBe(false);
    expect(
      renamed.data.stale.some(item => item.path.includes('ocean-zero')),
    ).toBe(true);
    expect(
      renamed.data.stale.some(item => item.path.includes('ocean-renamed')),
    ).toBe(true);

    expect(fs.readlinkSync(path.join(familyRoot, 'current'))).toBe(
      currentTarget,
    );
    expect(fs.readdirSync(path.join(familyRoot, 'generations'))).toEqual(
      generationsBefore,
    );
  });

  it('refuses unsafe keys and an existing unowned output root before writing', async () => {
    await expect(
      themeBuildFamily(files, {familyKey: '../outside'}, {cwd: fixtureDir}),
    ).rejects.toThrow(/lower-kebab/);
    expect(fs.existsSync(path.join(fixtureDir, '..', 'outside'))).toBe(false);

    fs.writeFileSync(path.join(fixtureDir, 'blocked-family'), 'user data');
    await expect(
      themeBuildFamily(files, {familyKey: 'blocked-family'}, {cwd: fixtureDir}),
    ).rejects.toThrow(/collides with an existing path/);
    expect(
      fs.readFileSync(path.join(fixtureDir, 'blocked-family'), 'utf8'),
    ).toBe('user data');
  });

  it('rejects a source that exports more than one distinct family member', async () => {
    fs.writeFileSync(
      path.join(fixtureDir, 'multi.mjs'),
      `import {defineTheme} from '@astryxdesign/core/theme';\nexport const firstTheme=defineTheme({name:'first'});\nexport const secondTheme=defineTheme({name:'second'});\n`,
    );
    fs.writeFileSync(
      path.join(fixtureDir, 'multi-child.mjs'),
      `import {defineTheme} from '@astryxdesign/core/theme';\nimport {firstTheme} from './multi.mjs';\nexport const childTheme=defineTheme({name:'first-child', extends:firstTheme});\n`,
    );

    await expect(
      themeBuildFamily(
        ['multi.mjs', 'multi-child.mjs'],
        {familyKey: 'ambiguous-family'},
        {cwd: fixtureDir},
      ),
    ).rejects.toThrow(/exports 2 distinct theme objects/);
    expect(fs.existsSync(path.join(fixtureDir, 'ambiguous-family'))).toBe(
      false,
    );
  });

  it('allocates collision-safe registry bindings and preserves complete inherited values', async () => {
    fs.writeFileSync(
      path.join(fixtureDir, 'base-registry.mjs'),
      `export const sharedRegistry = {close: 'base-close', menu: 'base-menu'};\nexport const sharedIndicators = {check: () => 'base-check'};\n`,
    );
    fs.writeFileSync(
      path.join(fixtureDir, 'child-registry.mjs'),
      `export const sharedRegistry = {close: 'child-close'};\nexport const sharedIndicators = {radio: () => 'child-radio'};\n`,
    );
    fs.writeFileSync(
      path.join(fixtureDir, 'registry-base.mjs'),
      `import {defineTheme} from '@astryxdesign/core/theme';\nimport {sharedRegistry as assets, sharedIndicators as marks} from './base-registry.mjs';\nexport const registryBaseTheme = defineTheme({name: 'registry-base', icons: assets, indicators: marks});\n`,
    );
    fs.writeFileSync(
      path.join(fixtureDir, 'registry-child.mjs'),
      `import {defineTheme} from '@astryxdesign/core/theme';\nimport {registryBaseTheme} from './registry-base.mjs';\nimport {sharedRegistry as assets, sharedIndicators as marks} from './child-registry.mjs';\nexport const registryChildTheme = defineTheme({name: 'registry-child', extends: registryBaseTheme, icons: assets, indicators: marks});\n`,
    );

    await themeBuildFamily(
      ['registry-child.mjs', 'registry-base.mjs'],
      {familyKey: 'registry-family'},
      {cwd: fixtureDir},
    );
    const modulePath = path.join(
      fixtureDir,
      'registry-family',
      'current',
      'registry-family.js',
    );
    const source = fs.readFileSync(modulePath, 'utf8');
    expect(source).toContain('sharedRegistry');
    expect(source).toContain('sharedRegistry2');
    expect(source).toContain('sharedIndicators');
    expect(source).toContain('sharedIndicators2');
    expect(source).not.toContain(fixtureDir);

    const module = await import(
      `${pathToFileURL(modulePath).href}?test=${Date.now()}`
    );
    expect(module.registryBaseTheme.icons).toEqual({
      close: 'base-close',
      menu: 'base-menu',
    });
    expect(module.registryChildTheme.icons).toEqual({
      close: 'child-close',
      menu: 'base-menu',
    });
    expect(module.registryChildTheme.indicators.check()).toBe('base-check');
    expect(module.registryChildTheme.indicators.radio()).toBe('child-radio');
  });
});
