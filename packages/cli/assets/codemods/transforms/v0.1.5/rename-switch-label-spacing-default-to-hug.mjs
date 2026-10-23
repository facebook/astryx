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
 * Transforms, on Switch imported from Astryx:
 * - <Switch labelSpacing="default" />            → <Switch labelSpacing="hug" />
 * - <Switch labelSpacing={'default'} />          → <Switch labelSpacing={'hug'} />
 * - <Switch labelSpacing={cond ? 'default' : x}> → <Switch labelSpacing={cond ? 'hug' : x}>
 * - Storybook args: { labelSpacing: 'default' } / 'default' as const → 'hug'
 * - Storybook argTypes: labelSpacing: { options: [..., 'default', ...] } → 'hug'
 *
 * Every edit needs binding proof (see `rename-prop-value.mjs`): a JSX element,
 * or a Storybook meta or story whose `component`, resolves to an Astryx Switch
 * import that is not shadowed. A Switch from another package and any other
 * `labelSpacing: 'default'` object are left unchanged.
 */

import {renamePropValue} from '../../rename-prop-value.mjs';

export const meta = {
  title: 'Rename Switch labelSpacing "default" to "hug"',
  description:
    'Renames the `labelSpacing="default"` value to `labelSpacing="hug"` on ' +
    'Switch imported from Astryx. The old value keeps working as a deprecated ' +
    'alias. Also updates the labelSpacing `args` and `argTypes` options of ' +
    'Storybook stories whose `component` is Switch.',
  pr: '#2889',
};

/** Components whose `labelSpacing` prop accepts a SwitchLabelSpacing value. */
const TARGET_COMPONENTS = new Set(['Switch']);

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
    prop: 'labelSpacing',
    from: 'default',
    to: 'hug',
  });
}
