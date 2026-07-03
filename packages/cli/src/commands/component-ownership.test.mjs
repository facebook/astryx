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
} from '../lib/component-discovery.mjs';

// The api `component()` reads integrations via Project.load(). In the vitest
// environment, Vite's `server.fs.allow` only permits loading modules from
// under `node_modules`, so a real astryx.config.mjs at a tmp root cannot be
// imported. We therefore mock Project.load to return a project whose
// `loadedIntegrations` are resolved (exactly the shape lib/integrations.mjs
// produces) while keeping the integration's `components` dir on disk under
// node_modules so its `.doc.mjs` files load normally.
const projectLoadMock = vi.fn();
vi.mock('../lib/project.mjs', () => ({
  Project: {load: (...args) => projectLoadMock(...args)},
}));

// Import the api AFTER the mock is registered.
const {component} = await import('../api/component.mjs');

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
function createFixture({withSource = true, extraComponent = null} = {}) {
  const realCoreDir = path.resolve(import.meta.dirname, '..', '..', '..', 'core');
  const coreDir = path.join(tmpDir, 'packages', 'core');
  fs.mkdirSync(path.dirname(coreDir), {recursive: true});
  fs.symlinkSync(realCoreDir, coreDir);

  const intDir = path.join(tmpDir, 'node_modules', '@test', 'meta');
  const compDir = path.join(intDir, 'components');
  fs.mkdirSync(compDir, {recursive: true});
  fs.writeFileSync(
    path.join(intDir, 'package.json'),
    JSON.stringify({name: INTEGRATION_NAME, version: '1.2.3'}),
  );
  fs.writeFileSync(
    path.join(compDir, 'MetaAppShell.doc.mjs'),
    `export const docs = {\n  name: 'MetaAppShell',\n  usage: { description: 'Meta-flavored app shell.' },\n  props: [{ name: 'title', type: 'string', description: 'Header title' }],\n};\n`,
  );
  if (withSource) {
    fs.writeFileSync(
      path.join(compDir, 'MetaAppShell.tsx'),
      "'use client';\nexport function MetaAppShell() { return null; }\n",
    );
  }
  if (extraComponent) {
    fs.writeFileSync(
      path.join(compDir, `${extraComponent}.doc.mjs`),
      `export const docs = {\n  name: '${extraComponent}',\n  usage: { description: '${extraComponent} from meta.' },\n};\n`,
    );
    fs.writeFileSync(
      path.join(compDir, `${extraComponent}.tsx`),
      `export function ${extraComponent}() { return null; }\n`,
    );
  }

  const integration = {
    name: INTEGRATION_NAME,
    version: '1.2.3',
    components: compDir,
    templates: undefined,
    codemods: undefined,
    issuesUrl: INTEGRATION_ISSUES,
  };
  projectLoadMock.mockResolvedValue({
    integrations: [INTEGRATION_NAME],
    loadedIntegrations: [integration],
  });
  return {coreDir, intDir, compDir, integration};
}

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-ownership-'));
  projectLoadMock.mockReset();
  // Default: no integrations (core only).
  projectLoadMock.mockResolvedValue({integrations: [], loadedIntegrations: []});
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
    expect(result.data.import).toBe(`${INTEGRATION_NAME}/MetaAppShell`);
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

  it('JSON list includes integration components as {name, package} objects', async () => {
    createFixture();
    const result = await component(undefined, {cwd: tmpDir, list: true});
    expect(result.type).toBe('component.list');
    const allEntries = Object.values(result.data).flat();
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
