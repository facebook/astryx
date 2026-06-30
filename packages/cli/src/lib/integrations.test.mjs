// Copyright (c) Meta Platforms, Inc. and affiliates.

import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {Project} from './project.mjs';
import {loadIntegrations} from './integrations.mjs';
import {discover} from '../api/discover.mjs';

let tmpDir;
let originalCwd;

function writeManifestPackage(dir, {basename = 'astryx.integration.mjs', body}) {
  const pkgDir = path.join(dir, 'node_modules', '@acme', 'widgets');
  fs.mkdirSync(pkgDir, {recursive: true});
  fs.writeFileSync(
    path.join(pkgDir, 'package.json'),
    JSON.stringify({
      name: '@acme/widgets',
      version: '1.2.3',
    }),
  );
  fs.writeFileSync(path.join(pkgDir, basename), body);
  return pkgDir;
}

beforeEach(() => {
  originalCwd = process.cwd();
  tmpDir = fs.mkdtempSync(
    path.join(process.cwd(), '.astryx-integration-test-'),
  );
  fs.writeFileSync(
    path.join(tmpDir, 'package.json'),
    JSON.stringify({name: 'consumer'}),
  );
  fs.writeFileSync(
    path.join(tmpDir, 'astryx.config.mjs'),
    `export default { integrations: ['@acme/widgets'] };\n`,
  );
  process.chdir(tmpDir);
});

afterEach(() => {
  process.chdir(originalCwd);
  fs.rmSync(tmpDir, {recursive: true, force: true});
});

describe('configured integrations', () => {
  it('resolves identity from package.json and contribution roots to absolute paths', async () => {
    const pkgDir = writeManifestPackage(tmpDir, {
      body: `export default {
        components: './docs',
        templates: './blocks',
        codemods: './codemods',
        issuesUrl: 'https://example.com/issues',
      };\n`,
    });
    fs.mkdirSync(path.join(pkgDir, 'docs'));
    fs.writeFileSync(
      path.join(pkgDir, 'docs', 'Widget.doc.mjs'),
      `export const doc = {
        name: 'Widget',
        usage: {description: 'Acme widget'},
        props: [],
      };\n`,
    );

    const project = await Project.load(tmpDir);
    expect(project.integrations).toEqual(['@acme/widgets']);
    const loaded = project.loadedIntegrations[0];
    // Identity comes from package.json, not the manifest.
    expect(loaded.name).toBe('@acme/widgets');
    expect(loaded.version).toBe('1.2.3');
    expect(loaded.components).toBe(path.join(pkgDir, 'docs'));
    expect(loaded.templates).toBe(path.join(pkgDir, 'blocks'));
    expect(loaded.codemods).toBe(path.join(pkgDir, 'codemods'));
    expect(loaded.issuesUrl).toBe('https://example.com/issues');
  });

  it('makes integration components discoverable', async () => {
    const pkgDir = writeManifestPackage(tmpDir, {
      body: `export default { components: './docs' };\n`,
    });
    fs.mkdirSync(path.join(pkgDir, 'docs'));
    fs.writeFileSync(
      path.join(pkgDir, 'docs', 'Widget.doc.mjs'),
      `export const doc = {
        name: 'Widget',
        usage: {description: 'Acme widget'},
        props: [],
      };\n`,
    );

    const result = await discover(undefined, {});
    expect(result.type).toBe('discover.list');
    expect(result.data).toEqual([
      expect.objectContaining({
        name: '@acme/widgets',
        category: '@acme/widgets',
        components: ['Widget'],
      }),
    ]);
  });

  it('errors when the package has no conventional root manifest', async () => {
    const pkgDir = path.join(tmpDir, 'node_modules', '@acme', 'widgets');
    fs.mkdirSync(pkgDir, {recursive: true});
    fs.writeFileSync(
      path.join(pkgDir, 'package.json'),
      JSON.stringify({name: '@acme/widgets'}),
    );
    await expect(loadIntegrations(['@acme/widgets'], {cwd: tmpDir})).rejects.toThrow(
      /no conventional root manifest/,
    );
  });

  it('errors when the package has multiple root manifests', async () => {
    const pkgDir = writeManifestPackage(tmpDir, {
      body: `export default {};\n`,
    });
    fs.writeFileSync(
      path.join(pkgDir, 'astryx.integration.js'),
      `module.exports = {};\n`,
    );
    await expect(loadIntegrations(['@acme/widgets'], {cwd: tmpDir})).rejects.toThrow(
      /multiple root manifests/,
    );
  });

  it('errors when the package is not installed', async () => {
    await expect(loadIntegrations(['@acme/missing'], {cwd: tmpDir})).rejects.toThrow(
      /Could not find installed integration package/,
    );
  });
});
