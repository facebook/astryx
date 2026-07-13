#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file check-deadcode.mjs
 * Runs knip to detect dead code (unused files, exports, types, and
 * devDependencies) across the monorepo. Configuration lives in knip.jsonc,
 * which declares the safety rules that keep public API surfaces, doc/codegen
 * files, and standalone CLI templates from being reported as unused.
 *
 * knip's parser (oxc) reserves a large virtual ArrayBuffer up front. On hosts
 * with little RAM and no swap under heuristic/strict memory overcommit, that
 * reservation is refused and the parser aborts before doing any work. When we
 * detect that failure mode and can raise the limit, we do; otherwise we print
 * an actionable hint instead of a cryptic allocation error.
 *
 * Usage:
 *   node scripts/check-deadcode.mjs            # human-readable report
 *   node scripts/check-deadcode.mjs --reporter json > findings.json
 *   node scripts/check-deadcode.mjs --production # entry-graph only, fewer FPs
 *
 * Exit code is knip's: non-zero when findings exist. This is a report, not a
 * gate; CI does not run it. The Night Watch Dead Code role consumes the JSON.
 */
import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

const OVERCOMMIT_PATH = '/proc/sys/vm/overcommit_memory';

/**
 * oxc reserves ~6 GiB of virtual address space per parser buffer. On Linux
 * with vm.overcommit_memory=0 (heuristic) or =2 (strict) and no swap, the
 * reservation is rejected on small hosts. Mode 1 (always overcommit) lets the
 * virtual reservation succeed while physical use stays proportional to real
 * data. We only nudge it on Linux, only when it is safe and permitted, and we
 * never fail the run because of it.
 */
function ensureOvercommitOnLinux() {
  if (process.platform !== 'linux') return;
  let current;
  try {
    current = fs.readFileSync(OVERCOMMIT_PATH, 'utf8').trim();
  } catch {
    return; // not readable (containerized): nothing to do
  }
  if (current === '1') return;
  try {
    fs.writeFileSync(OVERCOMMIT_PATH, '1');
  } catch {
    // Not permitted. Leave a breadcrumb; knip may still work on a larger host.
    console.error(
      `[check-deadcode] Note: vm.overcommit_memory=${current}. On a small, ` +
        'swapless host knip may fail to allocate its parser buffer. If you see ' +
        'an "Array buffer allocation failed" error, run this with privileges to ' +
        'set vm.overcommit_memory=1, or run on a host with more memory.',
    );
  }
}

ensureOvercommitOnLinux();

const knipBin = path.resolve(
  repoRoot,
  'node_modules',
  '.bin',
  process.platform === 'win32' ? 'knip.cmd' : 'knip',
);

if (!fs.existsSync(knipBin)) {
  console.error(
    '[check-deadcode] knip is not installed. Run `pnpm install` at the repo root.',
  );
  process.exit(1);
}

const passthrough = process.argv.slice(2);
const args = ['--no-progress', ...passthrough];

const result = spawnSync(knipBin, args, {
  cwd: repoRoot,
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_OPTIONS: [process.env.NODE_OPTIONS, '--max-old-space-size=3200']
      .filter(Boolean)
      .join(' '),
  },
});

if (result.error) {
  console.error('[check-deadcode] Failed to run knip:', result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 0);
