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
 * Renames are applied to:
 * - `size` JSX attributes on <Avatar> / <AvatarGroup> (alias-aware)
 * - `size` object properties and Storybook `options` arrays, plus `size`-typed
 *   union literals, in files that import Avatar or AvatarGroup
 *
 * Only files importing Avatar/AvatarGroup from an Astryx core source are
 * touched, so unrelated `small`/`medium`/`large` strings elsewhere are safe.
 */

export const meta = {
  title: 'Rename Avatar named sizes tiny/xsmall/small/medium/large → xsm/sm/md/lg/xl',
  description:
    'Avatar and AvatarGroup adopt Icon\'s abbreviated size scale ' +
    '(xsm/sm/md/lg/xl). Pixel values are unchanged; the default moves from ' +
    '`small` to `md` (both 36px). Renames size props, Storybook options, ' +
    'object properties, and union types in files importing Avatar/AvatarGroup.',
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
 * Rename a string-literal node if its value is an old size name.
 * Unwraps `'small' as const`. Returns true when a rename occurred.
 */
function renameValue(node) {
  if (!node) return false;
  const target = node.type === 'TSAsExpression' ? node.expression : node;
  const isString =
    target.type === 'StringLiteral' || target.type === 'Literal';
  if (!isString || typeof target.value !== 'string') return false;
  const replacement = RENAMES.get(target.value);
  if (!replacement) return false;
  target.value = replacement;
  if (target.raw) target.raw = undefined;
  return true;
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
    for (const el of arr.elements) {
      if (renameValue(el)) hasChanges = true;
    }
  }

  // 1. `size` JSX attributes on target components.
  root.find(j.JSXOpeningElement).forEach((path) => {
    const name = path.node.name;
    const componentName = name.type === 'JSXIdentifier' ? name.name : null;
    if (!componentName || !targetLocals.has(componentName)) return;

    for (const attr of path.node.attributes) {
      if (attr.type !== 'JSXAttribute' || attr.name?.name !== 'size') continue;
      const value = attr.value;

      // size="small"
      if (renameValue(value)) {
        hasChanges = true;
        continue;
      }
      if (
        value &&
        value.type === 'JSXExpressionContainer' &&
        value.expression
      ) {
        // size={'small'}
        if (renameValue(value.expression)) {
          hasChanges = true;
          continue;
        }
        // size={cond ? 'small' : 'large'}
        if (value.expression.type === 'ConditionalExpression') {
          if (renameValue(value.expression.consequent)) hasChanges = true;
          if (renameValue(value.expression.alternate)) hasChanges = true;
        }
      }
    }
  });

  // 2. Object properties keyed `size` (or `*size`) + Storybook `options`
  //    arrays, in files importing a target component.
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
    const isSizeKey = lower === 'size' || lower.endsWith('size');

    if (isSizeKey) {
      const value = path.node.value;
      // size: 'small'
      if (renameValue(value)) {
        hasChanges = true;
        return;
      }
      // size: { control: 'select', options: ['tiny', ...] }
      if (value.type === 'ObjectExpression') {
        const optionsProp = value.properties.find(
          (p) =>
            p.key && (p.key.name === 'options' || p.key.value === 'options'),
        );
        if (optionsProp) renameArrayElements(optionsProp.value);
      }
      // size: ['tiny', 'xsmall', ...]
      renameArrayElements(value);
    }
  });

  // 3. Union-type literals: 'tiny' | 'xsmall' | ... in size-typed annotations.
  root.find(j.TSLiteralType).forEach((path) => {
    if (renameValue(path.node.literal)) hasChanges = true;
  });

  if (!hasChanges) return undefined;
  return root.toSource({quote: 'single'});
}
