// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Codemod: Rename aria-label → label on RadioGroup menu components
 *
 * As of v0.3.0, DropdownMenuRadioGroup (and its ContextMenu/Breadcrumb
 * re-exports, ContextMenuRadioGroup and BreadcrumbMenuRadioGroup) take a
 * required `label` prop that names the group for assistive tech, replacing the
 * previous optional `aria-label`/`aria-labelledby` passthrough. `label` is
 * applied as the group's aria-label.
 *
 * Migration: rename the `aria-label="..."` attribute to `label="..."` on these
 * three components. `aria-labelledby` is intentionally NOT rewritten — when a
 * visible label already exists on the page, keep passing `aria-labelledby`
 * through base props instead of moving to `label`.
 *
 * The rename is component-scoped and import-gated: only elements resolved to
 * one of the three RadioGroup components (alias-aware) are touched, so an
 * `aria-label` on any other element is left untouched.
 */

export const meta = {
  title: 'Rename aria-label → label on RadioGroup menu components',
  description:
    'DropdownMenuRadioGroup, ContextMenuRadioGroup, and BreadcrumbMenuRadioGroup ' +
    'now take a required `label` prop (applied as aria-label) in place of the old ' +
    'optional `aria-label` passthrough. This codemod renames `aria-label` to ' +
    '`label` on those three components only. `aria-labelledby` is left as-is — ' +
    'pass it via base props when a visible label already exists.',
};

/** Import sources that provide the RadioGroup menu components. */
const IMPORT_SOURCES = new Set([
  '@astryxdesign/core',
  '@astryxdesign/core/DropdownMenu',
  '@astryxdesign/core/ContextMenu',
  '@astryxdesign/core/Breadcrumbs',
  '@xds/core',
  '@xds/core/DropdownMenu',
  '@xds/core/ContextMenu',
  '@xds/core/Breadcrumbs',
]);

/** Imported component names whose `aria-label` becomes `label`. */
const TARGET_IMPORTED_NAMES = new Set([
  'DropdownMenuRadioGroup',
  'ContextMenuRadioGroup',
  'BreadcrumbMenuRadioGroup',
]);

/**
 * @param {import('../../../../authoring/codemod/type').AstryxCodemodFile} file
 * @param {import('../../../../authoring/codemod/type').CodemodTransformApi} api
 * @returns {string | null | undefined}
 */
export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let hasChanges = false;

  // Track alias-aware local names for the target components.
  const targetLocals = new Set();
  root.find(j.ImportDeclaration).forEach((/** @type {any} */ path) => {
    if (!IMPORT_SOURCES.has(path.node.source.value)) return;
    for (const spec of path.node.specifiers ?? []) {
      if (
        spec.type === 'ImportSpecifier' &&
        TARGET_IMPORTED_NAMES.has(spec.imported.name)
      ) {
        targetLocals.add(spec.local.name);
      }
    }
  });

  if (targetLocals.size === 0) return undefined;

  root.find(j.JSXOpeningElement).forEach((/** @type {any} */ path) => {
    const name = path.node.name;
    const componentName = name.type === 'JSXIdentifier' ? name.name : null;
    if (!componentName || !targetLocals.has(componentName)) return;

    for (const attr of path.node.attributes ?? []) {
      if (
        attr.type === 'JSXAttribute' &&
        attr.name?.type === 'JSXIdentifier' &&
        attr.name.name === 'aria-label'
      ) {
        attr.name.name = 'label';
        hasChanges = true;
      }
    }
  });

  if (!hasChanges) return undefined;
  return root.toSource({quote: 'single'});
}
