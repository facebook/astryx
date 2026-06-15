// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Codemod: Migrate item children → endContent
 *
 * XDSDropdownMenuItem, XDSContextMenuItem, and XDSSelectorOption trailing
 * slots were renamed from `children` to `endContent` to match other list-like
 * components.
 *
 * Handles:
 * 1. JSX children: <XDSDropdownMenuItem>...</XDSDropdownMenuItem>
 *    → <XDSDropdownMenuItem endContent={...} />
 * 2. The same migration for XDSContextMenuItem and XDSSelectorOption
 * 3. Explicit children prop: <XDSSelectorOption children={...} />
 *    → <XDSSelectorOption endContent={...} />
 *
 * Skips elements that already have `endContent`, because merging the old and
 * new slots is ambiguous.
 */

const COMPONENT_NAMES = new Set([
  'XDSDropdownMenuItem',
  'XDSContextMenuItem',
  'XDSSelectorOption',
]);

export const meta = {
  title: 'Migrate item children → endContent',
  description:
    'Moves trailing content on `XDSDropdownMenuItem`, `XDSContextMenuItem`, and `XDSSelectorOption` from deprecated `children` usage to the `endContent` prop.',
};

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

function createEndContentValue(j, children) {
  if (children.length === 0) {
    return null;
  }

  if (children.length === 1) {
    const child = children[0];

    if (child.type === 'JSXText') {
      const text = child.value.trim();
      return text === '' ? null : j.stringLiteral(text);
    }

    if (child.type === 'JSXExpressionContainer') {
      return j.jsxExpressionContainer(child.expression);
    }

    if (child.type === 'JSXElement' || child.type === 'JSXFragment') {
      return j.jsxExpressionContainer(child);
    }
  }

  return j.jsxExpressionContainer(
    j.jsxFragment(j.jsxOpeningFragment(), j.jsxClosingFragment(), children),
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
  let hasChanges = false;

  root.find(j.JSXElement).forEach(path => {
      const elementName = path.node.openingElement.name;
      if (
        elementName.type !== 'JSXIdentifier' ||
        !COMPONENT_NAMES.has(elementName.name)
      ) {
        return;
      }
      const {openingElement} = path.node;
      const endContentAttr = getJSXAttribute(openingElement, 'endContent');
      const childrenAttr = getJSXAttribute(openingElement, 'children');

      if (childrenAttr != null) {
        if (endContentAttr != null) {
          return;
        }
        childrenAttr.name.name = 'endContent';
        hasChanges = true;
        return;
      }

      if (endContentAttr != null) {
        return;
      }

      const meaningfulChildren = getMeaningfulChildren(path.node.children ?? []);
      const endContentValue = createEndContentValue(j, meaningfulChildren);
      if (endContentValue == null) {
        return;
      }

      openingElement.attributes.push(
        j.jsxAttribute(j.jsxIdentifier('endContent'), endContentValue),
      );
      openingElement.selfClosing = true;
      path.node.children = [];
      path.node.closingElement = null;
      hasChanges = true;
    });

  return hasChanges ? root.toSource() : undefined;
}
