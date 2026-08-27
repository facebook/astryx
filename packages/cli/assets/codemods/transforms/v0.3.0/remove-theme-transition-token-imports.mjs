// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Codemod: Remove deprecated transition token imports
 */

export const meta = {
  title: 'Remove deprecated transition token imports',
  description:
    'Removes import specifiers for transitionDefaults, transitionRaw, transitionVars, and TransitionVarName.',
  pr: '#4657',
};

const REMOVED = new Set([
  'transitionDefaults',
  'transitionRaw',
  'transitionVars',
  'TransitionVarName',
]);
const SOURCES = new Set([
  '@astryxdesign/core',
  '@astryxdesign/core/theme',
  '@astryxdesign/core/theme/tokens.stylex',
  '@xds/core',
  '@xds/core/theme',
  '@xds/core/theme/tokens.stylex',
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
    if (!SOURCES.has(path.node.source.value)) return;
    const before = path.node.specifiers?.length ?? 0;
    path.node.specifiers = (path.node.specifiers ?? []).filter(
      (/** @type {any} */ spec) => {
        if (spec.type !== 'ImportSpecifier') return true;
        return !REMOVED.has(spec.imported.name);
      },
    );
    if ((path.node.specifiers?.length ?? 0) !== before) {
      hasChanges = true;
      if ((path.node.specifiers?.length ?? 0) === 0) j(path).remove();
    }
  });

  return hasChanges ? root.toSource({quote: 'single'}) : undefined;
}
