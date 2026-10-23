// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Find the Storybook `args` and `argTypes` objects that belong to an imported
 * component, so a prop migration can edit them with binding proof.
 *
 * A Component Story Format file's default export is its meta. Its `component`
 * property names the component every story in the file renders. When that
 * property resolves to an import the caller accepts (a named, aliased,
 * default, or namespace import that is not shadowed), the meta's `args` and
 * `argTypes` objects and each exported story's `args` object configure that
 * component. Anything else is not proven and is not returned.
 *
 * @input one jscodeshift root and an import matcher
 * @output proven args/argTypes object paths with their component
 * @position packages/cli/assets/codemods — shared codemod helper
 */

const TS_WRAPPERS = new Set([
  'TSAsExpression',
  'TSSatisfiesExpression',
  'TSNonNullExpression',
  'TSTypeAssertion',
  'TypeCastExpression',
  'ParenthesizedExpression',
]);

/** @param {any} node */
function unwrap(node) {
  let current = node;
  while (current != null && TS_WRAPPERS.has(current.type)) {
    current = current.expression;
  }
  return current;
}

/** @param {any} path */
function unwrapPath(path) {
  let current = path;
  while (current != null && TS_WRAPPERS.has(current.node?.type)) {
    current = current.get('expression');
  }
  return current;
}

/** @param {any} property @returns {string | null} */
function staticKey(property) {
  const key = property?.key;
  if (!key) return null;
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
 * The value path of an object's static property, unwrapped, when it is an
 * object literal.
 * @param {any} objectPath @param {string} name
 */
function objectProperty(objectPath, name) {
  const properties = objectPath.node.properties ?? [];
  for (let index = properties.length - 1; index >= 0; index--) {
    const property = properties[index];
    if (
      (property.type !== 'ObjectProperty' && property.type !== 'Property') ||
      staticKey(property) !== name
    ) {
      continue;
    }
    const value = unwrapPath(objectPath.get('properties', index, 'value'));
    return value?.node?.type === 'ObjectExpression' ? value : null;
  }
  return null;
}

/**
 * Local component bindings from accepted imports.
 * @param {any} root @param {any} j
 * @param {{
 *   matchesImport: (source: string) => boolean,
 *   components: ReadonlySet<string>,
 *   normalizeComponentName?: (name: string) => string,
 * }} options
 */
export function importedComponentBindings(root, j, options) {
  const normalize = options.normalizeComponentName ?? (name => name);
  /** @type {Map<string, string>} */
  const direct = new Map();
  /** @type {Set<string>} */
  const namespaces = new Set();
  root.find(j.ImportDeclaration).forEach((/** @type {any} */ importPath) => {
    const source = importPath.node.source?.value;
    if (
      importPath.node.importKind === 'type' ||
      typeof source !== 'string' ||
      !options.matchesImport(source)
    ) {
      return;
    }
    const subpath = normalize(source.split('/').at(-1) ?? '');
    for (const specifier of importPath.node.specifiers ?? []) {
      if (specifier.importKind === 'type') continue;
      const local = specifier.local?.name;
      if (typeof local !== 'string') continue;
      if (specifier.type === 'ImportSpecifier') {
        const component = normalize(
          specifier.imported?.name ?? specifier.imported?.value ?? '',
        );
        if (options.components.has(component)) direct.set(local, component);
      } else if (
        specifier.type === 'ImportDefaultSpecifier' &&
        options.components.has(subpath)
      ) {
        direct.set(local, subpath);
      } else if (specifier.type === 'ImportNamespaceSpecifier') {
        namespaces.add(local);
      }
    }
  });
  return {direct, namespaces, normalize, components: options.components};
}

/**
 * The component an expression names through an accepted import, or null. The
 * root identifier must resolve to the module scope, so a parameter or local
 * with the same name does not count.
 * @param {any} path expression path
 * @param {ReturnType<typeof importedComponentBindings>} bindings
 * @returns {string | null}
 */
export function resolveImportedComponent(path, bindings) {
  const node = unwrap(path?.node);
  let localName;
  let component = null;
  if (node?.type === 'Identifier') {
    localName = node.name;
    component = bindings.direct.get(localName) ?? null;
  } else if (
    node?.type === 'MemberExpression' &&
    !node.computed &&
    node.object?.type === 'Identifier' &&
    node.property?.type === 'Identifier' &&
    bindings.namespaces.has(node.object.name)
  ) {
    localName = node.object.name;
    const name = bindings.normalize(node.property.name);
    component = bindings.components.has(name) ? name : null;
  }
  if (component == null) return null;
  const scope = path.scope?.lookup(localName);
  return scope?.path.node.type === 'Program' ? component : null;
}

/**
 * The top-level object literal an identifier is initialized with, or null.
 * @param {any} root @param {any} j @param {string} name
 */
function topLevelObject(root, j, name) {
  let found = null;
  root
    .find(j.VariableDeclarator, {id: {type: 'Identifier', name}})
    .forEach((/** @type {any} */ declaratorPath) => {
      const declaration = declaratorPath.parent;
      const container = declaration?.parent?.node;
      const topLevel =
        container?.type === 'Program' ||
        (container?.type === 'ExportNamedDeclaration' &&
          declaration.parent.parent?.node.type === 'Program');
      if (!topLevel) return;
      const init = unwrapPath(declaratorPath.get('init'));
      if (init?.node?.type === 'ObjectExpression') found = init;
    });
  return found;
}

/**
 * Storybook `args` and `argTypes` objects proven to configure an accepted
 * component.
 * @param {any} root @param {any} j
 * @param {ReturnType<typeof importedComponentBindings>} bindings
 * @returns {Array<{kind: 'args' | 'argTypes', component: string, path: any}>}
 */
export function storybookArgObjects(root, j, bindings) {
  if (bindings.direct.size === 0 && bindings.namespaces.size === 0) return [];

  let metaPath = null;
  root
    .find(j.ExportDefaultDeclaration)
    .forEach((/** @type {any} */ exportPath) => {
      const declaration = unwrapPath(exportPath.get('declaration'));
      if (declaration?.node?.type === 'ObjectExpression') {
        metaPath = declaration;
      } else if (declaration?.node?.type === 'Identifier') {
        metaPath = topLevelObject(root, j, declaration.node.name);
      }
    });
  if (metaPath == null) return [];

  const meta = /** @type {any} */ (metaPath);
  const properties = meta.node.properties ?? [];
  const componentIndex = properties.findLastIndex(
    (/** @type {any} */ property) =>
      (property.type === 'ObjectProperty' || property.type === 'Property') &&
      staticKey(property) === 'component',
  );
  if (componentIndex === -1) return [];
  const component = resolveImportedComponent(
    meta.get('properties', componentIndex, 'value'),
    bindings,
  );
  if (component == null) return [];

  /** @type {Array<{kind: 'args' | 'argTypes', component: string, path: any}>} */
  const found = [];
  for (const kind of /** @type {const} */ (['args', 'argTypes'])) {
    const objectPath = objectProperty(meta, kind);
    if (objectPath) found.push({kind, component, path: objectPath});
  }

  // Named story exports render the meta's component unless they name another.
  root
    .find(j.ExportNamedDeclaration)
    .forEach((/** @type {any} */ exportPath) => {
      const declaration = exportPath.node.declaration;
      if (declaration?.type !== 'VariableDeclaration') return;
      declaration.declarations.forEach(
        (/** @type {any} */ _declarator, /** @type {number} */ index) => {
          const story = unwrapPath(
            exportPath.get('declaration', 'declarations', index, 'init'),
          );
          if (
            story?.node?.type !== 'ObjectExpression' ||
            story.node === meta.node
          ) {
            return;
          }
          const ownComponent = (story.node.properties ?? []).some(
            (/** @type {any} */ property) =>
              staticKey(property) === 'component',
          );
          if (ownComponent) return;
          const args = objectProperty(story, 'args');
          if (args) found.push({kind: 'args', component, path: args});
        },
      );
    });
  return found;
}
