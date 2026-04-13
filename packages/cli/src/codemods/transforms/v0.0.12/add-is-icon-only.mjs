/**
 * @file Codemod: Migrate pre-v0.0.12 icon-only XDSButton to XDSIconButton
 * @see https://github.com/facebookexperimental/xds/issues/1321
 *
 * Migration codemod for code written against v0.0.11 or earlier.
 *
 * Prior to v0.0.12, XDSButton inferred icon-only mode when `icon` was
 * present and no `children` were provided — the label was used as
 * aria-label only and the button rendered as a square icon button.
 *
 * In v0.0.12, that implicit inference is removed. `label` is always
 * rendered as visible text. Without this codemod, existing icon-only
 * buttons will start showing their label text alongside the icon.
 *
 * This codemod converts those implicit icon-only usages to the new
 * explicit `<XDSIconButton>` component, which is always icon-only by
 * design — no boolean prop to forget, visible in JSX, greppable.
 *
 * Detection: a JSX element was implicitly icon-only when it has:
 *   1. An `icon` prop (any value)
 *   2. No `children` prop AND no JSX children (self-closing or empty)
 *   3. No existing `isIconOnly` prop (already migrated)
 *
 * Also handles:
 * - Object literals in forwarding components (XDSDropdownMenu, XDSMoreMenu)
 *   — these get `isIconOnly: true` since they pass props internally
 * - Removing redundant `children` that duplicate `label` on icon+text buttons
 *
 * Run on demand: `xds upgrade --from 0.0.11 --to 0.0.12 --codemod add-is-icon-only`
 */

const TARGET_COMPONENTS = new Set([
  'XDSButton',
]);

/** Components whose button-like object props get isIconOnly: true added. */
const FORWARDING_COMPONENTS = new Set([
  'XDSDropdownMenu',
  'XDSMoreMenu',
]);

export const meta = {
  title: 'Migrate pre-v0.0.12 icon-only buttons to XDSIconButton',
  description:
    'Converts implicit icon-only <XDSButton icon={...} label="..." /> (v0.0.11 pattern) ' +
    'to the explicit <XDSIconButton> component introduced in v0.0.12. ' +
    'Also adds isIconOnly to forwarding component object configs.',
  pr: '#1321',
};

export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let hasChanges = false;
  let needsIconButtonImport = false;
  let hasRemainingXDSButton = false;

  // ---- 1. JSX elements: convert icon-only XDSButton to XDSIconButton ----
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

    // This is an icon-only button — convert to XDSIconButton
    name.name = 'XDSIconButton';

    // Remove endContent prop (XDSIconButton doesn't accept it)
    for (let i = attrs.length - 1; i >= 0; i--) {
      if (attrs[i].type === 'JSXAttribute' && attrs[i].name?.name === 'endContent') {
        attrs.splice(i, 1);
      }
    }

    // Update closing element if present
    if (parent.type === 'JSXElement' && parent.closingElement) {
      parent.closingElement.name.name = 'XDSIconButton';
    }

    needsIconButtonImport = true;
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
      path.node.children = [];
      path.node.closingElement = null;
      opening.selfClosing = true;
      hasChanges = true;
    }
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

  if (!hasChanges) return undefined;

  // ---- 4. Update imports ----
  // Check if any XDSButton JSX usage remains
  root.find(j.JSXIdentifier, {name: 'XDSButton'}).forEach(() => {
    hasRemainingXDSButton = true;
  });

  if (needsIconButtonImport) {
    // Check if XDSIconButton is already imported
    let alreadyImported = false;
    root.find(j.ImportDeclaration).forEach((path) => {
      if (path.node.specifiers.some(
        (s) => s.type === 'ImportSpecifier' && s.imported.name === 'XDSIconButton',
      )) {
        alreadyImported = true;
      }
    });

    if (!alreadyImported) {
      // If no XDSButton usage remains, replace the Button import
      if (!hasRemainingXDSButton) {
        root.find(j.ImportDeclaration).forEach((path) => {
          const source = path.node.source.value;
          if (source !== '@xds/core/Button') return;
          const specs = path.node.specifiers;
          const btnIdx = specs.findIndex(
            (s) => s.type === 'ImportSpecifier' && s.imported.name === 'XDSButton',
          );
          if (btnIdx === -1) return;

          // Replace XDSButton specifier with XDSIconButton
          specs[btnIdx] = j.importSpecifier(j.identifier('XDSIconButton'));
          path.node.source = j.literal('@xds/core/IconButton');
          alreadyImported = true;
        });
      }

      // For barrel imports, add the specifier
      if (!alreadyImported) {
        root.find(j.ImportDeclaration).forEach((path) => {
          if (alreadyImported) return;
          if (path.node.source.value === '@xds/core') {
            path.node.specifiers.push(
              j.importSpecifier(j.identifier('XDSIconButton')),
            );
            alreadyImported = true;
          }
        });
      }

      // Otherwise add a new import
      if (!alreadyImported) {
        const newImport = j.importDeclaration(
          [j.importSpecifier(j.identifier('XDSIconButton'))],
          j.literal('@xds/core/IconButton'),
        );

        const xdsImports = root
          .find(j.ImportDeclaration)
          .filter((p) => p.node.source.value.startsWith('@xds/'));

        if (xdsImports.length > 0) {
          xdsImports.at(-1).insertAfter(newImport);
        } else {
          const allImports = root.find(j.ImportDeclaration);
          if (allImports.length > 0) {
            allImports.at(-1).insertAfter(newImport);
          } else {
            root.get().node.program.body.unshift(newImport);
          }
        }
      }
    }
  }

  return root.toSource();
}
