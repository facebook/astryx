// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Error-code contract tests for the layout command wrapper. Locks the
 * two foreseeable input errors to STABLE ERR_* codes (never ERR_UNKNOWN or a
 * raw fs errno) and asserts --json/human exit parity:
 *   - empty expression  → ERR_MISSING_ARGUMENT
 *   - --file <missing>  → ERR_FILE_NOT_FOUND (not raw ENOENT), no stack leak
 * Spawns the real binary so the bin error boundary is exercised faithfully.
 */

import {describe, it, expect} from 'vitest';
import {spawnSync} from 'node:child_process';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLI_BIN = path.resolve(__dirname, '../bin/astryx.mjs');

function run(args) {
  const res = spawnSync('node', [CLI_BIN, ...args], {
    encoding: 'utf-8',
    timeout: 20_000,
  });
  return {status: res.status, stdout: res.stdout || '', stderr: res.stderr || ''};
}

describe('layout --json error codes', () => {
  for (const sub of ['expand', 'check']) {
    it(`layout ${sub} "" → ERR_MISSING_ARGUMENT (not ERR_UNKNOWN)`, () => {
      const r = run(['--json', 'layout', sub, '']);
      expect(r.status).toBe(1);
      const env = JSON.parse(r.stdout);
      expect(env.code).toBe('ERR_MISSING_ARGUMENT');
      expect(r.stderr).toBe('');
      expect(r.stdout).not.toMatch(/\n\s+at /); // no stack frames
    });

    it(`layout ${sub} --file <missing> → ERR_FILE_NOT_FOUND (not ENOENT)`, () => {
      const r = run([
        '--json',
        'layout',
        sub,
        '--file',
        '/tmp/definitely-missing-astryx-xyz.mjs',
      ]);
      expect(r.status).toBe(1);
      const env = JSON.parse(r.stdout);
      expect(env.code).toBe('ERR_FILE_NOT_FOUND');
      expect(r.stderr).toBe('');
    });

    it(`layout ${sub}: --json and human agree on exit code (empty input)`, () => {
      const human = run(['layout', sub, '']);
      const json = run(['--json', 'layout', sub, '']);
      expect(json.status).toBe(human.status);
      expect(json.status).toBe(1);
    });

    it(`layout ${sub} --file <missing> in human mode leaks no stack trace`, () => {
      const r = run(['layout', sub, '--file', '/tmp/definitely-missing-astryx-xyz.mjs']);
      expect(r.status).toBe(1);
      expect(r.stderr).not.toMatch(/\n\s+at /);
    });
  }
});
