#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.
/**
 * Post-`changeset version` internal-dependency sync — `node scripts/sync-internal-deps.mjs`.
 *
 * All published packages ship in lockstep at the same version (the `fixed`
 * group in .changeset/config.json). Internal `@astryxdesign/*` packages
 * reference each other with exact version specifiers (e.g. a theme's
 * `@astryxdesign/core` peer, or a theme's `@astryxdesign/cli` devDependency).
 *
 * We set `bumpVersionsWithWorkspaceProtocolOnly: true` so a breaking 0.x
 * release stays on the minor `0.(x+1).0` instead of cascading the whole fixed
 * group to `1.0.0` (an out-of-range peer would otherwise force every
 * dependent to a major bump). The trade-off is that Changesets then only
 * rewrites `workspace:`-protocol specifiers on version — it leaves our exact
 * `@astryxdesign/*` specifiers pointing at the previous version.
 *
 * This script closes that gap: after the bump, every exact-version internal
 * `@astryxdesign/*` specifier (in dependencies, devDependencies, and
 * peerDependencies of every workspace package) is repinned to the freshly
 * bumped version of the referenced package. Non-exact specifiers (`*`,
 * ranges, `workspace:*`, etc.) are left untouched — only literal exact
 * versions are managed, which is exactly the set Changesets used to keep in
 * sync before the workspace-protocol-only setting.
 */

import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const read = p => JSON.parse(fs.readFileSync(p, 'utf8'));

// Workspace dirs that can contain internal packages. Kept in sync with
// pnpm-workspace.yaml `packages:`.
const PKG_DIRS = ['packages', 'packages/themes', 'apps', 'internal'];

const EXACT_VERSION = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/;
const DEP_FIELDS = ['dependencies', 'devDependencies', 'peerDependencies'];

// Discover every workspace package.json.
const pkgPaths = [];
for (const dir of PKG_DIRS) {
  const abs = path.join(ROOT, dir);
  if (!fs.existsSync(abs)) continue;
  for (const entry of fs.readdirSync(abs, {withFileTypes: true})) {
    if (!entry.isDirectory()) continue;
    const pkgPath = path.join(abs, entry.name, 'package.json');
    if (fs.existsSync(pkgPath)) pkgPaths.push(pkgPath);
  }
}

// Map each internal package name -> its current (post-bump) version.
const versionByName = new Map();
for (const pkgPath of pkgPaths) {
  const pkg = read(pkgPath);
  if (pkg.name && pkg.version) versionByName.set(pkg.name, pkg.version);
}

let changed = 0;
for (const pkgPath of pkgPaths) {
  const pkg = read(pkgPath);
  let dirty = false;
  for (const field of DEP_FIELDS) {
    const deps = pkg[field];
    if (!deps) continue;
    for (const name of Object.keys(deps)) {
      const target = versionByName.get(name);
      if (!target) continue; // not an internal workspace package
      const spec = deps[name];
      // Only manage exact-version specifiers; leave `*`, ranges and
      // workspace: protocol specifiers alone.
      if (!EXACT_VERSION.test(spec)) continue;
      if (spec === target) continue;
      deps[name] = target;
      console.log(`  ${pkg.name}: ${field} ${name} ${spec} -> ${target}`);
      dirty = true;
      changed++;
    }
  }
  if (dirty) fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
}

console.log(
  changed === 0
    ? 'All exact-version internal @astryxdesign/* specifiers already in sync.'
    : `Synced ${changed} internal @astryxdesign/* specifier(s).`,
);
