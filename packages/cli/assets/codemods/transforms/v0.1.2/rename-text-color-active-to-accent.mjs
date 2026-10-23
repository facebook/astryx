// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Codemod: Rename Text/Heading/Link/Timestamp color "active" to "accent"
 * @see https://github.com/facebook/astryx/issues/2863
 *
 * The `active` text-color value is renamed to `accent` and now maps to the
 * dedicated `--color-text-accent` token (legible accent ink) instead of
 * `--color-accent` (the interactive/base accent surface). This gives a
 * first-class, type-safe way to render accent-colored text and resolves the
 * gap reported in #2863.
 *
 * Transforms (scoped to Text, Heading, Link, and Timestamp imported from
 * Astryx; a same-named component from another package is never touched):
 * - <Text color="active" />            → <Text color="accent" />
 * - <Heading color={'active'} />       → <Heading color={'accent'} />
 * - <Text color={cond ? 'active' : x}> → <Text color={cond ? 'accent' : x}>
 * - Storybook meta argTypes: color: { options: [..., 'active', ...] }
 *     → replaces 'active' with 'accent' (meta.component is a target)
 * - Storybook meta and story args: { color: 'active' } / 'active' as const
 *     → { color: 'accent' } (meta.component is a target)
 *
 * Every edit needs binding proof. JSX edits require the element to resolve to
 * an Astryx import that is not shadowed. Storybook `args` and `argTypes` edits
 * require the file's default-export meta to name such a component as its
 * `component`. Any other `color: 'active'` in a file that imports a target
 * from Astryx is left unchanged and gets a TODO.
 *
 * The transform deliberately does NOT touch bare `'active'` strings that are
 * not a `color` value (e.g. status enums, ids, filter values), so it is safe
 * to run across an entire codebase.
 */

import {
  importedComponentBindings,
  storybookArgObjects,
} from '../../storybook-args.mjs';
import {transformProp} from '../../transform-prop.mjs';

export const meta = {
  title: 'Rename Text/Heading/Link/Timestamp color "active" to "accent"',
  description:
    'Renames the `color="active"` value to `color="accent"` on Text, Heading, ' +
    'Link, and Timestamp. The `accent` value maps to `--color-text-accent` ' +
    '(the dedicated accent text ink). Also updates Storybook color argTypes ' +
    'options and object-literal `color` props in files that import a target component.',
  pr: '#2863',
};

const OLD_VALUE = 'active';
const NEW_VALUE = 'accent';

/** Components whose `color` prop accepts a TextColor value. */
const TARGET_COMPONENTS = new Set(['Text', 'Heading', 'Link', 'Timestamp']);

/** Packages, and their per-component subpaths, that export the targets. */
const PACKAGES = ['@astryxdesign/core', '@xds/core'];

/** @param {string} source */
function isAstryxSource(source) {
  return PACKAGES.some(
    pkg =>
      source === pkg ||
      (source.startsWith(`${pkg}/`) &&
        TARGET_COMPONENTS.has(
          canonicalComponentName(source.slice(pkg.length + 1)),
        )),
  );
}

/** @param {string} name */
function canonicalComponentName(name) {
  return name.startsWith('XDS') ? name.slice(3) : name;
}

const UNPROVEN_TODO = ` TODO(astryx upgrade): \`color: '${OLD_VALUE}'\` was left unchanged because nothing proves it belongs to an Astryx Text, Heading, Link, or Timestamp. If it does, change it to '${NEW_VALUE}'. `;

/** @param {any} property @returns {string | null} */
function staticPropertyName(property) {
  const key = property?.key;
  if (!key || (property.type !== 'ObjectProperty' && property.type !== 'Property')) {
    return null;
  }
  if (!property.computed && key.type === 'Identifier') return key.name;
  if (
    (key.type === 'StringLiteral' || key.type === 'Literal') &&
    typeof key.value === 'string'
  ) {
    return key.value;
  }
  return null;
}

/** @param {any} node */
function isOldValue(node) {
  return (
    (node?.type === 'StringLiteral' || node?.type === 'Literal') &&
    node.value === OLD_VALUE
  );
}

/** True when the old value appears where renameInExpression would edit it. */
/** @param {any} node @returns {boolean} */
function containsOldValue(node) {
  if (!node) return false;
  if (node.type === 'ConditionalExpression') {
    return containsOldValue(node.consequent) || containsOldValue(node.alternate);
  }
  if (node.type === 'LogicalExpression') {
    return containsOldValue(node.left) || containsOldValue(node.right);
  }
  if (node.type === 'TSAsExpression') return containsOldValue(node.expression);
  return isOldValue(node);
}

/** The elements of an argTypes entry's static `options` array. */
/** @param {any} value @returns {any[]} */
function argTypeOptions(value) {
  if (!value || value.type !== 'ObjectExpression') return [];
  const optionsProp = value.properties.find(
    (/** @type {any} */ p) => staticPropertyName(p) === 'options',
  );
  return optionsProp?.value.type === 'ArrayExpression'
    ? optionsProp.value.elements
    : [];
}

/**
 * @param {import('../../../../authoring/codemod/type').AstryxCodemodFile} file
 * @param {import('../../../../authoring/codemod/type').CodemodTransformApi} api
 * @returns {string | null | undefined}
 */
export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let hasChanges = false;

  /** Rewrite a string-literal node when it equals the old value. */
  function renameStringLiteral(/** @type {any} */ node) {
    if (!node) return false;
    if (
      (node.type === 'StringLiteral' || node.type === 'Literal') &&
      node.value === OLD_VALUE
    ) {
      node.value = NEW_VALUE;
      if (node.raw) node.raw = `'${NEW_VALUE}'`;
      return true;
    }
    return false;
  }

  /** Recursively rewrite the old value inside ternary/logical expressions. */
  /** @returns {boolean} */
  function renameInExpression(/** @type {any} */ node) {
    if (!node) return false;
    let changed = false;
    if (node.type === 'StringLiteral' || node.type === 'Literal') {
      changed = renameStringLiteral(node) || changed;
    } else if (node.type === 'ConditionalExpression') {
      changed = renameInExpression(node.consequent) || changed;
      changed = renameInExpression(node.alternate) || changed;
    } else if (node.type === 'LogicalExpression') {
      changed = renameInExpression(node.left) || changed;
      changed = renameInExpression(node.right) || changed;
    } else if (node.type === 'TSAsExpression') {
      // `'active' as const` → rewrite the inner expression
      changed = renameInExpression(node.expression) || changed;
    }
    return changed;
  }

  // --- 1. JSX attribute: color="active" / color={'active'} on target
  // components that resolve to an Astryx import ---
  transformProp(
    root,
    j,
    {
      matchesImport: isAstryxSource,
      components: new Map(
        [...TARGET_COMPONENTS].map(name => [name, new Set(['color'])]),
      ),
      normalizeComponentName: canonicalComponentName,
    },
    (/** @type {any} */ propPath) => {
      const value = propPath.node.value;
      if (!value) return;

      if (value.type === 'StringLiteral' || value.type === 'Literal') {
        if (renameStringLiteral(value)) hasChanges = true;
      } else if (value.type === 'JSXExpressionContainer') {
        if (renameInExpression(value.expression)) hasChanges = true;
      }
    },
  );

  // --- 2. Storybook args and argTypes on a meta whose `component` resolves to
  // an Astryx import, and the args of the stories that render it ---
  const bindings = importedComponentBindings(root, j, {
    matchesImport: isAstryxSource,
    components: TARGET_COMPONENTS,
    normalizeComponentName: canonicalComponentName,
  });
  /** @type {Set<any>} property nodes edited with proof */
  const proven = new Set();
  for (const {kind, path} of storybookArgObjects(root, j, bindings)) {
    for (const property of path.node.properties ?? []) {
      if (staticPropertyName(property) !== 'color') continue;
      proven.add(property);
      if (kind === 'args') {
        if (renameInExpression(property.value)) hasChanges = true;
      } else {
        for (const element of argTypeOptions(property.value)) {
          if (renameStringLiteral(element)) hasChanges = true;
        }
      }
    }
  }

  // --- 3. Any other candidate in a file that imports a target from Astryx
  // has no binding proof: leave it unchanged and report it with a TODO ---
  if (bindings.direct.size > 0 || bindings.namespaces.size > 0) {
    const PropertyType = j.ObjectProperty ?? j.Property;
    root.find(PropertyType).forEach((/** @type {any} */ path) => {
      const property = path.node;
      if (staticPropertyName(property) !== 'color' || proven.has(property)) return;
      if (
        !containsOldValue(property.value) &&
        !argTypeOptions(property.value).some(isOldValue)
      ) {
        return;
      }
      if (
        property.comments?.some(
          (/** @type {any} */ comment) => comment.value === UNPROVEN_TODO,
        )
      ) {
        return;
      }
      property.comments = [
        ...(property.comments ?? []),
        j.commentBlock(UNPROVEN_TODO, true, false),
      ];
      hasChanges = true;
    });
  }

  if (!hasChanges) return undefined;
  return root.toSource({quote: 'single'});
}
