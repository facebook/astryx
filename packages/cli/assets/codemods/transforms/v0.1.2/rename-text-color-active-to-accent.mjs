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
 * Transforms, on Text, Heading, Link, and Timestamp imported from Astryx:
 * - <Text color="active" />            → <Text color="accent" />
 * - <Heading color={'active'} />       → <Heading color={'accent'} />
 * - <Text color={cond ? 'active' : x}> → <Text color={cond ? 'accent' : x}>
 * - Storybook args: { color: 'active' } / 'active' as const → 'accent'
 * - Storybook argTypes: color: { options: [..., 'active', ...] } → 'accent'
 *
 * Every edit needs binding proof (see `rename-prop-value.mjs`): a JSX element,
 * or a Storybook meta or story whose `component`, resolves to an Astryx import
 * that is not shadowed. Same-named components from other packages and any
 * other `color: 'active'` object are left unchanged.
 */

import {renamePropValue} from '../../rename-prop-value.mjs';

export const meta = {
  title: 'Rename Text/Heading/Link/Timestamp color "active" to "accent"',
  description:
    'Renames the `color="active"` value to `color="accent"` on Text, Heading, ' +
    'Link, and Timestamp imported from Astryx. The `accent` value maps to ' +
    '`--color-text-accent` (the dedicated accent text ink). Also updates the ' +
    'color `args` and `argTypes` options of Storybook stories whose ' +
    '`component` is one of them.',
  pr: '#2863',
};

/** Components whose `color` prop accepts a TextColor value. */
const TARGET_COMPONENTS = new Set(['Text', 'Heading', 'Link', 'Timestamp']);

/** Packages, and their per-component subpaths, that export the targets. */
const PACKAGES = ['@astryxdesign/core', '@xds/core'];

/** @param {string} name */
function canonicalComponentName(name) {
  return name.startsWith('XDS') ? name.slice(3) : name;
}

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

/**
 * @param {import('../../../../authoring/codemod/type').AstryxCodemodFile} file
 * @param {import('../../../../authoring/codemod/type').CodemodTransformApi} api
 * @returns {string | null | undefined}
 */
export default function transformer(file, api) {
  return renamePropValue(file, api, {
    matchesImport: isAstryxSource,
    components: TARGET_COMPONENTS,
    normalizeComponentName: canonicalComponentName,
    prop: 'color',
    from: 'active',
    to: 'accent',
  });
}
