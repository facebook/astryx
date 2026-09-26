// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file CI gate: the generated tables in packages/cli/README.md (commands,
 * error codes, response types) must stay in sync with their sources (the
 * manifest + the error-codes / response-types EnumDocs). Regenerate with
 * `pnpm -F @astryxdesign/cli readme` when this fails.
 */

import {spawnSync} from 'node:child_process';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';
import {describe, it, expect} from 'vitest';

const CLI_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

describe('README generated tables', () => {
  it('are in sync with the manifest + EnumDocs', () => {
    const res = spawnSync(
      'node',
      [path.join(CLI_ROOT, 'scripts/generate-cli-readme.mjs'), '--check'],
      {encoding: 'utf8', maxBuffer: 16 * 1024 * 1024},
    );
    if (res.status !== 0) {
      throw new Error(
        `README tables are out of date. Run \`pnpm -F @astryxdesign/cli readme\`.\n${res.stdout}\n${res.stderr}`,
      );
    }
    expect(res.status).toBe(0);
  }, 30_000);
});
