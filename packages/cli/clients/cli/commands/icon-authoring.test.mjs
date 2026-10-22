// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Icon-set authoring commands end to end (AST-084): `experimental icon
 * new-set --from`, `experimental icon new-definition`, `experimental icon add`, `icon
 * map`, and `experimental icon use`, driving the real program over an icon-set package
 * that wraps a small component library and an app that installs it.
 */

import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import {runCli} from '../../../test-utils/run-cli.mjs';
import {writeIconSetProject} from '../../../test-utils/icon-set-fixture.mjs';

/** @type {string} */
let tmp;
/** @type {string} */
let pkg;

/**
 * A component library under node_modules: two components (one also exported
 * under an `…Icon` alias), a data export, and a default-export file.
 * @param {string} dir
 */
function writeLibrary(dir) {
  const lib = path.join(dir, 'node_modules', '@acme', 'glyph-library');
  fs.mkdirSync(path.join(lib, 'icons'), {recursive: true});
  fs.writeFileSync(
    path.join(lib, 'package.json'),
    JSON.stringify({
      name: '@acme/glyph-library',
      version: '2.0.0',
      type: 'module',
      exports: {'.': './index.js', './rocket': './icons/rocket.js'},
    }),
  );
  fs.writeFileSync(
    path.join(lib, 'index.js'),
    [
      "export {Bin, Bin as BinIcon} from './icons/bin.js';",
      "export {Cross} from './icons/cross.js';",
      "export const glyphData = {path: 'M0 0'};",
      "export const version = '2.0.0';",
      '',
    ].join('\n'),
  );
  fs.writeFileSync(
    path.join(lib, 'icons', 'bin.js'),
    'export function Bin(props) { return null; }\n',
  );
  fs.writeFileSync(
    path.join(lib, 'icons', 'cross.js'),
    'export const Cross = props => null;\n',
  );
  fs.writeFileSync(
    path.join(lib, 'icons', 'rocket.js'),
    'export default function Rocket(props) { return null; }\n',
  );
}

beforeEach(() => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-icon-authoring-'));
  pkg = path.join(tmp, 'icons');
  fs.mkdirSync(pkg, {recursive: true});
  fs.writeFileSync(
    path.join(pkg, 'package.json'),
    JSON.stringify(
      {
        name: '@acme/icons',
        version: '1.0.0',
        license: 'MIT',
        type: 'module',
        exports: {'.': './index.js'},
        dependencies: {'@acme/glyph-library': '^2.0.0'},
      },
      null,
      2,
    ),
  );
  fs.writeFileSync(path.join(pkg, 'index.js'), 'export {};\n');
  writeLibrary(pkg);
});
afterEach(() => {
  fs.rmSync(tmp, {recursive: true, force: true});
});

/** @param {string[]} args @param {string} [cwd] */
async function json(args, cwd = pkg) {
  const res = await runCli([...args, '--json'], cwd);
  return {code: res.code, body: JSON.parse(res.stdout)};
}

/** @param {string} set */
const dataOf = set =>
  JSON.parse(
    fs.readFileSync(
      path.join(pkg, 'icon-sets', set, `${set}.icons.json`),
      'utf-8',
    ),
  );

describe('experimental icon new-set --from', () => {
  it('wraps every component of a library once, names each <Name>Icon, pre-fills exact map hits, and says what to export', async () => {
    const {code, body} = await json([
      'experimental',
      'icon',
      'new-set',
      'outline',
      '--from',
      '@acme/glyph-library',
    ]);
    expect(code).toBe(0);
    expect(body.data).toMatchObject({kind: 'icon-set', icons: 2});
    expect(body.data.notes[0]).toContain(
      "export * from './icon-sets/outline/outline.generated.js'",
    );
    const data = dataOf('outline');
    expect(data.generated).toBe('./icon-sets/outline/outline.generated.js');
    expect(data.icons).toEqual([
      {id: 'bin', export: 'BinIcon', words: ['bin']},
      {id: 'cross', export: 'CrossIcon', words: ['cross']},
    ]);
    // `delete` has the word bin; nothing is guessed beyond exact hits.
    expect(data.map).toMatchObject({delete: 'bin'});
    const generated = fs.readFileSync(
      path.join(pkg, 'icon-sets', 'outline', 'outline.generated.js'),
      'utf-8',
    );
    expect(generated).toContain("export {BinIcon} from '@acme/glyph-library';");
    expect(generated).toContain(
      "export {Cross as CrossIcon} from '@acme/glyph-library';",
    );
    expect(generated).not.toContain('glyphData');

    // Running it again refreshes in place and keeps the map.
    const again = await json([
      'experimental',
      'icon',
      'new-set',
      'outline',
      '--from',
      '@acme/glyph-library',
    ]);
    expect(again.code).toBe(0);
    expect(dataOf('outline').map).toMatchObject({delete: 'bin'});
  });

  it('the theme map reads each re-exported icon through an import, so the generated module loads', async () => {
    await json([
      'experimental',
      'icon',
      'new-set',
      'outline',
      '--from',
      '@acme/glyph-library',
    ]);
    // `close` is built in, so it lands in the theme map.
    expect(
      (await json(['experimental', 'icon', 'map', 'close', 'cross'])).code,
    ).toBe(0);
    const file = path.join(pkg, 'icon-sets', 'outline', 'outline.generated.js');
    const text = fs.readFileSync(file, 'utf-8');
    // A re-export binds no local name: the theme map's import does.
    expect(text).toContain(
      "import {Cross as CrossIcon} from '@acme/glyph-library';",
    );
    expect(text).toContain(
      "export {Cross as CrossIcon} from '@acme/glyph-library';",
    );
    expect(text).toContain('close: createElement(CrossIcon,');
    const check = JSON.stringify(
      JSON.parse(
        (await runCli(['integration', 'check', '--json'], pkg)).stdout,
      ),
    );
    expect(check).not.toContain('icon_theme_map_mismatch');
    expect(check).not.toContain('icon_module_invalid');

    // The module loads and the theme map draws the exported component.
    const react = path.dirname(
      createRequire(import.meta.url).resolve('react/package.json'),
    );
    fs.symlinkSync(react, path.join(pkg, 'node_modules', 'react'), 'dir');
    const mod = await import(pathToFileURL(file).href);
    expect(mod.themeIcons.close.type).toBe(mod.CrossIcon);

    // Remapping drops the import the theme map no longer reads.
    await json(['experimental', 'icon', 'map', 'close', 'bin']);
    const remapped = fs.readFileSync(file, 'utf-8');
    expect(remapped).not.toContain('import {Cross as CrossIcon}');
    expect(remapped).toContain("import {BinIcon} from '@acme/glyph-library';");
  }, 60_000);
});

describe('icon add', () => {
  beforeEach(async () => {
    await runCli(['experimental', 'icon', 'new-set', 'outline'], pkg);
  });

  it('lists the definitions that fit an export, and writes nothing', async () => {
    const {code, body} = await json([
      'experimental',
      'icon',
      'add',
      'Bin',
      '--from',
      '@acme/glyph-library',
    ]);
    expect(code).toBe(0);
    expect(body.type).toBe('icon.definitionMatches');
    expect(body.data.matches[0]).toMatchObject({
      name: 'delete',
      source: 'astryx',
      command:
        'astryx experimental icon add Bin --from @acme/glyph-library --definition delete',
    });
    expect(dataOf('outline').icons).toEqual([]);
  });

  it('adds the icon as <Name>Icon through the generated module, maps it, and is idempotent', async () => {
    const args = [
      'experimental',
      'icon',
      'add',
      'Bin',
      '--from',
      '@acme/glyph-library',
      '--definition',
      'delete',
    ];
    const first = await json(args);
    expect(first.code).toBe(0);
    expect(first.body.data).toMatchObject({
      icon: {id: 'bin', export: 'BinIcon', module: '@acme/icons'},
      definition: 'delete',
      changed: true,
    });
    expect(first.body.data.note).toContain('export * from');
    const data = dataOf('outline');
    expect(data.map).toEqual({delete: 'bin'});
    expect(data.icons[0]).toMatchObject({id: 'bin', export: 'BinIcon'});
    // Only its own words: the definition's words are matched, not copied.
    expect(data.icons[0].words).toEqual(['bin']);
    expect(data.icons[0]).not.toHaveProperty('module');
    const again = await json(args);
    expect(again.body.data.changed).toBe(false);
  });

  it('adds a declared variant of an existing icon with --variant, refusing one the set does not declare', async () => {
    await json([
      'experimental',
      'icon',
      'add',
      'Bin',
      '--from',
      '@acme/glyph-library',
      '--definition',
      'delete',
    ]);
    const args = [
      'experimental',
      'icon',
      'add',
      'Cross',
      '--from',
      '@acme/glyph-library',
      '--id',
      'bin',
      '--variant',
      'solid',
    ];
    const before = dataOf('outline');
    const refused = await json(args);
    expect(refused.code).toBe(1);
    expect(refused.body.code).toBe('ERR_INVALID_ARGUMENT');
    expect(refused.body.error).toContain('variant "solid" is not in variants');
    expect(refused.body.error).toContain('Declare it in "variants"');
    expect(dataOf('outline')).toEqual(before);

    const dataPath = path.join(
      pkg,
      'icon-sets',
      'outline',
      'outline.icons.json',
    );
    fs.writeFileSync(
      dataPath,
      JSON.stringify({
        ...before,
        variants: ['outline', 'solid'],
        default: {variant: 'outline'},
      }),
    );
    const added = await json(args);
    expect(added.code).toBe(0);
    expect(added.body.data).toMatchObject({
      icon: {id: 'bin', export: 'BinSolidIcon'},
      variant: 'solid',
      changed: true,
    });
    const data = dataOf('outline');
    expect(Object.keys(data)).toContain('variants');
    expect(data.icons[0].variants).toEqual([
      {variant: 'solid', export: 'BinSolidIcon'},
    ]);
    expect(
      fs.readFileSync(
        path.join(pkg, 'icon-sets', 'outline', 'outline.generated.js'),
        'utf-8',
      ),
    ).toContain("export {Cross as BinSolidIcon} from '@acme/glyph-library';");
  });

  it("adds the set's own definition with --new-definition, refusing one Astryx has", async () => {
    const added = await json([
      'experimental',
      'icon',
      'add',
      'Cross',
      '--from',
      '@acme/glyph-library',
      '--new-definition',
      'crossOut',
      '--description',
      'Cross something out.',
      '--words',
      'strike,cross',
    ]);
    expect(added.code).toBe(0);
    expect(
      fs.existsSync(
        path.join(
          pkg,
          'icon-sets',
          'outline',
          'definitions',
          'crossOut.doc.mjs',
        ),
      ),
    ).toBe(true);
    expect(dataOf('outline').map).toEqual({crossOut: 'cross'});
    expect(
      fs.readFileSync(
        path.join(
          pkg,
          'icon-sets',
          'outline',
          'definitions',
          'crossOut.doc.mjs',
        ),
        'utf-8',
      ),
    ).toContain("words: ['strike', 'cross']");
    const refused = await json([
      'experimental',
      'icon',
      'add',
      'Cross',
      '--from',
      '@acme/glyph-library',
      '--new-definition',
      'close',
      '--description',
      'x',
      '--words',
      'x',
    ]);
    expect(refused.code).toBe(1);
    expect(refused.body.suggestions).toContainEqual(
      expect.objectContaining({name: '--definition close'}),
    );
  });

  it('--new-definition that cannot write its definition leaves the generated module, its types, and the set data unchanged', async () => {
    const set = path.join(pkg, 'icon-sets', 'outline');
    const first = await json([
      'experimental',
      'icon',
      'add',
      'Bin',
      '--from',
      '@acme/glyph-library',
      '--definition',
      'delete',
    ]);
    expect(first.code).toBe(0);
    const files = ['outline.generated.js', 'outline.generated.d.ts'].map(name =>
      path.join(set, name),
    );
    files.push(path.join(set, 'outline.icons.json'));
    const before = files.map(file => fs.readFileSync(file, 'utf-8'));
    // A file where the definitions folder belongs: the definition write fails.
    fs.rmSync(path.join(set, 'definitions'), {recursive: true, force: true});
    fs.writeFileSync(path.join(set, 'definitions'), 'not a folder\n');
    const failed = await json([
      'experimental',
      'icon',
      'add',
      'Cross',
      '--from',
      '@acme/glyph-library',
      '--new-definition',
      'crossOut',
      '--description',
      'Cross something out.',
      '--words',
      'strike,cross',
    ]);
    expect(failed.code).toBe(1);
    expect(files.map(file => fs.readFileSync(file, 'utf-8'))).toEqual(before);
    expect(fs.readFileSync(path.join(set, 'definitions'), 'utf-8')).toBe(
      'not a folder\n',
    );
  });

  it('refuses an export the module lacks, with close names, and an unknown definition', async () => {
    const missing = await json([
      'experimental',
      'icon',
      'add',
      'Bim',
      '--from',
      '@acme/glyph-library',
      '--definition',
      'delete',
    ]);
    expect(missing.code).toBe(1);
    expect(
      missing.body.suggestions.map((/** @type {any} */ s) => s.name),
    ).toContain('Bin');
    const unknown = await json([
      'experimental',
      'icon',
      'add',
      'Bin',
      '--from',
      '@acme/glyph-library',
      '--definition',
      'trashCan',
    ]);
    expect(unknown.code).toBe(1);
  });

  it('a default export, or a value through the declared adapter', async () => {
    const rocket = await json([
      'experimental',
      'icon',
      'add',
      'Rocket',
      '--from',
      '@acme/glyph-library/rocket',
      '--default',
      '--definition',
      'rocket',
    ]);
    expect(rocket.code).toBe(0);
    const refused = await json([
      'experimental',
      'icon',
      'add',
      'glyphData',
      '--from',
      '@acme/glyph-library',
      '--definition',
      'activity',
    ]);
    expect(refused.code).toBe(1);
    expect(refused.body.error).toContain('adapter');

    const dataFile = path.join(
      pkg,
      'icon-sets',
      'outline',
      'outline.icons.json',
    );
    const data = JSON.parse(fs.readFileSync(dataFile, 'utf-8'));
    data.adapter = {module: './src/adapt.js', export: 'adapt'};
    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
    fs.mkdirSync(path.join(pkg, 'src'));
    fs.writeFileSync(
      path.join(pkg, 'src', 'adapt.js'),
      'export function adapt(data) { return () => null; }\n',
    );
    const adapted = await json([
      'experimental',
      'icon',
      'add',
      'glyphData',
      '--from',
      '@acme/glyph-library',
      '--definition',
      'activity',
    ]);
    expect(adapted.code).toBe(0);
    expect(adapted.body.data.icon.export).toBe('GlyphDataIcon');
    const generated = fs.readFileSync(
      path.join(pkg, 'icon-sets', 'outline', 'outline.generated.js'),
      'utf-8',
    );
    expect(generated).toContain(
      "import {adapt as adaptIcon} from '../../src/adapt.js';",
    );
    expect(generated).toContain(
      'export const GlyphDataIcon = adaptIcon(GlyphDataIconSource);',
    );
    expect(generated).toContain(
      "export {default as RocketIcon} from '@acme/glyph-library/rocket';",
    );
  });
});

describe('experimental icon map and new-definition', () => {
  beforeEach(async () => {
    await runCli(
      [
        'experimental',
        'icon',
        'new-set',
        'outline',
        '--from',
        '@acme/glyph-library',
      ],
      pkg,
    );
  });

  it('maps, remaps, and removes an entry; refuses an unknown definition or icon', async () => {
    const mapped = await json([
      'experimental',
      'icon',
      'map',
      'close',
      'cross',
    ]);
    expect(mapped.body.data).toMatchObject({
      definition: 'close',
      icon: 'cross',
      changed: true,
    });
    expect(dataOf('outline').map.close).toBe('cross');
    const removed = await json([
      'experimental',
      'icon',
      'map',
      'close',
      '--remove',
    ]);
    expect(removed.body.data).toMatchObject({icon: null, previous: 'cross'});
    expect(dataOf('outline').map).not.toHaveProperty('close');
    const unknown = await json([
      'experimental',
      'icon',
      'map',
      'rotate',
      'cross',
    ]);
    expect(unknown.code).toBe(1);
    expect(unknown.body.suggestions).toContainEqual(
      expect.objectContaining({
        name: 'astryx experimental icon new-definition rotate --set outline',
      }),
    );
    const noIcon = await json([
      'experimental',
      'icon',
      'map',
      'close',
      'crosss',
    ]);
    expect(noIcon.code).toBe(1);
    expect(noIcon.body.suggestions).toContainEqual(
      expect.objectContaining({name: 'cross'}),
    );
  });

  it("adds the set's own definition, mapped with --icon", async () => {
    const {code, body} = await json([
      'experimental',
      'icon',
      'new-definition',
      'crossOut',
      '--description',
      'Cross something out.',
      '--words',
      'strike,cross',
      '--icon',
      'cross',
    ]);
    expect(code).toBe(0);
    expect(body.data).toMatchObject({
      kind: 'icon-definition',
      name: 'crossOut',
    });
    expect(dataOf('outline').map.crossOut).toBe('cross');
    const again = await json([
      'experimental',
      'icon',
      'new-definition',
      'crossOut',
      '--description',
      'x',
      '--words',
      'x',
    ]);
    expect(again.code).toBe(1);
    expect(again.body.code).toBe('ERR_FILE_EXISTS');
  });
});

describe('experimental icon use', () => {
  it("writes the project's experimental.iconSet, creating astryx.config.mjs, and refuses a set that is not installed", async () => {
    const app = writeIconSetProject(tmp);
    const used = await json(['experimental', 'icon', 'use', 'glyphs'], app);
    expect(used.code).toBe(0);
    expect(used.body.data).toMatchObject({
      iconSet: 'glyphs',
      set: '@acme/glyphs/glyphs',
      created: true,
      changed: true,
    });
    expect(
      fs.readFileSync(path.join(app, 'astryx.config.mjs'), 'utf-8'),
    ).toMatch(/experimental: \{\s*iconSet: 'glyphs',?\s*\}/);
    const again = await json(
      ['experimental', 'icon', 'use', '@acme/glyphs/glyphs'],
      app,
    );
    expect(again.body.data).toMatchObject({
      previous: 'glyphs',
      changed: true,
      created: false,
    });
    const missing = await json(['experimental', 'icon', 'use', 'glyps'], app);
    expect(missing.code).toBe(1);
    expect(missing.body.suggestions).toContainEqual(
      expect.objectContaining({name: 'glyphs'}),
    );
  });

  it('warns in the receipt when the project may run a CLI that refuses experimental.iconSet', async () => {
    const app = writeIconSetProject(tmp);
    const pkgFile = path.join(app, 'package.json');
    const pkgJson = JSON.parse(fs.readFileSync(pkgFile, 'utf-8'));
    // No CLI range declared: nothing says which CLI it runs.
    const none = await json(['experimental', 'icon', 'use', 'glyphs'], app);
    expect(none.body.data).not.toHaveProperty('warning');
    pkgJson.devDependencies = {'@astryxdesign/cli': '^0.7.0'};
    fs.writeFileSync(pkgFile, JSON.stringify(pkgJson));
    const old = await json(['experimental', 'icon', 'use', 'glyphs'], app);
    expect(old.code).toBe(0);
    expect(old.body.data.warning).toContain(
      'range "^0.7.0" (devDependencies) admits a release before 0.7.4',
    );
    expect(old.body.data.warning).toContain('"Unrecognized key"');
    expect(old.body.data.warning).toContain(
      'commands that load the project configuration, such as `doctor` and `discover`, fail there',
    );
    expect(old.body.data.warning).not.toContain('every command');
    const text = await runCli(['experimental', 'icon', 'use', 'glyphs'], app);
    expect(text.stdout).toContain(
      "[warn] The project's @astryxdesign/cli range",
    );
    // Published 0.7.3 still refuses the key.
    pkgJson.devDependencies = {'@astryxdesign/cli': '^0.7.3'};
    fs.writeFileSync(pkgFile, JSON.stringify(pkgJson));
    const previous = await json(['experimental', 'icon', 'use', 'glyphs'], app);
    expect(previous.body.data.warning).toContain(
      'range "^0.7.3" (devDependencies) admits a release before 0.7.4',
    );
    pkgJson.devDependencies = {'@astryxdesign/cli': '^0.7.4'};
    fs.writeFileSync(pkgFile, JSON.stringify(pkgJson));
    const current = await json(['experimental', 'icon', 'use', 'glyphs'], app);
    expect(current.body.data).not.toHaveProperty('warning');
  });

  it('writes a plain existing config, keeping its other fields', async () => {
    const app = writeIconSetProject(tmp);
    const config = path.join(app, 'astryx.config.mjs');
    fs.writeFileSync(config, 'export default {\n  integrations: [],\n};\n');
    const used = await json(['experimental', 'icon', 'use', 'glyphs'], app);
    expect(used.code).toBe(0);
    expect(used.body.data).toMatchObject({created: false, changed: true});
    const written = fs.readFileSync(config, 'utf-8');
    expect(written).toContain('integrations: []');
    expect(written).toMatch(/iconSet: 'glyphs'/);
  });

  it('refuses a config reached through a symbolic link, leaving its target untouched', async () => {
    const app = writeIconSetProject(tmp);
    const target = path.join(tmp, 'shared.config.mjs');
    const before = 'export default {\n  integrations: [],\n};\n';
    fs.writeFileSync(target, before);
    fs.symlinkSync(target, path.join(app, 'astryx.config.mjs'));
    const refused = await json(['experimental', 'icon', 'use', 'glyphs'], app);
    expect(refused.code).toBe(1);
    expect(refused.body.code).toBe('ERR_CODEMOD_PROTECTED');
    expect(refused.body.error).toContain('symbolic link at astryx.config.mjs');
    expect(fs.readFileSync(target, 'utf-8')).toBe(before);
    expect(
      fs.lstatSync(path.join(app, 'astryx.config.mjs')).isSymbolicLink(),
    ).toBe(true);
  });

  it('refuses a generated config, naming the marker that protects it', async () => {
    const app = writeIconSetProject(tmp);
    const config = path.join(app, 'astryx.config.mjs');
    const before = '// @generated\nexport default {\n  integrations: [],\n};\n';
    fs.writeFileSync(config, before);
    const refused = await json(['experimental', 'icon', 'use', 'glyphs'], app);
    expect(refused.code).toBe(1);
    expect(refused.body.code).toBe('ERR_CODEMOD_PROTECTED');
    expect(refused.body.error).toContain(
      '@generated in the leading comment block',
    );
    expect(fs.readFileSync(config, 'utf-8')).toBe(before);
  });
});

describe('a library of icon data, through the adapter', () => {
  beforeEach(() => {
    const lib = path.join(pkg, 'node_modules', '@acme', 'glyph-data');
    fs.mkdirSync(lib, {recursive: true});
    fs.writeFileSync(
      path.join(lib, 'package.json'),
      JSON.stringify({
        name: '@acme/glyph-data',
        version: '1.0.0',
        type: 'module',
        exports: {'.': './index.js'},
      }),
    );
    fs.writeFileSync(
      path.join(lib, 'index.js'),
      [
        "export const glyphEye = {path: 'M1 1'};",
        "export const glyphEyeOff = {path: 'M1 2'};",
        "export const glyphTrash = {path: 'M2 2'};",
        "export const glyphX = {path: 'M3 3'};",
        '',
      ].join('\n'),
    );
    fs.mkdirSync(path.join(pkg, 'src'));
    fs.writeFileSync(
      path.join(pkg, 'src', 'adapt.js'),
      'export function adapt(data) { return () => null; }\n',
    );
    fs.writeFileSync(
      path.join(pkg, 'index.js'),
      "export * from './icon-sets/outline/outline.generated.js';\n",
    );
  });

  /** Declare the adapter in the set's data file. */
  const declareAdapter = () => {
    const file = path.join(pkg, 'icon-sets', 'outline', 'outline.icons.json');
    const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
    data.adapter = {module: './src/adapt.js', export: 'adapt'};
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
  };
  const generated = () =>
    fs.readFileSync(
      path.join(pkg, 'icon-sets', 'outline', 'outline.generated.js'),
      'utf-8',
    );

  it('the bulk wrap finds nothing until the adapter is declared, then wraps every data export without the shared prefix', async () => {
    const before = await json([
      'experimental',
      'icon',
      'new-set',
      'outline',
      '--from',
      '@acme/glyph-data',
    ]);
    expect(before.code).toBe(1);
    expect(before.body.error).toContain('adapter');
    await runCli(['experimental', 'icon', 'new-set', 'outline'], pkg);
    declareAdapter();
    const wrapped = await json([
      'experimental',
      'icon',
      'new-set',
      'outline',
      '--from',
      '@acme/glyph-data',
    ]);
    expect(wrapped.code).toBe(0);
    expect(
      dataOf('outline').icons.map((/** @type {any} */ i) => [i.id, i.export]),
    ).toEqual([
      ['eye', 'EyeIcon'],
      ['eye-off', 'EyeOffIcon'],
      ['trash', 'TrashIcon'],
      ['x', 'XIcon'],
    ]);
    expect(generated()).toContain(
      'export const EyeIcon = adaptIcon(EyeIconSource);',
    );
    expect(generated()).toContain(
      "import {glyphEye as EyeIconSource} from '@acme/glyph-data';",
    );
  });

  it('icon add appended twice writes the adapter import once, and the module still parses', async () => {
    await runCli(['experimental', 'icon', 'new-set', 'outline'], pkg);
    declareAdapter();
    for (const [name, definition] of [
      ['glyphTrash', 'delete'],
      ['glyphEye', 'view'],
      ['glyphX', 'close'],
    ]) {
      const added = await json([
        'experimental',
        'icon',
        'add',
        name,
        '--from',
        '@acme/glyph-data',
        ...(definition === 'view'
          ? [
              '--new-definition',
              'peek',
              '--description',
              'Peek.',
              '--words',
              'peek',
            ]
          : ['--definition', definition]),
      ]);
      expect(added.code, name).toBe(0);
    }
    const text = generated();
    expect(text.match(/as adaptIcon/gu)).toHaveLength(1);
    // The library prefix is left out of the id and the export name.
    expect(dataOf('outline').map).toMatchObject({delete: 'trash', close: 'x'});
    expect(text).toContain(
      'export const TrashIcon = adaptIcon(TrashIconSource);',
    );
    // A built-in mapping lands in the theme map, and the types follow.
    expect(text).toContain(
      "close: createElement(XIcon, {'aria-hidden': true, 'width': '1em', 'height': '1em'}),",
    );
    const types = fs.readFileSync(
      path.join(pkg, 'icon-sets', 'outline', 'outline.generated.d.ts'),
      'utf-8',
    );
    expect(types).toContain(
      'export declare const TrashIcon: ComponentType<SVGProps<SVGSVGElement>>;',
    );
    expect(types).toContain(
      'export declare const themeIcons: {readonly close: ReactElement};',
    );
    // icon map rewrites the theme map.
    await json(['experimental', 'icon', 'map', 'close', 'trash']);
    expect(generated()).toContain('close: createElement(TrashIcon,');
    // Integration check reads it all: no parse error, no missing export, no
    // theme-map or types mismatch.
    const check = await runCli(['integration', 'check', '--json'], pkg);
    const codes = JSON.stringify(JSON.parse(check.stdout));
    for (const code of [
      'icon_module_invalid',
      'icon_export_missing',
      'icon_theme_map_mismatch',
      'icon_generated_types_mismatch',
    ]) {
      expect(codes, code).not.toContain(code);
    }
    // The optional definitions left unmapped are listed, never issues.
    expect(codes).not.toContain('"severity":"info"');
    const printed = await runCli(['integration', 'check'], pkg);
    expect(printed.stdout).toContain('Unmapped icon definitions (optional)');
    expect(printed.stdout).toContain(
      'Mapping these is optional and never fails',
    );
  }, 60_000);
});

describe('the library prefix ignores constants', () => {
  beforeEach(() => {
    const lib = path.join(pkg, 'node_modules', '@acme', 'glyph-data');
    fs.mkdirSync(lib, {recursive: true});
    fs.writeFileSync(
      path.join(lib, 'package.json'),
      JSON.stringify({
        name: '@acme/glyph-data',
        version: '1.0.0',
        type: 'module',
        exports: {'.': './index.js'},
      }),
    );
    fs.writeFileSync(
      path.join(lib, 'index.js'),
      [
        "export const glyphEye = {path: 'M1 1'};",
        "export const glyphTrash = {path: 'M2 2'};",
        "export const glyphX = {path: 'M3 3'};",
        "export const README = 'See the docs.';",
        "export const notes = 'Some notes.';",
        'export const count = 5;',
        "export const meta = {kind: 'meta'};",
        '',
      ].join('\n'),
    );
    fs.mkdirSync(path.join(pkg, 'src'));
    fs.writeFileSync(
      path.join(pkg, 'src', 'adapt.js'),
      'export function adapt(data) { return () => null; }\n',
    );
  });

  /** Create the set with an adapter. */
  const setUp = async () => {
    await runCli(['experimental', 'icon', 'new-set', 'outline'], pkg);
    const file = path.join(pkg, 'icon-sets', 'outline', 'outline.icons.json');
    const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
    data.adapter = {module: './src/adapt.js', export: 'adapt'};
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
  };
  const exportsOf = () =>
    dataOf('outline').icons.map((/** @type {any} */ i) => i.export);
  const wrap = (/** @type {string[]} */ extra = []) =>
    json([
      'experimental',
      'icon',
      'new-set',
      'outline',
      '--from',
      '@acme/glyph-data',
      ...extra,
    ]);

  it('skips SCREAMING_CASE names, numbers, and stray strings; --exclude drops a non-icon object, and the refresh prunes the old exports', async () => {
    await setUp();
    // meta is shaped like an icon, so it keeps the prefix off.
    expect((await wrap()).code).toBe(0);
    expect(exportsOf()).toEqual([
      'GlyphEyeIcon',
      'GlyphTrashIcon',
      'GlyphXIcon',
      'MetaIcon',
    ]);
    expect((await wrap(['--exclude', 'meta'])).code).toBe(0);
    expect(exportsOf()).toEqual(['EyeIcon', 'TrashIcon', 'XIcon']);
    const generated = fs.readFileSync(
      path.join(pkg, 'icon-sets', 'outline', 'outline.generated.js'),
      'utf-8',
    );
    expect(generated).not.toContain('Glyph');
    expect(generated).not.toContain('README');
    expect(generated).not.toContain('notes');
    // icon add reuses the icon the wrap already made for an export, even
    // though meta keeps its own prefix off.
    const added = await json([
      'experimental',
      'icon',
      'add',
      'glyphTrash',
      '--from',
      '@acme/glyph-data',
      '--definition',
      'delete',
    ]);
    expect(added.code).toBe(0);
    expect(added.body.data.icon).toMatchObject({
      id: 'trash',
      export: 'TrashIcon',
    });
    expect(exportsOf()).toEqual(['EyeIcon', 'TrashIcon', 'XIcon']);
  });

  it('--exclude needs --from', async () => {
    const res = await json([
      'experimental',
      'icon',
      'new-set',
      'outline',
      '--exclude',
      'README',
    ]);
    expect(res.code).toBe(1);
    expect(res.body.error).toContain('--from');
  });

  it('a library of SVG strings keeps its strings as icons', async () => {
    fs.writeFileSync(
      path.join(pkg, 'node_modules', '@acme', 'glyph-data', 'index.js'),
      [
        "export const glyphEye = '<svg/>';",
        "export const glyphSun = '<svg/>';",
        "export const VERSION = '1.0.0';",
        '',
      ].join('\n'),
    );
    await setUp();
    expect((await wrap()).code).toBe(0);
    expect(exportsOf()).toEqual(['EyeIcon', 'SunIcon']);
  });
});

describe('module resolution', () => {
  it('resolves the library from a set package nested deeper than six folders below node_modules', async () => {
    const deep = path.join(tmp, 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'icons');
    fs.mkdirSync(path.dirname(deep), {recursive: true});
    fs.renameSync(pkg, deep);
    // The library is installed at the top, as a hoisting package manager does.
    fs.mkdirSync(path.join(tmp, 'node_modules', '@acme'), {recursive: true});
    fs.renameSync(
      path.join(deep, 'node_modules', '@acme', 'glyph-library'),
      path.join(tmp, 'node_modules', '@acme', 'glyph-library'),
    );
    pkg = deep;
    await runCli(['experimental', 'icon', 'new-set', 'outline'], pkg);
    const added = await json([
      'experimental',
      'icon',
      'add',
      'Bin',
      '--from',
      '@acme/glyph-library',
      '--definition',
      'delete',
    ]);
    expect(added.code).toBe(0);
    fs.writeFileSync(
      path.join(pkg, 'index.js'),
      "export * from './icon-sets/outline/outline.generated.js';\n",
    );
    const check = await runCli(['integration', 'check', '--json'], pkg);
    expect(check.stdout).not.toContain('icon_export_missing');
  }, 60_000);
});
