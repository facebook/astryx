// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Shared resolver for the `component` command leaves.
 *
 * @input  a component name (+ cwd / package scope) and doc-load options
 * @output resolved subjects the leaves project into their one `{type, data}`
 *         envelope — owners across core/integration, the scoped/legacy/fuzzy
 *         resolution, and the doc-loading / prop-extraction / ownership shaping
 * @position api/component (internal; NOT a response-type leaf, not exported
 *           from ./api). Every view of a component agrees because it resolves
 *           the subject HERE once; the leaves never re-resolve or do I/O of
 *           their own beyond fetching their single subject.
 *
 * This is a PURE REORG of the resolution that used to be inlined (and
 * duplicated across branches) in component.mjs: the core/external/scoped/
 * integration lookup, ambiguity handling, and fuzzy search now live here,
 * deduped, so each leaf stays a thin projection.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {ERROR_CODES} from '../../foundation/response/error-codes.mjs';
import {findCoreDir, discoverExternalPackages} from '../../foundation/fs/paths.mjs';
import {
  CORE_PACKAGE,
  discoverComponents,
  findComponentReadme,
  findComponentSource,
  findExternalComponentDoc,
  findIntegrationComponentDoc,
  findIntegrationComponentSource,
  resolveImportPath,
} from '../../foundation/discovery/component-discovery.mjs';
import {Project} from '../../foundation/config/project.mjs';
import {loadDocs} from '../../foundation/discovery/component-loader.mjs';
import {searchComponents} from '../../foundation/text/string-utils.mjs';
import {AstryxError} from '../error.mjs';

export {CORE_PACKAGE};

/**
 * A loaded component doc. `loadDocs` returns the authored `.doc.mjs` shape,
 * which is either a single-component or multi-component doc; this loose view
 * captures the fields the API reads across both forms.
 * @typedef {object} LoadedComponentDoc
 * @property {string} [name]
 * @property {string} [description]
 * @property {any[]} [props]
 * @property {any[]} [components]
 * @property {{description?: string}} [usage]
 * @property {any} [theming]
 * @property {string} [import] set when the doc states its own import specifier
 */

/**
 * Options object for `loadDocs`, matching its declared parameter shape (used
 * as a cast target so `lang` (which the API may hold as `string|null`) type
 * checks against `loadDocs`'s `lang?: string`).
 * @typedef {{zh?: boolean, dense?: boolean, lang?: string}} LoadDocsOpts
 */

/**
 * An OWNER package that provides a component with a given name: the doc/source
 * paths and the issues URL a later integration-component swizzle needs.
 * @typedef {object} ComponentOwner
 * @property {string} package
 * @property {string} docPath
 * @property {string|null} sourcePath
 * @property {string|undefined} issuesUrl
 * @property {import('../../foundation/integrations/integrations.mjs').LoadedIntegration|null} integration
 */

/**
 * What ownership shaping needs from an owner. The core and legacy-external
 * paths synthesize a bare `{package, sourcePath}` rather than resolving a full
 * {@link ComponentOwner}, so everything past those two is optional here.
 * @typedef {Partial<ComponentOwner> & {package: string, sourcePath: string|null}} OwnershipSubject
 */

/**
 * A back-compat external package discovered via `pkg.astryx.docs`.
 * @typedef {{name: string, category: string, docsDir: string}} ExternalPackageRef
 */

/**
 * The outcome of scoping a lookup to a specific `--package`.
 * @typedef {(
 *   | {kind: 'core', owner: ComponentOwner}
 *   | {kind: 'integration', owner: ComponentOwner}
 *   | {kind: 'legacy', ext: ExternalPackageRef}
 * )} ScopeResolution
 */

/**
 * The result of resolving a bare (unscoped) name to a doc: which file, under
 * which resolved name/owner, and where its swizzleable source lives.
 * @typedef {object} ResolvedUnscopedDoc
 * @property {string} readmePath
 * @property {string} resolvedName
 * @property {string} resolvedOwnerPackage
 * @property {string|null} resolvedSourcePath
 */

/**
 * Locate `@astryxdesign/core`, throwing the stable not-found error when absent.
 * @param {string} cwd
 * @returns {string}
 */
export function requireCoreDir(cwd) {
  const coreDir = findCoreDir(cwd);
  if (!coreDir) {
    throw new AstryxError('Could not find @astryxdesign/core package', undefined, ERROR_CODES.ERR_CORE_NOT_FOUND);
  }
  return coreDir;
}

/**
 * Load the configured integrations for `cwd`, swallowing any config errors so
 * component discovery never hard-fails on a malformed/absent integration. An
 * empty list means "core only".
 * @param {string} cwd
 * @returns {Promise<import('../../foundation/integrations/integrations.mjs').LoadedIntegration[]>}
 */
export async function loadIntegrationsSafely(cwd) {
  try {
    const project = await Project.load(cwd);
    return /** @type {import('../../foundation/integrations/integrations.mjs').LoadedIntegration[]} */ (
      project.loadedIntegrations
    );
  } catch {
    return [];
  }
}

/**
 * Resolve a loaded integration by package name.
 * @param {import('../../foundation/integrations/integrations.mjs').LoadedIntegration[]} loadedIntegrations
 * @param {string} packageName
 * @returns {import('../../foundation/integrations/integrations.mjs').LoadedIntegration|null}
 */
function findLoadedIntegration(loadedIntegrations, packageName) {
  return loadedIntegrations.find(i => i.name === packageName) ?? null;
}

/**
 * Resolve an external package by name from the discovered externals list.
 * @param {string} packageName - e.g. '@acme/xds-widgets'
 * @param {string} cwd
 * @returns {ExternalPackageRef | null}
 */
function resolveExternalPackage(packageName, cwd) {
  const externals = discoverExternalPackages(cwd);
  return externals.find(ext => ext.name === packageName) ?? null;
}

/**
 * Build the set of OWNER packages that provide a component with this name
 * across core + every loaded integration. This is what lets the CLI
 * disambiguate by package and expose the owner's source + issuesUrl.
 * @param {string} coreDir
 * @param {string} dirName - bare component name (no `XDS` prefix)
 * @param {import('../../foundation/integrations/integrations.mjs').LoadedIntegration[]} loadedIntegrations
 * @returns {ComponentOwner[]}
 */
export function resolveOwners(coreDir, dirName, loadedIntegrations) {
  const coreDocPath = findComponentReadme(coreDir, dirName);
  /** @type {ComponentOwner[]} */
  const owners = [];
  if (coreDocPath) {
    owners.push({
      package: CORE_PACKAGE,
      docPath: coreDocPath,
      sourcePath: findComponentSource(coreDir, dirName),
      issuesUrl: undefined,
      integration: null,
    });
  }
  for (const integration of loadedIntegrations) {
    const docPath = findIntegrationComponentDoc(integration, dirName);
    if (!docPath) continue;
    owners.push({
      package: integration.name,
      docPath,
      sourcePath: findIntegrationComponentSource(integration, dirName),
      issuesUrl: integration.issuesUrl,
      integration,
    });
  }
  return owners;
}

/**
 * Classify a `--package`-scoped lookup. Searches the scoped package first so a
 * component that exists in both core and an external package (e.g. AppShell,
 * Button, SideNav) resolves to the package the caller asked for.
 * @param {string} packageScope
 * @param {{owners: ComponentOwner[], loadedIntegrations: import('../../foundation/integrations/integrations.mjs').LoadedIntegration[], cwd: string, name: string}} ctx
 * @returns {ScopeResolution}
 */
export function classifyScope(packageScope, {owners, loadedIntegrations, cwd, name}) {
  // Core scope: resolve from core directly.
  if (packageScope === CORE_PACKAGE) {
    const owner = owners.find(o => o.package === CORE_PACKAGE);
    if (!owner) {
      throw new AstryxError(`No component "${name}" in package "${packageScope}"`, undefined, ERROR_CODES.ERR_UNKNOWN_COMPONENT);
    }
    return {kind: 'core', owner};
  }

  // Integration scope (authoritative): resolve from the loaded integration.
  const integration = findLoadedIntegration(loadedIntegrations, packageScope);
  if (integration) {
    const owner = owners.find(o => o.package === packageScope);
    if (!owner) {
      throw new AstryxError(`No component "${name}" in package "${packageScope}"`, undefined, ERROR_CODES.ERR_UNKNOWN_COMPONENT);
    }
    return {kind: 'integration', owner};
  }

  // Legacy fallback: node_modules `pkg.astryx.docs` external package.
  const ext = resolveExternalPackage(packageScope, cwd);
  if (!ext) {
    throw new AstryxError(`External package "${packageScope}" not found`, undefined, ERROR_CODES.ERR_UNKNOWN_PACKAGE);
  }
  return {kind: 'legacy', ext};
}

/**
 * Refuse to guess when the name is owned by MORE THAN ONE package (core and/or
 * integrations) and the caller did not scope with --package. Legacy
 * `pkg.astryx.docs` externals are intentionally NOT part of this ambiguity set.
 * @param {ComponentOwner[]} owners
 * @param {string} dirName
 * @returns {void}
 */
export function assertUnambiguousOwners(owners, dirName) {
  if (owners.length > 1) {
    throw new AstryxError(
      `Component "${dirName}" is provided by multiple packages. Re-run with --package <pkg> to choose one.`,
      owners.map(o => ({name: o.package, reason: 'provides this component'})),
      ERROR_CODES.ERR_UNKNOWN_COMPONENT,
    );
  }
}

/**
 * Resolve a legacy external package's doc file for `dirName`, or null when the
 * package ships no `.doc.mjs` for it.
 * @param {ExternalPackageRef} ext
 * @param {string} dirName
 * @returns {string | null}
 */
export function resolveLegacyExternalDoc(ext, dirName) {
  const extDocPath = findExternalComponentDoc(ext.docsDir, dirName);
  return extDocPath && extDocPath.endsWith('.doc.mjs') ? extDocPath : null;
}

/**
 * The core source file for `dirName` (the no-scope `--source` path reads core
 * directly — it does NOT fall back to externals or fuzzy search).
 * @param {string} coreDir
 * @param {string} dirName
 * @returns {string | null}
 */
export function resolveCoreSourcePath(coreDir, dirName) {
  return findComponentSource(coreDir, dirName);
}

/**
 * Resolve a bare (unscoped) name to a `.doc.mjs`: core first, then back-compat
 * externals, then a conservative fuzzy search. Throws ERR_UNKNOWN_COMPONENT
 * (with candidate suggestions when close) or ERR_NO_DOC.
 * @param {string} dirName - bare component name (no `XDS` prefix)
 * @param {{coreDir: string, cwd: string, name: string}} ctx - `name` is the caller's original (prefixed) input, used in error text
 * @returns {Promise<ResolvedUnscopedDoc>}
 */
export async function resolveUnscopedDoc(dirName, {coreDir, cwd, name}) {
  let readmePath = findComponentReadme(coreDir, dirName);
  let resolvedName = dirName;
  // Track the resolving owner so the detail payload can carry ownership info.
  // Defaults to core; the legacy-external fallback below may reassign it.
  // Annotated because CORE_PACKAGE's generated declaration carries the literal
  // type, which (unlike a fresh literal) does not widen on assignment.
  /** @type {string} */
  let resolvedOwnerPackage = CORE_PACKAGE;
  let resolvedSourcePath = readmePath ? findComponentSource(coreDir, dirName) : null;

  if (!readmePath) {
    const externals = discoverExternalPackages(cwd);
    for (const ext of externals) {
      const extDocPath = findExternalComponentDoc(ext.docsDir, dirName);
      if (extDocPath) {
        readmePath = extDocPath;
        resolvedOwnerPackage = ext.name;
        resolvedSourcePath = null;
        break;
      }
    }
  }

  if (!readmePath) {
    const components = discoverComponents(coreDir);
    const results = await searchComponents(dirName, coreDir, components);

    if (results.length > 0) {
      const topScore = results[0].score;
      const topTied = results.filter(r => r.score === topScore);
      const secondScore = results.length > topTied.length ? results[topTied.length].score : 0;
      const gap = topScore - secondScore;

      if (topScore >= 90 && topTied.length === 1 && gap >= 20) {
        resolvedName = topTied[0].name;
        readmePath = findComponentReadme(coreDir, resolvedName);
        resolvedOwnerPackage = CORE_PACKAGE;
        resolvedSourcePath = findComponentSource(coreDir, resolvedName);
      } else {
        const threshold = Math.max(topScore - 20, 1);
        const candidates = results.filter(r => r.score >= threshold).slice(0, 5);
        if (candidates.length < 2) candidates.push(...results.slice(candidates.length, 2));
        throw new AstryxError(
          `No component named "${name}"`,
          candidates.map(c => ({name: c.name, reason: c.reason})),
          ERROR_CODES.ERR_UNKNOWN_COMPONENT,
        );
      }
    } else {
      throw new AstryxError(`No component named "${name}"`, undefined, ERROR_CODES.ERR_UNKNOWN_COMPONENT);
    }
  }

  if (!readmePath || !readmePath.endsWith('.doc.mjs')) {
    throw new AstryxError(`No .doc.mjs found for "${resolvedName}". The component needs a typed doc file.`, undefined, ERROR_CODES.ERR_NO_DOC);
  }

  return {readmePath, resolvedName, resolvedOwnerPackage, resolvedSourcePath};
}

/**
 * Load a `.doc.mjs` through the shared loader, applying the API's doc-load
 * options. Centralizes the `LoadedComponentDoc`/`LoadDocsOpts` casts so leaves
 * get a typed doc without re-casting.
 * @param {string} docPath
 * @param {{zh?: boolean, dense?: boolean, lang?: string|null}} [opts]
 * @returns {Promise<LoadedComponentDoc>}
 */
export async function loadComponentDoc(docPath, opts = {}) {
  const {zh = false, dense = false, lang = null} = opts;
  return /** @type {LoadedComponentDoc} */ (
    await loadDocs(docPath, /** @type {LoadDocsOpts} */ ({zh, dense, lang}))
  );
}

/**
 * Project a loaded doc down to its props table, flattening a multi-component
 * doc's members when the top-level doc has no direct props.
 * @param {LoadedComponentDoc} docs
 * @returns {any[]}
 */
export function extractProps(docs) {
  return docs.props || (docs.components ? docs.components.flatMap(c => c.props || []) : []);
}

/**
 * Augment a loaded `component.detail` doc with ownership metadata. Adds
 * `package`, the resolved `import` specifier, and `sourceAvailable` (whether a
 * swizzleable source file exists for the owner). Existing doc fields (name,
 * usage, props, …) are preserved.
 * @param {LoadedComponentDoc} docs
 * @param {OwnershipSubject} owner
 * @param {string} componentName
 * @param {string} coreDir
 * @returns {import('./component.type.mjs').ComponentDetailResponse['data']}
 */
export function withOwnership(docs, owner, componentName, coreDir) {
  const importSpec =
    owner.package === CORE_PACKAGE
      ? resolveImportPath(coreDir, componentName)
      : resolveIntegrationImportPath(owner, componentName);
  return /** @type {any} */ ({
    ...docs,
    package: owner.package,
    // A doc file may state its own specifier, e.g. when one entry point exports
    // several components. Only fall back to a resolved one when it does not.
    import: docs.import ?? importSpec,
    sourceAvailable: owner.sourcePath != null,
  });
}

/**
 * Resolve the specifier an integration component is imported from, against the
 * owning package's `exports` map.
 *
 * A component lives in a directory that need not share its name — several
 * components can be exported from one entry point — so the specifier has to
 * come from the directory the doc file sits in, checked against `exports`,
 * rather than from the component name. Falls back to the package root when the
 * directory is not an exported subpath, matching what a consumer would have to
 * write by hand.
 *
 * @param {OwnershipSubject} owner
 * @param {string} componentName
 * @returns {string}
 */
function resolveIntegrationImportPath(owner, componentName) {
  const packageDir = owner.integration?.__packageDir;
  const directory = owner.docPath
    ? path.basename(path.dirname(owner.docPath))
    : componentName;
  if (!packageDir) {
    return owner.package;
  }
  try {
    const manifest = JSON.parse(
      fs.readFileSync(path.join(packageDir, 'package.json'), 'utf-8'),
    );
    if (manifest.exports?.[`./${directory}`]) {
      return `${owner.package}/${directory}`;
    }
  } catch {
    // An unreadable or malformed manifest is not worth failing a lookup over.
  }
  return owner.package;
}

/**
 * When the caller asked for "Code" but the resolved doc is for "CodeBlock"
 * (parent), scope the response to just the matching sub-component. Returns the
 * scoped doc (sans ownership) plus the matched member, or null when the doc is
 * not a scopeable parent.
 * @param {LoadedComponentDoc} docs
 * @param {string} dirName
 * @param {string} coreDir
 * @returns {{scoped: LoadedComponentDoc & {parentDoc?: string, import?: string}, matchingComponent: any} | null}
 */
export function scopeSubComponent(docs, dirName, coreDir) {
  const requestedXDS = `XDS${dirName}`;
  const isParentDoc = docs.name && docs.name.toLowerCase() !== dirName.toLowerCase();
  const matchingComponent = isParentDoc && docs.components
    ? docs.components.find(c => c.name === requestedXDS || c.name === dirName)
    : null;

  if (!matchingComponent) return null;

  /** @type {LoadedComponentDoc & {parentDoc?: string, import?: string}} */
  const scoped = {
    name: dirName,
    description: matchingComponent.description,
    props: matchingComponent.props,
    // Keep parent context for reference
    components: [matchingComponent],
    parentDoc: docs.name,
    import: resolveImportPath(coreDir, dirName),
  };
  if (docs.usage) scoped.usage = docs.usage;
  if (docs.theming) scoped.theming = docs.theming;

  return {scoped, matchingComponent};
}
