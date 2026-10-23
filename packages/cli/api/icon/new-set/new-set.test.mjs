// Copyright (c) Meta Platforms, Inc. and affiliates.

import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {integrationAdd} from '../../integration/add-contribution.mjs';
import {iconNewSet} from './new-set.mjs';
import {discoverIconSetDirectory} from '../../../foundation/discovery/icon-set-discovery.mjs';

/** @type {string} */
let tmpDir;

/**
 * @param {{manifest?: string | null, files?: string[] | null, name?: string | null, license?: string}} [opts]
 */
function setup({
  manifest = 'export default {};\n',
  files = ['dist'],
  name = '@acme/icons',
  license,
} = {}) {
  /** @type {Record<string, unknown>} */
  const pkg = {version: '1.0.0'};
  if (name != null) pkg.name = name;
  if (license != null) pkg.license = license;
  if (files != null) pkg.files = files;
  fs.writeFileSync(
    path.join(tmpDir, 'package.json'),
    `${JSON.stringify(pkg, null, 2)}\n`,
  );
  if (manifest != null) {
    fs.writeFileSync(path.join(tmpDir, 'astryx.integration.mjs'), manifest);
  }
}

/** @param {string} file */
const read = file => fs.readFileSync(path.join(tmpDir, file), 'utf-8');

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(process.cwd(), '.astryx-add-icon-set-'));
});

afterEach(() => {
  fs.rmSync(tmpDir, {recursive: true, force: true});
});

describe('iconNewSet (experimental icon new-set)', () => {
  it('refuses a package.json whose files is not an array of strings, and writes nothing', async () => {
    setup({license: 'MIT'});
    const pkgFile = path.join(tmpDir, 'package.json');
    fs.writeFileSync(
      pkgFile,
      `${JSON.stringify({...JSON.parse(read('package.json')), files: 'dist'}, null, 2)}\n`,
    );
    const pkgBefore = read('package.json');
    const manifestBefore = read('astryx.integration.mjs');
    await expect(iconNewSet('outline', {cwd: tmpDir})).rejects.toThrow(
      /files must be an array of strings/u,
    );
    expect(read('package.json')).toBe(pkgBefore);
    expect(read('astryx.integration.mjs')).toBe(manifestBefore);
    expect(fs.existsSync(path.join(tmpDir, 'icon-sets'))).toBe(false);
  });

  it('refuses a manifest that spreads another object where experimental would go, and writes nothing', async () => {
    setup({
      license: 'MIT',
      manifest:
        "const shared = {experimental: {other: './other'}};\n\nexport default {\n  ...shared,\n};\n",
    });
    const pkgBefore = read('package.json');
    const manifestBefore = read('astryx.integration.mjs');
    await expect(iconNewSet('outline', {cwd: tmpDir})).rejects.toThrow(
      /spreads another object/u,
    );
    expect(read('package.json')).toBe(pkgBefore);
    expect(read('astryx.integration.mjs')).toBe(manifestBefore);
    const left = fs.existsSync(path.join(tmpDir, 'icon-sets'))
      ? fs
          .readdirSync(path.join(tmpDir, 'icon-sets'), {recursive: true})
          .filter(each =>
            fs.statSync(path.join(tmpDir, 'icon-sets', String(each))).isFile(),
          )
      : [];
    expect(left).toEqual([]);
  });

  it('names the line for the entry file, relative to it, when the entry is not at the package root', async () => {
    setup({license: 'MIT'});
    const pkgFile = path.join(tmpDir, 'package.json');
    fs.writeFileSync(
      pkgFile,
      JSON.stringify({
        ...JSON.parse(read('package.json')),
        type: 'module',
        exports: {'.': './src/index.js'},
      }),
    );
    fs.mkdirSync(path.join(tmpDir, 'src'));
    fs.writeFileSync(path.join(tmpDir, 'src', 'index.js'), 'export {};\n');
    const result = await iconNewSet('outline', {cwd: tmpDir});
    expect(result.data.notes).toEqual([
      "Add `export * from '../icon-sets/outline/outline.generated.js';` to src/index.js, so the icons import from @acme/icons.",
      'Run `astryx integration check` to see the icon definitions still to map.',
    ]);
  });

  it('adds no export line when the entry already exports the generated module', async () => {
    setup({license: 'MIT'});
    fs.writeFileSync(
      path.join(tmpDir, 'package.json'),
      JSON.stringify({
        ...JSON.parse(read('package.json')),
        type: 'module',
        exports: {'.': './src/index.js'},
      }),
    );
    fs.mkdirSync(path.join(tmpDir, 'src'));
    fs.writeFileSync(
      path.join(tmpDir, 'src', 'index.js'),
      "export * from '../icon-sets/outline/outline.generated.js';\n",
    );
    const result = await iconNewSet('outline', {cwd: tmpDir});
    expect(result.data.notes).toEqual([
      'Run `astryx integration check` to see the icon definitions still to map.',
    ]);
  });

  it('writes a typed descriptor and a starter data file, declares the root, and adds it to files', async () => {
    setup({license: 'MIT'});
    const result = await iconNewSet('outline', {cwd: tmpDir});

    expect(result).toEqual({
      type: 'icon.newSet',
      data: {
        kind: 'icon-set',
        name: 'outline',
        root: {path: './icon-sets', created: true},
        manifest: 'astryx.integration.mjs',
        files: [
          'icon-sets/outline/outline.doc.mjs',
          'icon-sets/outline/outline.icons.json',
          'icon-sets/outline/outline.generated.js',
          'icon-sets/outline/outline.generated.d.ts',
          'package.json',
          'astryx.integration.mjs',
        ],
        written: true,
        dryRun: false,
        icons: 0,
        notes: [
          // No exports and no root file: nothing to add the line to yet.
          '"@acme/icons" does not resolve yet: point its package.json "exports" at a file that has `export * from \'./icon-sets/outline/outline.generated.js\';`.',
          'Run `astryx integration check` to see the icon definitions still to map.',
        ],
      },
    });
    // The generated module starts with an empty theme map, and its types.
    expect(read('icon-sets/outline/outline.generated.js')).toContain(
      'export const themeIcons = {};',
    );
    expect(read('icon-sets/outline/outline.generated.d.ts')).toContain(
      'export declare const themeIcons: {};',
    );

    const doc = read('icon-sets/outline/outline.doc.mjs');
    expect(doc).toContain(
      "/** @type {import('@astryxdesign/cli/authoring').IconSetDoc} */",
    );
    expect(doc).toContain("type: 'icon-set'");
    expect(doc).toContain("name: 'outline'");
    expect(doc).toContain("license: 'MIT'");
    expect(JSON.parse(read('icon-sets/outline/outline.icons.json'))).toEqual({
      schemaVersion: 1,
      module: '@acme/icons',
      generated: './icon-sets/outline/outline.generated.js',
      themeMap: 'themeIcons',
      map: {},
      icons: [],
    });
    expect(read('astryx.integration.mjs')).toMatch(
      /iconSets:\s*['"]\.\/icon-sets['"]/u,
    );
    expect(JSON.parse(read('package.json')).files).toEqual([
      'dist',
      'icon-sets',
      'astryx.integration.mjs',
    ]);

    // The written set is a valid, discoverable set.
    const {sets, errors} = discoverIconSetDirectory(
      path.join(tmpDir, 'icon-sets'),
      '@acme/icons',
    );
    expect(errors).toEqual([]);
    expect(sets.map(set => [set.name, set.displayName, set.license])).toEqual([
      ['outline', 'Outline', 'MIT'],
    ]);
  });

  it('creates the manifest on first add and never creates a files field', async () => {
    setup({manifest: null, files: null});
    const result = await iconNewSet('brand-glyphs', {cwd: tmpDir});
    expect(result.data.root).toEqual({path: './icon-sets', created: true});
    expect(result.data.files).toContain('astryx.integration.mjs');
    expect(read('astryx.integration.mjs')).toContain('experimental: {');
    expect(read('astryx.integration.mjs')).toContain("iconSets: './icon-sets'");
    expect(JSON.parse(read('package.json')).files).toBeUndefined();
    // No package license: the descriptor says so instead of guessing one.
    expect(read('icon-sets/brand-glyphs/brand-glyphs.doc.mjs')).toContain(
      "license: 'UNLICENSED'",
    );
  });

  it('uses an existing custom root and does not redeclare it', async () => {
    setup({
      manifest: "export default {experimental: {iconSets: './glyphs'}};\n",
    });
    const result = await iconNewSet('outline', {cwd: tmpDir});
    expect(result.data.root).toEqual({path: './glyphs', created: false});
    expect(result.data.files).not.toContain('astryx.integration.mjs');
    expect(
      fs.existsSync(path.join(tmpDir, 'glyphs/outline/outline.icons.json')),
    ).toBe(true);
  });

  it('dry run predicts the real write without changing files', async () => {
    setup();
    const before = read('astryx.integration.mjs');
    const plan = await iconNewSet('outline', {
      cwd: tmpDir,
      dryRun: true,
    });
    expect(plan.data.written).toBe(false);
    expect(plan.data.dryRun).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, 'icon-sets'))).toBe(false);
    expect(read('astryx.integration.mjs')).toBe(before);

    const real = await iconNewSet('outline', {cwd: tmpDir});
    expect(real.data.files).toEqual(plan.data.files);
    expect(real.data.root).toEqual(plan.data.root);
  });

  it('refuses to overwrite an existing descriptor or data file', async () => {
    setup();
    await iconNewSet('outline', {cwd: tmpDir});
    const doc = read('icon-sets/outline/outline.doc.mjs');
    await expect(iconNewSet('outline', {cwd: tmpDir})).rejects.toMatchObject({
      code: 'ERR_FILE_EXISTS',
    });
    expect(read('icon-sets/outline/outline.doc.mjs')).toBe(doc);

    fs.mkdirSync(path.join(tmpDir, 'icon-sets/solid'));
    fs.writeFileSync(
      path.join(tmpDir, 'icon-sets/solid/solid.icons.json'),
      '{}',
    );
    await expect(iconNewSet('solid', {cwd: tmpDir})).rejects.toMatchObject({
      code: 'ERR_FILE_EXISTS',
    });
    expect(
      fs.existsSync(path.join(tmpDir, 'icon-sets/solid/solid.doc.mjs')),
    ).toBe(false);
  });

  it('rolls back every write when the written set does not verify', async () => {
    // Another set under the root is invalid, but only the new set must
    // verify; an invalid neighbour does not block the write.
    setup();
    fs.mkdirSync(path.join(tmpDir, 'icon-sets/broken'), {recursive: true});
    const ok = await iconNewSet('outline', {cwd: tmpDir});
    expect(ok.data.written).toBe(true);

    // A root that resolves to a file cannot hold a set: nothing is left behind.
    setup({
      manifest: "export default {experimental: {iconSets: './taken'}};\n",
    });
    fs.writeFileSync(path.join(tmpDir, 'taken'), 'not a directory');
    const pkgBefore = read('package.json');
    await expect(iconNewSet('outline', {cwd: tmpDir})).rejects.toMatchObject({
      code: 'ERR_WRITE_FAILED',
    });
    expect(read('package.json')).toBe(pkgBefore);
    expect(read('taken')).toBe('not a directory');
  });

  it('rejects a name that is not lower-kebab, a root outside the package, and an unnamed package', async () => {
    setup();
    for (const bad of ['Outline', '../x', 'a_b', '']) {
      await expect(iconNewSet(bad, {cwd: tmpDir})).rejects.toMatchObject({
        code: 'ERR_INVALID_ARGUMENT',
      });
    }
    setup({
      manifest: "export default {experimental: {iconSets: '../outside'}};\n",
    });
    await expect(iconNewSet('outline', {cwd: tmpDir})).rejects.toMatchObject({
      code: 'ERR_PATH_TRAVERSAL',
    });
    setup({name: null});
    await expect(iconNewSet('outline', {cwd: tmpDir})).rejects.toMatchObject({
      code: 'ERR_INVALID_ARGUMENT',
    });
  });

  it('refuses an option of another kind', async () => {
    setup();
    await expect(
      iconNewSet('outline', {
        cwd: tmpDir,
        .../** @type {any} */ ({to: '1.0.0'}),
      }),
    ).rejects.toMatchObject({code: 'ERR_INVALID_ARGUMENT'});
  });

  it('is not an integrationAdd kind: the stable command gains no experimental kind', async () => {
    setup();
    for (const kind of ['icon-set', 'icon-definition']) {
      await expect(
        integrationAdd(/** @type {any} */ (kind), 'outline', {cwd: tmpDir}),
      ).rejects.toMatchObject({
        code: 'ERR_INVALID_ARGUMENT',
        message: expect.stringContaining('Unknown contribution kind'),
      });
    }
  });

  it('nests the root in an existing experimental object', async () => {
    setup({
      manifest: "export default {themes: './themes', experimental: {}};\n",
    });
    await iconNewSet('outline', {cwd: tmpDir});
    const manifest = read('astryx.integration.mjs');
    expect(manifest).toContain("themes: './themes'");
    expect(manifest.match(/experimental:/g)).toHaveLength(1);
    expect(manifest).toContain("iconSets: './icon-sets'");
  });
});

describe('experimental icon authoring API', () => {
  it('exports iconNewSet and iconNewDefinition, and no integrationAdd icon kind', async () => {
    const api = await import('../../index.mjs');
    expect(api.iconNewSet).toBeTypeOf('function');
    expect(api.iconNewDefinition).toBeTypeOf('function');
    expect(api).not.toHaveProperty('integrationAddIconSet');
    expect(api).not.toHaveProperty('integrationAddIconDefinition');
  });
});
