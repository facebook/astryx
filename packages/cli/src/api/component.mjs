/**
 * @file Programmatic API for the component command.
 *
 * Returns the same typed envelope { type, data } that `xds --json component` outputs.
 * The CLI command handler is a thin wrapper around this function.
 */

import * as fs from 'node:fs';
import {findCoreDir, discoverExternalPackages} from '../utils/paths.mjs';
import {
  discoverComponents,
  discoverExternalComponents,
  findComponentReadme,
  findComponentSource,
  findExternalComponentDoc,
  resolveImportPath,
} from '../lib/component-discovery.mjs';
import {loadDocs} from '../lib/component-loader.mjs';
import {searchComponents} from '../lib/string-utils.mjs';
import {XDSError} from './error.mjs';
import {findShowcase, findRelatedBlocks} from './template.mjs';

/**
 * @param {string} [name]
 * @param {object} [options]
 * @param {string} [options.cwd]
 * @param {boolean} [options.list]
 * @param {string} [options.category]
 * @param {boolean} [options.props]
 * @param {boolean} [options.source]
 * @param {boolean} [options.showcase]
 * @param {boolean} [options.blocks]
 * @param {'full'|'compact'|'brief'} [options.detail]
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
    props = false,
    source = false,
    showcase = false,
    blocks = false,
    detail = 'full',
    lang = null,
    zh = false,
    dense = false,
  } = options;

  const coreDir = findCoreDir(cwd);
  if (!coreDir) {
    throw new XDSError('Could not find @xds/core package');
  }

  // ── List mode ──────────────────────────────────────────────────

  if (category || list || !name) {
    const components = discoverComponents(coreDir);

    if (category) {
      const match = Object.entries(components).find(
        ([key]) => key.toLowerCase() === category.toLowerCase(),
      );
      if (!match) {
        throw new XDSError(
          `Unknown category "${category}"`,
          Object.keys(components).map(k => ({name: k, reason: 'valid category'})),
        );
      }

      if (detail === 'brief') {
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

      return {type: 'component.list', data: {[match[0]]: match[1]}};
    }

    // All components
    if (detail === 'brief') {
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

    const externals = discoverExternalPackages(cwd);
    for (const ext of externals) {
      const extComps = discoverExternalComponents(ext.docsDir);
      if (extComps.length > 0) {
        components[`${ext.category} (${ext.name})`] = extComps;
      }
    }
    return {type: 'component.list', data: components};
  }

  // ── Single component ───────────────────────────────────────────

  const dirName = name.replace(/^XDS/, '');

  if (source) {
    const sourcePath = findComponentSource(coreDir, dirName);
    if (!sourcePath) {
      throw new XDSError(`Source for "${name}" not found`);
    }
    return {type: 'component.detail.source', data: {component: dirName, source: fs.readFileSync(sourcePath, 'utf-8')}};
  }

  if (showcase) {
    const match = await findShowcase(dirName);
    if (!match) {
      throw new XDSError(`No showcase found for "${name}"`);
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
  let fromExternal = null;

  if (!readmePath) {
    const externals = discoverExternalPackages(cwd);
    for (const ext of externals) {
      const extDocPath = findExternalComponentDoc(ext.docsDir, dirName);
      if (extDocPath) {
        readmePath = extDocPath;
        fromExternal = ext;
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
        throw new XDSError(
          `No component named "${name}"`,
          candidates.map(c => ({name: c.name, reason: c.reason})),
        );
      }
    } else {
      throw new XDSError(`No component named "${name}"`);
    }
  }

  if (!readmePath || !readmePath.endsWith('.doc.mjs')) {
    throw new XDSError(`No .doc.mjs found for "${resolvedName}". The component needs a typed doc file.`);
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
