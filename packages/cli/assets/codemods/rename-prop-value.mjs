// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Rename one static value of one prop on imported components, wherever a
 * binding proves the value configures one of them.
 *
 * Proven sites:
 * - a JSX attribute on an element that resolves to an accepted import
 *   (`transformProp`);
 * - the `args` and `argTypes` of a Component Story Format meta (the default
 *   export) whose `component` resolves to an accepted import;
 * - the `args` and `argTypes` of a named story export (inline, or a top-level
 *   `const` exported with `export {Story}`) that the meta's
 *   `includeStories`/`excludeStories` admit, whose own `component` resolves
 *   to an accepted import, or that has no `component` and inherits the
 *   meta's.
 *
 * Objects may be written inline or held in a top-level `const` that nothing
 * else references. Anything that cannot be proven, including a binding shared
 * with another component's story, an unreadable story filter, a `let` or
 * `var`, or a spread, is left byte-for-byte unchanged.
 */

import {
  importedComponents,
  isModuleBinding,
  resolveImportedComponent,
  transformProp,
} from './transform-prop.mjs';

const TS_WRAPPERS = new Set([
  'TSAsExpression',
  'TSSatisfiesExpression',
  'TSNonNullExpression',
  'TSTypeAssertion',
  'TypeCastExpression',
  'ParenthesizedExpression',
]);

/** @param {any} path */
function unwrapPath(path) {
  let current = path;
  while (current?.node && TS_WRAPPERS.has(current.node.type)) {
    current = current.get('expression');
  }
  return current;
}

/** @param {any} property @returns {string | null} */
function staticKey(property) {
  const key = property?.key;
  if (
    !key ||
    (property.type !== 'ObjectProperty' && property.type !== 'Property')
  ) {
    return null;
  }
  if (!property.computed && key.type === 'Identifier') return key.name;
  if (
    (key.type === 'StringLiteral' || key.type === 'Literal') &&
    typeof key.value === 'string'
  ) {
    return key.value;
  }
  return null;
}

/** @param {any} objectPath @param {string} name */
function propertyPath(objectPath, name) {
  const properties = objectPath.node.properties ?? [];
  for (let index = properties.length - 1; index >= 0; index--) {
    if (staticKey(properties[index]) === name) {
      return objectPath.get('properties', index, 'value');
    }
  }
  return null;
}

/**
 * Top-level `const` bindings initialized with an object literal, by name.
 * `let` and `var` bindings can be reassigned, so they are never followed.
 * @param {any} root @param {any} j
 * @returns {Map<string, any>}
 */
function topLevelConstObjects(root, j) {
  /** @type {Map<string, any>} */
  const objects = new Map();
  root.find(j.VariableDeclarator).forEach((/** @type {any} */ path) => {
    if (path.node.id?.type !== 'Identifier') return;
    const declaration = path.parent;
    const statement =
      declaration.parent.node.type === 'ExportNamedDeclaration'
        ? declaration.parent
        : declaration;
    if (
      declaration.node.kind !== 'const' ||
      statement.parent?.node.type !== 'Program'
    ) {
      return;
    }
    const init = unwrapPath(path.get('init'));
    if (init?.node?.type === 'ObjectExpression') {
      objects.set(path.node.id.name, init);
    }
  });
  return objects;
}

/**
 * Every runtime reference to a top-level binding, classified. Type-only
 * references (`typeof meta`) cannot share the object and are skipped.
 * @param {any} root @param {any} j @param {string} name
 * @returns {Array<{type: 'default'} | {type: 'export', name: string} | {type: 'arg', key: string, owner: any} | {type: 'other'}>}
 */
function bindingUses(root, j, name) {
  /** @type {ReturnType<typeof bindingUses>} */
  const uses = [];
  /** @param {any} path */
  const classify = path => {
    const parent = path.parent?.node;
    if (
      (path.name === 'id' && parent?.type === 'VariableDeclarator') ||
      (path.name === 'key' && !parent?.computed) ||
      (path.name === 'property' && !parent?.computed) ||
      path.name === 'exported' ||
      (parent?.type?.startsWith('TS') && !TS_WRAPPERS.has(parent.type)) ||
      !isModuleBinding(path, name)
    ) {
      return;
    }
    let use = path;
    while (TS_WRAPPERS.has(use.parent?.node.type)) use = use.parent;
    const owner = use.parent?.node;
    if (owner?.type === 'ExportDefaultDeclaration') {
      uses.push({type: 'default'});
    } else if (owner?.type === 'ExportSpecifier' && path.name === 'local') {
      const exported = owner.exported?.name ?? owner.exported?.value;
      uses.push({type: 'export', name: exported});
    } else if (
      use.name === 'value' &&
      ['args', 'argTypes'].includes(staticKey(owner) ?? '')
    ) {
      uses.push({
        type: 'arg',
        key: /** @type {string} */ (staticKey(owner)),
        owner: use.parent.parent.node,
      });
    } else {
      uses.push({type: 'other'});
    }
  };
  root.find(j.Identifier, {name}).forEach(classify);
  root.find(j.JSXIdentifier, {name}).forEach(classify);
  return uses;
}

/**
 * A Storybook `includeStories`/`excludeStories` value: an array of string
 * literals or a regular expression literal, as Storybook matches them.
 * Returns a matcher, or null when the value cannot be read statically.
 * @param {any} valuePath
 * @returns {((name: string) => boolean) | null}
 */
function storyPattern(valuePath) {
  const node = unwrapPath(valuePath)?.node;
  if (
    node?.type === 'ArrayExpression' &&
    node.elements.every(
      (/** @type {any} */ element) =>
        (element?.type === 'StringLiteral' || element?.type === 'Literal') &&
        typeof element.value === 'string',
    )
  ) {
    const names = node.elements.map((/** @type {any} */ e) => e.value);
    return name => names.includes(name);
  }
  const regex =
    node?.type === 'RegExpLiteral'
      ? {pattern: node.pattern, flags: node.flags}
      : node?.regex;
  if (regex) {
    const expression = new RegExp(regex.pattern, regex.flags);
    return name => name.match(expression) != null;
  }
  return null;
}

/**
 * The `args` and `argTypes` objects proven to configure an accepted
 * component. The default export must be a CSF meta (inline, or a top-level
 * `const` used only there). A named export is a story only when the meta's
 * `includeStories`/`excludeStories` statically admit it; a filter that cannot
 * be read declines every named export. A meta or story counts when its
 * `component` resolves to an accepted import (a story without one inherits
 * the meta's). A bound object is followed only when it is a top-level `const`
 * and every reference to it is a proven use of the same kind.
 * @param {any} root @param {any} j
 * @param {import('./transform-prop.mjs').ImportedComponents} imports
 * @returns {Array<{key: 'args' | 'argTypes', path: any}>}
 */
function provenStoryObjects(root, j, imports) {
  const consts = topLevelConstObjects(root, j);
  /** @type {Map<string, ReturnType<typeof bindingUses>>} */
  const useCache = new Map();
  /** @param {string} name */
  const uses = name => {
    if (!useCache.has(name)) useCache.set(name, bindingUses(root, j, name));
    return /** @type {ReturnType<typeof bindingUses>} */ (useCache.get(name));
  };

  /** @type {any} */
  let meta = null;
  root
    .find(j.ExportDefaultDeclaration)
    .forEach((/** @type {any} */ exportPath) => {
      const declaration = unwrapPath(exportPath.get('declaration'));
      if (declaration?.node?.type === 'ObjectExpression') {
        meta = declaration;
      } else if (
        declaration?.node?.type === 'Identifier' &&
        consts.has(declaration.node.name) &&
        uses(declaration.node.name).every(use => use.type === 'default')
      ) {
        meta = consts.get(declaration.node.name);
      }
    });
  if (meta == null) return [];

  /**
   * `true` when the object's `component` resolves to an accepted import,
   * `false` when it names something else or a spread could replace it,
   * `null` when it has none.
   * @param {any} objectPath
   */
  const componentProof = objectPath => {
    if (
      objectPath.node.properties.some(
        (/** @type {any} */ property) => property.type === 'SpreadElement',
      )
    ) {
      return false;
    }
    const valuePath = propertyPath(objectPath, 'component');
    if (valuePath == null) return null;
    return (
      resolveImportedComponent(
        unwrapPath(valuePath).node,
        valuePath,
        imports,
      ) != null
    );
  };
  const metaProof = componentProof(meta);

  /** @type {Array<(name: string) => boolean>} */
  const filters = [];
  let filtersReadable = true;
  for (const [key, include] of [
    ['includeStories', true],
    ['excludeStories', false],
  ]) {
    const valuePath = propertyPath(meta, /** @type {string} */ (key));
    if (valuePath == null) continue;
    const matches = storyPattern(valuePath);
    if (matches == null) filtersReadable = false;
    else filters.push(name => (include ? matches(name) : !matches(name)));
  }

  /** @type {any[]} */
  const owners = metaProof === true ? [meta] : [];
  if (filtersReadable) {
    /** @type {Array<{story: any, names: string[]}>} */
    const stories = [];
    root
      .find(j.ExportNamedDeclaration)
      .forEach((/** @type {any} */ exportPath) => {
        const node = exportPath.node;
        if (node.exportKind === 'type' || node.source) return;
        if (node.declaration?.type === 'VariableDeclaration') {
          for (const declarator of node.declaration.declarations) {
            const name = declarator.id?.name;
            if (consts.has(name) && uses(name).length === 0) {
              stories.push({story: consts.get(name), names: [name]});
            }
          }
        }
        for (const specifier of node.specifiers ?? []) {
          const local = specifier.local?.name;
          if (
            specifier.exportKind === 'type' ||
            !consts.has(local) ||
            stories.some(entry => entry.story === consts.get(local))
          ) {
            continue;
          }
          const localUses = uses(local);
          if (localUses.every(use => use.type === 'export')) {
            stories.push({
              story: consts.get(local),
              names: localUses.map(use => /** @type {any} */ (use).name),
            });
          }
        }
      });
    for (const {story, names} of stories) {
      if (
        story.node === meta.node ||
        !names.every(name => filters.every(admits => admits(name)))
      ) {
        continue;
      }
      const proof = componentProof(story);
      if (proof === true || (proof === null && metaProof === true)) {
        owners.push(story);
      }
    }
  }

  const ownerNodes = new Set(owners.map(owner => owner.node));
  /** @type {Map<any, {key: 'args' | 'argTypes', path: any}>} */
  const found = new Map();
  for (const owner of owners) {
    for (const key of /** @type {const} */ (['args', 'argTypes'])) {
      const valuePath = propertyPath(owner, key);
      const value = valuePath && unwrapPath(valuePath);
      if (value?.node?.type === 'ObjectExpression') {
        found.set(value.node, {key, path: value});
      } else if (
        value?.node?.type === 'Identifier' &&
        consts.has(value.node.name) &&
        uses(value.node.name).every(
          use =>
            use.type === 'arg' && use.key === key && ownerNodes.has(use.owner),
        )
      ) {
        const bound = consts.get(value.node.name);
        found.set(bound.node, {key, path: bound});
      }
    }
  }
  return [...found.values()];
}

/**
 * @typedef {{
 *   matchesImport: (source: string) => boolean,
 *   components: ReadonlySet<string>,
 *   normalizeComponentName?: (name: string) => string,
 *   prop: string,
 *   from: string,
 *   to: string,
 * }} RenameOptions
 */

/**
 * @param {import('../../authoring/codemod/type').AstryxCodemodFile} file
 * @param {import('../../authoring/codemod/type').CodemodTransformApi} api
 * @param {RenameOptions} options
 * @returns {string | undefined}
 */
export function renamePropValue(file, api, options) {
  const j = api.jscodeshift;
  const root = j(file.source);
  const importOptions = {
    matchesImport: options.matchesImport,
    components: new Map(
      [...options.components].map(name => [name, new Set([options.prop])]),
    ),
    normalizeComponentName: options.normalizeComponentName,
  };
  let changed = false;

  /** @param {any} node */
  const renameLiteral = node => {
    if (
      (node?.type !== 'StringLiteral' && node?.type !== 'Literal') ||
      node.value !== options.from
    ) {
      return;
    }
    node.value = options.to;
    if (node.raw) node.raw = `'${options.to}'`;
    changed = true;
  };

  /** The value itself, either branch of a ternary or `||`/`??`, or `as const`. */
  /** @param {any} node */
  const renameExpression = node => {
    if (!node) return;
    if (node.type === 'ConditionalExpression') {
      renameExpression(node.consequent);
      renameExpression(node.alternate);
    } else if (node.type === 'LogicalExpression') {
      renameExpression(node.left);
      renameExpression(node.right);
    } else if (node.type === 'TSAsExpression') {
      renameExpression(node.expression);
    } else {
      renameLiteral(node);
    }
  };

  // --- JSX ---
  transformProp(root, j, importOptions, propPath => {
    const value = propPath.node.value;
    renameExpression(
      value?.type === 'JSXExpressionContainer' ? value.expression : value,
    );
  });

  // --- Storybook ---
  const imports = importedComponents(root, j, importOptions);
  if (imports.direct.size > 0 || imports.namespaces.size > 0) {
    for (const {key, path} of provenStoryObjects(root, j, imports)) {
      for (const property of path.node.properties ?? []) {
        if (staticKey(property) !== options.prop) continue;
        if (key === 'args') {
          renameExpression(property.value);
          continue;
        }
        const entry = property.value;
        if (entry?.type !== 'ObjectExpression') continue;
        const optionsProperty = entry.properties.find(
          (/** @type {any} */ candidate) => staticKey(candidate) === 'options',
        );
        if (optionsProperty?.value.type === 'ArrayExpression') {
          optionsProperty.value.elements.forEach(renameLiteral);
        }
      }
    }
  }

  return changed ? root.toSource({quote: 'single'}) : undefined;
}
