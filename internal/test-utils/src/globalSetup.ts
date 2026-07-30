// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file globalSetup.ts
 * @input None (runs once, before the whole test suite)
 * @output Side effect: regenerates packages/core/locales/pseudo.json
 * @position Vitest globalSetup hook; keeps generated i18n artifacts fresh so
 *   tests can import them without a preceding build step.
 *
 * pseudo.json is git-ignored and derived from en.json. This setup runs the
 * generator once per test suite so tests that import the pseudo catalog
 * always have an up-to-date copy.
 */

import {execFileSync} from 'node:child_process';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));

export default function setup() {
  // internal/test-utils/src → repo root
  const repoRoot = resolve(HERE, '..', '..', '..');
  const script = resolve(
    repoRoot,
    'packages',
    'core',
    'scripts',
    'build-pseudo-locale.mjs',
  );
  execFileSync('node', [script], {stdio: 'inherit'});
}
