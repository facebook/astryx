/**
 * @file Codemod: Add isIconOnly prop to icon-only XDSButton and XDSToggleButton
 * @see https://github.com/facebookexperimental/xds/issues/1257
 *
 * XDSButton and XDSToggleButton now use an explicit `isIconOnly` prop instead
 * of inferring icon-only mode from `icon` present + `children` absent.
 *
 * With the new API, `label` is always rendered as visible text unless
 * `isIconOnly={true}` is set. This codemod adds `isIconOnly` to all existing
 * icon-only usages so behavior is preserved after the change.
 *
 * Detection: a JSX element is icon-only when it has:
 *   1. An `icon` prop (any value)
 *   2. No `children` prop AND no JSX children (self-closing or empty)
 *   3. No existing `isIconOnly` prop
 *
 * This codemod also handles:
 * - Object literals passed to components that forward button props
 *   (e.g., XDSDropdownMenu `button={{ icon: ..., label: ... }}`)
 * - Removing redundant `children` that duplicate `label` on icon+text buttons
 *   (e.g., `<XDSButton label="Save" icon={...}>Save</XDSButton>` → `<XDSButton label="Save" icon={...} />`)
 */

const TARGET_COMPONENTS = new Set([
  'XDSButton',
  'XDSToggleButton',
]);

/** Components whose button-like object props should also be migrated. */
const FORWARDING_COMPONENTS = new Set([
  'XDSDropdownMenu',
  'XDSMoreMenu',
]);

export const meta = {
  title: 'Add isIconOnly to icon-only buttons',
  description:
    'XDSButton and XDSToggleButton now require explicit `isIconOnly` for icon-only mode. ' +
    'Adds `isIconOnly` to all existing icon-only usages. Also removes redundant children ' +
    'that duplicate the label prop on icon+text buttons.',
  pr: '#1257',
};

export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let hasChanges = false;

  // ---- 1. JSX elements: add isIconOnly to icon-only buttons ----
  root.find(j.JSXOpeningElement).forEach((path) => {
    const name = path.node.name;
    const componentName =
      name.type === 'JSXIdentifier' ? name.name : null;
    if (!componentName || !TARGET_COMPONENTS.has(componentName)) return;

    const attrs = path.node.attributes;

    const hasIcon = attrs.some(
      (a) => a.type === 'JSXAttribute' && a.name?.name === 'icon',
    );
    const hasChildren = attrs.some(
      (a) => a.type === 'JSXAttribute' && a.name?.name === 'children',
    );
    const hasIsIconOnly = attrs.some(
      (a) => a.type === 'JSXAttribute' && a.name?.name === 'isIconOnly',
    );

    if (!hasIcon || hasChildren || hasIsIconOnly) return;

    // Check for JSX children (non-whitespace text or elements)
    const parent = path.parent.node;
    const hasJSXChildren =
      parent.type === 'JSXElement' &&
      parent.children &&
      parent.children.some((child) => {
        if (child.type === 'JSXText') return child.value.trim() !== '';
        return true;
      });

    if (hasJSXChildren) return;

    // This is an icon-only button — add isIconOnly
    attrs.push(j.jsxAttribute(j.jsxIdentifier('isIconOnly')));
    hasChanges = true;
  });

  // ---- 2. Remove redundant children that match label ----
  root.find(j.JSXElement).forEach((path) => {
    const opening = path.node.openingElement;
    const name = opening.name;
    const componentName =
      name.type === 'JSXIdentifier' ? name.name : null;
    if (!componentName || !TARGET_COMPONENTS.has(componentName)) return;

    const attrs = opening.attributes;
    const hasIcon = attrs.some(
      (a) => a.type === 'JSXAttribute' && a.name?.name === 'icon',
    );
    if (!hasIcon) return;

    // Get label value
    const labelAttr = attrs.find(
      (a) => a.type === 'JSXAttribute' && a.name?.name === 'label',
    );
    if (!labelAttr || !labelAttr.value) return;

    let labelValue = null;
    if (labelAttr.value.type === 'StringLiteral' || labelAttr.value.type === 'Literal') {
      labelValue = labelAttr.value.value;
    }
    if (!labelValue) return;

    // Check if children is a single text node matching label
    const children = path.node.children;
    if (!children || children.length !== 1) return;

    const child = children[0];
    if (child.type === 'JSXText' && child.value.trim() === labelValue) {
      // Remove children, make self-closing
      path.node.children = [];
      path.node.closingElement = null;
      opening.selfClosing = true;
      hasChanges = true;
    }
    // Also handle JSXExpressionContainer with a string literal
    if (
      child.type === 'JSXExpressionContainer' &&
      (child.expression.type === 'StringLiteral' || child.expression.type === 'Literal') &&
      child.expression.value === labelValue
    ) {
      path.node.children = [];
      path.node.closingElement = null;
      opening.selfClosing = true;
      hasChanges = true;
    }
  });

  // ---- 3. Object literals: add isIconOnly to button config objects ----
  root.find(j.JSXOpeningElement).forEach((path) => {
    const name = path.node.name;
    const componentName =
      name.type === 'JSXIdentifier' ? name.name : null;
    if (!componentName || !FORWARDING_COMPONENTS.has(componentName)) return;

    const attrs = path.node.attributes;
    const buttonAttr = attrs.find(
      (a) =>
        a.type === 'JSXAttribute' &&
        a.name?.name === 'button' &&
        a.value?.type === 'JSXExpressionContainer' &&
        a.value.expression.type === 'ObjectExpression',
    );
    if (!buttonAttr) return;

    const obj = buttonAttr.value.expression;
    const props = obj.properties;

    const hasIcon = props.some(
      (p) => (p.type === 'Property' || p.type === 'ObjectProperty') && p.key?.name === 'icon',
    );
    const hasChildren = props.some(
      (p) => (p.type === 'Property' || p.type === 'ObjectProperty') && p.key?.name === 'children',
    );
    const hasIsIconOnly = props.some(
      (p) => (p.type === 'Property' || p.type === 'ObjectProperty') && p.key?.name === 'isIconOnly',
    );

    if (hasIcon && !hasChildren && !hasIsIconOnly) {
      props.push(
        j.property('init', j.identifier('isIconOnly'), j.literal(true)),
      );
      hasChanges = true;
    }
  });

  return hasChanges ? root.toSource() : undefined;
}
