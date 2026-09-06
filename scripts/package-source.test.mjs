// Copyright (c) Meta Platforms, Inc. and affiliates.

import {afterEach, describe, expect, it} from 'vitest';
import {execFileSync} from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const VERSION = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'packages/core/package.json'), 'utf8'),
).version;
const TARBALL = path.join(ROOT, 'dist', `xds-core-${VERSION}.tgz`);

afterEach(() => {
  fs.rmSync(TARBALL, {force: true});
});

describe('source distribution', () => {
  it('ships the generated visual-prop contract named by its exports map', () => {
    execFileSync(process.execPath, ['scripts/package-source.js'], {
      cwd: ROOT,
      stdio: 'pipe',
    });
    const entries = execFileSync('tar', ['-tzf', TARBALL], {
      encoding: 'utf8',
    }).split('\n');

    expect(entries).toContain('./theme-visual-props.json');
    expect(entries).toContain('./package.json');
  });
});
