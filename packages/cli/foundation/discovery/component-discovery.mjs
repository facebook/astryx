// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Component discovery — find, list, and resolve Astryx components
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {existsCaseExact} from '../fs/paths.mjs';

import {discoverExternalPackages, findCoreDir} from '../fs/paths.mjs';
import {loadDocs} from './component-loader.mjs';

const SKIP_DIRS = new Set(['hooks', 'utils', '__tests__', 'node_modules']);

/** The owner package name for built-in (core) components. */
export const CORE_PACKAGE = '@astryxdesign/core';

/** Conventional doc-file suffixes for integration components (same-stem). */
const INTEGRATION_DOC_SUFFIXES = ['.doc.ts', '.doc.mjs', '.doc.js'];

// Component source files are named `XDS{Name}.tsx` today. The XDS-prefix
// migration (P2380608025, P4) renames them to the bare `{Name}.tsx` form, so
// discovery must recognize BOTH. The `XDS` prefix has historically doubled as
// a "this is a top-level component" marker, so naively matching all PascalCase
// `.tsx` files would surface internal helpers that happen to be PascalCase
// (`OverlayScrim.tsx`, `PowerSearchEditPopover.tsx`, ...). To avoid that
// regression, a BARE-named file is only treated as a component when a matching
// doc file exists for it (`{Name}.doc.mjs` or `XDS{Name}.doc.mjs` in the same
// directory). Prefixed `XDS{Name}.tsx` files keep their existing behavior.
const PREFIXED_COMPONENT_FILE_RE = /^XDS[A-Z]\w+\.tsx$/;
const BARE_COMPONENT_FILE_RE = /^[A-Z]\w+\.tsx$/;

/**
 * Whether a filename looks like a component source file, excluding tests,
 * Context files, and (implicitly, via the uppercase-first match) `use*` hooks.
 *
 * Recognizes both the current `XDSButton.tsx` form and the post-migration
 * bare `Button.tsx` form. Bare matches additionally require a sibling doc file
 * so internal PascalCase helpers are not misclassified as components.
 *
 * @param {string} fileName
 * @param {string} dirPath — directory containing the file (for the bare-name doc check)
 * @returns {boolean}
 */
function isComponentSourceFile(fileName, dirPath) {
  if (fileName.includes('.test.') || fileName.includes('Context.')) {
    return false;
  }
  if (PREFIXED_COMPONENT_FILE_RE.test(fileName)) {
    return true;
  }
  if (BARE_COMPONENT_FILE_RE.test(fileName)) {
    const base = fileName.replace(/\.tsx$/, '');
    return (
      fs.existsSync(path.join(dirPath, `${base}.doc.mjs`)) ||
      fs.existsSync(path.join(dirPath, `XDS${base}.doc.mjs`))
    );
  }
  return false;
}

/**
 * Strip the optional `XDS` prefix and `.tsx` suffix to get the bare component
 * name. Works for both `XDSButton.tsx` and `Button.tsx`.
 *
 * @param {string} fileName
 * @returns {string}
 */
function componentNameFromFile(fileName) {
  return fileName.replace(/^XDS/, '').replace(/\.tsx$/, '');
}

// Matches the top-level `group: 'GroupName'` field in a .doc.mjs file.
// Only matches at ≤2 spaces (top-level object fields). Deeper indentation is a
// nested field — e.g. a `group:` entry inside a `propDescriptions:` block of a
// docsZh/docsDense translation export — which must NOT be read as the
// component's group (that leaked a translated prop description as a group key).
const GROUP_RE = /(?:^|\n) {0,2}group:\s*['"]([^'"]+)['"]/;
const HIDDEN_COMPONENTS_RE = /(?:^|\n) {0,2}hiddenComponents:\s*\[([^\]]*)\]/;
const HIDDEN_RE = /(?:^|\n) {0,2}hidden:\s*true/;

/**
 * Read the `group`, `hiddenComponents`, and `hidden` fields from a
 * component's .doc.mjs file (synchronous).
 * @param {string} docPath
 * @returns {{group: string | null, hiddenComponents: Set<string>, hidden: boolean}}
 */
function readDocMeta(docPath) {
  try {
    const content = fs.readFileSync(docPath, 'utf-8');
    const groupMatch = GROUP_RE.exec(content);
    const hiddenCompsMatch = HIDDEN_COMPONENTS_RE.exec(content);
    /** @type {Set<string>} */
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
 * Auto-discover components by scanning for Astryx*.tsx files in core/src/.
 *
 * Returns an ordered Record where:
 * - Grouped components use the group name as key: `'Buttons': ['Button', 'IconButton']`
 * - Ungrouped components use their own name as key: `'Avatar': ['Avatar']`
 *
 * Keys are sorted alphabetically (groups and ungrouped components interleaved).
 * Components within each group are also sorted alphabetically.
 * @param {string} coreDir
 * @returns {Record<string, string[]>}
 */
export function discoverComponents(coreDir) {
  const srcDir = path.join(coreDir, 'src');
  /** @type {Map<string, string|null>} componentName → group */
  const componentGroups = new Map();

  /**
   * @param {string} dirPath
   * @returns {string[]}
   */
  function collectXDSFiles(dirPath) {
    /** @type {string[]} */
    const results = [];
    if (!fs.existsSync(dirPath)) return results;
    const entries = fs.readdirSync(dirPath, {withFileTypes: true});
    for (const entry of entries) {
      if (entry.isDirectory()) {
        results.push(...collectXDSFiles(path.join(dirPath, entry.name)));
      } else if (isComponentSourceFile(entry.name, dirPath)) {
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
    // Check both {Name}.doc.mjs and Astryx{Name}.doc.mjs naming conventions
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
      const componentName = componentNameFromFile(fileName);
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
      groups.get(group)?.push(name);
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
 * @param {string} coreDir
 * @param {string} name
 * @returns {string | null}
 */
export function findComponentReadme(coreDir, name) {
  const srcDir = path.join(coreDir, 'src');
  const exactDoc = `${name}.doc.mjs`;
  const xdsDoc = `XDS${name}.doc.mjs`;

  // Direct match: src/{name}/{Name}.doc.mjs or src/{name}/Astryx{Name}.doc.mjs
  const direct = path.join(srcDir, name, exactDoc);
  if (existsCaseExact(direct, srcDir)) return direct;
  const directXds = path.join(srcDir, name, xdsDoc);
  if (existsCaseExact(directXds, srcDir)) return directXds;

  // Nested match: src/*/{name}/{Name}.doc.mjs or src/*/{name}/Astryx{Name}.doc.mjs
  const entries = fs.readdirSync(srcDir, {withFileTypes: true});
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const nested = path.join(srcDir, entry.name, name, exactDoc);
    if (existsCaseExact(nested, srcDir)) return nested;
    const nestedXds = path.join(srcDir, entry.name, name, xdsDoc);
    if (existsCaseExact(nestedXds, srcDir)) return nestedXds;
  }

  // Per-component doc in a parent directory: src/*/{Name}.doc.mjs or src/*/Astryx{Name}.doc.mjs
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const perComp = path.join(srcDir, entry.name, exactDoc);
    if (existsCaseExact(perComp, srcDir)) return perComp;
    const perCompXds = path.join(srcDir, entry.name, xdsDoc);
    if (existsCaseExact(perCompXds, srcDir)) return perCompXds;
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
 * Find the main source file for a component (Astryx*.tsx, excluding tests).
 * For "Button" finds src/Button/XDSButton.tsx
 * For "Layout" finds src/Layout/XDSLayout/XDSLayout.tsx
 * For "Card" finds src/Layout/Container/XDSCard.tsx (deep search fallback)
 *
 * Hooks and other functions are authored as `.ts` (e.g. `useMediaQuery.ts`,
 * `useResizable.ts`), so `.ts` candidates are searched alongside `.tsx`. Without
 * this, deriving the import path for a `.ts`-authored function falls back to the
 * bare `@astryxdesign/core` root instead of its tree-shakeable subpath.
 * @param {string} coreDir
 * @param {string} name
 * @returns {string | null}
 */
export function findComponentSource(coreDir, name) {
  const srcDir = path.join(coreDir, 'src');
  // Try the prefixed forms (`XDSButton.tsx`) first since that is the current
  // on-disk convention, then the bare forms (`Button.tsx`) that the Astryx-prefix
  // migration (P4) renames to. `.tsx` before `.ts` within each so a component's
  // `.tsx` wins over a same-named `.ts` helper; `.ts` covers hooks/functions.
  const candidateFiles = [
    `XDS${name}.tsx`,
    `${name}.tsx`,
    `XDS${name}.ts`,
    `${name}.ts`,
  ];

  /**
   * @param {string} dirPath
   * @returns {string | null}
   */
  function searchDir(dirPath) {
    if (!fs.existsSync(dirPath)) return null;
    const entries = fs.readdirSync(dirPath, {withFileTypes: true});

    // Check for an exact match (prefixed or bare) first
    for (const candidate of candidateFiles) {
      const exact = path.join(dirPath, candidate);
      if (existsCaseExact(exact, dirPath)) return exact;
    }

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
  if (existsCaseExact(directDir, srcDir)) {
    const found = searchDir(directDir);
    if (found) return found;
  }

  // Search nested (component might be under a parent dir)
  const entries = fs.readdirSync(srcDir, {withFileTypes: true});
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const nestedDir = path.join(srcDir, entry.name, name);
    if (existsCaseExact(nestedDir, srcDir)) {
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
 * @param {string} coreDir
 * @param {string} componentName
 * @returns {string}
 */
export function resolveImportPath(coreDir, componentName) {
  const srcDir = path.join(coreDir, 'src');
  const pkgPath = path.join(coreDir, 'package.json');
  const pkg = fs.existsSync(pkgPath)
    ? JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
    : null;

  const exportKeys = Object.keys(pkg?.exports || {});

  // Priority 1: exact subpath export matching the component name (e.g. ./Heading)
  // This allows convenience re-export directories to win over the source directory.
  const exactMatch = exportKeys.find(k => k.toLowerCase() === `./${componentName}`.toLowerCase());
  if (exactMatch) {
    return `@astryxdesign/core/${exactMatch.slice(2)}`;
  }

  const sourcePath = findComponentSource(coreDir, componentName);
  if (!sourcePath) return '@astryxdesign/core';

  // Priority 2: subpath export matching the top-level source directory
  const relToSrc = path.relative(srcDir, sourcePath);
  const topDir = relToSrc.split(path.sep)[0];

  const topMatch = exportKeys.find(k => k.toLowerCase() === `./${topDir}`.toLowerCase());
  if (topMatch) {
    return `@astryxdesign/core/${topMatch.slice(2)}`;
  }

  return '@astryxdesign/core';
}

// ── External package discovery ───────────────────────────────────────

/**
 * Discover components from an external package's docs directory,
 * reading `group:` fields from each .doc.mjs for subcategories.
 *
 * Returns a Record<string, string[]> matching the shape of discoverComponents():
 * - Grouped components: `{ 'App Chrome': ['AppShell', 'SideNav', 'TopNav'] }`
 * - Ungrouped components: `{ 'Diff': ['Diff'] }`
 * @param {string} docsDir
 * @returns {Record<string, string[]>}
 */
export function discoverExternalComponentsGrouped(docsDir) {
  if (!fs.existsSync(docsDir)) return {};

  /** @type {Map<string, string|null>} componentName → group */
  const componentGroups = new Map();

  /** @param {string} dirPath */
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
      groups.get(group)?.push(name);
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
 * @param {string} docsDir
 * @param {string} name
 * @returns {string | null}
 */
export function findExternalComponentDoc(docsDir, name) {
  if (!fs.existsSync(docsDir)) return null;
  const target = `${name}.doc.mjs`;

  /**
   * @param {string} dirPath
   * @returns {string | null}
   */
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

// ── Integration component discovery (ownership-aware) ────────────────
//
// Integration packages contribute a `components` root (resolved absolute path
// in `loadedIntegrations`, see lib/integrations.mjs). Each component uses a
// same-stem source/doc convention — e.g. `MetaAppShell.tsx` next to
// `MetaAppShell.doc.{ts,mjs,js}`. The doc file is authoritative for discovery;
// the sibling `.tsx` (if present) is the swizzleable source.
//
// Each discovered component is recorded with its OWNER package (the
// integration's package name) and the owner's `issuesUrl` so downstream
// commands — and the future integration-component swizzle — can disambiguate
// by package and route source/issues correctly.

/**
 * Given an integration component doc path, return the sibling component source
 * (`{Name}.tsx`) if one exists, else null.
 *
 * @param {string} docPath absolute path to a `{Name}.doc.{ts,mjs,js}` file
 * @returns {string|null}
 */
function integrationSourceForDoc(docPath) {
  const dir = path.dirname(docPath);
  const base = path.basename(docPath).replace(/\.doc\.(ts|mjs|js)$/, '');
  const candidate = path.join(dir, `${base}.tsx`);
  return fs.existsSync(candidate) ? candidate : null;
}

/**
 * Discover ownership records for the components contributed by a single loaded
 * integration. Scans the integration's resolved `components` dir for same-stem
 * doc files and records each with owner package + issuesUrl + sourcePath.
 *
 * @param {{name: string, components?: string, issuesUrl?: string}} integration
 *   a single entry from `loadedIntegrations` (lib/integrations.mjs)
 * @returns {Array<{name: string, package: string, docPath: string, sourcePath: string|null, issuesUrl: string|undefined, group: string|null}>}
 */
export function discoverIntegrationComponents(integration) {
  const componentsDir = integration?.components;
  if (!componentsDir || !fs.existsSync(componentsDir)) return [];

  /** @type {Map<string, {name: string, package: string, docPath: string, sourcePath: string|null, issuesUrl: string|undefined, group: string|null}>} */
  const byName = new Map();

  /** @param {string} dirPath */
  function scanDir(dirPath) {
    const entries = fs.readdirSync(dirPath, {withFileTypes: true});
    for (const entry of entries) {
      if (entry.name === 'node_modules' || entry.name === '__tests__') continue;
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        scanDir(fullPath);
        continue;
      }
      const suffix = INTEGRATION_DOC_SUFFIXES.find(s => entry.name.endsWith(s));
      if (!suffix) continue;
      const name = entry.name.slice(0, -suffix.length);
      const {group, hidden} = readDocMeta(fullPath);
      if (hidden) continue;
      // First doc wins per name (precedence matches INTEGRATION_DOC_SUFFIXES).
      if (byName.has(name)) continue;
      byName.set(name, {
        name,
        package: integration.name,
        docPath: fullPath,
        sourcePath: integrationSourceForDoc(fullPath),
        issuesUrl: integration.issuesUrl,
        group: group ?? null,
      });
    }
  }

  scanDir(componentsDir);
  return [...byName.values()];
}

/**
 * Find an integration component's doc file by name within a loaded
 * integration's resolved `components` dir. Honors the same-stem convention
 * (`{Name}.doc.{ts,mjs,js}`), preferring `.ts` → `.mjs` → `.js`.
 *
 * @param {{components?: string}} integration
 * @param {string} name bare component name (no `XDS`/`Astryx` prefix)
 * @returns {string|null}
 */
export function findIntegrationComponentDoc(integration, name) {
  const componentsDir = integration?.components;
  if (!componentsDir || !fs.existsSync(componentsDir)) return null;

  /**
   * @param {string} dirPath
   * @returns {string | null}
   */
  function scanDir(dirPath) {
    const entries = fs.readdirSync(dirPath, {withFileTypes: true});
    // Exact same-stem match (precedence order) first in this dir.
    for (const suffix of INTEGRATION_DOC_SUFFIXES) {
      const candidate = path.join(dirPath, `${name}${suffix}`);
      if (fs.existsSync(candidate)) return candidate;
    }
    for (const entry of entries) {
      if (entry.name === 'node_modules' || entry.name === '__tests__') continue;
      if (entry.isDirectory()) {
        const found = scanDir(path.join(dirPath, entry.name));
        if (found) return found;
      }
    }
    return null;
  }

  return scanDir(componentsDir);
}

/**
 * Find an integration component's swizzleable source file (`{Name}.tsx`) by
 * name within a loaded integration's resolved `components` dir. Returns null
 * when the integration ships docs without source.
 *
 * @param {{components?: string}} integration
 * @param {string} name bare component name
 * @returns {string|null}
 */
export function findIntegrationComponentSource(integration, name) {
  const docPath = findIntegrationComponentDoc(integration, name);
  if (!docPath) return null;
  return integrationSourceForDoc(docPath);
}

/**
 * Build a flat list of ownership records for ALL discoverable components —
 * core (built-in) plus every loaded integration. This is the authoritative
 * source for package-aware listing and disambiguation.
 *
 * Core records carry `package: '@astryxdesign/core'`, `issuesUrl: undefined`
 * (the default core issues URL), and the resolved `.tsx` source via
 * findComponentSource(). Integration records carry their owner package name,
 * the manifest `issuesUrl`, and the same-stem `.tsx` source if present.
 *
 * @param {string} coreDir
 * @param {Array<{name: string, components?: string, issuesUrl?: string}>} [loadedIntegrations]
 * @returns {Array<{name: string, package: string, group: string|null, docPath: string|null, sourcePath: string|null, issuesUrl: string|undefined}>}
 */
export function discoverOwnedComponents(coreDir, loadedIntegrations = []) {
  /** @type {Array<{name: string, package: string, group: string|null, docPath: string|null, sourcePath: string|null, issuesUrl: string|undefined}>} */
  const records = [];

  // Core components — derive group from discoverComponents (grouped record).
  const grouped = discoverComponents(coreDir);
  /** @type {Map<string, string|null>} name → group */
  const coreGroup = new Map();
  for (const [key, members] of Object.entries(grouped)) {
    const isUngrouped = members.length === 1 && members[0] === key;
    for (const name of members) {
      coreGroup.set(name, isUngrouped ? null : key);
    }
  }
  for (const [name, group] of coreGroup) {
    records.push({
      name,
      package: CORE_PACKAGE,
      group,
      docPath: findComponentReadme(coreDir, name),
      sourcePath: findComponentSource(coreDir, name),
      issuesUrl: undefined,
    });
  }

  // Integration components.
  for (const integration of loadedIntegrations) {
    for (const rec of discoverIntegrationComponents(integration)) {
      records.push(rec);
    }
  }

  return records;
}

/**
 * Build the exact set of component names resolvable through the component
 * subsystem, mirroring `astryx component <Name>` resolution.
 *
 * This is the single source of truth the template layer filters skeleton
 * `components` lists against. It is exact by construction (no regex over
 * source, no fuzzy prefix matching), so every advertised name satisfies
 * "query every proposed component before importing" (#4677):
 *
 * - every core component whose doc resolves (discoverComponents);
 * - every component owned by a loaded integration whose doc resolves;
 * - every back-compat external-package component whose doc resolves
 *   (`astryx component` falls back to pkg.astryx.docs);
 * - every PARENT-DOC subcomponent referenced by a component doc's
 *   `components:` object array (resolveScope -> scopeSubComponent). Those are
 *   read from the docs themselves, never scraped from template source, so
 *   object-array subcomponents (`{name: 'HStack'}`) are retained while
 *   undocumented exports stay out.
 *
 * @param {string} cwd directory inside the Astryx app (tree-walked to core)
 * @param {Array<{name: string, components?: string}>} [loadedIntegrations]
 *   integration records already loaded by the caller. Loaded here would pull
 *   the config layer up into discovery (cycle: project -> template-adapter ->
 *   discovery), so the caller hands them in. `template`/`skeleton`/`show`
 *   load them exactly like `astryx component` does.
 * @returns {Promise<Set<string>|null>} exact resolvable names; `null` when no
 *   core package is present (callers already degrade to unfiltered output).
 */
export async function listResolvableComponentNames(
  cwd = process.cwd(),
  loadedIntegrations = [],
) {
  const coreDir = findCoreDir(cwd);
  if (!coreDir) return null;

  // Back-compat external packages (pkg.astryx.docs). Skip packages that are
  // already loaded as integrations; their components are resolved above.
  const externalPkgs = discoverExternalPackages(cwd).filter(
    ext => !loadedIntegrations.some(i => i.name === ext.name),
  );

  // The index depends only on these inputs; memoize so repeated template
  // commands in the same process pay the (comparatively heavy) doc-loading
  // pass once per workspace.
  const memoKey = [
    coreDir,
    loadedIntegrations.map(i => i.name).sort().join(','),
    externalPkgs.map(e => e.name).sort().join(','),
  ].join('|');
  if (resolvableNamesCache.has(memoKey)) return resolvableNamesCache.get(memoKey) ?? null;

  const names = new Set();
  /** @type {Set<string>} component docs to scan for parent-doc subcomponents */
  const docPaths = new Set();

  // Core + loaded-integration components with a resolvable doc.
  // Walk *.doc.mjs files directly (not via discoverOwnedComponents/discoverComponents
  // which require a paired Foo.tsx). This covers parent-doc subcomponents like
  // ResizeHandle (documented inside Resizable.doc.mjs) and doc-only components
  // like SyntaxTheme (theme/SyntaxTheme.doc.mjs) that have no Foo.tsx.
  /** @type {string[]} */
  const coreDocFiles = [];
  /** @param {string} dir */
  function collectCoreDocFiles(dir) {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (SKIP_DIRS.has(entry.name)) continue;
        collectCoreDocFiles(full);
      } else if (entry.name.endsWith('.doc.mjs') || entry.name.endsWith('.doc.ts') || entry.name.endsWith('.doc.js')) {
        coreDocFiles.push(full);
      }
    }
  }
  collectCoreDocFiles(path.join(coreDir, 'src'));
  const coreDocResults = await Promise.allSettled(
    coreDocFiles.map(async p => {
      const doc = await loadDocs(p);
      return {doc, path: p};
    }),
  );
  for (const r of coreDocResults) {
    if (r.status !== 'rejected' && r.value) {
      const {doc, path} = r.value;
      if (doc.name) names.add(doc.name.replace(/^XDS/, ''));
      docPaths.add(path);
      if (Array.isArray(doc.components)) {
        for (const sub of doc.components) {
          const subName = sub && typeof sub.name === 'string' ? sub.name : null;
          if (subName) names.add(subName.replace(/^XDS/, ''));
        }
      }
    }
  }
  // Also include source-fallback resolvable names (those with a source file
  // but no doc, e.g. AppShell/AppShellMobileContext.tsx). astryx component
  // resolves these via findComponentSource even without a doc, so the
  // skeleton list must include them to satisfy #4677.
  /** @type {string[]} */
  const sourceFiles = [];
  /** @param {string} dir */
  function collectSourceFiles(dir) {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (SKIP_DIRS.has(entry.name)) continue;
        collectSourceFiles(full);
      } else if (isComponentSourceFile(entry.name, dir)) {
        sourceFiles.push(full);
      }
    }
  }
  collectSourceFiles(path.join(coreDir, 'src'));
  for (const file of sourceFiles) {
    const name = componentNameFromFile(path.basename(file));
    if (name) names.add(name.replace(/^XDS/, ''));
  }
  // Also include any docPaths from discoverOwnedComponents for loaded integrations
  // that are not under core/src (kept for back-compat, though the walk above
  // already covers core).
  for (const rec of discoverOwnedComponents(coreDir, loadedIntegrations)) {
    if (rec.docPath) docPaths.add(rec.docPath);
  }

  for (const ext of externalPkgs) {
    const grouped = discoverExternalComponentsGrouped(ext.docsDir);
    for (const members of Object.values(grouped)) {
      for (const name of members) {
        const docPath = findExternalComponentDoc(ext.docsDir, name);
        if (docPath) {
          names.add(name);
          docPaths.add(docPath);
        }
      }
    }
  }

  // Parent-doc subcomponents: each `components:` entry resolves through the
  // parent doc, so it is an exact resolvable name. Load docs through the
  // canonical loader (same path `astryx component` uses), never regex. Only
  // docs that author a `components:` key can contribute here, so the source
  // is cheaply pre-filtered (the regex is a boolean gate; the OLD registry
  // parsed subcomponent VALUES with a regex, which is what shredded
  // object-array entries; the values here come from loadDocs).
  const parentDocs = [];
  for (const docPath of docPaths) {
    try {
      if (/\bcomponents\s*:/.test(fs.readFileSync(docPath, 'utf-8'))) {
        parentDocs.push(docPath);
      }
    } catch {
      // Unreadable doc: keep the parent's own name, skip its subcomponents.
    }
  }
  const poolSize = 16;
  for (let i = 0; i < parentDocs.length; i += poolSize) {
    const chunkDocs = await Promise.allSettled(
      parentDocs.slice(i, i + poolSize).map(docPath => loadDocs(docPath)),
    );
    for (const r of chunkDocs) {
      if (r.status === 'rejected' || !r.value || !Array.isArray(r.value.components)) {
        continue;
      }
      for (const sub of r.value.components) {
        const subName = sub && typeof sub.name === 'string' ? sub.name : null;
        if (subName) names.add(subName.replace(/^XDS/, ''));
      }
    }
  }

  resolvableNamesCache.set(memoKey, names);
  return names;
}

/** @type {Map<string, Set<string>>} per-workspace index cache */
const resolvableNamesCache = new Map();

// ── Legacy markdown-parsing functions ────────────────────────────────
// These are kept for backward compatibility with existing tests.
// The CLI action handler uses the new format functions below instead.

/**
 * Minimal cleanup for full docs (default mode).
 * Strips SYNC comments, rewrites title, collapses blank lines.
 */