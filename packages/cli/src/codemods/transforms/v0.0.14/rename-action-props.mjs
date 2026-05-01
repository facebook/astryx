/**
 * @file Codemod: Rename on*Action props to *Action (React 19 Action prop convention)
 *
 * Transforms:
 * - onChangeAction → changeAction
 * - onClickAction → clickAction
 * - onPressedChangeAction → pressedChangeAction
 * - onScrollToTopAction → scrollToTopAction
 *
 * Applies to JSX attributes on any component. The "Action" suffix signals
 * that the function runs inside a React transition — the `on` prefix is
 * dropped to align with the React 19 convention (e.g. `<form action={...}>`).
 *
 * @see https://react.dev/reference/react/useActionState#using-with-action-props
 * @see https://aurorascharff.no/posts/building-design-components-with-action-props-using-async-react/
 */

export const meta = {
  title: 'Rename on*Action props to *Action',
  description:
    'Renames `onChangeAction` → `changeAction`, `onClickAction` → `clickAction`, ' +
    '`onPressedChangeAction` → `pressedChangeAction`, ' +
    'and `onScrollToTopAction` → `scrollToTopAction` to align with the React 19 ' +
    'Action prop naming convention.',
};

/**
 * Map of old prop names → new prop names.
 * Ordered longest-first to avoid partial matches during iteration.
 */
const PROP_RENAMES = {
  onPressedChangeAction: 'pressedChangeAction',
  onScrollToTopAction: 'scrollToTopAction',
  onChangeAction: 'changeAction',
  onClickAction: 'clickAction',
};

export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let hasChanges = false;

  // --- 1. Rename JSX attributes ---
  root.find(j.JSXAttribute).forEach((path) => {
    const name = path.node.name;
    if (name.type !== 'JSXIdentifier') return;

    const newName = PROP_RENAMES[name.name];
    if (newName) {
      name.name = newName;
      hasChanges = true;
    }
  });

  // --- 2. Rename destructured parameter names (before general ObjectProperty) ---
  // Covers: function MyComponent({ onChangeAction, ...rest }) → { changeAction, ...rest }
  // Must run before step 3 so the ObjectPattern keys are renamed first and tracked.
  const renamedBindings = new Map(); // oldLocalName → newLocalName

  root.find(j.ObjectPattern).forEach((path) => {
    for (const prop of path.node.properties) {
      if (prop.type !== 'ObjectProperty') continue;
      const key = prop.key;
      if (key.type !== 'Identifier') continue;

      const newName = PROP_RENAMES[key.name];
      if (!newName) continue;

      if (
        prop.shorthand &&
        prop.value.type === 'Identifier' &&
        prop.value.name === key.name
      ) {
        // Shorthand: { onChangeAction } → { changeAction }
        const oldLocal = key.name;
        key.name = newName;
        prop.value.name = newName;
        renamedBindings.set(oldLocal, newName);
        hasChanges = true;
      } else if (prop.value.type === 'Identifier' && prop.value.name === key.name) {
        // Non-shorthand same name: { onChangeAction: onChangeAction }
        const oldLocal = prop.value.name;
        key.name = newName;
        prop.value.name = newName;
        renamedBindings.set(oldLocal, newName);
        hasChanges = true;
      } else {
        // Aliased: { onChangeAction: myHandler } → { changeAction: myHandler }
        key.name = newName;
        hasChanges = true;
      }
    }
  });

  // --- 3. Rename object property keys (e.g. { onChangeAction: fn }) ---
  // Covers cases like useXDSImperativeAlertDialog({ onAction: ... })
  // Skips ObjectProperty inside ObjectPattern (already handled in step 2).
  root.find(j.ObjectProperty).forEach((path) => {
    // Skip if inside a destructuring pattern
    if (path.parent.node.type === 'ObjectPattern') return;

    const key = path.node.key;
    if (key.type === 'Identifier') {
      const newName = PROP_RENAMES[key.name];
      if (newName) {
        key.name = newName;
        // Also rename value if it's the same identifier (shorthand)
        if (
          path.node.shorthand &&
          path.node.value.type === 'Identifier' &&
          path.node.value.name !== newName
        ) {
          path.node.value.name = newName;
        }
        hasChanges = true;
      }
    }
  });

  // --- 4. Rename interface/type property signatures ---
  // Covers: interface Props { onChangeAction?: ... } → { changeAction?: ... }
  root.find(j.TSPropertySignature).forEach((path) => {
    const key = path.node.key;
    if (key.type === 'Identifier') {
      const newName = PROP_RENAMES[key.name];
      if (newName) {
        key.name = newName;
        hasChanges = true;
      }
    }
  });

  // --- 5. Rename identifier references from renamed destructured bindings ---
  // When { onChangeAction } was renamed to { changeAction }, all references
  // to the local variable `onChangeAction` must become `changeAction`.
  if (renamedBindings.size > 0) {
    root.find(j.Identifier).forEach((path) => {
      const newName = renamedBindings.get(path.node.name);
      if (!newName) return;

      // Skip if this is the destructuring site itself (already renamed)
      const parent = path.parent.node;
      if (parent.type === 'ObjectProperty') return;
      // Skip import specifiers
      if (parent.type === 'ImportSpecifier') return;
      // Skip JSX attribute names (handled in step 1)
      if (parent.type === 'JSXAttribute' && path.name === 'name') return;
      // Skip object keys in non-pattern contexts (handled in step 2)
      if (parent.type === 'Property' && path.name === 'key') return;

      path.node.name = newName;
      hasChanges = true;
    });
  }

  if (!hasChanges) return undefined;
  return root.toSource({quote: 'single'});
}
