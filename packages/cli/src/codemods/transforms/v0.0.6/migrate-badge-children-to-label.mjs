// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Codemod: Migrate XDSBadge from children to label prop
 *
 * <XDSBadge variant="success">Active</XDSBadge>  → <XDSBadge variant="success" label="Active" />
 * <XDSBadge>3</XDSBadge>                         → <XDSBadge label={3} />
 * <XDSBadge>{count}</XDSBadge>                   → <XDSBadge label={count} />
 * <XDSBadge>{"text"}</XDSBadge>                  → <XDSBadge label="text" />
 *
 * Handles strings, numbers, and expressions.
 * Skips badges with multiple children or JSX element children.
 */

export const meta = {
  title: 'Migrate XDSBadge children to label prop',
  description:
    'Converts <XDSBadge>content</XDSBadge> to <XDSBadge label={content} />.',
  pr: '#706',
};

export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let hasChanges = false;

  root
    .find(j.JSXElement, {
      openingElement: {name: {name: 'XDSBadge'}},
    })
    .forEach((path) => {
      const {children} = path.node;

      // Skip if already self-closing or no children
      if (children.length === 0) return;

      // Filter out whitespace-only JSXText nodes
      const meaningful = children.filter(
        (c) => !(c.type === 'JSXText' && !c.value.trim()),
      );

      // Only transform single-child cases
      if (meaningful.length !== 1) return;

      const child = meaningful[0];
      let labelValue;

      if (child.type === 'JSXText') {
        const text = child.value.trim();
        if (!text) return;

        // Check if it's a number
        if (/^\d+$/.test(text)) {
          // <XDSBadge>3</XDSBadge> → label={3}
          labelValue = j.jsxExpressionContainer(
            j.numericLiteral(parseInt(text, 10)),
          );
        } else {
          // <XDSBadge>Active</XDSBadge> → label="Active"
          labelValue = j.stringLiteral(text);
        }
      } else if (child.type === 'JSXExpressionContainer') {
        if (child.expression.type === 'StringLiteral') {
          // <XDSBadge>{"text"}</XDSBadge> → label="text"
          labelValue = j.stringLiteral(child.expression.value);
        } else if (child.expression.type === 'NumericLiteral') {
          // <XDSBadge>{3}</XDSBadge> → label={3}
          labelValue = j.jsxExpressionContainer(child.expression);
        } else {
          // <XDSBadge>{count}</XDSBadge> → label={count}
          labelValue = j.jsxExpressionContainer(child.expression);
        }
      } else {
        // Skip JSXElement children or other complex cases
        return;
      }

      // Add label prop
      path.node.openingElement.attributes.push(
        j.jsxAttribute(j.jsxIdentifier('label'), labelValue),
      );

      // Self-close
      path.node.children = [];
      path.node.openingElement.selfClosing = true;
      path.node.closingElement = null;
      hasChanges = true;
    });

  return hasChanges ? root.toSource({quote: 'single'}) : undefined;
}
