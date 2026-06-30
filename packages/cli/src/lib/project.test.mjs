// Copyright (c) Meta Platforms, Inc. and affiliates.

import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {pathToFileURL} from 'node:url';
import {Project, DEFAULT_ISSUES_URL, findConfigPath} from './project.mjs';
import {InMemoryConfigCache} from './config-cache.mjs';
import * as componentDiscovery from './component-discovery.mjs';

let tmpDir;
let originalCwd;

const codemodModulePath = path.resolve(
  process.cwd(),
  'packages/cli/src/codemod.mjs',
);
const codemodModuleUrl = pathToFileURL(codemodModulePath).href;

/**
 * Scaffold a consumer project (package.json + astryx.config.mjs) under a
 * repo-local temp dir, plus an installed integration package under
 * node_modules. The repo-local location is required so Vite permits dynamic
 * import of the config/integration modules (it blocks /tmp).
 */
function scaffold({
  integrations = ['@acme/widgets'],
  issuesUrl,
  withComponents = true,
  withTemplates = true,
  withCodemods = true,
  brokenComponent = false,
  brokenCodemod = false,
  integrationIssuesUrl = 'https://example.com/widgets/issues',
} = {}) {
  fs.writeFileSync(
    path.join(tmpDir, 'package.json'),
    JSON.stringify({name: 'consumer'}),
  );
  const config = {integrations};
  if (issuesUrl) config.issuesUrl = issuesUrl;
  fs.writeFileSync(
    path.join(tmpDir, 'astryx.config.mjs'),
    `export default ${JSON.stringify(config)};\n`,
  );

  const pkgDir = path.join(tmpDir, 'node_modules', '@acme', 'widgets');
  fs.mkdirSync(pkgDir, {recursive: true});
  fs.writeFileSync(
    path.join(pkgDir, 'package.json'),
    JSON.stringify({name: '@acme/widgets', version: '1.0.0'}),
  );

  const manifest = {};
  if (withComponents) manifest.components = './components';
  if (withTemplates) manifest.templates = './templates';
  if (withCodemods) manifest.codemods = './codemods';
  if (integrationIssuesUrl) manifest.issuesUrl = integrationIssuesUrl;
  fs.writeFileSync(
    path.join(pkgDir, 'astryx.integration.mjs'),
    `export default ${JSON.stringify(manifest)};\n`,
  );

  if (withComponents) {
    const compDir = path.join(pkgDir, 'components');
    fs.mkdirSync(compDir, {recursive: true});
    fs.writeFileSync(
      path.join(compDir, 'Widget.doc.mjs'),
      `export const docs = { name: 'Widget', usage: {description: 'A widget'} };\n`,
    );
    if (!brokenComponent) {
      fs.writeFileSync(
        path.join(compDir, 'Widget.tsx'),
        `export function Widget() { return null; }\n`,
      );
    }
    // brokenComponent => doc with no sibling .tsx (invalid_component issue).
  }

  if (withTemplates) {
    const tDir = path.join(pkgDir, 'templates');
    fs.mkdirSync(tDir, {recursive: true});
    fs.writeFileSync(
      path.join(tDir, 'hero.doc.mjs'),
      `export default { type: 'block', name: 'Hero', description: 'A hero' };\n`,
    );
    fs.writeFileSync(
      path.join(tDir, 'hero.tsx'),
      `export default function Hero() { return null; }\n`,
    );
  }

  if (withCodemods) {
    const cmDir = path.join(pkgDir, 'codemods', '0.2.0');
    fs.mkdirSync(cmDir, {recursive: true});
    if (brokenCodemod) {
      fs.writeFileSync(
        path.join(cmDir, 'bad.mjs'),
        `export default { not: 'a codemod' };\n`,
      );
    } else {
      fs.writeFileSync(
        path.join(cmDir, 'drop-foo.mjs'),
        `import {createCodemod} from ${JSON.stringify(codemodModuleUrl)};\n` +
          `export default createCodemod({ title: 'Drop foo', transform: (file) => file.source });\n`,
      );
    }
  }

  return pkgDir;
}

beforeEach(() => {
  originalCwd = process.cwd();
  tmpDir = fs.mkdtempSync(path.join(process.cwd(), '.astryx-project-test-'));
  process.chdir(tmpDir);
});

afterEach(() => {
  process.chdir(originalCwd);
  fs.rmSync(tmpDir, {recursive: true, force: true});
  vi.restoreAllMocks();
});

describe('Project.load', () => {
  it('returns an empty config + no integrations when no config file exists', async () => {
    fs.writeFileSync(
      path.join(tmpDir, 'package.json'),
      JSON.stringify({name: 'consumer'}),
    );
    const project = await Project.load(tmpDir);
    expect(project.config).toEqual({integrations: []});
    expect(project.integrations).toEqual([]);
    expect(project.loadedIntegrations).toEqual([]);
    expect(project.cwd).toBe(tmpDir);
  });

  it('exposes the validated config surface and loaded integrations', async () => {
    scaffold({issuesUrl: 'https://example.com/issues'});
    const project = await Project.load(tmpDir);
    expect(project.config.issuesUrl).toBe('https://example.com/issues');
    expect(project.integrations).toEqual(['@acme/widgets']);
    expect(project.loadedIntegrations).toHaveLength(1);
    expect(project.loadedIntegrations[0].name).toBe('@acme/widgets');
  });

  it('rejects an invalid config shape (strict validation)', async () => {
    fs.writeFileSync(
      path.join(tmpDir, 'package.json'),
      JSON.stringify({name: 'consumer'}),
    );
    fs.writeFileSync(
      path.join(tmpDir, 'astryx.config.mjs'),
      `export default { integrations: [42] };\n`,
    );
    await expect(Project.load(tmpDir)).rejects.toThrow(/integrations/);
  });
});

describe('findConfigPath', () => {
  it('rejects multiple config files at the same root', () => {
    fs.writeFileSync(
      path.join(tmpDir, 'package.json'),
      JSON.stringify({name: 'consumer'}),
    );
    fs.writeFileSync(
      path.join(tmpDir, 'astryx.config.mjs'),
      `export default {};\n`,
    );
    fs.writeFileSync(
      path.join(tmpDir, 'astryx.config.js'),
      `module.exports = {};\n`,
    );
    expect(() => findConfigPath(tmpDir)).toThrow(/Multiple Astryx config files/);
  });
});

describe('Project discovery', () => {
  it('components() returns integration ownership records', async () => {
    scaffold();
    const project = await Project.load(tmpDir);
    const comps = await project.components();
    const widget = comps.find(
      c => c.name === 'Widget' && c.package === '@acme/widgets',
    );
    expect(widget).toBeTruthy();
    expect(widget.sourcePath).toMatch(/Widget\.tsx$/);
  });

  it('templates() returns integration templates type-tagged', async () => {
    scaffold();
    const project = await Project.load(tmpDir);
    const templates = await project.templates();
    const hero = templates.find(t => t.package === '@acme/widgets');
    expect(hero).toBeTruthy();
    expect(hero.type).toBe('block');
  });

  it('codemods() returns core registry groups + integration groups', async () => {
    scaffold();
    const project = await Project.load(tmpDir);
    const {core, integration} = await project.codemods('0.1.0', '0.2.0');
    expect(Array.isArray(core)).toBe(true);
    expect(integration).toHaveLength(1);
    expect(integration[0].version).toBe('0.2.0');
    expect(integration[0].codemods[0].id).toBe('drop-foo');
  });

  it('memoizes components() — the second call does not re-walk', async () => {
    scaffold();
    const project = await Project.load(tmpDir);
    const spy = vi.spyOn(componentDiscovery, 'discoverIntegrationComponents');
    const first = await project.components();
    const callsAfterFirst = spy.mock.calls.length;
    const second = await project.components();
    // Same identity (cached value) and no additional discovery walk.
    expect(second).toBe(first);
    expect(spy.mock.calls.length).toBe(callsAfterFirst);
  });
});

describe('Project issues (skip + warn)', () => {
  it('collects issues for a broken integration and skips its contributions', async () => {
    scaffold({brokenComponent: true});
    const project = await Project.load(tmpDir);
    const comps = await project.components();
    // Widget is skipped because its source is missing.
    expect(comps.find(c => c.package === '@acme/widgets')).toBeUndefined();
    const issues = await project.issues();
    expect(issues.length).toBeGreaterThan(0);
    expect(issues.some(i => i.package === '@acme/widgets')).toBe(true);
  });

  it('does not throw when an integration codemod is broken', async () => {
    scaffold({brokenCodemod: true});
    const project = await Project.load(tmpDir);
    const {integration} = await project.codemods('0.1.0', '0.2.0');
    // Broken integration is skipped, not thrown.
    expect(integration).toHaveLength(0);
    const issues = await project.issues();
    expect(issues.some(i => i.code === 'invalid_codemod')).toBe(true);
  });

  it('issues() dedupes and is complete on demand', async () => {
    scaffold({brokenComponent: true});
    const project = await Project.load(tmpDir);
    // Call a discovery method first (collects some), then issues().
    await project.components();
    const a = await project.issues();
    const b = await project.issues();
    expect(a).toEqual(b);
    // No duplicate (package, code, message) tuples.
    const seen = new Set(a.map(i => `${i.package}\u0000${i.code}\u0000${i.message}`));
    expect(seen.size).toBe(a.length);
  });

  it('issues() validates integrations not yet visited by a discovery call', async () => {
    scaffold({brokenComponent: true});
    const project = await Project.load(tmpDir);
    // No discovery call at all — issues() must still surface the broken one.
    const issues = await project.issues();
    expect(issues.some(i => i.package === '@acme/widgets')).toBe(true);
  });
});

describe('Project.issuesUrl routing', () => {
  it('routes core to config.issuesUrl, falling back to the default', async () => {
    scaffold({issuesUrl: 'https://example.com/core'});
    const project = await Project.load(tmpDir);
    expect(project.issuesUrl()).toBe('https://example.com/core');
    expect(project.issuesUrl({package: '@astryxdesign/core'})).toBe(
      'https://example.com/core',
    );
  });

  it('falls back to the default core URL when config has none', async () => {
    scaffold();
    const project = await Project.load(tmpDir);
    expect(project.issuesUrl()).toBe(DEFAULT_ISSUES_URL);
  });

  it('routes an integration package to its manifest issuesUrl', async () => {
    scaffold({integrationIssuesUrl: 'https://example.com/widgets/issues'});
    const project = await Project.load(tmpDir);
    expect(project.issuesUrl({package: '@acme/widgets'})).toBe(
      'https://example.com/widgets/issues',
    );
  });

  it('returns undefined for an integration that ships no issuesUrl', async () => {
    scaffold({integrationIssuesUrl: null});
    const project = await Project.load(tmpDir);
    expect(project.issuesUrl({package: '@acme/widgets'})).toBeUndefined();
  });
});

describe('Project caching', () => {
  it('reuses a shared cache across instances for the same config bytes', async () => {
    scaffold();
    const cache = new InMemoryConfigCache();
    const p1 = await Project.load(tmpDir, {cache});
    const comps1 = await p1.components();
    const p2 = await Project.load(tmpDir, {cache});
    const comps2 = await p2.components();
    // Same cached value across Project instances (same key path).
    expect(comps2).toBe(comps1);
  });
});
