// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Codemod: Rename Avatar named sizes to Icon's abbreviated scale
 * @see https://github.com/facebook/astryx/issues/2672
 *
 * As of v0.1.8, Avatar and AvatarGroup use the same abbreviated size scale as
 * Icon (`xsm`/`sm`/`md`/`lg`/`xl`) instead of full words. Pixel values are
 * unchanged — only the names move:
 *
 *   tiny (20px)   → xsm
 *   xsmall (24px) → sm
 *   small (36px)  → md   ← also the new default (was `small`)
 *   medium (48px) → lg
 *   large (128px) → xl
 *
 * The default size shifts from `small` to `md`, but that is the SAME 36px, so
 * call sites that relied on the default need no change.
 *
 * ## Precision
 *
 * `small`, `medium`, and `large` are common English words that appear as
 * unrelated string/type literals (priorities, statuses, breakpoints, …). To
 * avoid corrupting those, the three AMBIGUOUS names are renamed ONLY in a
 * precise context: a `size` JSX attribute on a component that resolves to an
 * Avatar/AvatarGroup import (alias-aware).
 *
 * `tiny` and `xsmall` are unique to Avatar's scale, so they are additionally
 * renamed in context-blind positions (object properties keyed `size`/`*Size`,
 * Storybook `options` arrays, and size-typed union literals) within files that
 * import Avatar/AvatarGroup.
 */

export const meta = {
  title: 'Rename Avatar named sizes tiny/xsmall/small/medium/large → xsm/sm/md/lg/xl',
  description:
    'Avatar and AvatarGroup adopt Icon\'s abbreviated size scale ' +
    '(xsm/sm/md/lg/xl). Pixel values are unchanged; the default moves from ' +
    '`small` to `md` (both 36px). The ambiguous names small/medium/large are ' +
    'only renamed on Avatar/AvatarGroup `size` JSX attributes; the unique ' +
    'names tiny/xsmall are also renamed in size-keyed props, Storybook ' +
    'options, and union types in files importing Avatar/AvatarGroup.',
  pr: '#2672',
};

/** Import sources that provide the Astryx Avatar/AvatarGroup components. */
const IMPORT_SOURCES = new Set([
  '@astryxdesign/core',
  '@astryxdesign/core/Avatar',
  '@astryxdesign/core/AvatarGroup',
  '@xds/core',
  '@xds/core/Avatar',
  '@xds/core/AvatarGroup',
]);

/** Component names whose `size` prop is renamed. */
const TARGET_IMPORTED_NAMES = new Set(['Avatar', 'AvatarGroup']);

/** Old → new size-name mapping. */
const RENAMES = new Map([
  ['tiny', 'xsm'],
  ['xsmall', 'sm'],
  ['small', 'md'],
  ['medium', 'lg'],
  ['large', 'xl'],
]);

/**
 * Ambiguous names — common words that must ONLY be renamed in a precise
 * context. `tiny`/`xsmall` are omitted because they are unique to Avatar's
 * scale; their presence in a collection proves it is an Avatar size enum.
 */
const AMBIGUOUS = new Set(['small', 'medium', 'large']);

/** Names that appear only in Avatar's scale — safe signals of Avatar sizing. */
const UNIQUE = new Set(['tiny', 'xsmall']);

/**
 * Rename a string-literal node if its value is an old size name.
 * Unwraps `'small' as const`. In non-precise contexts, ambiguous names are
 * skipped. Returns true when a rename occurred.
 */
function renameValue(node, {precise = false} = {}) {
  if (!node) return false;
  const target = node.type === 'TSAsExpression' ? node.expression : node;
  const isString =
    target.type === 'StringLiteral' || target.type === 'Literal';
  if (!isString || typeof target.value !== 'string') return false;
  const replacement = RENAMES.get(target.value);
  if (!replacement) return false;
  if (!precise && AMBIGUOUS.has(target.value)) return false;
  target.value = replacement;
  if (target.raw) target.raw = undefined;
  return true;
}

/** Extract a plain string value from a literal-ish node, or null. */
function literalString(node) {
  const target = node?.type === 'TSAsExpression' ? node.expression : node;
  if (
    target &&
    (target.type === 'StringLiteral' || target.type === 'Literal') &&
    typeof target.value === 'string'
  ) {
    return target.value;
  }
  return null;
}

export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let hasChanges = false;

  // Track alias-aware local names for the target components.
  const targetLocals = new Set();
  root.find(j.ImportDeclaration).forEach((path) => {
    if (!IMPORT_SOURCES.has(path.node.source.value)) return;
    for (const spec of path.node.specifiers ?? []) {
      if (
        spec.type === 'ImportSpecifier' &&
        TARGET_IMPORTED_NAMES.has(spec.imported.name)
      ) {
        targetLocals.add(spec.local.name);
      }
    }
  });

  if (targetLocals.size === 0) return undefined;

  function renameArrayElements(node) {
    let arr = node;
    if (arr.type === 'TSAsExpression') arr = arr.expression;
    if (arr.type !== 'ArrayExpression') return;
    // If the array contains a name unique to Avatar's scale (tiny/xsmall), the
    // whole collection is unambiguously the Avatar size enum, so it is safe to
    // rename the ambiguous members too. Otherwise stay conservative.
    const precise = arr.elements.some((el) => UNIQUE.has(literalString(el)));
    for (const el of arr.elements) {
      if (renameValue(el, {precise})) hasChanges = true;
    }
  }

  // 1. `size` JSX attributes on target components — PRECISE (component known),
  //    so all five names, including the ambiguous ones, are renamed here.
  root.find(j.JSXOpeningElement).forEach((path) => {
    const name = path.node.name;
    const componentName = name.type === 'JSXIdentifier' ? name.name : null;
    if (!componentName || !targetLocals.has(componentName)) return;

    for (const attr of path.node.attributes) {
      if (attr.type !== 'JSXAttribute' || attr.name?.name !== 'size') continue;
      const value = attr.value;

      // size="small"
      if (renameValue(value, {precise: true})) {
        hasChanges = true;
        continue;
      }
      if (
        value &&
        value.type === 'JSXExpressionContainer' &&
        value.expression
      ) {
        // size={'small'}
        if (renameValue(value.expression, {precise: true})) {
          hasChanges = true;
          continue;
        }
        // size={cond ? 'small' : 'large'}
        if (value.expression.type === 'ConditionalExpression') {
          if (renameValue(value.expression.consequent, {precise: true}))
            hasChanges = true;
          if (renameValue(value.expression.alternate, {precise: true}))
            hasChanges = true;
        }
      }
    }
  });

  // 2. Object properties keyed `size` (or `*Size`) + Storybook `options`
  //    arrays — NON-PRECISE (the component isn't known here), so only the
  //    unique names tiny/xsmall are renamed.
  const PropertyType = j.ObjectProperty ?? j.Property;
  root.find(PropertyType).forEach((path) => {
    const key = path.node.key;
    const keyName =
      key.type === 'Identifier'
        ? key.name
        : key.type === 'StringLiteral' || key.type === 'Literal'
          ? key.value
          : null;
    if (typeof keyName !== 'string') return;

    const lower = keyName.toLowerCase();
    if (lower !== 'size' && !lower.endsWith('size')) return;

    const value = path.node.value;
    // size: 'tiny'
    if (renameValue(value)) {
      hasChanges = true;
      return;
    }
    // size: { control: 'select', options: ['tiny', ...] }
    if (value.type === 'ObjectExpression') {
      const optionsProp = value.properties.find(
        (p) => p.key && (p.key.name === 'options' || p.key.value === 'options'),
      );
      if (optionsProp) renameArrayElements(optionsProp.value);
    }
    // size: ['tiny', 'xsmall', ...]
    renameArrayElements(value);
  });

  // 3. Union-type literals — NON-PRECISE, so only the unique names tiny/xsmall
  //    are renamed. This avoids corrupting unrelated unions that happen to use
  //    common words like 'medium' (e.g. a priority or breakpoint type) in a
  //    file that also imports Avatar.
  root.find(j.TSLiteralType).forEach((path) => {
    if (renameValue(path.node.literal)) hasChanges = true;
  });

  // 4. Standalone array literals whose members are exactly the Avatar size
  //    scale (identified by the presence of a unique name like tiny/xsmall) —
  //    e.g. `(['tiny', 'xsmall', 'small', 'medium', 'large'] as const).map(...)`
  //    used to render every size. The unique name proves the whole array is the
  //    Avatar enum, so its ambiguous members can be renamed safely.
  root.find(j.ArrayExpression).forEach((path) => {
    renameArrayElements(path.node);
  });

  if (!hasChanges) return undefined;
  return root.toSource({quote: 'single'});
}
