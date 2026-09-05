// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Programmatic API for the template command.
 *
 * This module is BOTH the template dispatcher and the stable import surface for
 * the template family. `template()` discovers the available templates, resolves
 * the requested one, and routes to a leaf (list/show/skeleton/copy/cdn). The shared
 * discovery/IO + cross-command helpers live in `foundation/discovery/template-adapter.mjs` and are
 * RE-EXPORTED here so external import paths (`api/template/template.mjs`) —
 * used by component, layout, search, init, discover, validate-integration, and
 * lib/project — keep resolving unchanged.
 *
 * @position api/template — the template dispatcher + barrel; leaves live under
 *   ./list, ./show, ./skeleton, ./copy, ./cdn and shared discovery in foundation/discovery.
 */

import {discoverAll, pkgOf} from '../../foundation/discovery/template-adapter.mjs';
import {listResolvableComponentNames} from '../../foundation/discovery/component-discovery.mjs';
import {loadIntegrationsSafely} from '../component/_adapter.mjs';
import {AstryxError} from '../error.mjs';
import {ERROR_CODES} from '../../foundation/response/error-codes.mjs';
import {templateList} from './list/list.mjs';
import {templateShow} from './show/show.mjs';
import {templateSkeleton} from './skeleton/skeleton.mjs';
import {templateCopy} from './copy/copy.mjs';
import {templateCdn} from './cdn/cdn.mjs';

// Re-export the shared discovery/IO + cross-command helpers so this module
// stays the single import surface for the template family (same exports as
// before the leaf split). `discoverAll` is exposed both under its own name and
// the historical `discoverTemplates` alias.
export {
  discoverAll,
  discoverAll as discoverTemplates,
  discoverAllWithErrors,
  discoverIntegrationTemplatesForOne,
  stripTemplateAssetRefs,
  listTemplates,
  findRelatedBlocks,
  findShowcase,
  extractComponents,
} from '../../foundation/discovery/template-adapter.mjs';

export {listResolvableComponentNames} from '../../foundation/discovery/component-discovery.mjs';

/**
 * @typedef {import('../../foundation/discovery/template-adapter.mjs').DiscoveredTemplate} DiscoveredTemplate
 */
/**
 * @typedef {import('../../foundation/discovery/template-adapter.mjs').TemplateDiscoveryError} TemplateDiscoveryError
 */
/**
 * @typedef {import('../../foundation/discovery/template-adapter.mjs').TemplateDocModule} TemplateDocModule
 */

/**
 * @param {string} [name]
 * @param {object} [options]
 * @param {string} [options.targetPath]
 * @param {boolean} [options.overwrite]
 * @param {boolean} [options.list]
 * @param {boolean} [options.skeleton]
 * @param {boolean | string} [options.cdn] - Write the no-build-step CDN starter page; a string is used as the destination path.
 * @param {boolean} [options.show]
 * @param {'page'|'block'} [options.type] - Filter list views / narrow lookups by template kind.
 * @param {string} [options.package] - Narrow lookups to a specific package (id-only matches across packages are ambiguous).
 * @param {string} [options.cwd]
 * @returns {Promise<{type: string, data: unknown}>}
 */
export async function template(name, options = {}) {
  const {
    list = false,
    skeleton = false,
    show = false,
    cdn = false,
    targetPath,
    overwrite = false,
    type,
    package: packageFilter,
    cwd = process.cwd(),
  } = options;

  // The CDN starter ships as an asset rather than as a discovered template, so
  // it answers before discovery — nothing here needs a name resolved.
  if (cdn) {
    return templateCdn({
      targetPath: typeof cdn === 'string' ? cdn : targetPath,
      overwrite,
      cwd,
    });
  }

  const templates = await discoverAll(cwd);

  if (list || (!name && !skeleton)) {
    return templateList(templates, {type, package: packageFilter});
  }

  // Resolve `name` to a single template. The same id can appear across types
  // and/or packages (e.g. a core "hero" page and an integration "hero"
  // block); narrow with --type / --package.
  let candidates = templates.filter(t => t.dirName === name);
  if (type) candidates = candidates.filter(t => t.type === type);
  if (packageFilter) candidates = candidates.filter(t => pkgOf(t) === packageFilter);

  if (name && candidates.length === 0) {
    throw new AstryxError(
      `Unknown template "${name}"`,
      templates.map(t => ({name: t.dirName, reason: `${t.type} template`})),
      ERROR_CODES.ERR_UNKNOWN_TEMPLATE,
    );
  }
  if (name && candidates.length > 1) {
    throw new AstryxError(
      `Template "${name}" is ambiguous — narrow it with --type and/or --package.`,
      candidates.map(t => ({
        name: t.dirName,
        reason: `${t.type} template in ${pkgOf(t)}`,
      })),
      ERROR_CODES.ERR_AMBIGUOUS_TEMPLATE,
    );
  }
  const [match] = candidates;

  const resolver = () =>
    // Integrations are loaded exactly like `astryx component` does, then handed
    // to the exact-resolution index (it never re-loads the project itself).
    (async () => {
      /** @type {import('../../foundation/integrations/integrations.mjs').LoadedIntegration[]} */
      let integrations = [];
      try {
        integrations = await loadIntegrationsSafely(cwd);
      } catch {
        // Unloadable projects fall back to core-only resolution; the failure
        // is surfaced on the discover/doctor paths.
      }
      return listResolvableComponentNames(cwd, integrations ?? []);
    })();

  if (skeleton) {
    return templateSkeleton(match, templates, await resolver());
  }

  if (show || !targetPath) {
    return templateShow(match, await resolver());
  }

  return templateCopy(match, {targetPath, cwd, overwrite});
}
