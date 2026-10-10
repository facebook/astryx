// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Codemod: rename emptySearchResultsText to emptySearchText
 *
 * `emptySearchResultsText` was renamed to `emptySearchText` (`spec:AST-056`
 * FR1) and the old name is removed in a minor release (`CLN-0001`–`CLN-0004`).
 * The new prop takes a `ReactNode`, so every old `string` value stays valid
 * and the rename never changes a value.
 *
 * Rewritten:
 * - the JSX prop on imported `Tokenizer`, `Typeahead`, and `BaseTypeahead`;
 * - the key on `ChatComposerInput` trigger objects written inline in its
 *   `triggers` prop, held in a same-file `const` that `triggers` names, or
 *   typed as `ChatComposerTrigger` (annotation, `as`, or `satisfies`).
 *
 * When the element or object already sets `emptySearchText`, the old entry is
 * dropped, because the new name already won. A trigger object with a spread or
 * a computed key keeps its keys and gets a TODO instead: renaming could change
 * which value wins. Props spread onto the element and triggers built
 * elsewhere are out of reach; the type checker reports what remains.
 */

import {transformProp} from '../../transform-prop.mjs';

export const meta = {
  title: 'Rename emptySearchResultsText to emptySearchText',
  description:
    'Renames the removed `emptySearchResultsText` prop to `emptySearchText` ' +
    'on Tokenizer, Typeahead, and BaseTypeahead, and the same key on ' +
    'ChatComposerInput trigger objects. Drops the old entry where ' +
    '`emptySearchText` is already set, and marks trigger objects with ' +
    'spreads or computed keys for manual migration.',
};

const OLD_NAME = 'emptySearchResultsText';
const NEW_NAME = 'emptySearchText';
const CORE_IMPORT_RE = /^@(astryxdesign|xds)\/core(?:\/|$)/;

const JSX_COMPONENTS = new Map([
  ['Tokenizer', new Set([OLD_NAME])],
  ['Typeahead', new Set([OLD_NAME])],
  ['BaseTypeahead', new Set([OLD_NAME])],
]);
const CHAT_COMPONENTS = new Map([['ChatComposerInput', new Set(['triggers'])]]);
const TRIGGER_TYPE = 'ChatComposerTrigger';

const MANUAL_MIGRATION_COMMENT =
  ' TODO(astryx upgrade): emptySearchResultsText was removed. Rename it to ' +
  'emptySearchText by hand; this object has a spread or computed key, so ' +
  'check which value should win. ';

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

/** @param {any} property */
function isDynamicProperty(property) {
  return (
    property.computed === true ||
    property.type === 'SpreadElement' ||
    property.type === 'SpreadProperty' ||
    property.type === 'ExperimentalSpreadProperty'
  );
}

/**
 * Rename the key on one trigger object.
 * @param {any} j
 * @param {any} object
 * @returns {boolean} whether the object changed
 */
function migrateTriggerObject(j, object) {
  const oldProperty = object.properties.find(
    (/** @type {any} */ property) => staticPropertyName(property) === OLD_NAME,
  );
  if (!oldProperty) return false;

  if (object.properties.some(isDynamicProperty)) {
    oldProperty.comments ??= [];
    if (
      oldProperty.comments.some(
        (/** @type {any} */ comment) =>
          comment.value === MANUAL_MIGRATION_COMMENT,
      )
    ) {
      return false;
    }
    oldProperty.comments.push(
      j.commentBlock(MANUAL_MIGRATION_COMMENT, true, false),
    );
    return true;
  }

  const hasNew = object.properties.some(
    (/** @type {any} */ property) => staticPropertyName(property) === NEW_NAME,
  );
  if (hasNew) {
    object.properties = object.properties.filter(
      (/** @type {any} */ property) => property !== oldProperty,
    );
    return true;
  }
  if (oldProperty.shorthand) oldProperty.shorthand = false;
  if (oldProperty.key.type === 'Identifier') {
    oldProperty.key = j.identifier(NEW_NAME);
  } else {
    oldProperty.key.value = NEW_NAME;
    if (oldProperty.key.raw) oldProperty.key.raw = undefined;
    if (oldProperty.key.extra) oldProperty.key.extra = undefined;
  }
  return true;
}

/**
 * Trigger objects held by an expression: an object, or an array of them.
 * @param {any} node
 * @returns {any[]}
 */
function triggerObjectsIn(node) {
  const value = unwrap(node);
  if (value?.type === 'ObjectExpression') return [value];
  if (value?.type === 'ArrayExpression') {
    return value.elements
      .map((/** @type {any} */ element) => unwrap(element))
      .filter(
        (/** @type {any} */ element) => element?.type === 'ObjectExpression',
      );
  }
  return [];
}

/**
 * The local names a file gives the core `ChatComposerTrigger` type.
 * @param {any} root
 * @param {any} j
 */
function triggerTypeNames(root, j) {
  /** @type {Set<string>} */
  const names = new Set();
  /** @type {Set<string>} */
  const namespaces = new Set();
  root.find(j.ImportDeclaration).forEach((/** @type {any} */ path) => {
    const source = path.node.source.value;
    if (typeof source !== 'string' || !CORE_IMPORT_RE.test(source)) return;
    for (const specifier of path.node.specifiers ?? []) {
      if (specifier.type === 'ImportSpecifier') {
        const imported = specifier.imported?.name ?? specifier.imported?.value;
        if (imported === TRIGGER_TYPE) {
          names.add(specifier.local?.name ?? imported);
        }
      } else if (specifier.type === 'ImportNamespaceSpecifier') {
        namespaces.add(specifier.local.name);
      }
    }
  });
  return {names, namespaces};
}

/**
 * Whether a type annotation names `ChatComposerTrigger` or an array of it.
 * @param {any} type
 * @param {{names: Set<string>, namespaces: Set<string>}} typeNames
 * @returns {boolean}
 */
function isTriggerType(type, typeNames) {
  if (!type) return false;
  if (type.type === 'TSTypeAnnotation') {
    return isTriggerType(type.typeAnnotation, typeNames);
  }
  if (type.type === 'TSArrayType') {
    return isTriggerType(type.elementType, typeNames);
  }
  if (type.type === 'TSTypeOperator') {
    return isTriggerType(type.typeAnnotation, typeNames);
  }
  if (type.type === 'TSTypeReference') {
    const name = type.typeName;
    if (name?.type === 'Identifier') {
      if (typeNames.names.has(name.name)) return true;
      if (
        (name.name === 'Array' || name.name === 'ReadonlyArray') &&
        type.typeParameters?.params?.length === 1
      ) {
        return isTriggerType(type.typeParameters.params[0], typeNames);
      }
      return false;
    }
    return (
      name?.type === 'TSQualifiedName' &&
      name.left?.type === 'Identifier' &&
      typeNames.namespaces.has(name.left.name) &&
      name.right?.name === TRIGGER_TYPE
    );
  }
  return false;
}

/**
 * @param {import('../../../../authoring/codemod/type').AstryxCodemodFile} file
 * @param {import('../../../../authoring/codemod/type').CodemodTransformApi} api
 * @returns {string | null | undefined}
 */
export default function transformer(file, api) {
  if (!file.source.includes(OLD_NAME)) return undefined;
  const j = api.jscodeshift;
  const root = j(file.source);
  let changed = false;

  // 1. The JSX prop on the three typeahead components.
  transformProp(
    root,
    j,
    {
      matchesImport: source => CORE_IMPORT_RE.test(source),
      components: JSX_COMPONENTS,
    },
    propPath => {
      const opening = propPath.parent?.node;
      const attributes = opening?.attributes ?? [];
      const prop = propPath.node;
      const hasNew = attributes.some(
        (/** @type {any} */ attribute) =>
          attribute.type === 'JSXAttribute' &&
          attribute.name?.name === NEW_NAME,
      );
      if (hasNew) {
        opening.attributes = attributes.filter(
          (/** @type {any} */ attribute) => attribute !== prop,
        );
      } else {
        prop.name.name = NEW_NAME;
      }
      changed = true;
    },
  );

  /** @type {Set<any>} */
  const triggerObjects = new Set();

  // 2. Trigger objects reached from ChatComposerInput's `triggers` prop:
  // written inline, or held in a same-file `const` the prop names.
  transformProp(
    root,
    j,
    {
      matchesImport: source => CORE_IMPORT_RE.test(source),
      components: CHAT_COMPONENTS,
    },
    propPath => {
      const value = propPath.node.value;
      if (value?.type !== 'JSXExpressionContainer') return;
      const expression = unwrap(value.expression);
      for (const object of triggerObjectsIn(expression)) {
        triggerObjects.add(object);
      }
      /** @type {any[]} */
      const identifiers =
        expression?.type === 'Identifier'
          ? [expression]
          : expression?.type === 'ArrayExpression'
            ? expression.elements
                .map((/** @type {any} */ element) => unwrap(element))
                .filter(
                  (/** @type {any} */ element) =>
                    element?.type === 'Identifier',
                )
            : [];
      for (const identifier of identifiers) {
        const scope = propPath.scope.lookup(identifier.name);
        if (!scope) continue;
        const bindings = scope.getBindings()[identifier.name] ?? [];
        for (const binding of bindings) {
          const declarator = binding.parent?.node;
          if (
            declarator?.type !== 'VariableDeclarator' ||
            declarator.id !== binding.node ||
            binding.parent.parent?.node?.kind !== 'const'
          ) {
            continue;
          }
          for (const object of triggerObjectsIn(declarator.init)) {
            triggerObjects.add(object);
          }
        }
      }
    },
  );

  // 3. Objects typed as ChatComposerTrigger, wherever they are.
  const typeNames = triggerTypeNames(root, j);
  if (typeNames.names.size > 0 || typeNames.namespaces.size > 0) {
    root.find(j.VariableDeclarator).forEach((/** @type {any} */ path) => {
      if (!isTriggerType(path.node.id?.typeAnnotation, typeNames)) return;
      for (const object of triggerObjectsIn(path.node.init)) {
        triggerObjects.add(object);
      }
    });
    for (const type of ['TSAsExpression', 'TSSatisfiesExpression']) {
      root.find(j[type]).forEach((/** @type {any} */ path) => {
        if (!isTriggerType(path.node.typeAnnotation, typeNames)) return;
        for (const object of triggerObjectsIn(path.node.expression)) {
          triggerObjects.add(object);
        }
      });
    }
  }

  for (const object of triggerObjects) {
    changed = migrateTriggerObject(j, object) || changed;
  }

  return changed ? root.toSource({quote: 'single'}) : undefined;
}
