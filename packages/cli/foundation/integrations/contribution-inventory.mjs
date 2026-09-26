// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Contribution inventory for integration pack-check.
 *
 * Enumerates the files and contribution identities an integration package
 * declares, for cross-referencing against the npm tarball. The file inventory
 * is computed statically (no module imports); the identity inventory runs
 * the same discovery functions a consumer uses.
 *
 * @position packages/cli/foundation/integrations — shared contribution inventory
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {isDeepStrictEqual} from 'node:util';
import {
  discoverIntegrationThemes,
  isThemeFolder,
  listThemeFiles,
} from '../discovery/theme-discovery.mjs';
import {discoverIntegrationComponents} from '../discovery/component-discovery.mjs';
import {loadComponentDoc} from '../discovery/component-loader.mjs';
import {discoverIntegrationTemplatesForOne} from '../discovery/template-adapter.mjs';
import {discoverIntegrationCodemods} from '../../assets/codemods/integration-discovery.mjs';
import {discoverIntegrationDocs} from '../discovery/docs-discovery.mjs';

// ── File-walk helpers (no module imports, no execution) ──────────

const TEMPLATE_RE = /\.(?:template|doc)\.(?:ts|mjs|js)$/u;
const COMPONENT_DOC_RE = /\.doc\.(?:ts|mjs|js)$/u;
const CODEMOD_RE = /\.(?:ts|mjs|js)$/u;
const CODEMOD_TEST_RE = /\.(?:test|spec|fixture)\.(?:ts|mjs|js)$/u;
const DOC_RE = /\.doc\.(?:ts|mjs|js)$/u;
const SKIP_DIRS = new Set([
  'node_modules',
  '.git',
  '__tests__',
  '__fixtures__',
]);

/**
 * Recursively collect files under `dir` that satisfy `filter`, excluding
 * `node_modules` and `.git`. Returns sorted absolute paths.
 * @param {string} dir
 * @param {(name: string) => boolean} filter
 * @returns {string[]}
 */
function walkDir(dir, filter) {
  if (!dir || !fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) return [];
  /** @type {string[]} */
  const out = [];
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkDir(full, filter));
    else if (filter(entry.name)) out.push(full);
  }
  return out.sort();
}

/** @param {string} packageDir @param {string} file */
function rel(packageDir, file) {
  return path.relative(packageDir, file).split(path.sep).join('/');
}

// ── Per-kind file enumeration ────────────────────────────────────

/** @param {string} root @param {string} pkgDir */
function enumerateThemeFiles(root, pkgDir) {
  if (!root || !fs.existsSync(root) || !fs.statSync(root).isDirectory()) {
    return [];
  }
  // Exactly what `theme add` copies: each theme folder's files, including
  // tests and fixtures, but no dot entry or file npm never publishes. Files
  // beside the theme folders belong to no theme.
  /** @type {string[]} */
  const files = [];
  for (const entry of fs.readdirSync(root, {withFileTypes: true})) {
    const full = path.join(root, entry.name);
    if (entry.isDirectory() && isThemeFolder(full)) {
      files.push(...listThemeFiles(full).map(file => path.join(full, file)));
    }
  }
  return files.sort().map(file => rel(pkgDir, file));
}

/** @param {string} root @param {string} pkgDir */
function enumerateComponentFiles(root, pkgDir) {
  const files = [];
  for (const doc of walkDir(root, name => COMPONENT_DOC_RE.test(name))) {
    files.push(rel(pkgDir, doc));
    const source = `${doc.replace(COMPONENT_DOC_RE, '')}.tsx`;
    if (fs.existsSync(source)) files.push(rel(pkgDir, source));
  }
  return files;
}

/** @param {string} root @param {string} pkgDir */
function enumerateTemplateFiles(root, pkgDir) {
  const files = [];
  for (const tmpl of walkDir(root, n => TEMPLATE_RE.test(n))) {
    files.push(rel(pkgDir, tmpl));
    const stem = tmpl.replace(TEMPLATE_RE, '');
    const source = `${stem}.tsx`;
    if (fs.existsSync(source)) files.push(rel(pkgDir, source));
  }
  return files;
}

/** @param {string} root @param {string} pkgDir */
function enumerateCodemodFiles(root, pkgDir) {
  return walkDir(
    root,
    name => CODEMOD_RE.test(name) && !CODEMOD_TEST_RE.test(name),
  ).map(file => rel(pkgDir, file));
}

/** @param {string} root @param {string} pkgDir */
function enumerateDocFiles(root, pkgDir) {
  return walkDir(root, n => DOC_RE.test(n)).map(f => rel(pkgDir, f));
}

/** @type {Record<FileInventoryRoot['kind'], (root: string, pkgDir: string) => string[]>} */
const ENUMERATORS = {
  themes: enumerateThemeFiles,
  components: enumerateComponentFiles,
  templates: enumerateTemplateFiles,
  codemods: enumerateCodemodFiles,
  docs: enumerateDocFiles,
};
const ROOT_KINDS = /** @type {const} */ ([
  'themes',
  'components',
  'templates',
  'codemods',
  'docs',
]);

// ── Public: static file inventory ────────────────────────────────

/**
 * @typedef {object} FileInventoryRoot
 * @property {'themes'|'components'|'templates'|'codemods'|'docs'} kind
 * @property {string} path — project-relative root path
 * @property {string[]} files — project-relative required file paths
 */

/**
 * @typedef {object} FileInventory
 * @property {string} manifest — project-relative manifest path
 * @property {FileInventoryRoot[]} roots
 * @property {string[]} allFiles — deduplicated flat list
 */

/**
 * Compute the files the tarball must contain for an integration's
 * contributions to be visible. Walks descriptor-owned directories;
 * never imports or executes authored modules.
 *
 * @param {import('./integrations.mjs').LoadedIntegration} loaded
 * @returns {FileInventory}
 */
export function computeRequiredFiles(loaded) {
  const pkgDir = loaded.__packageDir;
  const manifestRel = rel(pkgDir, loaded.__manifestFile);
  /** @type {FileInventoryRoot[]} */
  const roots = [];
  const allFiles = [manifestRel];

  for (const kind of ROOT_KINDS) {
    const root = loaded[kind];
    if (!root) continue;
    const files = ENUMERATORS[kind](root, pkgDir);
    roots.push({
      kind,
      path: rel(pkgDir, root),
      files,
    });
    allFiles.push(...files);
  }

  return {manifest: manifestRel, roots, allFiles: [...new Set(allFiles)]};
}

// ── Public: identity collection ──────────────────────────────────

/**
 * Catalog entry and sorted file list behind each theme identity collected
 * here. Pack verification compares them; the reported identity stays
 * `{slug, exportName}`.
 * @type {WeakMap<object, {entry: string, files: string[]}>}
 */
const themeSources = new WeakMap();

/**
 * @typedef {object} ContributionIdentities
 * @property {{slug: string, exportName: string}[]} themes
 * @property {string[]} components
 * @property {{id: string, type: string, name: string}[]} templates
 * @property {{version: string, id: string}[]} codemods
 * @property {string[]} docs
 * @property {string[]} agentDocsAppend
 */

/**
 * The resolved fields needed to discover contribution identities.
 * @typedef {object} IdentitySource
 * @property {string} name
 * @property {string} [themes]
 * @property {string} [components]
 * @property {string} [templates]
 * @property {string} [codemods]
 * @property {string} [docs]
 * @property {{append?: readonly string[]}} [agentDocs]
 */

/**
 * Run the same discovery functions a consumer uses to collect every
 * contribution identity from a loaded integration.
 *
 * @param {IdentitySource} loaded
 * @returns {Promise<{identities: ContributionIdentities, errors: Array<{kind: string, message: string}>}>}
 */
export async function collectIdentities(loaded) {
  /** @type {ContributionIdentities} */
  const identities = {
    themes: [],
    components: [],
    templates: [],
    codemods: [],
    docs: [],
    agentDocsAppend: loaded.agentDocs?.append
      ? [...loaded.agentDocs.append]
      : [],
  };
  /** @type {Array<{kind: string, message: string}>} */
  const errors = [];

  if (loaded.themes && fs.existsSync(loaded.themes)) {
    try {
      const themes = await discoverIntegrationThemes(
        /** @type {import('./integrations.mjs').LoadedIntegration} */ (loaded),
      );
      identities.themes = themes
        .map(theme => {
          const identity = {slug: theme.slug, exportName: theme.exportName};
          themeSources.set(identity, {
            entry: theme.entry,
            files: [...theme.files].sort(),
          });
          return identity;
        })
        .sort((a, b) => a.slug.localeCompare(b.slug));
    } catch (err) {
      errors.push({
        kind: 'themes',
        message: /** @type {Error} */ (err).message,
      });
    }
  }

  if (loaded.components && fs.existsSync(loaded.components)) {
    try {
      const records = discoverIntegrationComponents(loaded) ?? [];
      for (const record of records) {
        try {
          await loadComponentDoc(record.docPath);
          identities.components.push(record.name);
        } catch (err) {
          errors.push({
            kind: 'components',
            message: `${path.relative(loaded.components, record.docPath)}: ${
              /** @type {Error} */ (err).message
            }`,
          });
        }
      }
      identities.components.sort();
    } catch (err) {
      errors.push({
        kind: 'components',
        message: /** @type {Error} */ (err).message,
      });
    }
  }

  if (loaded.templates && fs.existsSync(loaded.templates)) {
    try {
      const {templates, errors: templateErrors} =
        await discoverIntegrationTemplatesForOne(loaded);
      for (const templateError of templateErrors) {
        errors.push({kind: 'templates', message: templateError.message});
      }
      identities.templates = templates
        .map(t => ({id: t.dirName, type: t.type, name: t.name}))
        .sort((a, b) => a.id.localeCompare(b.id));
    } catch (err) {
      errors.push({
        kind: 'templates',
        message: /** @type {Error} */ (err).message,
      });
    }
  }

  if (loaded.codemods && fs.existsSync(loaded.codemods)) {
    try {
      const byVersion = await discoverIntegrationCodemods([loaded]);
      /** @type {{version: string, id: string}[]} */
      const entries = [];
      for (const [version, codemods] of byVersion) {
        for (const cm of codemods) entries.push({version, id: cm.id});
      }
      identities.codemods = entries.sort((a, b) =>
        `${a.version}/${a.id}`.localeCompare(`${b.version}/${b.id}`),
      );
    } catch (err) {
      errors.push({
        kind: 'codemods',
        message: /** @type {Error} */ (err).message,
      });
    }
  }

  if (loaded.docs && fs.existsSync(loaded.docs)) {
    try {
      const {records, errors: docErrors} =
        await discoverIntegrationDocs(loaded);
      for (const docError of docErrors) {
        errors.push({kind: 'docs', message: docError.message});
      }
      identities.docs = records.map(r => r.name).sort();
    } catch (err) {
      errors.push({kind: 'docs', message: /** @type {Error} */ (err).message});
    }
  }

  return {identities, errors};
}

/**
 * Prove that one contribution is visible through the same inventory seam the
 * packed-package checker uses. This is the shared postcondition for every add
 * handler, not a second set of per-writer rules.
 *
 * @param {IdentitySource} loaded
 * @param {'theme'|'component'|'template'|'codemod'|'doc'|'agent-doc'} kind
 * @param {string} name
 * @param {{version?: string}} [options]
 * @returns {Promise<void>}
 */
export async function assertContributionVisible(
  loaded,
  kind,
  name,
  {version} = {},
) {
  const {identities, errors} = await collectIdentities(loaded);
  const errorKind =
    kind === 'theme'
      ? 'themes'
      : kind === 'component'
        ? 'components'
        : kind === 'template'
          ? 'templates'
          : kind === 'codemod'
            ? 'codemods'
            : kind === 'doc'
              ? 'docs'
              : 'agentDocs';
  const relevantError = errors.find(error => error.kind === errorKind);
  if (relevantError) throw new Error(relevantError.message);

  const visible =
    kind === 'theme'
      ? identities.themes.some(theme => theme.slug === name)
      : kind === 'component'
        ? identities.components.includes(name)
        : kind === 'template'
          ? identities.templates.some(template => template.id === name)
          : kind === 'codemod'
            ? identities.codemods.some(
                codemod => codemod.id === name && codemod.version === version,
              )
            : kind === 'doc'
              ? identities.docs.includes(name)
              : identities.agentDocsAppend.includes(name);
  if (!visible) {
    const qualifier = version == null ? '' : ` under version ${version}`;
    throw new Error(
      `${kind} contribution "${name}" was not visible${qualifier} after writing.`,
    );
  }
}

// ── Public: identity comparison ──────────────────────────────────

/**
 * @typedef {import('./issue').AstryxIntegrationIssue} Issue
 */

/**
 * How two collected themes' catalog entry or file list differ, or null.
 * @param {object} localTheme
 * @param {object} packedTheme
 * @returns {string|null}
 */
function themeSourceDifference(localTheme, packedTheme) {
  const local = themeSources.get(localTheme);
  const packed = themeSources.get(packedTheme);
  if (isDeepStrictEqual(local, packed)) return null;
  if (!local || !packed)
    return 'its catalog entry and files could not be compared';
  if (local.entry !== packed.entry) {
    return `its entry is "${local.entry}" locally but "${packed.entry}" in the tarball`;
  }
  return `its files are ${local.files.join(', ')} locally but ${packed.files.join(', ')} in the tarball`;
}

/**
 * Compare local and packed identities. Anything discoverable locally but
 * missing from the packed tarball is an error, and so is a theme whose
 * catalog entry or file list changed.
 *
 * @param {ContributionIdentities} local
 * @param {ContributionIdentities} packed
 * @returns {Issue[]}
 */
export function compareIdentities(local, packed) {
  /** @type {Issue[]} */
  const issues = [];

  /**
   * Compare one identity list in both directions, then compare the complete
   * record for matching keys. A packed-only identity is just as suspicious as a
   * missing one: npm shipped bytes the local authoring view did not expose.
   * @param {string} kind
   * @param {unknown[]} localItems
   * @param {unknown[]} packedItems
   * @param {(item: any) => string} keyOf
   * @param {(localItem: any, packedItem: any) => string|null} [differenceOf]
   *   a difference the reported record does not show
   */
  function compareKind(
    kind,
    localItems,
    packedItems,
    keyOf,
    differenceOf = () => null,
  ) {
    const localByKey = new Map(localItems.map(item => [keyOf(item), item]));
    const packedByKey = new Map(packedItems.map(item => [keyOf(item), item]));
    for (const [key, item] of localByKey) {
      if (!packedByKey.has(key)) {
        issues.push({
          code: 'identity_not_packed',
          severity: 'error',
          message: `${kind} "${key}" is discoverable locally but missing from the packed tarball.`,
        });
        continue;
      }
      const packedItem = packedByKey.get(key);
      const difference = differenceOf(item, packedItem);
      if (difference || !isDeepStrictEqual(item, packedItem)) {
        issues.push({
          code: 'identity_mismatch',
          severity: 'error',
          message: `${kind} "${key}" resolves differently from the packed tarball${
            difference ? `: ${difference}` : ''
          }.`,
        });
      }
    }
    for (const key of packedByKey.keys()) {
      if (!localByKey.has(key)) {
        issues.push({
          code: 'packed_identity_unexpected',
          severity: 'error',
          message: `${kind} "${key}" exists only in the packed tarball.`,
        });
      }
    }
  }

  compareKind(
    'Theme',
    local.themes,
    packed.themes,
    item => item.slug,
    themeSourceDifference,
  );
  compareKind('Component', local.components, packed.components, item => item);
  compareKind('Template', local.templates, packed.templates, item => item.id);
  compareKind(
    'Codemod',
    local.codemods,
    packed.codemods,
    item => `${item.version}/${item.id}`,
  );
  compareKind('Doc topic', local.docs, packed.docs, item => item);

  if (
    JSON.stringify(local.agentDocsAppend) !==
    JSON.stringify(packed.agentDocsAppend)
  ) {
    issues.push({
      code: 'agent_docs_mismatch',
      severity: 'error',
      message:
        'agentDocs.append lines differ between local and packed manifests.',
    });
  }

  return issues;
}

// ── Public: source-only candidate detection ──────────────────────

const PASCAL_CASE_TSX = /^([A-Z][A-Za-z0-9]+)\.tsx$/u;

/**
 * Find top-level PascalCase `.tsx` files under a components root that are
 * NOT registered as integration components. These are candidates that
 * Astryx will ignore — surfaced as a warning so the author knows.
 *
 * Scans only direct children of the root (not recursive) and never
 * enters node_modules.
 *
 * @param {string|undefined} componentsRoot absolute path
 * @param {string[]} registeredNames names already returned by discovery
 * @returns {string[]} unregistered PascalCase names
 */
export function findSourceOnlyCandidates(componentsRoot, registeredNames) {
  if (!componentsRoot || !fs.existsSync(componentsRoot)) return [];
  const known = new Set(registeredNames);
  /** @type {string[]} */
  const candidates = [];
  for (const entry of fs.readdirSync(componentsRoot, {withFileTypes: true})) {
    if (!entry.isFile() && !entry.isSymbolicLink()) continue;
    const match = entry.name.match(PASCAL_CASE_TSX);
    if (!match) continue;
    if (!known.has(match[1])) candidates.push(match[1]);
  }
  return candidates.sort();
}
