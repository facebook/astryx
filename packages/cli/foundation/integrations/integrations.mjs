// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Integration manifest loading for Astryx config.
 *
 * Integrations are PACKAGE NAMES listed in astryx.config.{ts,mjs,js}. Each
 * package declares a single conventional root manifest sibling to its
 * package.json — astryx.integration.{ts,mjs,js} — which contributes
 * components/templates/codemods/docs/themes roots and an optional issuesUrl.
 * Stable provider identity and package metadata come from package.json, not the
 * manifest.
 *
 * @input Integration package names, package.json files, and root manifests.
 * @output LoadedIntegration records with normalized provider identity and roots.
 * @position foundation/integrations — package contribution loading boundary.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {assertWithin} from '../fs/path-safety.mjs';
import {normalizeProviderId} from '../identity/provider-identity.mjs';
// The key census and contribution parsers are internal to the schema module on
// purpose: the public parser still validates the complete authored type, while
// the loader can isolate an invalid optional contribution from valid roots.
import {
  parseAgentDocsField,
  parseIntegrationBase,
  unknownIntegrationKeys,
} from '../../authoring/integration/schema.mjs';
import {importUserModule, findPresentFiles} from '../fs/module-loader.mjs';
import {
  activePackageSet,
  isBarePackageName,
  packageSetDeclarations,
  packageSetHandler,
  resolveFromPackageSet,
} from '../runtime/package-root.mjs';
import {parseGapReportHandler} from '../../authoring/gap-report/parse.mjs';
import {parseDiscoverSource} from '../../authoring/discover/parse.mjs';
import {resolveProviders} from './provider-resolution.mjs';

/**
 * A fully-resolved, loaded integration. Identity (`name`, `version`) comes from
 * the package's package.json; the `components`/`templates`/`codemods`/`docs`/
 * `themes` roots are absolute paths resolved from the manifest. The `__`-prefixed fields
 * are internal bookkeeping used by Doctor integration validation and Project.
 * @typedef {object} LoadedIntegration
 * @property {string} name
 * @property {import('../../authoring/identity/type').ProviderId} [providerId]
 *   normalized stable provider identity; absent only for a legacy unnamed local
 *   package. Unique among contributing integrations: a later claimant is kept
 *   inert with `__providerConflict` (see {@link markProviderConflicts})
 * @property {string} [version]
 * @property {string} [components]
 * @property {string} [templates]
 * @property {string} [codemods]
 * @property {string} [docs]
 * @property {string} [themes]
 * @property {string} [issuesUrl]
 * @property {{append?: readonly string[]}} [agentDocs]
 * @property {string} [__agentDocsError] contribution-specific validation
 *   failure; other manifest contributions remain available
 * @property {string} __spec
 * @property {string} __packageDir
 * @property {Record<string, unknown>|null} [__packageExports] the owning
 *   package's `exports` map, kept from the package.json this loader already
 *   parsed so import resolution does not read it a second time
 * @property {string} __manifestFile
 * @property {string} [__loadError] set when the manifest failed to load/validate;
 *   such an integration contributes nothing and is surfaced via Project.issues()
 * @property {{providerId: import('../../authoring/identity/type').ProviderId, claimedBy: string, message: string}} [__providerConflict]
 *   set on a package whose provider ID an earlier-loaded package already
 *   claims; it contributes nothing and is reported as a `duplicate_provider`
 *   warning
 * @property {string[]} [__unknownKeys] manifest keys this CLI does not know —
 *   surfaced as a warning; the rest of the manifest still contributes
 * @property {boolean} [__autolinked] loaded because the project declares the
 *   package as a dependency and it ships a manifest, with no astryx.config
 *   entry naming it — see foundation/integrations/autolink.mjs
 * @property {boolean} [__local] loaded from the package containing the current
 *   working directory, so an author sees the exact bytes they are editing
 * @property {string} [__dependencyField] for an autolinked integration, the
 *   package.json field that declared it (`dependencies`, `devDependencies`,
 *   `optionalDependencies`), or the active set's approved declaration source
 * @property {import('../../authoring/debug/type').DebugEventHandler} [__debug]
 *   the manifest module's `debug` NAMED export, when it exported a function.
 * @property {import('../../authoring/gap-report/type').GapReportHandler} [__gapReport]
 *   validated package-owned handler from the `gapReport` NAMED export.
 * @property {string} [__gapReportError] isolated named-handler validation error.
 *   Named exports are not manifest keys — see {@link loadManifest}.
 * @property {import('../../authoring/discover/type').DiscoverSource} [__discover]
 *   validated catalog source from the `discover` NAMED export.
 * @property {string} [__discoverError] isolated discover-source validation error.
 * @property {true} [__discoverFromHost] the discover source is a handler the
 *   host supplied in place of the manifest's own export
 */

/** Conventional manifest basenames, in load-precedence order. */
export const MANIFEST_BASENAMES = [
  'astryx.integration.ts',
  'astryx.integration.mjs',
  'astryx.integration.js',
];

/**
 * Normalize a package-owned provider ID without rejecting legacy unnamed local
 * packages at this compatibility boundary.
 * @param {unknown} name
 * @returns {import('../../authoring/identity/type').ProviderId | undefined}
 */
function providerIdForPackage(name) {
  if (typeof name !== 'string' || name.length === 0) return undefined;
  try {
    return normalizeProviderId(name);
  } catch {
    return undefined;
  }
}

/**
 * Resolve provider identity across loaded integrations, in precedence order.
 *
 * Artifact and document IDs are provider-scoped, so two packages cannot both
 * contribute under one provider ID. The same package reached twice (an npm
 * alias beside the package it aliases, with the same name and version) loads
 * once. Any other later claimant, including the same package at another
 * version, stays as an inert entry that carries the conflict. The package being
 * authored claims its ID before precedence order is considered, because the
 * source being edited is authoritative. The winner still contributes; Project
 * issues, Doctor, and the per-command warning name the one set aside instead of
 * dropping it without a word.
 *
 * The conflict pass of {@link resolveProviders}, for a list that is already
 * assembled.
 *
 * @param {LoadedIntegration[]} integrations in precedence order
 * @returns {LoadedIntegration[]}
 */
export function markProviderConflicts(integrations) {
  return resolveProviders(
    integrations.map(integration => ({
      source: /** @type {const} */ ('configured'),
      integration,
      spec: integration?.__spec,
    })),
  ).integrations;
}

/**
 * Return the conventional root manifest paths present in `dir`, in
 * load-precedence order. Unlike {@link resolveManifestPath} this never throws —
 * callers (for example Doctor integration validation) decide how to treat zero / multiple.
 * @param {string} dir
 * @returns {string[]} absolute manifest paths
 */
export function findManifestPaths(dir) {
  return findPresentFiles(dir, MANIFEST_BASENAMES);
}

/**
 * Parse the optional named gap-report handler without making it part of the
 * default manifest schema. A malformed handler is isolated from every other
 * integration contribution and represented as a failed delivery at fan-out.
 *
 * @param {unknown} value
 * @param {string} label
 * @returns {{handler?: import('../../authoring/gap-report/type').GapReportHandler, error?: string}}
 */
function parseGapReportHandlerExport(value, label) {
  if (value === undefined) return {};
  try {
    return {
      handler: parseGapReportHandler(
        value,
        `${label} named export "gapReport"`,
      ),
    };
  } catch (error) {
    return {error: error instanceof Error ? error.message : String(error)};
  }
}

/**
 * Parse the optional named discover source the same way: a malformed one is
 * isolated from every other contribution and reported by `astryx discover`.
 *
 * @param {unknown} value
 * @param {string} label
 * @returns {{source?: import('../../authoring/discover/type').DiscoverSource, error?: string}}
 */
function parseDiscoverSourceExport(value, label) {
  if (value === undefined) return {};
  try {
    return {
      source: parseDiscoverSource(value, `${label} named export "discover"`),
    };
  } catch (error) {
    return {error: error instanceof Error ? error.message : String(error)};
  }
}

/**
 * Load and validate a manifest module's default export, while isolating the
 * optional `agentDocs` contribution from the manifest's other fields.
 *
 * The base manifest still fails as one unit when a root or `issuesUrl` is
 * invalid. `agentDocs` is parsed separately: a bad contribution is returned as
 * `agentDocsError`, while valid components/templates/docs/codemods stay loaded.
 * The raw object is also inspected before parsing so unknown-key warnings retain
 * forward compatibility.
 *
 * `debug` and `gapReport` come back separately because they are named exports,
 * not manifest keys. A CLI that does not know them simply does not read them.
 *
 * @param {string} file absolute manifest path
 * @param {string} [label] used in error messages
 * @param {{fresh?: boolean}} [options]
 * @returns {Promise<{manifest: import('../../authoring/integration/type').AstryxIntegration, unknownKeys: string[], debug?: import('../../authoring/debug/type').DebugEventHandler, gapReport?: import('../../authoring/gap-report/type').GapReportHandler, gapReportError?: string, discover?: import('../../authoring/discover/type').DiscoverSource, discoverError?: string, agentDocsError?: string}>}
 */
export async function loadManifest(
  file,
  label = 'integration manifest',
  {fresh = false} = {},
) {
  const mod = await importUserModule(file, {fresh});
  const raw = mod?.default;
  const baseManifest = parseIntegrationBase(raw, label);
  const gapReport = parseGapReportHandlerExport(mod?.gapReport, label);
  const discover = parseDiscoverSourceExport(mod?.discover, label);
  const hasAgentDocs =
    raw != null &&
    typeof raw === 'object' &&
    !Array.isArray(raw) &&
    Object.prototype.hasOwnProperty.call(raw, 'agentDocs');
  const rawAgentDocs = hasAgentDocs
    ? /** @type {{agentDocs?: unknown}} */ (raw).agentDocs
    : undefined;
  /** @type {import('../../authoring/integration/type').AstryxIntegration['agentDocs']} */
  let agentDocs;
  /** @type {string | undefined} */
  let agentDocsError;
  if (hasAgentDocs && rawAgentDocs !== undefined) {
    try {
      agentDocs = parseAgentDocsField(
        rawAgentDocs,
        `${label} field "agentDocs"`,
      );
    } catch (err) {
      agentDocsError = err instanceof Error ? err.message : String(err);
    }
  }

  return {
    manifest: agentDocs == null ? baseManifest : {...baseManifest, agentDocs},
    unknownKeys: unknownIntegrationKeys(raw),
    debug:
      typeof mod?.debug === 'function'
        ? /** @type {import('../../authoring/debug/type').DebugEventHandler} */ (
            mod.debug
          )
        : undefined,
    gapReport: gapReport.handler,
    gapReportError: gapReport.error,
    discover: discover.source,
    discoverError: discover.error,
    agentDocsError,
  };
}

/**
 * Load and validate a manifest module's default export against the integration
 * schema. Throws if the default export is missing or invalid. Exposed for
 * Doctor integration validation.
 * @param {string} file absolute manifest path
 * @param {string} [label] used in error messages
 * @param {{fresh?: boolean}} [options]
 * @returns {Promise<import('../../authoring/integration/type').AstryxIntegration>}
 */
export async function loadManifestObject(
  file,
  label = 'integration manifest',
  options,
) {
  return (await loadManifest(file, label, options)).manifest;
}

/** @param {string} left @param {string} right */
function sameDirectory(left, right) {
  if (path.resolve(left) === path.resolve(right)) return true;
  try {
    return fs.realpathSync(left) === fs.realpathSync(right);
  } catch {
    return false;
  }
}

/** @param {string} cwd @param {string} name */
function projectDeclaresPackage(cwd, name) {
  try {
    const pkg = JSON.parse(
      fs.readFileSync(path.join(cwd, 'package.json'), 'utf-8'),
    );
    return ['dependencies', 'devDependencies', 'optionalDependencies'].some(
      field =>
        pkg?.[field] != null &&
        typeof pkg[field] === 'object' &&
        !Array.isArray(pkg[field]) &&
        Object.hasOwn(pkg[field], name),
    );
  } catch {
    return false;
  }
}

/**
 * The package-name guard used before hosted sets existed. Preserve it whenever
 * no root is serving the run; it accepts nested names but blocks traversal.
 * @param {unknown} name
 */
function isProjectPackageName(name) {
  return (
    typeof name === 'string' &&
    name.length > 0 &&
    !path.isAbsolute(name) &&
    !name.startsWith('@/') &&
    !name.split('/').some(segment => segment === '.' || segment === '..')
  );
}

/**
 * Resolve the directory of an installed integration package from the consumer's
 * node_modules.
 * @param {string} packageName
 * @param {string} [cwd]
 * @param {{usePackageSet?: boolean}} [options] apply the active plan when this
 *   lookup is loading the project's configured integration list
 */
export function resolvePackageDir(
  packageName,
  cwd = process.cwd(),
  {usePackageSet = false} = {},
) {
  const set = usePackageSet ? activePackageSet() : null;
  // Keep the base CLI's established package-name behavior when no hosted root
  // serves the run. A hosted or matched set admits only bare npm names.
  const validName =
    set != null && set.mode !== 'project'
      ? isBarePackageName(packageName)
      : isProjectPackageName(packageName);
  if (!validName) {
    throw new Error(
      `Invalid integration package name "${packageName}". Use a package name with no traversal segments.`,
    );
  }
  const nodeModules = path.resolve(cwd, 'node_modules');
  const dir = path.resolve(nodeModules, ...packageName.split('/'));
  if (dir !== nodeModules && !dir.startsWith(nodeModules + path.sep)) {
    throw new Error(
      `Integration "${packageName}" resolves outside node_modules.`,
    );
  }
  if (!set || set.mode === 'project') return dir;

  // A package the plan declares through the active set resolves only from that
  // root. An undeclared stray copy in the caller's node_modules is not the
  // approved version the plan records.
  if (packageSetDeclarations().includes(packageName)) {
    const fromSet = resolveFromPackageSet(packageName);
    if (fromSet) return fromSet;
    throw new Error(`Integration package "${packageName}" is unavailable.`);
  }

  // A project package is usable only when this plan recorded its directory.
  // Config alone does not let a stray node_modules copy bypass version planning.
  const plannedProjectPackage = set.packages.some(
    entry =>
      entry.source === 'project' &&
      entry.dir != null &&
      sameDirectory(entry.dir, dir),
  );
  if (plannedProjectPackage || projectDeclaresPackage(cwd, packageName)) {
    return dir;
  }
  throw new Error(
    `Integration package "${packageName}" is not declared in this project's package.json.`,
  );
}

/**
 * Find the single conventional root manifest sibling of the package's
 * package.json. Multiple present is a hard error; missing is a hard error.
 * @param {string} packageDir
 * @param {string} spec
 * @returns {string} absolute manifest path
 */
function resolveManifestPath(packageDir, spec) {
  const present = findPresentFiles(packageDir, MANIFEST_BASENAMES);
  if (present.length === 0) {
    throw new Error(
      `Integration package "${spec}" has no conventional root manifest. Add one of: ${MANIFEST_BASENAMES.join(', ')} next to its package.json.`,
    );
  }
  if (present.length > 1) {
    throw new Error(
      `Integration package "${spec}" has multiple root manifests (${present
        .map(file => path.basename(file))
        .join(', ')}). Keep exactly one.`,
    );
  }
  return present[0];
}

/**
 * Load the integration package rooted at `packageDir` directly, without first
 * installing or publishing it. This is the self-resolution seam: an author in
 * a package with a manifest sees the same contributions a consumer installs.
 *
 * A missing manifest returns null. A broken manifest returns the same load-error
 * marker as an installed integration, so Project issues stay truthful.
 *
 * @param {string} packageDir
 * @param {{fresh?: boolean}} [options]
 * @returns {Promise<LoadedIntegration|null>}
 */
export async function loadLocalIntegration(packageDir, {fresh = false} = {}) {
  const manifests = findManifestPaths(packageDir);
  if (manifests.length === 0) return null;

  const pkgPath = path.join(packageDir, 'package.json');
  let pkg;
  try {
    pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
  } catch {
    throw new Error(
      `Could not read the local integration package at ${pkgPath}.`,
    );
  }
  const spec =
    typeof pkg.name === 'string' && pkg.name.length > 0
      ? pkg.name
      : '(local integration)';
  const packageProviderId = providerIdForPackage(pkg.name);
  const manifestFile = resolveManifestPath(packageDir, spec);

  let manifest;
  /** @type {string[]} */
  let unknownKeys;
  /** @type {import('../../authoring/debug/type').DebugEventHandler | undefined} */
  let debugHandler;
  /** @type {import('../../authoring/gap-report/type').GapReportHandler | undefined} */
  let gapReportHandler;
  /** @type {string | undefined} */
  let gapReportError;
  /** @type {import('../../authoring/discover/type').DiscoverSource | undefined} */
  let discoverSource;
  /** @type {string | undefined} */
  let discoverError;
  /** @type {string | undefined} */
  let agentDocsError;
  try {
    ({
      manifest,
      unknownKeys,
      debug: debugHandler,
      gapReport: gapReportHandler,
      gapReportError,
      discover: discoverSource,
      discoverError,
      agentDocsError,
    } = await loadManifest(manifestFile, `Integration ${spec}`, {fresh}));
  } catch (err) {
    return {
      name: spec,
      ...(packageProviderId == null ? {} : {providerId: packageProviderId}),
      version: pkg.version,
      __spec: spec,
      __packageDir: packageDir,
      __manifestFile: manifestFile,
      __loadError: err instanceof Error ? err.message : String(err),
      __local: true,
    };
  }

  const providerId = providerIdForPackage(manifest.providerId ?? pkg.name);

  /** @param {string | null | undefined} value */
  const resolveRoot = value => {
    if (value == null) return undefined;
    try {
      return assertWithin(value, packageDir, {label: 'contribution root'});
    } catch {
      return undefined;
    }
  };

  return {
    name: spec,
    ...(providerId == null ? {} : {providerId}),
    version: pkg.version,
    components: resolveRoot(manifest.components),
    templates: resolveRoot(manifest.templates),
    codemods: resolveRoot(manifest.codemods),
    docs: resolveRoot(manifest.docs),
    themes: resolveRoot(manifest.themes),
    issuesUrl: manifest.issuesUrl,
    agentDocs: manifest.agentDocs,
    __agentDocsError: agentDocsError,
    __unknownKeys: unknownKeys,
    __debug: debugHandler,
    __gapReport: gapReportHandler,
    __gapReportError: gapReportError,
    __discover: discoverSource,
    __discoverError: discoverError,
    __spec: spec,
    __packageDir: packageDir,
    __packageExports: pkg.exports ?? null,
    __manifestFile: manifestFile,
    __local: true,
  };
}

/**
 * Load configured integrations.
 *
 * @param {string[]} [specs] package names
 * @param {{cwd?: string, fresh?: boolean, resolveProviders?: boolean, usePackageSet?: boolean}} [options]
 *   `resolveProviders: false` leaves provider identity to a caller that
 *   resolves it once over a larger set (Project.load). `usePackageSet: true`
 *   applies the active plan to configured-package resolution; other callers
 *   keep the ordinary project lookup.
 * @returns {Promise<LoadedIntegration[]>}
 */
export async function loadIntegrations(
  specs = [],
  {
    cwd = process.cwd(),
    fresh = false,
    resolveProviders = true,
    usePackageSet = false,
  } = {},
) {
  /** @type {LoadedIntegration[]} */
  const integrations = [];
  const seenSpecs = new Set();

  for (const spec of specs) {
    if (!spec || seenSpecs.has(spec)) continue;
    seenSpecs.add(spec);

    const packageDir = resolvePackageDir(spec, cwd, {usePackageSet});
    const pkgPath = path.join(packageDir, 'package.json');
    let pkg;
    try {
      pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    } catch {
      throw new Error(
        `Could not find installed integration package "${spec}" at ${pkgPath}. Install it first.`,
      );
    }

    const packageProviderId = providerIdForPackage(pkg.name ?? spec);
    const manifestFile = resolveManifestPath(packageDir, spec);
    let manifest;
    /** @type {string[]} */
    let unknownKeys;
    /** @type {import('../../authoring/debug/type').DebugEventHandler | undefined} */
    let debugHandler;
    /** @type {import('../../authoring/gap-report/type').GapReportHandler | undefined} */
    let gapReportHandler;
    /** @type {string | undefined} */
    let gapReportError;
    /** @type {import('../../authoring/discover/type').DiscoverSource | undefined} */
    let discoverSource;
    /** @type {string | undefined} */
    let discoverError;
    /** @type {string | undefined} */
    let agentDocsError;
    try {
      ({
        manifest,
        unknownKeys,
        debug: debugHandler,
        gapReport: gapReportHandler,
        gapReportError,
        discover: discoverSource,
        discoverError,
        agentDocsError,
      } = await loadManifest(manifestFile, `Integration ${spec}`, {fresh}));
    } catch (err) {
      // A manifest that throws on import or fails schema validation must NOT take
      // down every command (component/docs/theme don't need this integration).
      // Record a load-error marker; Project surfaces it via issues() and the
      // discovery loops naturally skip it (no components/templates/codemods).
      integrations.push({
        name: pkg.name ?? spec,
        ...(packageProviderId == null ? {} : {providerId: packageProviderId}),
        version: pkg.version,
        __spec: spec,
        __packageDir: packageDir,
        __manifestFile: manifestFile,
        __loadError: err instanceof Error ? err.message : String(err),
      });
      continue;
    }

    const providerId = providerIdForPackage(
      manifest.providerId ?? pkg.name ?? spec,
    );

    // A host running the CLI programmatically may answer this integration's
    // discover source itself (foundation/runtime/package-root.mjs). The
    // replacement is validated like the export it replaces, and the
    // integration keeps its own name, so results still name this package.
    const hostDiscover = packageSetHandler(pkg.name ?? spec, 'discover');
    /** @type {boolean} */
    let discoverFromHost = false;
    if (hostDiscover !== undefined) {
      ({source: discoverSource, error: discoverError} =
        parseDiscoverSourceExport(hostDiscover, `Host handler for ${spec}`));
      discoverFromHost = true;
    }

    /** @param {string | null | undefined} value */
    const resolveRoot = value => {
      if (value == null) return undefined;
      try {
        return assertWithin(value, packageDir, {label: 'contribution root'});
      } catch {
        // Root escapes the package — skip silently (reported by Doctor validation).
        return undefined;
      }
    };

    integrations.push({
      name: pkg.name ?? spec,
      ...(providerId == null ? {} : {providerId}),
      version: pkg.version,
      components: resolveRoot(manifest.components),
      templates: resolveRoot(manifest.templates),
      codemods: resolveRoot(manifest.codemods),
      docs: resolveRoot(manifest.docs),
      themes: resolveRoot(manifest.themes),
      issuesUrl: manifest.issuesUrl,
      agentDocs: manifest.agentDocs,
      __agentDocsError: agentDocsError,
      __unknownKeys: unknownKeys,
      __debug: debugHandler,
      __gapReport: gapReportHandler,
      __gapReportError: gapReportError,
      __discover: discoverSource,
      __discoverError: discoverError,
      ...(discoverFromHost ? {__discoverFromHost: true} : {}),
      __spec: spec,
      __packageDir: packageDir,
      __packageExports: pkg.exports ?? null,
      __manifestFile: manifestFile,
    });
  }

  return resolveProviders ? markProviderConflicts(integrations) : integrations;
}
