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
    'Updates JS/TS import, export, dynamic import, and require module ' +
    'specifiers from @xds/* to the @astryxdesign/* packages used by Astryx v0.1.0.',
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

function renamePackageSpecifier(value) {
  if (typeof value !== 'string') return value;
  for (const [from, to] of PACKAGE_RENAMES) {
    if (value === from) return to;
    if (value.startsWith(from + '/')) return to + value.slice(from.length);
  }
  return value;
}

function rewriteLiteral(node) {
  if (!node || typeof node.value !== 'string') return false;
  const next = renamePackageSpecifier(node.value);
  if (next === node.value) return false;
  node.value = next;
  return true;
}

export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let hasChanges = false;

  root.find(j.ImportDeclaration).forEach(path => {
    hasChanges = rewriteLiteral(path.node.source) || hasChanges;
  });

  root.find(j.ExportNamedDeclaration).forEach(path => {
    hasChanges = rewriteLiteral(path.node.source) || hasChanges;
  });

  root.find(j.ExportAllDeclaration).forEach(path => {
    hasChanges = rewriteLiteral(path.node.source) || hasChanges;
  });

  root.find(j.CallExpression).forEach(path => {
    const isDynamicImport = path.node.callee.type === 'Import';
    const isRequire =
      path.node.callee.type === 'Identifier' &&
      path.node.callee.name === 'require';
    if (!isDynamicImport && !isRequire) return;
    const [arg] = path.node.arguments;
    if (arg?.type === 'StringLiteral' || arg?.type === 'Literal') {
      hasChanges = rewriteLiteral(arg) || hasChanges;
    }
  });

  return hasChanges ? root.toSource() : undefined;
}
