// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Shared external-package adapter for the discover leaves.
 *
 * Every `discover.*` leaf projects already-resolved data into a typed response;
 * none of them touch the integration system or the filesystem directly. This
 * adapter is the single place that does: it discovers the configured external
 * packages, locates a component's doc file within them, and loads + validates a
 * component's docs. Keeping that I/O here (rather than duplicated across leaves)
 * is what lets `list`, `detail`, `detail/doc`, and `search` stay pure
 * projections.
 *
 * @position api/discover — orchestration over lib/project, lib/package-scanner,
 *   and lib/component-loader; the discover dispatcher + leaves consume it.
 */

import {Project} from '../../foundation/config/project.mjs';
import {
  scanAllPackages,
  findComponentInPackages,
} from './_package-scanner.mjs';
import {loadDocs} from '../../foundation/discovery/component-loader.mjs';
import {AstryxError} from '../error.mjs';
import {ERROR_CODES} from '../../foundation/response/error-codes.mjs';

/**
 * @typedef {import('./_package-scanner.mjs').ScannedPackage} ScannedPackage
 */

/**
 * A located component doc within a scanned package — the shape returned by
 * {@link findComponent}, consumed by {@link loadValidatedDoc}.
 * @typedef {{pkg: ScannedPackage, docPath: string, componentName: string}} ComponentResolution
 */

/**
 * Validate the loose shape of a loaded docs object. Returns an error string
 * describing the first problem, or `null` when the docs are usable.
 * @param {unknown} docs
 * @returns {string | null}
 */
function validateDocs(docs) {
  if (!docs || typeof docs !== 'object')
    return 'docs export is missing or not an object';
  const d = /** @type {Record<string, any>} */ (docs);
  if (typeof d.name !== 'string' || !d.name)
    return 'docs.name is missing or not a string';
  if (!d.usage || typeof d.usage.description !== 'string')
    return 'docs.usage.description is missing or not a string';
  if (d.props && !Array.isArray(d.props))
    return 'docs.props must be an array';
  if (d.components && !Array.isArray(d.components))
    return 'docs.components must be an array';
  if (d.usage?.bestPractices && !Array.isArray(d.usage.bestPractices))
    return 'docs.usage.bestPractices must be an array';
  return null;
}

/**
 * Discover the configured external packages for the current project.
 *
 * External packages come from configured integrations that declare a components
 * root; each becomes a scannable package keyed by its docsDir. `configured`
 * reports whether the project configured ANY integration — including one whose
 * manifest failed to load, which contributes nothing but is emphatically not
 * "nothing configured". It lets an empty result distinguish "nothing
 * configured" (`false`) from "configured but nothing discovered" (`true`),
 * which the list leaf surfaces as `meta`.
 *
 * @returns {Promise<{packages: ScannedPackage[], configured: boolean}>}
 */
export async function discoverPackages() {
  const project = await Project.load();
  const loadedIntegrations =
    /** @type {import('../../foundation/integrations/integrations.mjs').LoadedIntegration[]} */ (
      project.loadedIntegrations
    );

  const explicitPackages = loadedIntegrations
    .filter(integration => integration.components)
    .map(integration => ({
      name: integration.name,
      version: integration.version,
      category: integration.name,
      docsDir: integration.components,
    }));
  if (explicitPackages.length === 0) {
    return {packages: [], configured: loadedIntegrations.length > 0};
  }

  const packages = scanAllPackages(
    [],
    /** @type {ScannedPackage[]} */ (/** @type {unknown} */ (explicitPackages)),
  );
  return {packages, configured: true};
}

/**
 * Project a scanned package into the discover list/detail entry shape. Shared
 * by the list and detail leaves so the entry keys (and their order) stay in one
 * place.
 * @param {ScannedPackage} pkg
 * @returns {import('./discover.type.mjs').DiscoverListEntry}
 */
export function toEntry(pkg) {
  return {
    name: pkg.name,
    category: pkg.category,
    components: pkg.components,
    version: pkg.version,
    description: pkg.description,
    displayName: pkg.displayName,
  };
}

/**
 * Locate a component's doc file within the given packages (case-insensitive).
 * @param {ScannedPackage[]} packages
 * @param {string} name
 * @returns {ComponentResolution | null}
 */
export function findComponent(packages, name) {
  return findComponentInPackages(packages, name);
}

/**
 * Load and validate a resolved component's docs. Throws AstryxError
 * (ERR_INVALID_DOC) when the file fails to load or the docs are malformed.
 * Returns the (optionally translated) docs object itself; leaves wrap it in the
 * `discover.detail.doc` envelope.
 * @param {ComponentResolution} result
 * @param {{lang?: string | null, zh?: boolean}} opts
 * @returns {Promise<import('./discover.type.mjs').DiscoverDetailDocResponse['data']>}
 */
export async function loadValidatedDoc(result, {lang, zh}) {
  let docs;
  try {
    docs = await loadDocs(
      result.docPath,
      /** @type {{zh?: boolean, dense?: boolean, lang?: string}} */ ({zh, lang}),
    );
  } catch (e) {
    throw new AstryxError(
      `Failed to load docs for ${result.componentName}: ${/** @type {any} */ (e).message}`,
      undefined,
      ERROR_CODES.ERR_INVALID_DOC,
    );
  }
  const err = validateDocs(docs);
  if (err)
    throw new AstryxError(
      `Invalid docs for ${result.componentName}: ${err}`,
      undefined,
      ERROR_CODES.ERR_INVALID_DOC,
    );
  return docs;
}
