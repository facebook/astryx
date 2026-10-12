// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Codemod: rename emptySearchResultsText to emptySearchText
 *
 * `emptySearchResultsText` was renamed to `emptySearchText` (`spec:AST-056`
 * FR1) and the old name is removed in a minor release (`CLN-0001`–`CLN-0004`).
 * The new prop takes a `ReactNode`, so every old `string` value stays valid
 * and the rename never changes a value.
 *
 * Rewritten, when the construct is proven to reach the component:
 * - the JSX prop on imported `Tokenizer`, `Typeahead`, and `BaseTypeahead`,
 *   on an element with no spread;
 * - the key on `ChatComposerInput` trigger objects written inline in its
 *   `triggers` prop or held in a same-file `const` that `triggers` names,
 *   when the object has no spread or computed key.
 *
 * When the element or object already sets `emptySearchText` to a value that
 * is never null, the old entry is dropped; when that value may be nullish the
 * old value becomes its `??` fallback, which is what 0.6.x rendered.
 *
 * Reported with a TODO instead of edited: an element with a spread, a trigger
 * object with a spread or computed key, a `triggers` value or a spread object
 * the file does not build (imported, forwarded props, a call, an object that
 * itself spreads something), an object reached only through a type-only
 * `ChatComposerTrigger` import (a type-only import proves no runtime value),
 * and any other object key of the old name in a file that imports from core.
 * After the removal the type checker does not notice a stray old key, so
 * nothing is left silent.
 */

import {transformProp} from '../../transform-prop.mjs';

export const meta = {
  title: 'Rename emptySearchResultsText to emptySearchText',
  description:
    'Renames the removed `emptySearchResultsText` prop to `emptySearchText` ' +
    'on Tokenizer, Typeahead, and BaseTypeahead, and the same key on ' +
    'ChatComposerInput trigger objects. Where `emptySearchText` is already ' +
    'set to a value that is never null, the old entry is dropped; where the ' +
    'new value may be null or undefined, it becomes ' +
    '`emptySearchText ?? emptySearchResultsText`, which is what 0.6.x ' +
    'rendered. A JSX element with a spread, a trigger object with a spread ' +
    'or computed key, a `triggers` value the transform cannot see into, and ' +
    'an object reached only through a type-only import get a TODO instead ' +
    'of an edit, because renaming could change which value wins or is not ' +
    'proven in scope. Any other object key of that name in a file that ' +
    'imports these components is flagged too, since the type checker will ' +
    'not notice it.',
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
const JSX_SPREAD_COMMENT =
  ' TODO(astryx upgrade): emptySearchResultsText was removed. Rename it to ' +
  'emptySearchText by hand; a spread on this element may also set ' +
  'emptySearchText (even to undefined), so check which value should win. ';
const OPAQUE_TRIGGERS_COMMENT =
  ' TODO(astryx upgrade): emptySearchResultsText was removed from trigger ' +
  'objects. These triggers come from a value this upgrade cannot read; ' +
  'rename the key to emptySearchText where they are built. ';
const UNATTRIBUTED_COMMENT =
  ' TODO(astryx upgrade): emptySearchResultsText was removed from Tokenizer, ' +
  'Typeahead, BaseTypeahead and ChatComposerInput triggers. This upgrade ' +
  'could not tell where this object is used; rename the key to ' +
  'emptySearchText if it reaches one of them. ';
const OPAQUE_SPREAD_COMMENT =
  ' TODO(astryx upgrade): emptySearchResultsText was removed. This element ' +
  'spreads props this upgrade cannot read; if they carry ' +
  'emptySearchResultsText (or triggers that do), rename it to emptySearchText ' +
  'where they are built. ';
const TYPE_ONLY_COMMENT =
  ' TODO(astryx upgrade): emptySearchResultsText was removed from trigger ' +
  'objects. This object is typed through a type-only import, which does not ' +
  'prove it reaches ChatComposerInput, so it was left as written; rename the ' +
  'key to emptySearchText if it does. ';

// Values that can never be null or undefined, so an existing
// `emptySearchText` with one of these already won in 0.6.x.
const NEVER_NULLISH = new Set([
  'StringLiteral',
  'NumericLiteral',
  'TemplateLiteral',
  'JSXElement',
  'JSXFragment',
  'ObjectExpression',
  'ArrayExpression',
  'ArrowFunctionExpression',
  'FunctionExpression',
]);

/** @param {any} node */
function isNeverNullish(node) {
  const value = unwrap(node);
  if (!value) return false;
  if (value.type === 'Literal') return value.value != null;
  return NEVER_NULLISH.has(value.type);
}

// `newValue ?? oldValue`: what a 0.6.x component rendered when both were set.
/** @param {any} j @param {any} newValue @param {any} oldValue */
function fallbackExpression(j, newValue, oldValue) {
  // `a || b ?? c` does not parse: an `||` or `&&` operand of `??` needs its
  // own parentheses.
  // A JSX attribute string keeps its source text (HTML entities, a raw
  // backslash, a line break); inside a JS expression that text would change
  // meaning or not parse, so a string is rebuilt from its decoded value.
  const guard = (/** @type {any} */ value) => {
    if (
      value?.type === 'LogicalExpression' &&
      (value.operator === '||' || value.operator === '&&')
    ) {
      return j.parenthesizedExpression(value);
    }
    if (
      (value?.type === 'StringLiteral' || value?.type === 'Literal') &&
      typeof value.value === 'string'
    ) {
      return j.stringLiteral(value.value);
    }
    return value;
  };
  return j.logicalExpression('??', guard(newValue), guard(oldValue));
}

/** @param {any} j @param {any} path @param {string} text */
function addStatementComment(j, path, text) {
  let current = path;
  while (current && !j.Statement.check(current.node)) {
    current = current.parent;
  }
  if (!current) return false;
  // A declaration inside `export const …` prints its comment on the export,
  // where the next run reads it back; host the comment on the outermost
  // statement so a second run finds it.
  while (
    current.parent &&
    (current.parent.node.type === 'ExportNamedDeclaration' ||
      current.parent.node.type === 'ExportDefaultDeclaration')
  ) {
    current = current.parent;
  }
  const host = current.node;
  const hasComment = (/** @type {any} */ node) =>
    (node?.comments ?? []).some((/** @type {any} */ c) => c.value === text);
  if (hasComment(host) || hasComment(host.declaration)) return false;
  host.comments ??= [];
  host.comments.push(j.commentBlock(text, true, false));
  return true;
}

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

/** An object literal this transform can read in full: no spread, no computed key. */
/** @param {any} node */
function isReadableObject(node) {
  const value = unwrap(node);
  return (
    value?.type === 'ObjectExpression' &&
    !value.properties.some(isDynamicProperty)
  );
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
 * @param {any} j
 * @param {any} object
 * @param {{todoOnly?: string | null}} [options]
 */
function migrateTriggerObject(j, object, options = {}) {
  /** @type {string | null} */
  const todoOnly = options.todoOnly ?? null;
  const oldProperty = object.properties.find(
    (/** @type {any} */ property) => staticPropertyName(property) === OLD_NAME,
  );
  if (!oldProperty) return false;

  const todo =
    todoOnly ??
    (object.properties.some(isDynamicProperty)
      ? MANUAL_MIGRATION_COMMENT
      : null);
  if (todo != null) {
    oldProperty.comments ??= [];
    if (
      oldProperty.comments.some(
        (/** @type {any} */ comment) => comment.value === todo,
      )
    ) {
      return false;
    }
    oldProperty.comments.push(j.commentBlock(todo, true, false));
    return true;
  }

  const newProperty = object.properties.find(
    (/** @type {any} */ property) => staticPropertyName(property) === NEW_NAME,
  );
  if (newProperty) {
    if (!isNeverNullish(newProperty.value)) {
      newProperty.value = fallbackExpression(
        j,
        newProperty.value,
        oldProperty.value,
      );
      if (newProperty.shorthand) newProperty.shorthand = false;
    }
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
 * Read a `triggers` value: the trigger objects this file can see (inline, or
 * in a same-file `const` the value names) and whether any part of it — a
 * call result, an imported or parameter identifier, a spread, a member — is
 * one this transform cannot read. The same reading serves the prop itself and
 * a same-file props object spread onto the element.
 * @param {any} expression
 * @param {any} fromScope The scope the value is read from.
 * @returns {{opaque: boolean, objects: Set<any>}}
 */
function inspectTriggers(expression, fromScope) {
  /** @type {Set<any>} */
  const objects = new Set();
  let opaque = false;
  for (const object of triggerObjectsIn(expression)) {
    objects.add(object);
    // `{...base, char: '@'}`: the removed key may hide in the spread.
    if (!isReadableObject(object)) opaque = true;
  }
  /** @type {any[]} */
  const identifiers =
    expression?.type === 'Identifier'
      ? [expression]
      : expression?.type === 'ArrayExpression'
        ? expression.elements
            .map((/** @type {any} */ element) => unwrap(element))
            .filter(
              (/** @type {any} */ element) => element?.type === 'Identifier',
            )
        : [];
  const isVisibleItem = (/** @type {any} */ element) => {
    const item = unwrap(element);
    return (
      item == null ||
      item.type === 'Identifier' ||
      item.type === 'ObjectExpression'
    );
  };
  if (
    expression?.type !== 'Identifier' &&
    expression?.type !== 'ArrayExpression' &&
    expression?.type !== 'ObjectExpression'
  ) {
    // A call (useMemo, a helper), a member, or a conditional: the
    // objects live somewhere this transform cannot read.
    opaque = true;
  } else if (
    expression.type === 'ArrayExpression' &&
    !expression.elements.every(isVisibleItem)
  ) {
    opaque = true;
  }
  for (const identifier of identifiers) {
    const scope = fromScope.lookup(identifier.name);
    if (!scope) {
      opaque = true;
      continue;
    }
    const bindings = scope.getBindings()[identifier.name] ?? [];
    let visible = false;
    for (const binding of bindings) {
      const declarator = binding.parent?.node;
      if (
        declarator?.type !== 'VariableDeclarator' ||
        declarator.id !== binding.node ||
        binding.parent.parent?.node?.kind !== 'const'
      ) {
        continue;
      }
      const init = unwrap(declarator.init);
      if (
        isReadableObject(init) ||
        (init?.type === 'ArrayExpression' &&
          init.elements.every(
            (/** @type {any} */ element) =>
              unwrap(element) == null || isReadableObject(element),
          ))
      ) {
        visible = true;
      }
      for (const object of triggerObjectsIn(declarator.init)) {
        objects.add(object);
      }
    }
    if (!visible) opaque = true;
  }
  return {opaque, objects};
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

// The local names a file binds to the given core components: named imports
// (with aliases), default imports from `@astryxdesign/core/<Name>`, and
// namespace imports (`<Core.Tokenizer>`). Type-only imports do not count.
/** @param {any} root @param {any} j @param {string[]} components */
function componentBindings(root, j, components) {
  /** @type {Set<string>} */
  const direct = new Set();
  /** @type {Set<string>} */
  const namespaces = new Set();
  /** @type {Map<string, string>} local name → component it imports */
  const importedByLocal = new Map();
  root.find(j.ImportDeclaration).forEach((/** @type {any} */ path) => {
    const source = path.node.source.value;
    if (
      path.node.importKind === 'type' ||
      typeof source !== 'string' ||
      !CORE_IMPORT_RE.test(source)
    ) {
      return;
    }
    const subpath = source.split('/').at(-1);
    for (const specifier of path.node.specifiers ?? []) {
      if (specifier.importKind === 'type') continue;
      if (specifier.type === 'ImportSpecifier') {
        const imported = specifier.imported?.name ?? specifier.imported?.value;
        if (components.includes(imported)) {
          direct.add(specifier.local?.name ?? imported);
          importedByLocal.set(specifier.local?.name ?? imported, imported);
        }
      } else if (
        specifier.type === 'ImportDefaultSpecifier' &&
        subpath != null &&
        components.includes(subpath)
      ) {
        direct.add(specifier.local.name);
        importedByLocal.set(specifier.local.name, subpath);
      } else if (specifier.type === 'ImportNamespaceSpecifier') {
        namespaces.add(specifier.local.name);
      }
    }
  });
  return {direct, namespaces, components, imported: importedByLocal};
}

/** The core component a JSX tag names, or null. */
/** @param {any} name @param {{direct: Set<string>, namespaces: Set<string>, components: string[], imported?: Map<string, string>}} bindings */
function componentOf(name, bindings) {
  if (name?.type === 'JSXIdentifier') {
    return bindings.imported?.get(name.name) ?? null;
  }
  if (
    name?.type === 'JSXMemberExpression' &&
    name.object?.type === 'JSXIdentifier' &&
    bindings.namespaces.has(name.object.name)
  ) {
    return name.property?.name ?? null;
  }
  return null;
}

/** @param {any} name @param {{direct: Set<string>, namespaces: Set<string>, components: string[], imported?: Map<string, string>}} bindings */
function isChatComponent(name, bindings) {
  return CHAT_COMPONENTS.has(componentOf(name, bindings) ?? '');
}

/** @param {any} name @param {{direct: Set<string>, namespaces: Set<string>, components: string[]}} bindings */
function matchesComponent(name, bindings) {
  if (name?.type === 'JSXIdentifier') return bindings.direct.has(name.name);
  return (
    name?.type === 'JSXMemberExpression' &&
    name.object?.type === 'JSXIdentifier' &&
    bindings.namespaces.has(name.object.name) &&
    bindings.components.includes(name.property?.name)
  );
}

// Only a tag whose root binding resolves to the Program scope is the imported
// component; a parameter or local of the same name shadows it.
/** @param {any} path @param {any} name */
function isModuleBinding(path, name) {
  const localName =
    name?.type === 'JSXIdentifier'
      ? name.name
      : name?.type === 'JSXMemberExpression' &&
          name.object?.type === 'JSXIdentifier'
        ? name.object.name
        : null;
  if (localName == null) return false;
  const scope = path.scope?.lookup(localName);
  return scope?.path?.node?.type === 'Program';
}

// The expression a JSX attribute passes: its container's expression, the
// string literal, or `true` for a bare attribute.
/** @param {any} j @param {any} attribute */
function attributeExpression(j, attribute) {
  const value = attribute.value;
  if (value == null) return j.booleanLiteral(true);
  if (value.type === 'JSXExpressionContainer') return value.expression;
  return value;
}

/**
 * @param {import('../../../../authoring/codemod/type').AstryxCodemodFile} file
 * @param {import('../../../../authoring/codemod/type').CodemodTransformApi} api
 * @returns {string | null | undefined}
 */
export default function transformer(file, api) {
  // A file that passes ChatComposerInput triggers it builds elsewhere carries
  // no old name itself, yet the removed key may live in those triggers; such
  // a file is read so its opaque triggers can be reported.
  if (
    !file.source.includes(OLD_NAME) &&
    !file.source.includes('ChatComposerInput') &&
    ![...JSX_COMPONENTS.keys()].some(component =>
      file.source.includes(component),
    )
  ) {
    return undefined;
  }
  const j = api.jscodeshift;
  const root = j(file.source);
  let changed = false;
  const reachesCore = root
    .find(j.ImportDeclaration)
    .some(
      (/** @type {any} */ path) =>
        path.node.importKind !== 'type' &&
        typeof path.node.source.value === 'string' &&
        CORE_IMPORT_RE.test(path.node.source.value),
    );

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
      const hasSpread = attributes.some(
        (/** @type {any} */ attribute) =>
          attribute.type === 'JSXSpreadAttribute',
      );
      if (hasSpread) {
        // A spread before the prop may set emptySearchText, which won in
        // 0.6.x; a spread after it may forward emptySearchText as undefined,
        // which would override the renamed value. Either way the winner is
        // not knowable here.
        changed =
          addStatementComment(j, propPath, JSX_SPREAD_COMMENT) || changed;
        return;
      }
      const newProp = attributes.find(
        (/** @type {any} */ attribute) =>
          attribute.type === 'JSXAttribute' &&
          attribute.name?.name === NEW_NAME,
      );
      if (newProp) {
        const newValue = attributeExpression(j, newProp);
        if (!isNeverNullish(newValue)) {
          newProp.value = j.jsxExpressionContainer(
            fallbackExpression(j, newValue, attributeExpression(j, prop)),
          );
        }
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
      const inspected = inspectTriggers(
        unwrap(value.expression),
        propPath.scope,
      );
      for (const object of inspected.objects) triggerObjects.add(object);
      if (inspected.opaque) {
        changed =
          addStatementComment(j, propPath, OPAQUE_TRIGGERS_COMMENT) || changed;
      }
    },
  );

  // 3. Objects typed as ChatComposerTrigger, wherever they are. A type-only
  // import proves only the type position: such an object is not proven to
  // reach a ChatComposerInput, so it gets a TODO rather than an edit, unless
  // step 2 already reached it through the runtime prop.
  /** @type {Set<any>} */
  const typedOnly = new Set();
  const typeNames = triggerTypeNames(root, j);
  if (typeNames.names.size > 0 || typeNames.namespaces.size > 0) {
    root.find(j.VariableDeclarator).forEach((/** @type {any} */ path) => {
      if (!isTriggerType(path.node.id?.typeAnnotation, typeNames)) return;
      for (const object of triggerObjectsIn(path.node.init)) {
        if (!triggerObjects.has(object)) typedOnly.add(object);
      }
    });
    for (const type of ['TSAsExpression', 'TSSatisfiesExpression']) {
      root.find(j[type]).forEach((/** @type {any} */ path) => {
        if (!isTriggerType(path.node.typeAnnotation, typeNames)) return;
        for (const object of triggerObjectsIn(path.node.expression)) {
          if (!triggerObjects.has(object)) typedOnly.add(object);
        }
      });
    }
  }

  for (const object of triggerObjects) {
    changed = migrateTriggerObject(j, object) || changed;
  }
  for (const object of typedOnly) {
    changed =
      migrateTriggerObject(j, object, {todoOnly: TYPE_ONLY_COMMENT}) || changed;
  }

  // 4. A spread on Tokenizer, Typeahead, BaseTypeahead or ChatComposerInput
  // whose object this file does not build (imported, or a wrapper's forwarded
  // props) may carry the removed key — or, for ChatComposerInput, triggers
  // that do — and after the removal the type checker will not notice; report
  // it the way unreadable triggers values are reported.
  if (reachesCore) {
    const bindings = componentBindings(root, j, [
      ...JSX_COMPONENTS.keys(),
      ...CHAT_COMPONENTS.keys(),
    ]);
    root.find(j.JSXOpeningElement).forEach((/** @type {any} */ path) => {
      const name = path.node.name;
      if (!matchesComponent(name, bindings)) return;
      if (!isModuleBinding(path, name)) return;
      const attributes = path.node.attributes ?? [];
      const isChat = isChatComponent(name, bindings);
      // An element that sets the old prop itself was handled above, with a
      // TODO that already covers its spreads. A ChatComposerInput whose own
      // `triggers` follows its spreads overrides any triggers they carry, and
      // that prop was handled above too.
      const handledProp = isChat ? 'triggers' : OLD_NAME;
      const handledIndex = attributes.findIndex(
        (/** @type {any} */ attribute) =>
          attribute.type === 'JSXAttribute' &&
          attribute.name?.name === handledProp,
      );
      const lastSpreadIndex = attributes.reduce(
        (
          /** @type {number} */ last,
          /** @type {any} */ attribute,
          /** @type {number} */ index,
        ) => (attribute.type === 'JSXSpreadAttribute' ? index : last),
        -1,
      );
      if (handledIndex !== -1 && (!isChat || handledIndex > lastSpreadIndex)) {
        return;
      }
      const spreads = attributes.filter(
        (/** @type {any} */ attribute) =>
          attribute.type === 'JSXSpreadAttribute',
      );
      if (spreads.length === 0) return;
      // A props object is readable when this file builds it as a plain
      // object literal and, for ChatComposerInput, when the `triggers` it
      // carries can be read the way the prop itself is read: an imported
      // trigger, a call result, or a spread inside it is opaque, and a
      // visible trigger object is migrated here.
      const readableProps = (/** @type {any} */ object) => {
        if (!isReadableObject(object)) return false;
        if (!isChat) return true;
        const triggers = object.properties.find(
          (/** @type {any} */ property) =>
            staticPropertyName(property) === 'triggers',
        );
        if (!triggers) return true;
        const inspected = inspectTriggers(unwrap(triggers.value), path.scope);
        for (const trigger of inspected.objects) {
          changed = migrateTriggerObject(j, trigger) || changed;
        }
        return !inspected.opaque;
      };
      const unreadable = spreads.some((/** @type {any} */ spread) => {
        const argument = unwrap(spread.argument);
        if (argument?.type === 'ObjectExpression') {
          return !readableProps(argument);
        }
        if (argument?.type !== 'Identifier') return true;
        const scope = path.scope?.lookup(argument.name);
        if (!scope) return true;
        const declared = (scope.getBindings()[argument.name] ?? []).some(
          (/** @type {any} */ binding) => {
            const declarator = binding.parent?.node;
            return (
              declarator?.type === 'VariableDeclarator' &&
              declarator.id === binding.node &&
              binding.parent.parent?.node?.kind === 'const' &&
              readableProps(declarator.init)
            );
          },
        );
        return !declared;
      });
      if (unreadable) {
        changed =
          addStatementComment(j, path, OPAQUE_SPREAD_COMMENT) || changed;
      }
    });
  }

  // 5. Every other object key of the old name in this file: an object spread
  // onto a component, a trigger built here and passed along untyped, a value
  // handed to another module. The upgrade cannot attribute it, and after the
  // removal the type checker will not notice it, so it is flagged rather than
  // left silent. A file without a runtime core import is not touched.
  if (reachesCore) {
    for (const type of ['ObjectProperty', 'Property']) {
      if (!j[type]) continue;
      root.find(j[type]).forEach((/** @type {any} */ path) => {
        const property = path.node;
        if (staticPropertyName(property) !== OLD_NAME) return;
        const comments = property.comments ?? [];
        if (
          comments.some(
            (/** @type {any} */ comment) =>
              typeof comment.value === 'string' &&
              comment.value.includes('TODO(astryx upgrade)'),
          )
        ) {
          return;
        }
        property.comments = [
          ...comments,
          j.commentBlock(UNATTRIBUTED_COMMENT, true, false),
        ];
        changed = true;
      });
    }
  }

  return changed ? root.toSource({quote: 'single'}) : undefined;
}
