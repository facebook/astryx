// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Codemod: drop the a11y props indicators no longer accept
 *
 * `IndicatorProps` stopped accepting `aria-hidden`, `role`, `aria-label`,
 * `aria-labelledby` and `tabIndex`. An indicator is decorative: the control
 * that renders one owns the role, the accessible name and the focus. Passing
 * them un-hid a decorative element (announced twice) or put a tab stop inside
 * an `aria-hidden` subtree.
 *
 * The type catches a literal attribute. It does NOT catch a spread — TypeScript
 * exempts hyphenated JSX attribute names from excess-property checking, and a
 * spread bypasses the check for the rest — so a consumer can hit this with no
 * compile error at all. That silence is why the rename needs a codemod and not
 * just a changelog line.
 *
 * Removal, not rewriting: there is nowhere to move these props to. The owning
 * control already carries the role and the name, so the prop was redundant at
 * best and wrong at worst. Every removal leaves a TODO naming what to check,
 * because "the owner already does this" is a claim about the call site that a
 * codemod cannot verify (api.report is a stub; comments are the only channel).
 */

export const meta = {
  title: 'Drop the a11y props indicators no longer accept',
  description:
    'Removes `aria-hidden`, `role`, `aria-label`, `aria-labelledby` and ' +
    '`tabIndex` from CheckIndicator / CheckboxIndicator / RadioIndicator call ' +
    'sites, and from JSX on any local alias of an indicator resolved through ' +
    '`useIndicator()` / `getIndicator()`. Each removal leaves a TODO asking the ' +
    'author to confirm the owning control carries the semantics instead.',
  pr: '#4937',
};

const REMOVED = new Set([
  'aria-hidden',
  'role',
  'aria-label',
  'aria-labelledby',
  'tabIndex',
]);

const INDICATOR_EXPORTS = new Set([
  'CheckIndicator',
  'CheckboxIndicator',
  'RadioIndicator',
]);

const IMPORT_SOURCES = new Set([
  '@astryxdesign/core',
  '@astryxdesign/core/Indicator',
  '@xds/core',
  '@xds/core/Indicator',
]);

const TODO = (/** @type {string} */ names) =>
  ` TODO(astryx upgrade): removed ${names} — an indicator is decorative, so the` +
  ` control that renders it owns the role, the accessible name and the focus.` +
  ` Confirm that control actually carries them; if this indicator was the only` +
  ` thing naming the control, the name has to move there, not come back here. `;

/**
 * @param {import('../../../../authoring/codemod/type').AstryxCodemodFile} file
 * @param {import('../../../../authoring/codemod/type').CodemodTransformApi} api
 * @returns {string | null | undefined}
 */
export default function transformer(file, api) {
  // Cheap bail-out: most files in a consumer repo render no indicator.
  const mentionsIndicator =
    [...INDICATOR_EXPORTS].some((n) => file.source.includes(n)) ||
    file.source.includes('useIndicator') ||
    file.source.includes('getIndicator');
  if (!mentionsIndicator) {
    return undefined;
  }

  const j = api.jscodeshift;
  const root = j(file.source);
  let hasChanges = false;

  /** Local names that resolve to an indicator component. */
  const locals = new Set();

  // 1. Direct imports of a shipped indicator.
  root.find(j.ImportDeclaration).forEach((/** @type {any} */ path) => {
    if (!IMPORT_SOURCES.has(path.node.source.value)) {
      return;
    }
    for (const spec of path.node.specifiers ?? []) {
      if (
        spec.type === 'ImportSpecifier' &&
        INDICATOR_EXPORTS.has(spec.imported.name)
      ) {
        locals.add(spec.local.name);
      }
    }
  });

  // 2. `const X = useIndicator('check')` / `getIndicator('radio', theme)` —
  //    the documented way a host renders a themeable indicator, so the JSX
  //    below is an indicator even though no indicator name appears in it.
  root.find(j.VariableDeclarator).forEach((/** @type {any} */ path) => {
    const init = path.node.init;
    if (
      init?.type !== 'CallExpression' ||
      init.callee?.type !== 'Identifier' ||
      (init.callee.name !== 'useIndicator' && init.callee.name !== 'getIndicator')
    ) {
      return;
    }
    if (path.node.id?.type === 'Identifier') {
      locals.add(path.node.id.name);
    }
  });

  if (locals.size === 0) {
    return undefined;
  }

  root.find(j.JSXOpeningElement).forEach((/** @type {any} */ path) => {
    const name = path.node.name;
    if (name.type !== 'JSXIdentifier' || !locals.has(name.name)) {
      return;
    }

    /** @type {string[]} */
    const removed = [];
    path.node.attributes = (path.node.attributes ?? []).filter(
      (/** @type {any} */ attr) => {
        if (attr.type !== 'JSXAttribute') {
          return true;
        }
        // A JSX attribute name is either an identifier or a namespaced/
        // hyphenated name; jscodeshift models the hyphenated form as
        // JSXIdentifier with the hyphen in `name`.
        const attrName = attr.name?.name;
        if (typeof attrName !== 'string' || !REMOVED.has(attrName)) {
          return true;
        }
        removed.push(attrName);
        return false;
      },
    );

    if (removed.length === 0) {
      return;
    }

    const comment = TODO(removed.join(', '));
    if (!path.node.comments) {
      path.node.comments = [];
    }
    if (!path.node.comments.some((/** @type {any} */ c) => c.value === comment)) {
      path.node.comments.push(j.commentBlock(comment, true, false));
    }
    hasChanges = true;
  });

  return hasChanges ? root.toSource({quote: 'single'}) : undefined;
}
