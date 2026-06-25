// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Programmatic API for the component command.
 *
 * Returns the same typed envelope { type, data } that `astryx --json component` outputs.
 * The CLI command handler is a thin wrapper around this function.
 */

import * as fs from 'node:fs';
import {ERROR_CODES} from '../lib/error-codes.mjs';
import {findCoreDir, discoverExternalPackages} from '../utils/paths.mjs';
import {
  discoverComponents,
  discoverExternalComponentsGrouped,
  findComponentReadme,
  findComponentSource,
  findExternalComponentDoc,
  resolveImportPath,
} from '../lib/component-discovery.mjs';
import {loadDocs} from '../lib/component-loader.mjs';
import {searchComponents} from '../lib/string-utils.mjs';
import {AstryxError} from './error.mjs';
import {findShowcase, findRelatedBlocks} from './template.mjs';

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

      // Default: brief — names only
      return {type: 'component.list', data: {[match[0]]: match[1]}};
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

    // Default: brief — names only (with externals merged in)
    const externals = discoverExternalPackages(cwd);
    for (const ext of externals) {
      const grouped = discoverExternalComponentsGrouped(ext.docsDir);
      const groupKeys = Object.keys(grouped);
      if (groupKeys.length === 0) continue;

      // If the package has subcategories (groups), emit each as a separate key.
      // If no groups exist, fall back to the flat list under one key.
      const hasGroups = groupKeys.some(
        k => grouped[k].length > 1 || grouped[k][0] !== k,
      );

      if (hasGroups) {
        for (const [group, members] of Object.entries(grouped)) {
          components[`${group} (${ext.name})`] = members;
        }
      } else {
        // All ungrouped — single flat list under the package category
        const allComps = Object.values(grouped).flat().sort();
        if (allComps.length > 0) {
          components[`${ext.category} (${ext.name})`] = allComps;
        }
      }
    }
    return {type: 'component.list', data: components};
  }

  // ── Single component ───────────────────────────────────────────

  const dirName = name.replace(/^XDS/, '');

  // When scoped to a specific package, search that package first.
  // This is critical for components that exist in both core and an external
  // package (e.g. AppShell, Button, SideNav) — the package scope ensures
  // the external package's docs are returned, not core's.
  if (packageScope) {
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
      return {type: 'component.detail', data: docs};
    }
    throw new AstryxError(`No component "${name}" in package "${packageScope}"`, undefined, ERROR_CODES.ERR_UNKNOWN_COMPONENT);
  }

  if (source) {
    const sourcePath = findComponentSource(coreDir, dirName);
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

  let readmePath = findComponentReadme(coreDir, dirName);
  let resolvedName = dirName;

  if (!readmePath) {
    const externals = discoverExternalPackages(cwd);
    for (const ext of externals) {
      const extDocPath = findExternalComponentDoc(ext.docsDir, dirName);
      if (extDocPath) {
        readmePath = extDocPath;
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
    const ownDir = allBlocks.filter(b => b.category.split('/').pop() === dirName);
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
    return {type: 'component.detail', data: scoped};
  }

  if (props) {
    const p = docs.props || (docs.components ? docs.components.flatMap(c => c.props || []) : []);
    return {type: 'component.detail.props', data: p};
  }

  return {type: 'component.detail', data: docs};
}
