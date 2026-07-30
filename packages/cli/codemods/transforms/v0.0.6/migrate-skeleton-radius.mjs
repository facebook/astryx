// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Codemod: Migrate XDSSkeleton radius prop to numeric scale
 *
 * Transforms:
 * - radius="inner" → radius={0}
 * - radius="content" → radius={1}
 * - radius="element" → radius={2}
 * - radius="container" → radius={3}
 */

export const meta = {
  title: 'Migrate XDSSkeleton radius prop to numeric scale',
  description:
    'Replaces semantic radius prop values (inner, content, element, container) with numeric equivalents (0, 1, 2, 3).',
};

/** @type {Record<string, number>} */
const RADIUS_MAP = {
  inner: 0,
  content: 1,
  element: 2,
  container: 3,
};

/**
 * @param {import('../../../types/codemod').AstryxCodemodFile} file
 * @param {import('../../../types/codemod').CodemodTransformApi} api
 * @returns {string | null | undefined}
 */
export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let hasChanges = false;

  root
    .find(j.JSXOpeningElement, {
      name: {name: 'XDSSkeleton'},
    })
    .forEach((/** @type {any} */ path) => {
      const attrs = path.node.attributes;
      for (const attr of attrs) {
        if (attr.type !== 'JSXAttribute') continue;
        if (attr.name.name !== 'radius') continue;

        // Handle radius="container" (JSX string attribute — Literal or StringLiteral)
        if (
          attr.value &&
          (attr.value.type === 'StringLiteral' ||
            attr.value.type === 'Literal') &&
          typeof attr.value.value === 'string'
        ) {
          const oldValue = attr.value.value;
          if (oldValue in RADIUS_MAP) {
            attr.value = j.jsxExpressionContainer(
              j.numericLiteral(RADIUS_MAP[oldValue]),
            );
            hasChanges = true;
          }
        }

        // Handle radius={"container"} (expression container with string)
        if (
          attr.value &&
          attr.value.type === 'JSXExpressionContainer' &&
          (attr.value.expression.type === 'StringLiteral' ||
            attr.value.expression.type === 'Literal') &&
          typeof attr.value.expression.value === 'string'
        ) {
          const oldValue = attr.value.expression.value;
          if (oldValue in RADIUS_MAP) {
            attr.value = j.jsxExpressionContainer(
              j.numericLiteral(RADIUS_MAP[oldValue]),
            );
            hasChanges = true;
          }
        }
      }
    });

  return hasChanges ? root.toSource() : undefined;
}
