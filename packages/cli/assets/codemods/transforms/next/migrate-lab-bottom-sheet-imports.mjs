// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Codemod: Repoint lab BottomSheet imports to core
 */

export const meta = {
  title: 'Repoint lab BottomSheet imports to core',
  description:
    'Moves BottomSheet imports from @astryxdesign/lab to @astryxdesign/core/BottomSheet.',
};

const BOTTOM_SHEET_EXPORTS = new Set([
  'BottomSheet',
  'BottomSheetProps',
  'BottomSheetSwitcher',
  'BottomSheetSwitcherProps',
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

  root.find(j.ImportDeclaration).forEach((/** @type {any} */ path) => {
    if (path.node.source.value === '@astryxdesign/lab/BottomSheet') {
      path.node.source.value = '@astryxdesign/core/BottomSheet';
      hasChanges = true;
      return;
    }
    if (path.node.source.value !== '@astryxdesign/lab') {
      return;
    }

    const bottomSheetSpecifiers = [];
    const remainingSpecifiers = [];
    for (const specifier of path.node.specifiers ?? []) {
      if (
        specifier.type === 'ImportSpecifier' &&
        BOTTOM_SHEET_EXPORTS.has(specifier.imported.name)
      ) {
        bottomSheetSpecifiers.push(specifier);
      } else {
        remainingSpecifiers.push(specifier);
      }
    }
    if (bottomSheetSpecifiers.length === 0) {
      return;
    }

    path.node.specifiers = remainingSpecifiers;
    j(path).insertBefore(
      j.importDeclaration(
        bottomSheetSpecifiers,
        j.literal('@astryxdesign/core/BottomSheet'),
      ),
    );
    if (remainingSpecifiers.length === 0) {
      j(path).remove();
    }
    hasChanges = true;
  });

  return hasChanges ? root.toSource({quote: 'single'}) : undefined;
}
