// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file CLI behavior for `astryx template --cdn`.
 *
 * The API leaf is covered by api/template/cdn/cdn.test.mjs; what is only
 * reachable here is the terminal binding — that the flag short-circuits the
 * family's name resolution, which message the user sees, and the JSON envelope.
 * A receipt read at the wrong depth (`result.written` instead of
 * `result.data.written`) writes the file and then reports a skip, and no unit
 * test of the leaf can see it.
 */

import {describe, it, expect, beforeEach, afterEach} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import {runCli} from '../../../test-utils/run-cli.mjs';

let tmpDir;
beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-cli-template-cdn-'));
  fs.writeFileSync(
    path.join(tmpDir, 'package.json'),
    JSON.stringify({name: 'tmp', private: true}),
  );
});
afterEach(() => {
  fs.rmSync(tmpDir, {recursive: true, force: true});
});

const read = f => fs.readFileSync(path.join(tmpDir, f), 'utf-8');

describe('astryx template --cdn', () => {
  it('writes the page and says it wrote it', async () => {
    const {status, stdout} = await runCli(['template', '--cdn'], {cwd: tmpDir});

    expect(status).toBe(0);
    expect(stdout).toMatch(/Wrote cdn\.template\.html/);
    expect(stdout).not.toMatch(/already exists/);
    expect(read('cdn.template.html')).toMatch(/<script type="importmap">/);
  });

  it('leaves an existing file alone, and says that instead', async () => {
    fs.writeFileSync(path.join(tmpDir, 'cdn.template.html'), '<!-- mine -->\n');

    const {status, stdout} = await runCli(['template', '--cdn'], {cwd: tmpDir});

    expect(status).toBe(0);
    expect(stdout).toMatch(/already exists/);
    expect(read('cdn.template.html')).toBe('<!-- mine -->\n');
  });

  it('replaces it with --overwrite', async () => {
    fs.writeFileSync(path.join(tmpDir, 'cdn.template.html'), '<!-- mine -->\n');

    const {status} = await runCli(['template', '--cdn', '--overwrite'], {
      cwd: tmpDir,
    });

    expect(status).toBe(0);
    expect(read('cdn.template.html')).toMatch(/importmap/);
  });

  it('writes to the path given to the flag', async () => {
    const {status} = await runCli(['template', '--cdn', 'public/demo.html'], {
      cwd: tmpDir,
    });

    expect(status).toBe(0);
    expect(read(path.join('public', 'demo.html'))).toMatch(/importmap/);
  });

  it('returns a template.cdn envelope under --json', async () => {
    const {status, stdout} = await runCli(['--json', 'template', '--cdn'], {
      cwd: tmpDir,
    });

    expect(status).toBe(0);
    const payload = JSON.parse(stdout);
    expect(payload.type).toBe('template.cdn');
    expect(payload.data).toEqual({
      path: 'cdn.template.html',
      version: expect.stringMatching(/^\d+\.\d+\.\d+/),
      written: true,
      reason: null,
    });
  });

  it('refuses a path that escapes the project', async () => {
    const {status, stderr} = await runCli(
      ['template', '--cdn', '../escaped.html'],
      {cwd: tmpDir},
    );

    expect(status).toBe(1);
    expect(stderr).toMatch(/outside the project root/);
    expect(fs.existsSync(path.join(path.dirname(tmpDir), 'escaped.html'))).toBe(
      false,
    );
  });

  // The flag exists because the positional cannot: `template cdn` would resolve
  // `cdn` against everything discoverAll() finds, so a template with that id
  // would shadow the starter page. The flag answers before discovery runs.
  it('does not shadow, or get shadowed by, a discovered template id', async () => {
    const {status, stderr} = await runCli(['template', 'cdn'], {cwd: tmpDir});

    expect(status).toBe(1);
    expect(stderr).toMatch(/Unknown template "cdn"/);
    expect(fs.existsSync(path.join(tmpDir, 'cdn.template.html'))).toBe(false);
  });
});
