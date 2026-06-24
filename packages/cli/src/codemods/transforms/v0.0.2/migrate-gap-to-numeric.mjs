// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Codemod: Migrate gap/rowGap/columnGap from string tokens to numeric values
 *
 * Transforms:
 * - gap="space0" → gap={0}
 * - gap="space0.5" → gap={0.5}
 * - gap="space1" → gap={1}
 * - gap="space1.5" → gap={1.5}
 * - gap="space2" → gap={2}
 * - ... through gap="space10" → gap={10}
 *
 * Also handles rowGap and columnGap on XDSGrid.
 */

export const meta = {
  title: 'Migrate gap to numeric scale',
  description:
    'Migrates gap, rowGap, and columnGap props from string tokens (e.g. "space4") to numeric values (e.g. 4).',
};

/**
 * Mapping from string token to numeric value.
 */
const TOKEN_TO_NUMBER = {
  space0: 0,
  'space0.5': 0.5,
  space1: 1,
  'space1.5': 1.5,
  space2: 2,
  space3: 3,
  space4: 4,
  space5: 5,
  space6: 6,
  space7: 7,
  space8: 8,
  space9: 9,
  space10: 10,
  space11: 11,
  space12: 12,
};

const GAP_PROPS = ['gap', 'rowGap', 'columnGap'];

/**
 * Only XDS layout components accept the numeric gap scale. We must not
 * rewrite gap props on user-defined components or HTML elements that happen
 * to share the prop name — doing so would silently corrupt their code when
 * `astryx upgrade` runs.
 */
const XDS_LAYOUT_ELEMENTS = new Set([
  'XDSStack',
  'XDSHStack',
  'XDSVStack',
  'XDSGrid',
  'XDSGridSpan',
  'XDSStackItem',
]);

export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let hasChanges = false;

  root.find(j.JSXOpeningElement).forEach((elementPath) => {
    const nameNode = elementPath.node.name;
    // Only handle simple identifier element names like <XDSStack>. Skip member
    // expressions (e.g. <Foo.Bar>) and namespaced names — they're never XDS.
    if (!nameNode || nameNode.type !== 'JSXIdentifier') {
      return;
    }
    if (!XDS_LAYOUT_ELEMENTS.has(nameNode.name)) {
      return;
    }

    for (const attr of elementPath.node.attributes ?? []) {
      if (attr.type !== 'JSXAttribute' || !attr.name) {
        continue;
      }
      const attrName = attr.name.name;
      if (!GAP_PROPS.includes(attrName)) {
        continue;
      }

      const value = attr.value;

      // Handle gap="space4" — JSX string attributes are Literal nodes
      if (
        value &&
        (value.type === 'Literal' || value.type === 'StringLiteral')
      ) {
        const numericValue = TOKEN_TO_NUMBER[value.value];
        if (numericValue !== undefined) {
          attr.value = j.jsxExpressionContainer(j.literal(numericValue));
          hasChanges = true;
        }
        continue;
      }

      // Handle gap={"space4"} (JSXExpressionContainer wrapping a string)
      if (
        value &&
        value.type === 'JSXExpressionContainer' &&
        (value.expression.type === 'Literal' ||
          value.expression.type === 'StringLiteral')
      ) {
        const strValue = value.expression.value;
        if (typeof strValue === 'string') {
          const numericValue = TOKEN_TO_NUMBER[strValue];
          if (numericValue !== undefined) {
            value.expression = j.literal(numericValue);
            hasChanges = true;
          }
        }
      }
    }
  });

  return hasChanges ? root.toSource() : undefined;
}
