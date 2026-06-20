// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Codemod: Drop the `XDSMeta` prefix from @nest/xds-meta imports
 *
 * Part of the @nest/xds-meta un-prefix migration. The package now ships
 * `Meta*` as the canonical prefix with `XDSMeta*` retained as compatibility
 * aliases; this codemod rewrites consumer code from the prefixed names to the
 * bare Meta-prefixed names:
 *
 *   XDSMetaAppShell           -> MetaAppShell
 *   useXDSMetaCommandPalette  -> useMetaCommandPalette
 *   xdsMetaIconRegistry       -> metaIconRegistry
 *
 * Safety: this codemod ONLY renames identifiers that are imported from
 * `@nest/xds-meta` (bare or subpath, e.g. `@nest/xds-meta/AppShell`). It tracks
 * the local binding introduced by each import and renames that binding plus its
 * references -- so a consumer's own unrelated `XDSMetaWhatever` symbol, or a
 * string that merely starts with "XDSMeta", is never touched.
 *
 * Handles:
 * 1. Named import specifiers:   import {XDSMetaAppShell} from '@nest/xds-meta'
 *    -> import {MetaAppShell} from '@nest/xds-meta'   (and aliased imports)
 * 2. All references to the imported binding (JSX, type positions, values),
 *    including type references in generic type-argument positions such as
 *    `ComponentProps<typeof XDSMetaAppShell>`
 * 3. Re-exports from @nest/xds-meta:
 *    export {XDSMetaAppShell} from '@nest/xds-meta/AppShell'
 *
 * Does NOT touch:
 * - import source paths (`@nest/xds-meta/AppShell` stays -- subpath dirs are
 *   unchanged by the prefix migration)
 * - identifiers not bound to a @nest/xds-meta import
 */

export const meta = {
  title:
    'Drop XDSMeta prefix from @nest/xds-meta imports (XDSMetaAppShell -> MetaAppShell)',
  description:
    'Rewrites @nest/xds-meta imports and their usages from the prefixed names ' +
    '(XDSMetaAppShell, useXDSMetaCommandPalette) to the bare Meta-prefixed names ' +
    '(MetaAppShell, useMetaCommandPalette). Only renames bindings imported ' +
    'from @nest/xds-meta, leaving unrelated identifiers untouched.',
};

const XDS_META_SOURCE = /^@nest\/xds-meta(\/.*)?$/;

/**
 * Compute the bare (Meta-prefixed) name for an XDSMeta-prefixed identifier.
 * Returns null if the name is not XDSMeta-prefixed in a renameable way.
 *
 *   useXDSMeta<Cap> -> useMeta<Cap>   (e.g. useXDSMetaCommandPalette)
 *   XDSMeta<Cap>    -> Meta<Cap>      (e.g. XDSMetaAppShell)
 *   xdsMeta<Cap>    -> meta<Cap>      (e.g. xdsMetaIconRegistry)
 */
function bareName(name) {
  // useXDSMeta<Cap> -> useMeta<Cap>
  if (name.startsWith('useXDSMeta') && name.length > 'useXDSMeta'.length) {
    const rest = name.slice('useXDSMeta'.length);
    if (
      rest[0] === rest[0].toUpperCase() &&
      rest[0] !== rest[0].toLowerCase()
    ) {
      return 'useMeta' + rest;
    }
    return null;
  }
  // XDSMeta<Cap> -> Meta<Cap>
  if (name.startsWith('XDSMeta') && name.length > 'XDSMeta'.length) {
    const rest = name.slice('XDSMeta'.length);
    if (
      rest[0] === rest[0].toUpperCase() &&
      rest[0] !== rest[0].toLowerCase()
    ) {
      return 'Meta' + rest;
    }
    return null;
  }
  // xdsMeta<Cap> -> meta<Cap>
  if (name.startsWith('xdsMeta') && name.length > 'xdsMeta'.length) {
    const rest = name.slice('xdsMeta'.length);
    if (
      rest[0] === rest[0].toUpperCase() &&
      rest[0] !== rest[0].toLowerCase()
    ) {
      return 'meta' + rest;
    }
    return null;
  }
  return null;
}

export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let hasChanges = false;

  // Map of localName -> newLocalName for bindings we will rename. We only
  // rename when the LOCAL binding is the prefixed name (i.e. not aliased to
  // something custom). Aliased imports like `XDSMetaAppShell as Shell` keep
  // their local alias and only the imported name is rewritten.
  const localRenames = new Map();

  // 1. Rewrite import specifiers from @nest/xds-meta
  root.find(j.ImportDeclaration).forEach(path => {
    const source = path.node.source.value;
    if (typeof source !== 'string' || !XDS_META_SOURCE.test(source)) return;

    for (const spec of path.node.specifiers || []) {
      if (spec.type !== 'ImportSpecifier') continue; // skip default/namespace
      const importedName = spec.imported.name;
      const bare = bareName(importedName);
      if (!bare) continue;

      const localName = spec.local.name;
      const wasAliased = localName !== importedName;

      // Rewrite the imported name to the bare alias.
      spec.imported.name = bare;

      if (wasAliased) {
        // `import {XDSMetaAppShell as Shell}` -> `import {MetaAppShell as Shell}`.
        // Local binding unchanged, so no usage rewrites needed.
        hasChanges = true;
      } else {
        // `import {XDSMetaAppShell}` -> `import {MetaAppShell}`. The local
        // binding is the prefixed name; rename it and all its references.
        spec.local.name = bare;
        localRenames.set(importedName, bare);
        hasChanges = true;
      }
    }
  });

  // 2. Rewrite re-exports from @nest/xds-meta
  root.find(j.ExportNamedDeclaration).forEach(path => {
    if (!path.node.source) return;
    const source = path.node.source.value;
    if (typeof source !== 'string' || !XDS_META_SOURCE.test(source)) return;

    for (const spec of path.node.specifiers || []) {
      if (spec.type !== 'ExportSpecifier') continue;
      const localName = spec.local.name;
      const bare = bareName(localName);
      if (!bare) continue;
      spec.local.name = bare;
      // If the export was `export {XDSMetaAppShell}` (exported name == local),
      // also update the exported name; if it was
      // `export {XDSMetaAppShell as Foo}`, keep the public exported name `Foo`.
      if (spec.exported.name === localName) {
        spec.exported.name = bare;
      }
      hasChanges = true;
    }
  });

  if (localRenames.size === 0) {
    return hasChanges ? root.toSource() : undefined;
  }

  // 3. Rename references to renamed local bindings
  // Identifiers (type refs, value refs, etc.)
  root.find(j.Identifier).forEach(path => {
    const newName = localRenames.get(path.node.name);
    if (!newName) return;
    // Skip object property keys like `{ XDSMetaAppShell: ... }` (not a
    // reference to the binding) and member expression properties like
    // `foo.XDSMetaAppShell`.
    const parent = path.parent.node;
    if (
      (parent.type === 'ObjectProperty' || parent.type === 'Property') &&
      parent.key === path.node &&
      !parent.computed
    ) {
      return;
    }
    if (
      parent.type === 'MemberExpression' &&
      parent.property === path.node &&
      !parent.computed
    ) {
      return;
    }
    // Don't double-rewrite the import specifier we already handled.
    if (parent.type === 'ImportSpecifier') return;
    path.node.name = newName;
    hasChanges = true;
  });

  // JSX element names: <XDSMetaAppShell> -> <MetaAppShell>
  root.find(j.JSXIdentifier).forEach(path => {
    const newName = localRenames.get(path.node.name);
    if (newName) {
      path.node.name = newName;
      hasChanges = true;
    }
  });

  // 4. Rename TS type references in generic type-argument positions.
  //
  // `j.find(j.Identifier)` (and `j.find(j.TSTypeReference)`) do NOT visit
  // identifiers nested inside generic type arguments with the tsx/babel parser
  // -- e.g. the `XDSMetaAppShell` in `ComponentProps<typeof XDSMetaAppShell>`
  // or `XDSMetaTableColumn` in `useMemo<XDSMetaTableColumn<Issue>[]>(...)`.
  // ast-types' traversal doesn't descend through the
  // `TSTypeParameterInstantiation` / `TSArrayType` field path here, so those
  // type references slip past steps 1-3 and produce dangling prefixed names.
  //
  // To cover every type-reference position regardless of how the parser nests
  // it, walk the raw AST and rename any `TSTypeReference` whose `typeName` is a
  // renamed binding, plus any `Identifier` inside a `TSTypeQuery` (`typeof X`).
  // Renaming already-bare names is a no-op, so re-visiting a node the earlier
  // passes handled is harmless.
  const seenTypeNodes = new Set();
  const renameTypeReferences = node => {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) {
      for (const child of node) renameTypeReferences(child);
      return;
    }
    if (seenTypeNodes.has(node)) return;
    seenTypeNodes.add(node);

    if (
      node.type === 'TSTypeReference' &&
      node.typeName &&
      node.typeName.type === 'Identifier'
    ) {
      const newName = localRenames.get(node.typeName.name);
      if (newName && node.typeName.name !== newName) {
        node.typeName.name = newName;
        hasChanges = true;
      }
    }

    // `typeof XDSMetaAppShell` inside a type position -> TSTypeQuery whose
    // exprName is an Identifier referencing the value binding.
    if (
      node.type === 'TSTypeQuery' &&
      node.exprName &&
      node.exprName.type === 'Identifier'
    ) {
      const newName = localRenames.get(node.exprName.name);
      if (newName && node.exprName.name !== newName) {
        node.exprName.name = newName;
        hasChanges = true;
      }
    }

    for (const key of Object.keys(node)) {
      // Skip position/metadata fields to avoid wasted traversal.
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
      renameTypeReferences(node[key]);
    }
  };
  renameTypeReferences(root.get().node);

  return hasChanges ? root.toSource() : undefined;
}
