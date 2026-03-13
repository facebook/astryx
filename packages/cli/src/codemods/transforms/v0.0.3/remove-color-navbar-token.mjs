/**
 * @file Codemod: Remove `--color-navbar` token usage
 *
 * The `--color-navbar` token has been removed in v0.0.3. Nav background
 * is now controlled by the `variant` prop on XDSAppShell.
 *
 * Transforms:
 * - StyleX property references: colorVars['--color-navbar'] → colorVars['--color-surface'] + TODO
 * - Object property keys: '--color-navbar': ... → removed
 * - Standalone string literals: '--color-navbar' → '--color-surface'
 *
 * @see https://github.com/facebookexperimental/xds/pull/597
 */

export const meta = {
  title: 'Remove --color-navbar token usage',
  description:
    'Removes or flags usages of the `--color-navbar` token which was removed in v0.0.3. Nav background is now controlled by XDSAppShell variant prop.',
  pr: '#597',
};

const TOKEN = '--color-navbar';
const REPLACEMENT = '--color-surface';
const TODO_COMMENT =
  'TODO(xds-codemod): --color-navbar removed — nav bg now controlled by XDSAppShell variant';

export default function transformer(file, api) {
  const j = api.jscodeshift;
  const source = file.source;

  // Quick bail: skip files that don't reference the token at all
  if (!source.includes(TOKEN)) {
    return undefined;
  }

  const root = j(source);
  let hasChanges = false;

  // Pattern 1: colorVars['--color-navbar'] in StyleX
  // Replace with colorVars['--color-surface']
  root
    .find(j.MemberExpression, {
      property: {value: TOKEN},
    })
    .forEach((path) => {
      path.node.property = j.literal(REPLACEMENT);
      hasChanges = true;
    });

  // Pattern 2: '--color-navbar' as a key in theme objects (defineTheme, etc.)
  // Remove the property entirely
  root
    .find(j.Property, {
      key: {value: TOKEN},
    })
    .forEach((path) => {
      const parent = path.parent;
      if (parent && parent.node && Array.isArray(parent.node.properties)) {
        const index = parent.node.properties.indexOf(path.node);
        if (index !== -1) {
          parent.node.properties.splice(index, 1);
          hasChanges = true;
        }
      }
    });

  // Pattern 3: String literal '--color-navbar' used as a standalone value
  root
    .find(j.Literal, {value: TOKEN})
    .forEach((path) => {
      // Skip if already handled (property key or member expression)
      if (
        path.parent.node.type === 'Property' &&
        path.parent.node.key === path.node
      ) {
        return;
      }
      if (path.parent.node.type === 'MemberExpression') {
        return;
      }
      path.node.value = REPLACEMENT;
      hasChanges = true;
    });

  if (!hasChanges) {
    return undefined;
  }

  // Post-process: add TODO comment via string replacement
  let result = root.toSource();
  if (!result.includes(TODO_COMMENT)) {
    result = '// ' + TODO_COMMENT + '\n' + result;
  }

  return result;
}
