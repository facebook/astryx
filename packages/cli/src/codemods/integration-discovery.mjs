// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Integration codemod discovery.
 *
 * Integrations may declare a `codemods` directory in their manifest. The
 * directory layout is FLAT:
 *
 *   <codemodsRoot>/<id>.<ext>
 *
 * where `<id>` is the module's filename WITHOUT its extension (kebab-case) and
 * the codemod's target `version` is declared inside the module definition (not
 * derived from a folder name). Each module DEFAULT-EXPORTS a codemod envelope —
 * typically a `createCodemod` / `createConfigCodemod` result, though any plain
 * object matching {@link CodemodEnvelopeSchema} is accepted. Validation happens
 * here at the load boundary via `loadModuleWithSchema`, not in the factories.
 *
 * Version selection mirrors the core registry's getTransformsBetween(from,to):
 * a codemod declaring version X runs when upgrading to include X.
 *
 * Ordering: cross-version ordering is implicit from semver. WITHIN a version,
 * codemods are topologically sorted by their `runBefore`/`runAfter` (intra-
 * version, same-package) declarations; codemods with no constraints fall back
 * to alphabetical id order for determinism. A cycle is a hard error.
 *
 * Strictness: any broken discovery (bad/missing default export, schema
 * invalid, ordering cycle) is a hard error so the upgrade fails loudly rather
 * than silently skipping migrations. Duplicate ids within a package are now
 * structurally impossible (a flat filesystem cannot hold two files with the
 * same name), so there is no dup-id check.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {loadModuleWithSchema} from '../lib/module-loader.mjs';
import {CodemodEnvelopeSchema} from '../codemod.mjs';
import {semverCompare} from '../utils/semver.mjs';

/** File extensions recognized as codemod modules. */
const CODEMOD_EXTENSIONS = ['.ts', '.mjs', '.js'];

/**
 * Collect codemod module files directly under a flat codemods root (no
 * recursion). Returns entries of {id, file} where id is the extension-less
 * filename, sorted alphabetically by id.
 * @param {string} root
 * @returns {Array<{id: string, file: string}>}
 */
function collectCodemodFiles(root) {
  const out = [];
  const entries = fs.readdirSync(root, {withFileTypes: true});
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    const ext = path.extname(entry.name);
    if (!CODEMOD_EXTENSIONS.includes(ext)) continue;
    const id = entry.name.slice(0, entry.name.length - ext.length);
    out.push({id, file: path.join(root, entry.name)});
  }
  return out.sort((a, b) => a.id.localeCompare(b.id));
}

/**
 * Topologically sort a version group's codemods by intra-version
 * `runBefore`/`runAfter` constraints. Ties (no constraint between two
 * codemods) resolve alphabetically by id for determinism. Throws on a cycle.
 *
 * @param {Array<{id: string, codemod: object, package: string}>} entries
 * @param {string} version
 * @returns {Array<object>} entries in run order
 */
function topoSort(entries, version) {
  // Start alphabetical so the deterministic fallback is stable.
  const sorted = [...entries].sort((a, b) => a.id.localeCompare(b.id));

  // Node keys are package-scoped so two packages contributing the same id to
  // the same version never collide. runBefore/runAfter reference ids WITHIN
  // the referencing codemod's own package.
  const keyOf = e => `${e.package}\u0000${e.id}`;
  const byKey = new Map(sorted.map(e => [keyOf(e), e]));

  /** @type {Map<string, Set<string>>} key -> keys that must come after it */
  const successors = new Map(sorted.map(e => [keyOf(e), new Set()]));

  const addEdge = (beforeKey, afterKey, source) => {
    // Ignore references to ids not present in this package+version group.
    // runBefore/runAfter are intra-version, intra-package only; a dangling
    // reference is a no-op (the referenced codemod is elsewhere or absent).
    if (!byKey.has(beforeKey) || !byKey.has(afterKey)) return;
    if (beforeKey === afterKey) {
      throw new Error(
        `Integration "${source.package}" codemod "${source.id}" (v${version}) references itself in runBefore/runAfter.`,
      );
    }
    successors.get(beforeKey).add(afterKey);
  };

  for (const entry of sorted) {
    const {runBefore, runAfter} = entry.codemod;
    const self = keyOf(entry);
    for (const after of runBefore ?? []) {
      addEdge(self, `${entry.package}\u0000${after}`, entry);
    }
    for (const before of runAfter ?? []) {
      addEdge(`${entry.package}\u0000${before}`, self, entry);
    }
  }

  // Kahn's algorithm, breaking ties by the alphabetical order established
  // above (iterate `sorted`, pick the first ready node each round).
  const indegree = new Map(sorted.map(e => [keyOf(e), 0]));
  for (const [, afters] of successors) {
    for (const after of afters) indegree.set(after, indegree.get(after) + 1);
  }

  const result = [];
  const remaining = new Set(sorted.map(keyOf));
  while (remaining.size > 0) {
    // First alphabetically-ordered node with indegree 0.
    const readyKey = sorted
      .map(keyOf)
      .find(k => remaining.has(k) && indegree.get(k) === 0);
    if (readyKey == null) {
      const cyclic = [...remaining]
        .map(k => byKey.get(k).id)
        .sort()
        .join(', ');
      throw new Error(
        `Integration "${sorted[0].package}" has a cyclic runBefore/runAfter ordering among v${version} codemods: ${cyclic}.`,
      );
    }
    remaining.delete(readyKey);
    result.push(byKey.get(readyKey));
    for (const after of successors.get(readyKey)) {
      indegree.set(after, indegree.get(after) - 1);
    }
  }

  return result;
}

/**
 * Discover file-based codemods contributed by configured integrations.
 *
 * @param {Array<{name?: string, codemods?: string, __spec?: string}>} loadedIntegrations
 * @returns {Promise<Map<string, Array<{id: string, type: 'code'|'config', codemod: object, package: string}>>>}
 *   Map keyed by version string; each value is the run-ordered list of
 *   discovered codemods for that version (across all integrations).
 */
export async function discoverIntegrationCodemods(loadedIntegrations = []) {
  /** @type {Map<string, Array<{id: string, type: string, codemod: object, package: string}>>} */
  const byVersion = new Map();

  for (const integration of loadedIntegrations ?? []) {
    const root = integration?.codemods;
    if (!root) continue;

    const pkgLabel = integration.name ?? integration.__spec ?? 'integration';

    if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) {
      throw new Error(
        `Integration "${pkgLabel}" declares a codemods directory that does not exist: ${root}`,
      );
    }

    const files = collectCodemodFiles(root);

    for (const {id, file} of files) {
      const label = `Integration "${pkgLabel}" codemod ${id} (${file})`;

      const codemod = await loadModuleWithSchema(file, CodemodEnvelopeSchema, {
        label,
      });

      const entry = {
        id,
        type: codemod.type,
        codemod,
        package: pkgLabel,
        version: codemod.version,
      };
      const list = byVersion.get(codemod.version);
      if (list) {
        list.push(entry);
      } else {
        byVersion.set(codemod.version, [entry]);
      }
    }
  }

  // Intra-version topological ordering (per version, across integrations).
  for (const [version, entries] of byVersion) {
    byVersion.set(version, topoSort(entries, version));
  }

  return byVersion;
}

/**
 * Select discovered integration codemods that apply when upgrading from
 * `from` (exclusive) to `to` (inclusive), ordered ascending by version.
 *
 * @param {Map<string, Array<object>>} byVersion
 * @param {string} from
 * @param {string} to
 * @returns {Array<{version: string, codemods: Array<object>}>}
 */
export function selectIntegrationCodemods(byVersion, from, to) {
  const versions = [...byVersion.keys()].sort(semverCompare);
  const results = [];
  for (const version of versions) {
    if (semverCompare(version, from) > 0 && semverCompare(version, to) <= 0) {
      results.push({version, codemods: byVersion.get(version)});
    }
  }
  return results;
}
