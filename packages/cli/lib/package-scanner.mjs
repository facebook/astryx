// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Package scanner for config-based discovery
 */
import * as fs from 'node:fs';
import * as path from 'node:path';

/**
 * Doc suffixes recognized unless a caller opts into more. This is the
 * historical behavior and stays the default on purpose.
 */
export const DEFAULT_DOC_SUFFIXES = ['.doc.mjs'];

/**
 * Every conventional doc suffix — identical to INTEGRATION_DOC_SUFFIXES in
 * lib/component-discovery.mjs.
 *
 * Opt-in per call site, NOT the default. A caller that only needs to LOCATE a
 * component on disk (swizzle, which copies the files) can safely accept all
 * three. A caller that goes on to `import()` the doc (discover, via loadDocs)
 * must not: Node refuses to strip types from any `.ts` file under
 * node_modules, so surfacing a `.doc.ts` there converts a clean "not found"
 * into an ERR_INVALID_DOC load failure.
 */
export const ALL_DOC_SUFFIXES = ['.doc.ts', '.doc.mjs', '.doc.js'];

/**
 * A discovered documentation package (its package.json declares `astryx.docs`).
 * @typedef {object} ScannedPackage
 * @property {string} name
 * @property {string} [version]
 * @property {string} [description]
 * @property {string} [displayName]
 * @property {string} dir
 * @property {Record<string, any>} astryx
 * @property {string} category
 * @property {string} docsDir
 * @property {string[]} components
 */

/**
 * @typedef {object} ScanOptions
 * @property {string[]} [docSuffixes] doc suffixes to accept; defaults to
 *   {@link DEFAULT_DOC_SUFFIXES}. Pass {@link ALL_DOC_SUFFIXES} only when the
 *   doc file is located but never imported.
 */

/**
 * @param {string} scanDir
 * @param {ScanOptions} [options]
 * @returns {ScannedPackage[]}
 */
export function scanDirectory(scanDir, options = {}) {
  const {docSuffixes = DEFAULT_DOC_SUFFIXES} = options;
  if (!fs.existsSync(scanDir)) return [];
  const entries = fs.readdirSync(scanDir, {withFileTypes: true});
  /** @type {ScannedPackage[]} */
  const packages = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const pkgPath = path.join(scanDir, entry.name, 'package.json');
    if (!fs.existsSync(pkgPath)) continue;
    let pkg;
    try {
      pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    } catch {
      continue;
    }
    if (!pkg.astryx || !pkg.astryx.docs) continue;
    const pkgDir = path.join(scanDir, entry.name);
    const docsDir = path.resolve(pkgDir, pkg.astryx.docs);
    const components = discoverDocComponents(docsDir, docSuffixes);
    if (components.length === 0) continue;
    packages.push({
      name: pkg.name || entry.name,
      version: pkg.version,
      description: pkg.description,
      displayName: pkg.displayName,
      dir: pkgDir,
      astryx: pkg.astryx,
      category: pkg.astryx.category || pkg.name || entry.name,
      docsDir,
      components,
    });
  }
  return packages;
}

/**
 * @param {string[]} packageDirs
 * @param {ScannedPackage[]} [explicitPackages]
 * @param {ScanOptions} [options]
 * @returns {ScannedPackage[]}
 */
export function scanAllPackages(packageDirs, explicitPackages = [], options = {}) {
  const {docSuffixes = DEFAULT_DOC_SUFFIXES} = options;
  /** @type {ScannedPackage[]} */
  const all = [];
  const seen = new Set();

  for (const pkg of explicitPackages) {
    if (!pkg || seen.has(pkg.name)) continue;
    const components = discoverDocComponents(pkg.docsDir, docSuffixes);
    if (components.length === 0) continue;
    seen.add(pkg.name);
    all.push({...pkg, components});
  }

  for (const dir of packageDirs) {
    for (const pkg of scanDirectory(dir, {docSuffixes})) {
      if (seen.has(pkg.name)) continue;
      seen.add(pkg.name);
      all.push(pkg);
    }
  }
  return all;
}

/**
 * @param {string} docsDir
 * @param {string[]} [docSuffixes]
 * @returns {string[]}
 */
function discoverDocComponents(docsDir, docSuffixes = DEFAULT_DOC_SUFFIXES) {
  if (!fs.existsSync(docsDir)) return [];
  /** @type {string[]} */
  const components = [];
  /** @param {string} dir */
  function walk(dir) {
    /** @type {import('node:fs').Dirent[]} */
    let entries;
    try {
      entries = fs.readdirSync(dir, {withFileTypes: true});
    } catch {
      return;
    }
    for (const entry of entries) {
      if (entry.name === 'node_modules' || entry.name === '__tests__') continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
        continue;
      }
      const suffix = docSuffixes.find(s => entry.name.endsWith(s));
      if (suffix) components.push(entry.name.slice(0, -suffix.length));
    }
  }
  walk(docsDir);
  return components.sort();
}

/**
 * @param {ScannedPackage[]} packages
 * @param {string} name
 * @param {ScanOptions} [options]
 * @returns {{pkg: ScannedPackage, docPath: string, componentName: string} | null}
 */
export function findComponentInPackages(packages, name, options = {}) {
  const {docSuffixes = DEFAULT_DOC_SUFFIXES} = options;
  const lower = name.toLowerCase();
  for (const pkg of packages) {
    const match = pkg.components.find(c => c.toLowerCase() === lower);
    if (!match) continue;
    const docPath = findDocFile(pkg.docsDir, match, docSuffixes);
    if (docPath) return {pkg, docPath, componentName: match};
  }
  return null;
}

/**
 * @param {string} docsDir
 * @param {string} name
 * @param {string[]} [docSuffixes]
 * @returns {string | null}
 */
function findDocFile(docsDir, name, docSuffixes = DEFAULT_DOC_SUFFIXES) {
  const targets = docSuffixes.map(suffix => name + suffix);
  /**
   * @param {string} dir
   * @returns {string | null}
   */
  function walk(dir) {
    /** @type {import('node:fs').Dirent[]} */
    let entries;
    try {
      entries = fs.readdirSync(dir, {withFileTypes: true});
    } catch {
      return null;
    }
    for (const entry of entries) {
      if (entry.name === 'node_modules' || entry.name === '__tests__') continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        const f = walk(full);
        if (f) return f;
      } else if (targets.includes(entry.name)) return full;
    }
    return null;
  }
  return walk(docsDir);
}
