// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Package scanner for config-based discovery
 */
import * as fs from 'node:fs';
import * as path from 'node:path';

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
 * @param {string} scanDir
 * @returns {ScannedPackage[]}
 */
export function scanDirectory(scanDir) {
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
    // `astryx.docs` is third-party-controlled (a dependency's package.json).
    // A truthy non-string (number/array) would slip past `!pkg.astryx.docs`
    // and crash path.resolve with a raw TypeError, taking down the whole scan.
    // Skip it — discovery must degrade, not crash.
    if (!pkg.astryx || typeof pkg.astryx.docs !== 'string') continue;
    const pkgDir = path.join(scanDir, entry.name);
    const docsDir = path.resolve(pkgDir, pkg.astryx.docs);
    // Defense-in-depth: a dependency's docs dir must stay inside its own
    // package (a `docs: "../../x"` shouldn't let the scanner walk arbitrary
    // sibling dirs). Skip an escaping entry rather than surfacing foreign docs.
    const pkgDirWithSep = pkgDir.endsWith(path.sep) ? pkgDir : pkgDir + path.sep;
    if (docsDir !== pkgDir && !docsDir.startsWith(pkgDirWithSep)) continue;
    const components = discoverDocComponents(docsDir);
    if (components.length === 0) continue;
    packages.push({
      name: String(pkg.name || entry.name),
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
 * @returns {ScannedPackage[]}
 */
export function scanAllPackages(packageDirs, explicitPackages = []) {
  /** @type {ScannedPackage[]} */
  const all = [];
  const seen = new Set();

  for (const pkg of explicitPackages) {
    if (!pkg || seen.has(pkg.name)) continue;
    const components = discoverDocComponents(pkg.docsDir);
    if (components.length === 0) continue;
    seen.add(pkg.name);
    all.push({...pkg, components});
  }

  for (const dir of packageDirs) {
    for (const pkg of scanDirectory(dir)) {
      if (seen.has(pkg.name)) continue;
      seen.add(pkg.name);
      all.push(pkg);
    }
  }
  return all;
}

/**
 * @param {string} docsDir
 * @returns {string[]}
 */
function discoverDocComponents(docsDir) {
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
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith('.doc.mjs'))
        components.push(entry.name.replace('.doc.mjs', ''));
    }
  }
  walk(docsDir);
  return components.sort();
}

/**
 * @param {ScannedPackage[]} packages
 * @param {string} name
 * @returns {{pkg: ScannedPackage, docPath: string, componentName: string} | null}
 */
export function findComponentInPackages(packages, name) {
  const lower = name.toLowerCase();
  for (const pkg of packages) {
    const match = pkg.components.find(c => c.toLowerCase() === lower);
    if (!match) continue;
    const docPath = findDocFile(pkg.docsDir, match);
    if (docPath) return {pkg, docPath, componentName: match};
  }
  return null;
}

/**
 * @param {string} docsDir
 * @param {string} name
 * @returns {string | null}
 */
function findDocFile(docsDir, name) {
  const target = name + '.doc.mjs';
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
      } else if (entry.name === target) return full;
    }
    return null;
  }
  return walk(docsDir);
}
