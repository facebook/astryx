// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Codemod: migrate module specifiers from @xds/* to @astryxdesign/*
 *
 * The v0.1.0 release moved the public package scope from @xds to
 * @astryxdesign. Consumers update dependencies first, install, then run
 * `astryx upgrade`; this transform only updates JS/TS module specifiers in
 * source code.
 */

export const meta = {
  title: 'Migrate module specifiers from @xds/* to @astryxdesign/*',
  description:
    'Updates JS/TS import, export, dynamic import, require, TS import-type, ' +
    'and test-framework mock (vi.mock / jest.mock) module specifiers from ' +
    '@xds/* to the @astryxdesign/* packages used by Astryx v0.1.0.',
  pr: '#3092',
  fileExtensions: ['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs'],
};

const PACKAGE_RENAMES = new Map([
  ['@xds/build', '@astryxdesign/build'],
  ['@xds/cli', '@astryxdesign/cli'],
  ['@xds/core', '@astryxdesign/core'],
  ['@xds/lab', '@astryxdesign/lab'],
  ['@xds/theme-butter', '@astryxdesign/theme-butter'],
  ['@xds/theme-chocolate', '@astryxdesign/theme-chocolate'],
  ['@xds/theme-daily', '@astryxdesign/theme-neutral'],
  ['@xds/theme-default', '@astryxdesign/theme-neutral'],
  ['@xds/theme-gothic', '@astryxdesign/theme-gothic'],
  ['@xds/theme-matcha', '@astryxdesign/theme-matcha'],
  ['@xds/theme-neutral', '@astryxdesign/theme-neutral'],
  ['@xds/theme-stone', '@astryxdesign/theme-stone'],
  ['@xds/theme-y2k', '@astryxdesign/theme-y2k'],
]);

function renamePackageSpecifier(/** @type {any} */ value) {
  if (typeof value !== 'string') return value;
  for (const [from, to] of PACKAGE_RENAMES) {
    if (value === from) return to;
    if (value.startsWith(from + '/')) return to + value.slice(from.length);
  }
  return value;
}

function rewriteLiteral(/** @type {any} */ node) {
  if (!node || typeof node.value !== 'string') return false;
  const next = renamePackageSpecifier(node.value);
  if (next === node.value) return false;
  node.value = next;
  return true;
}

// @xds/theme-default and @xds/theme-daily both collapse to
// @astryxdesign/theme-neutral, whose exported theme binding is `neutralTheme`
// (not `defaultTheme`). When we rewrite an import from one of those packages,
// remap a `defaultTheme` named import to `neutralTheme`, aliasing back to the
// original local name so downstream usages keep working unchanged:
//   import {defaultTheme} from '@xds/theme-default'
//     -> import {neutralTheme as defaultTheme} from '@astryxdesign/theme-neutral'
// An already-aliased `{defaultTheme as x}` just has its imported name remapped.
const THEME_EXPORT_RENAMES = new Map([['defaultTheme', 'neutralTheme']]);
const COLLAPSED_THEME_SOURCES = new Set([
  '@xds/theme-default',
  '@xds/theme-daily',
]);

function isCollapsedThemeSource(/** @type {any} */ value) {
  if (typeof value !== 'string') return false;
  for (const src of COLLAPSED_THEME_SOURCES) {
    if (value === src || value.startsWith(src + '/')) return true;
  }
  return false;
}

// Test-framework mock calls take the mocked module path as their first
// argument (`vi.mock('@xds/core/Text', factory)`). That path is a plain string
// literal -- not an ImportDeclaration source -- so it slips past the import/
// export handlers and, left unrewritten, the mock would target the stale
// `@xds/*` path and stop intercepting the renamed `@astryxdesign/*` import.
// Recognized callees: `vi.mock`, `vi.doMock`, `jest.mock`, `jest.doMock`, and
// a bare `mock(...)` (destructured from the test runner).
const MOCK_METHOD_NAMES = new Set(['mock', 'doMock']);
const MOCK_OBJECT_NAMES = new Set(['vi', 'jest']);

function isMockCall(/** @type {any} */ callee) {
  if (
    callee.type === 'MemberExpression' &&
    !callee.computed &&
    callee.object.type === 'Identifier' &&
    MOCK_OBJECT_NAMES.has(callee.object.name) &&
    callee.property.type === 'Identifier' &&
    MOCK_METHOD_NAMES.has(callee.property.name)
  ) {
    return true;
  }
  return callee.type === 'Identifier' && callee.name === 'mock';
}

function remapThemeExportNames(/** @type {any} */ importPath, /** @type {any} */ j) {
  let changed = false;
  importPath.node.specifiers = (importPath.node.specifiers || []).map((/** @type {any} */ spec) => {
    if (spec.type !== 'ImportSpecifier') return spec;
    const importedName = spec.imported.name;
    const renamed = THEME_EXPORT_RENAMES.get(importedName);
    if (!renamed) return spec;
    // Preserve the original local binding (so downstream usages keep working),
    // remapping only the imported name. Build a FRESH specifier node: recast
    // preserves the printed form of a mutated ImportSpecifier and would drop a
    // newly-introduced `as local` alias, so mutating in place loses it.
    const localName = spec.local.name;
    changed = true;
    return j.importSpecifier(j.identifier(renamed), j.identifier(localName));
  });
  return changed;
}

/**
 * @param {import('../../../types/codemod').AstryxCodemodFile} file
 * @param {import('../../../types/codemod').CodemodTransformApi} api
 * @returns {string | null | undefined}
 */
export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let hasChanges = false;

  root.find(j.ImportDeclaration).forEach((/** @type {any} */ path) => {
    // Remap collapsed-theme export names BEFORE rewriting the source specifier
    // (the check keys off the original @xds/theme-default|daily path).
    if (isCollapsedThemeSource(path.node.source.value)) {
      hasChanges = remapThemeExportNames(path, j) || hasChanges;
    }
    hasChanges = rewriteLiteral(path.node.source) || hasChanges;
  });

  root.find(j.ExportNamedDeclaration).forEach((/** @type {any} */ path) => {
    hasChanges = rewriteLiteral(path.node.source) || hasChanges;
  });

  root.find(j.ExportAllDeclaration).forEach((/** @type {any} */ path) => {
    hasChanges = rewriteLiteral(path.node.source) || hasChanges;
  });

  root.find(j.CallExpression).forEach((/** @type {any} */ path) => {
    const isDynamicImport = path.node.callee.type === 'Import';
    const isRequire =
      path.node.callee.type === 'Identifier' &&
      path.node.callee.name === 'require';
    if (isDynamicImport || isRequire || isMockCall(path.node.callee)) {
      const [arg] = path.node.arguments;
      if (arg?.type === 'StringLiteral' || arg?.type === 'Literal') {
        hasChanges = rewriteLiteral(arg) || hasChanges;
      }
    }
  });

  // TS `import(...)` TYPE specifiers -- e.g. the `import('@xds/core/Text')` in
  // `typeof import('@xds/core/Text')` -- parse to a `TSImportType` node, not a
  // dynamic-import CallExpression, so the handler above never reaches them.
  // ast-types' traversal also doesn't descend into a `TSImportType` nested in a
  // generic type-argument position (e.g. `orig<typeof import('@xds/core/Text')>()`),
  // so `j.find(j.TSImportType)` misses it. Walk the raw AST to cover every
  // position. Re-visiting a node the loop above handled is harmless: the
  // literal is already rewritten, so the second pass is a no-op.
  const seenTypeImportNodes = new Set();
  const rewriteTSImportTypes = (/** @type {any} */ node) => {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) {
      for (const child of node) rewriteTSImportTypes(child);
      return;
    }
    if (seenTypeImportNodes.has(node)) return;
    seenTypeImportNodes.add(node);

    if (node.type === 'TSImportType' && node.argument) {
      hasChanges = rewriteLiteral(node.argument) || hasChanges;
    }

    for (const key of Object.keys(node)) {
      if (
        key === 'loc' ||
        key === 'start' ||
        key === 'end' ||
        key === 'range' ||
        key === 'comments' ||
        key === 'leadingComments' ||
        key === 'trailingComments' ||
        key === 'tokens'
      ) {
        continue;
      }
      rewriteTSImportTypes(node[key]);
    }
  };
  rewriteTSImportTypes(root.get().node);

  return hasChanges ? root.toSource() : undefined;
}
