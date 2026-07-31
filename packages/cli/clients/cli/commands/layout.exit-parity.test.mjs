// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file CLI-level tests for `astryx layout check` exit-code parity.
 *
 * The exit code is the contract and must NOT depend on --json vs human mode:
 * an invalid (but parseable) layout exits 1 in BOTH modes so `layout check`
 * works as a CI gate / agent check without parsing stdout. Runs the real
 * program in-process via the shared runCli harness.
 */

import {describe, it, expect} from 'vitest';
import {runCli} from '../../../test-utils/run-cli.mjs';

const SLOW = 30_000;
// Parses fine, but references an unknown component -> data.valid: false
// (a semantic error, surfaced as data, not a thrown ERR_LAYOUT_PARSE).
const INVALID = 'ZzzUnknownComponent[foo=bar]';
const VALID = 'K';

describe('layout check — exit-code parity (--json vs human)', () => {
  it('human mode exits 1 for an invalid (parseable) expression', async () => {
    const {status} = await runCli(['layout', 'check', INVALID]);
    expect(status).toBe(1);
  }, SLOW);

  it('--json exits 1 for the SAME invalid expression (modes agree)', async () => {
    const {status, stdout} = await runCli(['layout', 'check', INVALID, '--json']);
    const env = JSON.parse(stdout);
    expect(env.type).toBe('layout.check');
    expect(env.data.valid).toBe(false);
    expect(status).toBe(1);
  }, SLOW);

  it('a valid expression exits 0 in both modes', async () => {
    expect((await runCli(['layout', 'check', VALID])).status).toBe(0);
    const {status, stdout} = await runCli(['layout', 'check', VALID, '--json']);
    expect(JSON.parse(stdout).data.valid).toBe(true);
    expect(status).toBe(0);
  }, SLOW);
});
