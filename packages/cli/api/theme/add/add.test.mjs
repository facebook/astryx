// Copyright (c) Meta Platforms, Inc. and affiliates.

import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {themeAdd} from './add.mjs';
import {themeEject} from '../eject/eject.mjs';
import {
  THEME_MODULE_MARKER,
  parseThemeModuleRecord,
} from '../../../foundation/config/theme-state.mjs';

let tmpDir;

function installTheme(
  slug = 'ocean',
  packageName = '@acme/themes',
  options = {},
) {
  const packageDir = path.join(
    tmpDir,
    'node_modules',
    ...packageName.split('/'),
  );
  const sourceDir = path.join(packageDir, 'themes', slug);
  const exportName = `${slug}Theme`;
  fs.mkdirSync(sourceDir, {recursive: true});
  fs.mkdirSync(path.join(packageDir, 'dist'), {recursive: true});
  fs.writeFileSync(
    path.join(packageDir, 'package.json'),
    JSON.stringify({
      name: packageName,
      version: '1.0.0',
      type: 'module',
      exports: {
        [`./themes/${slug}`]: `./dist/${slug}.js`,
        [`./themes/${slug}.css`]: `./dist/${slug}.css`,
      },
    }),
  );
  fs.writeFileSync(
    path.join(packageDir, 'astryx.integration.mjs'),
    "export default {themes: './themes'};\n",
  );
  fs.writeFileSync(
    path.join(sourceDir, `${exportName}.doc.mjs`),
    `/** @type {import('@astryxdesign/cli/authoring').ThemeDoc} */\nexport default {type: 'theme', name: '${slug}', displayName: '${slug}', description: '${slug} theme.', maintained: true};\n`,
  );
  fs.writeFileSync(
    path.join(sourceDir, `${exportName}.ts`),
    `export const ${exportName} = {};\n`,
  );
  if (!options.missingBuilt) {
    fs.writeFileSync(
      path.join(packageDir, `dist/${slug}.js`),
      `export const ${exportName} = {name: '${slug}', __built: true};\n`,
    );
    fs.writeFileSync(
      path.join(packageDir, `dist/${slug}.css`),
      `[data-astryx-theme="${slug}"] {}\n`,
    );
  }
  const pkg = JSON.parse(
    fs.readFileSync(path.join(tmpDir, 'package.json'), 'utf-8'),
  );
  pkg.dependencies[packageName] = '^1.0.0';
  fs.writeFileSync(
    path.join(tmpDir, 'package.json'),
    `${JSON.stringify(pkg)}\n`,
  );
}

function installBuiltThemePackage(slug) {
  const packageName = `@astryxdesign/theme-${slug}`;
  const packageDir = path.join(
    tmpDir,
    'node_modules',
    ...packageName.split('/'),
  );
  const exportName = `${slug}Theme`;
  fs.mkdirSync(path.join(packageDir, 'dist'), {recursive: true});
  fs.writeFileSync(
    path.join(packageDir, 'package.json'),
    JSON.stringify({
      name: packageName,
      version: '1.0.0',
      type: 'module',
      exports: {
        './built': './dist/built.js',
        './theme.css': './dist/theme.css',
      },
    }),
  );
  fs.writeFileSync(
    path.join(packageDir, 'dist/built.js'),
    `export const ${exportName} = {name: '${slug}', __built: true};\n`,
  );
  fs.writeFileSync(
    path.join(packageDir, 'dist/theme.css'),
    `[data-astryx-theme="${slug}"] {}\n`,
  );
  const pkg = JSON.parse(
    fs.readFileSync(path.join(tmpDir, 'package.json'), 'utf-8'),
  );
  pkg.dependencies[packageName] = '^1.0.0';
  fs.writeFileSync(
    path.join(tmpDir, 'package.json'),
    `${JSON.stringify(pkg)}\n`,
  );
}

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(process.cwd(), '.astryx-theme-add-app-'));
  fs.mkdirSync(path.join(tmpDir, 'src'));
  fs.writeFileSync(
    path.join(tmpDir, 'package.json'),
    JSON.stringify({name: 'app', dependencies: {}}),
  );
  fs.writeFileSync(path.join(tmpDir, 'tsconfig.json'), '{}\n');
});

afterEach(() => {
  fs.rmSync(tmpDir, {recursive: true, force: true});
});

describe('themeAdd', () => {
  it('keeps the released source-copy response and works without built exports', async () => {
    installTheme('ocean', '@acme/themes', {missingBuilt: true});

    const result = await themeAdd('ocean', {
      cwd: tmpDir,
      package: '@acme/themes',
    });

    expect(result).toMatchObject({
      type: 'theme.add',
      data: {
        slug: 'ocean',
        displayName: 'ocean',
        maintained: true,
        package: '@acme/themes',
        outputDir: 'src/themes/ocean',
        entry: 'oceanTheme.ts',
        exportName: 'oceanTheme',
        files: ['oceanTheme.ts', 'oceanTheme.doc.mjs'],
      },
      meta: {
        deprecations: [
          {
            id: 'DEP-0005',
            replacements: ['theme eject', 'theme add --import'],
          },
        ],
      },
    });
    expect(
      fs.readFileSync(
        path.join(tmpDir, 'src/themes/ocean/oceanTheme.ts'),
        'utf-8',
      ),
    ).toContain('export const oceanTheme');
    expect(
      fs.readFileSync(
        path.join(tmpDir, 'src/themes/ocean/oceanTheme.doc.mjs'),
        'utf-8',
      ),
    ).toContain("name: 'ocean'");
    expect(fs.existsSync(path.join(tmpDir, 'src/astryx-themes.ts'))).toBe(
      false,
    );
  });

  it('keeps every released bundled copy receipt field and file', async () => {
    const result = await themeAdd('neutral', {cwd: tmpDir});

    expect(result.data).toEqual({
      slug: 'neutral',
      displayName: 'Neutral',
      maintained: true,
      package: '@astryxdesign/cli',
      outputDir: path.join('src', 'themes', 'neutral'),
      entry: 'neutralTheme.ts',
      exportName: 'neutralTheme',
      files: [
        'neutralTheme.ts',
        'icons.tsx',
        'neutralPalettes.ts',
        'neutralPalettes.generated.ts',
        'neutralPaletteRefs.generated.ts',
        'neutralPalettes.generated.receipt.json',
        'palette.config.json',
      ],
    });
    expect(
      fs.readdirSync(path.join(tmpDir, 'src/themes/neutral')).sort(),
    ).toEqual([...result.data.files].sort());
  });

  it('keeps every relative import required by a copied theme', async () => {
    const result = await themeAdd('neutral', {cwd: tmpDir});
    const outputDir = path.join(tmpDir, result.data.outputDir);
    const relativeImports = /from\s+['"](\.\.?\/[^'"]+)['"]/gu;

    for (const file of result.data.files) {
      if (!/\.(?:ts|tsx|mjs)$/u.test(file)) continue;
      const source = fs.readFileSync(path.join(outputDir, file), 'utf-8');
      for (const [, specifier] of source.matchAll(relativeImports)) {
        const imported = path.resolve(outputDir, path.dirname(file), specifier);
        expect(
          fs.existsSync(imported) ||
            fs.existsSync(`${imported}.ts`) ||
            fs.existsSync(`${imported}.tsx`) ||
            fs.existsSync(`${imported}.mjs`),
        ).toBe(true);
      }
    }
  });

  it('strips the repository copyright header from copied text', async () => {
    const result = await themeAdd('neutral', {cwd: tmpDir});
    const first = path.join(
      tmpDir,
      result.data.outputDir,
      result.data.files[0],
    );
    expect(fs.readFileSync(first, 'utf-8')).not.toMatch(
      /Copyright \(c\) Meta Platforms/u,
    );
  });

  it('keeps case-insensitive copy lookup', async () => {
    const result = await themeAdd('Neutral', {cwd: tmpDir});
    expect(result.data.slug).toBe('neutral');
  });

  it('keeps an explicit copy target path', async () => {
    const result = await themeAdd('neutral', {
      cwd: tmpDir,
      targetPath: 'themes/mine',
    });
    expect(result.data.outputDir).toBe(path.join('themes', 'mine'));
    expect(
      fs.existsSync(path.join(tmpDir, 'themes', 'mine', result.data.files[0])),
    ).toBe(true);
  });

  it('keeps unknown-theme errors on the copy path', async () => {
    await expect(
      themeAdd('does-not-exist', {cwd: tmpDir}),
    ).rejects.toMatchObject({code: 'ERR_UNKNOWN_THEME'});
  });

  it('keeps the copy overwrite guard and explicit replacement', async () => {
    await themeAdd('neutral', {cwd: tmpDir});
    await expect(themeAdd('neutral', {cwd: tmpDir})).rejects.toMatchObject({
      code: 'ERR_FILE_EXISTS',
    });
    await expect(
      themeAdd('neutral', {cwd: tmpDir, overwrite: true}),
    ).resolves.toMatchObject({type: 'theme.add'});
  });

  it('keeps copy path traversal protection', async () => {
    await expect(
      themeAdd('neutral', {cwd: tmpDir, targetPath: '../escape'}),
    ).rejects.toMatchObject({code: 'ERR_PATH_TRAVERSAL'});
  });

  it('keeps stable write errors when a copy target is a file', async () => {
    fs.writeFileSync(path.join(tmpDir, 'blocker'), 'x');
    await expect(
      themeAdd('neutral', {cwd: tmpDir, targetPath: 'blocker'}),
    ).rejects.toMatchObject({code: 'ERR_WRITE_FAILED'});
  });

  it('keeps stable write errors when the default copy ancestor is a file', async () => {
    fs.rmSync(path.join(tmpDir, 'src'), {recursive: true, force: true});
    fs.writeFileSync(path.join(tmpDir, 'src'), 'x');
    await expect(themeAdd('neutral', {cwd: tmpDir})).rejects.toMatchObject({
      code: 'ERR_WRITE_FAILED',
    });
  });

  it('keeps copying into an existing empty target directory', async () => {
    fs.mkdirSync(path.join(tmpDir, 'mydir'));
    const result = await themeAdd('neutral', {
      cwd: tmpDir,
      targetPath: 'mydir',
    });
    expect(result.data.outputDir).toBe('mydir');
  });

  it('excludes local themes from the copying lookup', async () => {
    installTheme();
    const localDir = path.join(tmpDir, 'src', 'themes', 'ocean');
    fs.mkdirSync(localDir, {recursive: true});
    fs.writeFileSync(
      path.join(localDir, 'oceanTheme.doc.mjs'),
      "/** @type {import('@astryxdesign/cli/authoring').ThemeDoc} */\nexport default {type: 'theme', name: 'ocean', displayName: 'Local ocean', description: 'Local.', maintained: false};\n",
    );
    fs.writeFileSync(
      path.join(localDir, 'oceanTheme.ts'),
      'export const oceanTheme = {source: "local"};\n',
    );

    const result = await themeAdd('ocean', {
      cwd: tmpDir,
      targetPath: 'src/copied-ocean',
    });

    expect(result.type).toBe('theme.add');
    expect(result.data.package).toBe('@acme/themes');
    expect(
      fs.readFileSync(
        path.join(tmpDir, 'src', 'copied-ocean', 'oceanTheme.ts'),
        'utf-8',
      ),
    ).not.toContain('source: "local"');
  });

  it.each([
    ['a target path', {targetPath: 'src/brand'}],
    ['overwrite', {overwrite: true}],
  ])('rejects --import with %s before writing', async (_label, copyOption) => {
    installTheme();

    await expect(
      themeAdd('ocean', {
        cwd: tmpDir,
        import: true,
        package: '@acme/themes',
        ...copyOption,
      }),
    ).rejects.toMatchObject({
      code: 'ERR_THEME_INVALID',
      message: expect.stringContaining('cannot be combined'),
    });
    expect(fs.existsSync(path.join(tmpDir, 'src/astryx-themes.ts'))).toBe(
      false,
    );
    expect(fs.existsSync(path.join(tmpDir, 'src/brand'))).toBe(false);
  });

  it('records and imports a built package theme without copying source', async () => {
    installTheme();
    const packageBefore = fs.readFileSync(
      path.join(tmpDir, 'package.json'),
      'utf-8',
    );

    const result = await themeAdd('ocean', {
      cwd: tmpDir,
      import: true,
      package: '@acme/themes',
    });

    expect(result).toMatchObject({
      type: 'theme.app',
      data: {
        default: 'ocean',
        modulePath: 'src/astryx-themes.ts',
        change: {action: 'add', slug: 'ocean', changed: true},
        themes: [
          {
            slug: 'ocean',
            owner: '@acme/themes',
            module: '@acme/themes/themes/ocean',
            stylesheet: '@acme/themes/themes/ocean.css',
            source: 'package',
          },
        ],
      },
    });
    expect(fs.readFileSync(path.join(tmpDir, 'package.json'), 'utf-8')).toBe(
      packageBefore,
    );
    expect(fs.existsSync(path.join(tmpDir, 'src/themes/ocean'))).toBe(false);
    const module = fs.readFileSync(
      path.join(tmpDir, 'src/astryx-themes.ts'),
      'utf-8',
    );
    expect(module).toContain(THEME_MODULE_MARKER);
    expect(module).toContain('from "@acme/themes/themes/ocean"');
    expect(module).toContain('import "@acme/themes/themes/ocean.css"');
    expect(parseThemeModuleRecord(module)).toEqual({
      themes: {ocean: '@acme/themes'},
      defaultSlug: 'ocean',
    });
  });

  it('keeps the released CLI selector while recording the import package', async () => {
    installBuiltThemePackage('neutral');
    const result = await themeAdd('neutral', {
      cwd: tmpDir,
      import: true,
      package: '@astryxdesign/cli',
    });

    expect(result.data.themes).toEqual([
      expect.objectContaining({
        slug: 'neutral',
        owner: '@astryxdesign/theme-neutral',
        module: '@astryxdesign/theme-neutral/built',
        stylesheet: '@astryxdesign/theme-neutral/theme.css',
        source: 'bundled',
      }),
    ]);
    expect(
      parseThemeModuleRecord(
        fs.readFileSync(path.join(tmpDir, 'src/astryx-themes.ts'), 'utf-8'),
      ),
    ).toEqual({
      themes: {neutral: '@astryxdesign/theme-neutral'},
      defaultSlug: 'neutral',
    });
  });

  it('regenerates an already-added theme and reports no state change', async () => {
    installTheme();
    await themeAdd('ocean', {
      cwd: tmpDir,
      import: true,
      package: '@acme/themes',
    });
    const moduleFile = path.join(tmpDir, 'src/astryx-themes.ts');
    fs.appendFileSync(moduleFile, '\n// hand edit\n');

    const result = await themeAdd('ocean', {
      cwd: tmpDir,
      import: true,
      package: '@acme/themes',
    });

    expect(result.data.change.changed).toBe(false);
    expect(fs.readFileSync(moduleFile, 'utf-8')).not.toContain('hand edit');
  });

  it('fails before writing when the selected module path is authored', async () => {
    installTheme();
    const moduleFile = path.join(tmpDir, 'src/astryx-themes.ts');
    fs.writeFileSync(moduleFile, 'export const mine = true;\n');

    await expect(
      themeAdd('ocean', {
        cwd: tmpDir,
        import: true,
        package: '@acme/themes',
      }),
    ).rejects.toMatchObject({code: 'ERR_FILE_EXISTS'});
    expect(fs.readFileSync(moduleFile, 'utf-8')).toBe(
      'export const mine = true;\n',
    );
  });

  it('uses a JavaScript module at the project root when there is no src', async () => {
    fs.rmSync(path.join(tmpDir, 'src'), {recursive: true});
    fs.rmSync(path.join(tmpDir, 'tsconfig.json'));
    installTheme();

    const result = await themeAdd('ocean', {
      cwd: tmpDir,
      import: true,
      package: '@acme/themes',
    });

    expect(result.data.modulePath).toBe('astryx-themes.js');
    expect(fs.existsSync(path.join(tmpDir, 'astryx-themes.js'))).toBe(true);
  });

  it('prefers a built local theme and switches the recorded owner', async () => {
    installTheme();
    await themeAdd('ocean', {
      cwd: tmpDir,
      import: true,
      package: '@acme/themes',
    });
    await themeEject('ocean', {cwd: tmpDir, package: '@acme/themes'});
    const localDir = path.join(tmpDir, 'src', 'themes', 'ocean');
    fs.writeFileSync(
      path.join(localDir, 'ocean.js'),
      'export const oceanTheme = {name: "local-ocean", __built: true};\n',
    );
    fs.writeFileSync(path.join(localDir, 'ocean.css'), '/* local css */\n');

    const result = await themeAdd('ocean', {cwd: tmpDir, import: true});

    expect(result).toMatchObject({
      type: 'theme.app',
      data: {
        change: {action: 'add', slug: 'ocean', changed: true},
        themes: [
          {
            slug: 'ocean',
            owner: './src/themes',
            module: './themes/ocean/ocean.js',
            stylesheet: './themes/ocean/ocean.css',
            source: 'local',
          },
        ],
      },
    });
    expect(
      parseThemeModuleRecord(
        fs.readFileSync(path.join(tmpDir, 'src/astryx-themes.ts'), 'utf-8'),
      ),
    ).toEqual({
      themes: {ocean: './src/themes'},
      defaultSlug: 'ocean',
    });
  });

  it('ignores an unmigrated local copy without changing it', async () => {
    const copyDir = path.join(tmpDir, 'src', 'themes', 'ocean');
    fs.mkdirSync(copyDir, {recursive: true});
    const source = 'export const oceanTheme = {name: "copied"};\n';
    fs.writeFileSync(path.join(copyDir, 'oceanTheme.ts'), source);
    installTheme();

    const result = await themeAdd('ocean', {
      cwd: tmpDir,
      import: true,
      package: '@acme/themes',
    });

    expect(result.data.themes).toEqual([
      expect.objectContaining({slug: 'ocean', owner: '@acme/themes'}),
    ]);
    expect(fs.readFileSync(path.join(copyDir, 'oceanTheme.ts'), 'utf-8')).toBe(
      source,
    );
    expect(fs.existsSync(path.join(copyDir, 'oceanTheme.doc.mjs'))).toBe(false);
  });

  it('never falls back to package source when built exports are missing', async () => {
    installTheme('ocean', '@acme/themes', {missingBuilt: true});

    await expect(
      themeAdd('ocean', {
        cwd: tmpDir,
        import: true,
        package: '@acme/themes',
      }),
    ).rejects.toMatchObject({
      code: 'ERR_THEME_INVALID',
      message: expect.stringMatching(
        /no resolvable built module and stylesheet/i,
      ),
    });
    expect(fs.existsSync(path.join(tmpDir, 'src/astryx-themes.ts'))).toBe(
      false,
    );
  });
});
