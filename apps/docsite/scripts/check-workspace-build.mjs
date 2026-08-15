#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Preflight for the docsite: fail fast when @astryxdesign/core isn't built.
 *
 * The docsite's `generate` step runs `astryx theme build`, which imports the
 * compiled @astryxdesign/core theme entry (dist/theme/index.js). In a fresh
 * clone/worktree that dist/ doesn't exist until `pnpm build` runs at the repo
 * root, and the raw failure points at an internal node_modules/.../dist path
 * with no hint of the fix. This check runs first in `generate` (so both `dev`
 * and `build` gate on it) and prints a clear, actionable message.
 *
 * Scope note: this only gates on core, which is the shared prerequisite for
 * `generate` + `test` (matching CI's docsite-test job, which builds only
 * core). Theme-package CSS is a `next dev`/`next build` runtime concern, not a
 * `generate` prerequisite, so it is intentionally not required here.
 *
 * Usage: node scripts/check-workspace-build.mjs
 */

import {existsSync} from 'node:fs';
import {join, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
// scripts -> docsite -> apps -> repo root
const ROOT = join(__dirname, '..', '..', '..');

// Representative built artifact for the failure `generate` actually hits:
// core's built theme module. `build:theme` (astryx theme build) imports the
// compiled @astryxdesign/core/theme entry, so if this file is missing, the
// very first step of `generate` dies with a cryptic "Cannot find module
// .../dist/theme/index.js".
//
// We intentionally do NOT require the theme packages' built theme.css here.
// The `generate` + `test` path only needs core built (this is how CI's
// docsite-test job runs — it builds only @astryxdesign/core). The theme CSS
// is a runtime/`next build` concern, not a `generate` prerequisite, so
// requiring it would fail CI where main is green today.
const REQUIRED = ['packages/core/dist/theme/index.js'];

const missing = REQUIRED.filter(rel => !existsSync(join(ROOT, rel)));

if (missing.length > 0) {
  console.error(
    [
      '',
      '⚠  Astryx workspace packages aren\'t built yet.',
      '   The docsite consumes the built output of @astryxdesign/core.',
      '   Run `pnpm build` from the repo root first, then re-run `pnpm run docsite`.',
      `   (missing: ${missing.join(', ')})`,
      '',
    ].join('\n'),
  );
  process.exit(1);
}
