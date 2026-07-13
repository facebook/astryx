// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Programmatic API for the component command.
 *
 * Returns the same typed envelope { type, data } that `astryx --json component` outputs.
 * The CLI command handler is a thin wrapper around this function.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {ERROR_CODES} from '../lib/error-codes.mjs';
import {findCoreDir, discoverExternalPackages} from '../utils/paths.mjs';
import {
  CORE_PACKAGE,
  discoverComponents,
  discoverExternalComponentsGrouped,
  discoverIntegrationComponents,
  findComponentReadme,
  findComponentSource,
  findExternalComponentDoc,
  findIntegrationComponentDoc,
  findIntegrationComponentSource,
  isComponentHidden,
  parseHiddenComponents,
  resolveImportPath,
} from '../lib/component-discovery.mjs';
import {Project} from '../lib/project.mjs';
import {loadDocs} from '../lib/component-loader.mjs';
import {searchComponents} from '../lib/string-utils.mjs';
import {AstryxError} from './error.mjs';
import {findShowcase, findRelatedBlocks} from './template.mjs';

/**
 * Load the configured integrations + hidden-component set for `cwd`,
 * swallowing any config errors so component discovery never hard-fails on a
 * malformed/absent integration. Empty integrations means "core only"; an
 * empty hidden set means "nothing hidden".
 * @param {string} cwd
 * @returns {Promise<{loadedIntegrations: Array<{name: string, components?: string, issuesUrl?: string}>, hiddenComponents: Set<string>}>}
 */
async function loadProjectContextSafely(cwd) {
  try {
    const project = await Project.load(cwd);
    return {
      loadedIntegrations: project.loadedIntegrations,
      hiddenComponents: parseHiddenComponents(project.hiddenComponents),
    };
  } catch {
    return {loadedIntegrations: [], hiddenComponents: new Set()};
  }
}

/**
 * Resolve a loaded integration by package name.
 * @param {Array<{name: string}>} loadedIntegrations
 * @param {string} packageName
 */
function findLoadedIntegration(loadedIntegrations, packageName) {
  return loadedIntegrations.find(i => i.name === packageName) ?? null;
}

/**
 * Resolve an external package by name from the discovered externals list.
 * @param {string} packageName - e.g. '@acme/xds-widgets'
 * @param {string} cwd
 * @returns {{ name: string, category: string, docsDir: string } | null}
 */
function resolveExternalPackage(packageName, cwd) {
  const externals = discoverExternalPackages(cwd);
  return externals.find(ext => ext.name === packageName) ?? null;
}

/**
 * @param {string} [name]
 * @param {object} [options]
 * @param {string} [options.cwd]
 * @param {boolean} [options.list]
 * @param {string} [options.category]
 * @param {string} [options.package] - Scope to a specific external package (e.g. '@acme/xds-widgets')
 * @param {boolean} [options.props]
 * @param {boolean} [options.source]
 * @param {boolean} [options.showcase]
 * @param {boolean} [options.blocks]
 * @param {'full'|'compact'|'brief'} [options.detail] - Defaults to 'full' for a single component, 'brief' for list views (list/category/no name), matching the CLI.
 * @param {string} [options.lang]
 * @param {boolean} [options.zh]
 * @param {boolean} [options.dense]
 * @returns {Promise<{type: string, data: unknown}>}
 */
export async function component(name, options = {}) {
  const {
    cwd = process.cwd(),
    list = false,
    category,
    package: packageScope,
    props = false,
    source = false,
    showcase = false,
    blocks = false,
    detail: detailOption,
    lang = null,
    zh = false,
    dense = false,
  } = options;

  // Default detail level mirrors the CLI (see commands/component/index.mjs):
  // single-component views default to 'full', list-style views (--list,
  // --category, or no name) default to 'brief' (scannable name lists).
  // Keeping this in sync with the CLI is what the API↔CLI parity test checks.
  const isListView = list || category != null || !name;
  const detail = detailOption ?? (isListView ? 'brief' : 'full');

  const coreDir = findCoreDir(cwd);
  if (!coreDir) {
    throw new AstryxError('Could not find @astryxdesign/core package', undefined, ERROR_CODES.ERR_CORE_NOT_FOUND);
  }

  // ── List mode ──────────────────────────────────────────────────

  if (category || list || !name) {
    const {loadedIntegrations, hiddenComponents} =
      await loadProjectContextSafely(cwd);
    const components = discoverComponents(coreDir);

    // Config-hidden core components are dropped from every list detail level
    // (brief/compact/full and --category). Categories left empty disappear.
    if (hiddenComponents.size > 0) {
      for (const [cat, comps] of Object.entries(components)) {
        const visible = comps.filter(
          c => !isComponentHidden(hiddenComponents, CORE_PACKAGE, c),
        );
        if (visible.length === 0) {
          delete components[cat];
        } else {
          components[cat] = visible;
        }
      }
    }

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
        const entries = [];
        for (const comp of match[1]) {
          const readme = findComponentReadme(coreDir, comp);
          if (readme && readme.endsWith('.doc.mjs')) {
            try {
              const docs = await loadDocs(readme, {zh, lang});
              entries.push({name: comp, description: docs.usage?.description || docs.description || '', import: resolveImportPath(coreDir, comp)});
            } catch {
              entries.push({name: comp, description: '', import: resolveImportPath(coreDir, comp)});
            }
          } else {
            entries.push({name: comp, description: '', import: resolveImportPath(coreDir, comp)});
          }
        }
        return {type: 'component.brief', data: {[match[0]]: entries}};
      }

      if (detail === 'full') {
        const entries = [];
        for (const comp of match[1]) {
          const readme = findComponentReadme(coreDir, comp);
          if (readme && readme.endsWith('.doc.mjs')) {
            try {
              entries.push(await loadDocs(readme, {zh, lang, dense}));
            } catch {
              entries.push({name: `XDS${comp}`, description: ''});
            }
          } else {
            entries.push({name: `XDS${comp}`, description: ''});
          }
        }
        return {type: 'component.full', data: {[match[0]]: entries}};
      }

      // Default: brief — package-qualified object list for the category.
      // Pre-1.0 JSON contract: members are {name, package} objects, not bare
      // strings, so consumers can disambiguate ownership.
      return {
        type: 'component.list',
        data: {[match[0]]: match[1].map(n => ({name: n, package: CORE_PACKAGE}))},
      };
    }

    // All components — merge core + external packages with grouped subcategories
    if (detail === 'compact') {
      /** @type {Record<string, Array<import('../types/component').ComponentBriefEntry>>} */
      const result = {};
      for (const [cat, comps] of Object.entries(components)) {
        result[cat] = [];
        for (const comp of comps) {
          const readme = findComponentReadme(coreDir, comp);
          if (readme && readme.endsWith('.doc.mjs')) {
            try {
              const docs = await loadDocs(readme, {zh, lang});
              result[cat].push({name: comp, description: docs.usage?.description || docs.description || '', import: resolveImportPath(coreDir, comp)});
            } catch {
              result[cat].push({name: comp, description: '', import: resolveImportPath(coreDir, comp)});
            }
          } else {
            result[cat].push({name: comp, description: '', import: resolveImportPath(coreDir, comp)});
          }
        }
      }
      return {type: 'component.brief', data: result};
    }

    if (detail === 'full') {
      /** @type {Record<string, Array<unknown>>} */
      const result = {};
      for (const [cat, comps] of Object.entries(components)) {
        result[cat] = [];
        for (const comp of comps) {
          const readme = findComponentReadme(coreDir, comp);
          if (readme && readme.endsWith('.doc.mjs')) {
            try {
              result[cat].push(await loadDocs(readme, {zh, lang, dense}));
            } catch {
              result[cat].push({name: `XDS${comp}`, description: ''});
            }
          } else {
            result[cat].push({name: `XDS${comp}`, description: ''});
          }
        }
      }
      return {type: 'component.full', data: result};
    }

    // Default: brief — package-qualified object list (core + integrations).
    // Pre-1.0 JSON contract: each group's members are {name, package} objects.
    /** @type {Record<string, Array<{name: string, package: string}>>} */
    const listData = {};
    for (const [cat, comps] of Object.entries(components)) {
      listData[cat] = comps.map(n => ({name: n, package: CORE_PACKAGE}));
    }

    // Integration components (authoritative source: loadedIntegrations).
    const seenIntegration = new Set();
    for (const integration of loadedIntegrations) {
      seenIntegration.add(integration.name);
      const owned = discoverIntegrationComponents(integration).filter(
        rec => !isComponentHidden(hiddenComponents, integration.name, rec.name),
      );
      // Group integration components by their doc `group`, falling back to the
      // package name. Keys are package-qualified so they never collide with
      // core groups or each other.
      /** @type {Map<string, Array<{name: string, package: string}>>} */
      const byGroup = new Map();
      for (const rec of owned) {
        const groupLabel = rec.group ?? integration.name;
        const key = `${groupLabel} (${integration.name})`;
        if (!byGroup.has(key)) byGroup.set(key, []);
        byGroup.get(key).push({name: rec.name, package: integration.name});
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
          const visible = members.filter(
            n => !isComponentHidden(hiddenComponents, ext.name, n),
          );
          if (visible.length === 0) continue;
          listData[`${group} (${ext.name})`] = visible.map(n => ({
            name: n,
            package: ext.name,
          }));
        }
      } else {
        const allComps = Object.values(grouped)
          .flat()
          .filter(n => !isComponentHidden(hiddenComponents, ext.name, n))
          .sort();
        if (allComps.length > 0) {
          listData[`${ext.category} (${ext.name})`] = allComps.map(n => ({
            name: n,
            package: ext.name,
          }));
        }
      }
    }
    return {type: 'component.list', data: listData};
  }

  // ── Single component ───────────────────────────────────────────

  if (typeof name !== 'string') {
    throw new AstryxError(
      `No component named "${String(name)}"`,
      undefined,
      ERROR_CODES.ERR_UNKNOWN_COMPONENT,
    );
  }

  const dirName = name.replace(/^XDS/, '');

  // Ownership-aware resolution. Build the set of OWNER packages that provide a
  // component with this name across core + every loaded integration. This is
  // what lets the CLI disambiguate by package and expose the owner's source +
  // issuesUrl (the inputs the future integration-component swizzle needs).
  const {loadedIntegrations, hiddenComponents} =
    await loadProjectContextSafely(cwd);
  const coreDocPath = findComponentReadme(coreDir, dirName);
  /**
   * @type {Array<{
   *   package: string,
   *   docPath: string,
   *   sourcePath: string|null,
   *   issuesUrl: string|undefined,
   *   integration: object|null,
   * }>}
   */
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

  // Config-hidden owners are excluded from UNSCOPED resolution only. An
  // explicit --package scope still resolves them (deliberate escape hatch:
  // hidden components keep readable docs and stay swizzleable). This is what
  // lets a config hide core's component so an integration replacement
  // becomes the single authoritative owner instead of an ambiguity error.
  const visibleOwners = owners.filter(
    o => !isComponentHidden(hiddenComponents, o.package, dirName),
  );

  /**
   * Augment a loaded `component.detail` doc with ownership metadata. Adds
   * `package`, the resolved `import` specifier, and `sourceAvailable` (whether
   * a swizzleable source file exists for the owner). Existing doc fields
   * (name, usage, props, …) are preserved.
   * @param {object} docs
   * @param {{package: string, sourcePath: string|null}} owner
   * @param {string} componentName
   */
  function withOwnership(docs, owner, componentName) {
    const importSpec =
      owner.package === CORE_PACKAGE
        ? resolveImportPath(coreDir, componentName)
        : `${owner.package}/${componentName}`;
    return {
      ...docs,
      package: owner.package,
      import: importSpec,
      sourceAvailable: owner.sourcePath != null,
    };
  }

  // When scoped to a specific package, search that package first.
  // This is critical for components that exist in both core and an external
  // package (e.g. AppShell, Button, SideNav) — the package scope ensures
  // the external package's docs are returned, not core's.
  if (packageScope) {
    // Core scope: resolve from core directly.
    if (packageScope === CORE_PACKAGE) {
      const owner = owners.find(o => o.package === CORE_PACKAGE);
      if (!owner) {
        throw new AstryxError(`No component "${name}" in package "${packageScope}"`, undefined, ERROR_CODES.ERR_UNKNOWN_COMPONENT);
      }
      if (source) {
        if (!owner.sourcePath) {
          throw new AstryxError(`Source for "${name}" not found`, undefined, ERROR_CODES.ERR_NO_SOURCE);
        }
        return {type: 'component.detail.source', data: {component: dirName, source: fs.readFileSync(owner.sourcePath, 'utf-8')}};
      }
      const docs = await loadDocs(owner.docPath, {zh, dense, lang});
      if (props) {
        const p = docs.props || (docs.components ? docs.components.flatMap(c => c.props || []) : []);
        return {type: 'component.detail.props', data: p};
      }
      return {type: 'component.detail', data: withOwnership(docs, owner, dirName)};
    }

    // Integration scope (authoritative): resolve from the loaded integration.
    const integration = findLoadedIntegration(loadedIntegrations, packageScope);
    if (integration) {
      const owner = owners.find(o => o.package === packageScope);
      if (!owner) {
        throw new AstryxError(`No component "${name}" in package "${packageScope}"`, undefined, ERROR_CODES.ERR_UNKNOWN_COMPONENT);
      }
      if (source) {
        if (!owner.sourcePath) {
          throw new AstryxError(`Source for "${name}" not found in package "${packageScope}"`, undefined, ERROR_CODES.ERR_NO_SOURCE);
        }
        return {type: 'component.detail.source', data: {component: dirName, source: fs.readFileSync(owner.sourcePath, 'utf-8')}};
      }
      const docs = await loadDocs(owner.docPath, {zh, dense, lang});
      if (props) {
        const p = docs.props || (docs.components ? docs.components.flatMap(c => c.props || []) : []);
        return {type: 'component.detail.props', data: p};
      }
      return {type: 'component.detail', data: withOwnership(docs, owner, dirName)};
    }

    // Legacy fallback: node_modules `pkg.astryx.docs` external package.
    const ext = resolveExternalPackage(packageScope, cwd);
    if (!ext) {
      throw new AstryxError(`External package "${packageScope}" not found`, undefined, ERROR_CODES.ERR_UNKNOWN_PACKAGE);
    }

    if (showcase) {
      const match = await findShowcase(dirName, cwd, {package: packageScope});
      if (!match) {
        throw new AstryxError(`No showcase found for "${name}" in package "${packageScope}"`, undefined, ERROR_CODES.ERR_NO_SHOWCASE);
      }
      return {
        type: 'component.detail.showcase',
        data: {
          component: dirName,
          aspectRatio: match.aspectRatio,
          source: fs.readFileSync(match.filePath, 'utf-8'),
        },
      };
    }

    const extDocPath = findExternalComponentDoc(ext.docsDir, dirName);
    if (extDocPath && extDocPath.endsWith('.doc.mjs')) {
      const docs = await loadDocs(extDocPath, {zh, dense, lang});

      if (props) {
        const p = docs.props || (docs.components ? docs.components.flatMap(c => c.props || []) : []);
        return {type: 'component.detail.props', data: p};
      }
      return {
        type: 'component.detail',
        data: withOwnership(docs, {package: ext.name, sourcePath: null}, dirName),
      };
    }
    throw new AstryxError(`No component "${name}" in package "${packageScope}"`, undefined, ERROR_CODES.ERR_UNKNOWN_COMPONENT);
  }

  // Ambiguity: when the name is owned by MORE THAN ONE package (core and/or
  // integrations) and the caller did not scope with --package, refuse to guess.
  // NOTE: legacy `pkg.astryx.docs` externals are intentionally NOT part of this
  // ambiguity set — they retain their historical core-first fallback below so
  // existing consumers (and tests) keep working. Only config-driven integration
  // ownership participates here.
  if (visibleOwners.length > 1) {
    throw new AstryxError(
      `Component "${dirName}" is provided by multiple packages. Re-run with --package <pkg> to choose one.`,
      visibleOwners.map(o => ({name: o.package, reason: 'provides this component'})),
      ERROR_CODES.ERR_UNKNOWN_COMPONENT,
    );
  }

  // Single non-core owner (an integration provides it, core does not or core
  // is config-hidden) — resolve from that integration so the integration
  // component is authoritative.
  if (visibleOwners.length === 1 && visibleOwners[0].package !== CORE_PACKAGE) {
    const owner = visibleOwners[0];
    if (source) {
      if (!owner.sourcePath) {
        throw new AstryxError(`Source for "${name}" not found`, undefined, ERROR_CODES.ERR_NO_SOURCE);
      }
      return {type: 'component.detail.source', data: {component: dirName, source: fs.readFileSync(owner.sourcePath, 'utf-8')}};
    }
    if (showcase) {
      throw new AstryxError(`No showcase found for "${name}"`, undefined, ERROR_CODES.ERR_NO_SHOWCASE);
    }
    const docs = await loadDocs(owner.docPath, {zh, dense, lang});
    if (props) {
      const p = docs.props || (docs.components ? docs.components.flatMap(c => c.props || []) : []);
      return {type: 'component.detail.props', data: p};
    }
    return {type: 'component.detail', data: withOwnership(docs, owner, dirName)};
  }

  // From here down resolution falls back to core (then legacy externals).
  // A config-hidden core component must not resolve on these UNSCOPED paths.
  const coreHidden = isComponentHidden(hiddenComponents, CORE_PACKAGE, dirName);

  if (source) {
    const sourcePath = coreHidden ? null : findComponentSource(coreDir, dirName);
    if (!sourcePath) {
      throw new AstryxError(`Source for "${name}" not found`, undefined, ERROR_CODES.ERR_NO_SOURCE);
    }
    return {type: 'component.detail.source', data: {component: dirName, source: fs.readFileSync(sourcePath, 'utf-8')}};
  }

  if (showcase) {
    const match = await findShowcase(dirName, cwd);
    if (!match) {
      throw new AstryxError(`No showcase found for "${name}"`, undefined, ERROR_CODES.ERR_NO_SHOWCASE);
    }
    return {
      type: 'component.detail.showcase',
      data: {
        component: dirName,
        aspectRatio: match.aspectRatio,
        source: fs.readFileSync(match.filePath, 'utf-8'),
      },
    };
  }

  let readmePath = coreHidden ? null : findComponentReadme(coreDir, dirName);
  let resolvedName = dirName;
  // Track the resolving owner so the detail payload can carry ownership info.
  // Defaults to core; the legacy-external fallback below may reassign it.
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
    // Hidden components don't participate in fuzzy resolution/suggestions.
    if (hiddenComponents.size > 0) {
      for (const [cat, comps] of Object.entries(components)) {
        components[cat] = comps.filter(
          c => !isComponentHidden(hiddenComponents, CORE_PACKAGE, c),
        );
      }
    }
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

  const docs = await loadDocs(readmePath, {zh, dense, lang});

  // ── Blocks mode ──────────────────────────────────────────────
  if (blocks) {
    const allBlocks = await findRelatedBlocks(dirName);
    const toEntry = (b) => ({
      name: b.dirName,
      displayName: b.name,
      description: b.description,
      isShowcase: b.isShowcase ?? false,
      category: b.category,
    });

    // Examples: blocks in the component's own directory, or
    // componentsUsed match for sub-components without a directory.
    const ownDir = allBlocks.filter(b => path.basename(b.category) === dirName);
    const examples = ownDir.length > 0
      ? ownDir
      : allBlocks.filter(b => b.componentsUsed?.some(c => c === dirName));
    const exampleSet = new Set(examples.map(b => b.dirName));

    // Showcase: the single hero example from the examples list.
    const showcaseBlock = examples.find(b => b.isShowcase) || null;

    // Related: everything else that uses this component but isn't
    // primarily about it (e.g. a Dialog block that has a Button).
    const related = allBlocks.filter(b => !exampleSet.has(b.dirName));

    return {
      type: 'component.detail.blocks',
      data: {
        component: dirName,
        showcase: showcaseBlock ? toEntry(showcaseBlock) : null,
        examples: examples.filter(b => b !== showcaseBlock).map(toEntry),
        related: related.map(toEntry),
      },
    };
  }

  // ── Sub-component scoping ────────────────────────────────────
  // If the user asked for "Code" but the doc is for "CodeBlock" (parent),
  // scope the response to just the matching sub-component.
  const requestedXDS = `XDS${dirName}`;
  const isParentDoc = docs.name && docs.name.toLowerCase() !== dirName.toLowerCase();
  const matchingComponent = isParentDoc && docs.components
    ? docs.components.find(c => c.name === requestedXDS || c.name === dirName)
    : null;

  if (matchingComponent) {
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

    if (props) {
      return {type: 'component.detail.props', data: matchingComponent.props || []};
    }
    return {
      type: 'component.detail',
      data: withOwnership(
        scoped,
        {package: resolvedOwnerPackage, sourcePath: resolvedSourcePath},
        dirName,
      ),
    };
  }

  if (props) {
    const p = docs.props || (docs.components ? docs.components.flatMap(c => c.props || []) : []);
    return {type: 'component.detail.props', data: p};
  }

  return {
    type: 'component.detail',
    data: withOwnership(
      docs,
      {package: resolvedOwnerPackage, sourcePath: resolvedSourcePath},
      resolvedName,
    ),
  };
}
