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
 * - Storybook argTypes: labelSpacing: { options: [..., 'default', ...] }
 *     → replaces 'default' with 'hug' (files importing Switch)
 * - Object properties: { labelSpacing: 'default' } / { labelSpacing: 'default' as const }
 *     → { labelSpacing: 'hug' } (files importing Switch)
 *
 * JSX edits require the element to resolve to an Astryx import that is not
 * shadowed. Object and argTypes edits require a file that imports Switch from
 * Astryx.
 *
 * The transform deliberately does NOT touch bare `'default'` strings that are
 * not a `labelSpacing` value (an extremely common string otherwise), so it is
 * safe to run across an entire codebase.
 */

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

/**
 * True when the file imports a target component from Astryx by name, or as
 * the default export of its subpath.
 * @param {any} root @param {any} j
 */
function importsAstryxTarget(root, j) {
  return (
    root
      .find(j.ImportDeclaration)
      .filter((/** @type {any} */ path) => {
        const source = path.node.source?.value;
        if (
          path.node.importKind === 'type' ||
          typeof source !== 'string' ||
          !isAstryxSource(source)
        ) {
          return false;
        }
        const subpath = canonicalComponentName(source.split('/').at(-1) ?? '');
        return (path.node.specifiers ?? []).some(
          (/** @type {any} */ specifier) =>
            specifier.importKind !== 'type' &&
            ((specifier.type === 'ImportSpecifier' &&
              TARGET_COMPONENTS.has(
                canonicalComponentName(
                  specifier.imported?.name ?? specifier.imported?.value ?? '',
                ),
              )) ||
              (specifier.type === 'ImportDefaultSpecifier' &&
                TARGET_COMPONENTS.has(subpath))),
        );
      })
      .size() > 0
  );
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

  // Object-property / argTypes transforms only run in files that import
  // Switch from Astryx — keeps unrelated `{ labelSpacing: 'default' }` strings
  // safe, including files that use another library's Switch.
  if (importsAstryxTarget(root, j)) {
    const PropertyType = j.ObjectProperty ?? j.Property;

    // --- 2. Object property: { labelSpacing: 'default' } / 'default' as const ---
    root.find(PropertyType, {key: {name: TARGET_PROP}}).forEach((/** @type {any} */ path) => {
      if (renameInExpression(path.node.value)) hasChanges = true;
    });

    // --- 3. Storybook argTypes: labelSpacing: { options: [..., 'default', ...] } ---
    root.find(PropertyType, {key: {name: TARGET_PROP}}).forEach((/** @type {any} */ path) => {
      const value = path.node.value;
      if (!value || value.type !== 'ObjectExpression') return;

      const optionsProp = value.properties.find(
        (/** @type {any} */ p) => p.key && (p.key.name === 'options' || p.key.value === 'options'),
      );
      if (optionsProp && optionsProp.value.type === 'ArrayExpression') {
        optionsProp.value.elements.forEach((/** @type {any} */ el) => {
          if (renameStringLiteral(el)) hasChanges = true;
        });
      }
    });
  }

  if (!hasChanges) return undefined;
  return root.toSource({quote: 'single'});
}
