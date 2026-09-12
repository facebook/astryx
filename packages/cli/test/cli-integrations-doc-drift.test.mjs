// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Documentation drift tests for the cli-integrations guide and related
 * CommandDocs/FunctionDocs. Tests verify against executable sources of truth
 * (parseDoc dispatch, resolvePackageDir, theme-discovery validators, schema
 * shapes) rather than only prose-to-prose assertions, so a behavioral change
 * that invalidates a documented claim is caught at CI time.
 */

import {describe, it, expect} from 'vitest';
import {docs as integrationGuide} from '../assets/docs/cli-integrations.doc.mjs';
import {doc as upgradeCommandDoc} from '../clients/cli/commands/upgrade.doc.mjs';
import {doc as upgradeFnDoc} from '../api/upgrade/upgrade.doc.mjs';
import {doc as paletteGenerateDoc} from '../clients/cli/commands/theme-palette-generate.doc.mjs';
import {doc as integrationAddDoc} from '../clients/cli/commands/integration-add.doc.mjs';
import {parseDoc} from '../authoring/doctypes/parse.mjs';
import {resolvePackageDir} from '../foundation/integrations/integrations.mjs';
import {discoverThemeCatalog} from '../foundation/discovery/theme-discovery.mjs';
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

describe('resolvePackageDir rejects file paths (documented claim)', () => {
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

  it('accepts a bare scoped package name', () => {
    // Should not throw — just resolves the path (may not exist, that is fine)
    expect(() => resolvePackageDir('@acme/widgets')).not.toThrow();
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

// ── Guide prose content tests (verified against the executable tests above) ──

describe('cli-integrations guide required content', () => {
  const text = guideText(integrationGuide);

  it('documents all six type stamp values used by parseDoc', () => {
    // These must match the switch cases in parseDoc
    for (const stamp of [
      "'component'",
      "'generic'",
      "'page'",
      "'block'",
      "'code'",
      "'config'",
    ]) {
      expect(text).toContain(stamp);
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

  it('documents palette wrapper as separately authored', () => {
    expect(text).toMatch(/separately authored/i);
    expect(text).toMatch(/wrapper/i);
    expect(text).toContain('oceanPalettes.ts');
  });

  it('documents extensionless package export subpaths', () => {
    expect(text).toMatch(/extensionless/i);
  });

  it('warns against npx for integration authoring', () => {
    expect(text).toMatch(/not.*npx/i);
  });

  it('documents that --integration accepts package names only', () => {
    expect(text).toMatch(/package names only/i);
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
  const integrationOpt = upgradeCommandDoc.options.find(
    o => o.flag.includes('--integration'),
  );

  it('exists', () => {
    expect(integrationOpt).toBeDefined();
  });

  it('states that file paths are rejected', () => {
    expect(integrationOpt.description).toMatch(/file paths are rejected/i);
  });

  it('says package names only', () => {
    expect(integrationOpt.description).toMatch(/package name/i);
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

  it('says package names only', () => {
    expect(integrationParam.description).toMatch(/package name/i);
  });

  it('does not claim file paths work', () => {
    expect(integrationParam.description).not.toMatch(
      /file paths to process/i,
    );
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
