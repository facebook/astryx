// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Codemod: Rename imperative ref props to handleRef
 *
 * XDS components reserve `ref` for DOM elements. Components with imperative
 * handles now expose those handles through `handleRef`.
 *
 * Handles:
 * - JSX prop: `ref` → `handleRef` on XDSCalendar, XDSChatComposerInput,
 *   XDSPowerSearch, XDSTokenizer, and XDSChartStreamGL
 * - JSX prop: `sideNavRef` → `handleRef` on XDSSideNavCollapseButton
 */

export const meta = {
  title: 'Rename imperative ref props to handleRef',
  description:
    'Renames imperative `ref` usages to `handleRef` on components whose ' +
    '`ref` prop now points at the root DOM element. Also renames ' +
    '`XDSSideNavCollapseButton` `sideNavRef` to `handleRef`.',
  issue: '#2359',
};

const IMPERATIVE_REF_COMPONENTS = new Set([
  'XDSCalendar',
  'XDSChatComposerInput',
  'XDSPowerSearch',
  'XDSTokenizer',
  'XDSChartStreamGL',
]);

/**
 * @param {import('../../../types/codemod').AstryxCodemodFile} file
 * @param {import('../../../types/codemod').CodemodTransformApi} api
 * @returns {string | null | undefined}
 */
export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let hasChanges = false;

  root.find(j.JSXOpeningElement).forEach((/** @type {any} */ path) => {
    const name = path.node.name;
    const componentName = name.type === 'JSXIdentifier' ? name.name : null;
    if (componentName == null) return;

    for (const attr of path.node.attributes) {
      if (attr.type !== 'JSXAttribute') continue;

      if (
        IMPERATIVE_REF_COMPONENTS.has(componentName) &&
        attr.name?.type === 'JSXIdentifier' &&
        attr.name.name === 'ref'
      ) {
        attr.name.name = 'handleRef';
        hasChanges = true;
      }

      if (
        componentName === 'XDSSideNavCollapseButton' &&
        attr.name?.type === 'JSXIdentifier' &&
        attr.name.name === 'sideNavRef'
      ) {
        attr.name.name = 'handleRef';
        hasChanges = true;
      }
    }
  });

  if (!hasChanges) return undefined;
  return root.toSource({quote: 'single'});
}
