// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Integration-provided template discovery (same-stem + type-driven).
 *
 * These tests stand up a temp consumer project with an astryx.config and an
 * installed integration package that contributes templates, then exercise the
 * public `template()` API to verify discovery, package/type scoping, ambiguity
 * errors, and copy-to-dir naming.
 */

import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {template} from './template.mjs';

let tmpDir;
let originalCwd;

function makeConsumer() {
  const dir = fs.mkdtempSync(
    path.join(process.cwd(), '.astryx-template-it-'),
  );
  fs.writeFileSync(
    path.join(dir, 'package.json'),
    JSON.stringify({name: 'consumer'}),
  );
  fs.writeFileSync(
    path.join(dir, 'astryx.config.mjs'),
    `export default { integrations: ['@acme/widgets'] };\n`,
  );
  return dir;
}

/**
 * Install an @acme/widgets integration package that declares a templates root.
 * @returns the package dir.
 */
function installWidgets(consumerDir) {
  const pkgDir = path.join(consumerDir, 'node_modules', '@acme', 'widgets');
  fs.mkdirSync(pkgDir, {recursive: true});
  fs.writeFileSync(
    path.join(pkgDir, 'package.json'),
    JSON.stringify({name: '@acme/widgets', version: '2.0.0'}),
  );
  fs.writeFileSync(
    path.join(pkgDir, 'astryx.integration.mjs'),
    `export default { templates: './templates' };\n`,
  );
  fs.mkdirSync(path.join(pkgDir, 'templates'));
  return pkgDir;
}

/** Like {@link installWidgets} but the integration also owns a component. */
function installWidgetsWithComponents(consumerDir) {
  const pkgDir = installWidgets(consumerDir);
  fs.writeFileSync(
    path.join(pkgDir, 'astryx.integration.mjs'),
    `export default { templates: './templates', components: './components' };\n`,
  );
  const cDir = path.join(pkgDir, 'components');
  fs.mkdirSync(cDir, {recursive: true});
  fs.writeFileSync(
    path.join(cDir, 'WidgetButton.doc.mjs'),
    `export default { name: 'WidgetButton' };\n`,
  );
  fs.writeFileSync(
    path.join(cDir, 'WidgetButton.tsx'),
    `export function WidgetButton() { return null; }\n`,
  );
  return pkgDir;
}

/** Minimal fake core package so the registry's filtered path is exercised. */
function installFakeCore(consumerDir) {
  const coreDir = path.join(
    consumerDir,
    'node_modules',
    '@astryxdesign',
    'core',
  );
  const compDir = path.join(coreDir, 'src', 'FakeButton');
  fs.mkdirSync(compDir, {recursive: true});
  fs.writeFileSync(
    path.join(compDir, 'FakeButton.doc.mjs'),
    `export default { name: 'FakeButton' };\n`,
  );
  fs.writeFileSync(
    path.join(compDir, 'FakeButton.tsx'),
    `export function FakeButton() { return null; }\n`,
  );
  return coreDir;
}

/**
 * Add a parent component doc with an OBJECT-ARRAY `components:` entry (the
 * shape the old template-layer regex (`components:\s*\[([^\]]+)\]`) mangled,
 * and the only place subcomponent names like StackItem live).
 */
function installParentDocSubcomponent(coreDir, parentName, subName) {
  const parentDir = path.join(coreDir, 'src', parentName);
  fs.mkdirSync(parentDir, {recursive: true});
  fs.writeFileSync(
    path.join(parentDir, `${parentName}.doc.mjs`),
    `export const docs = { name: '${parentName}', description: '${parentName.toLowerCase()} layout', components: [{ name: '${subName}', description: 'a ${parentName.toLowerCase()} child', props: [{ name: 'align', type: 'string' }] }] };\n`,
  );
  fs.writeFileSync(
    path.join(parentDir, `${parentName}.tsx`),
    `export function ${parentName}() { return null; }\n`,
  );
}

/**
 * Back-compat external docs package (pkg.astryx.docs, no integration file):
 * `astryx component <Name>` falls back to it, so its components are
 * resolvable and must stay advertisable.
 */
function installExternalDocsPackage(consumerDir) {
  const pkgDir = path.join(consumerDir, 'node_modules', '@acme', 'charts');
  fs.mkdirSync(path.join(pkgDir, 'docs'), {recursive: true});
  fs.writeFileSync(
    path.join(pkgDir, 'package.json'),
    JSON.stringify(
      {name: '@acme/charts', version: '0.1.0', astryx: {docs: './docs'}},
      null,
      2,
    ),
  );
  fs.writeFileSync(
    path.join(pkgDir, 'docs', 'BarChart.doc.mjs'),
    `export default { name: 'BarChart', description: 'a chart' };\n`,
  );
  return pkgDir;
}

/** Write a template doc + same-stem source under the templates root. */
function writeTemplate(pkgDir, id, {kind, body, withSource = true}) {
  const docPath = path.join(pkgDir, 'templates', `${id}.doc.mjs`);
  fs.mkdirSync(path.dirname(docPath), {recursive: true});
  fs.writeFileSync(
    docPath,
    body ??
      `export default {type: '${kind}', name: '${id} name', description: '${id} desc'};\n`,
  );
  if (withSource) {
    fs.writeFileSync(
      path.join(pkgDir, 'templates', `${id}.tsx`),
      `export default function ${id.replace(/[^a-zA-Z0-9]/g, '')}() { return null; }\n`,
    );
  }
}

beforeEach(() => {
  originalCwd = process.cwd();
  tmpDir = makeConsumer();
  process.chdir(tmpDir);
});

afterEach(() => {
  process.chdir(originalCwd);
  fs.rmSync(tmpDir, {recursive: true, force: true});
});

describe('integration template discovery', () => {
  it('keeps integration-owned components in skeleton lists (registry includes loaded integrations)', async () => {
    installFakeCore(tmpDir);
    const pkgDir = installWidgetsWithComponents(tmpDir);
    writeTemplate(pkgDir, 'pricing', {kind: 'page', withSource: false});
    fs.writeFileSync(
      path.join(pkgDir, 'templates', 'pricing.tsx'),
      `function LocalHelper() { return null; }\n` +
        `export default function Pricing() { return <WidgetButton /><LocalHelper />; }\n`,
    );

    const result = await template('pricing', {skeleton: true, cwd: tmpDir});
    // `astryx component WidgetButton` resolves via the integration, so the
    // skeleton must keep advertising it even though it is not a core
    // component (#4677).
    expect(result.data.components).toContain('WidgetButton');
    // Local helper functions still must not leak into the list.
    expect(result.data.components).not.toContain('LocalHelper');
  });

  it('retains parent-doc subcomponents read from object-array doc entries', async () => {
    // Regression for #4677: the old template-layer registry scraped doc files
    // with a regex that shredded object-array `components: [...]` entries
    // (e.g. `{name: 'StackItem'}`), so resolvable subcomponents dropped out of
    // skeleton lists. Now they come from loadDocs, and the list is filtered
    // against exact names only, no suffix fuzzying either, so a local helper
    // like TimelineSection must not be rewritten to the resolvable Timeline.
    const coreDir = installFakeCore(tmpDir);
    installParentDocSubcomponent(coreDir, 'Stack', 'StackItem');
    const pkgDir = installWidgets(tmpDir);
    writeTemplate(pkgDir, 'pricing', {kind: 'page', withSource: false});
    fs.writeFileSync(
      path.join(pkgDir, 'templates', 'pricing.tsx'),
      `function TimelineSection() { return null; }\n` +
        `export default function Pricing() { return <StackItem /><TimelineSection /><FakeButton />; }\n`,
    );

    const result = await template('pricing', {skeleton: true, cwd: tmpDir});
    expect(result.data.components).toContain('StackItem');
    expect(result.data.components).toContain('FakeButton');
    expect(result.data.components).not.toContain('TimelineSection');
    expect(result.data.components).not.toContain('Timeline');
  });

  it('retains components documented by back-compat external docs packages', async () => {
    installFakeCore(tmpDir);
    installExternalDocsPackage(tmpDir);
    const pkgDir = installWidgets(tmpDir);
    writeTemplate(pkgDir, 'pricing', {kind: 'page', withSource: false});
    fs.writeFileSync(
      path.join(pkgDir, 'templates', 'pricing.tsx'),
      `export default function Pricing() { return <BarChart /><FakeButton />; }\n`,
    );

    const result = await template('pricing', {skeleton: true, cwd: tmpDir});
    expect(result.data.components).toContain('BarChart');
    expect(result.data.components).toContain('FakeButton');
  });

  it('discovers and lists an integration template with package + type', async () => {
    const pkgDir = installWidgets(tmpDir);
    writeTemplate(pkgDir, 'pricing', {kind: 'page'});

    const result = await template(undefined, {list: true, cwd: tmpDir});
    expect(result.type).toBe('template.list');
    const entry = result.data.find(t => t.id === 'pricing');
    expect(entry).toBeTruthy();
    expect(entry.type).toBe('page');
    expect(entry.package).toBe('@acme/widgets');
    expect(entry.name).toBe('pricing name');
    expect(entry.description).toBe('pricing desc');
  });

  it('lists nested-id templates (kebab path under root)', async () => {
    const pkgDir = installWidgets(tmpDir);
    writeTemplate(pkgDir, 'marketing/hero', {kind: 'block'});

    const result = await template(undefined, {list: true, cwd: tmpDir});
    const entry = result.data.find(t => t.id === 'marketing/hero');
    expect(entry).toBeTruthy();
    expect(entry.type).toBe('block');
    expect(entry.package).toBe('@acme/widgets');
  });

  it('always reports core templates under @astryxdesign/core', async () => {
    const result = await template(undefined, {list: true, cwd: tmpDir});
    const core = result.data.filter(t => t.package === '@astryxdesign/core');
    expect(core.length).toBeGreaterThan(0);
  });

  it('--package narrows the listing', async () => {
    const pkgDir = installWidgets(tmpDir);
    writeTemplate(pkgDir, 'pricing', {kind: 'page'});

    const result = await template(undefined, {
      list: true,
      package: '@acme/widgets',
      cwd: tmpDir,
    });
    expect(result.data.length).toBe(1);
    expect(result.data[0].id).toBe('pricing');
  });

  it('skips a template whose same-stem source is missing', async () => {
    const pkgDir = installWidgets(tmpDir);
    writeTemplate(pkgDir, 'orphan', {kind: 'page', withSource: false});

    const result = await template(undefined, {list: true, cwd: tmpDir});
    expect(result.data.find(t => t.id === 'orphan')).toBeUndefined();
  });

  it('skips a raw doc that is missing a type', async () => {
    const pkgDir = installWidgets(tmpDir);
    writeTemplate(pkgDir, 'untyped', {
      kind: 'page',
      body: `export default {name: 'Untyped', description: 'no type'};\n`,
    });

    const result = await template(undefined, {list: true, cwd: tmpDir});
    expect(result.data.find(t => t.id === 'untyped')).toBeUndefined();
  });

  it('errors with candidates when an id is ambiguous across type/package', async () => {
    const pkgDir = installWidgets(tmpDir);
    // Same id "hero" as both a page and a block within the integration.
    writeTemplate(pkgDir, 'hero', {kind: 'page'});
    // Add a sibling block doc with the same stem in a different file is not
    // possible (same file). Instead install a second package with a "hero".
    const pkg2 = path.join(tmpDir, 'node_modules', '@acme', 'extra');
    fs.mkdirSync(path.join(pkg2, 'templates'), {recursive: true});
    fs.writeFileSync(
      path.join(pkg2, 'package.json'),
      JSON.stringify({name: '@acme/extra', version: '1.0.0'}),
    );
    fs.writeFileSync(
      path.join(pkg2, 'astryx.integration.mjs'),
      `export default { templates: './templates' };\n`,
    );
    fs.writeFileSync(
      path.join(pkg2, 'templates', 'hero.doc.mjs'),
      `export default {type: 'block', name: 'Hero block', description: 'b'};\n`,
    );
    fs.writeFileSync(
      path.join(pkg2, 'templates', 'hero.tsx'),
      `export default function Hero() { return null; }\n`,
    );
    fs.writeFileSync(
      path.join(tmpDir, 'astryx.config.mjs'),
      `export default { integrations: ['@acme/widgets', '@acme/extra'] };\n`,
    );

    await expect(
      template('hero', {targetPath: './out', cwd: tmpDir}),
    ).rejects.toMatchObject({code: 'ERR_AMBIGUOUS_TEMPLATE'});
  });

  it('--type and --package narrow an ambiguous id to a single match', async () => {
    const pkgDir = installWidgets(tmpDir);
    writeTemplate(pkgDir, 'pricing', {kind: 'page'});

    const result = await template('pricing', {
      type: 'page',
      package: '@acme/widgets',
      show: true,
      cwd: tmpDir,
    });
    expect(result.type).toBe('template.show');
    expect(result.data.type).toBe('page');
  });

  it('copies a page template into a directory as page.tsx', async () => {
    const pkgDir = installWidgets(tmpDir);
    writeTemplate(pkgDir, 'pricing', {kind: 'page'});

    const result = await template('pricing', {
      targetPath: './dest',
      cwd: tmpDir,
    });
    expect(result.type).toBe('template.copy');
    expect(result.data.fileName).toBe('page.tsx');
    expect(fs.existsSync(path.join(tmpDir, 'dest', 'page.tsx'))).toBe(true);
  });

  it('copies a block template into a directory as <id-basename>.tsx', async () => {
    const pkgDir = installWidgets(tmpDir);
    writeTemplate(pkgDir, 'marketing/hero', {kind: 'block'});

    const result = await template('marketing/hero', {
      targetPath: './dest',
      cwd: tmpDir,
    });
    expect(result.type).toBe('template.copy');
    expect(result.data.fileName).toBe('hero.tsx');
    expect(fs.existsSync(path.join(tmpDir, 'dest', 'hero.tsx'))).toBe(true);
  });
});
