// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Codemod: migrate List edgeCompensation to edge
 *
 * `edgeCompensation="inline"` on an imported `List` becomes `edge="outset"`,
 * the value it already resolves to. When the element already sets `edge`,
 * the deprecated prop is removed, since `edge` wins. Dynamic values are left
 * unchanged: the deprecated prop keeps working, so an unmigrated callsite is
 * still correct, and guessing at an expression's values would not be.
 */

import {transformProp} from '../../transform-prop.mjs';

export const meta = {
  title: 'Migrate List edgeCompensation to edge',
  description:
    'Renames `edgeCompensation="inline"` to `edge="outset"` on List, and ' +
    'drops `edgeCompensation` where `edge` is already set. Dynamic values ' +
    'are left for manual migration; the deprecated prop still works.',
};

const CORE_IMPORT_RE = /^@(astryxdesign|xds)\/core(?:\/|$)/;

const COMPONENT_PROPS = new Map([['List', new Set(['edgeCompensation'])]]);

/**
 * Unwrap type assertions and parentheses around a static value.
 * @param {any} node
 */
function unwrap(node) {
  let current = node;
  while (
    current &&
    (current.type === 'TSAsExpression' ||
      current.type === 'TSSatisfiesExpression' ||
      current.type === 'TypeCastExpression' ||
      current.type === 'ParenthesizedExpression')
  ) {
    current = current.expression;
  }
  return current;
}

/** @param {any} node */
function isInlineLiteral(node) {
  const value = unwrap(node);
  return (
    value != null &&
    (value.type === 'StringLiteral' || value.type === 'Literal') &&
    value.value === 'inline'
  );
}

/**
 * @param {import('../../../../authoring/codemod/type').AstryxCodemodFile} file
 * @param {import('../../../../authoring/codemod/type').CodemodTransformApi} api
 * @returns {string | null | undefined}
 */
export default function transformer(file, api) {
  if (!file.source.includes('edgeCompensation')) return undefined;
  const j = api.jscodeshift;
  const root = j(file.source);
  let hasChanges = false;

  transformProp(
    root,
    j,
    {
      matchesImport: source => CORE_IMPORT_RE.test(source),
      components: COMPONENT_PROPS,
    },
    propPath => {
      const opening = propPath.parent?.node;
      const attributes = opening?.attributes ?? [];
      const prop = propPath.node;
      const hasEdge = attributes.some(
        (/** @type {any} */ attribute) =>
          attribute.type === 'JSXAttribute' && attribute.name?.name === 'edge',
      );
      if (hasEdge) {
        opening.attributes = attributes.filter(
          (/** @type {any} */ attribute) => attribute !== prop,
        );
        hasChanges = true;
        return;
      }
      const value =
        prop.value?.type === 'JSXExpressionContainer'
          ? prop.value.expression
          : prop.value;
      if (!isInlineLiteral(value)) return;
      prop.name.name = 'edge';
      prop.value = j.stringLiteral('outset');
      hasChanges = true;
    },
  );

  if (!hasChanges) return undefined;
  return root.toSource({quote: 'single'});
}
