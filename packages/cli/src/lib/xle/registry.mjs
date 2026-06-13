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

import * as fs from 'node:fs';
import * as path from 'node:path';
import {pathToFileURL} from 'node:url';
import {findXdsPackageDir} from '../../utils/paths.mjs';
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

/**
 * Discover a docs-only target package. Unlike @xds/core, non-web targets may
 * not have TSX implementation files; the .doc.mjs files are the component
 * specification the layout grammar validates against.
 */
function discoverDocComponents(packageDir) {
  const srcDir = path.join(packageDir, 'src');
  const grouped = {};
  if (!fs.existsSync(srcDir)) return grouped;

  function scan(dirPath) {
    const entries = fs.readdirSync(dirPath, {withFileTypes: true});
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        scan(fullPath);
      } else if (entry.name.endsWith('.doc.mjs')) {
        const dirName = path.basename(path.dirname(fullPath));
        grouped[dirName] = [dirName];
      }
    }
  }

  scan(srcDir);
  return Object.fromEntries(Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)));
}

async function loadComponentSpec(packageDir, dirName) {
  const specPath = path.join(packageDir, 'src', dirName, `${dirName}.spec.mjs`);
  if (!fs.existsSync(specPath)) return null;
  try {
    const mod = await import(pathToFileURL(specPath).href);
    return mod.spec || null;
  } catch {
    return null;
  }
}

async function loadPayloadRenderer(packageDir, dirName) {
  const rendererPath = path.join(packageDir, 'src', dirName, 'renderers', 'payload.mjs');
  if (!fs.existsSync(rendererPath)) return null;
  try {
    const mod = await import(pathToFileURL(rendererPath).href);
    return typeof mod.renderPayload === 'function' ? mod.renderPayload : null;
  } catch {
    return null;
  }
}

const TARGET_PACKAGES = {
  core: {packageName: '@xds/core', packageDirName: 'core'},
  glasses: {packageName: '@xds/glasses', packageDirName: 'glasses'},
};

const cachedRegistries = new Map();

function resolveTarget(target = 'core') {
  const info = TARGET_PACKAGES[target];
  if (!info) {
    throw new Error(`Unknown layout target '${target}'. Expected one of: ${Object.keys(TARGET_PACKAGES).join(', ')}`);
  }
  return info;
}

/**
 * Build (and cache) the registry: every documented component keyed by its
 * un-prefixed name, plus the validated alias map.
 *
 * @param {object} [options]
 * @param {string} [options.cwd]
 * @param {'core'|'glasses'} [options.target] - Component package target to validate against.
 * @returns {Promise<{components: Map<string, object>, aliases: Map<string, string>, componentNames: string[], target: string, packageName: string}>}
 */
export async function buildRegistry({cwd = process.cwd(), target = 'core'} = {}) {
  const targetInfo = resolveTarget(target);
  const packageDir = findXdsPackageDir(targetInfo.packageDirName, cwd);
  if (!packageDir) {
    throw new Error(`Could not find ${targetInfo.packageName} package — run from an XDS workspace or install the package`);
  }

  const cacheKey = `${target}:${packageDir}`;
  if (cachedRegistries.has(cacheKey)) return cachedRegistries.get(cacheKey);

  const components = new Map();
  const grouped = target === 'core' ? discoverComponents(packageDir) : discoverDocComponents(packageDir);
  const dirNames = [...new Set(Object.values(grouped).flat())];

  for (const dirName of dirNames) {
    const readme = findComponentReadme(packageDir, dirName);
    if (!readme || !readme.endsWith('.doc.mjs')) continue;
    let docs;
    try {
      docs = await loadDocs(readme, {});
    } catch {
      continue; // a malformed doc must not take down the whole language
    }
    const importPath = resolveImportPath(packageDir, dirName, targetInfo.packageName);
    const spec = await loadComponentSpec(packageDir, dirName);
    const payloadRenderer = await loadPayloadRenderer(packageDir, dirName);

    const register = (rawName, props) => {
      const name = normalizeName(rawName);
      const entry = toComponentEntry(name, props, dirName, importPath);
      if (spec) entry.spec = spec;
      if (payloadRenderer) entry.renderers = {payload: payloadRenderer};
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
      const entry = toComponentEntry(name, [], findDirFor(grouped, member) || name, resolveImportPath(packageDir, member, targetInfo.packageName));
      entry.undocumented = true;
      components.set(name, entry);
    }
  }

  const aliases = new Map();
  for (const [alias, target] of Object.entries(ALIAS_TABLE)) {
    if (components.has(target)) aliases.set(alias, target);
  }

  const registry = {
    components,
    aliases,
    componentNames: [...components.keys()].sort(),
    target,
    packageName: targetInfo.packageName,
  };
  cachedRegistries.set(cacheKey, registry);
  return registry;
}

/** Test seam — drop the module-level cache. */
export function resetRegistryCache() {
  cachedRegistries.clear();
}
