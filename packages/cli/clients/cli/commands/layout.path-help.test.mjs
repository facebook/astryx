// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `layout expand` and `layout check` document their input modes (the
 * argument, `-` for stdin, --file) and where `layout expand` writes.
 */

import {describe, it, expect} from 'vitest';
import {runCli} from '../../../test-utils/run-cli.mjs';
import {isFilePathArg} from '../../../foundation/fs/path-safety.mjs';

const SLOW = 30_000;

describe('layout argument behavior is documented', () => {
  it('layout expand help covers stdin, --file precedence and the output path rule', async () => {
    const {status, stdout} = await runCli(['layout', 'expand', '--help']);
    expect(status).toBe(0);
    expect(stdout).toMatch(/Pass - to read it from stdin/);
    expect(stdout).toMatch(/instead of the argument/);
    expect(stdout).toContain('<Name>.tsx');
    expect(stdout).toMatch(/existing file there is replaced/);
    const exts = [...(stdout.match(/ends in ([.\w, ]+ or \.\w+)/)?.[1] ?? '').matchAll(/\.\w+/g)];
    expect(exts.length).toBeGreaterThan(0);
    for (const [ext] of exts) expect(isFilePathArg(`src/Page${ext}`)).toBe(true);
  }, SLOW);

  it('layout check help covers stdin and --file precedence', async () => {
    const {status, stdout} = await runCli(['layout', 'check', '--help']);
    expect(status).toBe(0);
    expect(stdout).toMatch(/Pass - to read it from stdin/);
    expect(stdout).toMatch(/instead of the argument/);
  }, SLOW);
});
