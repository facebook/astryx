// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file CLI behavior for `astryx cdn template`.
 *
 * The API leaf is covered by api/cdn/template/template.test.mjs; what is only
 * reachable here is the terminal binding — the group's subcommand dispatch,
 * which message the user sees, and the JSON envelope. A receipt read at the
 * wrong depth (`result.written` instead of `result.data.written`) writes the
 * file and then reports a skip, and no unit test of the leaf can see it.
 */

import {describe, it, expect, beforeEach, afterEach} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import {runCli} from '../../../test-utils/run-cli.mjs';

let tmpDir;
beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-cli-cdn-template-'));
  fs.writeFileSync(
    path.join(tmpDir, 'package.json'),
    JSON.stringify({name: 'tmp', private: true}),
  );
});
afterEach(() => {
  fs.rmSync(tmpDir, {recursive: true, force: true});
});

const read = f => fs.readFileSync(path.join(tmpDir, f), 'utf-8');

describe('astryx cdn template', () => {
  it('writes the page and says it wrote it', async () => {
    const {status, stdout} = await runCli(['cdn', 'template'], {cwd: tmpDir});

    expect(status).toBe(0);
    expect(stdout).toMatch(/Wrote cdn\.template\.html/);
    expect(stdout).not.toMatch(/already exists/);
    expect(read('cdn.template.html')).toMatch(/<script type="importmap">/);
  });

  it('leaves an existing file alone, and says that instead', async () => {
    fs.writeFileSync(path.join(tmpDir, 'cdn.template.html'), '<!-- mine -->\n');

    const {status, stdout} = await runCli(['cdn', 'template'], {cwd: tmpDir});

    expect(status).toBe(0);
    expect(stdout).toMatch(/already exists/);
    expect(read('cdn.template.html')).toBe('<!-- mine -->\n');
  });

  it('replaces it with --overwrite', async () => {
    fs.writeFileSync(path.join(tmpDir, 'cdn.template.html'), '<!-- mine -->\n');

    const {status} = await runCli(['cdn', 'template', '--overwrite'], {
      cwd: tmpDir,
    });

    expect(status).toBe(0);
    expect(read('cdn.template.html')).toMatch(/importmap/);
  });

  it('writes to a path given as an argument', async () => {
    const {status} = await runCli(['cdn', 'template', 'public/demo.html'], {
      cwd: tmpDir,
    });

    expect(status).toBe(0);
    expect(read(path.join('public', 'demo.html'))).toMatch(/importmap/);
  });

  it('returns a cdn.template envelope under --json', async () => {
    const {status, stdout} = await runCli(['--json', 'cdn', 'template'], {
      cwd: tmpDir,
    });

    expect(status).toBe(0);
    const payload = JSON.parse(stdout);
    expect(payload.type).toBe('cdn.template');
    expect(payload.data).toEqual({
      path: 'cdn.template.html',
      version: expect.stringMatching(/^\d+\.\d+\.\d+/),
      written: true,
      reason: null,
    });
  });

  it('refuses a path that escapes the project', async () => {
    const {status, stderr} = await runCli(['cdn', 'template', '../escaped.html'], {
      cwd: tmpDir,
    });

    expect(status).toBe(1);
    expect(stderr).toMatch(/outside the project root/);
    expect(fs.existsSync(path.join(path.dirname(tmpDir), 'escaped.html'))).toBe(
      false,
    );
  });

  it('rejects an unknown subcommand and lists the real ones', async () => {
    const {status, stderr} = await runCli(['cdn', 'bogus'], {cwd: tmpDir});

    expect(status).toBe(1);
    expect(stderr).toMatch(/unknown subcommand 'cdn bogus'/);
    expect(stderr).toMatch(/template/);
  });
});
