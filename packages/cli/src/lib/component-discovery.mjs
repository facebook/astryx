/**
 * @file Component discovery — find, list, and resolve XDS components
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

const DIR_TO_CATEGORY = {
  // Layout
  AspectRatio: 'Layout',
  Center: 'Layout',
  CollapsibleGroup: 'Layout',
  Grid: 'Layout',
  Layout: 'Layout',
  Stack: 'Layout',
  // Display
  Avatar: 'Display',
  Badge: 'Display',
  Divider: 'Display',
  Icon: 'Display',
  Skeleton: 'Display',
  Table: 'Display',
  Text: 'Display',
  // Form
  CheckboxInput: 'Form',
  DateInput: 'Form',
  Field: 'Form',
  NumberInput: 'Form',
  RadioList: 'Form',
  Selector: 'Form',
  Slider: 'Form',
  Switch: 'Form',
  TextArea: 'Form',
  TextInput: 'Form',
  TimeInput: 'Form',
  // Action
  Button: 'Action',
  CloseButton: 'Action',
  DropdownMenu: 'Action',
  Link: 'Action',
  // Navigation
  TabList: 'Navigation',
  TopNav: 'Navigation',
  // Overlay
  Calendar: 'Overlay',
  Dialog: 'Overlay',
  Layer: 'Overlay',
};

const CATEGORY_ORDER = ['Layout', 'Display', 'Form', 'Action', 'Navigation', 'Overlay'];
const SKIP_DIRS = new Set(['theme', 'hooks', 'utils', '__tests__', 'node_modules']);

/**
 * Auto-discover components by scanning for XDS*.tsx files in core/src/.
 * Groups them by category using the DIR_TO_CATEGORY mapping.
 */
export function discoverComponents(coreDir) {
  const srcDir = path.join(coreDir, 'src');
  const categories = {};

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

    const category = DIR_TO_CATEGORY[entry.name] || 'Other';
    const xdsFiles = collectXDSFiles(path.join(srcDir, entry.name));

    for (const fileName of xdsFiles) {
      const componentName = fileName.replace(/^XDS/, '').replace(/\.tsx$/, '');
      if (!categories[category]) categories[category] = [];
      if (!categories[category].includes(componentName)) {
        categories[category].push(componentName);
      }
    }
  }

  // Sort components within each category
  for (const cat of Object.keys(categories)) {
    categories[cat].sort();
  }

  // Return in defined order
  const ordered = {};
  for (const cat of CATEGORY_ORDER) {
    if (categories[cat]) ordered[cat] = categories[cat];
  }
  // Append any categories not in CATEGORY_ORDER (e.g. "Other")
  for (const cat of Object.keys(categories)) {
    if (!ordered[cat]) ordered[cat] = categories[cat];
  }

  return ordered;
}

/**
 * Merge a TranslationDoc overlay onto a base ComponentDoc.
 * Replaces prose fields (description, features, notes, accessibility, keyboard,
 * prop descriptions) while keeping structure (props, examples, types, defaults).
 */
export function findComponentReadme(coreDir, name) {
  const srcDir = path.join(coreDir, 'src');
  // Preferred: {Name}.doc.mjs, then README.md
  const docNames = [`${name}.doc.mjs`, 'README.md'];

  for (const docName of docNames) {
    // Direct match: src/{name}/{Name}.doc.mjs (or README.md)
    const direct = path.join(srcDir, name, docName);
    if (fs.existsSync(direct)) return direct;
  }

  // Nested match: src/*/{name}/{Name}.doc.mjs (or README.md)
  const entries = fs.readdirSync(srcDir, {withFileTypes: true});
  for (const docName of docNames) {
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const nested = path.join(srcDir, entry.name, name, docName);
      if (fs.existsSync(nested)) return nested;
    }
  }

  // Fallback: find the directory containing XDS{name}.tsx,
  // then return the doc file in that directory or nearest parent
  const sourcePath = findComponentSource(coreDir, name);
  if (sourcePath) {
    let dir = path.dirname(sourcePath);
    while (dir.startsWith(srcDir)) {
      for (const docName of docNames) {
        const docFile = path.join(dir, docName);
        if (fs.existsSync(docFile)) return docFile;
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
  const sourcePath = findComponentSource(coreDir, componentName);
  if (!sourcePath) return '@xds/core';

  // Get the top-level directory under src/ from the source path
  const relToSrc = path.relative(srcDir, sourcePath);
  const topDir = relToSrc.split(path.sep)[0];

  // Check package.json exports for ./${topDir}
  const pkgPath = path.join(coreDir, 'package.json');
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    if (pkg.exports && pkg.exports[`./${topDir}`]) {
      return `@xds/core/${topDir}`;
    }
  }

  return '@xds/core';
}

// ── External package discovery ───────────────────────────────────────

/**
 * Discover components from an external package's docs directory.
 * Scans for *.doc.mjs files and returns their names.
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