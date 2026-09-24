// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file CI gate: the generated sections of packages/cli/README.md (commands,
 * the command reference, search options, API functions, error codes, response
 * types, the `doctor integration` table, and the config and integration field
 * pointers) must stay in sync with the self-docs they are generated from.
 * Regenerate with `pnpm -F @astryxdesign/cli readme` when this fails.
 */

import {spawnSync} from 'node:child_process';
import * as path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {describe, it, expect} from 'vitest';

const CLI_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);
const GENERATOR = path.join(CLI_ROOT, 'scripts/generate-cli-readme.mjs');

describe('README generated sections', () => {
  it('are in sync with the self-docs', () => {
    const res = spawnSync('node', [GENERATOR, '--check'], {
      encoding: 'utf8',
      maxBuffer: 16 * 1024 * 1024,
    });
    if (res.status !== 0) {
      throw new Error(
        `README sections are out of date. Run \`pnpm -F @astryxdesign/cli readme\`.\n${res.stdout}\n${res.stderr}`,
      );
    }
    // Exit 0 alone would also pass a script that checked nothing.
    expect(res.stdout).toContain('README generated sections are in sync.');
  }, 30_000);

  it('are not generated when the generator is only imported', () => {
    const res = spawnSync(
      'node',
      [
        '--input-type=module',
        '-e',
        `await import(${JSON.stringify(pathToFileURL(GENERATOR).href)});`,
        '--',
        '--check',
      ],
      {cwd: CLI_ROOT, encoding: 'utf8'},
    );
    expect(res.status).toBe(0);
    expect(res.stdout).toBe('');
  }, 30_000);
});
