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
import * as os from 'node:os';
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
 * Materialize the pinned-version package sources for `latest` into a cache dir
 * by downloading each pinned package's PUBLISHED TARBALL from npm.
 *
 * Why npm and not a git tag: the Vercel build runs on a shallow checkout with
 * no tags, so `git show <tag>` / `git archive <tag>` fail there. npm is always
 * reachable. The published tarballs ship `src/` (see each package's
 * package.json "files"), so the .doc.mjs docs the pipeline reads are present.
 *
 * Layout produced (mirrors a real monorepo release so generate-data.mjs's
 * workspace discovery works unchanged):
 *   <cache>/package.json                 — synthetic root (workspaces globs)
 *   <cache>/packages/core/…              — @astryxdesign/core tarball
 *   <cache>/packages/cli/…               — @astryxdesign/cli tarball
 *   <cache>/packages/themes/<name>/…     — @astryxdesign/theme-<name> tarballs
 *
 * `packages` is the manifest's list of {name, dir} pairs.
 */
function materializeFromNpm(version, packages) {
  const cacheRoot = path.join(DOCSITE_ROOT, '.content-cache', `npm-${version}`);
  const stamp = path.join(cacheRoot, '.stamp');
  const stampValue = `npm-${version}:${packages.map(p => p.name).sort().join(',')}`;
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
      // the engine guard. (COREPACK_ENABLE_STRICT=0 as belt-and-suspenders in
      // case a parent dir ever reintroduces a manifest.)
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
  const version = cfg.version;
  const packages = cfg.packages;
  if (!version || !Array.isArray(packages) || packages.length === 0) {
    throw new Error(
      'versions.json latest must define "version" and a non-empty "packages" list.',
    );
  }
  const contentRoot = materializeFromNpm(version, packages);
  // The switcher/UI wants a name→version map for the pinned content packages.
  const versions = Object.fromEntries(packages.map(p => [p.name, version]));
  return {
    target,
    // DATA (component .doc.mjs prop tables, package.json versions, READMEs) is
    // read from the pinned release — that's the point of `latest`.
    contentRoot,
    // EXECUTABLE content (CLI templates: showcases, examples, blocks, pages,
    // long-form docs) is LIVE-RENDERED as React and always resolves @astryxdesign/core
    // from node_modules — i.e. main, the version the docsite bundles. Pinning
    // it would make a stale release's demo use API main's runtime no longer
    // exposes (e.g. a removed prop), breaking render AND typecheck. So it always
    // comes from the real workspace, matching the bundled core; only the
    // documented DATA is pinned.
    cliRoot: path.join(REPO_ROOT, 'packages', 'cli'),
    versions,
    label: cfg.label ?? 'Latest (stable)',
  };
}

// CLI usage: `node resolve-content-root.mjs` prints the resolution as JSON.
if (import.meta.url === `file://${process.argv[1]}`) {
  const r = resolveContentRoot();
  process.stdout.write(JSON.stringify(r, null, 2) + '\n');
}
