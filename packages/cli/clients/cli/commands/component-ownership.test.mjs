// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import {
  discoverIntegrationComponents,
  discoverOwnedComponents,
  findIntegrationComponentDoc,
  findIntegrationComponentSource,
  CORE_PACKAGE,
} from '../../../foundation/discovery/component-discovery.mjs';

// The api `component()` reads integrations via Project.load(). In the vitest
// environment, Vite's `server.fs.allow` only permits loading modules from
// under `node_modules`, so a real astryx.config.mjs at a tmp root cannot be
// imported. We therefore mock Project.load to return a project whose
// `loadedIntegrations` are resolved (exactly the shape lib/integrations.mjs
// produces) while keeping the integration's `components` dir on disk under
// node_modules so its `.doc.mjs` files load normally.
const projectLoadMock = vi.fn();
vi.mock('../../../foundation/config/project.mjs', () => ({
  Project: {load: (...args) => projectLoadMock(...args)},
}));

import {
  ComponentCatalog,
  discoverIntegrationComponentContributions,
} from '../../../foundation/discovery/component-catalog.mjs';

// Import the api AFTER the mock is registered.
const {component} = await import('../../../api/component/component.mjs');
const {search} = await import('../../../api/search/search.mjs');
const {runCli} = await import('../../../test-utils/run-cli.mjs');

// These are real-filesystem integration tests: each `component()` call scans
// the entire core library (recursive readdir + hundreds of existsSync probes).
// Under saturated parallel CI workers that I/O gets starved and can exceed the
// 5s default, surfacing as a spurious timeout. Size the budget to the work, as
// detail-levels.test.mjs already does for its discovery beforeAll.
vi.setConfig({testTimeout: 30_000, hookTimeout: 30_000});

let tmpDir;

const INTEGRATION_NAME = '@test/meta';
const INTEGRATION_ISSUES = 'https://example.com/meta/issues';

/**
 * Build a consumer fixture:
 * - packages/core symlinked to the real @astryxdesign/core (loadDocs source)
 * - node_modules/@test/meta with a `components` dir using the same-stem
 *   source/doc convention (MetaAppShell.tsx + MetaAppShell.doc.mjs)
 * Returns the absolute `components` dir so the Project.load mock can hand back a
 * resolved integration entry.
 */
function createFixture({
  withSource = true,
  extraComponent = null,
  packageExports = null,
  entryPoint = null,
  replaces = null,
  componentName = 'MetaAppShell',
} = {}) {
  const realCoreDir = path.resolve(import.meta.dirname, '..', '..', '..', '..', 'core');
  const coreDir = path.join(tmpDir, 'packages', 'core');
  fs.mkdirSync(path.dirname(coreDir), {recursive: true});
  fs.symlinkSync(realCoreDir, coreDir);

  const intDir = path.join(tmpDir, 'node_modules', '@test', 'meta');
  const compDir = path.join(intDir, 'components');
  fs.mkdirSync(compDir, {recursive: true});
  fs.writeFileSync(
    path.join(intDir, 'package.json'),
    JSON.stringify({
      name: INTEGRATION_NAME,
      version: '1.2.3',
      ...(packageExports ? {exports: packageExports} : {}),
    }),
  );
  const replacement = replaces == null ? '' : `\n  replaces: '${replaces}',`;
  fs.writeFileSync(
    path.join(compDir, `${componentName}.doc.mjs`),
    `export const docs = {\n  name: '${componentName}',\n  displayName: '${componentName}',${replacement}\n  usage: { description: 'Meta-flavored component.' },\n  props: [{ name: 'title', type: 'string', description: 'Header title' }],\n};\n`,
  );
  if (withSource) {
    fs.writeFileSync(
      path.join(compDir, `${componentName}.tsx`),
      `'use client';\nexport function ${componentName}() { return null; }\n`,
    );
  }
  if (extraComponent) {
    fs.writeFileSync(
      path.join(compDir, `${extraComponent}.doc.mjs`),
      `export const docs = {\n  name: '${extraComponent}',\n  usage: { description: '${extraComponent} from meta.' },\n  props: [],\n};\n`,
    );
    fs.writeFileSync(
      path.join(compDir, `${extraComponent}.tsx`),
      `export function ${extraComponent}() { return null; }\n`,
    );
  }

  // A component whose directory is an entry point exporting several
  // components, so the directory name and the component name differ.
  if (entryPoint) {
    const entryDir = path.join(compDir, entryPoint.directory);
    fs.mkdirSync(entryDir, {recursive: true});
    const ownSpecifier = entryPoint.importSpec
      ? `\n  import: '${entryPoint.importSpec}',`
      : '';
    fs.writeFileSync(
      path.join(entryDir, `${entryPoint.component}.doc.mjs`),
      `export const docs = {\n  name: '${entryPoint.component}',${ownSpecifier}\n  usage: { description: '${entryPoint.component} from an entry point.' },\n  props: [],\n};\n`,
    );
  }

  const integration = {
    name: INTEGRATION_NAME,
    version: '1.2.3',
    components: compDir,
    templates: undefined,
    codemods: undefined,
    issuesUrl: INTEGRATION_ISSUES,
    __packageDir: intDir,
  };
  projectLoadMock.mockResolvedValue({
    integrations: [INTEGRATION_NAME],
    loadedIntegrations: [integration],
    async componentCatalog() {
      const catalog = ComponentCatalog.fromCore(coreDir);
      const {records, errors} =
        await discoverIntegrationComponentContributions(integration);
      if (errors.length === 0) await catalog.addIntegration(records);
      return catalog;
    },
    async components() {
      return (await this.componentCatalog()).entries();
    },
  });
  return {coreDir, intDir, compDir, integration};
}

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-ownership-'));
  projectLoadMock.mockReset();
  // Default: no integrations (core only).
  const realCoreDir = path.resolve(
    import.meta.dirname,
    '..',
    '..',
    '..',
    '..',
    'core',
  );
  projectLoadMock.mockResolvedValue({
    integrations: [],
    loadedIntegrations: [],
    componentCatalog: async () => ComponentCatalog.fromCore(realCoreDir),
    async components() {
      return (await this.componentCatalog()).entries();
    },
  });
});

afterEach(() => {
  fs.rmSync(tmpDir, {recursive: true, force: true});
});

describe('discoverIntegrationComponents (ownership records)', () => {
  it('records name, package, sourcePath, and issuesUrl for same-stem components', () => {
    const {integration, compDir} = createFixture();
    const records = discoverIntegrationComponents(integration);
    expect(records).toHaveLength(1);
    const rec = records[0];
    expect(rec.name).toBe('MetaAppShell');
    expect(rec.package).toBe(INTEGRATION_NAME);
    expect(rec.issuesUrl).toBe(INTEGRATION_ISSUES);
    expect(rec.sourcePath).toBe(path.join(compDir, 'MetaAppShell.tsx'));
    expect(fs.existsSync(rec.sourcePath)).toBe(true);
  });

  it('records sourcePath: null when the integration ships docs without source', () => {
    const {integration} = createFixture({withSource: false});
    const [rec] = discoverIntegrationComponents(integration);
    expect(rec.sourcePath).toBeNull();
  });
});

describe('discoverOwnedComponents (core + integrations)', () => {
  it('marks core components with the core package and integration components with their owner', () => {
    const {coreDir, integration} = createFixture();
    const records = discoverOwnedComponents(coreDir, [integration]);
    const core = records.find(r => r.package === CORE_PACKAGE);
    expect(core).toBeTruthy();
    expect(core.issuesUrl).toBeUndefined();
    const meta = records.find(r => r.name === 'MetaAppShell');
    expect(meta.package).toBe(INTEGRATION_NAME);
    expect(meta.issuesUrl).toBe(INTEGRATION_ISSUES);
    expect(meta.sourcePath).toContain('MetaAppShell.tsx');
  });
});

describe('findIntegrationComponentDoc / Source', () => {
  it('finds doc + source by name', () => {
    const {integration} = createFixture();
    expect(findIntegrationComponentDoc(integration, 'MetaAppShell')).toContain('MetaAppShell.doc.mjs');
    expect(findIntegrationComponentSource(integration, 'MetaAppShell')).toContain('MetaAppShell.tsx');
  });

  it('returns null source when none present', () => {
    const {integration} = createFixture({withSource: false});
    expect(findIntegrationComponentSource(integration, 'MetaAppShell')).toBeNull();
  });
});

describe('component() — integration ownership via config', () => {
  it('discovers a config integration component by package ownership (detail)', async () => {
    createFixture();
    const result = await component('MetaAppShell', {cwd: tmpDir});
    expect(result.type).toBe('component.detail');
    expect(result.data.name).toBe('MetaAppShell');
    expect(result.data.package).toBe(INTEGRATION_NAME);
    expect(result.data.sourceAvailable).toBe(true);
    // This fixture declares no `exports`, so there is no subpath to import
    // from and the specifier is the package root.
    expect(result.data.import).toBe(INTEGRATION_NAME);
  });

  it('keeps a docs-only integration component available for detail', async () => {
    createFixture({withSource: false});
    const result = await component('MetaAppShell', {
      cwd: tmpDir,
      package: INTEGRATION_NAME,
    });
    expect(result.data).toMatchObject({
      name: 'MetaAppShell',
      package: INTEGRATION_NAME,
      sourceAvailable: false,
    });
  });

  it('keeps a permissive legacy component doc readable', async () => {
    const {compDir} = createFixture();
    fs.writeFileSync(
      path.join(compDir, 'MetaAppShell.doc.mjs'),
      "export const docs = {name: 'MetaAppShell'};\n",
    );

    const result = await component('MetaAppShell', {cwd: tmpDir});

    expect(result.type).toBe('component.detail');
    expect(result.data).toMatchObject({name: 'MetaAppShell', package: INTEGRATION_NAME});
  });

  it('uses a declared integration replacement for unqualified selection', async () => {
    createFixture({replaces: 'AppShell'});
    const result = await component('AppShell', {cwd: tmpDir});
    expect(result.type).toBe('component.detail');
    expect(result.data.name).toBe('MetaAppShell');
    expect(result.data.package).toBe(INTEGRATION_NAME);
    expect(result.data.replaces).toBe('AppShell');
  });

  it('keeps the replaced Core component available through --package', async () => {
    createFixture({replaces: 'AppShell'});
    const result = await component('AppShell', {cwd: tmpDir, package: CORE_PACKAGE});
    expect(result.type).toBe('component.detail');
    expect(result.data.name).toBe('AppShell');
    expect(result.data.package).toBe(CORE_PACKAGE);
  });

  it('package scope prefers a native same-name component over a replacement alias', async () => {
    createFixture({replaces: 'SideNav', extraComponent: 'SideNav'});

    const native = await component('SideNav', {
      cwd: tmpDir,
      package: INTEGRATION_NAME,
    });
    expect(native.data.name).toBe('SideNav');

    const replacement = await component('MetaAppShell', {
      cwd: tmpDir,
      package: INTEGRATION_NAME,
    });
    expect(replacement.data.name).toBe('MetaAppShell');
  });

  it('keeps the replacement available through its own component name', async () => {
    createFixture({replaces: 'AppShell'});
    const result = await component('MetaAppShell', {cwd: tmpDir});
    expect(result.type).toBe('component.detail');
    expect(result.data.name).toBe('MetaAppShell');
    expect(result.data.package).toBe(INTEGRATION_NAME);
  });

  it('renders the selected integration import in human CLI output', async () => {
    createFixture({replaces: 'AppShell'});

    const result = await runCli(['component', 'AppShell'], tmpDir);

    expect(result.code).toBe(0);
    expect(result.stdout).toContain("from '@test/meta'");
    expect(result.stdout).not.toContain("from '@astryxdesign/core/AppShell'");
  });

  it('routes --blocks through the selected replacement identity', async () => {
    createFixture({replaces: 'AppShell'});

    const result = await component('AppShell', {cwd: tmpDir, blocks: true});

    expect(result.type).toBe('component.detail.blocks');
    expect(result.data.component).toBe('MetaAppShell');
  });

  it('--package resolves the integration component', async () => {
    createFixture();
    const result = await component('MetaAppShell', {cwd: tmpDir, package: INTEGRATION_NAME});
    expect(result.type).toBe('component.detail');
    expect(result.data.package).toBe(INTEGRATION_NAME);
  });

  it('--source returns the integration source when available', async () => {
    createFixture();
    const result = await component('MetaAppShell', {cwd: tmpDir, source: true});
    expect(result.type).toBe('component.detail.source');
    expect(result.data.component).toBe('MetaAppShell');
    expect(result.data.source).toContain('MetaAppShell');
  });

  it('--source throws ERR_NO_SOURCE when the integration ships no source', async () => {
    createFixture({withSource: false});
    await expect(
      component('MetaAppShell', {cwd: tmpDir, source: true}),
    ).rejects.toMatchObject({code: 'ERR_NO_SOURCE'});
  });

  it('errors with candidate packages when a name is ambiguous (core + integration)', async () => {
    // 'AppShell' exists in core; add a same-named integration component.
    createFixture({extraComponent: 'AppShell'});
    let caught;
    try {
      await component('AppShell', {cwd: tmpDir});
    } catch (e) {
      caught = e;
    }
    expect(caught).toBeTruthy();
    expect(caught.code).toBe('ERR_UNKNOWN_COMPONENT');
    const pkgs = (caught.suggestions ?? []).map(s => s.name);
    expect(pkgs).toContain(CORE_PACKAGE);
    expect(pkgs).toContain(INTEGRATION_NAME);
  });

  it.each(['Heading', 'Code'])(
    'keeps Core-documented %s ambiguous without an explicit replacement',
    async componentName => {
      createFixture({componentName});

      await expect(
        component(componentName, {cwd: tmpDir}),
      ).rejects.toMatchObject({
        code: 'ERR_UNKNOWN_COMPONENT',
        suggestions: expect.arrayContaining([
          expect.objectContaining({name: CORE_PACKAGE}),
          expect.objectContaining({name: INTEGRATION_NAME}),
        ]),
      });

      const listed = await component(undefined, {cwd: tmpDir, list: true});
      const matches = Object.values(listed.data.components)
        .flat()
        .filter(entry => entry.name === componentName);
      expect(matches).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: componentName,
            package: INTEGRATION_NAME,
          }),
        ]),
      );
      expect(matches.every(entry => entry.replaces == null)).toBe(true);
    },
  );

  it('--package disambiguates an ambiguous name to core', async () => {
    createFixture({extraComponent: 'AppShell'});
    const result = await component('AppShell', {cwd: tmpDir, package: CORE_PACKAGE});
    expect(result.type).toBe('component.detail');
    expect(result.data.package).toBe(CORE_PACKAGE);
  });

  it('--package disambiguates an ambiguous name to the integration', async () => {
    createFixture({extraComponent: 'AppShell'});
    const result = await component('AppShell', {cwd: tmpDir, package: INTEGRATION_NAME});
    expect(result.type).toBe('component.detail');
    expect(result.data.package).toBe(INTEGRATION_NAME);
  });

  it('resolves the import specifier against the package exports map', async () => {
    // The doc sits in a `Toolbar` directory but the component is
    // `ToolbarSearch`, so a specifier built from the component name would
    // point at a subpath the package does not export.
    createFixture({
      packageExports: {'.': './index.js', './Toolbar': './components/Toolbar/index.js'},
      entryPoint: {directory: 'Toolbar', component: 'ToolbarSearch'},
    });
    const result = await component('ToolbarSearch', {cwd: tmpDir});
    expect(result.data.import).toBe(`${INTEGRATION_NAME}/Toolbar`);
  });

  it('falls back to the package root when the directory is not an exported subpath', async () => {
    createFixture({
      packageExports: {'.': './index.js'},
      entryPoint: {directory: 'Toolbar', component: 'ToolbarSearch'},
    });
    const result = await component('ToolbarSearch', {cwd: tmpDir});
    expect(result.data.import).toBe(INTEGRATION_NAME);
  });

  it('keeps a specifier the doc file states for itself', async () => {
    createFixture({
      packageExports: {'.': './index.js', './Toolbar': './components/Toolbar/index.js'},
      entryPoint: {
        directory: 'Toolbar',
        component: 'ToolbarSearch',
        importSpec: `${INTEGRATION_NAME}/Toolbar/Search`,
      },
    });
    const result = await component('ToolbarSearch', {cwd: tmpDir});
    expect(result.data.import).toBe(`${INTEGRATION_NAME}/Toolbar/Search`);
  });

  it('lists and searches an active replacement of a documented Core subcomponent', async () => {
    createFixture({componentName: 'AcmeHeading', replaces: 'Heading'});

    const listed = await component(undefined, {cwd: tmpDir, list: true});
    const entries = Object.values(listed.data.components).flat();
    expect(entries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'AcmeHeading',
          package: INTEGRATION_NAME,
          replaces: 'Heading',
        }),
      ]),
    );

    const found = await search('Heading', {
      cwd: tmpDir,
      type: 'component',
      limit: 1,
    });
    expect(found.data.results[0]).toMatchObject({
      name: 'AcmeHeading',
      score: 100,
    });
  });

  it('lists a replacement in the Core target slot instead of listing both', async () => {
    createFixture({replaces: 'AppShell'});
    const result = await component(undefined, {cwd: tmpDir, list: true});
    const allEntries = Object.values(result.data.components).flat();
    expect(allEntries.filter(entry => ['AppShell', 'MetaAppShell'].includes(entry.name))).toEqual([
      expect.objectContaining({
        name: 'MetaAppShell',
        package: INTEGRATION_NAME,
        replaces: 'AppShell',
      }),
    ]);
  });

  it('keeps one Core owner when a replacement name collides with another Core identity', async () => {
    createFixture({componentName: 'Button', replaces: 'AppShell'});
    const result = await component(undefined, {cwd: tmpDir, list: true});
    const allEntries = Object.values(result.data.components).flat();

    expect(allEntries.filter(entry => entry.name === 'Button')).toEqual([
      expect.objectContaining({package: CORE_PACKAGE}),
    ]);
    expect(allEntries.find(entry => entry.name === 'AppShell')).toMatchObject({
      package: CORE_PACKAGE,
    });
  });

  it('uses replacements consistently in compact and full lists', async () => {
    createFixture({replaces: 'AppShell'});

    const compact = await component(undefined, {cwd: tmpDir, list: true, detail: 'compact'});
    const compactEntries = Object.values(compact.data.components).flat();
    expect(compactEntries.find(entry => entry.name === 'MetaAppShell')).toMatchObject({
      import: INTEGRATION_NAME,
    });
    expect(compactEntries.some(entry => entry.name === 'AppShell')).toBe(false);

    const full = await component(undefined, {cwd: tmpDir, list: true, detail: 'full'});
    const fullEntries = Object.values(full.data.components).flat();
    expect(fullEntries).toEqual(expect.arrayContaining([
      expect.objectContaining({name: 'MetaAppShell', replaces: 'AppShell'}),
    ]));
    expect(fullEntries.some(entry => entry.name === 'AppShell')).toBe(false);
  });

  it('normalizes permissive legacy docs in full-list responses', async () => {
    createFixture({
      entryPoint: {
        directory: 'Toolbar',
        component: 'ToolbarSearch',
        importSpec: `${INTEGRATION_NAME}/Toolbar/Search`,
      },
    });

    const result = await component(undefined, {
      cwd: tmpDir,
      list: true,
      detail: 'full',
    });
    const entry = Object.values(result.data.components)
      .flat()
      .find(item => item.name === 'ToolbarSearch');

    expect(entry).toMatchObject({
      name: 'ToolbarSearch',
      displayName: 'ToolbarSearch',
      usage: {description: 'ToolbarSearch from an entry point.'},
      props: [],
      package: INTEGRATION_NAME,
    });
  });

  it('renders bare references and hook entries in integration multi-docs', async () => {
    const {compDir} = createFixture({
      componentName: 'BareBundle',
      extraComponent: 'useBundle',
    });
    fs.writeFileSync(
      path.join(compDir, 'BareBundle.doc.mjs'),
      "export const docs = {name: 'BareBundle', displayName: 'Bare Bundle', usage: {description: 'Bundle.'}, components: [{name: 'BareBundle'}]};\n",
    );
    fs.writeFileSync(
      path.join(compDir, 'useBundle.doc.mjs'),
      "export const docs = {name: 'useBundle', displayName: 'useBundle', usage: {description: 'Hook bundle.'}, components: [{name: 'useBundle', displayName: 'useBundle', description: 'Hook.', params: [], returns: []}]};\n",
    );

    const result = await runCli(
      ['component', '--list', '--detail', 'full'],
      tmpDir,
    );

    expect(result.code).toBe(0);
    expect(result.stdout).toContain('BareBundle');
    expect(result.stdout).toContain('useBundle');
  });

  it('renders replacement ownership in full human list output', async () => {
    createFixture({replaces: 'AppShell'});

    const result = await runCli(['component', '--list', '--detail', 'full'], tmpDir);

    expect(result.code).toBe(0);
    expect(result.stdout).toContain('MetaAppShell');
    expect(result.stdout).toContain("from '@test/meta'");
  });

  it('JSON list includes integration components as {name, package} objects', async () => {
    createFixture();
    const result = await component(undefined, {cwd: tmpDir, list: true});
    expect(result.type).toBe('component.list');
    expect(result.data.detail).toBe('names');
    const allEntries = Object.values(result.data.components).flat();
    for (const entry of allEntries) {
      expect(typeof entry.name).toBe('string');
      expect(typeof entry.package).toBe('string');
    }
    const meta = allEntries.find(e => e.name === 'MetaAppShell');
    expect(meta).toBeTruthy();
    expect(meta.package).toBe(INTEGRATION_NAME);
    expect(allEntries.some(e => e.package === CORE_PACKAGE)).toBe(true);
  });
});
