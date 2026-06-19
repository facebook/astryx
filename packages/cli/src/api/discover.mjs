// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Programmatic API for the discover command.
 */

import {loadConfig} from '../lib/config.mjs';
import {scanAllPackages, findComponentInPackages} from '../lib/package-scanner.mjs';
import {loadDocs} from '../lib/component-loader.mjs';
import {levenshteinDistance} from '../lib/string-utils.mjs';
import {XDSError} from './error.mjs';
import {ERROR_CODES} from '../lib/error-codes.mjs';

function validateDocs(docs) {
  if (!docs || typeof docs !== 'object') return 'docs export is missing or not an object';
  if (typeof docs.name !== 'string' || !docs.name) return 'docs.name is missing or not a string';
  if (!docs.usage || typeof docs.usage.description !== 'string') return 'docs.usage.description is missing or not a string';
  if (docs.props && !Array.isArray(docs.props)) return 'docs.props must be an array';
  if (docs.components && !Array.isArray(docs.components)) return 'docs.components must be an array';
  if (docs.usage?.bestPractices && !Array.isArray(docs.usage.bestPractices)) return 'docs.usage.bestPractices must be an array';
  return null;
}

/**
 * @param {string} [query]
 * @param {object} [options]
 * @param {boolean} [options.components]
 * @param {string} [options.lang]
 * @param {boolean} [options.zh]
 * @returns {Promise<{type: string, data: unknown}>}
 */
export async function discover(query, options = {}) {
  const {lang = null, zh = false} = options;
  const config = await loadConfig();
  const toEntry = (pkg) => ({
    name: pkg.name,
    category: pkg.category,
    components: pkg.components,
    version: pkg.version,
    description: pkg.description,
    displayName: pkg.displayName,
  });

  if (config.packages.length === 0) {
    return {type: 'discover.list', data: [], meta: {configured: false}};
  }

  const packages = scanAllPackages(config.packages);

  if (packages.length === 0) {
    return {type: 'discover.list', data: [], meta: {configured: true}};
  }

  if (!query) {
    return {type: 'discover.list', data: packages.map(toEntry)};
  }

  // Scoped package query: @scope/name or @scope/name/Component
  if (query.startsWith('@')) {
    const slashIdx = query.indexOf('/', query.indexOf('/') + 1);
    if (slashIdx > 0) {
      const pkgName = query.slice(0, slashIdx);
      const compName = query.slice(slashIdx + 1);
      return await resolveComponentDocs(packages, compName, pkgName, {lang, zh});
    }

    const pkg = packages.find(p => p.name === query);
    if (!pkg) {
      throw new XDSError(
        `Package "${query}" not found`,
        packages.map(p => ({name: p.name, reason: 'available package'})),
        ERROR_CODES.ERR_UNKNOWN_PACKAGE,
      );
    }
    return {type: 'discover.detail', data: toEntry(pkg)};
  }

  // Search mode
  const lower = query.toLowerCase();

  const exact = findComponentInPackages(packages, query);
  if (exact) {
    return await loadAndValidate(exact, {lang, zh});
  }

  const substringMatches = [];
  for (const pkg of packages) {
    for (const comp of pkg.components) {
      if (comp.toLowerCase().includes(lower)) {
        substringMatches.push({pkg, comp});
      }
    }
  }

  if (substringMatches.length === 1) {
    const match = substringMatches[0];
    const result = findComponentInPackages([match.pkg], match.comp);
    if (result) return await loadAndValidate(result, {lang, zh});
  }

  if (substringMatches.length > 1) {
    return {type: 'discover.search', data: {query, matches: substringMatches.map(m => ({package: m.pkg.name, component: m.comp}))}};
  }

  // Fuzzy fallback
  const allComponents = [];
  for (const pkg of packages) {
    for (const comp of pkg.components) {
      allComponents.push({pkg, comp});
    }
  }
  const fuzzyMatches = allComponents
    .map(item => ({...item, distance: levenshteinDistance(lower, item.comp.toLowerCase())}))
    .filter(m => m.distance <= 3)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 5);

  if (fuzzyMatches.length > 0) {
    throw new XDSError(
      `"${query}" not found`,
      fuzzyMatches.map(m => ({name: m.pkg.name + '/' + m.comp, reason: 'similar name'})),
      ERROR_CODES.ERR_NOT_FOUND,
    );
  }

  throw new XDSError(`"${query}" not found in any package`, undefined, ERROR_CODES.ERR_NOT_FOUND);
}

async function resolveComponentDocs(packages, compName, pkgName, {lang, zh}) {
  const pkg = packages.find(p => p.name === pkgName);
  if (!pkg) throw new XDSError(`Package "${pkgName}" not found`, undefined, ERROR_CODES.ERR_UNKNOWN_PACKAGE);

  const result = findComponentInPackages([pkg], compName);
  if (!result) {
    const lower = compName.toLowerCase();
    const hits = pkg.components.filter(c => c.toLowerCase().includes(lower));
    const suggestions = hits.length > 0
      ? hits
      : pkg.components
        .map(c => ({name: c, distance: levenshteinDistance(lower, c.toLowerCase())}))
        .filter(m => m.distance <= 3)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 5)
        .map(m => m.name);
    throw new XDSError(
      `Component "${compName}" not found in ${pkgName}`,
      suggestions.map(s => ({name: s, reason: 'similar name'})),
      ERROR_CODES.ERR_UNKNOWN_COMPONENT,
    );
  }

  return await loadAndValidate(result, {lang, zh});
}

async function loadAndValidate(result, {lang, zh}) {
  let docs;
  try {
    docs = await loadDocs(result.docPath, {zh, lang});
  } catch (e) {
    throw new XDSError(`Failed to load docs for ${result.componentName}: ${e.message}`, undefined, ERROR_CODES.ERR_INVALID_DOC);
  }
  const err = validateDocs(docs);
  if (err) throw new XDSError(`Invalid docs for ${result.componentName}: ${err}`, undefined, ERROR_CODES.ERR_INVALID_DOC);
  return {type: 'discover.detail.doc', data: docs};
}
