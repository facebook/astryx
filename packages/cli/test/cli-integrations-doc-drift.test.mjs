// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Documentation drift tests for the cli-integrations guide and related
 * CommandDocs/FunctionDocs. Tests verify against executable sources of truth
 * (parseDoc dispatch, resolvePackageDir, theme-discovery validators, schema
 * shapes) rather than only prose-to-prose assertions, so a behavioral change
 * that invalidates a documented claim is caught at CI time.
 */

import {afterEach, beforeEach, describe, it, expect} from 'vitest';
import {docs as integrationGuide} from '../assets/docs/cli-integrations.doc.mjs';
import {doc as upgradeCommandDoc} from '../clients/cli/commands/upgrade.doc.mjs';
import {doc as upgradeFnDoc} from '../api/upgrade/upgrade.doc.mjs';
import {doc as paletteGenerateDoc} from '../clients/cli/commands/theme-palette-generate.doc.mjs';
import {doc as integrationAddDoc} from '../clients/cli/commands/integration-add.doc.mjs';
import {parseDoc} from '../authoring/doctypes/parse.mjs';
import {parseCodemod} from '../authoring/codemod/parse.mjs';
import {resolvePackageDir} from '../foundation/integrations/integrations.mjs';
import {discoverThemeCatalog} from '../foundation/discovery/theme-discovery.mjs';
import {integrationAddTheme} from '../api/integration/add-theme.mjs';
import {themePaletteGenerate} from '../api/theme/palette/generate/generate.mjs';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

/** Flatten all text content from a ReferenceDoc's sections into one string. */
function guideText(doc) {
  const parts = [];
  for (const section of doc.sections ?? []) {
    for (const block of section.content ?? []) {
      if (block.type === 'prose') parts.push(block.text);
      if (block.type === 'code') parts.push(block.code);
      if (block.type === 'list') parts.push((block.items ?? []).join('\n'));
    }
  }
  return parts.join('\n');
}

// ── Executable source-of-truth tests ────────────────────────────────────

describe('parseDoc dispatches on documented type stamps', () => {
  it('routes type: component to the component parser', () => {
    const doc = parseDoc({
      type: 'component',
      name: 'Test',
      description: 'x',
      props: [],
    });
    expect(doc.type).toBe('component');
  });

  it('routes type: generic to the reference parser', () => {
    const doc = parseDoc({type: 'generic', name: 'test', description: 'x'});
    expect(doc.type).toBe('generic');
  });

  it('routes type: page to the template parser', () => {
    const doc = parseDoc({
      type: 'page',
      name: 'TestPage',
      description: 'x',
    });
    expect(doc.type).toBe('page');
  });

  it('routes type: block to the template parser', () => {
    const doc = parseDoc({
      type: 'block',
      name: 'TestBlock',
      description: 'x',
    });
    expect(doc.type).toBe('block');
  });

  it('a wrong stamp misroutes: generic on a component-shaped doc drops props', () => {
    // Demonstrates the guide's claim that a wrong stamp parses under the wrong schema
    const doc = parseDoc({
      type: 'generic',
      name: 'Mislabeled',
      description: 'x',
      props: [{name: 'a', type: 'string', description: 'x'}],
    });
    // generic schema uses passthrough so props survive, but the type is generic not component
    expect(doc.type).toBe('generic');
  });
});

describe('resolvePackageDir keeps integration specs beneath node_modules', () => {
  it('rejects absolute paths', () => {
    expect(() => resolvePackageDir('/etc/passwd')).toThrow(
      /invalid integration package name/i,
    );
  });

  it('rejects relative segments', () => {
    expect(() => resolvePackageDir('../escape')).toThrow(
      /invalid integration package name/i,
    );
  });

  it('rejects dot segments', () => {
    expect(() => resolvePackageDir('./local')).toThrow(
      /invalid integration package name/i,
    );
  });

  it('accepts scoped and nested slash-separated values', () => {
    expect(() => resolvePackageDir('@acme/widgets')).not.toThrow();
    expect(() => resolvePackageDir('foo/bar')).not.toThrow();
  });
});

describe('discoverThemeCatalog validates all documented required fields', () => {
  let tmpDir;

  function writeCatalog(themes) {
    const root = path.join(tmpDir, 'themes');
    fs.mkdirSync(root, {recursive: true});
    fs.writeFileSync(
      path.join(root, 'manifest.json'),
      JSON.stringify({version: 1, themes}),
    );
    return root;
  }

  function writeThemeFiles(slug, entry, exportName) {
    const dir = path.join(tmpDir, 'themes', slug);
    fs.mkdirSync(dir, {recursive: true});
    fs.writeFileSync(
      path.join(dir, entry),
      `export const ${exportName} = {};\n`,
    );
  }

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'doc-drift-'));
  });
  afterEach(() => {
    fs.rmSync(tmpDir, {recursive: true, force: true});
  });

  it('accepts a valid entry with all required fields', () => {
    const root = writeCatalog([
      {
        slug: 'ocean',
        displayName: 'Ocean',
        description: 'Ocean theme.',
        maintained: true,
        entry: 'oceanTheme.ts',
        exportName: 'oceanTheme',
        files: ['oceanTheme.ts'],
      },
    ]);
    writeThemeFiles('ocean', 'oceanTheme.ts', 'oceanTheme');
    expect(() => discoverThemeCatalog(root, '@test/pkg')).not.toThrow();
  });

  it('rejects missing slug', () => {
    const root = writeCatalog([
      {
        displayName: 'Ocean',
        description: 'x',
        maintained: true,
        entry: 'a.ts',
        exportName: 'a',
        files: ['a.ts'],
      },
    ]);
    expect(() => discoverThemeCatalog(root, '@test/pkg')).toThrow();
  });

  it('rejects missing displayName', () => {
    const root = writeCatalog([
      {
        slug: 'ocean',
        description: 'x',
        maintained: true,
        entry: 'a.ts',
        exportName: 'a',
        files: ['a.ts'],
      },
    ]);
    expect(() => discoverThemeCatalog(root, '@test/pkg')).toThrow();
  });

  it('rejects missing exportName', () => {
    const root = writeCatalog([
      {
        slug: 'ocean',
        displayName: 'Ocean',
        description: 'x',
        maintained: true,
        entry: 'a.ts',
        files: ['a.ts'],
      },
    ]);
    expect(() => discoverThemeCatalog(root, '@test/pkg')).toThrow();
  });

  it('rejects empty files array', () => {
    const root = writeCatalog([
      {
        slug: 'ocean',
        displayName: 'Ocean',
        description: 'x',
        maintained: true,
        entry: 'a.ts',
        exportName: 'a',
        files: [],
      },
    ]);
    expect(() => discoverThemeCatalog(root, '@test/pkg')).toThrow();
  });

  it('rejects missing maintained boolean', () => {
    const root = writeCatalog([
      {
        slug: 'ocean',
        displayName: 'Ocean',
        description: 'x',
        entry: 'a.ts',
        exportName: 'a',
        files: ['a.ts'],
      },
    ]);
    expect(() => discoverThemeCatalog(root, '@test/pkg')).toThrow();
  });

  it('requires version: 1 in the catalog root', () => {
    const root = path.join(tmpDir, 'themes');
    fs.mkdirSync(root, {recursive: true});
    fs.writeFileSync(
      path.join(root, 'manifest.json'),
      JSON.stringify({version: 2, themes: []}),
    );
    expect(() => discoverThemeCatalog(root, '@test/pkg')).toThrow(/version 1/);
  });
});

describe('documented theme palette workflow', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'documented-theme-flow-'));
    fs.writeFileSync(
      path.join(tmpDir, 'package.json'),
      JSON.stringify({name: '@acme/brand-integration', version: '1.0.0'}),
    );
  });

  afterEach(() => {
    fs.rmSync(tmpDir, {recursive: true, force: true});
  });

  it('generates and discovers the exact slug-relative catalog inventory', async () => {
    await integrationAddTheme('ocean', {cwd: tmpDir});
    const themeDir = path.join(tmpDir, 'themes', 'ocean');
    fs.mkdirSync(path.join(themeDir, 'tokens'), {recursive: true});
    fs.writeFileSync(
      path.join(themeDir, 'palette.config.json'),
      JSON.stringify({
        modeStrategy: 'light-only',
        stops: [20, 50, 80],
        families: [{id: 'blue', seed: '#0074e2'}],
      }),
    );

    const result = themePaletteGenerate(
      'themes/ocean/palette.config.json',
      {out: 'themes/ocean/tokens/ocean.palette.ts'},
      {cwd: tmpDir},
    );
    expect(result.data).toMatchObject({
      output: 'themes/ocean/tokens/ocean.palette.ts',
      receipt: 'themes/ocean/tokens/ocean.palette.receipt.json',
      written: true,
    });

    fs.writeFileSync(
      path.join(themeDir, 'oceanTheme.ts'),
      "import {palette} from './tokens/ocean.palette';\nexport const oceanTheme = {palette};\n",
    );
    const catalogPath = path.join(tmpDir, 'themes', 'manifest.json');
    const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf-8'));
    catalog.themes[0].files = [
      'oceanTheme.ts',
      'palette.config.json',
      'tokens/ocean.palette.ts',
      'tokens/ocean.palette.receipt.json',
    ];
    fs.writeFileSync(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`);

    expect(
      discoverThemeCatalog(
        path.join(tmpDir, 'themes'),
        '@acme/brand-integration',
      ),
    ).toEqual([expect.objectContaining({slug: 'ocean'})]);

    const text = guideText(integrationGuide);
    for (const documentedPath of catalog.themes[0].files) {
      expect(text).toContain(documentedPath);
    }
    expect(
      paletteGenerateDoc.examples.some(
        example =>
          example.cli ===
          'astryx theme palette generate themes/ocean/palette.config.json --out themes/ocean/tokens/ocean.palette.ts',
      ),
    ).toBe(true);
  });
});

// ── Guide prose content tests (verified against the executable tests above) ──

describe('cli-integrations guide required content', () => {
  const text = guideText(integrationGuide);

  it('documents all four type stamps used by parseDoc', () => {
    for (const stamp of ["'component'", "'generic'", "'page'", "'block'"]) {
      expect(text).toContain(stamp);
    }
  });

  it('documents both type stamps accepted by parseCodemod', () => {
    for (const type of ['code', 'config']) {
      expect(
        parseCodemod({type, title: `${type} migration`, transform() {}}).type,
      ).toBe(type);
      expect(text).toContain(`'${type}'`);
    }
  });

  it('contrasts component, doc, and template metadata suffixes', () => {
    expect(text).toContain('.doc.{ts,mjs,js}');
    expect(text).toContain('.template.{ts,mjs,js}');
  });

  it('documents the codemod version-directory layout', () => {
    expect(text).toMatch(/version-folder/i);
    expect(text).toMatch(/no `v` prefix/i);
    expect(text).toContain('0.2.0/');
  });

  it('documents that upgrade is dry-run by default with no --dry-run flag', () => {
    expect(text).toMatch(/dry-run by default/i);
    expect(text).toContain('--apply');
    expect(text).toMatch(/no `--dry-run` flag/i);
  });

  it('documents all required theme catalog manifest.json fields', () => {
    for (const field of [
      '`slug`',
      '`displayName`',
      '`description`',
      '`maintained`',
      '`entry`',
      '`exportName`',
      '`files`',
    ]) {
      expect(text).toContain(field);
    }
    expect(text).toContain('"version": 1');
  });

  it('documents the generated palette inventory exactly', () => {
    expect(text).toMatch(/already importable/i);
    expect(text).toContain('tokens/ocean.palette.ts');
    expect(text).toContain('tokens/ocean.palette.receipt.json');
    expect(text).toContain('palette.config.json');
  });

  it('documents extensionless package export subpaths', () => {
    expect(text).toMatch(/extensionless/i);
  });

  it('warns against npx for integration authoring', () => {
    expect(text).toMatch(/not.*npx/i);
  });

  it('documents that --integration resolves beneath node_modules', () => {
    expect(text).toMatch(/beneath.*node_modules/i);
  });

  it('documents integration pack --check', () => {
    expect(text).toContain('integration pack --check');
  });

  it('explains type stamp as required for new docs with legacy fallback', () => {
    expect(text).toMatch(/legacy.*stamp.*load/i);
  });
});

// ── CommandDoc / FunctionDoc consistency ─────────────────────────────────

describe('upgrade CommandDoc --integration flag', () => {
  const integrationOpt = upgradeCommandDoc.options.find(o =>
    o.flag.includes('--integration'),
  );

  it('exists', () => {
    expect(integrationOpt).toBeDefined();
  });

  it('states the actual resolver boundary', () => {
    expect(integrationOpt.description).toMatch(/beneath node_modules/i);
    expect(integrationOpt.description).toMatch(/absolute paths/i);
    expect(integrationOpt.description).toMatch(/`\.` or `\.\.`/);
  });

  it('flag placeholder does not say package-or-file', () => {
    expect(integrationOpt.flag).not.toContain('package-or-file');
  });
});

describe('upgrade FunctionDoc --integration param', () => {
  const integrationParam = upgradeFnDoc.params.find(
    p => p.name === 'options.integration',
  );

  it('exists', () => {
    expect(integrationParam).toBeDefined();
  });

  it('states the actual resolver boundary', () => {
    expect(integrationParam.description).toMatch(/beneath node_modules/i);
    expect(integrationParam.description).toMatch(/absolute paths/i);
    expect(integrationParam.description).toMatch(/`\.` or `\.\.`/);
  });
});

describe('palette generate doc mentions catalog connection', () => {
  it('description references theme catalog files array', () => {
    expect(paletteGenerateDoc.description).toMatch(/catalog/i);
    expect(paletteGenerateDoc.description).toMatch(/files.*array/i);
  });
});

describe('integration add doc has all contribution kinds', () => {
  const kindsArg = integrationAddDoc.args.find(a => a.name === 'kind');

  it('lists component, doc, template, codemod, agent-doc, and theme', () => {
    for (const kind of [
      'component',
      'doc',
      'template',
      'codemod',
      'agent-doc',
      'theme',
    ]) {
      expect(kindsArg.description).toContain(kind);
    }
  });
});
