// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file CLI-level tests for `astryx build` error-envelope faithfulness.
 *
 * The build command delegates to search(), which validates --type and --limit
 * and throws AstryxError with a specific code. The CLI wrapper must propagate
 * that `code` into the --json error envelope (the field agents/CI branch on)
 * instead of dropping it and falling through to the generic ERR_UNKNOWN.
 */

import {describe, it, expect} from 'vitest';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';
import {runCli} from '../../../test-utils/run-cli.mjs';

// Run against the monorepo root so @astryxdesign/core is discoverable.
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
const SLOW = 30_000;

describe('build --json error envelopes carry the API error code', () => {
  it('bogus --type -> ERR_INVALID_ARGUMENT (not ERR_UNKNOWN)', async () => {
    const {status, stdout} = await runCli(
      ['build', 'dashboard', '--type', 'bogus', '--json'],
      REPO,
    );
    expect(status).toBe(1);
    const env = JSON.parse(stdout);
    expect(env.error).toMatch(/unknown --type/i);
    expect(env.code).toBe('ERR_INVALID_ARGUMENT');
  }, SLOW);

  it('non-positive --limit -> ERR_INVALID_ARGUMENT', async () => {
    const {status, stdout} = await runCli(
      ['build', 'dashboard', '--limit', '0', '--json'],
      REPO,
    );
    expect(status).toBe(1);
    expect(JSON.parse(stdout).code).toBe('ERR_INVALID_ARGUMENT');
  }, SLOW);

  it('non-integer --limit -> ERR_INVALID_ARGUMENT', async () => {
    const {status, stdout} = await runCli(
      ['build', 'dashboard', '--limit', 'abc', '--json'],
      REPO,
    );
    expect(status).toBe(1);
    expect(JSON.parse(stdout).code).toBe('ERR_INVALID_ARGUMENT');
  }, SLOW);
});
