#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.
/**
 * Post-`changeset version` peer-dependency sync — `node scripts/sync-theme-peer-versions.mjs`.
 *
 * All published packages ship in lockstep at the same version (the `fixed`
 * group in .changeset/config.json). The theme packages declare
 * `@astryxdesign/core` as a peerDependency pinned to an exact version. Changesets
 * bumps the theme package versions but does NOT rewrite that peer specifier
 * (it only rewrites `workspace:`-protocol specifiers, and we intentionally do
 * not use those — see `bumpVersionsWithWorkspaceProtocolOnly: true`, which is
 * what keeps a breaking 0.x release on the minor 0.(x+1).0 instead of
 * cascading the whole fixed group to 1.0.0).
 *
 * So after the version bump we pin each theme's `@astryxdesign/core` peer to the
 * new core version exactly, keeping the lockstep contract explicit: theme
 * 0.2.0 peer-depends on core 0.2.0.
 */

import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CORE_PKG = path.join(ROOT, 'packages/core/package.json');
const THEMES_DIR = path.join(ROOT, 'packages/themes');

const read = p => JSON.parse(fs.readFileSync(p, 'utf8'));

const coreVersion = read(CORE_PKG).version;
if (!coreVersion) {
  console.error('Could not read @astryxdesign/core version');
  process.exit(1);
}

let changed = 0;
for (const entry of fs.readdirSync(THEMES_DIR, {withFileTypes: true})) {
  if (!entry.isDirectory()) continue;
  const pkgPath = path.join(THEMES_DIR, entry.name, 'package.json');
  if (!fs.existsSync(pkgPath)) continue;
  const pkg = read(pkgPath);
  const peer =
    pkg.peerDependencies && pkg.peerDependencies['@astryxdesign/core'];
  if (!peer) continue;
  if (peer === coreVersion) continue;
  pkg.peerDependencies['@astryxdesign/core'] = coreVersion;
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
  console.log(
    `  ${pkg.name}: @astryxdesign/core peer ${peer} -> ${coreVersion}`,
  );
  changed++;
}

console.log(
  changed === 0
    ? `All theme @astryxdesign/core peers already at ${coreVersion}.`
    : `Synced ${changed} theme @astryxdesign/core peer(s) to ${coreVersion}.`,
);
