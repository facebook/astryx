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
  findComponentReadme,
  resolveImportPath,
  resolveIntegrationImportPath,
} from '../../../foundation/discovery/component-discovery.mjs';
import {discoverExternalPackages} from '../../../foundation/fs/paths.mjs';
import {ERROR_CODES} from '../../../foundation/response/error-codes.mjs';
import {AstryxError} from '../../error.mjs';
import {loadComponentCatalogSafely, loadComponentDoc, withOwnership} from '../_adapter.mjs';

/**
 * @typedef {import('../component.type.mjs').ComponentListResponse} ComponentListResponse
 * @typedef {import('../component.type.mjs').ComponentListEntry} ComponentListEntry
 * @typedef {import('../component.type.mjs').ComponentBriefEntry} ComponentBriefEntry
 */

/**
 * @param {any} record
 * @param {string} coreDir
 * @returns {string}
 */
function importFor(record, coreDir) {
  if (record.package === CORE_PACKAGE) return resolveImportPath(coreDir, record.name);
  return record.import ?? resolveIntegrationImportPath({
    exportsMap: record.integration?.__packageExports,
    packageDir: record.integration?.__packageDir,
    docPath: record.docPath,
    packageName: record.package,
  }, record.name);
}

/** @param {any} docs @param {string} fallbackName */
function normalizeFullDoc(docs, fallbackName) {
  const name =
    typeof docs?.name === 'string' && docs.name.trim() !== ''
      ? docs.name
      : fallbackName;
  const displayName =
    typeof docs?.displayName === 'string' && docs.displayName.trim() !== ''
      ? docs.displayName
      : name;
  const normalized = {...docs, name, displayName};
  if (normalized.type != null && normalized.type !== 'component') {
    normalized.type = 'component';
  }
  if (Array.isArray(normalized.components)) {
    normalized.usage = {
      ...normalized.usage,
      description:
        normalized.usage?.description ?? normalized.description ?? '',
    };
    normalized.components = normalized.components
      .filter((/** @type {any} */ entry) => entry && typeof entry.name === 'string')
      .map((/** @type {any} */ entry) => {
        const isReference = Object.keys(entry).every(key =>
          ['name', 'registry'].includes(key),
        );
        return isReference
          ? entry
          : {
              ...entry,
              displayName: entry.displayName ?? entry.name,
              description: entry.description ?? '',
            };
      });
    return normalized;
  }
  if (typeof normalized.subComponentOf === 'string') {
    normalized.description = normalized.description ?? '';
    normalized.props = Array.isArray(normalized.props) ? normalized.props : [];
    return normalized;
  }
  normalized.usage = {
    ...normalized.usage,
    description: normalized.usage?.description ?? normalized.description ?? '',
  };
  normalized.props = Array.isArray(normalized.props) ? normalized.props : [];
  return normalized;
}

/** @param {string} name */
function minimalFullDoc(name) {
  return {
    name,
    displayName: name,
    usage: {description: ''},
    props: [],
  };
}

/** @param {any} catalog */
function unslottedIntegrationRecords(catalog) {
  return catalog
    .entries()
    .filter(
      (/** @type {any} */ record) =>
        record.package !== CORE_PACKAGE &&
        (record.replaces == null || !catalog.hasCatalogCore(record.replaces)),
    );
}

/**
 * @param {any} record
 * @returns {string}
 */
function integrationGroupKey(record) {
  const groupLabel = record.group ?? record.package;
  return `${groupLabel} (${record.package})`;
}

/** @param {any} catalog @param {string} category */
function integrationRecordsForCategory(catalog, category) {
  const key = category.toLowerCase();
  return unslottedIntegrationRecords(catalog).filter(
    (/** @type {any} */ record) =>
      [record.category, record.group].some(
        value => typeof value === 'string' && value.toLowerCase() === key,
      ),
  );
}

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
  const {catalog, loadedIntegrations} = await loadComponentCatalogSafely(cwd, coreDir);

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

    const integrationRecords = integrationRecordsForCategory(catalog, match[0]);

    if (detail === 'compact') {
      /** @type {ComponentBriefEntry[]} */
      const entries = [];
      for (const comp of match[1]) {
        const selected = catalog.resolve(comp) ?? catalog.core(comp);
        const name = selected?.name ?? comp;
        const readme = selected?.docPath ?? findComponentReadme(coreDir, comp);
        const importPath = selected ? importFor(selected, coreDir) : resolveImportPath(coreDir, comp);
        if (readme) {
          try {
            const docs = await loadComponentDoc(readme, {zh, lang});
            entries.push({name, description: docs.usage?.description || docs.description || '', import: importPath});
          } catch {
            entries.push({name, description: '', import: importPath});
          }
        } else {
          entries.push({name, description: '', import: importPath});
        }
      }
      for (const record of integrationRecords) {
        const importPath = importFor(record, coreDir);
        try {
          const docs = await loadComponentDoc(record.docPath, {zh, lang});
          entries.push({
            name: record.name,
            description: docs.usage?.description || docs.description || '',
            import: importPath,
          });
        } catch {
          entries.push({name: record.name, description: '', import: importPath});
        }
      }
      return {type: 'component.list', data: {detail: 'compact', components: {[match[0]]: entries}}};
    }

    if (detail === 'full') {
      /** @type {any[]} */
      const entries = [];
      for (const comp of match[1]) {
        const selected = catalog.resolve(comp) ?? catalog.core(comp);
        const name = selected?.name ?? comp;
        const readme = selected?.docPath ?? findComponentReadme(coreDir, comp);
        if (readme) {
          try {
            const docs = await loadComponentDoc(readme, {zh, lang, dense});
            const fullDoc = normalizeFullDoc(docs, name);
            entries.push(
              selected
                ? withOwnership(
                    fullDoc,
                    /** @type {any} */ (selected),
                    name,
                    coreDir,
                  )
                : fullDoc,
            );
          } catch {
            const fullDoc = minimalFullDoc(name);
            entries.push(
              selected
                ? withOwnership(
                    fullDoc,
                    /** @type {any} */ (selected),
                    name,
                    coreDir,
                  )
                : fullDoc,
            );
          }
        } else {
          entries.push(minimalFullDoc(name));
        }
      }
      for (const record of integrationRecords) {
        try {
          const docs = await loadComponentDoc(record.docPath, {zh, lang, dense});
          entries.push(
            withOwnership(
              normalizeFullDoc(docs, record.name),
              /** @type {any} */ (record),
              record.name,
              coreDir,
            ),
          );
        } catch {
          entries.push(
            withOwnership(
              minimalFullDoc(record.name),
              /** @type {any} */ (record),
              record.name,
              coreDir,
            ),
          );
        }
      }
      return {type: 'component.list', data: {detail: 'full', components: {[match[0]]: entries}}};
    }

    // Default: brief — package-qualified object list for the category.
    // Pre-1.0 JSON contract: members are {name, package} objects, not bare
    // strings, so consumers can disambiguate ownership.
    /** @type {ComponentListEntry[]} */
    const entries = match[1].map(name => {
      const selected = catalog.resolve(name) ?? catalog.core(name);
      return {
        name: selected?.name ?? name,
        package: selected?.package ?? CORE_PACKAGE,
        import: selected
          ? importFor(selected, coreDir)
          : resolveImportPath(coreDir, name),
        ...(selected?.replaces == null ? null : {replaces: selected.replaces}),
      };
    });
    entries.push(
      ...integrationRecords.map((/** @type {any} */ record) => ({
        name: record.name,
        package: record.package,
        import: importFor(record, coreDir),
        ...(record.replaces == null ? null : {replaces: record.replaces}),
      })),
    );
    return {
      type: 'component.list',
      data: {detail: 'names', components: {[match[0]]: entries}},
    };
  }

  // All components — merge core + external packages with grouped subcategories
  if (detail === 'compact') {
    /** @type {Record<string, ComponentBriefEntry[]>} */
    const result = {};
    for (const [cat, comps] of Object.entries(components)) {
      result[cat] = [];
      for (const comp of comps) {
        const selected = catalog.resolve(comp) ?? catalog.core(comp);
        const name = selected?.name ?? comp;
        const readme = selected?.docPath ?? findComponentReadme(coreDir, comp);
        const importPath = selected ? importFor(selected, coreDir) : resolveImportPath(coreDir, comp);
        if (readme) {
          try {
            const docs = await loadComponentDoc(readme, {zh, lang});
            result[cat].push({name, description: docs.usage?.description || docs.description || '', import: importPath});
          } catch {
            result[cat].push({name, description: '', import: importPath});
          }
        } else {
          result[cat].push({name, description: '', import: importPath});
        }
      }
    }
    for (const record of unslottedIntegrationRecords(catalog)) {
      const key = integrationGroupKey(record);
      if (!result[key]) result[key] = [];
      const importPath = importFor(record, coreDir);
      try {
        const docs = await loadComponentDoc(record.docPath, {zh, lang});
        result[key].push({
          name: record.name,
          description: docs.usage?.description || docs.description || '',
          import: importPath,
        });
      } catch {
        result[key].push({name: record.name, description: '', import: importPath});
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
        const selected = catalog.resolve(comp) ?? catalog.core(comp);
        const name = selected?.name ?? comp;
        const readme = selected?.docPath ?? findComponentReadme(coreDir, comp);
        if (readme) {
          try {
            const docs = await loadComponentDoc(readme, {zh, lang, dense});
            const fullDoc = normalizeFullDoc(docs, name);
            result[cat].push(
              selected
                ? withOwnership(
                    fullDoc,
                    /** @type {any} */ (selected),
                    name,
                    coreDir,
                  )
                : fullDoc,
            );
          } catch {
            const fullDoc = minimalFullDoc(name);
            result[cat].push(
              selected
                ? withOwnership(
                    fullDoc,
                    /** @type {any} */ (selected),
                    name,
                    coreDir,
                  )
                : fullDoc,
            );
          }
        } else {
          result[cat].push(minimalFullDoc(name));
        }
      }
    }
    for (const record of unslottedIntegrationRecords(catalog)) {
      const key = integrationGroupKey(record);
      if (!result[key]) result[key] = [];
      try {
        const docs = await loadComponentDoc(record.docPath, {zh, lang, dense});
        result[key].push(
          withOwnership(
            normalizeFullDoc(docs, record.name),
            /** @type {any} */ (record),
            record.name,
            coreDir,
          ),
        );
      } catch {
        result[key].push(
          withOwnership(
            minimalFullDoc(record.name),
            /** @type {any} */ (record),
            record.name,
            coreDir,
          ),
        );
      }
    }
    return {type: 'component.list', data: {detail: 'full', components: result}};
  }

  // Default: brief — package-qualified object list (core + integrations).
  // Pre-1.0 JSON contract: each group's members are {name, package} objects.
  /** @type {Record<string, Array<{name: string, package: string, import?: string, replaces?: string}>>} */
  const listData = {};
  for (const [cat, comps] of Object.entries(components)) {
    listData[cat] = comps.map(name => {
      const selected = catalog.resolve(name) ?? catalog.core(name);
      return {
        name: selected?.name ?? name,
        package: selected?.package ?? CORE_PACKAGE,
        import: selected ? importFor(selected, coreDir) : resolveImportPath(coreDir, name),
        ...(selected?.replaces == null ? null : {replaces: selected.replaces}),
      };
    });
  }

  // Non-replacing integration components follow the Core catalog. Replacement
  // components already occupy their target's Core slot above.
  const effectiveIntegrations = unslottedIntegrationRecords(catalog);
  const seenIntegration = new Set(loadedIntegrations.map(integration => integration.name));
  /** @type {Map<string, Array<{name: string, package: string, import?: string, replaces?: string}>>} */
  const byGroup = new Map();
  for (const record of effectiveIntegrations) {
    const key = integrationGroupKey(record);
    if (!byGroup.has(key)) byGroup.set(key, []);
    byGroup.get(key)?.push({
      name: record.name,
      package: record.package,
      import: importFor(record, coreDir),
      ...(record.replaces == null ? null : {replaces: record.replaces}),
    });
  }
  for (const [key, members] of byGroup) {
    members.sort((a, b) => a.name.localeCompare(b.name));
    listData[key] = members;
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
