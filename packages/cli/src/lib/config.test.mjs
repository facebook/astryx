// Copyright (c) Meta Platforms, Inc. and affiliates.

import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {loadConfig} from './config.mjs';

let tmpDir;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(process.cwd(), '.astryx-config-test-'));
});

afterEach(() => {
  fs.rmSync(tmpDir, {recursive: true, force: true});
});

function installIntegrationPackage(dir, name = '@nest/xds-meta') {
  const packageDir = path.join(dir, 'node_modules', ...name.split('/'));
  fs.mkdirSync(packageDir, {recursive: true});
  fs.writeFileSync(
    path.join(packageDir, 'package.json'),
    JSON.stringify({name, astryx: {integration: './astryx.integration.mjs'}}),
  );
  fs.writeFileSync(
    path.join(packageDir, 'astryx.integration.mjs'),
    `export default { name: '${name}' };
`,
  );
}

describe('loadConfig', () => {
  it('normalizes integrations from astryx.config.mjs', async () => {
    const dir = path.join(tmpDir, 'one');
    fs.mkdirSync(dir);
    installIntegrationPackage(dir);
    fs.writeFileSync(
      path.join(dir, 'astryx.config.mjs'),
      `export default { integrations: '@nest/xds-meta' };\n`,
    );
    await expect(loadConfig(dir)).resolves.toMatchObject({
      integrations: ['@nest/xds-meta'],
    });
  });

  it('rejects invalid integration package manifests', async () => {
    const dir = path.join(tmpDir, 'bad');
    fs.mkdirSync(dir);
    const packageDir = path.join(dir, 'node_modules', '@bad', 'widgets');
    fs.mkdirSync(packageDir, {recursive: true});
    fs.writeFileSync(
      path.join(dir, 'astryx.config.mjs'),
      `export default { integrations: '@bad/widgets' };\n`,
    );
    fs.writeFileSync(
      path.join(packageDir, 'package.json'),
      JSON.stringify({
        name: '@bad/widgets',
        astryx: {integration: './astryx.integration.mjs'},
      }),
    );
    fs.writeFileSync(
      path.join(packageDir, 'astryx.integration.mjs'),
      `export default { docs: './docs' };\n`,
    );
    await expect(loadConfig(dir)).rejects.toThrow(/name/);
  });

  it('normalizes integration arrays', async () => {
    const dir = path.join(tmpDir, 'two');
    fs.mkdirSync(dir);
    installIntegrationPackage(dir);
    fs.writeFileSync(
      path.join(dir, 'astryx.config.mjs'),
      `export default { integrations: ['@nest/xds-meta', ''] };\n`,
    );
    await expect(loadConfig(dir)).resolves.toMatchObject({
      integrations: ['@nest/xds-meta'],
    });
  });

  it('rejects invalid config shapes', async () => {
    const dir = path.join(tmpDir, 'invalid');
    fs.mkdirSync(dir);
    fs.writeFileSync(
      path.join(dir, 'astryx.config.mjs'),
      `export default { integrations: [42] };\n`,
    );
    await expect(loadConfig(dir)).rejects.toThrow(/integrations/);
  });
});
