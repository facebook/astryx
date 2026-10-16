// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Component discovery — find, list, and resolve Astryx components
 */

import * as fs from 'node:fs';
import {createRequire} from 'node:module';
import * as path from 'node:path';
import {listDir, listDirEntries, pathExists} from '../fs/listing-cache.mjs';
import {existsCaseExact} from '../fs/paths.mjs';
import {CORE_PROVIDER_ID} from '../identity/providers.mjs';
import {loadComponentDoc} from './component-loader.mjs';

const require = createRequire(import.meta.url);

const SKIP_DIRS = new Set(['hooks', 'utils', '__tests__', 'node_modules']);

/** The owner package name for built-in (core) components. */
export const CORE_PACKAGE = CORE_PROVIDER_ID;

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
      pathExists(path.join(dirPath, `${base}.doc.mjs`)) ||
      pathExists(path.join(dirPath, `XDS${base}.doc.mjs`))
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

/** @type {typeof import('@babel/parser') | undefined} */
let babelParser;

/**
 * A property of an object literal, by its plain key.
 * @param {any} object - an ObjectExpression node
 * @param {string} key
 * @returns {any}
 */
function propertyValue(object, key) {
  for (const property of object.properties) {
    if (property.type !== 'ObjectProperty' || property.computed) continue;
    const name =
      property.key.type === 'Identifier'
        ? property.key.name
        : property.key.type === 'StringLiteral'
          ? property.key.value
          : null;
    if (name === key) return property.value;
  }
  return null;
}

/**
 * The names a component doc lists as `components` members, read from its
 * source without running it. Only a static `{name: '<Name>'}` entry in the doc
 * object the loader reads (the `default` export, else `docs`) counts: a name in
 * prose, an example, or `relatedComponents` is not a member.
 * @param {string} source - the doc file's text
 * @returns {string[]}
 */
function docMemberNames(source) {
  /** @type {any} */
  let ast;
  try {
    babelParser ??= require('@babel/parser');
    ast = /** @type {typeof import('@babel/parser')} */ (babelParser).parse(source, {
      sourceType: 'module',
    });
  } catch {
    return [];
  }
  /** @type {Map<string, any>} */
  const constants = new Map();
  let defaultExport = null;
  let docsExport = null;
  for (const node of ast.program.body) {
    const declaration =
      node.type === 'ExportNamedDeclaration' ? node.declaration : node;
    if (declaration?.type === 'VariableDeclaration') {
      for (const declarator of declaration.declarations) {
        if (declarator.id.type !== 'Identifier' || !declarator.init) continue;
        constants.set(declarator.id.name, declarator.init);
        if (node.type === 'ExportNamedDeclaration' && declarator.id.name === 'docs') {
          docsExport = declarator.init;
        }
      }
    }
    if (node.type === 'ExportDefaultDeclaration') defaultExport = node.declaration;
  }
  let doc = defaultExport ?? docsExport;
  if (doc?.type === 'Identifier') doc = constants.get(doc.name);
  if (doc?.type !== 'ObjectExpression') return [];
  const members = propertyValue(doc, 'components');
  if (members?.type !== 'ArrayExpression') return [];
  return members.elements.flatMap((/** @type {any} */ element) => {
    if (element?.type !== 'ObjectExpression') return [];
    const name = propertyValue(element, 'name');
    return name?.type === 'StringLiteral' ? [name.value] : [];
  });
}

/**
 * Whether `name` has its own component folder in Core: `src/<Name>/<Name>.tsx`
 * (or the `XDS`-prefixed form).
 * @param {string} srcDir
 * @param {string} name
 * @returns {boolean}
 */
function hasOwnFolder(srcDir, name) {
  return [`${name}.tsx`, `XDS${name}.tsx`].some(file =>
    existsCaseExact(path.join(srcDir, name, file), srcDir),
  );
}

/**
 * Member names read in this process, by doc path, reused while the file keeps
 * its size and mtime.
 * @type {Map<string, {size: number, mtimeMs: number, members: string[]}>}
 */
const memberReads = new Map();

/**
 * The names a doc lists as `components` members (see docMemberNames).
 * @param {string} docPath
 * @returns {string[]}
 */
function readDocMembers(docPath) {
  let stat;
  try {
    stat = fs.statSync(docPath);
  } catch {
    return [];
  }
  const cached = memberReads.get(docPath);
  if (cached && cached.size === stat.size && cached.mtimeMs === stat.mtimeMs) {
    return cached.members;
  }
  /** @type {string[]} */
  let members;
  try {
    members = docMemberNames(fs.readFileSync(docPath, 'utf-8'));
  } catch {
    members = [];
  }
  memberReads.set(docPath, {size: stat.size, mtimeMs: stat.mtimeMs, members});
  return members;
}

// A sibling component folder named by a relative import or re-export.
const SIBLING_IMPORT_RE =
  /(?:\bfrom|\bimport\s*\()\s*['"]\.\.\/([A-Za-z0-9_-]+)(?:\/[^'"]*)?['"]/g;

/**
 * The Core doc that documents `name` as one of its `components` members: the
 * doc of a component it builds on. HStack and VStack import Stack, and Stack's
 * doc lists them, so each has its own folder and import path but no doc of its
 * own. Only the folders the component's own source imports from are read.
 * @param {string} srcDir
 * @param {string} name
 * @returns {string | null}
 */
function findFamilyDoc(srcDir, name) {
  const sourcePath = [`${name}.tsx`, `XDS${name}.tsx`]
    .map(file => path.join(srcDir, name, file))
    .find(file => existsCaseExact(file, srcDir));
  if (!sourcePath) return null;
  let source;
  try {
    source = fs.readFileSync(sourcePath, 'utf-8');
  } catch {
    return null;
  }
  const families = [
    ...new Set([...source.matchAll(SIBLING_IMPORT_RE)].map(match => match[1])),
  ]
    .filter(dir => dir !== name && !SKIP_DIRS.has(dir))
    .sort();
  for (const dir of families) {
    const dirPath = path.join(srcDir, dir);
    if (!existsCaseExact(dirPath, srcDir)) continue;
    for (const file of [...listDir(dirPath)].sort()) {
      if (!file.endsWith('.doc.mjs')) continue;
      const docPath = path.join(dirPath, file);
      const members = readDocMembers(docPath);
      if (members.includes(name) || members.includes(`XDS${name}`)) {
        return docPath;
      }
    }
  }
  return null;
}

/**
 * The entry a family doc gives `name` in its `components`, when the doc is not
 * the component's own (Stack's doc for VStack); null otherwise.
 * @param {any} docs - a loaded component doc
 * @param {string} name - bare component name
 * @returns {any}
 */
export function familyMember(docs, name) {
  if (!docs || docs.name === name || docs.name === `XDS${name}`) return null;
  const members = Array.isArray(docs.components) ? docs.components : [];
  return (
    members.find(
      (/** @type {any} */ member) =>
        member?.name === name || member?.name === `XDS${name}`,
    ) ?? null
  );
}

/**
 * Auto-discover components by scanning for Astryx*.tsx files in core/src/.
 * A component is listed when a doc documents it: a doc in its folder, or, for a
 * component folder with no doc of its own, the doc `findComponentReadme` finds
 * elsewhere (Heading's doc in the Text folder; HStack and VStack as members of
 * Stack's doc).
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
    if (!pathExists(dirPath)) return results;
    const entries = listDirEntries(dirPath);
    for (const entry of entries) {
      if (entry.isDirectory()) {
        results.push(...collectXDSFiles(path.join(dirPath, entry.name)));
      } else if (isComponentSourceFile(entry.name, dirPath)) {
        results.push(entry.name);
      }
    }
    return results;
  }

  const topEntries = listDirEntries(srcDir);
  for (const entry of topEntries) {
    if (!entry.isDirectory() || SKIP_DIRS.has(entry.name)) continue;

    const dirPath = path.join(srcDir, entry.name);
    const xdsFiles = collectXDSFiles(dirPath);

    // Read the group from the directory's .doc.mjs file (if it exists)
    // Check both {Name}.doc.mjs and Astryx{Name}.doc.mjs naming conventions
    let docFile = path.join(dirPath, `${entry.name}.doc.mjs`);
    if (!pathExists(docFile)) {
      docFile = path.join(dirPath, `XDS${entry.name}.doc.mjs`);
    }
    const {group, hiddenComponents, hidden} = pathExists(docFile)
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
      if (!pathExists(compDoc)) {
        compDoc = path.join(dirPath, `XDS${componentName}.doc.mjs`);
      }
      const hasComponentDoc = pathExists(compDoc);
      if (hasComponentDoc) {
        const compMeta = readDocMeta(compDoc);
        if (compMeta.group) compGroup = compMeta.group;
      }

      // Skip components without any .doc.mjs file (directory-level or
      // component-level). They can't be documented, so surfacing them in
      // the component list leads to broken docs-site links.
      if (!pathExists(docFile) && !hasComponentDoc) continue;

      if (!componentGroups.has(componentName)) {
        componentGroups.set(componentName, compGroup);
      }
    }
  }

  // A component folder with no doc in it is still listed when a doc elsewhere
  // documents it, the doc `component <Name>` opens: its own same-stem doc in a
  // family folder (Text/Heading.doc.mjs), or a member entry in the family's doc
  // (HStack and VStack in Stack's doc).
  for (const entry of topEntries) {
    if (!entry.isDirectory() || SKIP_DIRS.has(entry.name)) continue;
    const name = entry.name;
    if (componentGroups.has(name) || name.endsWith('Context')) continue;
    if (listDir(path.join(srcDir, name)).some(file => file.endsWith('.doc.mjs'))) {
      continue;
    }
    if (!hasOwnFolder(srcDir, name)) continue;
    const docPath = findComponentReadme(coreDir, name);
    if (!docPath?.endsWith('.doc.mjs')) continue;
    const meta = readDocMeta(docPath);
    if (meta.hidden || meta.hiddenComponents.has(name)) continue;
    componentGroups.set(name, meta.group);
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
  const entries = listDirEntries(srcDir);
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
      const dirEntries = listDir(dir);
      for (const f of dirEntries) {
        if (f.endsWith('.doc.mjs')) return path.join(dir, f);
      }
      dir = path.dirname(dir);
    }
  }

  // A component with its own folder, documented as a member of its family's
  // doc (HStack and VStack in Stack's doc).
  if (hasOwnFolder(srcDir, name)) return findFamilyDoc(srcDir, name);

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
    if (!pathExists(dirPath)) return null;
    const entries = listDirEntries(dirPath);

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
  const entries = listDirEntries(srcDir);
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
  const pkg = pathExists(pkgPath)
    ? JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
    : null;

  const exportKeys = Object.keys(pkg?.exports || {});

  // Priority 1: exact subpath export matching the component name (e.g. ./Heading)
  // This allows convenience re-export directories to win over the source directory.
  const exactMatch = exportKeys.find(
    k => k.toLowerCase() === `./${componentName}`.toLowerCase(),
  );
  if (exactMatch) {
    return `@astryxdesign/core/${exactMatch.slice(2)}`;
  }

  const sourcePath = findComponentSource(coreDir, componentName);
  if (!sourcePath) return '@astryxdesign/core';

  // Priority 2: subpath export matching the top-level source directory
  const relToSrc = path.relative(srcDir, sourcePath);
  const topDir = relToSrc.split(path.sep)[0];

  const topMatch = exportKeys.find(
    k => k.toLowerCase() === `./${topDir}`.toLowerCase(),
  );
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
 * Resolve the specifier an integration component is imported from. An authored
 * doc import is canonical; otherwise resolve against the owning package's
 * `exports` map.
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
 * @param {string|null} [authoredImport]
 * @returns {string}
 */
export function resolveIntegrationImportPath(
  owner,
  componentName,
  authoredImport,
) {
  if (authoredImport) return authoredImport;
  const {exportsMap, packageDir, docPath, packageName} = owner;
  const map =
    exportsMap === undefined ? readPackageExports(packageDir) : exportsMap;
  const directory = docPath
    ? path.basename(path.dirname(docPath))
    : componentName;
  return exportsPublish(map, `./${directory}`)
    ? `${packageName}/${directory}`
    : packageName;
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
  if (!pathExists(docsDir)) return {};

  /** @type {Map<string, string|null>} componentName → group */
  const componentGroups = new Map();

  /** @param {string} dirPath */
  function scanDir(dirPath) {
    const entries = listDirEntries(dirPath);
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
  if (!pathExists(docsDir)) return null;
  const target = `${name}.doc.mjs`;

  /**
   * @param {string} dirPath
   * @returns {string | null}
   */
  function scanDir(dirPath) {
    const entries = listDirEntries(dirPath);
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
  return pathExists(candidate) ? candidate : null;
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
  if (!componentsDir || !pathExists(componentsDir)) return [];

  /** @type {Map<string, {name: string, package: string, docPath: string, sourcePath: string|null, issuesUrl: string|undefined, group: string|null}>} */
  const byName = new Map();

  /** @param {string} dirPath */
  function scanDir(dirPath) {
    const entries = listDirEntries(dirPath);
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
 * Load and validate every discovered integration component independently.
 * Invalid metadata or a missing same-stem source removes only that component;
 * callers can report the returned errors while retaining valid siblings. A
 * component whose doc sets `replaces` carries the value as written; the
 * component replacement resolver decides what it means.
 *
 * @param {{name: string, components?: string, issuesUrl?: string}} integration
 * @returns {Promise<{
 *   components: Array<{name: string, package: string, docPath: string, sourcePath: string, issuesUrl: string|undefined, group: string|null, replaces?: unknown}>,
 *   discovered: Array<{name: string, package: string, docPath: string, sourcePath: string|null, issuesUrl: string|undefined, group: string|null}>,
 *   errors: Array<{name: string, message: string}>,
 * }>}
 */
export async function discoverValidIntegrationComponents(integration) {
  const discovered = discoverIntegrationComponents(integration);
  /** @type {Array<{name: string, package: string, docPath: string, sourcePath: string, issuesUrl: string|undefined, group: string|null, replaces?: unknown}>} */
  const components = [];
  /** @type {Array<{name: string, message: string}>} */
  const errors = [];

  for (const record of discovered) {
    if (record.sourcePath == null) {
      errors.push({
        name: record.name,
        message: `Component "${record.name}" is missing its same-stem source file ${record.name}.tsx.`,
      });
      continue;
    }
    try {
      const doc = await loadComponentDoc(record.docPath);
      const valid =
        /** @type {{name: string, package: string, docPath: string, sourcePath: string, issuesUrl: string|undefined, group: string|null}} */ (
          record
        );
      components.push(
        doc != null && typeof doc === 'object' && doc.replaces !== undefined
          ? {...valid, replaces: doc.replaces}
          : valid,
      );
    } catch (err) {
      errors.push({
        name: record.name,
        message: `Component "${record.name}" has invalid metadata: ${
          err instanceof Error ? err.message : String(err)
        }`,
      });
    }
  }

  return {components, discovered, errors};
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
  if (!componentsDir || !pathExists(componentsDir)) return null;

  /**
   * @param {string} dirPath
   * @returns {string | null}
   */
  function scanDir(dirPath) {
    const entries = listDirEntries(dirPath);
    // Exact same-stem match (precedence order) first in this dir.
    for (const suffix of INTEGRATION_DOC_SUFFIXES) {
      const candidate = path.join(dirPath, `${name}${suffix}`);
      if (pathExists(candidate)) return candidate;
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

// ── Legacy markdown-parsing functions ────────────────────────────────
// These are kept for backward compatibility with existing tests.
// The CLI action handler uses the new format functions below instead.

/**
 * Minimal cleanup for full docs (default mode).
 * Strips SYNC comments, rewrites title, collapses blank lines.
 */
