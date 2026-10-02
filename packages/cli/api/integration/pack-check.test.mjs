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
  // A theme needs a CLI that reads typed theme descriptors.
  if (themes) pkg.peerDependencies = {'@astryxdesign/cli': '>=0.7.0'};
  if (files !== undefined) pkg.files = files;
  if (scripts !== undefined) pkg.scripts = scripts;
  if (themes) {
    pkg.exports = {
      './themes/ocean': './themes/ocean/ocean.js',
      './themes/ocean.css': './themes/ocean/ocean.css',
    };
  }
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
      path.join(root, 'ocean', 'oceanTheme.doc.mjs'),
      `/** @type {import('@astryxdesign/cli/authoring').ThemeDoc} */
export default {type: 'theme', name: 'ocean', displayName: 'Ocean', description: 'Ocean theme.', maintained: true};
`,
    );
    const built = spawnSync(
      process.execPath,
      [
        path.join(process.cwd(), 'packages/cli/clients/cli/bin/astryx.mjs'),
        'theme',
        'build',
        'themes/ocean/oceanTheme.ts',
      ],
      {cwd: tmpDir, encoding: 'utf-8', timeout: 30_000},
    );
    if (built.status !== 0) {
      throw new Error(
        `Could not build the theme fixture: ${built.stderr || built.stdout}`,
      );
    }
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
    expect(
      result.data.packable,
      JSON.stringify(result.data.issues, null, 2),
    ).toBe(true);
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

  it('fails a package that ships a theme on a CLI range that cannot read it', async () => {
    writePackage({files: ['astryx.integration.mjs', 'themes']});
    const pkgFile = path.join(tmpDir, 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgFile, 'utf-8'));
    delete pkg.peerDependencies;
    fs.writeFileSync(pkgFile, `${JSON.stringify(pkg, null, 2)}\n`);

    const missing = await integrationPackCheck({cwd: tmpDir});
    expect(missing.data.packable).toBe(false);
    expect(missing.data.issues).toContainEqual(
      expect.objectContaining({
        code: 'themes_need_cli',
        message: expect.stringContaining('ships a theme'),
      }),
    );

    pkg.peerDependencies = {'@astryxdesign/cli': '^0.6.3'};
    fs.writeFileSync(pkgFile, `${JSON.stringify(pkg, null, 2)}\n`);
    const old = await integrationPackCheck({cwd: tmpDir});
    expect(old.data.issues).toContainEqual(
      expect.objectContaining({code: 'themes_need_cli'}),
    );
  });

  it('fails when a theme export is missing', async () => {
    writePackage({files: ['astryx.integration.mjs', 'themes']});
    const packageFile = path.join(tmpDir, 'package.json');
    const pkg = JSON.parse(fs.readFileSync(packageFile, 'utf-8'));
    delete pkg.exports['./themes/ocean.css'];
    fs.writeFileSync(packageFile, `${JSON.stringify(pkg, null, 2)}\n`);

    const result = await integrationPackCheck({cwd: tmpDir});

    expect(result.data.packable).toBe(false);
    expect(result.data.issues).toContainEqual(
      expect.objectContaining({
        code: 'theme_import_unresolvable',
        message: expect.stringContaining('stylesheet export'),
      }),
    );
  });

  it('fails when built theme module and stylesheet drift from source', async () => {
    writePackage({files: ['astryx.integration.mjs', 'themes']});
    fs.appendFileSync(
      path.join(tmpDir, 'themes', 'ocean', 'ocean.js'),
      '// stale module\n',
    );
    fs.appendFileSync(
      path.join(tmpDir, 'themes', 'ocean', 'ocean.css'),
      '/* stale stylesheet */\n',
    );

    const result = await integrationPackCheck({cwd: tmpDir});

    expect(result.data.packable).toBe(false);
    expect(result.data.issues).toContainEqual(
      expect.objectContaining({code: 'theme_module_stale'}),
    );
    expect(result.data.issues).toContainEqual(
      expect.objectContaining({code: 'theme_stylesheet_stale'}),
    );
  });

  it('fails when a built module omits the descriptor export', async () => {
    writePackage({files: ['astryx.integration.mjs', 'themes']});
    const built = path.join(tmpDir, 'themes', 'ocean', 'ocean.js');
    fs.writeFileSync(
      built,
      fs
        .readFileSync(built, 'utf-8')
        .replace('export const oceanTheme', 'export const otherTheme'),
    );

    const result = await integrationPackCheck({cwd: tmpDir});

    expect(result.data.packable).toBe(false);
    expect(result.data.issues).toContainEqual(
      expect.objectContaining({
        code: 'theme_import_unresolvable',
        message: expect.stringContaining('does not export "oceanTheme"'),
      }),
    );
  });

  it('fails when an exported font stylesheet is absent from the tarball', async () => {
    writePackage({npmignore: '**/*.fonts.css\n'});
    const packageFile = path.join(tmpDir, 'package.json');
    const pkg = JSON.parse(fs.readFileSync(packageFile, 'utf-8'));
    pkg.exports['./themes/ocean.fonts.css'] = './themes/ocean/ocean.fonts.css';
    fs.writeFileSync(packageFile, `${JSON.stringify(pkg, null, 2)}\n`);
    fs.writeFileSync(
      path.join(tmpDir, 'themes', 'ocean', 'ocean.fonts.css'),
      '@import url("https://example.com/fonts.css");\n',
    );

    const result = await integrationPackCheck({cwd: tmpDir});

    expect(result.data.packable).toBe(false);
    expect(result.data.issues).toContainEqual(
      expect.objectContaining({
        code: 'theme_import_unresolvable',
        message: expect.stringContaining('font stylesheet does not resolve'),
      }),
    );
  });

  it('fails when a theme entry omits its inferred runtime export', async () => {
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

  it('fails when a theme imports a missing local file', async () => {
    writePackage({files: ['astryx.integration.mjs', 'themes']});
    fs.writeFileSync(
      path.join(tmpDir, 'themes', 'ocean', 'oceanTheme.ts'),
      "import {oceanPalette} from './tokens/ocean.palette';\nexport const oceanTheme = {oceanPalette};\n",
    );

    const result = await integrationPackCheck({cwd: tmpDir});

    expect(result.data.packable).toBe(false);
    expect(result.data.issues).toContainEqual(
      expect.objectContaining({
        code: 'invalid_theme',
        message: expect.stringContaining(
          'must resolve to a file inside the theme directory',
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

  it('resolves public imports in the packed package, not the source', async () => {
    // The root export's target is left out of `files`: the source package
    // resolves it, but an app that installs the tarball cannot.
    fs.writeFileSync(
      path.join(tmpDir, 'package.json'),
      `${JSON.stringify({
        name: '@acme/widgets',
        version: '1.0.0',
        files: ['astryx.integration.mjs'],
        exports: {'.': './index.mjs'},
      })}\n`,
    );
    fs.writeFileSync(
      path.join(tmpDir, 'index.mjs'),
      "export {AcmeWidget} from './components/AcmeWidget.tsx';\n",
    );
    await integrationAddComponent('AcmeWidget', {cwd: tmpDir});
    const docFile = path.join(tmpDir, 'components', 'AcmeWidget.doc.mjs');
    const doc = fs.readFileSync(docFile, 'utf-8');
    expect(doc).toContain('@acme/widgets/components/AcmeWidget');
    fs.writeFileSync(
      docFile,
      doc.replace('@acme/widgets/components/AcmeWidget', '@acme/widgets'),
    );

    const result = await integrationPackCheck({cwd: tmpDir});

    expect(result.data.packable).toBe(false);
    expect(result.data.issues).toContainEqual(
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
      path.join(tmpDir, 'templates', 'account-page.doc.mjs'),
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

  it('fails a package that ships a namespace doc on a CLI range that cannot read it', async () => {
    writePackage({
      manifest: "export default {docs: './docs'};\n",
      themes: false,
    });
    fs.mkdirSync(path.join(tmpDir, 'docs'), {recursive: true});
    fs.writeFileSync(
      path.join(tmpDir, 'docs', 'acme.doc.mjs'),
      "export default {type: 'namespace', name: 'acme', title: 'Acme', summary: 'Acme guides.', slots: {guides: {title: 'Guides', accepts: {kinds: ['generic']}}}};\n",
    );
    fs.writeFileSync(
      path.join(tmpDir, 'docs', 'deploying.doc.mjs'),
      "export default {type: 'generic', name: 'deploying', title: 'Deploying', description: 'Ship it.', placement: {parent: 'namespace:acme', slot: 'guides'}, sections: [{title: 'Overview', content: [{type: 'prose', text: 'Ship it.'}]}]};\n",
    );
    const file = path.join(tmpDir, 'package.json');
    const peer = (/** @type {string | undefined} */ range) => {
      const pkg = JSON.parse(fs.readFileSync(file, 'utf-8'));
      if (range == null) delete pkg.peerDependencies;
      else pkg.peerDependencies = {'@astryxdesign/cli': range};
      fs.writeFileSync(file, `${JSON.stringify(pkg, null, 2)}\n`);
    };
    const codes = async () =>
      (await integrationPackCheck({cwd: tmpDir})).data.issues.map(
        (/** @type {{code: string}} */ issue) => issue.code,
      );

    peer(undefined);
    expect(await codes()).toContain('docs_tree_needs_cli');
    peer('^0.6.0 || >=0.7.0');
    expect(await codes()).toContain('docs_tree_needs_cli');
    peer('>=0.7.0');
    expect(await codes()).not.toContain('docs_tree_needs_cli');
  }, 120_000);

  it('fails a package with only a placed guide on a CLI range that cannot read the docs tree, and passes flat topics', async () => {
    writePackage({
      manifest: "export default {docs: './docs'};\n",
      themes: false,
    });
    fs.mkdirSync(path.join(tmpDir, 'docs'), {recursive: true});
    fs.writeFileSync(
      path.join(tmpDir, 'docs', 'notes.doc.mjs'),
      "export default {type: 'generic', name: 'notes', title: 'Notes', description: 'Notes.', sections: [{title: 'Overview', content: [{type: 'prose', text: 'Notes.'}]}]};\n",
    );
    const codes = async () =>
      (await integrationPackCheck({cwd: tmpDir})).data.issues.map(
        (/** @type {{code: string}} */ issue) => issue.code,
      );
    // Flat topics alone need no CLI peer.
    expect(await codes()).not.toContain('docs_tree_needs_cli');
    fs.writeFileSync(
      path.join(tmpDir, 'docs', 'setup.doc.mjs'),
      "export default {type: 'generic', name: 'setup', title: 'Setup', description: 'Set up.', placement: {parent: 'namespace:acme', slot: 'guides'}, sections: [{title: 'Overview', content: [{type: 'prose', text: 'Set up.'}]}]};\n",
    );
    expect(await codes()).toContain('docs_tree_needs_cli');
    const file = path.join(tmpDir, 'package.json');
    const pkg = JSON.parse(fs.readFileSync(file, 'utf-8'));
    pkg.peerDependencies = {'@astryxdesign/cli': '>=0.7.0'};
    fs.writeFileSync(file, `${JSON.stringify(pkg, null, 2)}\n`);
    expect(await codes()).not.toContain('docs_tree_needs_cli');
  }, 120_000);

  it('fails a package whose doc section sets id on a CLI range that rejects the field', async () => {
    writePackage({
      manifest: "export default {docs: './docs'};\n",
      themes: false,
    });
    fs.mkdirSync(path.join(tmpDir, 'docs'), {recursive: true});
    const topic = (/** @type {string} */ section) =>
      `export default {type: 'generic', name: 'notes', title: 'Notes', description: 'Notes.', sections: [${section}]};\n`;
    const file = path.join(tmpDir, 'docs', 'notes.doc.mjs');
    const codes = async () =>
      (await integrationPackCheck({cwd: tmpDir})).data.issues.map(
        (/** @type {{code: string}} */ issue) => issue.code,
      );
    fs.writeFileSync(
      file,
      topic(
        "{title: 'Take notes', content: [{type: 'prose', text: 'Notes.'}]}",
      ),
    );
    expect(await codes()).not.toContain('section_ids_need_cli');
    // A fresh file name: the module loader caches a path once it is imported.
    fs.rmSync(file);
    fs.writeFileSync(
      path.join(tmpDir, 'docs', 'notes-with-ids.doc.mjs'),
      topic(
        "{id: 'take-notes', title: 'Take notes', content: [{type: 'prose', text: 'Notes.'}]}",
      ),
    );
    expect(await codes()).toContain('section_ids_need_cli');
    const pkgFile = path.join(tmpDir, 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgFile, 'utf-8'));
    pkg.peerDependencies = {'@astryxdesign/cli': '>=0.7.0'};
    fs.writeFileSync(pkgFile, `${JSON.stringify(pkg, null, 2)}\n`);
    expect(await codes()).not.toContain('section_ids_need_cli');
  }, 120_000);

  it('fails a package with a template that sets replaces on a CLI range that rejects the field', async () => {
    writePackage({
      manifest: "export default {templates: './templates'};\n",
      themes: false,
    });
    fs.mkdirSync(path.join(tmpDir, 'templates'), {recursive: true});
    fs.writeFileSync(
      path.join(tmpDir, 'templates', 'acme-shell.doc.mjs'),
      "export default {type: 'page', name: 'acme-shell', description: 'Acme shell.', replaces: 'shell-side-nav'};\n",
    );
    fs.writeFileSync(
      path.join(tmpDir, 'templates', 'acme-shell.tsx'),
      'export default function AcmeShell() { return null; }\n',
    );
    const file = path.join(tmpDir, 'package.json');
    const peer = (/** @type {string | undefined} */ range) => {
      const pkg = JSON.parse(fs.readFileSync(file, 'utf-8'));
      if (range == null) delete pkg.peerDependencies;
      else pkg.peerDependencies = {'@astryxdesign/cli': range};
      fs.writeFileSync(file, `${JSON.stringify(pkg, null, 2)}\n`);
    };
    const codes = async () =>
      (await integrationPackCheck({cwd: tmpDir})).data.issues.map(
        (/** @type {{code: string}} */ issue) => issue.code,
      );

    peer(undefined);
    expect(await codes()).toContain('replaces_needs_cli');
    peer('^0.6.0');
    expect(await codes()).toContain('replaces_needs_cli');
    peer('>=0.7.0');
    expect(await codes()).not.toContain('replaces_needs_cli');
  }, 120_000);

  it('passes when package.json has no files field', async () => {
    writePackage({files: undefined});
    const result = await integrationPackCheck({cwd: tmpDir});

    // No files field → npm includes everything
    expect(result.data.packable).toBe(true);
  });

  it('detects a lifecycle script that changes packed template replacements', async () => {
    const script = [
      "const fs=require('fs')",
      "const p='templates/acme-shell.template.mjs'",
      "const s=fs.readFileSync(p,'utf8')",
      "fs.writeFileSync(p,s.replace('shell-side-nav','shell-top-nav'))",
    ].join(';');
    writePackage({
      manifest: "export default {templates: './templates'};\n",
      files: ['astryx.integration.mjs', 'templates'],
      themes: false,
      scripts: {prepack: `node -e "${script}"`},
    });
    fs.mkdirSync(path.join(tmpDir, 'templates'));
    fs.writeFileSync(
      path.join(tmpDir, 'templates', 'acme-shell.template.mjs'),
      "export default {type: 'page', name: 'Acme shell', description: 'Fixture.', replaces: 'shell-side-nav'};\n",
    );
    fs.writeFileSync(
      path.join(tmpDir, 'templates', 'acme-shell.tsx'),
      'export default function AcmeShell() { return null; }\n',
    );

    const result = await integrationPackCheck({cwd: tmpDir});

    expect(result.data.packable).toBe(false);
    expect(result.data.issues).toContainEqual(
      expect.objectContaining({
        code: 'identity_mismatch',
        message: expect.stringContaining('acme-shell'),
      }),
    );
  });

  it('detects a lifecycle script that changes the packed identity', async () => {
    const script = [
      "const fs=require('fs')",
      "fs.renameSync('themes/ocean','themes/storm')",
      "const p='themes/storm/oceanTheme.doc.mjs'",
      "let x=fs.readFileSync(p,'utf8')",
      "x=x.replace(/name: 'ocean'/, 'name: '+String.fromCharCode(39)+'storm'+String.fromCharCode(39))",
      'fs.writeFileSync(p,x)',
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
  it('detects when a theme source is deleted after initial authoring', async () => {
    writePackage({files: ['astryx.integration.mjs', 'themes']});
    fs.rmSync(path.join(tmpDir, 'themes', 'ocean', 'oceanTheme.ts'));

    const result = await integrationPackCheck({cwd: tmpDir});
    expect(result.data.packable).toBe(false);
    expect(result.data.issues).toContainEqual(
      expect.objectContaining({code: 'invalid_theme'}),
    );
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
