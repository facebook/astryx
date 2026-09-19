// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Codemod: rename the removed `dropdown-menu-radio-dot` theme target
 *
 * The menu radio's dot is no longer drawn by DropdownMenuRadioItem. That row
 * now renders the shared radio indicator, so its dot is the indicator's dot and
 * carries `radio-indicator-dot` (plus the legacy `radio-dot`) instead of the
 * menu-specific `dropdown-menu-radio-dot`, which is gone.
 *
 * Runtime themes are not validated: a theme keyed on the old target keeps
 * compiling and simply stops matching, with no error anywhere. That silence is
 * why this rename needs a codemod rather than a changelog line.
 *
 * The rename is NOT scope-preserving, and that cannot be fixed here — there is
 * no menu-only dot element left to address. `radio-indicator-dot` reaches every
 * radio dot in the app, including RadioList's. So every rewritten site also
 * gets a TODO comment (api.report is a stub; comments are the only warning
 * channel) telling the author to check whether the rule was meant to be
 * menu-only, and pointing at the containing-target route if it was.
 */

export const meta = {
  title: 'Rename the removed dropdown-menu-radio-dot theme target',
  description:
    'Renames the `dropdown-menu-radio-dot` theme target (and the ' +
    '`astryx-dropdown-menu-radio-dot` class it rendered) to ' +
    '`radio-indicator-dot` / `astryx-radio-indicator-dot`. Menu radios draw ' +
    'the shared radio indicator now, so the menu-specific dot target no ' +
    'longer exists. The new target is app-wide rather than menu-only, so each ' +
    'rewritten site gets a TODO comment to confirm that widening is intended.',
  pr: '#4712',
};

const OLD_TARGET = 'dropdown-menu-radio-dot';
const NEW_TARGET = 'radio-indicator-dot';
const OLD_CLASS = `astryx-${OLD_TARGET}`;
const NEW_CLASS = `astryx-${NEW_TARGET}`;

const TODO_COMMENT =
  ' TODO(astryx upgrade): `dropdown-menu-radio-dot` became `radio-indicator-dot`,' +
  ' which styles EVERY radio dot, not just the ones in a menu. If this rule was' +
  ' meant to be menu-only, scope it under the containing `dropdown-menu-radio`' +
  ' target instead of this one. ';

/**
 * Rewrite one string value, or return null when it holds nothing to rename.
 *
 * Handles the target name on its own (a theme's `components` key) and the
 * rendered class inside a larger string (a selector such as
 * `.astryx-dropdown-menu-radio-dot`, or a className list).
 *
 * @param {string} value
 * @returns {string | null}
 */
function renameIn(value) {
  if (value === OLD_TARGET) {
    return NEW_TARGET;
  }
  if (value.includes(OLD_CLASS)) {
    return value.split(OLD_CLASS).join(NEW_CLASS);
  }
  return null;
}

/**
 * @param {import('../../../../authoring/codemod/type').AstryxCodemodFile} file
 * @param {import('../../../../authoring/codemod/type').CodemodTransformApi} api
 * @returns {string | null | undefined}
 */
export default function transformer(file, api) {
  // Cheap bail-out: most files in a consumer repo mention neither name.
  if (!file.source.includes(OLD_TARGET)) {
    return undefined;
  }

  const j = api.jscodeshift;
  const root = j(file.source);
  let hasChanges = false;

  /** Attach the widening warning once to the nearest statement-ish node. */
  function attachTodo(/** @type {any} */ path) {
    // The property (or its statement) reads better than the bare literal, and
    // matches where a human would look for the note.
    const host =
      path.parent?.node?.type === 'ObjectProperty' ||
      path.parent?.node?.type === 'Property'
        ? path.parent.node
        : path.node;
    if (!host.comments) {
      host.comments = [];
    }
    if (
      host.comments.some((/** @type {any} */ c) => c.value === TODO_COMMENT)
    ) {
      return;
    }
    host.comments.push(j.commentBlock(TODO_COMMENT, true, false));
  }

  root
    .find(j.StringLiteral)
    .forEach((/** @type {any} */ path) => {
      const renamed = renameIn(path.node.value);
      if (renamed == null) {
        return;
      }
      path.node.value = renamed;
      attachTodo(path);
      hasChanges = true;
    });

  // Older parsers surface string literals as `Literal`.
  root.find(j.Literal).forEach((/** @type {any} */ path) => {
    if (typeof path.node.value !== 'string') {
      return;
    }
    const renamed = renameIn(path.node.value);
    if (renamed == null) {
      return;
    }
    path.node.value = renamed;
    if (typeof path.node.raw === 'string') {
      path.node.raw = path.node.raw
        .split(OLD_TARGET)
        .join(NEW_TARGET);
    }
    attachTodo(path);
    hasChanges = true;
  });

  // Template literals carry the class in CSS strings: `.${OLD_CLASS} > span`.
  root.find(j.TemplateElement).forEach((/** @type {any} */ path) => {
    const cooked = path.node.value?.cooked;
    if (typeof cooked !== 'string') {
      return;
    }
    const renamed = renameIn(cooked);
    if (renamed == null) {
      return;
    }
    path.node.value.cooked = renamed;
    path.node.value.raw = path.node.value.raw
      .split(OLD_CLASS)
      .join(NEW_CLASS)
      .split(OLD_TARGET)
      .join(NEW_TARGET);
    hasChanges = true;
  });

  return hasChanges ? root.toSource({quote: 'single'}) : undefined;
}
