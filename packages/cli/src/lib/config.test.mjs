// Copyright (c) Meta Platforms, Inc. and affiliates.

import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {loadConfig, findConfigPath} from './config.mjs';

let tmpDir;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(process.cwd(), '.astryx-config-test-'));
});

afterEach(() => {
  fs.rmSync(tmpDir, {recursive: true, force: true});
});

function makeRoot(name) {
  const dir = path.join(tmpDir, name);
  fs.mkdirSync(dir, {recursive: true});
  fs.writeFileSync(
    path.join(dir, 'package.json'),
    JSON.stringify({name: `consumer-${name}`}),
  );
  return dir;
}

function installIntegrationPackage(dir, name = '@nest/xds-meta') {
  const packageDir = path.join(dir, 'node_modules', ...name.split('/'));
  fs.mkdirSync(packageDir, {recursive: true});
  fs.writeFileSync(
    path.join(packageDir, 'package.json'),
    JSON.stringify({name, version: '0.0.1'}),
  );
  fs.writeFileSync(
    path.join(packageDir, 'astryx.integration.mjs'),
    `export default { components: './src' };\n`,
  );
}

describe('loadConfig', () => {
  it('returns an empty config when no config file is present', async () => {
    const dir = makeRoot('empty');
    await expect(loadConfig(dir)).resolves.toEqual({
      integrations: [],
      loadedIntegrations: [],
    });
  });

  it('normalizes integrations from astryx.config.mjs', async () => {
    const dir = makeRoot('one');
    installIntegrationPackage(dir);
    fs.writeFileSync(
      path.join(dir, 'astryx.config.mjs'),
      `export default { integrations: ['@nest/xds-meta'] };\n`,
    );
    await expect(loadConfig(dir)).resolves.toMatchObject({
      integrations: ['@nest/xds-meta'],
    });
  });

  it('exposes issuesUrl and hooks from the config', async () => {
    const dir = makeRoot('full');
    fs.writeFileSync(
      path.join(dir, 'astryx.config.mjs'),
      `export default {
        issuesUrl: 'https://example.com/issues',
        hooks: { postCodemod: [{ name: 'fmt', buildCommand: () => null }] },
      };\n`,
    );
    const config = await loadConfig(dir);
    expect(config.issuesUrl).toBe('https://example.com/issues');
    expect(config.hooks.postCodemod).toHaveLength(1);
    expect(typeof config.hooks.postCodemod[0].buildCommand).toBe('function');
  });

  it('rejects invalid integration package manifests', async () => {
    const dir = makeRoot('bad');
    const packageDir = path.join(dir, 'node_modules', '@bad', 'widgets');
    fs.mkdirSync(packageDir, {recursive: true});
    fs.writeFileSync(
      path.join(dir, 'astryx.config.mjs'),
      `export default { integrations: ['@bad/widgets'] };\n`,
    );
    fs.writeFileSync(
      path.join(packageDir, 'package.json'),
      JSON.stringify({name: '@bad/widgets'}),
    );
    fs.writeFileSync(
      path.join(packageDir, 'astryx.integration.mjs'),
      `export default { unknownKey: true };\n`,
    );
    await expect(loadConfig(dir)).rejects.toThrow(/unknownKey/);
  });

  it('rejects invalid config shapes (strict)', async () => {
    const dir = makeRoot('invalid');
    fs.writeFileSync(
      path.join(dir, 'astryx.config.mjs'),
      `export default { integrations: [42] };\n`,
    );
    await expect(loadConfig(dir)).rejects.toThrow(/integrations/);
  });

  it('exposes experimental.xle.components from the config', async () => {
    const dir = makeRoot('experimental');
    fs.writeFileSync(
      path.join(dir, 'astryx.config.mjs'),
      `export default {
        experimental: {
          xle: {
            components: {
              KpiCard: { from: '@/components/KpiCard' },
              Chart: { from: '@/components/Chart', description: 'A chart', default: true },
            },
          },
        },
      };\n`,
    );
    const config = await loadConfig(dir);
    expect(config.experimental.xle.components.KpiCard).toEqual({
      from: '@/components/KpiCard',
    });
    expect(config.experimental.xle.components.Chart).toEqual({
      from: '@/components/Chart',
      description: 'A chart',
      default: true,
    });
  });

  it('rejects unknown keys under experimental (strict)', async () => {
    const dir = makeRoot('exp-strict');
    fs.writeFileSync(
      path.join(dir, 'astryx.config.mjs'),
      `export default { experimental: { bogus: true } };\n`,
    );
    await expect(loadConfig(dir)).rejects.toThrow(/bogus|Unrecognized/);
  });

  it('rejects unknown keys under experimental.xle (strict)', async () => {
    const dir = makeRoot('exp-xle-strict');
    fs.writeFileSync(
      path.join(dir, 'astryx.config.mjs'),
      `export default { experimental: { xle: { nope: 1 } } };\n`,
    );
    await expect(loadConfig(dir)).rejects.toThrow(/nope|Unrecognized/);
  });

  it('rejects a string shorthand for a component (object-only)', async () => {
    const dir = makeRoot('exp-string');
    fs.writeFileSync(
      path.join(dir, 'astryx.config.mjs'),
      `export default { experimental: { xle: { components: { Foo: './x' } } } };\n`,
    );
    await expect(loadConfig(dir)).rejects.toThrow(/components/);
  });

  it('rejects an unknown key under a component (strict)', async () => {
    const dir = makeRoot('exp-comp-strict');
    fs.writeFileSync(
      path.join(dir, 'astryx.config.mjs'),
      `export default { experimental: { xle: { components: { Foo: { from: './x', extra: 1 } } } } };\n`,
    );
    await expect(loadConfig(dir)).rejects.toThrow(/extra|Unrecognized/);
  });

  it('rejects multiple config files at the same root', async () => {
    const dir = makeRoot('dupe');
    fs.writeFileSync(path.join(dir, 'astryx.config.mjs'), `export default {};\n`);
    fs.writeFileSync(path.join(dir, 'astryx.config.js'), `module.exports = {};\n`);
    expect(() => findConfigPath(dir)).toThrow(/Multiple Astryx config files/);
  });
});
