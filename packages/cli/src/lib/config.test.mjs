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

describe('loadConfig', () => {
  it('normalizes integrations from astryx.config.mjs', async () => {
    const dir = path.join(tmpDir, 'one');
    fs.mkdirSync(dir);
    fs.writeFileSync(
      path.join(dir, 'astryx.config.mjs'),
      `export default { integrations: '@nest/xds-meta' };\n`,
    );
    await expect(loadConfig(dir)).resolves.toMatchObject({
      integrations: ['@nest/xds-meta'],
    });
  });

  it('normalizes integration arrays and filters non-strings', async () => {
    const dir = path.join(tmpDir, 'two');
    fs.mkdirSync(dir);
    fs.writeFileSync(
      path.join(dir, 'astryx.config.mjs'),
      `export default { integrations: ['@nest/xds-meta', '', 42] };\n`,
    );
    await expect(loadConfig(dir)).resolves.toMatchObject({
      integrations: ['@nest/xds-meta'],
    });
  });
});
