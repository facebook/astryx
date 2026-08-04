// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `component.list` leaf — the grouped component listing.
 *
 * @input  coreDir + list options (category filter, detail level, doc language)
 * @output ONE `component.list` envelope whose `data.detail`
 *         ('names' | 'compact' | 'full') tags the payload depth and
 *         `data.components` holds the grouped map (core + integrations +
 *         back-compat externals).
 * @position api/component/list (projection leaf; routed by component.mjs)
 */

import {
  CORE_PACKAGE,
  discoverComponents,
  discoverExternalComponentsGrouped,
  discoverIntegrationComponents,
  findComponentReadme,
  resolveImportPath,
} from '../../../foundation/discovery/component-discovery.mjs';
import {discoverExternalPackages} from '../../../foundation/fs/paths.mjs';
import {ERROR_CODES} from '../../../foundation/response/error-codes.mjs';
import {AstryxError} from '../../error.mjs';
import {loadComponentDoc, loadIntegrationsSafely} from '../_adapter.mjs';

/**
 * @typedef {import('../component.type.mjs').ComponentListResponse} ComponentListResponse
 * @typedef {import('../component.type.mjs').ComponentListEntry} ComponentListEntry
 * @typedef {import('../component.type.mjs').ComponentBriefEntry} ComponentBriefEntry
 */

/**
 * Build the `component.list` envelope. The list taxonomy is collapsed: all
 * three detail levels emit ONE `component.list` type; the depth rides in
 * `data.detail` and the grouped map in `data.components`.
 * @param {string} coreDir
 * @param {object} opts
 * @param {string} opts.cwd
 * @param {string} [opts.category] - Filter to a single category (group key).
 * @param {'full'|'compact'|'brief'} opts.detail
 * @param {boolean} opts.zh
 * @param {boolean} opts.dense
 * @param {string|null} opts.lang
 * @returns {Promise<ComponentListResponse>}
 */
export async function componentList(coreDir, {cwd, category, detail, zh, dense, lang}) {
  const components = discoverComponents(coreDir);

  if (category) {
    const match = Object.entries(components).find(
      ([key]) => key.toLowerCase() === category.toLowerCase(),
    );
    if (!match) {
      throw new AstryxError(
        `Unknown category "${category}"`,
        Object.keys(components).map(k => ({name: k, reason: 'valid category'})),
        ERROR_CODES.ERR_UNKNOWN_CATEGORY,
      );
    }

    if (detail === 'compact') {
      /** @type {ComponentBriefEntry[]} */
      const entries = [];
      for (const comp of match[1]) {
        const readme = findComponentReadme(coreDir, comp);
        if (readme && readme.endsWith('.doc.mjs')) {
          try {
            const docs = await loadComponentDoc(readme, {zh, lang});
            entries.push({name: comp, description: docs.usage?.description || docs.description || '', import: resolveImportPath(coreDir, comp)});
          } catch {
            entries.push({name: comp, description: '', import: resolveImportPath(coreDir, comp)});
          }
        } else {
          entries.push({name: comp, description: '', import: resolveImportPath(coreDir, comp)});
        }
      }
      return {type: 'component.list', data: {detail: 'compact', components: {[match[0]]: entries}}};
    }

    if (detail === 'full') {
      /** @type {any[]} */
      const entries = [];
      for (const comp of match[1]) {
        const readme = findComponentReadme(coreDir, comp);
        if (readme && readme.endsWith('.doc.mjs')) {
          try {
            entries.push(await loadComponentDoc(readme, {zh, lang, dense}));
          } catch {
            entries.push({name: `XDS${comp}`, description: ''});
          }
        } else {
          entries.push({name: `XDS${comp}`, description: ''});
        }
      }
      return {type: 'component.list', data: {detail: 'full', components: {[match[0]]: entries}}};
    }

    // Default: brief — package-qualified object list for the category.
    // Pre-1.0 JSON contract: members are {name, package} objects, not bare
    // strings, so consumers can disambiguate ownership.
    return {
      type: 'component.list',
      data: {detail: 'names', components: {[match[0]]: match[1].map(n => ({name: n, package: CORE_PACKAGE}))}},
    };
  }

  // All components — merge core + external packages with grouped subcategories
  if (detail === 'compact') {
    /** @type {Record<string, ComponentBriefEntry[]>} */
    const result = {};
    for (const [cat, comps] of Object.entries(components)) {
      result[cat] = [];
      for (const comp of comps) {
        const readme = findComponentReadme(coreDir, comp);
        if (readme && readme.endsWith('.doc.mjs')) {
          try {
            const docs = await loadComponentDoc(readme, {zh, lang});
            result[cat].push({name: comp, description: docs.usage?.description || docs.description || '', import: resolveImportPath(coreDir, comp)});
          } catch {
            result[cat].push({name: comp, description: '', import: resolveImportPath(coreDir, comp)});
          }
        } else {
          result[cat].push({name: comp, description: '', import: resolveImportPath(coreDir, comp)});
        }
      }
    }
    return {type: 'component.list', data: {detail: 'compact', components: result}};
  }

  if (detail === 'full') {
    /** @type {Record<string, any[]>} */
    const result = {};
    for (const [cat, comps] of Object.entries(components)) {
      result[cat] = [];
      for (const comp of comps) {
        const readme = findComponentReadme(coreDir, comp);
        if (readme && readme.endsWith('.doc.mjs')) {
          try {
            result[cat].push(await loadComponentDoc(readme, {zh, lang, dense}));
          } catch {
            result[cat].push({name: `XDS${comp}`, description: ''});
          }
        } else {
          result[cat].push({name: `XDS${comp}`, description: ''});
        }
      }
    }
    return {type: 'component.list', data: {detail: 'full', components: result}};
  }

  // Default: brief — package-qualified object list (core + integrations).
  // Pre-1.0 JSON contract: each group's members are {name, package} objects.
  /** @type {Record<string, Array<{name: string, package: string}>>} */
  const listData = {};
  for (const [cat, comps] of Object.entries(components)) {
    listData[cat] = comps.map(n => ({name: n, package: CORE_PACKAGE}));
  }

  // Integration components (authoritative source: loadedIntegrations).
  const loadedIntegrations = await loadIntegrationsSafely(cwd);
  const seenIntegration = new Set();
  for (const integration of loadedIntegrations) {
    seenIntegration.add(integration.name);
    const owned = discoverIntegrationComponents(integration);
    // Group integration components by their doc `group`, falling back to the
    // package name. Keys are package-qualified so they never collide with
    // core groups or each other.
    /** @type {Map<string, Array<{name: string, package: string}>>} */
    const byGroup = new Map();
    for (const rec of owned) {
      const groupLabel = rec.group ?? integration.name;
      const key = `${groupLabel} (${integration.name})`;
      if (!byGroup.has(key)) byGroup.set(key, []);
      byGroup.get(key)?.push({name: rec.name, package: integration.name});
    }
    for (const [key, members] of byGroup) {
      members.sort((a, b) => a.name.localeCompare(b.name));
      listData[key] = members;
    }
  }

  // Back-compat: node_modules-scanned external packages (pkg.astryx.docs)
  // that are NOT configured integrations. Preserves existing discovery for
  // consumers that haven't adopted the config-integration flow.
  const externals = discoverExternalPackages(cwd);
  for (const ext of externals) {
    if (seenIntegration.has(ext.name)) continue;
    const grouped = discoverExternalComponentsGrouped(ext.docsDir);
    const groupKeys = Object.keys(grouped);
    if (groupKeys.length === 0) continue;

    const hasGroups = groupKeys.some(
      k => grouped[k].length > 1 || grouped[k][0] !== k,
    );

    if (hasGroups) {
      for (const [group, members] of Object.entries(grouped)) {
        listData[`${group} (${ext.name})`] = members.map(n => ({
          name: n,
          package: ext.name,
        }));
      }
    } else {
      const allComps = Object.values(grouped).flat().sort();
      if (allComps.length > 0) {
        listData[`${ext.category} (${ext.name})`] = allComps.map(n => ({
          name: n,
          package: ext.name,
        }));
      }
    }
  }
  return {type: 'component.list', data: {detail: 'names', components: listData}};
}
