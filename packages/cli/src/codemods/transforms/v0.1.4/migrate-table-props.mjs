// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Codemod: migrate <Table tableProps={{...}} /> to direct props.
 *
 * Transforms JSX occurrences of `tableProps` object literals on <Table> and
 * <BaseTable> into sibling props. Handles the common object-literal case:
 *
 *   Before:
 *     <Table tableProps={{ className: 'my-class', style: { margin: 8 }, 'aria-label': 'X' }} />
 *
 *   After:
 *     <Table className="my-class" style={{ margin: 8 }} aria-label="X" />
 *
 * Leaves spread/dynamic tableProps={someVar} untouched and logs a warning.
 *
 * Recognised lifted keys:
 *   - `className` → className prop (string)
 *   - `style` → style prop (object)
 *   - everything else (id, aria-*, data-*, role, etc.) → spread as individual attrs
 */

export const meta = {
  title: 'Migrate tableProps to direct props',
  description:
    'Moves className, style, aria-*, data-*, and other HTML attributes ' +
    'from the deprecated `tableProps` object on <Table> and <BaseTable> ' +
    'to direct props on the JSX element. Handles object literals; leaves ' +
    'dynamic/spread expressions untouched with a warning.',
};

const TABLE_TAGS = new Set(['Table', 'BaseTable']);

/**
 * @param {{source: string, path: string}} file
 * @param {{jscodeshift: Function}} api
 * @returns {string|null}
 */
export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);

  let hasChanges = false;

  root
    .find(j.JSXOpeningElement)
    .filter(path => {
      const tag = path.node.name;
      return (
        (j.JSXIdentifier.check(tag) && TABLE_TAGS.has(tag.name)) ||
        (j.JSXMemberExpression.check(tag) &&
          j.JSXIdentifier.check(tag.object) &&
          tag.object.name === 'XDSS' &&
          j.JSXIdentifier.check(tag.property) &&
          tag.property.name === 'Table')
      );
    })
    .forEach(path => {
      const opening = path.node;
      const tablePropsAttr = opening.attributes.find(
        attr =>
          j.JSXAttribute.check(attr) &&
          j.JSXIdentifier.check(attr.name) &&
          attr.name.name === 'tableProps',
      );

      if (!tablePropsAttr || !j.JSXAttribute.check(tablePropsAttr)) {
        return;
      }

      const value = tablePropsAttr.value;

      // Only handle `tableProps={{ ... }}` (JSXExpressionExpression wrapping
      // an ObjectExpression). Skip `tableProps={someVar}` or `tableProps="str"`.
      if (
        !j.JSXExpressionContainer.check(value) ||
        !j.ObjectExpression.check(value.expression)
      ) {
        const loc = tablePropsAttr.loc;
        const lineInfo = loc
          ? `${file.path}:${loc.start.line}:${loc.start.column}`
          : file.path;
        console.warn(
          `[codemod] Skipping non-literal tableProps at ${lineInfo} — ` +
            `migrate manually to direct props.`,
        );
        return;
      }

      const obj = value.expression;
      const remaining = [];

      for (const prop of obj.properties) {
        if (
          !j.ObjectProperty.check(prop) &&
          !j.Property.check(prop)
        ) {
          remaining.push(prop);
          continue;
        }
        if (prop.computed || prop.shorthand || prop.method) {
          remaining.push(prop);
          continue;
        }

        let keyName = null;
        if (j.Identifier.check(prop.key)) {
          keyName = prop.key.name;
        } else if (j.StringLiteral.check(prop.key)) {
          keyName = prop.key.value;
        } else if (j.Literal.check(prop.key)) {
          keyName = prop.key.value;
        }

        if (keyName == null) {
          remaining.push(prop);
          continue;
        }

        if (keyName === 'style') {
          // style={{ ... }} → style={...} as sibling prop
          opening.attributes.push(
            j.jsxAttribute(
              j.jsxIdentifier('style'),
              j.jsxExpressionContainer(prop.value),
            ),
          );
          hasChanges = true;
        } else if (keyName === 'className') {
          // className="..." → className="..." as sibling prop
          // className={expr} → className={expr} as sibling prop
          const newAttr =
            j.StringLiteral.check(prop.value) || j.Literal.check(prop.value)
              ? j.jsxAttribute(
                  j.jsxIdentifier('className'),
                  j.stringLiteral(
                    typeof prop.value.value === 'string'
                      ? prop.value.value
                      : String(prop.value.value),
                  ),
                )
              : j.jsxAttribute(
                  j.jsxIdentifier('className'),
                  j.jsxExpressionContainer(prop.value),
                );
          opening.attributes.push(newAttr);
          hasChanges = true;
        } else {
          // Other props: id, aria-*, data-*, role, tabIndex, etc.
          const valueNode = prop.value;
          let newAttr;
          if (
            j.StringLiteral.check(valueNode) ||
            j.Literal.check(valueNode)
          ) {
            // string/number/boolean literal → <Tag key="val" />
            newAttr = j.jsxAttribute(
              j.jsxIdentifier(String(keyName)),
              j.stringLiteral(String(valueNode.value)),
            );
          } else {
            // expression → <Tag key={expr} />
            newAttr = j.jsxAttribute(
              j.jsxIdentifier(String(keyName)),
              j.jsxExpressionContainer(valueNode),
            );
          }
          opening.attributes.push(newAttr);
          hasChanges = true;
        }
      }

      // Remove the `tableProps` attribute
      opening.attributes = opening.attributes.filter(
        attr => attr !== tablePropsAttr,
      );

      // If there are remaining (unmigrated) properties in the object,
      // keep the tableProps with just those. Otherwise remove entirely.
      if (remaining.length > 0) {
        const remainingObj = j.objectExpression(remaining);
        const newAttr = j.jsxAttribute(
          j.jsxIdentifier('tableProps'),
          j.jsxExpressionContainer(remainingObj),
        );
        opening.attributes.push(newAttr);
      }
    });

  return hasChanges ? root.toSource() : null;
}
