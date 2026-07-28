// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Codemod: Migrate XDSSideNav collapse props to collapsible
 *
 * Transforms:
 * - isCollapsible → collapsible
 * - isCollapsible + isCollapsed={x} + onCollapsedChange={y} → collapsible={{ isCollapsed: x, onCollapsedChange: y }}
 * - isCollapsible + defaultIsCollapsed → collapsible={{ defaultIsCollapsed: true }}
 * - isCollapsible + hasCollapseButton={false} → collapsible={{ hasButton: false }}
 * - Combinations of the above
 *
 * Also removes deprecated AppShell collapse props:
 * - isSideNavCollapsed
 * - onSideNavCollapsedChange
 * - defaultIsSideNavCollapsed
 */

export const meta = {
  title: 'Migrate collapse props to collapsible',
  description:
    'Replaces `isCollapsible` + related props on XDSSideNav with the unified `collapsible` prop. Removes deprecated AppShell collapse props.',
};

const SIDENAV_COLLAPSE_PROPS = [
  'isCollapsible',
  'isCollapsed',
  'onCollapsedChange',
  'defaultIsCollapsed',
  'hasCollapseButton',
];

const APPSHELL_DEPRECATED_PROPS = [
  'isSideNavCollapsed',
  'onSideNavCollapsedChange',
  'defaultIsSideNavCollapsed',
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

  // --- XDSSideNav: migrate to collapsible prop ---
  root
    .find(j.JSXOpeningElement, {
      name: {name: 'XDSSideNav'},
    })
    .forEach((/** @type {any} */ path) => {
      const attrs = path.node.attributes;

      // Find isCollapsible
      const isCollapsibleIdx = attrs.findIndex(
        (/** @type {any} */ a) => a.type === 'JSXAttribute' && a.name.name === 'isCollapsible',
      );
      if (isCollapsibleIdx === -1) return;

      // Collect all collapse-related props
      /** @type {Record<string, any>} */
      const collapseProps = {};
      const indicesToRemove = [];

      for (let i = 0; i < attrs.length; i++) {
        const attr = attrs[i];
        if (attr.type !== 'JSXAttribute') continue;
        const name = attr.name.name;
        if (!SIDENAV_COLLAPSE_PROPS.includes(name)) continue;

        indicesToRemove.push(i);

        if (name === 'isCollapsible') {
          // Just a flag — value doesn't matter for the config
          continue;
        }

        if (name === 'hasCollapseButton') {
          // Map to hasButton
          if (
            attr.value &&
            attr.value.type === 'JSXExpressionContainer' &&
            attr.value.expression.value === false
          ) {
            collapseProps.hasButton = j.objectProperty(
              j.identifier('hasButton'),
              j.booleanLiteral(false),
            );
          }
          continue;
        }

        // isCollapsed, onCollapsedChange, defaultIsCollapsed
        const value = attr.value
          ? attr.value.type === 'JSXExpressionContainer'
            ? attr.value.expression
            : attr.value
          : j.booleanLiteral(true);
        collapseProps[name] = j.objectProperty(
          j.identifier(name),
          value,
        );
      }

      // Remove old props (reverse order to preserve indices)
      indicesToRemove.sort((a, b) => b - a);
      for (const idx of indicesToRemove) {
        attrs.splice(idx, 1);
      }

      // Build the new collapsible prop
      const configKeys = Object.keys(collapseProps);
      if (configKeys.length === 0) {
        // Simple: isCollapsible → collapsible (boolean shorthand)
        attrs.push(j.jsxAttribute(j.jsxIdentifier('collapsible')));
      } else {
        // Object form
        const properties = Object.values(collapseProps);
        attrs.push(
          j.jsxAttribute(
            j.jsxIdentifier('collapsible'),
            j.jsxExpressionContainer(j.objectExpression(properties)),
          ),
        );
      }

      hasChanges = true;
    });

  // --- XDSAppShell: remove deprecated collapse props ---
  root
    .find(j.JSXOpeningElement, {
      name: {name: 'XDSAppShell'},
    })
    .forEach((/** @type {any} */ path) => {
      const attrs = path.node.attributes;
      for (let i = attrs.length - 1; i >= 0; i--) {
        const attr = attrs[i];
        if (attr.type !== 'JSXAttribute') continue;
        if (APPSHELL_DEPRECATED_PROPS.includes(attr.name.name)) {
          attrs.splice(i, 1);
          hasChanges = true;
        }
      }
    });

  return hasChanges ? root.toSource() : undefined;
}
