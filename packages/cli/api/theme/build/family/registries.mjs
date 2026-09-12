// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file registries.mjs
 * @input Per-member authored registry bindings and resolved family lineage
 * @output Static collision-safe imports and complete registry expressions
 * @position AST-034 FR7/FR8 registry preservation boundary
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {allocateImportBindings} from './bindings.mjs';

const MODULE_EXTENSIONS = [
  '.ts',
  '.tsx',
  '.mts',
  '.cts',
  '.mtsx',
  '.ctsx',
  '.mjs',
  '.cjs',
  '.js',
  '.json',
];

/** @param {string} sourceFile @param {string} specifier */
function resolveRelativeImport(sourceFile, specifier) {
  const base = path.resolve(path.dirname(sourceFile), specifier);
  const candidates = [
    base,
    ...MODULE_EXTENSIONS.map(extension => `${base}${extension}`),
    ...MODULE_EXTENSIONS.map(extension => path.join(base, `index${extension}`)),
  ];
  return candidates.find(candidate => fs.existsSync(candidate)) ?? base;
}

/** @param {unknown} value @param {Set<object>} [seen] @returns {boolean} */
function isJsonValue(value, seen = new Set()) {
  if (
    value == null ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return true;
  }
  if (typeof value !== 'object' || seen.has(value)) return false;
  seen.add(value);
  const valid = /** @type {boolean} */ (
    Array.isArray(value)
      ? value.every(item => isJsonValue(item, seen))
      : Object.values(value).every(item => isJsonValue(item, seen))
  );
  seen.delete(value);
  return valid;
}

/** @param {any} request */
function renderImport(request) {
  const specifier = JSON.stringify(request.specifier);
  if (request.importKind === 'default') {
    return `import ${request.binding} from ${specifier};`;
  }
  if (request.importKind === 'namespace') {
    return `import * as ${request.binding} from ${specifier};`;
  }
  return request.importedName === request.binding
    ? `import {${request.importedName}} from ${specifier};`
    : `import {${request.importedName} as ${request.binding}} from ${specifier};`;
}

/**
 * @param {object} input
 * @param {{order: Array<{name: string, parentName: string|null, theme: any}>}} input.graph
 * @param {Map<any, any>} input.preparedByTheme
 * @param {string | undefined} input.iconsSpecifier
 * @param {Iterable<string>} input.reserved
 */
export function planFamilyRegistries(input) {
  const {graph, preparedByTheme, iconsSpecifier, reserved} = input;
  /** @type {any[]} */
  const requests = [];
  /** @type {Map<string, Record<string, any>>} */
  const own = new Map();
  const iconSources = new Set();

  for (const node of graph.order) {
    const prepared = preparedByTheme.get(node.theme);
    if (!prepared) throw new Error(`No prepared source for "${node.name}".`);
    /** @type {Record<string, any>} */
    const roles = {};
    for (const [role, info] of /** @type {Array<[string, any]>} */ ([
      ['icons', prepared.iconInfo],
      ['indicators', prepared.indicatorInfo],
    ])) {
      const hasOwn = Object.prototype.hasOwnProperty.call(
        prepared.rawInput,
        role,
      );
      if (!hasOwn) continue;
      const ownValue = prepared.rawInput[role];
      if (info) {
        let specifier = info.importPath;
        let sourceKey = specifier;
        if (specifier.startsWith('.')) {
          const target = resolveRelativeImport(prepared.filePath, specifier);
          sourceKey = target;
          // Local registry modules are bundled into the one family ESM. The
          // absolute path exists only in this in-memory entry and cannot reach
          // the emitted bytes; this keeps both browser-URL and Node-realpath
          // resolution correct through the `current` symlink.
          specifier = target;
        }
        if (role === 'icons') {
          iconSources.add(sourceKey);
          if (iconsSpecifier) {
            if (
              iconsSpecifier.startsWith('.') ||
              path.isAbsolute(iconsSpecifier)
            ) {
              const overrideTarget = iconsSpecifier.startsWith('.')
                ? resolveRelativeImport(prepared.filePath, iconsSpecifier)
                : iconsSpecifier;
              if (!fs.existsSync(overrideTarget)) {
                throw new Error(
                  `Family icon override module does not exist: ${overrideTarget}`,
                );
              }
              specifier = overrideTarget;
            } else {
              specifier = iconsSpecifier;
            }
          }
        }
        const id = `${node.name}:${role}`;
        requests.push({...info, id, specifier});
        roles[role] = {
          kind: 'import',
          requestId: id,
          memberAccess: info.memberAccess ?? '',
        };
      } else if (isJsonValue(ownValue)) {
        roles[role] = {kind: 'literal', value: ownValue};
      } else {
        const id = `${node.name}:${role}:source`;
        requests.push({
          id,
          specifier: prepared.filePath,
          importedName: '*',
          importKind: 'namespace',
          sourceLocalName: `source_${node.name}`,
        });
        roles[role] = {
          kind: 'source',
          requestId: id,
          memberName: node.name,
          role,
          keys: Object.keys(ownValue ?? {}),
        };
      }
    }
    own.set(node.name, roles);
  }

  if (iconsSpecifier && iconSources.size > 1) {
    throw new Error(
      '--icons-specifier cannot replace more than one distinct family icon registry.',
    );
  }

  const allocation = allocateImportBindings(requests, reserved);
  /** @type {Map<string, Record<string, string | undefined>>} */
  const expressions = new Map();
  for (const node of graph.order) {
    const parent = node.parentName
      ? expressions.get(node.parentName)
      : undefined;
    const ownRoles = own.get(node.name) ?? {};
    /** @type {Record<string, string | undefined>} */
    const result = {};
    for (const role of ['icons', 'indicators']) {
      const inherited = parent?.[role];
      const descriptor = ownRoles[role];
      let authored;
      if (descriptor?.kind === 'import') {
        const binding = allocation.byRequest.get(descriptor.requestId);
        authored = `${binding}${descriptor.memberAccess}`;
      } else if (descriptor?.kind === 'literal') {
        authored = JSON.stringify(descriptor.value);
      } else if (descriptor?.kind === 'source') {
        const sourceBinding = allocation.byRequest.get(descriptor.requestId);
        const complete = `__astryxPickTheme(${sourceBinding}, ${JSON.stringify(descriptor.memberName)}).${descriptor.role}`;
        authored = `Object.fromEntries(${JSON.stringify(descriptor.keys)}.map(key => [key, ${complete}[key]]))`;
      }
      result[role] =
        inherited && authored
          ? `{...${inherited}, ...${authored}}`
          : (authored ?? inherited);
      if (!result[role] && node.theme[role] !== undefined) {
        if (!isJsonValue(node.theme[role])) {
          throw new Error(
            `Theme "${node.name}" has unresolved ${role} values in its complete member data.`,
          );
        }
        result[role] = JSON.stringify(node.theme[role]);
      }
    }
    expressions.set(node.name, result);
  }

  return {
    imports: allocation.imports.map(renderImport),
    expressions,
    requests,
    external:
      iconsSpecifier &&
      !iconsSpecifier.startsWith('.') &&
      !path.isAbsolute(iconsSpecifier)
        ? [iconsSpecifier]
        : [],
    needsPickHelper: requests.some(request => request.id.endsWith(':source')),
  };
}
