// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect, beforeEach, afterEach} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import {execFileSync} from 'node:child_process';

// Subprocess tests proving the postinstall welcome banner stays aligned
// regardless of the detected package-manager run prefix. The old
// hard-coded inner width (W=49) broke alignment for longer prefixes such
// as `pnpm exec` and `bunx`, pushing the right border out of the box.
const cliBin = path.resolve(import.meta.dirname, '..', 'bin', 'xds.mjs');

let tmpDir;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'xds-banner-test-'));
});

afterEach(() => {
  fs.rmSync(tmpDir, {recursive: true, force: true});
});

function renderBanner({lockfile}) {
  if (lockfile) {
    fs.writeFileSync(path.join(tmpDir, lockfile), '');
  }
  return execFileSync(process.execPath, [cliBin, 'postinstall'], {
    cwd: tmpDir,
    // Strip any inherited PM user-agent so lockfile detection drives the prefix.
    env: {...process.env, FORCE_COLOR: '0', npm_config_user_agent: ''},
    encoding: 'utf-8',
  });
}

function bannerLines(output) {
  return output.split('\n').filter(l => l.includes('│') || l.includes('╭') || l.includes('╰'));
}

describe('postinstall banner alignment', () => {
  // pnpm exec (10 chars) and bunx are the prefixes that broke the old W=49.
  for (const [name, lockfile] of [
    ['npm (npx)', 'package-lock.json'],
    ['pnpm (pnpm exec)', 'pnpm-lock.yaml'],
    ['yarn (yarn)', 'yarn.lock'],
    ['bun (bunx)', 'bun.lockb'],
  ]) {
    it(`right border stays aligned for ${name}`, () => {
      const out = renderBanner({lockfile});
      const lines = bannerLines(out);
      expect(lines.length).toBeGreaterThan(3);
      // Every box line must have the same visible width (use Array.from to
      // count code points, since box-drawing chars are multi-byte).
      const widths = new Set(lines.map(l => Array.from(l).length));
      expect(widths.size).toBe(1);
      // Body lines must end with the right border character.
      const bodyLines = lines.filter(l => l.includes('│'));
      for (const l of bodyLines) {
        expect(l.trimEnd().endsWith('│')).toBe(true);
      }
    });
  }
});
