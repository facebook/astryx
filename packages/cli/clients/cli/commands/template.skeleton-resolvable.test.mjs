// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `template <name> --skeleton` text output projects the resolvable list.
 *
 * The JSON envelope carries both `components` (released meaning, every
 * composed name) and `resolvableComponents` (exact-resolution contract).
 * The default text output must show both, or terminal and agent users hit
 * the phantom-name workflow the JSON fix closed (#4677).
 */

import {describe, it, expect} from 'vitest';
import {runCli} from '../../../test-utils/run-cli.mjs';

const SLOW = 60_000;

/** @param {string} stdout */
const resolvableLine = stdout =>
  stdout.split('\n').find(line => line.startsWith('# Resolvable components:')) ?? '';

describe('template --skeleton text output', () => {
  it('prints the resolvable list alongside the released components line', async () => {
    const {status, stdout} = await runCli(['template', 'detail-page', '--skeleton']);
    expect(status).toBe(0);
    expect(stdout).toContain('# Components:');
    const line = resolvableLine(stdout);
    expect(line).not.toBe('');
    // detail-page renders a local TimelineSection: the released line keeps
    // upstream's base-name Timeline, the resolvable line must not.
    expect(line).not.toContain('Timeline');
    expect(stdout).toMatch(/# Components:.*Timeline/);
  }, SLOW);
});
