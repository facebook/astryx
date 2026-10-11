// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Static JavaScript module export inspection.
 *
 * Proves a runtime export without executing package code. Local ESM re-exports
 * are followed recursively; unresolved or unparsable modules fail closed.
 *
 * @input A module path and runtime export name
 * @output Whether that export can be proved statically
 * @position packages/cli/foundation/discovery — shared package inspection
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import jscodeshift from 'jscodeshift';

const MODULE_EXTENSIONS = [
  '.mjs',
  '.js',
  '.cjs',
  '.mts',
  '.ts',
  '.cts',
  '.tsx',
  '.jsx',
];
const parser = jscodeshift.withParser('tsx');

/** @param {unknown} specifier @param {string} fromFile */
function resolveLocalModule(specifier, fromFile) {
  if (typeof specifier !== 'string' || !specifier.startsWith('.')) return null;
  const base = path.resolve(path.dirname(fromFile), specifier);
  const candidates = [
    base,
    ...MODULE_EXTENSIONS.map(extension => `${base}${extension}`),
    ...MODULE_EXTENSIONS.map(extension => path.join(base, `index${extension}`)),
  ];
  return candidates.find(candidate => {
    try {
      return fs.statSync(candidate).isFile();
    } catch {
      return false;
    }
  }) ?? null;
}

/** @param {any} declaration @param {string} exportName */
function declarationExports(declaration, exportName) {
  if (!declaration || declaration.declare === true) return false;
  if (['FunctionDeclaration', 'ClassDeclaration'].includes(declaration.type)) {
    return declaration.id?.name === exportName;
  }
  if (declaration.type !== 'VariableDeclaration') return false;
  return declaration.declarations.some(
    (/** @type {any} */ item) =>
      item.id?.type === 'Identifier' && item.id.name === exportName,
  );
}

/** @param {any} declaration */
function runtimeDefault(declaration) {
  return (
    declaration != null &&
    declaration.declare !== true &&
    ![
      'TSDeclareFunction',
      'TSInterfaceDeclaration',
      'TSTypeAliasDeclaration',
    ].includes(declaration.type)
  );
}

/**
 * Check one module's static export surface without executing it.
 * @param {string} file
 * @param {string} exportName
 * @param {Set<string>} [seen]
 */
export function moduleExportsName(file, exportName, seen = new Set()) {
  const identity = `${file}\0${exportName}`;
  if (seen.has(identity)) return false;
  seen.add(identity);
  try {
    if (!fs.statSync(file).isFile()) return false;
  } catch {
    return false;
  }

  let root;
  try {
    root = parser(fs.readFileSync(file, 'utf-8'));
  } catch {
    return false;
  }

  let found = false;
  root
    .find(parser.ExportNamedDeclaration)
    .forEach((/** @type {any} */ exportPath) => {
      if (found || exportPath.node.exportKind === 'type') return;
      const node = exportPath.node;
      if (declarationExports(node.declaration, exportName)) {
        found = true;
        return;
      }
      for (const specifier of node.specifiers ?? []) {
        if (
          specifier.type !== 'ExportSpecifier' ||
          specifier.exportKind === 'type'
        ) {
          continue;
        }
        const exported = specifier.exported?.name ?? specifier.exported?.value;
        if (exported !== exportName) continue;
        if (!node.source) {
          found = true;
          return;
        }
        const target = resolveLocalModule(node.source.value, file);
        const imported =
          specifier.local?.name ?? specifier.local?.value ?? exportName;
        if (target && moduleExportsName(target, imported, seen)) {
          found = true;
          return;
        }
      }
    });
  if (found) return true;

  if (exportName === 'default') {
    const defaults = root.find(parser.ExportDefaultDeclaration).nodes();
    if (defaults.some((/** @type {any} */ node) => runtimeDefault(node.declaration))) {
      return true;
    }
  }

  root
    .find(parser.ExportAllDeclaration)
    .forEach((/** @type {any} */ exportPath) => {
      if (found || exportPath.node.exportKind === 'type') return;
      const target = resolveLocalModule(exportPath.node.source?.value, file);
      if (target && moduleExportsName(target, exportName, seen)) found = true;
    });
  return found;
}
