// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Codemod: rename emptySearchResultsText to emptySearchText
 *
 * `emptySearchResultsText` was renamed to `emptySearchText` (`spec:AST-056`
 * FR1) and the old name is removed in a minor release. The new prop takes a
 * `ReactNode`, so every old `string` value stays valid and the rename never
 * changes a value.
 *
 * A straight rename at the JSX boundary, through the shared `transformProp`
 * helper: the prop on an imported `Tokenizer`, `Typeahead`, or `BaseTypeahead`
 * element, and the key on `ChatComposerInput` trigger objects written inline
 * in its `triggers` prop. Like every transform built on the helper it does
 * not follow variables, helpers, spreads, wrappers, or types; where the new
 * name is already set, or a trigger object has a spread or computed key, it
 * leaves a TODO instead of choosing a winner. The type checker reports any
 * `emptySearchResultsText` it did not reach.
 */

import {transformProp} from '../../transform-prop.mjs';

export const meta = {
  title: 'Rename emptySearchResultsText to emptySearchText',
  description:
    'Renames the removed `emptySearchResultsText` prop to `emptySearchText` ' +
    'on imported Tokenizer, Typeahead, and BaseTypeahead elements, and the ' +
    "same key on trigger objects written inline in ChatComposerInput's " +
    '`triggers`. Leaves a TODO where the new name is already set or a ' +
    'trigger object has a spread or computed key.',
};

const OLD_NAME = 'emptySearchResultsText';
const NEW_NAME = 'emptySearchText';
const CORE_IMPORT_RE = /^@(astryxdesign|xds)\/core(?:\/|$)/;

const COMPONENTS = new Map([
  ['Tokenizer', new Set([OLD_NAME])],
  ['Typeahead', new Set([OLD_NAME])],
  ['BaseTypeahead', new Set([OLD_NAME])],
  ['ChatComposerInput', new Set(['triggers'])],
]);

const BOTH_SET_COMMENT =
  ' TODO(astryx upgrade): emptySearchResultsText was removed and ' +
  'emptySearchText is already set here; delete the old one if the new value ' +
  'is what you want. ';
const UNREADABLE_OBJECT_COMMENT =
  ' TODO(astryx upgrade): emptySearchResultsText was removed. Rename it to ' +
  'emptySearchText by hand; this object has a spread or computed key. ';

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

/** @param {any} property */
function staticPropertyName(property) {
  if (property.computed) return null;
  const key = property.key;
  if (key?.type === 'Identifier') return key.name;
  if (key?.type === 'StringLiteral' || key?.type === 'Literal') {
    return typeof key.value === 'string' ? key.value : null;
  }
  return null;
}

/**
 * Attach a comment to a node once (re-running the codemod adds nothing).
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

/**
 * Rename the key on one trigger object literal.
 * @param {any} j @param {any} object @returns {boolean}
 */
function renameTriggerKey(j, object) {
  const old = object.properties.find(
    (/** @type {any} */ property) => staticPropertyName(property) === OLD_NAME,
  );
  if (!old) return false;
  const unreadable = object.properties.some(
    (/** @type {any} */ property) =>
      property.type === 'SpreadElement' ||
      property.type === 'SpreadProperty' ||
      property.computed,
  );
  if (unreadable) return addComment(j, old, UNREADABLE_OBJECT_COMMENT);
  const already = object.properties.some(
    (/** @type {any} */ property) => staticPropertyName(property) === NEW_NAME,
  );
  if (already) return addComment(j, old, BOTH_SET_COMMENT);
  old.key = j.identifier(NEW_NAME);
  if (old.shorthand) old.shorthand = false;
  return true;
}

/** @param {any} fileInfo @param {any} api */
export default function transform(fileInfo, api) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);
  let changed = false;

  transformProp(
    root,
    j,
    {
      matchesImport: source => CORE_IMPORT_RE.test(source),
      components: COMPONENTS,
    },
    (propPath, {component}) => {
      const prop = propPath.node;
      if (component === 'ChatComposerInput') {
        // `triggers={[{...}, {...}]}` or `triggers={{...}}`: rename the key
        // on each object written inline; anything else is out of reach.
        const value =
          prop.value?.type === 'JSXExpressionContainer'
            ? unwrap(prop.value.expression)
            : null;
        const objects =
          value?.type === 'ArrayExpression'
            ? value.elements.map((/** @type {any} */ e) => unwrap(e))
            : [value];
        for (const object of objects) {
          if (object?.type === 'ObjectExpression') {
            changed = renameTriggerKey(j, object) || changed;
          }
        }
        return;
      }
      const attributes = propPath.parent.node.attributes ?? [];
      const already = attributes.some(
        (/** @type {any} */ attribute) =>
          attribute.type === 'JSXAttribute' &&
          attribute.name?.name === NEW_NAME,
      );
      if (already) {
        changed = addComment(j, prop, BOTH_SET_COMMENT) || changed;
        return;
      }
      prop.name.name = NEW_NAME;
      changed = true;
    },
  );

  return changed ? root.toSource({quote: 'single'}) : null;
}
