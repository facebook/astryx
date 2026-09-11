#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file verify-production-gate.mjs
 * @description Proves a non-canary docsite target removes stale ShadCN output
 *   without downloading the currently published package catalog.
 * @input The target-aware registry generator used by generate-data.mjs.
 * @output A network-free assertion that production cannot expose `/shadcn`.
 * @position Required CI guard for the staged compatibility launch.
 */

import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

import {generateShadcnRegistryForTarget} from '../../apps/docsite/scripts/generate-shadcn-registry.mjs';

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-shadcn-gate-'));
const outDir = path.join(root, 'shadcn');

try {
  fs.mkdirSync(outDir, {recursive: true});
  fs.writeFileSync(path.join(outDir, 'stale.json'), '{}\n');

  const result = generateShadcnRegistryForTarget({
    target: 'latest',
    outDir,
  });

  assert.equal(result, null);
  assert.equal(fs.existsSync(outDir), false);
  console.log('Verified production excludes ShadCN compatibility output.');
} finally {
  fs.rmSync(root, {recursive: true, force: true});
}
