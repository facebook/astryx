// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Component discovery — find, list, and resolve Astryx components
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {existsCaseExact} from '../fs/paths.mjs';

import {discoverExternalPackages} from '../fs/paths.mjs';
import {cachedDirents, cachedExists, createFsCache} from '../fs/paths.mjs';

/**
 * Process-lifetime memo of filesystem listings per workspace root, so
 * resolving many names against one core costs roughly one directory walk
 * instead of one walk per name. Only the exact-resolver path below opts in;
 * every other finder keeps uncached behavior by default.
 * @type {Map<string, {exists: Map<string, boolean>, dirents: Map<string, import('node:fs').Dirent[]|null>}>}
 */
const fsCacheByCoreDir = new Map();

/**
 * @param {string} coreDir
 * @returns {{exists: Map<string, boolean>, dirents: Map<string, import('node:fs').Dirent[]|null>}}
 */
function fsCacheFor(coreDir) {
  let hit = fsCacheByCoreDir.get(coreDir);
  if (!hit) {
    hit = createFsCache();
    fsCacheByCoreDir.set(coreDir, hit);
  }
  return hit;
}

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
 * @param {{exists: Map<string, boolean>, dirents: Map<string, import('node:fs').Dirent[]|null>}|null} [fsCache] - Optional listing memo; callers resolving many names pass one to bound total work.
 * @returns {string | null}
 */
export function findComponentReadme(coreDir, name, fsCache = null) {
  const srcDir = path.join(coreDir, 'src');
  const exactDoc = `${name}.doc.mjs`;
  const xdsDoc = `XDS${name}.doc.mjs`;
  /** @type {(dir: string) => import('node:fs').Dirent[]} */
  const readEntries = dir =>
    fsCache
      ? (cachedDirents(fsCache, dir) ?? [])
      : fs.readdirSync(dir, {withFileTypes: true});
  /** @type {(dir: string) => string[]} */
  const readNames = dir =>
    fsCache
      ? (cachedDirents(fsCache, dir) ?? []).map(e => e.name)
      : fs.readdirSync(dir);

  // Direct match: src/{name}/{Name}.doc.mjs or src/{name}/Astryx{Name}.doc.mjs
  const direct = path.join(srcDir, name, exactDoc);
  if (existsCaseExact(direct, srcDir, fsCache)) return direct;
  const directXds = path.join(srcDir, name, xdsDoc);
  if (existsCaseExact(directXds, srcDir, fsCache)) return directXds;

  // Nested match: src/*/{name}/{Name}.doc.mjs or src/*/{name}/Astryx{Name}.doc.mjs
  const entries = readEntries(srcDir);
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const nested = path.join(srcDir, entry.name, name, exactDoc);
    if (existsCaseExact(nested, srcDir, fsCache)) return nested;
    const nestedXds = path.join(srcDir, entry.name, name, xdsDoc);
    if (existsCaseExact(nestedXds, srcDir, fsCache)) return nestedXds;
  }

  // Per-component doc in a parent directory: src/*/{Name}.doc.mjs or src/*/Astryx{Name}.doc.mjs
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const perComp = path.join(srcDir, entry.name, exactDoc);
    if (existsCaseExact(perComp, srcDir, fsCache)) return perComp;
    const perCompXds = path.join(srcDir, entry.name, xdsDoc);
    if (existsCaseExact(perCompXds, srcDir, fsCache)) return perCompXds;
  }

  // Sub-component fallback: find the source file, then walk up
  // looking for any .doc.mjs in the same or parent directories
  const sourcePath = findComponentSource(coreDir, name, fsCache);
  if (sourcePath) {
    let dir = path.dirname(sourcePath);
    while (dir.startsWith(srcDir)) {
      const dirEntries = readNames(dir);
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
 * @param {{exists: Map<string, boolean>, dirents: Map<string, import('node:fs').Dirent[]|null>}|null} [fsCache] - Optional listing memo; callers resolving many names pass one to bound total work.
 * @returns {string | null}
 */
export function findComponentSource(coreDir, name, fsCache = null) {
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
    const dirExists = fsCache ? cachedExists(fsCache, dirPath) : fs.existsSync(dirPath);
    if (!dirExists) return null;
    const cached = fsCache ? cachedDirents(fsCache, dirPath) : null;
    const entries = cached ?? fs.readdirSync(dirPath, {withFileTypes: true});

    // Check for an exact match (prefixed or bare) first
    for (const candidate of candidateFiles) {
      const exact = path.join(dirPath, candidate);
      if (existsCaseExact(exact, dirPath, fsCache)) return exact;
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
  if (existsCaseExact(directDir, srcDir, fsCache)) {
    const found = searchDir(directDir);
    if (found) return found;
  }

  // Search nested (component might be under a parent dir)
  const cachedSrc = fsCache ? cachedDirents(fsCache, srcDir) : null;
  const nestedEntries =
    cachedSrc ?? fs.readdirSync(srcDir, {withFileTypes: true});
  for (const entry of nestedEntries) {
    if (!entry.isDirectory()) continue;
    const nestedDir = path.join(srcDir, entry.name, name);
    if (existsCaseExact(nestedDir, srcDir, fsCache)) {
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

/**
 * Does a package's `exports` map publish this subpath?
 *
 * Node matches a subpath either by an exact key or by a PATTERN key holding a
 * single `*`, which stands for any (possibly empty) run of characters — so
 * `./*` publishes `./Carousel` just as surely as a literal `./Carousel` key
 * does. A key whose target is `null` blocks the subpath instead of publishing
 * it, and a package with no map at all publishes nothing by subpath.
 *
 * Exact-key-only matching is why this is a function rather than a lookup: it
 * reported the bare package for every wildcard package, which is a specifier
 * that need not resolve at all when the package has no `.` export.
 *
 * @param {Record<string, unknown>|null|undefined} exportsMap
 * @param {string} subpath e.g. `./Carousel`
 * @returns {boolean}
 */
function exportsPublish(exportsMap, subpath) {
  if (!exportsMap || typeof exportsMap !== 'object') return false;
  if (subpath in exportsMap) return exportsMap[subpath] != null;
  for (const [key, target] of Object.entries(exportsMap)) {
    const star = key.indexOf('*');
    if (star === -1) continue;
    // One `*` per key, per the spec; a second is not a pattern.
    if (key.indexOf('*', star + 1) !== -1) continue;
    const prefix = key.slice(0, star);
    const suffix = key.slice(star + 1);
    if (
      subpath.length >= prefix.length + suffix.length &&
      subpath.startsWith(prefix) &&
      subpath.endsWith(suffix)
    ) {
      return target != null;
    }
  }
  return false;
}

/**
 * Resolve the specifier an integration component is imported from, against the
 * owning package's `exports` map.
 *
 * A component lives in a directory that need not share its name — several
 * components can be exported from one entry point — so the specifier has to
 * come from the directory the doc file sits in, checked against `exports`,
 * rather than from the component name. Falls back to the package root when the
 * package does not publish that subpath, matching what a consumer would have
 * to write by hand.
 *
 * Lives here, beside {@link resolveImportPath}, because more than one surface
 * answers "where is this imported from" and they have to agree: `component`
 * reports it as ownership metadata and `search` reports it on every hit. When
 * each resolved it for itself the two disagreed, and an import specifier that
 * does not resolve is worse than no answer.
 *
 * `exportsMap` is the map `loadIntegrations` already parsed onto the loaded
 * integration, so the common path reads no manifest at all. `undefined` means
 * the caller has no parsed map — a record built by hand rather than by the
 * loader — and only then is the manifest read here. `null` means the loader
 * looked and the package has no `exports`, which is an answer, not a gap: it
 * must not trigger a read. Resolution that depended on every producer of a
 * record remembering to populate a field would degrade silently, and silently
 * is how this bug got here.
 *
 * @param {{exportsMap?: Record<string, unknown>|null, packageDir?: string, docPath?: string|null, packageName: string}} owner
 * @param {string} componentName
 * @returns {string}
 */
export function resolveIntegrationImportPath(owner, componentName) {
  const {exportsMap, packageDir, docPath, packageName} = owner;
  const map = exportsMap === undefined ? readPackageExports(packageDir) : exportsMap;
  const directory = docPath ? path.basename(path.dirname(docPath)) : componentName;
  return exportsPublish(map, `./${directory}`) ? `${packageName}/${directory}` : packageName;
}

/**
 * Read a package's `exports` map from disk. The fallback for a loaded-
 * integration record that carries no parsed map; {@link loadIntegrations}
 * populates one for every integration it loads.
 *
 * @param {string|undefined} packageDir
 * @returns {Record<string, unknown>|null}
 */
function readPackageExports(packageDir) {
  if (!packageDir) return null;
  try {
    const manifest = JSON.parse(
      fs.readFileSync(path.join(packageDir, 'package.json'), 'utf-8'),
    );
    return manifest.exports ?? null;
  } catch {
    // An unreadable or malformed manifest is not worth failing a lookup over.
    return null;
  }
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
 * @param {{exists: Map<string, boolean>, dirents: Map<string, import('node:fs').Dirent[]|null>}|null} [fsCache] - Optional listing memo; callers resolving many names pass one to bound total work.
 * @returns {string | null}
 */
export function findExternalComponentDoc(docsDir, name, fsCache = null) {
  const dirExists = fsCache
    ? cachedExists(fsCache, docsDir)
    : fs.existsSync(docsDir);
  if (!dirExists) return null;
  const target = `${name}.doc.mjs`;

  /**
   * @param {string} dirPath
   * @returns {string | null}
   */
  function scanDir(dirPath) {
    const cached = fsCache ? cachedDirents(fsCache, dirPath) : null;
    const entries = cached ?? fs.readdirSync(dirPath, {withFileTypes: true});
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
 * @param {{exists: Map<string, boolean>, dirents: Map<string, import('node:fs').Dirent[]|null>}|null} [fsCache] - Optional listing memo; callers resolving many names pass one to bound total work.
 * @returns {string|null}
 */
export function findIntegrationComponentDoc(integration, name, fsCache = null) {
  const componentsDir = integration?.components;
  if (!componentsDir) return null;
  const dirExists = fsCache
    ? cachedExists(fsCache, componentsDir)
    : fs.existsSync(componentsDir);
  if (!dirExists) return null;

  /**
   * @param {string} dirPath
   * @returns {string | null}
   */
  function scanDir(dirPath) {
    const cached = fsCache ? cachedDirents(fsCache, dirPath) : null;
    const entries = cached ?? fs.readdirSync(dirPath, {withFileTypes: true});
    // Exact same-stem match (precedence order) first in this dir.
    for (const suffix of INTEGRATION_DOC_SUFFIXES) {
      const candidate = path.join(dirPath, `${name}${suffix}`);
      const candidateExists = fsCache
        ? cachedExists(fsCache, candidate)
        : fs.existsSync(candidate);
      if (candidateExists) return candidate;
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
 * @param {{exists: Map<string, boolean>, dirents: Map<string, import('node:fs').Dirent[]|null>}|null} [fsCache] - Optional listing memo; callers resolving many names pass one to bound total work.
 * @returns {string|null}
 */
export function findIntegrationComponentSource(
  integration,
  name,
  fsCache = null,
) {
  const docPath = findIntegrationComponentDoc(integration, name, fsCache);
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
 * Build the set of owner packages that provide a component with this name
 * across core + every loaded integration. This is the one exact resolver
 * both `astryx component <Name>` (via the adapter) and the template
 * skeleton/show filter use: a core owner needs a resolving doc
 * (`findComponentReadme`, including the source-walk-up fallback), an
 * integration owner needs a same-stem doc. Zero owners falls through to the
 * back-compat external lookup in the caller; more than one owner is
 * ambiguous without an explicit `--package`.
 *
 * @param {string} coreDir
 * @param {string} dirName - bare component name (no `XDS` prefix)
 * @param {Array<{name: string, components?: string, issuesUrl?: string}>} loadedIntegrations
 * @param {{exists: Map<string, boolean>, dirents: Map<string, import('node:fs').Dirent[]|null>}|null} [fsCache] - Optional listing memo; callers resolving many names pass one to bound total work.
 * @returns {Array<{package: string, docPath: string, sourcePath: string|null, issuesUrl: string|undefined, integration: {name: string, components?: string, issuesUrl?: string}|null}>}
 */
export function resolveComponentOwners(
  coreDir,
  dirName,
  loadedIntegrations,
  fsCache = null,
) {
  const coreDocPath = findComponentReadme(coreDir, dirName, fsCache);
  /** @type {Array<{package: string, docPath: string, sourcePath: string|null, issuesUrl: string|undefined, integration: {name: string, components?: string, issuesUrl?: string}|null}>} */
  const owners = [];
  if (coreDocPath) {
    owners.push({
      package: CORE_PACKAGE,
      docPath: coreDocPath,
      sourcePath: findComponentSource(coreDir, dirName, fsCache),
      issuesUrl: undefined,
      integration: null,
    });
  }
  for (const integration of loadedIntegrations) {
    const docPath = findIntegrationComponentDoc(integration, dirName, fsCache);
    if (!docPath) continue;
    owners.push({
      package: integration.name,
      docPath,
      sourcePath: findIntegrationComponentSource(integration, dirName, fsCache),
      issuesUrl: integration.issuesUrl,
      integration,
    });
  }
  return owners;
}

/**
 * Whether a component name resolves through the component subsystem,
 * mirroring the exact (non-fuzzy) path of `astryx component <Name>`: exactly
 * one owner (core doc, loaded integration doc, or back-compat external doc;
 * several owners without `--package` is the ambiguity error, so such names
 * are not advertised).
 *
 * This is the predicate the template layer filters skeleton/show
 * `components` lists against, one selected-template name at a time, so a
 * cold `template --show/--skeleton` never imports all 202 core docs the way
 * a whole-index build does (#4677). Pure filesystem checks (no doc
 * imports); results are memoized per workspace for in-process repeats, and
 * listings are memoized per workspace so one lookup costs roughly one
 * directory walk no matter how many names it checks.
 *
 * @param {string} name component name (the `XDS` prefix is stripped, as in `astryx component`)
 * @param {{coreDir: string, loadedIntegrations?: Array<{name: string, components?: string, issuesUrl?: string}>, cwd?: string}} ctx resolution context; `cwd` is only used for back-compat externals
 * @returns {boolean} true iff the name resolves exactly and unambiguously
 */
export function isResolvableComponentName(
  name,
  {coreDir, loadedIntegrations = [], cwd = process.cwd()},
) {
  const dirName = name.replace(/^XDS/, '');
  // Keyed by owner roots, not just package names: one process can query two
  // projects whose same-named integrations — or legacy externals found from
  // different cwds — resolve from different roots.
  const memoKey = [
    coreDir,
    dirName,
    loadedIntegrations
      .map(i => `${i.name}:${i.components ?? ''}`)
      .sort()
      .join(','),
    externalPackagesFor(cwd)
      .map(e => `${e.name}:${e.docsDir}`)
      .sort()
      .join(','),
  ].join('|');
  const cached = resolvableNameCache.get(memoKey);
  if (cached !== undefined) return cached;
  const fsCache = fsCacheFor(coreDir);
  const owners = resolveComponentOwners(
    coreDir,
    dirName,
    loadedIntegrations,
    fsCache,
  );
  let resolvable = owners.length === 1;
  if (!resolvable && owners.length === 0) {
    const externalPkgs = externalPackagesFor(cwd).filter(
      ext => !loadedIntegrations.some(i => i.name === ext.name),
    );
    for (const ext of externalPkgs) {
      if (findExternalComponentDoc(ext.docsDir, dirName, fsCache)) {
        resolvable = true;
        break;
      }
    }
  }
  resolvableNameCache.set(memoKey, resolvable);
  return resolvable;
}

/** @type {Map<string, boolean>} per-workspace exact-resolution cache */
const resolvableNameCache = new Map();

/** @type {Map<string, Array<{name: string, category: string, docsDir: string, blocksDir: string|null}>>} back-compat external packages per workspace */
const externalPackagesCache = new Map();

/**
 * @param {string} cwd
 * @returns {Array<{name: string, category: string, docsDir: string, blocksDir: string|null}>}
 */
function externalPackagesFor(cwd) {
  let hit = externalPackagesCache.get(cwd);
  if (!hit) {
    hit = discoverExternalPackages(cwd);
    externalPackagesCache.set(cwd, hit);
  }
  return hit;
}

// ── Legacy markdown-parsing functions ────────────────────────────────
// These are kept for backward compatibility with existing tests.
// The CLI action handler uses the new format functions below instead.

/**
 * Minimal cleanup for full docs (default mode).
 * Strips SYNC comments, rewrites title, collapses blank lines.
 */