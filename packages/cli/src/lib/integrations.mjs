// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Integration manifest loading for Astryx config.
 *
 * Integrations are PACKAGE NAMES listed in astryx.config.{ts,mjs,js}. Each
 * package declares a single conventional root manifest sibling to its
 * package.json — astryx.integration.{ts,mjs,js} — which contributes
 * components/templates/codemods roots and an optional issuesUrl. Identity
 * (name, version) comes from the package's package.json, not the manifest.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {validateIntegration} from './config-schema.mjs';
import {importUserModule, findPresentFiles} from './module-loader.mjs';

/** Conventional manifest basenames, in load-precedence order. */
export const MANIFEST_BASENAMES = [
  'astryx.integration.ts',
  'astryx.integration.mjs',
  'astryx.integration.js',
];

/**
 * Return the conventional root manifest paths present in `dir`, in
 * load-precedence order. Unlike {@link resolveManifestPath} this never throws —
 * callers (e.g. validate-integration) decide how to treat zero / multiple.
 * @param {string} dir
 * @returns {string[]} absolute manifest paths
 */
export function findManifestPaths(dir) {
  return findPresentFiles(dir, MANIFEST_BASENAMES);
}

/**
 * Load a manifest module's exported object. `.ts` is loaded via jiti;
 * `.mjs`/`.js` via dynamic import. Exposed for validate-integration.
 * @param {string} file absolute manifest path
 * @returns {Promise<unknown>} the exported integration object (or module)
 */
export async function loadManifestObject(file) {
  const mod = await importUserModule(file);
  return mod.default ?? mod.integration ?? mod;
}

/**
 * Resolve the directory of an installed integration package from the consumer's
 * node_modules.
 * @param {string} packageName
 * @param {string} [cwd]
 */
export function resolvePackageDir(packageName, cwd = process.cwd()) {
  return path.resolve(cwd, 'node_modules', ...packageName.split('/'));
}

/**
 * Find the single conventional root manifest sibling of the package's
 * package.json. Multiple present is a hard error; missing is a hard error.
 * @param {string} packageDir
 * @param {string} spec
 * @returns {string} absolute manifest path
 */
function resolveManifestPath(packageDir, spec) {
  const present = findPresentFiles(packageDir, MANIFEST_BASENAMES);
  if (present.length === 0) {
    throw new Error(
      `Integration package "${spec}" has no conventional root manifest. Add one of: ${MANIFEST_BASENAMES.join(', ')} next to its package.json.`,
    );
  }
  if (present.length > 1) {
    throw new Error(
      `Integration package "${spec}" has multiple root manifests (${present
        .map(file => path.basename(file))
        .join(', ')}). Keep exactly one.`,
    );
  }
  return present[0];
}

/**
 * Load configured integrations.
 *
 * @param {string[]} [specs] package names
 * @param {{cwd?: string}} [options]
 */
export async function loadIntegrations(specs = [], {cwd = process.cwd()} = {}) {
  const integrations = [];
  const seen = new Set();

  for (const spec of specs) {
    if (!spec || seen.has(spec)) continue;
    seen.add(spec);

    const packageDir = resolvePackageDir(spec, cwd);
    const pkgPath = path.join(packageDir, 'package.json');
    let pkg;
    try {
      pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    } catch {
      throw new Error(
        `Could not find installed integration package "${spec}" at ${pkgPath}. Install it first.`,
      );
    }

    const manifestFile = resolveManifestPath(packageDir, spec);
    const mod = await importUserModule(manifestFile);
    const exported = mod.default ?? mod.integration ?? mod;
    if (!exported || typeof exported !== 'object') {
      throw new Error(`Integration ${spec} did not export an object.`);
    }
    const manifest = validateIntegration(exported, `Integration ${spec}`);

    const resolveRoot = value =>
      value == null ? undefined : path.resolve(packageDir, value);

    integrations.push({
      name: pkg.name ?? spec,
      version: pkg.version,
      components: resolveRoot(manifest.components),
      templates: resolveRoot(manifest.templates),
      codemods: resolveRoot(manifest.codemods),
      issuesUrl: manifest.issuesUrl,
      __spec: spec,
      __packageDir: packageDir,
      __manifestFile: manifestFile,
    });
  }

  return integrations;
}
