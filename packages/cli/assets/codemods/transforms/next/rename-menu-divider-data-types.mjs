// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Codemod: rename the menu divider *data* types to `*DividerData`
 *
 * Compound menus gained a `DropdownMenuDivider` component (aliased into the
 * ContextMenu and Breadcrumbs surfaces), and TypeScript will not let one
 * barrel re-export a value and a type under one name — `export {X} from 'a'`
 * beside `export {type X} from 'b'` is TS2300, Duplicate identifier. So the
 * bare name now belongs to the component and the data-mode option type takes
 * the `Data` suffix its sibling `DropdownMenuItemData` already carries.
 *
 * A stale `import type {DropdownMenuDivider}` fails loudly rather than
 * silently — the name now resolves to a value — so this codemod is about
 * saving the edit, not about catching a silent break.
 *
 * Only unambiguous references are rewritten: a type-only import, or a plain
 * import whose local name is never used as a value in that file. A file that
 * already renders `<DropdownMenuDivider />` is left alone, because there the
 * name means the component.
 */

export const meta = {
  title: 'Rename the menu divider data types to *DividerData',
  description:
    'Renames `DropdownMenuDivider`, `ContextMenuDivider`, and ' +
    '`BreadcrumbMenuDivider` — the `{type: "divider"}` option types — to ' +
    '`DropdownMenuDividerData`, `ContextMenuDividerData`, and ' +
    '`BreadcrumbMenuDividerData`. The bare names now belong to the new ' +
    'compound divider components. Imports used as values are left untouched.',
};

/** @type {Record<string, string>} */
const RENAMES = {
  DropdownMenuDivider: 'DropdownMenuDividerData',
  ContextMenuDivider: 'ContextMenuDividerData',
  BreadcrumbMenuDivider: 'BreadcrumbMenuDividerData',
};

const PACKAGE_PREFIX = '@astryxdesign/core';

/**
 * @param {import('../../../../authoring/codemod/type').AstryxCodemodFile} file
 * @param {import('../../../../authoring/codemod/type').CodemodTransformApi} api
 * @returns {string | null | undefined}
 */
export default function transformer(file, api) {
  if (!Object.keys(RENAMES).some(name => file.source.includes(name))) {
    return undefined;
  }

  const j = api.jscodeshift;
  const root = j(file.source);
  let hasChanges = false;

  /** Whether `name` appears anywhere a value — not a type — is expected. */
  function isUsedAsValue(/** @type {string} */ name) {
    if (root.find(j.JSXIdentifier, {name}).size() > 0) {
      return true;
    }
    return (
      root
        .find(j.Identifier, {name})
        .filter((/** @type {any} */ path) => {
          const parent = path.parent.node;
          switch (parent.type) {
            case 'ImportSpecifier':
            case 'ImportDefaultSpecifier':
            case 'TSTypeReference':
            case 'TSQualifiedName':
            case 'TSTypeAliasDeclaration':
            case 'TSInterfaceDeclaration':
            case 'TSExpressionWithTypeArguments':
              return false;
            case 'ExportSpecifier':
              return parent.exportKind !== 'type';
            default:
              return true;
          }
        })
        .size() > 0
    );
  }

  root
    .find(j.ImportDeclaration)
    .filter((/** @type {any} */ path) =>
      String(path.node.source.value ?? '').startsWith(PACKAGE_PREFIX),
    )
    .forEach((/** @type {any} */ path) => {
      const declarationIsType = path.node.importKind === 'type';

      for (const spec of path.node.specifiers ?? []) {
        if (spec.type !== 'ImportSpecifier') {
          continue;
        }
        const renamed = RENAMES[spec.imported.name];
        if (!renamed) {
          continue;
        }

        const local = spec.local?.name ?? spec.imported.name;
        const isAliased = local !== spec.imported.name;
        const isTypeOnly = declarationIsType || spec.importKind === 'type';

        if (!isTypeOnly && isUsedAsValue(local)) {
          continue;
        }

        spec.imported.name = renamed;
        hasChanges = true;

        if (isAliased) {
          continue;
        }

        spec.local.name = renamed;
        root
          .find(j.TSTypeReference)
          .filter(
            (/** @type {any} */ ref) =>
              ref.node.typeName?.type === 'Identifier' &&
              ref.node.typeName.name === local,
          )
          .forEach((/** @type {any} */ ref) => {
            ref.node.typeName.name = renamed;
          });
      }
    });

  return hasChanges ? root.toSource({quote: 'single'}) : undefined;
}
