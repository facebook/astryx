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
    if (defaults.some((/** @type {any} */ node) => runtimeDefault(node.declaration))) {
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

/**
 * The module's own top-level statements of one type: an `export` inside a
 * TypeScript namespace names a member of that namespace, not of the module.
 * @param {any} program
 * @param {string} type
 * @returns {any[]}
 */
function topLevel(program, type) {
  return program.body.filter((/** @type {any} */ node) => node.type === type);
}

/**
 * Every runtime name a module exports that this read can see (`default` for
 * a default export), or null when it cannot see them all: an `export *`, `export =`, CommonJS exports, or a
 * file that does not parse.
 * @param {string} file
 * @returns {string[] | null}
 */
export function moduleExportNames(file) {
  let text;
  let ast;
  try {
    if (!fs.statSync(file).isFile()) return null;
    text = moduleText(file);
    ast = parseModule(file);
  } catch {
    return null;
  }
  if (/\bmodule\.exports\b|\bexports\.[$\w]/u.test(text)) return null;
  if (
    topLevel(ast.program, 'TSExportAssignment').length > 0 ||
    topLevel(ast.program, 'ExportAllDeclaration').length > 0
  ) {
    return null;
  }
  /** @type {Set<string>} */
  const names = new Set();
  for (const node of topLevel(ast.program, 'TSImportEqualsDeclaration')) {
    if (!node.isExport) continue;
    // A type-only alias has no runtime value; any other might.
    if (node.importKind === 'type') continue;
    if (typeof node.id?.name !== 'string') return null;
    names.add(node.id.name);
  }
  for (const node of topLevel(ast.program, 'ExportNamedDeclaration')) {
    if (node.exportKind === 'type') continue;
    const declaration = node.declaration;
    if (declaration?.type === 'VariableDeclaration') {
      for (const item of declaration.declarations) {
        if (item.id?.type !== 'Identifier') return null;
        names.add(item.id.name);
      }
    } else if (declaration != null) {
      if (!runtimeDefault(declaration)) continue;
      if (typeof declaration.id?.name !== 'string') return null;
      names.add(declaration.id.name);
    }
    for (const specifier of node.specifiers ?? []) {
      if (specifier.exportKind === 'type') continue;
      const exported = specifier.exported?.name ?? specifier.exported?.value;
      if (typeof exported === 'string') names.add(exported);
    }
  }
  if (
    topLevel(ast.program, 'ExportDefaultDeclaration').some(
      (/** @type {any} */ node) => runtimeDefault(node.declaration),
    )
  ) {
    names.add('default');
  }
  return [...names].sort();
}

/**
 * @typedef {{verdict: 'exports'} | {verdict: 'lacks'} | {verdict: 'unknown', reason: string}} ExportVerdict
 */

/**
 * Whether a module exports `exportName` at runtime, read without executing
 * it: `exports` when a declaration or a followed re-export binds it, `lacks`
 * only when every export the module writes was read and none binds it, and
 * `unknown`, with the first reason, when some export could not be read: a
 * re-export from another package or from a specifier that resolves to no
 * file, a destructured binding, a namespace, an ambient or const enum
 * declaration, `export =`, CommonJS exports, or a file that does not parse.
 * @param {string} file
 * @param {string} exportName
 * @param {Set<string>} [seen]
 * @returns {ExportVerdict}
 */
export function moduleExportVerdict(file, exportName, seen = new Set()) {
  const identity = `${file}\0${exportName}`;
  // A cycle adds nothing a module's own exports have not already said.
  if (seen.has(identity)) return {verdict: 'lacks'};
  seen.add(identity);
  const shown = path.basename(file);
  let text;
  let ast;
  try {
    if (!fs.statSync(file).isFile()) {
      return {verdict: 'unknown', reason: `${shown} is not a file.`};
    }
    text = moduleText(file);
    ast = parseModule(file);
  } catch {
    return {
      verdict: 'unknown',
      reason: `${shown} could not be read or parsed.`,
    };
  }
  /** @type {string[]} */
  const unknown = [];
  if (/\bmodule\.exports\b|\bexports\.[$\w]/u.test(text)) {
    unknown.push(
      `${shown} uses CommonJS exports, whose names this check does not read.`,
    );
  }
  if (topLevel(ast.program, 'TSExportAssignment').length > 0) {
    unknown.push(`${shown} uses \`export =\`, whose names this check does not read.`);
  }
  /**
   * Follow a re-export of `imported` from `specifier`.
   * @param {string} specifier
   * @param {string} imported
   * @param {string} what how the reason names what is re-exported
   * @returns {boolean} true when it proves the export
   */
  const follow = (specifier, imported, what) => {
    if (!specifier.startsWith('.')) {
      unknown.push(
        `${shown} re-exports ${what} from "${specifier}", another package this check does not read.`,
      );
      return false;
    }
    const target = resolveLocalModule(specifier, file);
    if (!target) {
      unknown.push(
        `${shown} re-exports ${what} from "${specifier}", which resolves to no file this check can read.`,
      );
      return false;
    }
    const inner = moduleExportVerdict(target, imported, seen);
    if (inner.verdict === 'exports') return true;
    if (inner.verdict === 'unknown') unknown.push(inner.reason);
    return false;
  };
  // `export import Name = Some.Path;` binds a runtime value unless it is
  // type-only.
  for (const node of topLevel(ast.program, 'TSImportEqualsDeclaration')) {
    if (!node.isExport || node.id?.name !== exportName) continue;
    if (node.importKind === 'type') {
      unknown.push(
        `${shown} exports ${exportName} with \`export import type\`, which has no runtime value this check can see.`,
      );
    } else {
      return {verdict: 'exports'};
    }
  }
  for (const node of topLevel(ast.program, 'ExportNamedDeclaration')) {
    if (node.exportKind === 'type') continue;
    const declaration = node.declaration;
    if (declaration?.type === 'VariableDeclaration') {
      for (const item of declaration.declarations) {
        if (item.id?.type !== 'Identifier') {
          unknown.push(
            `${shown} exports a destructured binding, whose names this check does not read.`,
          );
        } else if (item.id.name === exportName) {
          if (declaration.declare === true) {
            unknown.push(
              `${shown} declares ${exportName} with \`declare\`, which has no runtime value this check can see.`,
            );
          } else {
            return {verdict: 'exports'};
          }
        }
      }
    } else if (declaration != null && declaration.id?.name === exportName) {
      if (
        ['TSInterfaceDeclaration', 'TSTypeAliasDeclaration'].includes(
          declaration.type,
        )
      ) {
        // A type only: no runtime export.
      } else if (declaration.type === 'TSModuleDeclaration') {
        unknown.push(
          `${shown} exports ${exportName} as a TypeScript namespace, which has a runtime value only when it holds one.`,
        );
      } else if (declaration.declare === true || declaration.const === true) {
        unknown.push(
          `${shown} declares ${exportName} as an ambient or const declaration, which has no runtime value this check can see.`,
        );
      } else if (runtimeDefault(declaration)) {
        return {verdict: 'exports'};
      }
    }
    for (const specifier of node.specifiers ?? []) {
      if (specifier.exportKind === 'type') continue;
      const exported = specifier.exported?.name ?? specifier.exported?.value;
      if (exported !== exportName) continue;
      if (!node.source || specifier.type === 'ExportNamespaceSpecifier') {
        return {verdict: 'exports'};
      }
      if (specifier.type !== 'ExportSpecifier') {
        unknown.push(`${shown} re-exports ${exportName} in a form this check does not read.`);
        continue;
      }
      const imported =
        specifier.local?.name ?? specifier.local?.value ?? exportName;
      if (follow(String(node.source.value), imported, exportName)) {
        return {verdict: 'exports'};
      }
    }
  }
  if (exportName === 'default') {
    const defaults = topLevel(ast.program, 'ExportDefaultDeclaration');
    if (
      defaults.some((/** @type {any} */ node) =>
        runtimeDefault(node.declaration),
      )
    ) {
      return {verdict: 'exports'};
    }
  }
  for (const node of topLevel(ast.program, 'ExportAllDeclaration')) {
    if (node.exportKind === 'type') continue;
    const exported = node.exported?.name ?? node.exported?.value;
    if (exported != null) {
      if (exported === exportName) return {verdict: 'exports'};
      continue;
    }
    // `export *` never re-exports a default.
    if (exportName === 'default') continue;
    if (follow(String(node.source?.value ?? ''), exportName, 'everything')) {
      return {verdict: 'exports'};
    }
  }
  return unknown.length > 0
    ? {verdict: 'unknown', reason: unknown[0]}
    : {verdict: 'lacks'};
}

/**
 * Whether a module provably does not export `exportName` at runtime: see
 * {@link moduleExportVerdict}.
 * @param {string} file
 * @param {string} exportName
 * @returns {boolean}
 */
export function moduleLacksExport(file, exportName) {
  return moduleExportVerdict(file, exportName).verdict === 'lacks';
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
