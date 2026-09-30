#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Generates apps/docsite/src/generated/spacingUsage.ts
 *
 * Answers "if I change --spacing-N, what moves?" for the Theme Editor
 * (issue #808), read straight out of packages/core component source. Runs as
 * part of `pnpm generate` (before dev/build/test) so the map cannot drift from
 * the components it describes — the same reason scripts/generate-scope.mjs
 * derives the playground scope instead of maintaining a list.
 *
 * Derivation and rendering both live in src/lib/spacingUsage.mjs so the test
 * suite pins the emitted shape and the empty-map guard; this script is only
 * the path wiring.
 *
 * Run: node scripts/generate-spacing-usage.mjs
 */

import {writeFileSync, mkdirSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {
  deriveSpacingUsage,
  renderSpacingUsageModule,
} from '../src/lib/spacingUsage.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const CORE_SRC = resolve(ROOT, '../../packages/core/src');
const OUT = resolve(ROOT, 'src/generated/spacingUsage.ts');

const usage = deriveSpacingUsage(CORE_SRC);

mkdirSync(dirname(OUT), {recursive: true});
writeFileSync(OUT, renderSpacingUsageModule(usage));

const total = Object.keys(usage).length;
console.log(`Generated spacingUsage.ts: ${total} spacing tokens mapped`);
