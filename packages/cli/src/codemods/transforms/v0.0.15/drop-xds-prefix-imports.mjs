// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Codemod: Drop the `XDS` prefix from @xds/core imports and their usages
 *
 * Part of the XDS-prefix migration (P2380608025). Rewrites consumer code from
 * the prefixed names to the bare compatibility aliases shipped in P1:
 *
 *   XDSButton      -> Button
 *   XDSButtonProps -> ButtonProps
 *   useXDSTheme    -> useTheme
 *   useXDSToast    -> useToast
 *
 * Safety: this codemod ONLY renames identifiers that are imported from
 * `@xds/core` (bare or subpath, e.g. `@xds/core/Button`). It tracks the local
 * binding introduced by each import and renames that binding plus its
 * references -- so a consumer's own unrelated `XDSWhatever` symbol, or a string
 * that merely starts with "XDS", is never touched.
 *
 * Handles:
 * 1. Named import specifiers:   import {XDSButton} from '@xds/core'
 *    -> import {Button} from '@xds/core'   (and aliased imports)
 * 2. All references to the imported binding (JSX, type positions, values)
 * 3. Re-exports from @xds/core: export {XDSButton} from '@xds/core/Button'
 *
 * Does NOT touch:
 * - import source paths (`@xds/core/Button` stays -- subpath dirs are unchanged
 *   by the prefix migration)
 * - identifiers not bound to an @xds/core import
 * - the `XDSBaseProps`-style names only when they are NOT imported from core
 */

export const meta = {
  title: 'Drop XDS prefix from @xds/core imports (XDSButton -> Button)',
  description:
    'Rewrites @xds/core imports and their usages from the prefixed names ' +
    '(XDSButton, useXDSTheme, XDSButtonProps) to the bare compatibility ' +
    'aliases (Button, useTheme, ButtonProps). Only renames bindings imported ' +
    'from @xds/core, leaving unrelated identifiers untouched.',
  pr: '#2880',
};

const XDS_CORE_SOURCE = /^@xds\/core(\/.*)?$/;

/**
 * Compute the bare (unprefixed) name for an XDS-prefixed identifier.
 * Returns null if the name is not XDS-prefixed in a renameable way.
 */
function bareName(name) {
  if (name.startsWith('useXDS') && name.length > 'useXDS'.length) {
    return 'use' + name.slice('useXDS'.length);
  }
  if (
    name.startsWith('XDS') &&
    name.length > 3 &&
    name[3] === name[3].toUpperCase() &&
    name[3] !== name[3].toLowerCase() // next char is an uppercase letter
  ) {
    return name.slice(3);
  }
  return null;
}

export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let hasChanges = false;

  // Map of localName -> newLocalName for bindings we will rename. We only
  // rename when the LOCAL binding is the prefixed name (i.e. not aliased to
  // something custom). Aliased imports like `XDSButton as Btn` keep their
  // local alias and only the imported name is rewritten.
  const localRenames = new Map();

  // 1. Rewrite import specifiers from @xds/core
  root.find(j.ImportDeclaration).forEach(path => {
    const source = path.node.source.value;
    if (typeof source !== 'string' || !XDS_CORE_SOURCE.test(source)) return;

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
        // `import {XDSButton as Btn}` -> `import {Button as Btn}`.
        // Local binding unchanged, so no usage rewrites needed.
        hasChanges = true;
      } else {
        // `import {XDSButton}` -> `import {Button}`. The local binding is the
        // prefixed name; rename it and all its references.
        spec.local.name = bare;
        localRenames.set(importedName, bare);
        hasChanges = true;
      }
    }
  });

  // 2. Rewrite re-exports from @xds/core
  root.find(j.ExportNamedDeclaration).forEach(path => {
    if (!path.node.source) return;
    const source = path.node.source.value;
    if (typeof source !== 'string' || !XDS_CORE_SOURCE.test(source)) return;

    for (const spec of path.node.specifiers || []) {
      if (spec.type !== 'ExportSpecifier') continue;
      const localName = spec.local.name;
      const bare = bareName(localName);
      if (!bare) continue;
      spec.local.name = bare;
      // If the export was `export {XDSButton}` (exported name == local),
      // also update the exported name; if it was `export {XDSButton as Foo}`,
      // keep the public exported name `Foo`.
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
    // Skip object property keys like `{ XDSButton: ... }` (not a reference to
    // the binding) and member expression properties like `foo.XDSButton`.
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

  // JSX element names: <XDSButton> -> <Button>
  root.find(j.JSXIdentifier).forEach(path => {
    const newName = localRenames.get(path.node.name);
    if (newName) {
      path.node.name = newName;
      hasChanges = true;
    }
  });

  return hasChanges ? root.toSource() : undefined;
}
