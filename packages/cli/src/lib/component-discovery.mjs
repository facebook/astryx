// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Component discovery — find, list, and resolve XDS components
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

const SKIP_DIRS = new Set(['hooks', 'utils', '__tests__', 'node_modules']);

// Matches the top-level `group: 'GroupName'` field in a .doc.mjs file.
// Only matches at shallow indentation (≤ 4 spaces from line start) to avoid
// picking up nested `group:` fields inside prop descriptions.
const GROUP_RE = /(?:^|\n) {0,4}group:\s*['"]([^'"]+)['"]/;
const HIDDEN_COMPONENTS_RE = /(?:^|\n) {0,4}hiddenComponents:\s*\[([^\]]*)\]/;
const HIDDEN_RE = /(?:^|\n) {0,4}hidden:\s*true/;

/**
 * Read the `group`, `hiddenComponents`, and `hidden` fields from a
 * component's .doc.mjs file (synchronous).
 */
function readDocMeta(docPath) {
  try {
    const content = fs.readFileSync(docPath, 'utf-8');
    const groupMatch = GROUP_RE.exec(content);
    const hiddenCompsMatch = HIDDEN_COMPONENTS_RE.exec(content);
    const hiddenSet = new Set();
    if (hiddenCompsMatch) {
      for (const m of hiddenCompsMatch[1].matchAll(/['"]([^'"]+)['"]/g)) {
        hiddenSet.add(m[1]);
      }
    }
    const hidden = HIDDEN_RE.test(content);
    return {
      group: groupMatch ? groupMatch[1] : null,
      hiddenComponents: hiddenSet,
      hidden,
    };
  } catch {
    return {group: null, hiddenComponents: new Set(), hidden: false};
  }
}

/**
 * Auto-discover components by scanning for XDS*.tsx files in core/src/.
 *
 * Returns an ordered Record where:
 * - Grouped components use the group name as key: `'Buttons': ['Button', 'IconButton']`
 * - Ungrouped components use their own name as key: `'Avatar': ['Avatar']`
 *
 * Keys are sorted alphabetically (groups and ungrouped components interleaved).
 * Components within each group are also sorted alphabetically.
 */
export function discoverComponents(coreDir) {
  const srcDir = path.join(coreDir, 'src');
  /** @type {Map<string, string|null>} componentName → group */
  const componentGroups = new Map();

  function collectXDSFiles(dirPath) {
    const results = [];
    if (!fs.existsSync(dirPath)) return results;
    const entries = fs.readdirSync(dirPath, {withFileTypes: true});
    for (const entry of entries) {
      if (entry.isDirectory()) {
        results.push(...collectXDSFiles(path.join(dirPath, entry.name)));
      } else if (
        /^XDS[A-Z]\w+\.tsx$/.test(entry.name) &&
        !entry.name.includes('.test.') &&
        !entry.name.includes('Context.')
      ) {
        results.push(entry.name);
      }
    }
    return results;
  }

  const topEntries = fs.readdirSync(srcDir, {withFileTypes: true});
  for (const entry of topEntries) {
    if (!entry.isDirectory() || SKIP_DIRS.has(entry.name)) continue;

    const dirPath = path.join(srcDir, entry.name);
    const xdsFiles = collectXDSFiles(dirPath);

    // Read the group from the directory's .doc.mjs file (if it exists)
    // Check both {Name}.doc.mjs and XDS{Name}.doc.mjs naming conventions
    let docFile = path.join(dirPath, `${entry.name}.doc.mjs`);
    if (!fs.existsSync(docFile)) {
      docFile = path.join(dirPath, `XDS${entry.name}.doc.mjs`);
    }
    const {group, hiddenComponents, hidden} = fs.existsSync(docFile)
      ? readDocMeta(docFile)
      : {group: null, hiddenComponents: new Set(), hidden: false};

    // Skip entire directory if the doc is marked hidden
    if (hidden) continue;

    for (const fileName of xdsFiles) {
      const componentName = fileName.replace(/^XDS/, '').replace(/\.tsx$/, '');
      if (hiddenComponents.has(componentName)) continue;

      // Check for a per-component doc file that overrides the directory group
      let compGroup = group;
      let compDoc = path.join(dirPath, `${componentName}.doc.mjs`);
      if (!fs.existsSync(compDoc)) {
        compDoc = path.join(dirPath, `XDS${componentName}.doc.mjs`);
      }
      const hasComponentDoc = fs.existsSync(compDoc);
      if (hasComponentDoc) {
        const compMeta = readDocMeta(compDoc);
        if (compMeta.group) compGroup = compMeta.group;
      }

      // Skip components without any .doc.mjs file (directory-level or
      // component-level). They can't be documented, so surfacing them in
      // the component list leads to broken docs-site links.
      if (!fs.existsSync(docFile) && !hasComponentDoc) continue;

      if (!componentGroups.has(componentName)) {
        componentGroups.set(componentName, compGroup);
      }
    }
  }

  // Build the result: group name → sorted members, or component name → [self]
  /** @type {Map<string, string[]>} */
  const groups = new Map();
  /** @type {string[]} ungrouped component names */
  const ungrouped = [];

  for (const [name, group] of componentGroups) {
    if (group) {
      if (!groups.has(group)) groups.set(group, []);
      groups.get(group).push(name);
    } else {
      ungrouped.push(name);
    }
  }

  // Sort members within each group
  for (const members of groups.values()) {
    members.sort();
  }

  // Merge groups and ungrouped into a single alphabetically-ordered record
  /** @type {Array<{key: string, values: string[]}>} */
  const entries = [];
  for (const [groupName, members] of groups) {
    entries.push({key: groupName, values: members});
  }
  for (const name of ungrouped) {
    entries.push({key: name, values: [name]});
  }
  entries.sort((a, b) => a.key.localeCompare(b.key));

  /** @type {Record<string, string[]>} */
  const ordered = {};
  for (const {key, values} of entries) {
    ordered[key] = values;
  }

  return ordered;
}

/**
 * Find the .doc.mjs file for a component.
 * For sub-components (e.g. StackItem), returns the parent's .doc.mjs
 * if the sub-component is documented there.
 */
export function findComponentReadme(coreDir, name) {
  const srcDir = path.join(coreDir, 'src');
  const exactDoc = `${name}.doc.mjs`;
  const xdsDoc = `XDS${name}.doc.mjs`;

  // Direct match: src/{name}/{Name}.doc.mjs or src/{name}/XDS{Name}.doc.mjs
  const direct = path.join(srcDir, name, exactDoc);
  if (fs.existsSync(direct)) return direct;
  const directXds = path.join(srcDir, name, xdsDoc);
  if (fs.existsSync(directXds)) return directXds;

  // Nested match: src/*/{name}/{Name}.doc.mjs or src/*/{name}/XDS{Name}.doc.mjs
  const entries = fs.readdirSync(srcDir, {withFileTypes: true});
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const nested = path.join(srcDir, entry.name, name, exactDoc);
    if (fs.existsSync(nested)) return nested;
    const nestedXds = path.join(srcDir, entry.name, name, xdsDoc);
    if (fs.existsSync(nestedXds)) return nestedXds;
  }

  // Per-component doc in a parent directory: src/*/{Name}.doc.mjs or src/*/XDS{Name}.doc.mjs
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const perComp = path.join(srcDir, entry.name, exactDoc);
    if (fs.existsSync(perComp)) return perComp;
    const perCompXds = path.join(srcDir, entry.name, xdsDoc);
    if (fs.existsSync(perCompXds)) return perCompXds;
  }

  // Sub-component fallback: find the source file, then walk up
  // looking for any .doc.mjs in the same or parent directories
  const sourcePath = findComponentSource(coreDir, name);
  if (sourcePath) {
    let dir = path.dirname(sourcePath);
    while (dir.startsWith(srcDir)) {
      const dirEntries = fs.readdirSync(dir);
      for (const f of dirEntries) {
        if (f.endsWith('.doc.mjs')) return path.join(dir, f);
      }
      dir = path.dirname(dir);
    }
  }

  return null;
}

/**
 * Find the main source file for a component (XDS*.tsx, excluding tests).
 * For "Button" finds src/Button/XDSButton.tsx
 * For "Layout" finds src/Layout/XDSLayout/XDSLayout.tsx
 * For "Card" finds src/Layout/Container/XDSCard.tsx (deep search fallback)
 */
export function findComponentSource(coreDir, name) {
  const srcDir = path.join(coreDir, 'src');
  const xdsName = `XDS${name}.tsx`;

  function searchDir(dirPath) {
    if (!fs.existsSync(dirPath)) return null;
    const entries = fs.readdirSync(dirPath, {withFileTypes: true});

    // Check for exact match first
    const exact = path.join(dirPath, xdsName);
    if (fs.existsSync(exact)) return exact;

    // Recurse into subdirectories
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const found = searchDir(path.join(dirPath, entry.name));
        if (found) return found;
      }
    }
    return null;
  }

  // Search in the component's directory
  const directDir = path.join(srcDir, name);
  if (fs.existsSync(directDir)) {
    const found = searchDir(directDir);
    if (found) return found;
  }

  // Search nested (component might be under a parent dir)
  const entries = fs.readdirSync(srcDir, {withFileTypes: true});
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const nestedDir = path.join(srcDir, entry.name, name);
    if (fs.existsSync(nestedDir)) {
      const found = searchDir(nestedDir);
      if (found) return found;
    }
  }

  // Fallback: search entire src tree for the file
  return searchDir(srcDir);
}

/**
 * Compute the Levenshtein (edit) distance between two strings.
 * Used for fuzzy-matching component names. Dependency-free.
 */
export function resolveImportPath(coreDir, componentName) {
  const srcDir = path.join(coreDir, 'src');
  const pkgPath = path.join(coreDir, 'package.json');
  const pkg = fs.existsSync(pkgPath)
    ? JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
    : null;

  // Priority 1: exact subpath export matching the component name (e.g. ./Heading)
  // This allows convenience re-export directories to win over the source directory.
  if (pkg?.exports?.[`./${componentName}`]) {
    return `@xds/core/${componentName}`;
  }

  const sourcePath = findComponentSource(coreDir, componentName);
  if (!sourcePath) return '@xds/core';

  // Priority 2: subpath export matching the top-level source directory
  const relToSrc = path.relative(srcDir, sourcePath);
  const topDir = relToSrc.split(path.sep)[0];

  if (pkg?.exports?.[`./${topDir}`]) {
    return `@xds/core/${topDir}`;
  }

  return '@xds/core';
}

// ── External package discovery ───────────────────────────────────────

/**
 * Discover components from an external package's docs directory.
 * Scans for *.doc.mjs files and returns their names as a flat array.
 *
 * @deprecated Use discoverExternalComponentsGrouped for group-aware discovery.
 */
export function discoverExternalComponents(docsDir) {
  if (!fs.existsSync(docsDir)) return [];
  const components = [];

  function scanDir(dirPath) {
    const entries = fs.readdirSync(dirPath, {withFileTypes: true});
    for (const entry of entries) {
      if (entry.name === 'node_modules' || entry.name === '__tests__') continue;
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        scanDir(fullPath);
      } else if (entry.name.endsWith('.doc.mjs')) {
        components.push(entry.name.replace('.doc.mjs', ''));
      }
    }
  }

  scanDir(docsDir);
  return components.sort();
}

/**
 * Discover components from an external package's docs directory,
 * reading `group:` fields from each .doc.mjs for subcategories.
 *
 * Returns a Record<string, string[]> matching the shape of discoverComponents():
 * - Grouped components: `{ 'App Chrome': ['AppShell', 'SideNav', 'TopNav'] }`
 * - Ungrouped components: `{ 'Diff': ['Diff'] }`
 */
export function discoverExternalComponentsGrouped(docsDir) {
  if (!fs.existsSync(docsDir)) return {};

  /** @type {Map<string, string|null>} componentName → group */
  const componentGroups = new Map();

  function scanDir(dirPath) {
    const entries = fs.readdirSync(dirPath, {withFileTypes: true});
    for (const entry of entries) {
      if (entry.name === 'node_modules' || entry.name === '__tests__') continue;
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        scanDir(fullPath);
      } else if (entry.name.endsWith('.doc.mjs')) {
        const name = entry.name.replace('.doc.mjs', '');
        const {group, hidden} = readDocMeta(fullPath);
        if (!hidden) {
          componentGroups.set(name, group);
        }
      }
    }
  }

  scanDir(docsDir);

  // Build grouped result (same algorithm as discoverComponents)
  /** @type {Map<string, string[]>} */
  const groups = new Map();
  /** @type {string[]} */
  const ungrouped = [];

  for (const [name, group] of componentGroups) {
    if (group) {
      if (!groups.has(group)) groups.set(group, []);
      groups.get(group).push(name);
    } else {
      ungrouped.push(name);
    }
  }

  for (const members of groups.values()) {
    members.sort();
  }

  /** @type {Array<{key: string, values: string[]}>} */
  const entries = [];
  for (const [groupName, members] of groups) {
    entries.push({key: groupName, values: members});
  }
  for (const name of ungrouped) {
    entries.push({key: name, values: [name]});
  }
  entries.sort((a, b) => a.key.localeCompare(b.key));

  /** @type {Record<string, string[]>} */
  const ordered = {};
  for (const {key, values} of entries) {
    ordered[key] = values;
  }

  return ordered;
}

/**
 * Find a component's doc file in an external package's docs directory.
 * Returns the path to {Name}.doc.mjs or null.
 */
export function findExternalComponentDoc(docsDir, name) {
  if (!fs.existsSync(docsDir)) return null;
  const target = `${name}.doc.mjs`;

  function scanDir(dirPath) {
    const entries = fs.readdirSync(dirPath, {withFileTypes: true});
    for (const entry of entries) {
      if (entry.name === 'node_modules' || entry.name === '__tests__') continue;
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        const found = scanDir(fullPath);
        if (found) return found;
      } else if (entry.name === target) {
        return fullPath;
      }
    }
    return null;
  }

  return scanDir(docsDir);
}

// ── Legacy markdown-parsing functions ────────────────────────────────
// These are kept for backward compatibility with existing tests.
// The CLI action handler uses the new format functions below instead.

/**
 * Minimal cleanup for full docs (default mode).
 * Strips SYNC comments, rewrites title, collapses blank lines.
 */