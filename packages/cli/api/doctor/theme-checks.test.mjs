// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @file Fault-injection coverage for all ten app-theme doctor checks. */

import {afterEach, describe, expect, it} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {checkAppThemes} from './theme-checks.mjs';
import {themeAdd} from '../theme/add/add.mjs';
import {themeEject} from '../theme/eject/eject.mjs';
import {themeBuild} from '../theme/build/build.mjs';
import {parseThemeModuleRecord} from '../../foundation/config/theme-state.mjs';

/** @type {string[]} */
const dirs = [];

/** @param {string} file @param {string} content */
function write(file, content) {
  fs.mkdirSync(path.dirname(file), {recursive: true});
  fs.writeFileSync(file, content);
}

/**
 * @param {Array<{slug: string, css?: string, fontFamily?: string, fontCss?: string}>} themeSpecs
 * @param {{peerRange?: string, importModule?: boolean}} [options]
 */
async function fixture(themeSpecs = [{slug: 'ocean'}], options = {}) {
  const dir = fs.mkdtempSync(
    path.join(process.cwd(), '.astryx-doctor-themes-'),
  );
  dirs.push(dir);
  fs.mkdirSync(path.join(dir, 'src'), {recursive: true});
  write(path.join(dir, 'tsconfig.json'), '{}\n');
  write(
    path.join(dir, 'package.json'),
    JSON.stringify({
      name: 'doctor-app',
      private: true,
      dependencies: {
        '@acme/themes': '1.0.0',
        '@astryxdesign/core': '1.0.0',
      },
    }),
  );
  write(
    path.join(dir, 'node_modules/@astryxdesign/core/package.json'),
    JSON.stringify({name: '@astryxdesign/core', version: '1.0.0'}),
  );

  const packageDir = path.join(dir, 'node_modules/@acme/themes');
  const exportsMap = {};
  for (const spec of themeSpecs) {
    exportsMap[`./themes/${spec.slug}`] = `./dist/${spec.slug}.js`;
    exportsMap[`./themes/${spec.slug}.css`] = `./dist/${spec.slug}.css`;
    if (spec.fontCss != null) {
      exportsMap[`./themes/${spec.slug}.fonts.css`] =
        `./dist/${spec.slug}.fonts.css`;
    }
  }
  write(
    path.join(packageDir, 'package.json'),
    JSON.stringify({
      name: '@acme/themes',
      version: '1.0.0',
      type: 'module',
      peerDependencies: {
        '@astryxdesign/core': options.peerRange ?? '^1.0.0',
      },
      exports: exportsMap,
    }),
  );
  write(
    path.join(packageDir, 'astryx.integration.mjs'),
    "export default {themes: './themes'};\n",
  );

  for (const spec of themeSpecs) {
    const exportName = `${spec.slug}Theme`;
    const sourceDir = path.join(packageDir, 'themes', spec.slug);
    const fontProperty = spec.fontFamily
      ? `, fontFamily: ${JSON.stringify(spec.fontFamily)}`
      : '';
    write(
      path.join(sourceDir, `${exportName}.doc.mjs`),
      `/** @type {import('@astryxdesign/cli/authoring').ThemeDoc} */\nexport default {type: 'theme', name: '${spec.slug}', displayName: '${spec.slug}', description: '${spec.slug} theme.', maintained: true};\n`,
    );
    write(
      path.join(sourceDir, `${exportName}.ts`),
      `export const ${exportName} = {name: '${spec.slug}', tokens: {}${fontProperty}};\n`,
    );
    write(
      path.join(packageDir, `dist/${spec.slug}.js`),
      `export const ${exportName} = {name: '${spec.slug}', tokens: {}${fontProperty}};\n`,
    );
    write(
      path.join(packageDir, `dist/${spec.slug}.css`),
      spec.css ??
        `[data-astryx-theme="${spec.slug}"] { --color-text: black; }\n`,
    );
    if (spec.fontCss != null) {
      write(path.join(packageDir, `dist/${spec.slug}.fonts.css`), spec.fontCss);
    }
    await themeAdd(spec.slug, {cwd: dir, package: '@acme/themes'});
  }

  if (options.importModule !== false) {
    write(
      path.join(dir, 'src/index.tsx'),
      "import {themes, defaultThemeSlug} from './astryx-themes';\nvoid themes[defaultThemeSlug];\n",
    );
  }
  return {dir, packageDir, moduleFile: path.join(dir, 'src/astryx-themes.ts')};
}

/** @param {Awaited<ReturnType<typeof checkAppThemes>>} checks @param {string} id */
function check(checks, id) {
  const result = checks.find(item => item.id === id);
  if (!result) throw new Error(`Missing doctor check ${id}`);
  return result;
}

afterEach(() => {
  while (dirs.length > 0) {
    fs.rmSync(dirs.pop(), {recursive: true, force: true});
  }
});

describe('app-theme doctor checks', () => {
  it('returns ten positive passes for a healthy package theme', async () => {
    const {dir} = await fixture();
    const checks = await checkAppThemes(dir);

    expect(checks.map(item => item.id)).toEqual([
      'theme-owners',
      'theme-module',
      'theme-module-import',
      'theme-stylesheet-imports',
      'theme-local-builds',
      'theme-private-variables',
      'theme-core-peers',
      'theme-default',
      'theme-fonts',
      'theme-global-rules',
    ]);
    expect(checks.map(item => item.status)).toEqual(Array(10).fill('pass'));
  });

  it('check 1 fails when a recorded built stylesheet no longer resolves', async () => {
    const {dir, packageDir} = await fixture();
    fs.rmSync(path.join(packageDir, 'dist/ocean.css'));

    expect(check(await checkAppThemes(dir), 'theme-owners')).toMatchObject({
      status: 'fail',
      fix: expect.stringContaining('theme add ocean'),
    });
  });

  it('check 2 fails when the generated module is hand-edited', async () => {
    const {dir, moduleFile} = await fixture();
    fs.appendFileSync(moduleFile, '// hand edit\n');

    expect(check(await checkAppThemes(dir), 'theme-module')).toMatchObject({
      status: 'fail',
      fix: expect.stringContaining('theme use ocean'),
    });
  });

  it('check 3 warns when no project source imports the generated module', async () => {
    const {dir} = await fixture([{slug: 'ocean'}], {importModule: false});

    expect(
      check(await checkAppThemes(dir), 'theme-module-import'),
    ).toMatchObject({
      status: 'warn',
      fix: expect.stringContaining('themes[defaultThemeSlug]'),
    });
  });

  it('check 4 fails when a built module import loses its stylesheet pair', async () => {
    const {dir, moduleFile} = await fixture();
    const source = fs
      .readFileSync(moduleFile, 'utf-8')
      .replace('import "@acme/themes/themes/ocean.css";\n', '');
    fs.writeFileSync(moduleFile, source);

    expect(
      check(await checkAppThemes(dir), 'theme-stylesheet-imports'),
    ).toMatchObject({
      status: 'fail',
      fix: expect.stringContaining('theme use ocean'),
    });
  });

  it('check 5 fails when an added local theme cannot reproduce its outputs', async () => {
    const {dir} = await fixture();
    await themeEject('ocean', {cwd: dir, package: '@acme/themes'});
    const localDir = path.join(dir, 'src/themes/ocean');
    const sourceFile = path.join(localDir, 'oceanTheme.ts');
    fs.writeFileSync(
      sourceFile,
      "const oceanTheme = {name: 'ocean', tokens: {'--color-bg': '#000'}};\nexport {oceanTheme};\nexport default oceanTheme;\n",
    );
    await themeBuild(sourceFile, {}, {cwd: dir});
    await themeAdd('ocean', {cwd: dir});
    expect(
      parseThemeModuleRecord(
        fs.readFileSync(path.join(dir, 'src/astryx-themes.ts'), 'utf-8'),
      ),
    ).toMatchObject({themes: {ocean: './src/themes'}});
    fs.appendFileSync(path.join(localDir, 'ocean.css'), '\n.injected {}\n');

    expect(
      check(await checkAppThemes(dir), 'theme-local-builds'),
    ).toMatchObject({
      status: 'fail',
      fix: expect.stringContaining('theme build'),
    });
  });

  it('check 6 ignores private variables generated from guaranteed component properties', async () => {
    const {dir, packageDir} = await fixture([
      {
        slug: 'ocean',
        css: '[data-astryx-theme="ocean"] { --_button-radius: var(--radius-full); }\n',
      },
    ]);
    write(
      path.join(packageDir, 'themes/ocean/oceanTheme.ts'),
      "export const oceanTheme = {name: 'ocean', tokens: {}, components: {button: {base: {borderRadius: 'var(--radius-full)'}}}};\n",
    );

    expect(
      check(await checkAppThemes(dir), 'theme-private-variables'),
    ).toMatchObject({status: 'pass'});
  });

  it('check 6 fails on a private --_* key in theme input', async () => {
    const {dir, packageDir} = await fixture();
    write(
      path.join(packageDir, 'themes/ocean/oceanTheme.ts'),
      "export const oceanTheme = {name: 'ocean', tokens: {}, components: {button: {base: {'--_button-radius': '2px'}}}};\n",
    );

    const result = check(await checkAppThemes(dir), 'theme-private-variables');
    expect(result).toMatchObject({status: 'fail'});
    expect(result.message).toContain('--_button-radius');
  });

  it('check 7 fails when a theme peer range rejects installed Core', async () => {
    const {dir} = await fixture([{slug: 'ocean'}], {peerRange: '^9.0.0'});

    const result = check(await checkAppThemes(dir), 'theme-core-peers');
    expect(result).toMatchObject({
      status: 'fail',
      fix: expect.stringContaining('npm install'),
    });
    expect(result.message).toContain('^9.0.0');
  });

  it('check 8 fails when the static default is not an added slug', async () => {
    const {dir, moduleFile} = await fixture();
    const source = fs
      .readFileSync(moduleFile, 'utf-8')
      .replace('"defaultThemeSlug":"ocean"', '"defaultThemeSlug":"ghost"');
    fs.writeFileSync(moduleFile, source);

    expect(check(await checkAppThemes(dir), 'theme-default')).toMatchObject({
      status: 'fail',
      fix: expect.stringContaining('theme use ocean'),
    });
  });

  it('check 9 warns when a named font has no stylesheet loader', async () => {
    const {dir} = await fixture([{slug: 'ocean', fontFamily: 'Ocean Sans'}]);

    const checks = await checkAppThemes(dir);
    const result = check(checks, 'theme-fonts');
    expect(result).toMatchObject({
      status: 'warn',
      fix: expect.stringContaining('fonts.css'),
    });
    expect(result.message).toContain('Ocean Sans');
    expect(checks.some(item => item.status === 'fail')).toBe(false);
  });

  it('check 9 warns when a local theme has no font stylesheet', async () => {
    const {dir} = await fixture([{slug: 'ocean', fontFamily: 'Ocean Sans'}]);
    await themeEject('ocean', {cwd: dir, package: '@acme/themes'});
    const sourceFile = path.join(dir, 'src/themes/ocean/oceanTheme.ts');
    await themeBuild(sourceFile, {}, {cwd: dir});
    await themeAdd('ocean', {cwd: dir});

    const checks = await checkAppThemes(dir);
    expect(check(checks, 'theme-fonts')).toMatchObject({
      status: 'warn',
      message: expect.stringContaining('Ocean Sans'),
      fix: expect.stringContaining('<slug>.fonts.css'),
    });
    expect(checks.some(item => item.status === 'fail')).toBe(false);
  });

  it('check 9 passes when a local @font-face proves the named family', async () => {
    const {dir} = await fixture([
      {
        slug: 'ocean',
        fontFamily: 'Ocean Sans',
        fontCss:
          '@font-face { font-family: "Ocean Sans"; src: url("./ocean.woff2"); }\n',
      },
    ]);

    expect(check(await checkAppThemes(dir), 'theme-fonts')).toMatchObject({
      status: 'pass',
    });
  });

  it('check 9 warns when an external import cannot prove the named family', async () => {
    const {dir} = await fixture([
      {
        slug: 'ocean',
        fontFamily: 'Ocean Sans',
        fontCss: '@import url("https://fonts.example/ocean.css");\n',
      },
    ]);

    expect(check(await checkAppThemes(dir), 'theme-fonts')).toMatchObject({
      status: 'warn',
      message: expect.stringContaining('Ocean Sans'),
    });
  });

  it('check 10 fails on conflicting unscoped rules across added themes', async () => {
    const {dir} = await fixture([
      {slug: 'ocean', css: 'body { color: blue; }\n'},
      {slug: 'sunset', css: 'body { color: red; }\n'},
    ]);

    const result = check(await checkAppThemes(dir), 'theme-global-rules');
    expect(result).toMatchObject({status: 'fail'});
    expect(result.message).toContain('body');
  });

  it('reports one information check when the CLI manages no themes', async () => {
    const dir = fs.mkdtempSync(
      path.join(process.cwd(), '.astryx-doctor-empty-'),
    );
    dirs.push(dir);
    write(path.join(dir, 'package.json'), '{"name":"empty"}\n');

    const checks = await checkAppThemes(dir);
    expect(checks).toEqual([
      expect.objectContaining({
        id: 'theme-management',
        status: 'info',
        message: expect.stringContaining('manages no themes'),
        fix: expect.stringContaining('theme add <slug>'),
      }),
    ]);
  });

  it('names an unmigrated copy without failing a project that has no module', async () => {
    const dir = fs.mkdtempSync(
      path.join(process.cwd(), '.astryx-doctor-unmigrated-'),
    );
    dirs.push(dir);
    write(path.join(dir, 'package.json'), '{"name":"empty"}\n');
    write(
      path.join(dir, 'src/themes/ocean/oceanTheme.ts'),
      'export const oceanTheme = {};\n',
    );

    const checks = await checkAppThemes(dir);

    expect(checks).toHaveLength(2);
    expect(checks.some(item => item.status === 'fail')).toBe(false);
    expect(checks).toContainEqual(
      expect.objectContaining({
        id: 'theme-unmigrated-copies',
        status: 'warn',
        message: expect.stringContaining('src/themes/ocean'),
        fix: expect.stringContaining('upgrade --from 0.6.4 --path . --apply'),
      }),
    );
  });
});
