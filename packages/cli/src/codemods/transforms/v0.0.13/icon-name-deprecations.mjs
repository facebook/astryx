/**
 * @file Codemod: Rename icon names to preferred names
 *
 * Renames:
 *   - "checkCircle" → "success"
 *   - "xCircle" → "error"
 *
 * Handles:
 *   - JSX string literals: icon="checkCircle" → icon="success"
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

const RENAMES = {
  checkCircle: 'success',
  xCircle: 'error',
};

/** Prop names that accept XDSIconName values */
const ICON_PROPS = new Set(['icon', 'name', 'selectedIcon']);

export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let hasChanges = false;

  // 1. JSX attributes: icon="checkCircle" → icon="success"
  root.find(j.JSXAttribute).forEach((path) => {
    const attrName = path.node.name?.name;
    if (!ICON_PROPS.has(attrName)) return;

    const value = path.node.value;
    if (value && (value.type === 'StringLiteral' || value.type === 'Literal')) {
      const newName = RENAMES[value.value];
      if (newName) {
        path.node.value = j.stringLiteral(newName);
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
    root.find(PropertyType).forEach((path) => {
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
  root.find(PropertyType2).forEach((path) => {
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
