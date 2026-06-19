// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Codemod: Migrate Selector render-prop children → renderOption
 *
 * XDSSelector and XDSMultiSelector previously used function-as-children for
 * custom option rendering. The named renderOption prop is clearer and avoids
 * confusion with JSX child content.
 *
 * Handles:
 * 1. <XDSSelector>{option => ...}</XDSSelector>
 *    → <XDSSelector renderOption={option => ...} />
 * 2. <XDSMultiSelector>{renderOption}</XDSMultiSelector>
 *    → <XDSMultiSelector renderOption={renderOption} />
 * 3. Explicit children prop → renderOption prop
 *
 * The transform is import-aware and only touches components imported from
 * @xds/core or @xds/core/{Selector,MultiSelector}. It intentionally skips
 * legacy @nest/xds selectors, where JSX children are selector items.
 */

export const meta = {
  title: 'Migrate selector children → renderOption',
  description:
    'Moves custom option renderers on `XDSSelector` and `XDSMultiSelector` from function-as-children to the `renderOption` prop.',
};

const COMPONENTS = new Set(['XDSSelector', 'XDSMultiSelector']);

function isXDSCoreSource(source) {
  return (
    source === '@xds/core' ||
    source === '@xds/core/Selector' ||
    source === '@xds/core/MultiSelector'
  );
}

function sourceCanImport(source, importedName) {
  if (source === '@xds/core') {
    return COMPONENTS.has(importedName);
  }
  if (source === '@xds/core/Selector') {
    return importedName === 'XDSSelector';
  }
  if (source === '@xds/core/MultiSelector') {
    return importedName === 'XDSMultiSelector';
  }
  return false;
}

function collectSelectorNames(root, j) {
  const localNames = new Map();
  const namespaceNames = new Set();

  root.find(j.ImportDeclaration).forEach(path => {
    const source = path.node.source.value;
    if (typeof source !== 'string' || !isXDSCoreSource(source)) {
      return;
    }

    for (const spec of path.node.specifiers ?? []) {
      if (
        spec.type === 'ImportSpecifier' &&
        spec.imported.type === 'Identifier' &&
        spec.local?.type === 'Identifier' &&
        sourceCanImport(source, spec.imported.name)
      ) {
        localNames.set(spec.local.name, spec.imported.name);
      }

      if (
        spec.type === 'ImportNamespaceSpecifier' &&
        spec.local.type === 'Identifier'
      ) {
        namespaceNames.add(spec.local.name);
      }
    }
  });

  return {localNames, namespaceNames};
}

function getComponentName(name, localNames, namespaceNames) {
  if (name.type === 'JSXIdentifier') {
    return localNames.get(name.name) ?? null;
  }

  if (
    name.type === 'JSXMemberExpression' &&
    name.object.type === 'JSXIdentifier' &&
    name.property.type === 'JSXIdentifier' &&
    namespaceNames.has(name.object.name) &&
    COMPONENTS.has(name.property.name)
  ) {
    return name.property.name;
  }

  return null;
}

function isWhitespaceText(node) {
  return node.type === 'JSXText' && node.value.trim() === '';
}

function isEmptyExpression(node) {
  return (
    node.type === 'JSXExpressionContainer' &&
    node.expression.type === 'JSXEmptyExpression'
  );
}

function getMeaningfulChildren(children) {
  return children.filter(
    child => !isWhitespaceText(child) && !isEmptyExpression(child),
  );
}

function isRenderableExpression(expression) {
  return (
    expression.type === 'ArrowFunctionExpression' ||
    expression.type === 'FunctionExpression' ||
    expression.type === 'Identifier' ||
    expression.type === 'MemberExpression'
  );
}

function getJSXAttribute(openingElement, name) {
  return openingElement.attributes.find(
    attr => attr.type === 'JSXAttribute' && attr.name.name === name,
  );
}

export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  const {localNames, namespaceNames} = collectSelectorNames(root, j);
  let hasChanges = false;

  if (localNames.size === 0 && namespaceNames.size === 0) {
    return undefined;
  }

  root.find(j.JSXElement).forEach(path => {
    const componentName = getComponentName(
      path.node.openingElement.name,
      localNames,
      namespaceNames,
    );
    if (componentName == null) {
      return;
    }

    const {openingElement} = path.node;
    const renderOptionAttr = getJSXAttribute(openingElement, 'renderOption');
    if (renderOptionAttr != null) {
      return;
    }

    const childrenAttr = getJSXAttribute(openingElement, 'children');
    if (childrenAttr != null) {
      childrenAttr.name.name = 'renderOption';
      hasChanges = true;
      return;
    }

    const meaningfulChildren = getMeaningfulChildren(path.node.children ?? []);
    if (meaningfulChildren.length !== 1) {
      return;
    }

    const child = meaningfulChildren[0];
    if (
      child.type !== 'JSXExpressionContainer' ||
      !isRenderableExpression(child.expression)
    ) {
      return;
    }

    openingElement.attributes.push(
      j.jsxAttribute(j.jsxIdentifier('renderOption'), child),
    );
    openingElement.selfClosing = true;
    path.node.children = [];
    path.node.closingElement = null;
    hasChanges = true;
  });

  return hasChanges ? root.toSource() : undefined;
}
