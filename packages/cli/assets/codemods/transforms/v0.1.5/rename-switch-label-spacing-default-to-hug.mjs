// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Codemod: Rename Switch labelSpacing "default" to "hug"
 * @see https://github.com/facebook/astryx/issues/2889
 *
 * The `labelSpacing="default"` value is renamed to `labelSpacing="hug"` so
 * the name describes the behavior (label and switch hug each other), matching
 * the behavioral register of the sibling `spread` value and the existing
 * `hug`/`fill` layout vocabulary on TabList and SegmentedControl. The old
 * `default` value keeps working as a deprecated alias, so this codemod is a
 * cleanup, not a build fix.
 *
 * Transforms (scoped to Switch imported from Astryx; a Switch from another
 * package is never touched):
 * - <Switch labelSpacing="default" />            → <Switch labelSpacing="hug" />
 * - <Switch labelSpacing={'default'} />          → <Switch labelSpacing={'hug'} />
 * - <Switch labelSpacing={cond ? 'default' : x}> → <Switch labelSpacing={cond ? 'hug' : x}>
 * - Storybook meta argTypes: labelSpacing: { options: [..., 'default', ...] }
 *     → replaces 'default' with 'hug' (meta.component is Switch)
 * - Storybook meta and story args: { labelSpacing: 'default' } / 'default' as const
 *     → { labelSpacing: 'hug' } (meta.component is Switch)
 *
 * Every edit needs binding proof. JSX edits require the element to resolve to
 * an Astryx import that is not shadowed. Storybook `args` and `argTypes` edits
 * require the file's default-export meta to name such a Switch as its
 * `component`. Any other `labelSpacing: 'default'` in a file that imports
 * Switch from Astryx is left unchanged and gets a TODO.
 *
 * The transform deliberately does NOT touch bare `'default'` strings that are
 * not a `labelSpacing` value (an extremely common string otherwise), so it is
 * safe to run across an entire codebase.
 */

import {
  importedComponentBindings,
  storybookArgObjects,
} from '../../storybook-args.mjs';
import {transformProp} from '../../transform-prop.mjs';

export const meta = {
  title: 'Rename Switch labelSpacing "default" to "hug"',
  description:
    'Renames the `labelSpacing="default"` value to `labelSpacing="hug"` on ' +
    'Switch. The old value keeps working as a deprecated alias. Also updates ' +
    'Storybook labelSpacing argTypes options and object-literal `labelSpacing` ' +
    'props in files that import Switch.',
  pr: '#2889',
};

const OLD_VALUE = 'default';
const NEW_VALUE = 'hug';

/** Prop whose value is being renamed. */
const TARGET_PROP = 'labelSpacing';

/** Components whose `labelSpacing` prop accepts a SwitchLabelSpacing value. */
const TARGET_COMPONENTS = new Set(['Switch']);

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

const UNPROVEN_TODO = ` TODO(astryx upgrade): \`labelSpacing: '${OLD_VALUE}'\` was left unchanged because nothing proves it belongs to an Astryx Switch. If it does, change it to '${NEW_VALUE}'. `;

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
      // `'default' as const` → rewrite the inner expression
      changed = renameInExpression(node.expression) || changed;
    }
    return changed;
  }

  // --- 1. JSX attribute: labelSpacing="default" / labelSpacing={'default'} on
  // a Switch that resolves to an Astryx import ---
  transformProp(
    root,
    j,
    {
      matchesImport: isAstryxSource,
      components: new Map(
        [...TARGET_COMPONENTS].map(name => [name, new Set([TARGET_PROP])]),
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
      if (staticPropertyName(property) !== TARGET_PROP) continue;
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
      if (staticPropertyName(property) !== TARGET_PROP || proven.has(property)) return;
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
