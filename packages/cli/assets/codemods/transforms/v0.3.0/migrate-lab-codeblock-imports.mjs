// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Codemod: Repoint lab CodeBlock imports to core
 */

export const meta = {
  title: 'Repoint lab CodeBlock imports to core',
  description:
    'Moves CodeBlock imports from @astryxdesign/lab to @astryxdesign/core/CodeBlock.',
  pr: '#4657',
};

const CODEBLOCK_EXPORTS = new Set(['CodeBlock', 'CodeBlockProps']);

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
    if (path.node.source.value !== '@astryxdesign/lab') return;
    const codeBlockSpecs = [];
    const remainingSpecs = [];
    for (const spec of path.node.specifiers ?? []) {
      if (
        spec.type === 'ImportSpecifier' &&
        CODEBLOCK_EXPORTS.has(spec.imported.name)
      ) {
        codeBlockSpecs.push(spec);
      } else {
        remainingSpecs.push(spec);
      }
    }
    if (codeBlockSpecs.length === 0) return;
    path.node.specifiers = remainingSpecs;
    const coreImport = j.importDeclaration(
      codeBlockSpecs,
      j.literal('@astryxdesign/core/CodeBlock'),
    );
    j(path).insertBefore(coreImport);
    if (remainingSpecs.length === 0) j(path).remove();
    hasChanges = true;
  });

  return hasChanges ? root.toSource({quote: 'single'}) : undefined;
}
