#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file resolve-content-root.mjs
 *
 * Resolves the CONTENT ROOT the docsite data pipeline reads from, based on the
 * build target (DOCSITE_TARGET=canary|latest).
 *
 * The docsite CODE is always the current checkout (main). What varies per
 * target is *which version of the packages* supplies the documentation content
 * (component .doc.mjs, package.json versions, CLI templates/docs):
 *
 *   canary  → the live monorepo workspace (REPO_ROOT). Documents main, WIP.
 *   latest  → the last published release. Documents exactly what `npm install`
 *             gives a consumer today.
 *
 * How `latest` sources are materialized:
 *   - Production (Vercel, network): `npm install @astryxdesign/<pkg>@<version>`
 *     into a scratch dir; content root = that install's node_modules. The
 *     published tarballs ship `src/` (so .doc.mjs are present) — see each
 *     package's package.json "files".
 *   - CI / sandbox / offline: materialize the same sources deterministically
 *     from the git tag via `git archive <tag> packages/<pkg>`. No network.
 *
 * This module is the SINGLE place that knows how a target maps to a filesystem
 * root. generate-data.mjs consumes CONTENT_ROOT / CLI_ROOT from here and is
 * otherwise unchanged in shape — every generated registry keeps its exact
 * structure so no consuming page code changes.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DOCSITE_ROOT = path.resolve(__dirname, '..');
const REPO_ROOT = path.resolve(DOCSITE_ROOT, '..', '..');

export function readVersionsManifest() {
  const raw = fs.readFileSync(path.join(DOCSITE_ROOT, 'versions.json'), 'utf-8');
  return JSON.parse(raw);
}

export function getTarget() {
  const t = (process.env.DOCSITE_TARGET || 'canary').trim();
  if (t !== 'canary' && t !== 'latest') {
    throw new Error(
      `Invalid DOCSITE_TARGET="${t}". Expected "canary" or "latest".`,
    );
  }
  return t;
}

function run(cmd, args, opts = {}) {
  return execFileSync(cmd, args, {encoding: 'utf-8', ...opts});
}

/**
 * Materialize the pinned-version package sources for `latest` into a cache dir,
 * OFFLINE, from the git tag. Returns the cache root that mirrors REPO_ROOT's
 * layout: <cache>/packages/{core,cli}/...
 */
function materializeFromGitTag(tag) {
  const cacheRoot = path.join(DOCSITE_ROOT, '.content-cache', tag);
  const stamp = path.join(cacheRoot, '.stamp');
  if (fs.existsSync(stamp) && fs.readFileSync(stamp, 'utf-8').trim() === tag) {
    return cacheRoot;
  }
  fs.rmSync(cacheRoot, {recursive: true, force: true});
  fs.mkdirSync(cacheRoot, {recursive: true});

  // Root package.json drives workspace discovery in generate-data.mjs; take the
  // pinned tag's version so discovery matches the pinned tree.
  const rootPkg = run('git', ['show', `${tag}:package.json`], {cwd: REPO_ROOT});
  fs.writeFileSync(path.join(cacheRoot, 'package.json'), rootPkg);

  // Archive the WHOLE packages/ tree from the tag. Package + theme discovery,
  // versions, READMEs and CHANGELOGs must all reflect the pinned release — not
  // just the two content packages — so the pinned build's package/theme lists
  // match what was actually published.
  const dest = path.join(cacheRoot, 'packages');
  fs.mkdirSync(dest, {recursive: true});
  const tar = run('git', ['archive', tag, 'packages'], {
    cwd: REPO_ROOT,
    maxBuffer: 512 * 1024 * 1024,
    encoding: 'buffer',
  });
  // Strip the leading packages/ prefix so files land under dest.
  run('tar', ['-x', '--strip-components=1', '-C', dest], {input: tar});

  fs.writeFileSync(stamp, tag);
  return cacheRoot;
}

/**
 * Returns {contentRoot, cliRoot, target, versions} for the current target.
 * contentRoot mirrors REPO_ROOT layout (has packages/* and package.json).
 */
export function resolveContentRoot() {
  const target = getTarget();
  const manifest = readVersionsManifest();

  if (target === 'canary') {
    return {
      target,
      contentRoot: REPO_ROOT,
      cliRoot: path.join(REPO_ROOT, 'packages', 'cli'),
      versions: null,
      label: manifest.canary?.label ?? 'Canary (main)',
    };
  }

  // latest
  const cfg = manifest.latest;
  if (!cfg) throw new Error('versions.json missing "latest" entry.');
  const tag = cfg.gitTag;
  if (!tag) {
    throw new Error(
      'versions.json latest.gitTag is required for the offline/CI resolver.',
    );
  }
  const contentRoot = materializeFromGitTag(tag);
  return {
    target,
    contentRoot,
    cliRoot: path.join(contentRoot, 'packages', 'cli'),
    versions: cfg.versions ?? null,
    label: cfg.label ?? 'Latest (stable)',
  };
}

// CLI usage: `node resolve-content-root.mjs` prints the resolution as JSON.
if (import.meta.url === `file://${process.argv[1]}`) {
  const r = resolveContentRoot();
  process.stdout.write(JSON.stringify(r, null, 2) + '\n');
}
