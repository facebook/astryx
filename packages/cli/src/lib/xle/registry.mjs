// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file XLE component registry — built from @xds/core .doc.mjs metadata.
 *
 * Everything the layout language knows about components (valid names,
 * aliases, props, enums, slots) is derived from the same .doc.mjs files
 * that power `xds component`, so the notation can never drift from the
 * branch's actual API. The pure pieces (alias table, enum parsing,
 * resolution, serialize/hydrate) live in registry-core.mjs so they can
 * run in the browser; this module adds the fs-bound builder.
 *
 * @input  packages/core/src/(star)/(star).doc.mjs via component-discovery
 * @output buildRegistry() → { components, aliases, componentNames }
 * @position lib/xle — shared by parse/validate/expand; no CLI concerns here
 */

import {findCoreDir} from '../../utils/paths.mjs';
import {
  discoverComponents,
  findComponentReadme,
  resolveImportPath,
} from '../component-discovery.mjs';
import {loadDocs} from '../component-loader.mjs';
import {
  ALIAS_TABLE,
  normalizeName,
  toComponentEntry,
} from './registry-core.mjs';

// Re-export the pure surface so existing importers (and tests) keep working.
export {
  ALIAS_TABLE,
  SPACING_STEPS,
  parseEnumValues,
  resolveComponent,
  serializeRegistry,
  hydrateRegistry,
} from './registry-core.mjs';

function findDirFor(grouped, member) {
  for (const [dir, members] of Object.entries(grouped)) {
    if (members.includes(member)) return dir;
  }
  return null;
}

let cachedRegistry = null;

/**
 * Build (and cache) the registry: every documented component keyed by its
 * un-prefixed name, plus the validated alias map.
 *
 * @param {object} [options]
 * @param {string} [options.cwd]
 * @returns {Promise<{components: Map<string, object>, aliases: Map<string, string>, componentNames: string[]}>}
 */
export async function buildRegistry({cwd = process.cwd()} = {}) {
  if (cachedRegistry) return cachedRegistry;

  const coreDir = findCoreDir(cwd);
  if (!coreDir) {
    throw new Error('Could not find @xds/core package — run from an XDS workspace');
  }

  const components = new Map();
  const grouped = discoverComponents(coreDir);
  const dirNames = [...new Set(Object.values(grouped).flat())];

  for (const dirName of dirNames) {
    const readme = findComponentReadme(coreDir, dirName);
    if (!readme || !readme.endsWith('.doc.mjs')) continue;
    let docs;
    try {
      docs = await loadDocs(readme, {});
    } catch {
      continue; // a malformed doc must not take down the whole language
    }
    const importPath = resolveImportPath(coreDir, dirName);

    const register = (rawName, props) => {
      const name = normalizeName(rawName);
      const entry = toComponentEntry(name, props, dirName, importPath);
      const existing = components.get(name);
      // Some docs list related components with empty prop arrays
      // (e.g. Layout's references to Card) — prefer the richer entry.
      if (!existing || entry.props.size > existing.props.size) {
        components.set(name, entry);
      }
    };

    if (docs.props) register(docs.name || dirName, docs.props);
    for (const sub of docs.components || []) {
      if (sub?.name) register(sub.name, sub.props);
    }
  }

  // Exported components without their own doc entry (e.g. TableHeader,
  // TableBody) still get minimal registry entries so they can be named in
  // expressions — the validator warns rather than validates their props.
  for (const [, members] of Object.entries(grouped)) {
    for (const member of members) {
      const name = normalizeName(member);
      if (components.has(name)) continue;
      const entry = toComponentEntry(name, [], findDirFor(grouped, member) || name, resolveImportPath(coreDir, member));
      entry.undocumented = true;
      components.set(name, entry);
    }
  }

  const aliases = new Map();
  for (const [alias, target] of Object.entries(ALIAS_TABLE)) {
    if (components.has(target)) aliases.set(alias, target);
  }

  cachedRegistry = {
    components,
    aliases,
    componentNames: [...components.keys()].sort(),
  };
  return cachedRegistry;
}

/** Test seam — drop the module-level cache. */
export function resetRegistryCache() {
  cachedRegistry = null;
}
