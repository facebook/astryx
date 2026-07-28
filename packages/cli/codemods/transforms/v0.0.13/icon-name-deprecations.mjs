// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Codemod: Rename icon names to preferred names
 *
 * Renames:
 *   - "checkCircle" → "success"
 *   - "xCircle" → "error"
 *
 * Handles:
 *   - JSX string literals: icon="checkCircle" → icon="success"
 *   - JSX expressions: icon={cond ? 'checkCircle' : 'copy'} → icon={cond ? 'success' : 'copy'}
 *   - Object properties: { icon: "checkCircle" } → { icon: "success" }
 *   - String assignments: const x = "checkCircle" (when assigned to icon-typed vars)
 *   - Icon registry objects: { checkCircle: <Svg /> } → { success: <Svg /> }
 */

export const meta = {
  title: 'Rename icon names (checkCircle → success, xCircle → error)',
  description:
    'Replaces "checkCircle" and "xCircle" with ' +
    'their preferred equivalents "success" and "error".',
  pr: '#1503',
};

/** @type {Record<string, string>} */
const RENAMES = {
  checkCircle: 'success',
  xCircle: 'error',
};

/** Prop names that accept XDSIconName values */
const ICON_PROPS = new Set(['icon', 'name', 'selectedIcon']);

/**
 * @param {import('../../../types/codemod').AstryxCodemodFile} file
 * @param {import('../../../types/codemod').CodemodTransformApi} api
 * @returns {string | null | undefined}
 */
export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let hasChanges = false;

  // Helper: rename a string literal node if it matches a deprecated name
  function renameStringLiteral(/** @type {any} */ node) {
    if (!node) return false;
    if (node.type === 'StringLiteral' || node.type === 'Literal') {
      const newName = RENAMES[node.value];
      if (newName) {
        node.value = newName;
        if (node.raw) node.raw = `'${newName}'`;
        return true;
      }
    }
    return false;
  }

  // Helper: recursively rename deprecated icon strings inside an expression
  /** @returns {boolean} */
  function renameInExpression(/** @type {any} */ node) {
    if (!node) return false;
    let changed = false;
    if (node.type === 'StringLiteral' || node.type === 'Literal') {
      changed = renameStringLiteral(node);
    } else if (node.type === 'ConditionalExpression') {
      changed = renameInExpression(node.consequent) || changed;
      changed = renameInExpression(node.alternate) || changed;
    } else if (node.type === 'LogicalExpression') {
      changed = renameInExpression(node.left) || changed;
      changed = renameInExpression(node.right) || changed;
    }
    return changed;
  }

  // 1. JSX attributes: icon="checkCircle" or icon={cond ? 'checkCircle' : 'copy'}
  root.find(j.JSXAttribute).forEach((/** @type {any} */ path) => {
    const attrName = path.node.name?.name;
    if (!ICON_PROPS.has(attrName)) return;

    const value = path.node.value;
    if (value && (value.type === 'StringLiteral' || value.type === 'Literal')) {
      if (renameStringLiteral(value)) {
        hasChanges = true;
      }
    } else if (value && value.type === 'JSXExpressionContainer') {
      if (renameInExpression(value.expression)) {
        hasChanges = true;
      }
    }
  });

  // 2. Object properties in icon maps: { checkCircle: <Svg /> }
  //    Only when the key matches a deprecated name AND the file looks like an icon registry
  const looksLikeIconRegistry =
    file.source.includes('XDSIconRegistry') ||
    file.source.includes('iconRegistry') ||
    file.source.includes('IconRegistry');

  if (looksLikeIconRegistry) {
    const PropertyType = j.ObjectProperty ?? j.Property;
    root.find(PropertyType).forEach((/** @type {any} */ path) => {
      const key = path.node.key;
      if (!key) return;
      const keyName =
        key.type === 'Identifier' ? key.name :
        (key.type === 'StringLiteral' || key.type === 'Literal') ? key.value :
        null;
      const newName = keyName && RENAMES[keyName];
      if (newName) {
        path.node.key = j.identifier(newName);
        hasChanges = true;
      }
    });
  }

  // 3. String literals in objects with icon-related keys
  //    e.g. { label: "TestX", href: "/pages/testx", icon: "checkCircle" }
  const PropertyType2 = j.ObjectProperty ?? j.Property;
  root.find(PropertyType2).forEach((/** @type {any} */ path) => {
    const key = path.node.key;
    const keyName = key?.type === 'Identifier' ? key.name : key?.value;
    if (!ICON_PROPS.has(keyName)) return;

    const value = path.node.value;
    if (value && (value.type === 'StringLiteral' || value.type === 'Literal')) {
      const newName = RENAMES[value.value];
      if (newName) {
        path.node.value = j.stringLiteral(newName);
        hasChanges = true;
      }
    }
  });

  if (!hasChanges) return undefined;
  return root.toSource({quote: 'single'});
}
