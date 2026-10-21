// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Static JavaScript module export inspection.
 *
 * Proves a runtime export without executing package code. Local ESM re-exports
 * are followed recursively; unresolved or unparsable modules fail closed.
 *
 * @input A module path and runtime export name, or a module path and the
 *   exports to try
 * @output Whether that export can be proved statically and the file that
 *   declares it, or the exported object literal as plain data
 * @position packages/cli/foundation/discovery — shared package inspection
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {parse} from '@babel/parser';
import {findInstalledPackage} from '../fs/paths.mjs';
import {inspectPackageExport} from './package-exports.mjs';

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
// The options jscodeshift's tsx parser passes to Babel, so the same sources
// parse, without tokens or the recast layer: these reads only look at the tree.
/** @type {import('@babel/parser').ParserOptions} */
const PARSE_OPTIONS = /** @type {any} */ ({
  sourceType: 'module',
  allowImportExportEverywhere: true,
  allowReturnOutsideFunction: true,
  plugins: [
    'jsx',
    'asyncGenerators',
    'decoratorAutoAccessors',
    'bigInt',
    'classPrivateMethods',
    'classPrivateProperties',
    'classProperties',
    'decorators-legacy',
    'doExpressions',
    'dynamicImport',
    'exportDefaultFrom',
    'exportExtensions',
    'exportNamespaceFrom',
    'functionBind',
    'functionSent',
    'importAttributes',
    'importMeta',
    'nullishCoalescingOperator',
    'numericSeparator',
    'objectRestSpread',
    'optionalCatchBinding',
    'optionalChaining',
    ['pipelineOperator', {proposal: 'minimal'}],
    'throwExpressions',
    'typescript',
  ],
});

/**
 * Modules parsed in this process, by path, reused while the file is unchanged:
 * one command can ask about the same module more than once.
 * @type {Map<string, {stamp: string, ast: any}>}
 */
const parsedModules = new Map();

/**
 * Module texts read in this process, by path, reused while the file is
 * unchanged.
 * @type {Map<string, {stamp: string, text: string}>}
 */
const moduleTexts = new Map();

/**
 * A file's identity for these caches: size and mtime, plus ctime and inode,
 * which change when a file is rewritten even if npm stamps the same mtime on it.
 * @param {string} file
 */
function fileStamp(file) {
  const {size, mtimeMs, ctimeMs, ino} = fs.statSync(file);
  return `${size}:${mtimeMs}:${ctimeMs}:${ino}`;
}

/** @param {string} file */
function moduleText(file) {
  const stamp = fileStamp(file);
  const cached = moduleTexts.get(file);
  if (cached?.stamp === stamp) return cached.text;
  const text = fs.readFileSync(file, 'utf-8');
  moduleTexts.set(file, {stamp, text});
  return text;
}

/** @param {string} file */
function parseModule(file) {
  const stamp = fileStamp(file);
  const cached = parsedModules.get(file);
  if (cached?.stamp === stamp) return cached.ast;
  const ast = parse(moduleText(file), PARSE_OPTIONS);
  parsedModules.set(file, {stamp, ast});
  return ast;
}

// `export *`: the one way a module exports a name it never writes.
const EXPORT_ALL_RE = /\bexport\s*\*/;

/**
 * Whether `text` has `word` with no identifier character on either side.
 * @param {string} text
 * @param {string} word
 */
function writesWord(text, word) {
  for (
    let at = text.indexOf(word);
    at !== -1;
    at = text.indexOf(word, at + 1)
  ) {
    const before = text[at - 1] ?? '';
    const after = text[at + word.length] ?? '';
    if (!/[\w$]/.test(before) && !/[\w$]/.test(after)) return true;
  }
  return false;
}

const NOT_CHILDREN = new Set([
  'loc',
  'start',
  'end',
  'extra',
  'comments',
  'leadingComments',
  'trailingComments',
  'innerComments',
]);

/**
 * Every node of `type` in the tree, at any depth, in source order.
 * @param {any} node
 * @param {string} type
 * @param {any[]} [found]
 * @returns {any[]}
 */
function nodesOfType(node, type, found = []) {
  if (Array.isArray(node)) {
    for (const child of node) nodesOfType(child, type, found);
    return found;
  }
  if (node == null || typeof node !== 'object') return found;
  if (node.type === type) found.push(node);
  for (const key in node) {
    if (NOT_CHILDREN.has(key)) continue;
    const child = node[key];
    if (child != null && typeof child === 'object') {
      nodesOfType(child, type, found);
    }
  }
  return found;
}

/** @param {unknown} specifier @param {string} fromFile */
function resolveLocalModule(specifier, fromFile) {
  if (typeof specifier !== 'string' || !specifier.startsWith('.')) return null;
  const base = path.resolve(path.dirname(fromFile), specifier);
  const candidates = [
    base,
    ...MODULE_EXTENSIONS.map(extension => `${base}${extension}`),
    ...MODULE_EXTENSIONS.map(extension => path.join(base, `index${extension}`)),
  ];
  return (
    candidates.find(candidate => {
      try {
        return fs.statSync(candidate).isFile();
      } catch {
        return false;
      }
    }) ?? null
  );
}

/**
 * The file a re-export's specifier names, from the file that writes it: a
 * relative path, or an installed package (its `exports` map honored, else
 * its `module` or `main`), found through node_modules from that file. Only
 * the icon-set readers follow packages; every other reader in this module
 * uses {@link resolveLocalModule}, which follows relative paths alone.
 * @param {unknown} specifier
 * @param {string} fromFile
 */
function resolveModuleOrPackage(specifier, fromFile) {
  if (typeof specifier !== 'string') return null;
  if (!specifier.startsWith('.'))
    return resolvePackageModule(specifier, fromFile);
  return resolveLocalModule(specifier, fromFile);
}

/**
 * @param {string} specifier a bare package specifier, with an optional subpath
 * @param {string} fromFile
 * @returns {string | null}
 */
function resolvePackageModule(specifier, fromFile) {
  if (specifier.startsWith('node:') || specifier.startsWith('/')) return null;
  const parts = specifier.split('/');
  const count = specifier.startsWith('@') ? 2 : 1;
  const name = parts.slice(0, count).join('/');
  const rest = parts.slice(count).join('/');
  // Node's own resolution: every ancestor's node_modules, no depth cap.
  const packageDir = findInstalledPackage(
    path.dirname(fromFile),
    name,
    Infinity,
  );
  if (!packageDir) return null;
  /** @type {Record<string, any>} */
  let pkg;
  try {
    pkg = JSON.parse(
      fs.readFileSync(path.join(packageDir, 'package.json'), 'utf-8'),
    );
  } catch {
    return null;
  }
  if (pkg.exports !== undefined) {
    return inspectPackageExport(pkg, packageDir, rest ? `./${rest}` : '.')
      .target;
  }
  const entry = rest || pkg.module || pkg.main || 'index';
  const base = path.join(packageDir, entry);
  return (
    [
      base,
      ...MODULE_EXTENSIONS.map(extension => `${base}${extension}`),
      ...MODULE_EXTENSIONS.map(extension =>
        path.join(base, `index${extension}`),
      ),
    ].find(candidate => {
      try {
        return fs.statSync(candidate).isFile();
      } catch {
        return false;
      }
    }) ?? null
  );
}

/**
 * The first module, from `file` through its relative re-exports, that does
 * not parse, with the parser's message; null when every one parses.
 * @param {string} file
 * @returns {{file: string, message: string} | null}
 */
export function moduleParseFailure(file) {
  /** @type {Set<string>} */
  const seen = new Set();
  /** @type {string[]} */
  const queue = [file];
  while (queue.length > 0) {
    const next = /** @type {string} */ (queue.shift());
    if (seen.has(next)) continue;
    seen.add(next);
    let ast;
    try {
      ast = parseModule(next);
    } catch (error) {
      return {
        file: next,
        message: error instanceof Error ? error.message : String(error),
      };
    }
    for (const type of ['ExportNamedDeclaration', 'ExportAllDeclaration']) {
      for (const node of nodesOfType(ast.program, type)) {
        const specifier = node.source?.value;
        if (typeof specifier !== 'string' || !specifier.startsWith('.')) {
          continue;
        }
        const target = resolveLocalModule(specifier, next);
        if (target) queue.push(target);
      }
    }
  }
  return null;
}

/**
 * The re-exports of a module whose source the reader could not follow:
 * each `export ... from '<specifier>'` that resolves to no file.
 * @param {string} file
 * @returns {string[]}
 */
export function unfollowedReexports(file) {
  let ast;
  try {
    ast = parseModule(file);
  } catch {
    return [];
  }
  /** @type {Set<string>} */
  const missing = new Set();
  for (const type of ['ExportNamedDeclaration', 'ExportAllDeclaration']) {
    for (const node of nodesOfType(ast.program, type)) {
      const specifier = node.source?.value;
      if (typeof specifier !== 'string' || node.exportKind === 'type') continue;
      if (!resolveModuleOrPackage(specifier, file)) missing.add(specifier);
    }
  }
  return [...missing].sort();
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
 * @returns {boolean}
 */
export function moduleExportsName(file, exportName, seen = new Set()) {
  return moduleExportSource(file, exportName, seen) != null;
}

/**
 * The file that declares a module's runtime export, without executing it (the
 * module, or where a local re-export leads); null when it cannot be proved.
 * @param {string} file
 * @param {string} exportName
 * @param {Set<string>} [seen]
 * @returns {string | null}
 */
export function moduleExportSource(file, exportName, seen = new Set()) {
  const identity = `${file}\0${exportName}`;
  if (seen.has(identity)) return null;
  seen.add(identity);
  let text;
  try {
    if (!fs.statSync(file).isFile()) return null;
    text = moduleText(file);
  } catch {
    return null;
  }
  // A module whose text writes neither the export's name as a word nor
  // `export *` cannot export it, so it is not parsed. Any `export *` text, even
  // in a comment, leaves the answer to the parsed tree below.
  if (
    exportName !== 'default' &&
    !writesWord(text, exportName) &&
    !EXPORT_ALL_RE.test(text)
  ) {
    return null;
  }

  let ast;
  try {
    ast = parseModule(file);
  } catch {
    return null;
  }

  /** @type {string | null} */
  let found = null;
  nodesOfType(ast.program, 'ExportNamedDeclaration').forEach(
    (/** @type {any} */ node) => {
      if (found || node.exportKind === 'type') return;
      if (declarationExports(node.declaration, exportName)) {
        found = file;
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
          found = file;
          return;
        }
        const target = resolveLocalModule(node.source.value, file);
        const imported =
          specifier.local?.name ?? specifier.local?.value ?? exportName;
        const declared = target
          ? moduleExportSource(target, imported, seen)
          : null;
        if (declared) {
          found = declared;
          return;
        }
      }
    },
  );
  if (found) return found;

  if (exportName === 'default') {
    const defaults = nodesOfType(ast.program, 'ExportDefaultDeclaration');
    if (
      defaults.some((/** @type {any} */ node) =>
        runtimeDefault(node.declaration),
      )
    ) {
      return file;
    }
  }

  nodesOfType(ast.program, 'ExportAllDeclaration').forEach(
    (/** @type {any} */ node) => {
      if (found || node.exportKind === 'type') return;
      const target = resolveLocalModule(node.source?.value, file);
      if (target) found = moduleExportSource(target, exportName, seen);
    },
  );
  return found;
}

/** The calls that make a React element: createElement, jsx, jsxs, jsxDEV. */
const ELEMENT_CALLS = new Set([
  'createElement',
  'jsx',
  'jsxs',
  'jsxDEV',
  '_jsx',
  '_jsxs',
  '_jsxDEV',
]);

/** @param {any} callee */
function isElementCall(callee) {
  if (callee?.type === 'Identifier') return ELEMENT_CALLS.has(callee.name);
  return (
    callee?.type === 'MemberExpression' &&
    !callee.computed &&
    callee.property?.type === 'Identifier' &&
    ELEMENT_CALLS.has(callee.property.name)
  );
}

/**
 * Marks an object {@link staticExportObject} returns (or one inside it) whose
 * source also has properties or spreads it could not read as literals. Not
 * enumerable, so the object compares and serializes as its literal properties.
 */
export const HAS_COMPUTED = Symbol('hasComputed');

const TS_WRAPPERS = new Set([
  'TSSatisfiesExpression',
  'TSAsExpression',
  'TSNonNullExpression',
  'ParenthesizedExpression',
]);

/** @param {any} node */
function withoutTypeWrappers(node) {
  let current = node;
  while (current && TS_WRAPPERS.has(current.type)) current = current.expression;
  return current;
}

/**
 * The object a module exports, as plain data, read without running it: the
 * first of `exportNames` it exports, an object literal in place or a top-level
 * binding (under `satisfies` or `as` too). Only literal values are kept;
 * anything computed, or overridable by a later spread, is left out.
 *
 * @param {string} file
 * @param {readonly string[]} exportNames `default` or named exports, in order
 * @returns {Record<string, unknown> | null}
 */
export function staticExportObject(file, exportNames) {
  /** @type {any[]} */
  let body;
  try {
    body = parseModule(file).program.body;
  } catch {
    return null;
  }

  /** @type {Map<string, any>} top-level bindings to their initializers */
  const bindings = new Map();
  for (const statement of body) {
    const declaration =
      statement.type === 'ExportNamedDeclaration'
        ? statement.declaration
        : statement;
    if (declaration?.type !== 'VariableDeclaration') continue;
    for (const declarator of declaration.declarations) {
      if (declarator.id?.type === 'Identifier' && declarator.init) {
        bindings.set(declarator.id.name, declarator.init);
      }
    }
  }

  /** @param {string} name @returns {any} undefined when not exported */
  const exported = name => {
    for (const statement of body) {
      if (name === 'default' && statement.type === 'ExportDefaultDeclaration') {
        return statement.declaration;
      }
      if (
        statement.type !== 'ExportNamedDeclaration' ||
        statement.exportKind === 'type'
      ) {
        continue;
      }
      if (statement.declaration?.type === 'VariableDeclaration') {
        const declarator = statement.declaration.declarations.find(
          (/** @type {any} */ item) =>
            item.id?.type === 'Identifier' && item.id.name === name,
        );
        if (declarator) return declarator.init ?? null;
      }
      if (statement.source) continue;
      for (const specifier of statement.specifiers ?? []) {
        const as = specifier.exported?.name ?? specifier.exported?.value;
        if (specifier.type === 'ExportSpecifier' && as === name) {
          return {type: 'Identifier', name: specifier.local?.name};
        }
      }
    }
    return undefined;
  };

  /**
   * @param {any} node
   * @param {Set<string>} following bindings being followed, against cycles
   * @returns {unknown} undefined when the value is not a literal
   */
  const literal = (node, following) => {
    const value = withoutTypeWrappers(node);
    switch (value?.type) {
      case 'StringLiteral':
      case 'NumericLiteral':
      case 'BooleanLiteral':
        return value.value;
      case 'NullLiteral':
        return null;
      case 'TemplateLiteral':
        return value.expressions.length === 0
          ? value.quasis[0]?.value.cooked
          : undefined;
      case 'Identifier': {
        if (!bindings.has(value.name) || following.has(value.name)) {
          return undefined;
        }
        const next = new Set(following).add(value.name);
        return literal(bindings.get(value.name), next);
      }
      case 'ArrayExpression':
        return value.elements
          .map((/** @type {any} */ element) =>
            element == null || element.type === 'SpreadElement'
              ? undefined
              : literal(element, following),
          )
          .filter((/** @type {unknown} */ item) => item !== undefined);
      case 'ObjectExpression': {
        /** @type {Record<string, unknown>} */
        let object = {};
        let computed = false;
        for (const property of value.properties) {
          if (property.type === 'SpreadElement') {
            object = {};
            computed = true;
            continue;
          }
          const key = property.computed
            ? undefined
            : (property.key?.name ?? property.key?.value);
          const item =
            typeof key === 'string' && property.type === 'ObjectProperty'
              ? literal(property.value, following)
              : undefined;
          if (item === undefined) computed = true;
          if (typeof key !== 'string') continue;
          if (item === undefined) delete object[key];
          else object[key] = item;
        }
        if (computed) {
          Object.defineProperty(object, HAS_COMPUTED, {value: true});
        }
        return object;
      }
      default:
        return undefined;
    }
  };

  for (const exportName of exportNames) {
    const node = exported(exportName);
    if (node === undefined) continue;
    const value = literal(node, new Set());
    return value != null && typeof value === 'object' && !Array.isArray(value)
      ? /** @type {Record<string, unknown>} */ (value)
      : null;
  }
  return null;
}

/**
 * Where a module's runtime export is declared, as the file and the name it
 * has there, without executing anything: local re-exports, renames, and
 * imported bindings a module exports again are followed. Two exports are the
 * same value when their origins are equal. Null when it cannot be proved.
 * @param {string} file
 * @param {string} exportName
 * @param {Set<string>} [seen]
 * @returns {{file: string, name: string} | null}
 */
export function moduleExportOrigin(file, exportName, seen = new Set()) {
  const identity = `${file}\0${exportName}`;
  if (seen.has(identity)) return null;
  seen.add(identity);
  let ast;
  try {
    if (!fs.statSync(file).isFile()) return null;
    ast = parseModule(file);
  } catch {
    return null;
  }
  for (const node of nodesOfType(ast.program, 'ExportNamedDeclaration')) {
    if (node.exportKind === 'type') continue;
    if (declarationExports(node.declaration, exportName)) {
      return {file, name: exportName};
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
      const local =
        specifier.local?.name ?? specifier.local?.value ?? exportName;
      if (node.source) {
        const target = resolveModuleOrPackage(node.source.value, file);
        const origin = target ? moduleExportOrigin(target, local, seen) : null;
        if (origin) return origin;
        continue;
      }
      return bindingOrigin(ast, file, local, seen);
    }
  }
  if (exportName === 'default') {
    for (const node of nodesOfType(ast.program, 'ExportDefaultDeclaration')) {
      const declaration = node.declaration;
      if (!runtimeDefault(declaration)) continue;
      if (declaration.type === 'Identifier') {
        return bindingOrigin(ast, file, declaration.name, seen);
      }
      return {file, name: 'default'};
    }
  }
  for (const node of nodesOfType(ast.program, 'ExportAllDeclaration')) {
    if (node.exportKind === 'type' || node.exported) continue;
    const target = resolveModuleOrPackage(node.source?.value, file);
    const origin = target ? moduleExportOrigin(target, exportName, seen) : null;
    if (origin) return origin;
  }
  return null;
}

/**
 * Every runtime export name of a module, read without running it: its own
 * named exports and, through `export *` from local files, theirs. Type-only
 * exports and `default` are left out. Sorted.
 * @param {string} file
 * @param {Set<string>} [seen]
 * @returns {string[]}
 */
export function moduleExportNames(file, seen = new Set()) {
  if (seen.has(file)) return [];
  seen.add(file);
  let ast;
  try {
    if (!fs.statSync(file).isFile()) return [];
    ast = parseModule(file);
  } catch {
    return [];
  }
  /** @type {Set<string>} */
  const names = new Set();
  for (const node of nodesOfType(ast.program, 'ExportNamedDeclaration')) {
    if (node.exportKind === 'type') continue;
    const declaration = node.declaration;
    if (declaration && declaration.declare !== true) {
      if (
        ['FunctionDeclaration', 'ClassDeclaration'].includes(declaration.type)
      ) {
        if (declaration.id?.name) names.add(declaration.id.name);
      } else if (declaration.type === 'VariableDeclaration') {
        for (const item of declaration.declarations) {
          if (item.id?.type === 'Identifier') names.add(item.id.name);
        }
      }
    }
    for (const specifier of node.specifiers ?? []) {
      if (
        specifier.type !== 'ExportSpecifier' ||
        specifier.exportKind === 'type'
      ) {
        continue;
      }
      const exported = specifier.exported?.name ?? specifier.exported?.value;
      if (typeof exported === 'string' && exported !== 'default') {
        names.add(exported);
      }
    }
  }
  for (const node of nodesOfType(ast.program, 'ExportAllDeclaration')) {
    if (node.exportKind === 'type' || node.exported) continue;
    const target = resolveModuleOrPackage(node.source?.value, file);
    if (target) {
      for (const name of moduleExportNames(target, seen)) names.add(name);
    }
  }
  return [...names].sort();
}

/**
 * What a module's runtime export is, read without running it: `component`
 * for a function, a class, or a value a call returns (`forwardRef(...)`);
 * `data` for an object, array, or other literal; `unknown` when it cannot be
 * read.
 * @param {string} file
 * @param {string} exportName
 * @returns {'component' | 'data' | 'unknown'}
 */
export function exportValueKind(file, exportName) {
  const origin = moduleExportOrigin(file, exportName);
  if (!origin) return 'unknown';
  let ast;
  try {
    ast = parseModule(origin.file);
  } catch {
    return 'unknown';
  }
  /** @param {any} node @returns {'component' | 'data' | 'unknown'} */
  const kindOf = node => {
    const value = withoutTypeWrappers(node);
    if (!value) return 'unknown';
    if (
      [
        'FunctionDeclaration',
        'FunctionExpression',
        'ArrowFunctionExpression',
        'ClassDeclaration',
        'ClassExpression',
        'CallExpression',
      ].includes(value.type)
    ) {
      return 'component';
    }
    if (
      [
        'ObjectExpression',
        'ArrayExpression',
        'StringLiteral',
        'NumericLiteral',
        'BooleanLiteral',
        'TemplateLiteral',
        'NullLiteral',
      ].includes(value.type)
    ) {
      return 'data';
    }
    return 'unknown';
  };
  if (origin.name === 'default') {
    const [node] = nodesOfType(ast.program, 'ExportDefaultDeclaration');
    return node ? kindOf(node.declaration) : 'unknown';
  }
  for (const statement of ast.program.body) {
    const declaration =
      statement.type === 'ExportNamedDeclaration'
        ? statement.declaration
        : statement;
    if (!declaration) continue;
    if (
      ['FunctionDeclaration', 'ClassDeclaration'].includes(declaration.type) &&
      declaration.id?.name === origin.name
    ) {
      return 'component';
    }
    if (declaration.type !== 'VariableDeclaration') continue;
    for (const declarator of declaration.declarations) {
      if (
        declarator.id?.type === 'Identifier' &&
        declarator.id.name === origin.name
      ) {
        return kindOf(declarator.init);
      }
    }
  }
  return 'unknown';
}

/**
 * The scalar type of an export's static value: `string` for a string or a
 * template literal with no expressions, `number` or `boolean` for those
 * literals; null for anything else, or when the value cannot be read.
 * @param {string} file
 * @param {string} exportName
 * @returns {'string' | 'number' | 'boolean' | null}
 */
export function exportScalarType(file, exportName) {
  const origin = moduleExportOrigin(file, exportName);
  if (!origin) return null;
  let ast;
  try {
    ast = parseModule(origin.file);
  } catch {
    return null;
  }
  /** @param {any} node */
  const typeOf = node => {
    const value = withoutTypeWrappers(node);
    if (value?.type === 'StringLiteral') return 'string';
    if (value?.type === 'TemplateLiteral' && value.expressions.length === 0) {
      return 'string';
    }
    if (value?.type === 'NumericLiteral') return 'number';
    if (value?.type === 'BooleanLiteral') return 'boolean';
    return null;
  };
  if (origin.name === 'default') {
    const [node] = nodesOfType(ast.program, 'ExportDefaultDeclaration');
    return node ? typeOf(node.declaration) : null;
  }
  for (const statement of ast.program.body) {
    const declaration =
      statement.type === 'ExportNamedDeclaration'
        ? statement.declaration
        : statement;
    if (declaration?.type !== 'VariableDeclaration') continue;
    for (const declarator of declaration.declarations) {
      if (
        declarator.id?.type === 'Identifier' &&
        declarator.id.name === origin.name
      ) {
        return typeOf(declarator.init);
      }
    }
  }
  return null;
}

/**
 * Where a top-level binding of a parsed module comes from: an import from a
 * local module is followed to its origin; anything else is declared here.
 * @param {any} ast
 * @param {string} file
 * @param {string} local
 * @param {Set<string>} seen
 * @returns {{file: string, name: string} | null}
 */
function bindingOrigin(ast, file, local, seen) {
  for (const node of ast.program.body) {
    if (node.type !== 'ImportDeclaration' || node.importKind === 'type') {
      continue;
    }
    for (const specifier of node.specifiers ?? []) {
      if (specifier.local?.name !== local) continue;
      if (specifier.type !== 'ImportSpecifier') return null;
      const imported =
        specifier.imported?.name ?? specifier.imported?.value ?? local;
      const target = resolveModuleOrPackage(node.source.value, file);
      return target ? moduleExportOrigin(target, imported, seen) : null;
    }
  }
  return {file, name: local};
}

/**
 * The object a module exports under `exportName`, read without running it:
 * each property's key and the binding its value names (an identifier, or the
 * element name of `<Name />`), followed to where that binding is declared.
 * The export itself is followed through re-exports first. A property whose
 * value is anything else maps to null, so a caller can leave it unchecked.
 * Null when the export is not one static object literal.
 * @param {string} file
 * @param {string} exportName
 * @returns {Map<string, {file: string, name: string} | null> | null}
 */
export function staticExportBindings(file, exportName) {
  const origin = moduleExportOrigin(file, exportName);
  if (!origin) return null;
  let ast;
  try {
    ast = parseModule(origin.file);
  } catch {
    return null;
  }
  /** @type {any} */
  let init = null;
  for (const statement of ast.program.body) {
    const declaration =
      statement.type === 'ExportNamedDeclaration'
        ? statement.declaration
        : statement;
    if (declaration?.type !== 'VariableDeclaration') continue;
    for (const declarator of declaration.declarations) {
      if (
        declarator.id?.type === 'Identifier' &&
        declarator.id.name === origin.name
      ) {
        init = declarator.init;
      }
    }
  }
  const object = withoutTypeWrappers(init);
  if (object?.type !== 'ObjectExpression') return null;
  /** @type {Map<string, {file: string, name: string} | null>} */
  const bindings = new Map();
  for (const property of object.properties) {
    if (property.type !== 'ObjectProperty' || property.computed) return null;
    const key = property.key?.name ?? property.key?.value;
    if (typeof key !== 'string') return null;
    let value = withoutTypeWrappers(property.value);
    if (value?.type === 'JSXElement') {
      const name = value.openingElement?.name;
      value =
        name?.type === 'JSXIdentifier'
          ? {type: 'Identifier', name: name.name}
          : null;
    } else if (
      value?.type === 'CallExpression' &&
      isElementCall(value.callee)
    ) {
      // createElement(X, ...), React.createElement(X, ...), jsx(X, ...),
      // _jsx(X, ...): the element of component X.
      const first = withoutTypeWrappers(value.arguments?.[0]);
      value = first?.type === 'Identifier' ? first : null;
    }
    bindings.set(
      key,
      value?.type === 'Identifier'
        ? bindingOrigin(ast, origin.file, value.name, new Set())
        : null,
    );
  }
  return bindings;
}
