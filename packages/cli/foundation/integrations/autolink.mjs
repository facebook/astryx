// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Autolink — load installed integrations that no astryx.config names.
 *
 * An integration used to need two things to be visible: the package installed,
 * and its name written into `astryx.config.*`. In practice the second half goes
 * missing. A scaffold adds the dependency and writes no config; the package
 * ships components, templates, docs and codemods; and the CLI reports that none
 * of it exists. Nothing is broken, so nobody looks — the integration is simply
 * never used, because we said it was not there.
 *
 * Autolink closes that gap from the side that is always true: a package the
 * project DECLARED as a dependency and that ships a root
 * `astryx.integration.*` manifest is an integration, config entry or not.
 *
 * Two rules bound it:
 *
 *   - DECLARED dependencies only. We read the dependency KEYS out of the
 *     project's own package.json and resolve those. We never walk node_modules
 *     looking for manifests: a transitive dependency of a dependency did not
 *     ask to contribute to this project, and a tree walk is unbounded work for
 *     an answer the project already wrote down.
 *   - The KEY, never the VALUE. `"@acme/legacy-ui": "npm:@acme/ui@0.1.22"`
 *     is a real, installed shape; so are `workspace:*`, `file:../lib`, `link:`
 *     and `catalog:`. None of them is a semver range, and none of them has to
 *     be parsed: the key is the directory name under node_modules, which is the
 *     only thing resolution needs. Identity still comes from the resolved
 *     package's own package.json `name` (see loadIntegrations), so an aliased
 *     dependency reports the package it actually is.
 *
 * An explicit config entry always wins: candidates already loaded from config
 * are dropped before anything here is imported.
 *
 * @position lib — sits between config/project (the caller) and
 *   integrations/integrations (the loader); contributes no discovery of its own.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {findManifestPaths, loadIntegrations} from './integrations.mjs';

/**
 * package.json fields whose keys name a dependency this project installs.
 *
 * `peerDependencies` is deliberately absent: a peer is a requirement the
 * CONSUMER must satisfy, not something this project's install brings in, so a
 * peer that happens to be present is not a declaration that it belongs here.
 *
 * @type {readonly string[]}
 */
export const DEPENDENCY_FIELDS = Object.freeze([
  'dependencies',
  'devDependencies',
  'optionalDependencies',
]);

/**
 * Whether a dependency key is a bare package name safe to resolve.
 *
 * Mirrors the guard in {@link import('./integrations.mjs').resolvePackageDir}:
 * a name is a directory under node_modules, so a path segment (`.`, `..`) or an
 * absolute spec must never reach the resolver, which goes on to dynamically
 * import what it finds.
 *
 * @param {string} name
 * @returns {boolean}
 */
function isBarePackageName(name) {
  return (
    typeof name === 'string' &&
    name.length > 0 &&
    !path.isAbsolute(name) &&
    !name.startsWith('@/') &&
    !name.split('/').some(segment => segment === '.' || segment === '..')
  );
}

/**
 * The dependency names this project declares, in field then declaration order,
 * each tagged with the field that declared it. A name declared twice keeps the
 * first field it appeared in.
 *
 * Only keys are read. See the file header for why values are never parsed.
 *
 * @param {string} projectDir directory holding the project's package.json
 * @returns {Array<{name: string, field: string}>}
 */
export function readDeclaredDependencies(projectDir) {
  /** @type {Record<string, unknown>} */
  let pkg;
  try {
    pkg = JSON.parse(
      fs.readFileSync(path.join(projectDir, 'package.json'), 'utf-8'),
    );
  } catch {
    // No package.json, or unreadable/malformed — nothing is declared.
    return [];
  }

  /** @type {Array<{name: string, field: string}>} */
  const declared = [];
  const seen = new Set();
  for (const field of DEPENDENCY_FIELDS) {
    const entry = pkg?.[field];
    if (entry == null || typeof entry !== 'object' || Array.isArray(entry)) {
      continue;
    }
    for (const name of Object.keys(entry)) {
      if (seen.has(name) || !isBarePackageName(name)) continue;
      seen.add(name);
      declared.push({name, field});
    }
  }
  return declared;
}

/**
 * Resolve an installed package's directory the way Node's resolver finds it:
 * the nearest `node_modules/<name>` walking up from `fromDir`.
 *
 * Walking up matters because hoisting is normal — yarn and npm workspaces lift
 * a workspace member's dependency to the repo root, so the app's own
 * node_modules can be empty of a package it genuinely declares.
 *
 * Presence is decided by the package's own package.json, not the directory, so
 * a stale empty directory is not mistaken for an install.
 *
 * @param {string} name bare package name
 * @param {string} fromDir directory to start walking up from
 * @returns {{packageDir: string, hostDir: string}|null} the resolved package
 *   directory and the directory whose node_modules holds it
 */
export function resolveInstalledPackageDir(name, fromDir) {
  if (!isBarePackageName(name)) return null;
  const segments = name.split('/');
  let dir = path.resolve(fromDir);
  for (let i = 0; i < 50; i++) {
    const packageDir = path.join(dir, 'node_modules', ...segments);
    if (fs.existsSync(path.join(packageDir, 'package.json'))) {
      return {packageDir, hostDir: dir};
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

/**
 * Resolve a path through symlinks for identity comparison. pnpm links every
 * dependency into node_modules from a single content-addressed store, so two
 * different dependency keys pointing at one package share a real path and
 * differ in every other way.
 * @param {string} target
 * @returns {string}
 */
function realPath(target) {
  try {
    return fs.realpathSync(target);
  } catch {
    return path.resolve(target);
  }
}

/**
 * Declared dependencies that ship an integration manifest and are not already
 * loaded, in declaration order.
 *
 * A candidate must have EXACTLY ONE root manifest. Zero is the ordinary case
 * (almost every dependency), and more than one is a packaging mistake the
 * loader treats as a hard error — an error the project did not ask for and
 * cannot fix, so an ambiguous package is passed over here rather than allowed
 * to fail the load of a project that merely depends on it.
 *
 * @param {string} projectDir directory holding the project's package.json
 * @param {{exclude?: Iterable<string>}} [options] `exclude` — package
 *   directories already loaded (from config); matched through symlinks
 * @returns {Array<{spec: string, field: string, packageDir: string, hostDir: string}>}
 */
export function findAutolinkCandidates(projectDir, {exclude = []} = {}) {
  const taken = new Set([...exclude].map(realPath));
  /** @type {Array<{spec: string, field: string, packageDir: string, hostDir: string}>} */
  const candidates = [];

  for (const {name, field} of readDeclaredDependencies(projectDir)) {
    const resolved = resolveInstalledPackageDir(name, projectDir);
    if (!resolved) continue;

    // Two dependency keys can name one installed package — an npm alias beside
    // the package it aliases, or the two spellings of a package mid-rename
    // resolving through one store entry. Load it once.
    const identity = realPath(resolved.packageDir);
    if (taken.has(identity)) continue;

    if (findManifestPaths(resolved.packageDir).length !== 1) continue;

    taken.add(identity);
    candidates.push({spec: name, field, ...resolved});
  }

  return candidates;
}

/**
 * Load every declared dependency that ships an integration manifest and is not
 * already loaded from config.
 *
 * Each candidate is loaded in isolation. A dependency the project never asked
 * to be an integration must not be able to take down `Project.load` for the
 * whole project, so a manifest that throws on import is dropped here with the
 * rest of that package's contributions — including the load-error marker
 * `loadIntegrations` returns for it. A CONFIGURED integration is the opposite
 * case: the project named it, so its failure is an issue the project owns and
 * can act on. An autolinked one is a dependency's own packaging bug, which the
 * consuming project can neither fix nor silence, and which
 * `astryx doctor integration validate <package>` reports on demand.
 *
 * @param {object} options
 * @param {string} options.projectDir directory holding the project's package.json
 * @param {import('./integrations.mjs').LoadedIntegration[]} [options.loaded]
 *   integrations already loaded from config; these win
 * @param {boolean} [options.fresh]
 * @returns {Promise<import('./integrations.mjs').LoadedIntegration[]>}
 */
export async function autolinkIntegrations({
  projectDir,
  loaded = [],
  fresh = false,
}) {
  const candidates = findAutolinkCandidates(projectDir, {
    exclude: loaded.map(integration => integration.__packageDir),
  });

  /** @type {import('./integrations.mjs').LoadedIntegration[]} */
  const autolinked = [];
  const names = new Set(loaded.map(integration => integration.name));

  for (const candidate of candidates) {
    /** @type {import('./integrations.mjs').LoadedIntegration|undefined} */
    let integration;
    try {
      // Resolve from the directory whose node_modules actually holds the
      // package, so a hoisted dependency resolves the same way Node found it.
      [integration] = await loadIntegrations([candidate.spec], {
        cwd: candidate.hostDir,
        fresh,
      });
    } catch {
      continue;
    }
    if (!integration || integration.__loadError) continue;
    // Identity is the resolved package's own name, so an alias and the package
    // it aliases collapse here even when they are two directories on disk.
    if (names.has(integration.name)) continue;
    names.add(integration.name);
    autolinked.push({
      ...integration,
      __autolinked: true,
      __dependencyField: candidate.field,
    });
  }

  return autolinked;
}
