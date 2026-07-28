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
 * 4. Object-property keys inside a test-framework mock factory for an
 *    `@xds/core` module: the partial-mock override in
 *    `vi.mock('@xds/core/Text', async orig => ({...await orig(),
 *    useXDSTruncation: () => ...}))` must be un-prefixed to `useTruncation`,
 *    otherwise the key targets a name the renamed module no longer exports and
 *    the mock silently overrides nothing.
 *
 * Does NOT touch:
 * - import source paths (`@xds/core/Button` stays -- subpath dirs are unchanged
 *   by the prefix migration)
 * - identifiers not bound to an @xds/core import
 * - object-property keys outside an `@xds/core` mock factory (an unrelated
 *   `{useXDSFoo: ...}` literal, or a mock of some other package, is untouched)
 * - the `XDSBaseProps`-style names only when they are NOT imported from core
 */

export const meta = {
  title: 'Drop XDS prefix from @xds/core imports (XDSButton -> Button)',
  description:
    'Rewrites @xds/core imports and their usages from the prefixed names ' +
    '(XDSButton, useXDSTheme, XDSIconRegistry, XDSButtonProps) to their bare ' +
    'names (Button, useTheme, IconRegistry, ButtonProps), including override ' +
    'keys in a vi.mock/jest.mock factory for an @xds/core module. Only renames ' +
    'bindings imported from @xds/core, leaving unrelated identifiers untouched.',
  pr: '#2880',
};

const XDS_CORE_SOURCE = /^@xds\/core(\/.*)?$/;

/**
 * Compute the bare (unprefixed) name for an XDS-prefixed identifier.
 * Returns null if the name is not XDS-prefixed in a renameable way.
 */
function bareName(/** @type {any} */ name) {
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

// A test-framework mock of an `@xds/core` module (`vi.mock('@xds/core/Text',
// factory)`). We only rewrite override keys inside such a factory, so scope the
// detection tightly: callee must be `vi.mock`/`vi.doMock`/`jest.mock`/
// `jest.doMock` (or a bare `mock`) AND the first argument must be a string
// literal that resolves to `@xds/core` (bare or subpath).
const MOCK_METHOD_NAMES = new Set(['mock', 'doMock']);
const MOCK_OBJECT_NAMES = new Set(['vi', 'jest']);

function isMockCallee(/** @type {any} */ callee) {
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

function isXdsCoreMockCall(/** @type {any} */ node) {
  if (node.type !== 'CallExpression' || !isMockCallee(node.callee))
    return false;
  const [arg] = node.arguments;
  const value =
    arg && (arg.type === 'StringLiteral' || arg.type === 'Literal')
      ? arg.value
      : null;
  return typeof value === 'string' && XDS_CORE_SOURCE.test(value);
}

// Rename XDS-prefixed object-property KEYS (not values, not nested objects)
// within the given AST subtree. Used only on a recognized @xds/core mock
// factory, so the scope guard lives at the call site.
function renameMockFactoryKeys(/** @type {any} */ node, /** @type {any} */ seen, /** @type {any} */ onChange) {
  if (!node || typeof node !== 'object') return;
  if (Array.isArray(node)) {
    for (const child of node) renameMockFactoryKeys(child, seen, onChange);
    return;
  }
  if (seen.has(node)) return;
  seen.add(node);

  if (
    (node.type === 'ObjectProperty' || node.type === 'Property') &&
    !node.computed &&
    node.key &&
    node.key.type === 'Identifier'
  ) {
    const bare = bareName(node.key.name);
    if (bare && bare !== node.key.name) {
      node.key.name = bare;
      onChange();
    }
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
    renameMockFactoryKeys(node[key], seen, onChange);
  }
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
  root.find(j.ImportDeclaration).forEach((/** @type {any} */ path) => {
    for (const spec of path.node.specifiers || []) {
      if (spec.local && spec.local.name) existingBindings.add(spec.local.name);
    }
  });
  const collectDeclName = (/** @type {any} */ node) => {
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
  root.find(j.Program).forEach((/** @type {any} */ path) => {
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
  root.find(j.ImportDeclaration).forEach((/** @type {any} */ path) => {
    const source = path.node.source.value;
    if (typeof source !== 'string' || !XDS_CORE_SOURCE.test(source)) return;

    path.node.specifiers = (path.node.specifiers || []).map((/** @type {any} */ spec) => {
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
  root.find(j.ExportNamedDeclaration).forEach((/** @type {any} */ path) => {
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

  // 3. Un-prefix override keys inside @xds/core mock factories. Independent of
  // the import bindings above: the override key is a factory object property,
  // not a reference to an imported binding, so it must match the renamed export
  // name of the mocked module regardless of what the file imports.
  const seenMockNodes = new Set();
  root.find(j.CallExpression).forEach((/** @type {any} */ path) => {
    if (!isXdsCoreMockCall(path.node)) return;
    // Only walk the factory argument(s), never the module-path string.
    for (const arg of path.node.arguments.slice(1)) {
      renameMockFactoryKeys(arg, seenMockNodes, () => {
        hasChanges = true;
      });
    }
  });

  if (localRenames.size === 0) {
    return hasChanges ? root.toSource() : undefined;
  }

  // 4. Rename references to renamed local bindings
  // Identifiers (type refs, value refs, etc.)
  root.find(j.Identifier).forEach((/** @type {any} */ path) => {
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
  root.find(j.JSXIdentifier).forEach((/** @type {any} */ path) => {
    const newName = localRenames.get(path.node.name);
    if (newName) {
      path.node.name = newName;
      hasChanges = true;
    }
  });

  // 5. Rename TS type references in generic type-argument positions.
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
  const renameTypeReferences = (/** @type {any} */ node) => {
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
