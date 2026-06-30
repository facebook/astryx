// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Integration codemod discovery.
 *
 * Integrations may declare a `codemods` directory in their manifest. The
 * directory layout is version-folder-first:
 *
 *   <codemodsRoot>/<version>/<id>.<ext>
 *
 * where `<version>` is the immediate folder name (e.g. "0.2.0") and `<id>` is
 * the codemod module's relative path under that version folder WITHOUT its
 * extension (kebab-case; may include nested segments like "config/rename").
 * Each module DEFAULT-EXPORTS a `createCodemod` / `createConfigCodemod`
 * result.
 *
 * Version selection mirrors the core registry's getTransformsBetween(from,to):
 * a codemod under folder X runs when upgrading to include X.
 *
 * Strictness: any broken discovery (bad/missing default export, schema
 * invalid, duplicate id) is a hard error so the upgrade fails loudly rather
 * than silently skipping migrations.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {pathToFileURL} from 'node:url';
import {createJiti} from 'jiti';
import {semverCompare} from '../utils/semver.mjs';

/** File extensions recognized as codemod modules. */
const CODEMOD_EXTENSIONS = ['.ts', '.mjs', '.js'];

let jitiInstance;
function getJiti() {
  if (!jitiInstance) {
    jitiInstance = createJiti(import.meta.url);
  }
  return jitiInstance;
}

/**
 * Import a codemod module. `.ts` is loaded via jiti; `.mjs`/`.js` via dynamic
 * import.
 * @param {string} file
 */
async function importCodemodModule(file) {
  if (file.endsWith('.ts')) {
    return await getJiti().import(file);
  }
  return await import(pathToFileURL(file).href);
}

/**
 * Recursively collect codemod module files under a version folder. Returns
 * entries of {id, file} where id is the extension-less relative path
 * (POSIX-style) under `versionDir`.
 * @param {string} versionDir
 * @returns {Array<{id: string, file: string}>}
 */
function collectCodemodFiles(versionDir) {
  const out = [];

  /** @param {string} dir */
  function walk(dir) {
    const entries = fs.readdirSync(dir, {withFileTypes: true});
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === 'node_modules' || entry.name === '.git') continue;
        walk(full);
        continue;
      }
      const ext = path.extname(entry.name);
      if (!CODEMOD_EXTENSIONS.includes(ext)) continue;
      const rel = path.relative(versionDir, full);
      const id = rel.slice(0, rel.length - ext.length).split(path.sep).join('/');
      out.push({id, file: full});
    }
  }

  walk(versionDir);
  return out.sort((a, b) => a.id.localeCompare(b.id));
}

/**
 * Validate that a module's default export is a createCodemod/
 * createConfigCodemod result.
 * @param {unknown} mod
 * @param {string} label
 * @returns {import('../types/codemod').AstryxCodemod | import('../types/codemod').AstryxConfigCodemod}
 */
function validateCodemodExport(mod, label) {
  const exported = mod?.default;
  if (!exported || typeof exported !== 'object') {
    throw new Error(
      `${label} must default-export a createCodemod/createConfigCodemod result.`,
    );
  }
  if (exported.type !== 'code' && exported.type !== 'config') {
    throw new Error(
      `${label} default export is not a valid codemod (expected createCodemod or createConfigCodemod result).`,
    );
  }
  if (typeof exported.title !== 'string' || exported.title.length === 0) {
    throw new Error(`${label} codemod is missing a title.`);
  }
  if (typeof exported.transform !== 'function') {
    throw new Error(`${label} codemod is missing a transform function.`);
  }
  return exported;
}

/**
 * Discover file-based codemods contributed by configured integrations.
 *
 * @param {Array<{name?: string, codemods?: string, __spec?: string}>} loadedIntegrations
 * @returns {Promise<Map<string, Array<{id: string, type: 'code'|'config', codemod: object, package: string}>>>}
 *   Map keyed by version string; each value is the list of discovered codemods
 *   for that version (across all integrations).
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

    const versionFolders = fs
      .readdirSync(root, {withFileTypes: true})
      .filter(entry => entry.isDirectory())
      .map(entry => entry.name);

    // Track ids seen ACROSS versions within this package — duplicate id across
    // versions within a package is a hard error (locked decision).
    /** @type {Map<string, string>} id -> version */
    const idToVersion = new Map();

    for (const version of versionFolders) {
      const versionDir = path.join(root, version);
      const files = collectCodemodFiles(versionDir);

      // Track ids within this package+version to catch same-version dupes.
      const seenInVersion = new Set();

      for (const {id, file} of files) {
        const label = `Integration "${pkgLabel}" codemod ${version}/${id} (${file})`;

        if (seenInVersion.has(id)) {
          throw new Error(
            `Integration "${pkgLabel}" has a duplicate codemod id "${id}" within version ${version}.`,
          );
        }
        seenInVersion.add(id);

        const priorVersion = idToVersion.get(id);
        if (priorVersion != null && priorVersion !== version) {
          throw new Error(
            `Integration "${pkgLabel}" reuses codemod id "${id}" across versions ${priorVersion} and ${version}. Codemod ids must be unique within a package.`,
          );
        }
        idToVersion.set(id, version);

        const mod = await importCodemodModule(file);
        const codemod = validateCodemodExport(mod, label);

        const entry = {
          id,
          type: codemod.type,
          codemod,
          package: pkgLabel,
        };
        const list = byVersion.get(version);
        if (list) {
          list.push(entry);
        } else {
          byVersion.set(version, [entry]);
        }
      }
    }
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
