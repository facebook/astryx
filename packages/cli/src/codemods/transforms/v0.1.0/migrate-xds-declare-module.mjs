// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Codemod: migrate `declare module "@xds/..."` augmentations to
 * `@astryxdesign/...`
 *
 * The v0.1.0 release moved the public package scope from @xds to
 * @astryxdesign. TypeScript module augmentations (`declare module "@xds/core"
 * { ... }`) reference the package by its string specifier, so they are dead
 * after the scope rename: TypeScript resolves the augmentation against a
 * module that no longer exists.
 *
 * This transform rewrites the augmented module string on `TSModuleDeclaration`
 * nodes whose `id` is a StringLiteral matching a renamed @xds package (or one
 * of its subpaths). It only touches the module path — identifiers *inside* the
 * augmentation (e.g. an augmented interface name) are a separate concern
 * handled by drop-xds-prefix-imports.
 *
 * Ordered AFTER migrate-xds-module-specifiers in the v0.1.0 manifest: it uses
 * the same PACKAGE_RENAMES mapping and cleans up the module-augmentation
 * surface alongside the import/export/require specifier rename.
 */

export const meta = {
  title: 'Migrate declare-module augmentations from @xds/* to @astryxdesign/*',
  description:
    'Rewrites the module specifier on TypeScript `declare module "@xds/..."` ' +
    'augmentations to the @astryxdesign/* packages used by Astryx v0.1.0. ' +
    'Only the augmented module path is changed; identifiers inside the ' +
    'augmentation are left untouched.',
  pr: '#3092',
  fileExtensions: ['.ts', '.d.ts', '.tsx'],
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

export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let hasChanges = false;

  root.find(j.TSModuleDeclaration).forEach(path => {
    const id = path.node.id;
    // Module augmentations name the module with a string literal id; a
    // `namespace Foo {}` uses an Identifier id, which we ignore.
    if (!id || (id.type !== 'StringLiteral' && id.type !== 'Literal')) return;
    if (typeof id.value !== 'string') return;
    const next = renamePackageSpecifier(id.value);
    if (next === id.value) return;
    id.value = next;
    hasChanges = true;
  });

  return hasChanges ? root.toSource() : undefined;
}
