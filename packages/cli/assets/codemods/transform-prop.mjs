// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Find imported components, resolve their local JSX names (including aliases),
 * and yield matching JSX prop paths to a visitor.
 *
 * This helper intentionally stops at the JSX boundary. It does not follow
 * variables, helper calls, object spreads, wrapper components, or types.
 *
 * @param {any} root jscodeshift collection for one source file
 * @param {any} j configured jscodeshift instance
 * @param {{
 *   matchesImport: (source: string) => boolean,
 *   components: ReadonlyMap<string, ReadonlySet<string>>,
 *   normalizeComponentName?: (name: string) => string,
 * }} options
 * @param {(propPath: any, context: {component: string, localName: string}) => void} visit
 */
export function transformProp(root, j, options, visit) {
  const normalize = options.normalizeComponentName ?? (name => name);
  /** @type {Map<string, {component: string, props: ReadonlySet<string>}>} */
  const directBindings = new Map();
  /** @type {Set<string>} */
  const namespaceBindings = new Set();

  root.find(j.ImportDeclaration).forEach((/** @type {any} */ importPath) => {
    const source = importPath.node.source.value;
    if (
      importPath.node.importKind === 'type' ||
      typeof source !== 'string' ||
      !options.matchesImport(source)
    ) {
      return;
    }

    const subpathName = normalize(source.split('/').at(-1) ?? '');
    const subpathProps = options.components.get(subpathName);

    for (const specifier of importPath.node.specifiers ?? []) {
      if (specifier.importKind === 'type') continue;

      if (specifier.type === 'ImportSpecifier') {
        const importedName =
          specifier.imported?.name ?? specifier.imported?.value;
        if (typeof importedName !== 'string') continue;
        const component = normalize(importedName);
        const props = options.components.get(component);
        if (!props) continue;
        directBindings.set(specifier.local?.name ?? importedName, {
          component,
          props,
        });
      } else if (specifier.type === 'ImportDefaultSpecifier' && subpathProps) {
        directBindings.set(specifier.local.name, {
          component: subpathName,
          props: subpathProps,
        });
      } else if (specifier.type === 'ImportNamespaceSpecifier') {
        namespaceBindings.add(specifier.local.name);
      }
    }
  });

  if (directBindings.size === 0 && namespaceBindings.size === 0) return;

  root.find(j.JSXOpeningElement).forEach((/** @type {any} */ jsxPath) => {
    const name = jsxPath.node.name;
    let localName;
    let component;
    let props;

    if (name.type === 'JSXIdentifier') {
      localName = name.name;
      const binding = directBindings.get(localName);
      if (!binding) return;
      ({component, props} = binding);
    } else if (
      name.type === 'JSXMemberExpression' &&
      name.object?.type === 'JSXIdentifier' &&
      name.property?.type === 'JSXIdentifier' &&
      namespaceBindings.has(name.object.name)
    ) {
      localName = name.object.name;
      component = normalize(name.property.name);
      props = options.components.get(component);
      if (!props) return;
    } else {
      return;
    }

    // A parameter or local declaration with the imported name shadows the
    // module binding. Only JSX tags whose root binding resolves to Program are
    // considered usages of the import discovered above.
    const bindingScope = jsxPath.scope.lookup(localName);
    if (!bindingScope || bindingScope.path.node.type !== 'Program') return;

    for (let index = 0; index < jsxPath.node.attributes.length; index++) {
      const attribute = jsxPath.node.attributes[index];
      if (
        attribute.type !== 'JSXAttribute' ||
        attribute.name?.type !== 'JSXIdentifier' ||
        !props.has(attribute.name.name)
      ) {
        continue;
      }
      visit(jsxPath.get('attributes', index), {component, localName});
    }
  });
}
