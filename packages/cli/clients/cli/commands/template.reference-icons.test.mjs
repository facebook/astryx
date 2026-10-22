// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Bundled templates import their icons from the official Heroicons
 * set, `@astryxdesign/icons-heroicons` (AST-084 FR19–FR21):
 *   - with no opt-in, `astryx template` writes each reference import as the
 *     upstream import the set re-exports, with no `icons` report;
 *   - with the set installed and chosen, the template keeps its imports;
 *   - with another set chosen, icons map by definition and a kept icon still
 *     names the upstream library;
 *   - with no set and `experimental.templateIcons`, each icon becomes Core's
 *     built-in icon for its definition, or the neutral placeholder, and the
 *     report carries the note.
 */

import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';
import {parse} from '@babel/parser';
import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import {runCli} from '../../../test-utils/run-cli.mjs';
import {writeIconSetProject} from '../../../test-utils/icon-set-fixture.mjs';
import {NO_ICON_SET_NOTE} from '../../../foundation/discovery/template-reference-icons.mjs';

const REFERENCE = '@astryxdesign/icons-heroicons';
const REFERENCE_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../../../icons-heroicons',
);
// ai-chat declares close and chevronRight (built in) and five more (not).
const TEMPLATE = 'ai-chat';

/** @type {string} */
let tmp;
beforeEach(() => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-reference-icons-'));
});
afterEach(() => {
  fs.rmSync(tmp, {recursive: true, force: true});
});

/** @param {string[]} args @param {string} cwd */
async function json(args, cwd) {
  const res = await runCli([...args, '--json'], cwd);
  expect(res.code, res.stderr).toBe(0);
  return JSON.parse(res.stdout).data;
}

/**
 * Install the official set in a project, as a dependency.
 * @param {string} project
 */
function installReference(project) {
  const target = path.join(project, 'node_modules', '@astryxdesign');
  fs.mkdirSync(target, {recursive: true});
  fs.symlinkSync(REFERENCE_DIR, path.join(target, 'icons-heroicons'), 'dir');
  const pkgPath = path.join(project, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
  pkg.dependencies = {...pkg.dependencies, [REFERENCE]: '0.7.3'};
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
}

describe('templates by meaning, through the reference icon set', () => {
  it('no opt-in: the upstream imports, no report, and the upstream library is the needed package', async () => {
    const cwd = writeIconSetProject(tmp, {packages: []});
    const shown = await json(['template', TEMPLATE], cwd);
    expect(shown).not.toHaveProperty('icons');
    expect(shown.source).not.toContain(REFERENCE);
    expect(shown.source).toContain("} from '@heroicons/react/24/outline';");
    expect(shown.source).toMatch(/\bXMarkIcon\b/);
    const copied = await json(['template', TEMPLATE, './out'], cwd);
    expect(copied).not.toHaveProperty('icons');
    expect(copied.missingPackages).toContain('@heroicons/react');
    expect(copied.missingPackages).not.toContain(REFERENCE);
    expect(fs.readFileSync(path.join(cwd, 'out', 'page.tsx'), 'utf-8')).toBe(
      shown.source,
    );
    const text = await runCli(['template', TEMPLATE], cwd);
    expect(text.stderr).not.toContain('icons:');
  });

  it('the official set chosen: the template keeps its imports from the set', async () => {
    const cwd = writeIconSetProject(tmp, {
      packages: [],
      config: {experimental: {iconSet: 'heroicons'}},
    });
    installReference(cwd);
    const shown = await json(['template', TEMPLATE], cwd);
    expect(shown.icons).toMatchObject({
      status: 'selected',
      set: `${REFERENCE}/heroicons`,
      mapped: [],
      kept: [],
    });
    expect(shown.source).toContain(`} from '${REFERENCE}';`);
    expect(shown.source).not.toContain('@heroicons/react');
    const copied = await json(['template', TEMPLATE, './out'], cwd);
    expect(copied.missingPackages).not.toContain(REFERENCE);
    expect(copied.missingPackages).not.toContain('@heroicons/react');
  });

  it('another set chosen: declared icons map by definition, and a kept icon names the upstream library', async () => {
    const cwd = writeIconSetProject(tmp, {
      config: {experimental: {iconSet: 'glyphs'}},
    });
    const shown = await json(['template', TEMPLATE], cwd);
    expect(shown.icons.mapped).toContainEqual({
      source: {module: REFERENCE, export: 'XMarkIcon'},
      target: expect.objectContaining({set: 'glyphs', export: 'XIcon'}),
      by: 'definition',
    });
    expect(shown.icons.kept.length).toBeGreaterThan(0);
    for (const kept of shown.icons.kept) {
      expect(kept.module).toBe('@heroicons/react/24/outline');
    }
    expect(shown.source).not.toContain(REFERENCE);
    expect(shown.source).toContain("import {XIcon} from '@acme/glyphs';");
  });

  it("no set with experimental.templateIcons: Core's icons and the placeholder, with the note in text and JSON", async () => {
    const cwd = writeIconSetProject(tmp, {
      packages: [],
      config: {experimental: {templateIcons: true}},
    });
    const shown = await json(['template', TEMPLATE], cwd);
    expect(shown.icons).toMatchObject({
      status: 'none',
      set: null,
      note: NO_ICON_SET_NOTE,
      mapped: [],
      kept: [],
    });
    expect(shown.icons.core).toContainEqual({
      source: {module: '@heroicons/react/24/outline', export: 'XMarkIcon'},
      definition: 'close',
      icon: 'close',
    });
    expect(shown.icons.core).toContainEqual({
      source: {module: '@heroicons/react/24/outline', export: 'PaperClipIcon'},
      definition: 'attach',
      icon: null,
    });
    const source = shown.source;
    // Only the note names the set; nothing imports it.
    expect(source).not.toContain(`from '${REFERENCE}'`);
    expect(source).not.toContain('@heroicons/react');
    expect(source).toContain(
      "import {useIcon, type IconName, type IconProps} from '@astryxdesign/core/Icon';",
    );
    expect(source).toContain("const XMarkIcon = coreIcon('close');");
    expect(source).toContain(
      "const ChevronRightIcon = coreIcon('chevronRight');",
    );
    expect(source).toContain('const PaperClipIcon = PlaceholderIcon;');
    expect(source).toContain(`// ${NO_ICON_SET_NOTE}.`);
    // The written file still parses, and every reference keeps its name.
    expect(() =>
      parse(source, {sourceType: 'module', plugins: ['jsx', 'typescript']}),
    ).not.toThrow();
    expect(source).toContain('<Icon icon={XMarkIcon} size="sm" />');

    const copied = await json(['template', TEMPLATE, './out'], cwd);
    expect(copied.icons).toEqual(shown.icons);
    expect(copied.missingPackages).not.toContain('@heroicons/react');

    const text = await runCli(['template', TEMPLATE], cwd);
    expect(text.stdout.trimEnd()).toBe(source.trimEnd());
    expect(text.stderr).toContain(
      `icons: core XMarkIcon (@heroicons/react/24/outline) -> Core's "close" icon for "close"`,
    );
    expect(text.stderr).toContain(
      'icons: core PaperClipIcon (@heroicons/react/24/outline) -> a placeholder for "attach"',
    );
    expect(text.stderr).toContain(`icons: ${NO_ICON_SET_NOTE}`);
  });

  it('experimental.iconSet wins over experimental.templateIcons', async () => {
    const cwd = writeIconSetProject(tmp, {
      config: {experimental: {iconSet: 'glyphs', templateIcons: true}},
    });
    const shown = await json(['template', TEMPLATE], cwd);
    expect(shown.icons.status).toBe('selected');
    expect(shown.icons).not.toHaveProperty('core');
    expect(shown.source).not.toContain('coreIcon(');
  });
});
