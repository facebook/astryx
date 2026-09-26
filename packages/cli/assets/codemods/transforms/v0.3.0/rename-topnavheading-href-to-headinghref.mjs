// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Codemod: Rename TopNavHeading href to headingHref
 */

export const meta = {
  title: 'Rename TopNavHeading href to headingHref',
  description: 'Renames the removed TopNavHeading href alias to headingHref.',
  pr: '#4657',
};

const IMPORT_SOURCES = new Set([
  '@astryxdesign/core',
  '@astryxdesign/core/TopNav',
  '@xds/core',
  '@xds/core/TopNav',
]);

/**
 * @param {import('../../../../authoring/codemod/type').AstryxCodemodFile} file
 * @param {import('../../../../authoring/codemod/type').CodemodTransformApi} api
 * @returns {string | null | undefined}
 */
export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  const locals = new Set();
  let hasChanges = false;

  root.find(j.ImportDeclaration).forEach((/** @type {any} */ path) => {
    if (!IMPORT_SOURCES.has(path.node.source.value)) return;
    for (const spec of path.node.specifiers ?? []) {
      if (
        spec.type === 'ImportSpecifier' &&
        spec.imported.name === 'TopNavHeading'
      ) {
        locals.add(spec.local.name);
      }
    }
  });
  if (locals.size === 0) return undefined;

  root.find(j.JSXOpeningElement).forEach((/** @type {any} */ path) => {
    const name = path.node.name;
    const componentName = name.type === 'JSXIdentifier' ? name.name : null;
    if (!componentName || !locals.has(componentName)) return;
    for (const attr of path.node.attributes ?? []) {
      if (attr.type !== 'JSXAttribute') continue;
      if (attr.name?.name !== 'href') continue;
      const hasHeadingHref = path.node.attributes.some(
        (/** @type {any} */ a) =>
          a.type === 'JSXAttribute' && a.name?.name === 'headingHref',
      );
      if (hasHeadingHref) continue;
      attr.name.name = 'headingHref';
      hasChanges = true;
    }
  });

  return hasChanges ? root.toSource({quote: 'single'}) : undefined;
}
