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
 * - the `args` and `argTypes` of a named story export (inline, or a
 *   top-level binding exported with `export {Story}`) whose own `component`
 *   resolves to an accepted import, or that has no `component` and inherits
 *   the meta's.
 *
 * Objects may be written inline or held in a top-level `const`. Every other
 * object, including one in the same file, is left byte-for-byte unchanged.
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
    /** Top-level `const` object initializers, by name. */
    /** @type {Map<string, any>} */
    const topLevel = new Map();
    root.find(j.VariableDeclarator).forEach((/** @type {any} */ path) => {
      if (path.node.id?.type !== 'Identifier') return;
      const statement = path.parent.parent;
      const container =
        statement.node.type === 'ExportNamedDeclaration'
          ? statement.parent
          : statement;
      if (container?.node.type !== 'Program') return;
      const init = unwrapPath(path.get('init'));
      if (init?.node?.type === 'ObjectExpression') {
        topLevel.set(path.node.id.name, init);
      }
    });

    /** An object literal path, or the top-level object an identifier names. */
    /** @param {any} path */
    const objectAt = path => {
      const value = unwrapPath(path);
      if (value?.node?.type === 'ObjectExpression') return value;
      if (
        value?.node?.type === 'Identifier' &&
        isModuleBinding(value, value.node.name)
      ) {
        return topLevel.get(value.node.name) ?? null;
      }
      return null;
    };

    /** @param {any} objectPath @param {string} name */
    const propertyPath = (objectPath, name) => {
      const properties = objectPath.node.properties ?? [];
      for (let index = properties.length - 1; index >= 0; index--) {
        if (staticKey(properties[index]) === name) {
          return objectPath.get('properties', index, 'value');
        }
      }
      return null;
    };

    /**
     * `true` when the object's `component` resolves to an accepted import,
     * `false` when it names something else, `null` when it has none.
     * @param {any} objectPath
     */
    const componentProof = objectPath => {
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

    /** @param {any} storyPath */
    const renameStoryObject = storyPath => {
      const argsPath = propertyPath(storyPath, 'args');
      const args = argsPath && objectAt(argsPath);
      for (const property of args?.node.properties ?? []) {
        if (staticKey(property) === options.prop) {
          renameExpression(property.value);
        }
      }
      const argTypesPath = propertyPath(storyPath, 'argTypes');
      const argTypes = argTypesPath && objectAt(argTypesPath);
      for (const property of argTypes?.node.properties ?? []) {
        if (staticKey(property) !== options.prop) continue;
        const entry = property.value;
        if (entry?.type !== 'ObjectExpression') continue;
        const optionsProperty = entry.properties.find(
          (/** @type {any} */ candidate) => staticKey(candidate) === 'options',
        );
        if (optionsProperty?.value.type === 'ArrayExpression') {
          optionsProperty.value.elements.forEach(renameLiteral);
        }
      }
    };

    /** @type {any} */
    let meta = null;
    root
      .find(j.ExportDefaultDeclaration)
      .forEach((/** @type {any} */ exportPath) => {
        meta = objectAt(exportPath.get('declaration'));
      });
    const metaProof = meta ? componentProof(meta) : null;
    if (meta && metaProof) renameStoryObject(meta);

    /** @type {any[]} */
    const stories = [];
    root
      .find(j.ExportNamedDeclaration)
      .forEach((/** @type {any} */ exportPath) => {
        const node = exportPath.node;
        if (node.exportKind === 'type' || node.source) return;
        if (node.declaration?.type === 'VariableDeclaration') {
          node.declaration.declarations.forEach(
            (/** @type {any} */ _declarator, /** @type {number} */ index) => {
              const story = objectAt(
                exportPath.get('declaration', 'declarations', index, 'init'),
              );
              if (story) stories.push(story);
            },
          );
        }
        for (const specifier of node.specifiers ?? []) {
          const local = specifier.local?.name;
          if (specifier.exportKind === 'type' || typeof local !== 'string') {
            continue;
          }
          const story = topLevel.get(local);
          if (story && isModuleBinding(exportPath, local)) stories.push(story);
        }
      });
    for (const story of stories) {
      if (story.node === meta?.node) continue;
      const proof = componentProof(story);
      if (proof === true || (proof === null && metaProof)) {
        renameStoryObject(story);
      }
    }
  }

  return changed ? root.toSource({quote: 'single'}) : undefined;
}
