// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Codemod: Migrate Grid minChildWidth to columns.minWidth
 */

export const meta = {
  title: 'Migrate Grid minChildWidth to columns.minWidth',
  description:
    'Rewrites <Grid minChildWidth={n}> to <Grid columns={{minWidth: n, repeat: "fit"}}> where safe.',
  pr: '#4657',
};

const IMPORT_SOURCES = new Set([
  '@astryxdesign/core',
  '@astryxdesign/core/Grid',
  '@xds/core',
  '@xds/core/Grid',
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
      if (spec.type === 'ImportSpecifier' && spec.imported.name === 'Grid') {
        locals.add(spec.local.name);
      }
    }
  });
  if (locals.size === 0) return undefined;

  root.find(j.JSXOpeningElement).forEach((/** @type {any} */ path) => {
    const name = path.node.name;
    const componentName = name.type === 'JSXIdentifier' ? name.name : null;
    if (!componentName || !locals.has(componentName)) return;
    const attrs = path.node.attributes ?? [];
    const minAttr = attrs.find(
      (/** @type {any} */ a) =>
        a.type === 'JSXAttribute' && a.name?.name === 'minChildWidth',
    );
    if (!minAttr) return;
    const hasColumns = attrs.some(
      (/** @type {any} */ a) =>
        a.type === 'JSXAttribute' && a.name?.name === 'columns',
    );
    if (hasColumns) return;

    let minWidthExpr;
    if (
      minAttr.value?.type === 'StringLiteral' ||
      minAttr.value?.type === 'Literal'
    ) {
      minWidthExpr = j.literal(Number(minAttr.value.value));
    } else if (minAttr.value?.type === 'JSXExpressionContainer') {
      minWidthExpr = minAttr.value.expression;
    } else {
      return;
    }

    const columnsObject = j.objectExpression([
      j.property('init', j.identifier('minWidth'), minWidthExpr),
      j.property('init', j.identifier('repeat'), j.literal('fit')),
    ]);
    const replacement = j.jsxAttribute(
      j.jsxIdentifier('columns'),
      j.jsxExpressionContainer(columnsObject),
    );
    attrs.splice(attrs.indexOf(minAttr), 1, replacement);
    hasChanges = true;
  });

  return hasChanges ? root.toSource({quote: 'single'}) : undefined;
}
