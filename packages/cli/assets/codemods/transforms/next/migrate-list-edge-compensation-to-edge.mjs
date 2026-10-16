// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Codemod: migrate List edgeCompensation to edge
 *
 * `edgeCompensation="inline"` on an imported `List` becomes `edge="outset"`,
 * the value it already resolves to. When the element already sets `edge`,
 * the deprecated prop is removed, since `edge` wins whatever its value.
 *
 * Built on the shared `transformProp` helper, so it does not follow
 * variables, helpers, wrappers, or types. Where it cannot prove the old
 * value it leaves a TODO instead of guessing: a dynamic `edgeCompensation`
 * value, and any spread onto a `List` (a spread may carry the old prop). The
 * deprecated prop keeps working, so an unmigrated callsite stays correct.
 * Comments are the codemod's only report channel (`api.report` is a stub),
 * and each is added once, so a second run changes nothing.
 */

import {transformProp} from '../../transform-prop.mjs';

export const meta = {
  title: 'Migrate List edgeCompensation to edge',
  description:
    'Renames `edgeCompensation="inline"` to `edge="outset"` on List, and ' +
    'drops `edgeCompensation` where `edge` is already set. Leaves a TODO on ' +
    'a dynamic `edgeCompensation` value and on every spread onto a List; ' +
    'the deprecated prop still works there.',
};

const OLD_NAME = 'edgeCompensation';
const NEW_NAME = 'edge';
const CORE_IMPORT_RE = /^@(astryxdesign|xds)\/core(?:\/|$)/;

const COMPONENT_PROPS = new Map([['List', new Set([OLD_NAME])]]);

const DYNAMIC_COMMENT =
  ' TODO(astryx upgrade): edgeCompensation is deprecated. Replace ' +
  'edgeCompensation="inline" with edge="outset" by hand; this value is ' +
  'computed. ';
const SPREAD_COMMENT =
  ' TODO(astryx upgrade): edgeCompensation is deprecated. This List spreads ' +
  'props that may carry it; where they are built, replace ' +
  'edgeCompensation="inline" with edge="outset". ';

const TYPE_WRAPPERS = new Set([
  'TSAsExpression',
  'TSSatisfiesExpression',
  'TSTypeAssertion',
  'TSNonNullExpression',
  'TypeCastExpression',
  'ParenthesizedExpression',
]);

/** @param {any} node */
function unwrap(node) {
  let current = node;
  while (current && TYPE_WRAPPERS.has(current.type)) {
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
 * Attach a comment to a node once, so re-running the codemod adds nothing.
 * @param {any} j @param {any} node @param {string} text
 */
function addComment(j, node, text) {
  node.comments ??= [];
  if (node.comments.some((/** @type {any} */ c) => c.value === text)) {
    return false;
  }
  node.comments.push(j.commentBlock(text, true, false));
  return true;
}

/** @param {any} attributes */
function firstSpread(attributes) {
  return attributes.find(
    (/** @type {any} */ attribute) => attribute.type === 'JSXSpreadAttribute',
  );
}

/**
 * @param {import('../../../../authoring/codemod/type').AstryxCodemodFile} file
 * @param {import('../../../../authoring/codemod/type').CodemodTransformApi} api
 * @returns {string | null | undefined}
 */
export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let hasChanges = false;
  /** @type {Set<any>} */
  const handled = new Set();

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
      handled.add(opening);
      const hasEdge = attributes.some(
        (/** @type {any} */ attribute) =>
          attribute.type === 'JSXAttribute' &&
          attribute.name?.name === NEW_NAME,
      );
      if (hasEdge) {
        // `edge` wins at runtime whatever either value is, so the old prop
        // is inert here and removing it changes nothing.
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
      if (!isInlineLiteral(value)) {
        hasChanges = addComment(j, prop, DYNAMIC_COMMENT) || hasChanges;
        return;
      }
      prop.name.name = NEW_NAME;
      prop.value = j.stringLiteral('outset');
      hasChanges = true;
      // A spread written after the old prop could override the new one.
      const spread = firstSpread(attributes);
      if (spread) {
        hasChanges = addComment(j, spread, SPREAD_COMMENT) || hasChanges;
      }
    },
  );

  // Spreads onto a List that writes neither name: the spread may carry the
  // old prop, so it gets the TODO. Let the shared helper decide whether each
  // element is the imported List by giving it a sentinel prop to find.
  const sentinel = '__astryx_list_spread';
  root
    .find(j.JSXOpeningElement)
    .filter(
      (/** @type {any} */ path) =>
        !handled.has(path.node) && firstSpread(path.node.attributes ?? []),
    )
    .forEach((/** @type {any} */ path) => {
      const attributes = path.node.attributes ?? [];
      if (
        attributes.some(
          (/** @type {any} */ attribute) =>
            attribute.type === 'JSXAttribute' &&
            attribute.name?.name === NEW_NAME,
        )
      ) {
        // `edge` is set, so whatever the spread carries, `edge` wins.
        return;
      }
      const marker = j.jsxAttribute(j.jsxIdentifier(sentinel));
      path.node.attributes = [...attributes, marker];
      let matched = false;
      transformProp(
        root,
        j,
        {
          matchesImport: source => CORE_IMPORT_RE.test(source),
          components: new Map([['List', new Set([sentinel])]]),
        },
        propPath => {
          if (propPath.node === marker) matched = true;
        },
      );
      path.node.attributes = attributes;
      if (!matched) return;
      hasChanges =
        addComment(j, firstSpread(attributes), SPREAD_COMMENT) || hasChanges;
    });

  if (!hasChanges) return undefined;
  return root.toSource({quote: 'single'});
}
