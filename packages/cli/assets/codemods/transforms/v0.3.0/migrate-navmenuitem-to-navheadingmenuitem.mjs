// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Codemod: Rename NavMenuItem to NavHeadingMenuItem
 */

export const meta = {
  title: 'Rename NavMenuItem to NavHeadingMenuItem',
  description:
    'Rewrites the removed NavMenuItem alias and its props type to NavHeadingMenuItem.',
  pr: '#4657',
};

const IMPORT_SOURCES = new Set([
  '@astryxdesign/core',
  '@astryxdesign/core/NavMenu',
  '@xds/core',
  '@xds/core/NavMenu',
]);

/**
 * @param {import('../../../../authoring/codemod/type').AstryxCodemodFile} file
 * @param {import('../../../../authoring/codemod/type').CodemodTransformApi} api
 * @returns {string | null | undefined}
 */
export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  const renames = new Map();
  let hasChanges = false;

  root.find(j.ImportDeclaration).forEach((/** @type {any} */ path) => {
    if (!IMPORT_SOURCES.has(path.node.source.value)) return;
    for (const spec of path.node.specifiers ?? []) {
      if (spec.type !== 'ImportSpecifier') continue;
      if (
        spec.imported.name === 'NavMenuItem' ||
        spec.imported.name === 'NavMenuItemProps'
      ) {
        const oldLocal = spec.local?.name ?? spec.imported.name;
        const nextName =
          spec.imported.name === 'NavMenuItem'
            ? 'NavHeadingMenuItem'
            : 'NavHeadingMenuItemProps';
        spec.imported.name = nextName;
        spec.local = j.identifier(nextName);
        renames.set(oldLocal, nextName);
        hasChanges = true;
      }
    }
  });

  for (const [oldName, nextName] of renames) {
    root
      .find(j.JSXIdentifier, {name: oldName})
      .replaceWith(() => j.jsxIdentifier(nextName));
    root
      .find(j.Identifier, {name: oldName})
      .replaceWith(() => j.identifier(nextName));
  }

  return hasChanges ? root.toSource({quote: 'single'}) : undefined;
}
