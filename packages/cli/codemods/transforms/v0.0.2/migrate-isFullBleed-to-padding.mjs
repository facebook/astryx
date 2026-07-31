// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Codemod: Migrate isFullBleed to padding={0}
 *
 * Transforms:
 * - isFullBleed → padding={0}
 * - isFullBleed={true} → padding={0}
 * - isFullBleed={false} → (removed)
 *
 * Target components: XDSCard, XDSSection, XDSLayout, XDSLayoutContent,
 * XDSLayoutHeader, XDSLayoutFooter, XDSLayoutPanel.
 * Does NOT target XDSDivider (its isFullBleed uses negative margins).
 */

export const meta = {
  title: 'Migrate isFullBleed to padding={0}',
  description:
    'Replaces `isFullBleed` with `padding={0}` on layout components. Does not touch XDSDivider.',
};

const TARGET_COMPONENTS = [
  'XDSCard',
  'XDSSection',
  'XDSLayout',
  'XDSLayoutContent',
  'XDSLayoutHeader',
  'XDSLayoutFooter',
  'XDSLayoutPanel',
];

/**
 * @param {import('../../../types/codemod').AstryxCodemodFile} file
 * @param {import('../../../types/codemod').CodemodTransformApi} api
 * @returns {string | null | undefined}
 */
export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let hasChanges = false;

  TARGET_COMPONENTS.forEach((componentName) => {
    root
      .find(j.JSXOpeningElement, {
        name: {name: componentName},
      })
      .forEach((/** @type {any} */ path) => {
        const attrs = path.node.attributes;
        const isFullBleedIndex = attrs.findIndex(
          (/** @type {any} */ attr) =>
            attr.type === 'JSXAttribute' && attr.name.name === 'isFullBleed',
        );

        if (isFullBleedIndex === -1) {
          return;
        }

        const attr = attrs[isFullBleedIndex];
        const value = attr.value;

        // isFullBleed (no value — boolean shorthand, means true)
        if (value === null) {
          attrs.splice(isFullBleedIndex, 1);
          const hasPadding = attrs.some(
            (/** @type {any} */ a) => a.type === 'JSXAttribute' && a.name.name === 'padding',
          );
          if (!hasPadding) {
            attrs.push(
              j.jsxAttribute(
                j.jsxIdentifier('padding'),
                j.jsxExpressionContainer(j.literal(0)),
              ),
            );
          }
          hasChanges = true;
          return;
        }

        // isFullBleed={true} or isFullBleed={false}
        if (
          value &&
          value.type === 'JSXExpressionContainer' &&
          (value.expression.type === 'Literal' ||
            value.expression.type === 'BooleanLiteral')
        ) {
          if (value.expression.value === true) {
            // isFullBleed={true} → padding={0}
            attrs.splice(isFullBleedIndex, 1);
            const hasPadding = attrs.some(
              (/** @type {any} */ a) => a.type === 'JSXAttribute' && a.name.name === 'padding',
            );
            if (!hasPadding) {
              attrs.push(
                j.jsxAttribute(
                  j.jsxIdentifier('padding'),
                  j.jsxExpressionContainer(j.literal(0)),
                ),
              );
            }
            hasChanges = true;
          } else if (value.expression.value === false) {
            // isFullBleed={false} → remove entirely
            attrs.splice(isFullBleedIndex, 1);
            hasChanges = true;
          }
        }
      });
  });

  return hasChanges ? root.toSource() : undefined;
}
