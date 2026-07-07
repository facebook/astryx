// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Codemod: Drop the `XDS` prefix from @xds/core imports and their usages
 *
 * Part of the XDS-prefix migration (P2380608025). Rewrites consumer code from
 * the prefixed names to their bare equivalents:
 *
 *   XDSButton      -> Button
 *   XDSButtonProps -> ButtonProps
 *   useXDSTheme    -> useTheme
 *   useXDSToast    -> useToast
 *   XDSIconRegistry-> IconRegistry
 *
 * Mandatory in v0.1.0: the prefixed compatibility aliases (which made both
 * prefixed and bare names valid during the 0.0.x compat window) were dropped
 * in v0.1.0, so the un-prefixing is now required for code to keep type-
 * checking against @astryxdesign/core.
 *
 * Ordering: within the v0.1.0 manifest this runs BEFORE
 * migrate-xds-module-specifiers so it still matches `@xds/core` imports (its
 * source matcher) and un-prefixes the identifiers first; the specifier codemod
 * then rewrites the module paths `@xds/*` -> `@astryxdesign/*`.
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
 * 2. All references to the imported binding (JSX, type positions, values),
 *    including type references in generic type-argument positions such as
 *    `useMemo<XDSTableColumn<Issue>[]>(...)`
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
    '(XDSButton, useXDSTheme, XDSIconRegistry, XDSButtonProps) to their bare ' +
    'names (Button, useTheme, IconRegistry, ButtonProps). Only renames ' +
    'bindings imported from @xds/core, leaving unrelated identifiers untouched.',
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

  // Collision detection: un-prefixing `XDSCodeBlock` -> `CodeBlock` breaks if
  // the file already has a top-level binding named `CodeBlock` (e.g. its own
  // `export function CodeBlock`). Collect every existing top-level binding name
  // up front so we can alias to `Astryx<Name>` instead of producing a duplicate
  // declaration. We gather: import locals, and top-level function/class/var
  // declaration names (the realistic collision sources for component wrappers).
  const existingBindings = new Set();
  root.find(j.ImportDeclaration).forEach(path => {
    for (const spec of path.node.specifiers || []) {
      if (spec.local && spec.local.name) existingBindings.add(spec.local.name);
    }
  });
  const collectDeclName = node => {
    if (!node) return;
    if (
      (node.type === 'FunctionDeclaration' ||
        node.type === 'ClassDeclaration') &&
      node.id
    ) {
      existingBindings.add(node.id.name);
    } else if (node.type === 'VariableDeclaration') {
      for (const d of node.declarations) {
        if (d.id && d.id.type === 'Identifier') existingBindings.add(d.id.name);
      }
    }
  };
  root.find(j.Program).forEach(path => {
    for (const stmt of path.node.body) {
      collectDeclName(stmt);
      // Unwrap `export function X` / `export const X`.
      if (stmt.type === 'ExportNamedDeclaration' && stmt.declaration) {
        collectDeclName(stmt.declaration);
      }
      if (stmt.type === 'ExportDefaultDeclaration' && stmt.declaration) {
        collectDeclName(stmt.declaration);
      }
    }
  });

  // 1. Rewrite import specifiers from @xds/core
  root.find(j.ImportDeclaration).forEach(path => {
    const source = path.node.source.value;
    if (typeof source !== 'string' || !XDS_CORE_SOURCE.test(source)) return;

    path.node.specifiers = (path.node.specifiers || []).map(spec => {
      if (spec.type !== 'ImportSpecifier') return spec; // default/namespace
      const importedName = spec.imported.name;
      const bare = bareName(importedName);
      if (!bare) return spec;

      const localName = spec.local.name;
      const wasAliased = localName !== importedName;

      // We REPLACE the specifier node (rather than mutating .imported/.local)
      // because recast preserves the original printed form of a mutated
      // ImportSpecifier and will drop a newly-introduced `as local` alias.
      // Building a fresh node makes recast print the full `imported as local`.
      if (wasAliased) {
        // `import {XDSButton as Btn}` -> `import {Button as Btn}`.
        hasChanges = true;
        return j.importSpecifier(j.identifier(bare), j.identifier(localName));
      }
      if (bare !== importedName && existingBindings.has(bare)) {
        // COLLISION: the bare name is already a top-level binding in this file
        // (e.g. a local `export function CodeBlock` alongside imported
        // `XDSCodeBlock`). Un-prefixing directly would create a duplicate
        // declaration, so alias the import to `Astryx<Name>` and rename the
        // import's references to that alias, leaving the local binding intact.
        const alias = `Astryx${bare}`;
        localRenames.set(importedName, alias);
        existingBindings.add(alias);
        hasChanges = true;
        return j.importSpecifier(j.identifier(bare), j.identifier(alias));
      }
      // `import {XDSButton}` -> `import {Button}`. The local binding is the
      // prefixed name; rename it and all its references.
      localRenames.set(importedName, bare);
      existingBindings.add(bare);
      hasChanges = true;
      return j.importSpecifier(j.identifier(bare), j.identifier(bare));
    });
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

  // 4. Rename TS type references in generic type-argument positions.
  //
  // `j.find(j.Identifier)` (and `j.find(j.TSTypeReference)`) do NOT visit
  // identifiers nested inside generic type arguments with the tsx/babel parser
  // -- e.g. the `XDSTableColumn` in `useMemo<XDSTableColumn<Issue>[]>(...)`.
  // ast-types' traversal doesn't descend through the
  // `TSTypeParameterInstantiation` / `TSArrayType` field path here, so those
  // type references slip past steps 1-3 and produce dangling prefixed names.
  //
  // To cover every type-reference position regardless of how the parser nests
  // it, walk the raw AST and rename any `TSTypeReference` whose `typeName` is a
  // renamed binding. Renaming already-bare names is a no-op, so re-visiting a
  // node the earlier passes handled is harmless.
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
