#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file resolve-content-root.mjs
 *
 * Resolves the CONTENT ROOT the docsite data pipeline reads package
 * documentation from (component .doc.mjs prop tables, package.json versions,
 * READMEs, CHANGELOGs).
 *
 * The docsite CODE is always the current checkout. What varies per deploy is
 * *which version of the @astryxdesign/* packages* supplies that documentation:
 *
 *   canary  → the live monorepo workspace (REPO_ROOT). Documents main / WIP.
 *             Used for the canary deploy AND every PR preview.
 *   latest  → the last PUBLISHED release on npm. Documents exactly what
 *             `npm install` gives a consumer today. Used for production.
 *
 * Target selection (no manual config in the common case):
 *   - Explicit override: DOCSITE_TARGET=latest|canary always wins.
 *   - Otherwise derived from Vercel's VERCEL_ENV: `production` → latest,
 *     everything else (preview, development, unset) → canary.
 *
 * How `latest` sources are materialized: the version is read live from npm
 * (`npm view @astryxdesign/core version`) so it always tracks the current
 * published release with nothing to hand-maintain. Each docsite @astryxdesign/*
 * dependency's published tarball is downloaded and unpacked into a cache dir
 * laid out like the monorepo, so generate-data.mjs's workspace discovery works
 * unchanged. The published tarballs ship `src/` (see each package's
 * package.json "files"), so the .doc.mjs docs the pipeline reads are present.
 *
 * This module is the SINGLE place that maps a target to a filesystem root.
 * generate-data.mjs consumes CONTENT_ROOT from here; every generated registry
 * keeps its exact shape, so no consuming page code changes.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {execFileSync} from 'node:child_process';
import * as os from 'node:os';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DOCSITE_ROOT = path.resolve(__dirname, '..');
const REPO_ROOT = path.resolve(DOCSITE_ROOT, '..', '..');

/** The npm dist-tag whose version `latest` documents. */
const PUBLISHED_DIST_TAG = 'latest';
/** Package whose published version defines the release the docsite pins to. */
const VERSION_SOURCE_PKG = '@astryxdesign/core';

function run(cmd, args, opts = {}) {
  return execFileSync(cmd, args, {encoding: 'utf-8', ...opts});
}

/**
 * Resolve the build target. Explicit DOCSITE_TARGET wins; otherwise derive from
 * VERCEL_ENV (production → latest, else canary).
 */
export function getTarget() {
  const explicit = (process.env.DOCSITE_TARGET || '').trim();
  if (explicit) {
    if (explicit !== 'canary' && explicit !== 'latest') {
      throw new Error(
        `Invalid DOCSITE_TARGET="${explicit}". Expected "canary" or "latest".`,
      );
    }
    return explicit;
  }
  return process.env.VERCEL_ENV === 'production' ? 'latest' : 'canary';
}

/**
 * The docsite's @astryxdesign/* dependencies, mapped to the monorepo-relative
 * dir each occupies (so the materialized cache mirrors REPO_ROOT's layout).
 * Themes live under packages/themes/<name>; everything else under packages/<name>.
 */
function docsiteAstryxPackages() {
  const pkg = JSON.parse(
    fs.readFileSync(path.join(DOCSITE_ROOT, 'package.json'), 'utf-8'),
  );
  const deps = {...pkg.dependencies, ...pkg.devDependencies};
  return Object.keys(deps)
    .filter(name => name.startsWith('@astryxdesign/'))
    .map(name => {
      const short = name.slice('@astryxdesign/'.length);
      const dir = short.startsWith('theme-')
        ? path.join('packages', 'themes', short.slice('theme-'.length))
        : path.join('packages', short);
      return {name, dir};
    });
}

/** Latest published version of the version-source package, read live from npm. */
function latestPublishedVersion() {
  const out = run(
    'npm',
    [
      'view',
      `${VERSION_SOURCE_PKG}@${PUBLISHED_DIST_TAG}`,
      'version',
      '--json',
    ],
    {maxBuffer: 8 * 1024 * 1024},
  ).trim();
  // `npm view … version` prints a bare quoted string for a single match.
  const version = JSON.parse(out);
  if (typeof version !== 'string' || !version) {
    throw new Error(
      `Could not resolve a published version for ${VERSION_SOURCE_PKG}@${PUBLISHED_DIST_TAG}.`,
    );
  }
  return version;
}

/**
 * Materialize the published package sources for `latest` into a cache dir by
 * downloading each package's PUBLISHED TARBALL from npm.
 *
 * Layout produced (mirrors a real monorepo release so generate-data.mjs's
 * workspace discovery works unchanged):
 *   <cache>/package.json                 — synthetic root (workspaces globs)
 *   <cache>/packages/core/…              — @astryxdesign/core tarball
 *   <cache>/packages/themes/<name>/…     — @astryxdesign/theme-<name> tarballs
 */
function materializeFromNpm(version, packages) {
  const cacheRoot = path.join(DOCSITE_ROOT, '.content-cache', `npm-${version}`);
  const stamp = path.join(cacheRoot, '.stamp');
  const stampValue = `npm-${version}:${packages
    .map(p => p.name)
    .sort()
    .join(',')}`;
  if (
    fs.existsSync(stamp) &&
    fs.readFileSync(stamp, 'utf-8').trim() === stampValue
  ) {
    return cacheRoot;
  }
  fs.rmSync(cacheRoot, {recursive: true, force: true});
  fs.mkdirSync(cacheRoot, {recursive: true});

  // Synthetic root package.json so discoverPackageDirs() expands the same
  // workspace globs it would in the real monorepo.
  fs.writeFileSync(
    path.join(cacheRoot, 'package.json'),
    JSON.stringify(
      {
        name: 'astryx-pinned-content',
        private: true,
        version,
        workspaces: ['packages/*', 'packages/themes/*'],
      },
      null,
      2,
    ),
  );

  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-pin-'));
  try {
    for (const {name, dir} of packages) {
      const spec = `${name}@${version}`;
      // `npm pack` downloads the exact published tarball and prints its
      // filename; --pack-destination keeps it out of the cwd.
      //
      // Run it from the tmp dir (OUTSIDE the repo), NOT from the workspace: the
      // root package.json declares `devEngines.packageManager: pnpm`, which
      // makes npm hard-error EBADDEVENGINES if it discovers that manifest by
      // walking up from the cwd. The tmp dir has no package.json, so npm skips
      // the engine guard. (COREPACK_ENABLE_STRICT=0 as belt-and-suspenders.)
      const out = run(
        'npm',
        ['pack', spec, '--pack-destination', tmp, '--json'],
        {
          cwd: tmp,
          maxBuffer: 256 * 1024 * 1024,
          env: {...process.env, COREPACK_ENABLE_STRICT: '0'},
        },
      );
      const tgz = path.join(tmp, JSON.parse(out)[0].filename);
      const dest = path.join(cacheRoot, dir);
      fs.mkdirSync(dest, {recursive: true});
      // npm tarballs wrap everything under a top-level "package/" dir.
      run('tar', ['-x', '-z', '-f', tgz, '--strip-components=1', '-C', dest]);
    }
  } finally {
    fs.rmSync(tmp, {recursive: true, force: true});
  }

  fs.writeFileSync(stamp, stampValue);
  return cacheRoot;
}

/**
 * Returns {target, contentRoot, cliRoot, version} for the current target.
 * contentRoot mirrors REPO_ROOT layout (has packages/* and package.json).
 */
export function resolveContentRoot() {
  const target = getTarget();

  if (target === 'canary') {
    return {
      target,
      contentRoot: REPO_ROOT,
      cliRoot: path.join(REPO_ROOT, 'packages', 'cli'),
      version: null,
    };
  }

  // latest
  const version = latestPublishedVersion();
  const packages = docsiteAstryxPackages();
  const contentRoot = materializeFromNpm(version, packages);
  return {
    target,
    // DATA (component .doc.mjs prop tables, package.json versions, READMEs) is
    // read from the published release — that's the point of `latest`.
    contentRoot,
    // EXECUTABLE content (CLI templates: showcases, examples, blocks, pages,
    // long-form docs) is LIVE-RENDERED as React and always resolves
    // @astryxdesign/core from node_modules — i.e. the version the docsite
    // bundles. Pinning it would make a stale release's demo use API the bundled
    // core no longer exposes, breaking render AND typecheck. So it always comes
    // from the real workspace; only the documented DATA is pinned.
    cliRoot: path.join(REPO_ROOT, 'packages', 'cli'),
    version,
  };
}

// CLI usage: `node resolve-content-root.mjs` prints the resolution as JSON.
if (import.meta.url === `file://${process.argv[1]}`) {
  const r = resolveContentRoot();
  process.stdout.write(JSON.stringify(r, null, 2) + '\n');
}
