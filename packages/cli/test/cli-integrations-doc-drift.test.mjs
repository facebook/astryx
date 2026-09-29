// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Documentation drift tests for the integration guides
 * (`astryx docs cli/integrations`) and related CommandDocs/FunctionDocs. Tests verify against executable sources of truth
 * (parseDoc dispatch, resolvePackageDir, theme-discovery validators, schema
 * shapes) rather than only prose-to-prose assertions, so a behavioral change
 * that invalidates a documented claim is caught at CI time.
 */

import {afterEach, beforeEach, describe, it, expect} from 'vitest';
import {doc as upgradeCommandDoc} from '../clients/cli/commands/upgrade.doc.mjs';
import {doc as upgradeFnDoc} from '../api/upgrade/upgrade.doc.mjs';
import {doc as paletteGenerateDoc} from '../clients/cli/commands/theme-palette-generate.doc.mjs';
import {doc as integrationAddDoc} from '../clients/cli/commands/integration-add.doc.mjs';
import {parseDoc} from '../authoring/doctypes/parse.mjs';
import {parseCodemod} from '../authoring/codemod/parse.mjs';
import {resolvePackageDir} from '../foundation/integrations/integrations.mjs';
import {discoverThemeDirectory} from '../foundation/discovery/theme-discovery.mjs';
import {integrationAddTheme} from '../api/integration/add-theme.mjs';
import {themePaletteGenerate} from '../api/theme/palette/generate/generate.mjs';
import {
  DOCS_TREE_CLI,
  docsTreeCliProblem,
  replacesCliProblem,
  sectionIdsCliProblem,
  themesCliProblem,
} from '../foundation/integrations/cli-requirement.mjs';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

const TREE_DIR = path.join(import.meta.dirname, '..', 'assets', 'docs', 'tree');

/** Flatten all text content from a ReferenceDoc's sections into one string. */
function guideText(doc) {
  const parts = [];
  for (const section of doc.sections ?? []) {
    for (const block of section.content ?? []) {
      if (block.type === 'prose') parts.push(block.text);
      if (block.type === 'code') parts.push(block.code);
      if (block.type === 'list') parts.push((block.items ?? []).join('\n'));
      if (block.type === 'table') {
        parts.push((block.rows ?? []).map(row => row.join(' | ')).join('\n'));
      }
    }
  }
  return parts.join('\n');
}

/**
 * The text of every guide under `cli/integrations`, the docs guides one level
 * down included.
 */
async function integrationGuidesText({codeOnly = false} = {}) {
  const parts = [];
  for (const file of fs.readdirSync(TREE_DIR).sort()) {
    if (!file.endsWith('.doc.mjs')) continue;
    const {docs: doc} = await import(path.join(TREE_DIR, file));
    const parent = doc?.placement?.parent;
    if (parent !== 'namespace:integrations' && parent !== 'namespace:docs') {
      continue;
    }
    if (doc.type !== 'generic') continue;
    if (!codeOnly) {
      parts.push(guideText(doc));
      continue;
    }
    for (const section of doc.sections ?? []) {
      for (const block of section.content ?? []) {
        if (block.type === 'code') parts.push(block.code);
      }
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

describe('a theme descriptor carries every documented field', () => {
  let tmpDir;

  const descriptor = (/** @type {object} */ fields = {}) => ({
    type: 'theme',
    name: 'ocean',
    displayName: 'Ocean',
    description: 'Ocean theme.',
    maintained: true,
    ...fields,
  });

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'doc-drift-'));
  });
  afterEach(() => {
    fs.rmSync(tmpDir, {recursive: true, force: true});
  });

  it('accepts a descriptor with every documented field', () => {
    expect(parseDoc(descriptor(), 'oceanTheme.doc.mjs').type).toBe('theme');
  });

  it.each(['name', 'displayName', 'description', 'maintained'])(
    'rejects a descriptor without %s',
    field => {
      const {[field]: _, ...rest} = descriptor();
      expect(() => parseDoc(rest, 'oceanTheme.doc.mjs')).toThrow(field);
    },
  );

  it('rejects a slug that is not lowercase kebab-case', () => {
    expect(() =>
      parseDoc(descriptor({name: 'Ocean'}), 'oceanTheme.doc.mjs'),
    ).toThrow(/kebab-case/);
  });

  it('rejects a theme directory without its same-stem descriptor', () => {
    const dir = path.join(tmpDir, 'themes', 'ocean');
    fs.mkdirSync(dir, {recursive: true});
    fs.writeFileSync(
      path.join(dir, 'oceanTheme.ts'),
      'export const oceanTheme = {};\n',
    );
    expect(() =>
      discoverThemeDirectory(path.join(tmpDir, 'themes'), '@test/pkg'),
    ).toThrow();
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

  it('generates and discovers the exact documented theme directory', async () => {
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
    const [theme] = discoverThemeDirectory(
      path.join(tmpDir, 'themes'),
      '@acme/brand-integration',
    );
    expect(theme).toMatchObject({slug: 'ocean', entry: 'oceanTheme.ts'});
    const documented = [
      'oceanTheme.ts',
      'oceanTheme.doc.mjs',
      'palette.config.json',
      'tokens/ocean.palette.receipt.json',
      'tokens/ocean.palette.ts',
    ];
    // The documented layout is exactly what the theme directory ships, entry
    // first.
    expect(theme.files).toEqual(documented);

    const text = await integrationGuidesText();
    for (const documentedPath of documented) {
      expect(text).toContain(documentedPath.split('/').pop());
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

describe('integration guides required content', () => {
  /** @type {string} */
  let text;
  beforeEach(async () => {
    text ??= await integrationGuidesText();
  });

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

  it('names .doc.mjs as the authoring suffix', () => {
    expect(text).toContain('.doc.mjs');
  });

  it('documents the codemod version folders and the Core versions they match', () => {
    expect(text).toContain('folder named after a version');
    expect(text).toContain(
      "Version folders are matched against the app's `@astryxdesign/core` versions, not your package's version.",
    );
  });

  it('documents that upgrade is a dry run by default', () => {
    expect(text).toMatch(/dry run by default/i);
    expect(text).toContain('--apply');
    expect(upgradeCommandDoc.options.some(o => o.flag === '--apply')).toBe(
      true,
    );
  });

  it('documents every ThemeDoc field', () => {
    for (const field of [
      '`name`',
      '`displayName`',
      '`description`',
      '`maintained`',
    ]) {
      expect(text).toContain(field);
    }
    expect(text).not.toContain('manifest.json entry');
  });

  it('documents the generated palette inventory exactly', () => {
    expect(text).toContain('tokens/ocean.palette.ts');
    expect(text).toContain('ocean.palette.receipt.json');
    expect(text).toContain('palette.config.json');
  });

  it('tells authors to start a package with an exports map', () => {
    expect(text).toContain('"exports": {}');
  });

  it('runs the installed CLI through npx', () => {
    expect(text).toContain('npx astryx');
    expect(text).toMatch(/installed as a devDependency/);
  });

  it('runs the pre-publish check as `integration verify`; the old name is only history', async () => {
    expect(text).toContain('npx astryx integration verify');
    // The old spelling may name what an older CLI calls the check, never a
    // command to run.
    expect(await integrationGuidesText({codeOnly: true})).not.toContain(
      'pack --check',
    );
    expect(integrationAddDoc.related).toContain('integration verify');
  });

  it('names the old command nowhere but its history', () => {
    // `integration pack --check` became `integration verify` with no alias, so
    // no text a reader or an agent follows may still name the old command: a
    // doc the CLI ships, a message or example in the CLI's source (the agent
    // block it writes, a hint, the manifest), a Markdown file in the repo
    // (READMEs, AGENTS.md, records, pending changesets, skills), or a docsite
    // page. Only these lines, which tell an older CLI's check from the new
    // one, may; released CHANGELOGs and the tests that prove the old spelling
    // fails keep theirs.
    const repo = path.join(import.meta.dirname, '..', '..', '..');
    const history = new Set(
      [
        'packages/cli/assets/docs/tree/checks.doc.mjs',
        'packages/cli/assets/docs/tree/troubleshooting.doc.mjs',
        '.changeset/integration-verify.md',
      ].map(file => path.join(repo, file)),
    );
    const OLD = /\bintegration[ -]pack(?!age)\b|\bpack --check\b/;
    const SKIP = new Set([
      'node_modules',
      '.git',
      'dist',
      '.next',
      'generated',
      '__tests__',
      'coverage',
      'test',
      'fixtures',
    ]);
    /**
     * @param {string} dir
     * @param {(name: string) => boolean} keep
     * @returns {string[]}
     */
    const walk = (dir, keep) =>
      fs.readdirSync(dir, {withFileTypes: true}).flatMap(entry => {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory())
          return SKIP.has(entry.name) ? [] : walk(full, keep);
        return entry.isFile() && keep(entry.name) ? [full] : [];
      });
    const cli = path.join(repo, 'packages', 'cli');
    const files = new Set([
      ...['api', 'assets', 'authoring', 'clients', 'foundation'].flatMap(dir =>
        walk(path.join(cli, dir), name => /\.doc(\.[a-z]+)?\.mjs$/.test(name)),
      ),
      ...walk(
        cli,
        name =>
          /\.(mjs|js|ts|tsx)$/.test(name) && !/\.(test|spec)\./.test(name),
      ),
      ...walk(repo, name => /\.mdx?$/.test(name) && name !== 'CHANGELOG.md'),
      ...walk(path.join(repo, 'apps', 'docsite', 'src'), name =>
        /\.(tsx?|mdx?)$/.test(name),
      ),
    ]);
    expect(files.size).toBeGreaterThan(500);
    const stale = [...files].filter(
      file => !history.has(file) && OLD.test(fs.readFileSync(file, 'utf8')),
    );
    expect(stale.map(file => path.relative(repo, file))).toEqual([]);
  });

  it('names every CLI-peer failure `integration verify` reports', () => {
    for (const code of [
      'docs_tree_needs_cli',
      'replaces_needs_cli',
      'themes_need_cli',
      'section_ids_need_cli',
    ]) {
      expect(text).toContain(code);
    }
    expect(text).toContain(`>=${DOCS_TREE_CLI}`);
  });

  it('names the CLI version the verify checks need, from DOCS_TREE_CLI', async () => {
    // Each guide line that says which CLI reads a docs section, a section id,
    // a template `replaces`, or a theme names the version `integration verify`
    // enforces. Change DOCS_TREE_CLI and every copy fails here until it moves.
    const COPIES = [
      /"@astryxdesign\/cli":\s*">=(\d+\.\d+\.\d+)"/g,
      /@astryxdesign\/cli=>=(\d+\.\d+\.\d+)/g,
      /`>=(\d+\.\d+\.\d+)`/g,
      /\bolder than (\d+\.\d+\.\d+)/g,
      /\bstable CLI before (\d+\.\d+\.\d+)/g,
      /\bstable `@astryxdesign\/cli` before (\d+\.\d+\.\d+)/g,
      /\bcli`? (\d+\.\d+\.\d+) or later/gi,
    ];
    /** @type {string[]} */
    const found = [];
    for (const file of fs.readdirSync(TREE_DIR).sort()) {
      if (!file.endsWith('.doc.mjs')) continue;
      const {docs: doc} = await import(path.join(TREE_DIR, file));
      const text = guideText(doc);
      for (const pattern of COPIES) {
        for (const m of text.matchAll(pattern)) {
          found.push(`${file}: ${m[0]} names ${m[1]}`);
        }
      }
    }
    expect(found.length).toBeGreaterThanOrEqual(20);
    expect(
      found.filter(line => !line.endsWith(` names ${DOCS_TREE_CLI}`)),
    ).toEqual([]);
  });

  it('quotes the verify failures as the CLI prints them', async () => {
    const {docs: checkYourDocs} = await import(
      path.join(TREE_DIR, 'check-your-docs.doc.mjs')
    );
    expect(guideText(checkYourDocs)).toContain(
      `- [fail] ${docsTreeCliProblem({})}`,
    );
    // Troubleshooting quotes the first sentence of each, beside its code.
    const {docs: troubleshooting} = await import(
      path.join(TREE_DIR, 'troubleshooting.doc.mjs')
    );
    const text = guideText(troubleshooting);
    for (const problem of [
      docsTreeCliProblem,
      replacesCliProblem,
      sectionIdsCliProblem,
      themesCliProblem,
    ]) {
      const message = /** @type {string} */ (problem({}));
      expect(text).toContain(`${message.split('. ')[0]}.`);
    }
  });
});
