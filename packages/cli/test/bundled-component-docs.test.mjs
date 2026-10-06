// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Drift gate for the Core component-doc snapshot shipped with the CLI.
 */

import {describe, expect, it} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {
  bundledCoreVersion,
  getBundledComponentRecords,
} from '../foundation/discovery/bundled-component-docs.mjs';

const CLI_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);
const REPO_ROOT = path.resolve(CLI_ROOT, '../..');

function versionOf(packageDir) {
  return JSON.parse(
    fs.readFileSync(path.join(packageDir, 'package.json'), 'utf8'),
  ).version;
}

describe('bundled Core component docs', () => {
  it('stay generated from the current Core docs', () => {
    const result = spawnSync(
      process.execPath,
      [
        path.join(CLI_ROOT, 'scripts/generate-bundled-component-docs.mjs'),
        '--check',
      ],
      {cwd: REPO_ROOT, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024},
    );
    if (result.status !== 0) {
      throw new Error(`${result.stdout}\n${result.stderr}`.trim());
    }
  }, 30_000);

  it('is version-matched to both published packages', () => {
    expect(bundledCoreVersion).toBe(
      versionOf(path.join(REPO_ROOT, 'packages/core')),
    );
    expect(bundledCoreVersion).toBe(versionOf(CLI_ROOT));
    expect(getBundledComponentRecords().length).toBeGreaterThan(100);
  });
});
