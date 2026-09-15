// Copyright (c) Meta Platforms, Inc. and affiliates.

import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {spawnSync} from 'node:child_process';
import {integrationPackCheck, parseNpmPackOutput} from './pack-check.mjs';
import {
  integrationAddComponent,
  integrationAddTemplate,
} from './add-contribution.mjs';

let tmpDir;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(process.cwd(), '.astryx-pack-check-'));
});

afterEach(() => {
  fs.rmSync(tmpDir, {recursive: true, force: true});
});

/**
 * Write a minimal integration package into tmpDir.
 * Returns the package directory.
 */
function writePackage({
  name = '@acme/widgets',
  version = '1.0.0',
  files,
  manifest = "export default {themes: './themes'};\n",
  themes = true,
  npmignore,
  components = false,
  scripts,
} = {}) {
  const pkg = {name, version};
  if (files !== undefined) pkg.files = files;
  if (scripts !== undefined) pkg.scripts = scripts;
  fs.writeFileSync(
    path.join(tmpDir, 'package.json'),
    JSON.stringify(pkg, null, 2) + '\n',
  );
  if (manifest != null) {
    fs.writeFileSync(path.join(tmpDir, 'astryx.integration.mjs'), manifest);
  }
  if (themes) {
    const root = path.join(tmpDir, 'themes');
    fs.mkdirSync(path.join(root, 'ocean'), {recursive: true});
    fs.writeFileSync(
      path.join(root, 'ocean', 'oceanTheme.ts'),
      "import {defineTheme} from '@astryxdesign/core/theme';\n\nexport const oceanTheme = defineTheme({name: 'ocean'});\n",
    );
    fs.writeFileSync(
      path.join(root, 'manifest.json'),
      JSON.stringify(
        {
          version: 1,
          themes: [
            {
              slug: 'ocean',
              displayName: 'Ocean',
              description: 'Ocean theme.',
              maintained: true,
              entry: 'oceanTheme.ts',
              exportName: 'oceanTheme',
              files: ['oceanTheme.ts'],
            },
          ],
        },
        null,
        2,
      ) + '\n',
    );
  }
  if (components) {
    const root = path.join(tmpDir, 'components');
    fs.mkdirSync(root, {recursive: true});
    fs.writeFileSync(
      path.join(root, 'Card.tsx'),
      'export default function Card() { return null; }\n',
    );
  }
  if (npmignore) {
    fs.writeFileSync(path.join(tmpDir, '.npmignore'), npmignore);
  }
  return tmpDir;
}

describe('integrationPackCheck', () => {
  it('returns packable:true for a valid integration with themes', async () => {
    writePackage({files: ['astryx.integration.mjs', 'themes']});
    const result = await integrationPackCheck({cwd: tmpDir});

    expect(result.type).toBe('integration.pack-check');
    expect(result.data.packable).toBe(true);
    expect(result.data.name).toBe('@acme/widgets');
    expect(result.data.tarball).not.toBeNull();
    expect(result.data.inventory.manifest).toBe('astryx.integration.mjs');
    expect(result.data.contributions.local?.themes).toEqual([
      {slug: 'ocean', exportName: 'oceanTheme'},
    ]);
    expect(result.data.contributions.packed).toEqual(
      result.data.contributions.local,
    );
    expect(result.data.issues.filter(i => i.severity === 'error')).toHaveLength(
      0,
    );
  });

  it('fails when a theme entry omits its catalog export', async () => {
    writePackage({files: ['astryx.integration.mjs', 'themes']});
    fs.writeFileSync(
      path.join(tmpDir, 'themes', 'ocean', 'oceanTheme.ts'),
      'export const anotherTheme = {};\n',
    );

    const result = await integrationPackCheck({cwd: tmpDir});

    expect(result.data.packable).toBe(false);
    expect(result.data.issues).toContainEqual(
      expect.objectContaining({
        code: 'invalid_theme',
        message: expect.stringContaining(
          'entry "oceanTheme.ts" does not export "oceanTheme"',
        ),
      }),
    );
  });

  it('fails when a theme imports a file omitted from its catalog', async () => {
    writePackage({files: ['astryx.integration.mjs', 'themes']});
    fs.mkdirSync(path.join(tmpDir, 'themes', 'ocean', 'tokens'), {
      recursive: true,
    });
    fs.writeFileSync(
      path.join(tmpDir, 'themes', 'ocean', 'oceanTheme.ts'),
      "import {oceanPalette} from './tokens/ocean.palette';\nexport const oceanTheme = {oceanPalette};\n",
    );
    fs.writeFileSync(
      path.join(tmpDir, 'themes', 'ocean', 'tokens', 'ocean.palette.ts'),
      'export const oceanPalette = {};\n',
    );

    const result = await integrationPackCheck({cwd: tmpDir});

    expect(result.data.packable).toBe(false);
    expect(result.data.issues).toContainEqual(
      expect.objectContaining({
        code: 'invalid_theme',
        message: expect.stringContaining(
          'must resolve to a listed file inside the theme directory',
        ),
      }),
    );
  });

  it('fails when a discovered component is not exported to consumers', async () => {
    writePackage({
      manifest: "export default {components: './components'};\n",
      files: ['astryx.integration.mjs', 'components', 'index.mjs'],
      themes: false,
    });
    const pkgFile = path.join(tmpDir, 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgFile, 'utf-8'));
    pkg.exports = {'.': './index.mjs'};
    fs.writeFileSync(pkgFile, `${JSON.stringify(pkg, null, 2)}\n`);
    fs.writeFileSync(
      path.join(tmpDir, 'index.mjs'),
      'export const existing = 1;\n',
    );
    fs.mkdirSync(path.join(tmpDir, 'components'));
    fs.writeFileSync(
      path.join(tmpDir, 'components', 'AcmeWidget.doc.mjs'),
      "export default {type: 'component', name: 'AcmeWidget', description: 'Widget.', props: []};\n",
    );
    fs.writeFileSync(
      path.join(tmpDir, 'components', 'AcmeWidget.tsx'),
      'export function AcmeWidget() { return null; }\n',
    );

    const result = await integrationPackCheck({cwd: tmpDir});

    expect(result.data.packable).toBe(false);
    expect(result.data.issues).toContainEqual(
      expect.objectContaining({
        code: 'component_export_missing',
        message: expect.stringContaining('AcmeWidget'),
      }),
    );
  });

  it('passes a generated component through its exact packed export', async () => {
    fs.writeFileSync(
      path.join(tmpDir, 'package.json'),
      `${JSON.stringify({
        name: '@acme/widgets',
        version: '1.0.0',
        files: ['index.mjs'],
        exports: {'.': './index.mjs'},
      })}\n`,
    );
    fs.writeFileSync(
      path.join(tmpDir, 'index.mjs'),
      'export const existing = 1;\n',
    );
    await integrationAddComponent('AcmeWidget', {cwd: tmpDir});

    const result = await integrationPackCheck({cwd: tmpDir});

    expect(result.data.packable).toBe(true);
    expect(result.data.issues).not.toContainEqual(
      expect.objectContaining({code: 'component_export_missing'}),
    );
  });

  it('fails when packed template source is hidden by package exports', async () => {
    writePackage({
      manifest: "export default {templates: './templates'};\n",
      files: ['astryx.integration.mjs', 'templates', 'index.mjs'],
      themes: false,
    });
    const pkgFile = path.join(tmpDir, 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgFile, 'utf-8'));
    pkg.exports = {'.': './index.mjs'};
    fs.writeFileSync(pkgFile, `${JSON.stringify(pkg, null, 2)}\n`);
    fs.writeFileSync(
      path.join(tmpDir, 'index.mjs'),
      'export const existing = 1;\n',
    );
    fs.mkdirSync(path.join(tmpDir, 'templates'));
    fs.writeFileSync(
      path.join(tmpDir, 'templates', 'account-page.template.mjs'),
      "export default {type: 'page', name: 'Account page', description: 'Account page.'};\n",
    );
    fs.writeFileSync(
      path.join(tmpDir, 'templates', 'account-page.tsx'),
      'export default function AccountPage() { return null; }\n',
    );

    const result = await integrationPackCheck({cwd: tmpDir});

    expect(result.data.packable).toBe(false);
    expect(result.data.issues).toContainEqual(
      expect.objectContaining({
        code: 'template_import_unresolvable',
        message: expect.stringContaining('account-page'),
      }),
    );
  });

  it('passes generated component and template source through exact packed exports', async () => {
    fs.writeFileSync(
      path.join(tmpDir, 'package.json'),
      `${JSON.stringify({
        name: '@acme/widgets',
        version: '1.0.0',
        files: ['index.mjs'],
        exports: {'.': './index.mjs'},
      })}\n`,
    );
    fs.writeFileSync(
      path.join(tmpDir, 'index.mjs'),
      'export const existing = 1;\n',
    );
    await integrationAddComponent('AcmeWidget', {cwd: tmpDir});
    await integrationAddTemplate('account-page', {cwd: tmpDir, type: 'page'});

    const result = await integrationPackCheck({cwd: tmpDir});

    expect(result.data.packable).toBe(true);
    expect(result.data.issues).not.toContainEqual(
      expect.objectContaining({code: 'component_export_missing'}),
    );
    expect(result.data.issues).not.toContainEqual(
      expect.objectContaining({code: 'template_import_unresolvable'}),
    );
  });

  it('errors when a root directory is excluded from files[]', async () => {
    // Include manifest but NOT themes
    writePackage({files: ['astryx.integration.mjs']});
    const result = await integrationPackCheck({cwd: tmpDir});

    expect(result.data.packable).toBe(false);
    const rootError = result.data.issues.find(
      i => i.code === 'root_not_packed',
    );
    expect(rootError).toBeDefined();
    expect(rootError.message).toContain('themes');
  });

  it('errors when .npmignore excludes a contribution', async () => {
    writePackage({npmignore: 'themes/\n'});
    const result = await integrationPackCheck({cwd: tmpDir});

    expect(result.data.packable).toBe(false);
    const fileErrors = result.data.issues.filter(
      i => i.code === 'root_not_packed' || i.code === 'file_not_packed',
    );
    expect(fileErrors.length).toBeGreaterThan(0);
  });

  it('passes when package.json has no files field', async () => {
    writePackage({files: undefined});
    const result = await integrationPackCheck({cwd: tmpDir});

    // No files field → npm includes everything
    expect(result.data.packable).toBe(true);
  });

  it('detects a lifecycle script that changes the packed identity', async () => {
    const script = [
      "const fs=require('fs')",
      "fs.renameSync('themes/ocean','themes/storm')",
      "const p='themes/manifest.json'",
      'const x=JSON.parse(fs.readFileSync(p))',
      "x.themes[0].slug='storm'",
      'fs.writeFileSync(p,JSON.stringify(x))',
    ].join(';');
    writePackage({
      files: ['astryx.integration.mjs', 'themes'],
      scripts: {prepack: `node -e "${script}"`},
    });

    const result = await integrationPackCheck({cwd: tmpDir});

    expect(result.data.packable).toBe(false);
    expect(
      result.data.issues.find(issue => issue.code === 'identity_not_packed')
        ?.message,
    ).toContain('ocean');
    expect(
      result.data.issues.find(
        issue => issue.code === 'packed_identity_unexpected',
      )?.message,
    ).toContain('storm');
  });

  it('rejects a declared root with no contribution files', async () => {
    writePackage({
      manifest: "export default {docs: './docs'};\n",
      files: ['astryx.integration.mjs', 'docs'],
      themes: false,
    });
    fs.mkdirSync(path.join(tmpDir, 'docs'));

    const result = await integrationPackCheck({cwd: tmpDir});

    expect(result.data.packable).toBe(false);
    expect(
      result.data.issues.some(
        issue => issue.code === 'empty_contribution_root',
      ),
    ).toBe(true);
  });

  it('handles scoped package extraction correctly', async () => {
    writePackage({
      name: '@my-org/deep-integration',
      files: ['astryx.integration.mjs', 'themes'],
    });
    const result = await integrationPackCheck({cwd: tmpDir});

    expect(result.data.name).toBe('@my-org/deep-integration');
    expect(result.data.packable).toBe(true);
  });

  it('reports source-only component candidates as warnings', async () => {
    writePackage({
      manifest:
        "export default {themes: './themes', components: './components'};\n",
      files: ['astryx.integration.mjs', 'themes', 'components'],
      components: true,
    });
    const result = await integrationPackCheck({cwd: tmpDir});

    const sourceWarnings = result.data.issues.filter(
      issue => issue.code === 'source_without_component_doc',
    );
    // Card.tsx is PascalCase but has no doc metadata → warning
    expect(sourceWarnings.length).toBeGreaterThanOrEqual(1);
    expect(sourceWarnings[0].severity).toBe('warning');
    expect(sourceWarnings[0].message).toContain('Card.tsx');
  });

  it('cleans up its scratch consumer when npm pack fails', async () => {
    writePackage({
      files: ['astryx.integration.mjs', 'themes'],
      scripts: {prepack: 'node -e "process.exit(17)"'},
    });

    const result = await integrationPackCheck({cwd: tmpDir});

    expect(result.data.packable).toBe(false);
    expect(result.data.issues.some(issue => issue.code === 'pack_failed')).toBe(
      true,
    );
    expect(
      fs
        .readdirSync(tmpDir)
        .filter(name => name.startsWith('.astryx-pack-check-')),
    ).toEqual([]);
  });

  it('cleans up its scratch consumer after a successful check', async () => {
    writePackage({files: ['astryx.integration.mjs', 'themes']});

    const result = await integrationPackCheck({cwd: tmpDir});

    expect(result.data.packable).toBe(true);
    expect(
      fs
        .readdirSync(tmpDir)
        .filter(name => name.startsWith('.astryx-pack-check-')),
    ).toEqual([]);
  });

  it('rejects malformed npm pack output without a raw TypeError', () => {
    expect(() =>
      parseNpmPackOutput(
        JSON.stringify([
          {filename: 'pkg.tgz', entryCount: 1, size: 1, unpackedSize: 1},
        ]),
      ),
    ).toThrow(/without a files array/);
  });

  it('reports npm missing from PATH as pack_failed', async () => {
    writePackage({files: ['astryx.integration.mjs', 'themes']});
    const originalPath = process.env.PATH;
    process.env.PATH = '';
    try {
      const result = await integrationPackCheck({cwd: tmpDir});
      expect(result.data.packable).toBe(false);
      expect(result.data.issues).toContainEqual(
        expect.objectContaining({
          code: 'pack_failed',
          message: expect.stringContaining('Could not start npm pack'),
        }),
      );
    } finally {
      process.env.PATH = originalPath;
    }
  });

  it('does not execute shell metacharacters embedded in the cwd', async () => {
    const marker = path.join(process.cwd(), 'astryx-pack-check-injected');
    fs.rmSync(marker, {force: true});
    const weirdDir = fs.mkdtempSync(
      path.join(process.cwd(), '.astryx-;touch astryx-pack-check-injected;#-'),
    );
    try {
      const pkg = {name: 'safe-pkg', version: '1.0.0'};
      fs.writeFileSync(
        path.join(weirdDir, 'package.json'),
        JSON.stringify(pkg),
      );
      fs.writeFileSync(
        path.join(weirdDir, 'astryx.integration.mjs'),
        'export default {};\n',
      );
      const result = await integrationPackCheck({cwd: weirdDir});
      expect(result.type).toBe('integration.pack-check');
      expect(fs.existsSync(marker)).toBe(false);
    } finally {
      fs.rmSync(weirdDir, {recursive: true, force: true});
      fs.rmSync(marker, {force: true});
    }
  });

  it('returns early with issues for a directory without package.json', async () => {
    const emptyDir = fs.mkdtempSync(
      path.join(os.tmpdir(), 'astryx-pack-check-empty-'),
    );
    try {
      const result = await integrationPackCheck({cwd: emptyDir});
      expect(result.data.packable).toBe(false);
      expect(result.data.issues.some(i => i.code === 'no_package')).toBe(true);
    } finally {
      fs.rmSync(emptyDir, {recursive: true, force: true});
    }
  });

  it('reports malformed package.json instead of treating it as missing', async () => {
    fs.writeFileSync(path.join(tmpDir, 'package.json'), '{bad-json');
    fs.writeFileSync(
      path.join(tmpDir, 'astryx.integration.mjs'),
      'export default {};\n',
    );

    const result = await integrationPackCheck({cwd: tmpDir});

    expect(result.data.packable).toBe(false);
    expect(result.data.issues).toContainEqual(
      expect.objectContaining({code: 'invalid_package_json'}),
    );
  });

  it('returns early with issues for a package without a manifest', async () => {
    fs.writeFileSync(
      path.join(tmpDir, 'package.json'),
      '{"name":"bare-pkg","version":"1.0.0"}\n',
    );
    const result = await integrationPackCheck({cwd: tmpDir});

    expect(result.data.packable).toBe(false);
    expect(result.data.issues.some(i => i.code === 'missing_manifest')).toBe(
      true,
    );
  });
});

describe('pack-check mutation tests', () => {
  it('detects when a theme file is deleted after initial add', async () => {
    writePackage({files: ['astryx.integration.mjs', 'themes']});

    // Write a second theme file then delete it — catalog still references it
    const catalog = JSON.parse(
      fs.readFileSync(path.join(tmpDir, 'themes', 'manifest.json'), 'utf-8'),
    );
    catalog.themes[0].files.push('tokens.ts');
    fs.writeFileSync(
      path.join(tmpDir, 'themes', 'manifest.json'),
      JSON.stringify(catalog, null, 2) + '\n',
    );
    // tokens.ts doesn't exist on disk → will be in inventory but not on disk
    // (Phase 1 catches this; the file won't be in the pack list either)

    const result = await integrationPackCheck({cwd: tmpDir});
    expect(result.data.packable).toBe(false);
  });

  it('detects when files[] is narrowed after add removes themes', async () => {
    // First: valid package
    writePackage({files: ['astryx.integration.mjs', 'themes']});

    // Narrow files to exclude themes
    const pkg = JSON.parse(
      fs.readFileSync(path.join(tmpDir, 'package.json'), 'utf-8'),
    );
    pkg.files = ['astryx.integration.mjs'];
    fs.writeFileSync(
      path.join(tmpDir, 'package.json'),
      JSON.stringify(pkg, null, 2) + '\n',
    );

    const result = await integrationPackCheck({cwd: tmpDir});
    expect(result.data.packable).toBe(false);
    expect(result.data.issues.some(i => i.code === 'root_not_packed')).toBe(
      true,
    );
  });

  it('correctly counts packed vs expected files in inventory', async () => {
    writePackage({files: ['astryx.integration.mjs', 'themes']});
    const result = await integrationPackCheck({cwd: tmpDir});

    expect(result.data.inventory.expectedFiles).toBeGreaterThan(0);
    expect(result.data.inventory.packedFiles).toBe(
      result.data.inventory.expectedFiles,
    );
    for (const root of result.data.inventory.roots) {
      expect(root.complete).toBe(true);
      expect(root.missingFiles).toEqual([]);
    }
  });
});

describe('extensionless subpath resolution', () => {
  it('rejects .tsx public specifiers before publishing', async () => {
    // Manually construct a package with OLD-style .tsx exports keys
    writePackage({
      manifest: "export default {components: './components'};\n",
      files: ['astryx.integration.mjs', 'components', 'index.mjs'],
      themes: false,
    });
    const pkgFile = path.join(tmpDir, 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgFile, 'utf-8'));
    pkg.exports = {
      '.': './index.mjs',
      './components/AcmeWidget.tsx': './components/AcmeWidget.tsx',
    };
    fs.writeFileSync(pkgFile, `${JSON.stringify(pkg, null, 2)}\n`);
    fs.writeFileSync(
      path.join(tmpDir, 'index.mjs'),
      'export const existing = 1;\n',
    );
    fs.mkdirSync(path.join(tmpDir, 'components'));
    fs.writeFileSync(
      path.join(tmpDir, 'components', 'AcmeWidget.doc.mjs'),
      `export default {type: 'component', name: 'AcmeWidget', import: '@acme/widgets/components/AcmeWidget.tsx', description: 'Widget.', props: []};\n`,
    );
    fs.writeFileSync(
      path.join(tmpDir, 'components', 'AcmeWidget.tsx'),
      'export function AcmeWidget() { return null; }\n',
    );

    const result = await integrationPackCheck({cwd: tmpDir});

    // The .tsx extension in the specifier must be caught
    expect(result.data.packable).toBe(false);
    expect(result.data.issues).toContainEqual(
      expect.objectContaining({
        code: 'typescript_extension_in_specifier',
        message: expect.stringContaining('.tsx'),
      }),
    );
  });

  it('generated extensionless component specifier resolves through exports map', async () => {
    fs.writeFileSync(
      path.join(tmpDir, 'package.json'),
      `${JSON.stringify({
        name: '@acme/widgets',
        version: '1.0.0',
        files: ['index.mjs'],
        exports: {'.': './index.mjs'},
      })}\n`,
    );
    fs.writeFileSync(
      path.join(tmpDir, 'index.mjs'),
      'export const existing = 1;\n',
    );
    await integrationAddComponent('AcmeWidget', {cwd: tmpDir});

    // Verify the exports map has extensionless key → .tsx target
    const pkg = JSON.parse(
      fs.readFileSync(path.join(tmpDir, 'package.json'), 'utf-8'),
    );
    expect(pkg.exports['./components/AcmeWidget']).toBe(
      './components/AcmeWidget.tsx',
    );
    expect(pkg.exports['./components/AcmeWidget.tsx']).toBeUndefined();

    const result = await integrationPackCheck({cwd: tmpDir});

    expect(result.data.packable).toBe(true);
    expect(result.data.issues).not.toContainEqual(
      expect.objectContaining({code: 'typescript_extension_in_specifier'}),
    );
    expect(result.data.issues).not.toContainEqual(
      expect.objectContaining({code: 'component_import_unresolvable'}),
    );
  });

  it('validates generated imports without project-local TypeScript', async () => {
    fs.rmSync(tmpDir, {recursive: true, force: true});
    tmpDir = fs.mkdtempSync(
      path.join(os.tmpdir(), 'astryx-pack-check-no-typescript-'),
    );
    fs.writeFileSync(
      path.join(tmpDir, 'package.json'),
      `${JSON.stringify({
        name: '@acme/widgets',
        version: '1.0.0',
        files: ['index.mjs'],
        exports: {'.': './index.mjs'},
      })}\n`,
    );
    fs.writeFileSync(
      path.join(tmpDir, 'index.mjs'),
      'export const existing = 1;\n',
    );
    await integrationAddComponent('AcmeWidget', {cwd: tmpDir});

    const result = await integrationPackCheck({cwd: tmpDir});

    expect(result.data.packable).toBe(true);
    expect(result.data.issues).not.toContainEqual(
      expect.objectContaining({code: 'component_import_unresolvable'}),
    );
  });

  it('generated extensionless template specifiers resolve for page and block types', async () => {
    fs.writeFileSync(
      path.join(tmpDir, 'package.json'),
      `${JSON.stringify({
        name: '@acme/widgets',
        version: '1.0.0',
        files: ['index.mjs'],
        exports: {'.': './index.mjs'},
      })}\n`,
    );
    fs.writeFileSync(
      path.join(tmpDir, 'index.mjs'),
      'export const existing = 1;\n',
    );
    await integrationAddTemplate('account-page', {cwd: tmpDir, type: 'page'});
    await integrationAddTemplate('info-card', {cwd: tmpDir, type: 'block'});

    const pkg = JSON.parse(
      fs.readFileSync(path.join(tmpDir, 'package.json'), 'utf-8'),
    );
    expect(pkg.exports['./templates/account-page']).toBe(
      './templates/account-page.tsx',
    );
    expect(pkg.exports['./templates/info-card']).toBe(
      './templates/info-card.tsx',
    );

    const result = await integrationPackCheck({cwd: tmpDir});

    expect(result.data.packable).toBe(true);
    expect(result.data.issues).not.toContainEqual(
      expect.objectContaining({code: 'template_import_unresolvable'}),
    );
    expect(result.data.issues).not.toContainEqual(
      expect.objectContaining({code: 'typescript_extension_in_specifier'}),
    );
  });

  it('preserves condition-style exports sugar without creating a map', async () => {
    // Package with condition-only exports (sugar, no subpaths)
    fs.writeFileSync(
      path.join(tmpDir, 'package.json'),
      `${JSON.stringify({
        name: '@acme/widgets',
        version: '1.0.0',
        files: ['index.mjs'],
        exports: {import: './index.mjs', require: './index.cjs'},
      })}\n`,
    );
    fs.writeFileSync(
      path.join(tmpDir, 'index.mjs'),
      'export const existing = 1;\n',
    );
    fs.writeFileSync(path.join(tmpDir, 'index.cjs'), 'exports.existing = 1;\n');
    fs.writeFileSync(
      path.join(tmpDir, 'astryx.integration.mjs'),
      'export default {};\n',
    );

    await integrationAddComponent('AcmeWidget', {cwd: tmpDir});

    const pkg = JSON.parse(
      fs.readFileSync(path.join(tmpDir, 'package.json'), 'utf-8'),
    );
    // Condition sugar wrapped into subpath map with the component added
    expect(pkg.exports['.']).toEqual({
      import: './index.mjs',
      require: './index.cjs',
    });
    expect(pkg.exports['./components/AcmeWidget']).toBe(
      './components/AcmeWidget.tsx',
    );
  });

  it('no-map: pack-check fails when generated component has no exports map', async () => {
    fs.writeFileSync(
      path.join(tmpDir, 'package.json'),
      `${JSON.stringify({
        name: '@acme/widgets',
        version: '1.0.0',
        files: ['dist'],
      })}\n`,
    );
    fs.writeFileSync(
      path.join(tmpDir, 'astryx.integration.mjs'),
      'export default {};\n',
    );

    await integrationAddComponent('AcmeWidget', {cwd: tmpDir});
    await integrationAddTemplate('hero-page', {cwd: tmpDir, type: 'page'});

    const pkg = JSON.parse(
      fs.readFileSync(path.join(tmpDir, 'package.json'), 'utf-8'),
    );
    // No exports map created
    expect(pkg.exports).toBeUndefined();

    const result = await integrationPackCheck({cwd: tmpDir});

    // The extensionless import cannot resolve without an exports map —
    // pack-check must fail closed, not false-green.
    expect(result.data.packable).toBe(false);
    expect(result.data.issues).toContainEqual(
      expect.objectContaining({
        severity: 'error',
        message: expect.stringContaining('AcmeWidget'),
      }),
    );
  });

  it('idempotent when extensionless export already exists', async () => {
    fs.writeFileSync(
      path.join(tmpDir, 'package.json'),
      `${JSON.stringify({
        name: '@acme/widgets',
        version: '1.0.0',
        files: ['index.mjs'],
        exports: {
          '.': './index.mjs',
          './components/AcmeWidget': './components/AcmeWidget.tsx',
        },
      })}\n`,
    );
    fs.writeFileSync(
      path.join(tmpDir, 'index.mjs'),
      'export const existing = 1;\n',
    );
    fs.writeFileSync(
      path.join(tmpDir, 'astryx.integration.mjs'),
      'export default {};\n',
    );

    await integrationAddComponent('AcmeWidget', {cwd: tmpDir});

    const pkg = JSON.parse(
      fs.readFileSync(path.join(tmpDir, 'package.json'), 'utf-8'),
    );
    // Export preserved, no duplicate
    expect(
      Object.keys(pkg.exports).filter(k => k.includes('AcmeWidget')),
    ).toEqual(['./components/AcmeWidget']);
  });
});
