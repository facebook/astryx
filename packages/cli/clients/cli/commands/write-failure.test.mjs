// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file A write that fails on the filesystem reports ERR_WRITE_FAILED.
 *
 * An unwritable target produced `{"error": "EACCES: permission denied, open
 * '/abs/host/path/readonly/x.tsx'", "code": "ERR_UNKNOWN"}` — the raw Node
 * errno error, with the wrong code and an absolute host path in the message.
 * ERR_WRITE_FAILED is in the frozen registry for exactly this case, and every
 * other Astryx message names its target relative to the project.
 */

import {describe, it, expect, beforeEach, afterEach} from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';
import {runCli} from '../../../test-utils/run-cli.mjs';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../../..');

// chmod means nothing to root, so the unwritable directory would be writable
// and the command would succeed. Skip rather than assert something false.
const asRoot = typeof process.getuid === 'function' && process.getuid() === 0;

let dir;
let readonlyDir;

beforeEach(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-write-fail-'));
  fs.writeFileSync(
    path.join(dir, 'package.json'),
    JSON.stringify({
      name: 'scratch',
      version: '1.0.0',
      dependencies: {'@astryxdesign/core': '0.6.3'},
    }),
  );
  fs.mkdirSync(path.join(dir, 'node_modules', '@astryxdesign'), {recursive: true});
  fs.symlinkSync(
    path.join(REPO, 'packages', 'core'),
    path.join(dir, 'node_modules', '@astryxdesign', 'core'),
    'dir',
  );
  readonlyDir = path.join(dir, 'readonly');
  fs.mkdirSync(readonlyDir);
  fs.chmodSync(readonlyDir, 0o500);
});

afterEach(() => {
  try {
    fs.chmodSync(readonlyDir, 0o700);
  } catch {
    // already gone
  }
  fs.rmSync(dir, {recursive: true, force: true});
});

/** @param {string[]} args */
const json = async args => {
  const {status, stdout} = await runCli(['--json', ...args], {cwd: dir});
  return {status, body: JSON.parse(stdout)};
};

describe.skipIf(asRoot)('a failed write reports ERR_WRITE_FAILED', () => {
  it('template into an unwritable directory', async () => {
    const {status, body} = await json(['template', 'ai-chat', 'readonly/x.tsx']);

    expect(status).toBe(1);
    expect(body.code).toBe('ERR_WRITE_FAILED');
    expect(body.error).toContain('readonly/x.tsx');
    expect(body.error).toContain('EACCES');
    // The whole point of the relative form: no absolute host path escapes.
    expect(body.error).not.toContain(dir);
    expect(fs.existsSync(path.join(readonlyDir, 'x.tsx'))).toBe(false);
  });

  it('swizzle into an unwritable directory', async () => {
    const {status, body} = await json([
      'swizzle',
      'Button',
      '--output',
      'readonly/sub',
    ]);

    expect(status).toBe(1);
    expect(body.code).toBe('ERR_WRITE_FAILED');
    expect(body.error).toContain('readonly/sub');
    expect(body.error).not.toContain(dir);
    expect(fs.existsSync(path.join(readonlyDir, 'sub'))).toBe(false);
  });

  it('still writes normally into a writable directory', async () => {
    const {status, body} = await json(['template', 'ai-chat', 'src/page.tsx']);

    expect(status, JSON.stringify(body).slice(0, 200)).toBe(0);
    expect(body.type).toBe('template.copy');
    expect(fs.existsSync(path.join(dir, 'src', 'page.tsx'))).toBe(true);
  });
});
