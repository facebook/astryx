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
  components: {button: {'variant:family-special': {borderStyle: 'dashed'}}},
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
    const dtsSource = fs.readFileSync(current('ocean-family.d.ts'), 'utf8');
    expect(dtsSource).toContain('family-special');
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

  it('uses the artifact key only as the coordinated output stem', async () => {
    await themeBuildFamily(files, {familyKey: 'ocean-one'}, {cwd: fixtureDir});
    await themeBuildFamily(files, {familyKey: 'ocean-two'}, {cwd: fixtureDir});
    const read = (key, extension) =>
      fs.readFileSync(
        path.join(fixtureDir, key, 'current', `${key}.${extension}`),
        'utf8',
      );
    const cssBody = css => css.replace(/^\/\*[\s\S]*?\*\/\n/, '');

    expect(cssBody(read('ocean-one', 'css'))).toBe(
      cssBody(read('ocean-two', 'css')),
    );
    expect(read('ocean-one', 'js')).toBe(read('ocean-two', 'js'));
    expect(read('ocean-one', 'd.ts')).toBe(read('ocean-two', 'd.ts'));
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

    const invalidCurrent = path.join(fixtureDir, 'invalid-current');
    fs.mkdirSync(path.join(invalidCurrent, 'current'), {recursive: true});
    await expect(
      themeBuildFamily(
        files,
        {familyKey: 'invalid-current'},
        {cwd: fixtureDir},
      ),
    ).rejects.toThrow(/collides with an existing path/);
    expect(
      fs.lstatSync(path.join(invalidCurrent, 'current')).isDirectory(),
    ).toBe(true);

    const danglingRoot = path.join(fixtureDir, 'dangling-family');
    fs.mkdirSync(path.join(danglingRoot, 'generations'), {recursive: true});
    fs.symlinkSync(
      'generations/gen-11111111111111111111',
      path.join(danglingRoot, 'current'),
      'dir',
    );
    await expect(
      themeBuildFamily(
        files,
        {familyKey: 'dangling-family'},
        {cwd: fixtureDir},
      ),
    ).rejects.toThrow(/collides with an existing path/);
    expect(fs.readdirSync(path.join(danglingRoot, 'generations'))).toEqual([]);

    const nestedCurrentRoot = path.join(fixtureDir, 'nested-current-family');
    fs.mkdirSync(path.join(nestedCurrentRoot, 'generations'), {
      recursive: true,
    });
    fs.symlinkSync(
      'generations/gen-11111111111111111111/nested',
      path.join(nestedCurrentRoot, 'current'),
      'dir',
    );
    await expect(
      themeBuildFamily(
        files,
        {familyKey: 'nested-current-family'},
        {cwd: fixtureDir},
      ),
    ).rejects.toThrow(/collides with an existing path/);
    expect(fs.readdirSync(path.join(nestedCurrentRoot, 'generations'))).toEqual(
      [],
    );

    const danglingJournalRoot = path.join(
      fixtureDir,
      'dangling-journal-family',
    );
    fs.mkdirSync(path.join(danglingJournalRoot, 'generations'), {
      recursive: true,
    });
    fs.symlinkSync(
      'generations/gen-22222222222222222222',
      path.join(danglingJournalRoot, 'current'),
      'dir',
    );
    fs.symlinkSync(
      'missing-journal',
      path.join(danglingJournalRoot, '.journal.json'),
    );
    await expect(
      themeBuildFamily(
        files,
        {familyKey: 'dangling-journal-family'},
        {cwd: fixtureDir},
      ),
    ).rejects.toThrow(/collides with an existing path/);
    expect(
      fs.readdirSync(path.join(danglingJournalRoot, 'generations')),
    ).toEqual([]);

    const outside = path.join(fixtureDir, 'outside-generations');
    fs.mkdirSync(outside);
    const escapedRoot = path.join(fixtureDir, 'escaped-family');
    fs.mkdirSync(escapedRoot);
    fs.symlinkSync(outside, path.join(escapedRoot, 'generations'), 'dir');
    await expect(
      themeBuildFamily(files, {familyKey: 'escaped-family'}, {cwd: fixtureDir}),
    ).rejects.toThrow(/collides with an existing path/);
    expect(fs.readdirSync(outside)).toEqual([]);

    const unownedGenerationRoot = path.join(
      fixtureDir,
      'unowned-generation-family',
    );
    fs.mkdirSync(path.join(unownedGenerationRoot, 'generations', 'notes'), {
      recursive: true,
    });
    fs.writeFileSync(
      path.join(unownedGenerationRoot, 'generations', 'notes', 'keep.txt'),
      'keep',
    );
    await expect(
      themeBuildFamily(
        files,
        {familyKey: 'unowned-generation-family'},
        {cwd: fixtureDir},
      ),
    ).rejects.toThrow(/collides with an existing path/);
    expect(
      fs.readFileSync(
        path.join(unownedGenerationRoot, 'generations', 'notes', 'keep.txt'),
        'utf8',
      ),
    ).toBe('keep');
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

  it('keeps unmanifested pre-journal staging residue without blocking later checks', async () => {
    await themeBuildFamily(
      files,
      {familyKey: 'ocean-family'},
      {cwd: fixtureDir},
    );
    const staging = path.join(
      fixtureDir,
      'ocean-family',
      'generations',
      '.gen-00000000000000000000.staging-11111111-1111-4111-8111-111111111111',
    );
    fs.mkdirSync(staging);
    fs.writeFileSync(path.join(staging, 'partial-write'), 'unmanifested');
    const journalResidue = path.join(
      fixtureDir,
      'ocean-family',
      '.journal-22222222-2222-4222-8222-222222222222.tmp',
    );
    fs.writeFileSync(journalResidue, 'unmanifested journal bytes');

    const checked = await themeBuildFamily(
      files,
      {familyKey: 'ocean-family', check: true},
      {cwd: fixtureDir},
    );
    expect(checked.data.upToDate).toBe(true);
    expect(fs.readFileSync(path.join(staging, 'partial-write'), 'utf8')).toBe(
      'unmanifested',
    );
    expect(fs.readFileSync(journalResidue, 'utf8')).toBe(
      'unmanifested journal bytes',
    );
  });

  it('allocates collision-safe registry bindings and preserves complete inherited values', async () => {
    fs.writeFileSync(
      path.join(fixtureDir, 'base-registry.mjs'),
      `export const bundle = {icons: {close: 'base-close', menu: 'base-menu'}, indicators: {check: () => 'base-check'}};\n`,
    );
    fs.writeFileSync(
      path.join(fixtureDir, 'child-registry.mjs'),
      `export const bundle = {icons: {close: 'child-close'}, indicators: {radio: () => 'child-radio'}};\n`,
    );
    fs.writeFileSync(
      path.join(fixtureDir, 'registry-base.mjs'),
      `import {defineTheme} from '@astryxdesign/core/theme';\nimport {bundle as assets} from './base-registry.mjs';\nexport const registryBaseTheme = defineTheme({name: 'registry-base', icons: assets.icons, indicators: assets.indicators});\n`,
    );
    fs.writeFileSync(
      path.join(fixtureDir, 'registry-child.mjs'),
      `import {defineTheme} from '@astryxdesign/core/theme';\nimport {registryBaseTheme} from './registry-base.mjs';\nimport {bundle as assets} from './child-registry.mjs';\nexport const registryChildTheme = defineTheme({name: 'registry-child', extends: registryBaseTheme, icons: assets.icons, indicators: assets.indicators});\n`,
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
    expect(source).toContain('bundle');
    expect(source).toContain('bundle2');
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

    fs.writeFileSync(
      path.join(fixtureDir, 'misleading-registry.mjs'),
      `export const wrong = {close: () => 'wrong'}; export const right = {close: () => 'right'};\n`,
    );
    fs.writeFileSync(
      path.join(fixtureDir, 'misleading-base.mjs'),
      `import {defineTheme} from '@astryxdesign/core/theme';\nimport {wrong, right} from './misleading-registry.mjs';\n// Documentation example only: icons: wrong\nexport const misleadingBaseTheme=defineTheme({name:'misleading-base', icons:right});\n`,
    );
    fs.writeFileSync(
      path.join(fixtureDir, 'misleading-child.mjs'),
      `import {defineTheme} from '@astryxdesign/core/theme';\nimport {misleadingBaseTheme} from './misleading-base.mjs';\nexport const misleadingChildTheme=defineTheme({name:'misleading-child', extends:misleadingBaseTheme});\n`,
    );
    await themeBuildFamily(
      ['misleading-base.mjs', 'misleading-child.mjs'],
      {familyKey: 'misleading-family'},
      {cwd: fixtureDir},
    );
    const misleading = await import(
      `${
        pathToFileURL(
          path.join(
            fixtureDir,
            'misleading-family',
            'current',
            'misleading-family.js',
          ),
        ).href
      }?test=${Date.now()}`
    );
    expect(misleading.misleadingBaseTheme.icons.close()).toBe('right');

    fs.writeFileSync(
      path.join(fixtureDir, 'override-root-registry.mjs'),
      `export const icons={close:'original-close'};\n`,
    );
    fs.writeFileSync(
      path.join(fixtureDir, 'override-replacement.mjs'),
      `export const icons={close:'replacement-close'};\n`,
    );
    fs.writeFileSync(
      path.join(fixtureDir, 'override-base.mjs'),
      `import {defineTheme} from '@astryxdesign/core/theme';\nimport {icons} from './override-root-registry.mjs';\nexport const overrideBaseTheme=defineTheme({name:'override-base', icons});\n`,
    );
    fs.writeFileSync(
      path.join(fixtureDir, 'override-child.mjs'),
      `import {defineTheme} from '@astryxdesign/core/theme';\nimport {overrideBaseTheme} from './override-base.mjs';\nexport const overrideChildTheme=defineTheme({name:'override-child', extends:overrideBaseTheme, icons:{menu:'inline-menu'}});\n`,
    );
    await themeBuildFamily(
      ['override-base.mjs', 'override-child.mjs'],
      {
        familyKey: 'inline-override-family',
        iconsSpecifier: './override-replacement.mjs',
      },
      {cwd: fixtureDir},
    );
    const overridden = await import(
      `${
        pathToFileURL(
          path.join(
            fixtureDir,
            'inline-override-family',
            'current',
            'inline-override-family.js',
          ),
        ).href
      }?test=${Date.now()}`
    );
    expect(overridden.overrideChildTheme.icons).toEqual({
      close: 'replacement-close',
      menu: 'inline-menu',
    });
  });
});
