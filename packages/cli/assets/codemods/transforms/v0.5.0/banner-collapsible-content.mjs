// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Codemod: migrate Banner's `defaultIsExpanded` onto `collapsible`
 *
 * Banner's collapse axis used to be a single knob, `defaultIsExpanded`, with
 * the disclosure itself inferred from the presence of `children`. There was no
 * way to have content without a toggle, and no controlled mode. The axis now
 * lives on one `boolean | CollapsibleConfig` prop, per the boolean-or-config
 * convention:
 *
 *   <Banner>{children}</Banner>                     → collapsible, starts closed
 *   <Banner collapsible={{defaultIsOpen: true}}>    → collapsible, starts open
 *   <Banner collapsible={{isOpen, onOpenChange}}>   → controlled
 *   <Banner collapsible={false}>                    → always visible, no toggle
 *
 * The default is unchanged, so a Banner that never mentioned the old prop needs
 * no rewrite at all — this transform is a prop rename and nothing more:
 *
 *   defaultIsExpanded            → collapsible={{defaultIsOpen: true}}
 *   defaultIsExpanded={true}     → collapsible={{defaultIsOpen: true}}
 *   defaultIsExpanded={false}    → (removed — it is the default)
 *   defaultIsExpanded={expr}     → collapsible={{defaultIsOpen: expr}}
 *
 * Only elements named `Banner` are touched, and only when the file imports that
 * name from `@astryxdesign/core`: `defaultIsExpanded` is also a ChatToolCalls
 * prop, which this migration must leave alone.
 *
 * Scope: JSX attributes only. `defaultIsExpanded` inside a props object (a
 * Storybook `args`, a spread built up in a variable) is left alone rather than
 * rewritten on a guess about which component the object is for — removing the
 * prop from the type makes those sites a type error, which is loud enough to
 * find them.
 */

export const meta = {
  title: "Rename Banner's `defaultIsExpanded` to the `collapsible` config",
  description:
    "Banner's collapse axis is now a single `collapsible?: boolean | " +
    'CollapsibleConfig` prop. Rewrites `defaultIsExpanded` to the equivalent ' +
    'config (`{defaultIsOpen: true}`), and drops ' +
    '`defaultIsExpanded={false}`, which is the default. Banners that never ' +
    'set the prop are untouched — the default is unchanged. Pass ' +
    '`collapsible={false}` for content that is always visible.',
  pr: '#5255',
};

const OLD_PROP = 'defaultIsExpanded';
const NEW_PROP = 'collapsible';
const COMPONENT = 'Banner';

/**
 * Does this file use the core `Banner`?
 *
 * `defaultIsExpanded` is a ChatToolCalls prop too, and a local component may
 * well be called Banner, so an unqualified element-name match is not enough.
 *
 * @param {any} j
 * @param {any} root
 * @returns {boolean}
 */
function importsCoreBanner(j, root) {
  let found = false;
  root.find(j.ImportDeclaration).forEach((/** @type {any} */ path) => {
    const source = path.node.source?.value;
    if (typeof source !== 'string' || !source.startsWith('@astryxdesign/core')) {
      return;
    }
    for (const spec of path.node.specifiers ?? []) {
      if (
        (spec.type === 'ImportSpecifier' && spec.imported?.name === COMPONENT) ||
        (spec.local?.name === COMPONENT &&
          (spec.type === 'ImportDefaultSpecifier' ||
            spec.type === 'ImportSpecifier'))
      ) {
        found = true;
      }
    }
  });
  return found;
}

/**
 * @param {import('../../../../authoring/codemod/type').AstryxCodemodFile} file
 * @param {import('../../../../authoring/codemod/type').CodemodTransformApi} api
 * @returns {string | null | undefined}
 */
export default function transformer(file, api) {
  // Cheap bail-out: nothing to rename without the old prop.
  if (!file.source.includes(OLD_PROP)) {
    return undefined;
  }

  const j = api.jscodeshift;
  const root = j(file.source);

  if (!importsCoreBanner(j, root)) {
    return undefined;
  }

  let hasChanges = false;

  /** `collapsible={{defaultIsOpen: <expr>}}` */
  const collapsibleWithDefault = (/** @type {any} */ expression) =>
    j.jsxAttribute(
      j.jsxIdentifier(NEW_PROP),
      j.jsxExpressionContainer(
        j.objectExpression([
          j.objectProperty(j.identifier('defaultIsOpen'), expression),
        ]),
      ),
    );

  root.find(j.JSXOpeningElement).forEach((/** @type {any} */ path) => {
    const name = path.node.name;
    if (name?.type !== 'JSXIdentifier' || name.name !== COMPONENT) {
      return;
    }

    const attrs = path.node.attributes ?? [];
    const oldIndex = attrs.findIndex(
      (/** @type {any} */ a) =>
        a.type === 'JSXAttribute' && a.name?.name === OLD_PROP,
    );
    if (oldIndex === -1) {
      return;
    }

    // Already migrated by hand, or a spread that may carry either prop:
    // in both cases a rewrite would be guesswork.
    const hasNewProp = attrs.some(
      (/** @type {any} */ a) =>
        a.type === 'JSXAttribute' && a.name?.name === NEW_PROP,
    );
    const hasSpread = attrs.some(
      (/** @type {any} */ a) => a.type === 'JSXSpreadAttribute',
    );
    if (hasNewProp || hasSpread) {
      return;
    }

    const value = attrs[oldIndex].value;

    if (value == null) {
      // Bare `defaultIsExpanded` — starts open.
      attrs[oldIndex] = collapsibleWithDefault(j.booleanLiteral(true));
    } else if (value.type === 'JSXExpressionContainer') {
      const expression = value.expression;
      const isBooleanLiteral =
        expression.type === 'BooleanLiteral' ||
        (expression.type === 'Literal' && typeof expression.value === 'boolean');
      if (isBooleanLiteral && expression.value === false) {
        // Starting closed is the default now, so the prop simply goes.
        attrs.splice(oldIndex, 1);
      } else if (isBooleanLiteral) {
        attrs[oldIndex] = collapsibleWithDefault(j.booleanLiteral(true));
      } else {
        // A dynamic default stays dynamic.
        attrs[oldIndex] = collapsibleWithDefault(expression);
      }
    } else {
      // `defaultIsExpanded="something"` is not valid for a boolean prop;
      // leave it for a human rather than inventing a meaning.
      return;
    }

    hasChanges = true;
  });

  return hasChanges ? root.toSource({quote: 'single'}) : undefined;
}
