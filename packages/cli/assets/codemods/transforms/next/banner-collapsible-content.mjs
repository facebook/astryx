// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Codemod: migrate Banner's collapse axis onto the `collapsible` prop
 *
 * Banner used to infer the disclosure from its content: any `children` got a
 * chevron and were hidden until it was pressed, and `defaultIsExpanded` was
 * the only knob. There was no way to show content without a toggle, and no
 * controlled mode.
 *
 * The axis now lives on one `boolean | CollapsibleConfig` prop, per the
 * boolean-or-config convention:
 *
 *   <Banner>{children}</Banner>                      → always visible, no toggle
 *   <Banner collapsible>                             → collapsible, starts open
 *   <Banner collapsible={{defaultIsOpen: false}}>    → collapsible, starts closed
 *   <Banner collapsible={{isOpen, onOpenChange}}>    → controlled
 *
 * That inverts the default, so a banner with children that is left alone
 * changes behaviour rather than breaking the build — which is exactly the
 * silent kind of change a codemod has to cover. The rewrites are:
 *
 *   defaultIsExpanded            → collapsible
 *   defaultIsExpanded={true}     → collapsible
 *   defaultIsExpanded={false}    → collapsible={{defaultIsOpen: false}}
 *   defaultIsExpanded={expr}     → collapsible={{defaultIsOpen: expr}}
 *   (children, no prop)          → collapsible={{defaultIsOpen: false}}
 *
 * The last one is the behaviour-preserving rewrite for the implicit case. It
 * is also the one worth a second look: most of those banners probably want
 * their content simply visible now. The transform does not editorialize in the
 * output — the nudge belongs in the changelog and the transform title, not as
 * a TODO comment in every migrated file.
 *
 * Only elements named `Banner` are touched, and only when the file imports
 * that name from `@astryxdesign/core`: `defaultIsExpanded` is also a
 * ChatToolCalls prop, which this migration must leave alone.
 */

export const meta = {
  title:
    "Migrate Banner's collapse axis onto `collapsible` (content is visible " +
    'by default now — review the banners this marks as collapsed)',
  description:
    'Banner children are now visible by default instead of hidden behind a ' +
    'chevron, and `defaultIsExpanded` is replaced by ' +
    '`collapsible?: boolean | CollapsibleConfig`. Rewrites ' +
    '`defaultIsExpanded` to the equivalent `collapsible` config, and adds ' +
    '`collapsible={{defaultIsOpen: false}}` to banners that relied on the ' +
    'implicit collapse, so behaviour is preserved. Those are the ones worth ' +
    'a second look: always-visible content is usually what they want.',
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
 * Whether a JSX element renders anything as children.
 *
 * Mirrors the component's own `isRenderable`, which is what decided whether
 * the old Banner drew a chevron: whitespace-only text, `{false}`, `{null}`,
 * `{undefined}` and `{''}` are all empty slots, and a banner holding one of
 * those was never collapsible in the first place — adding `collapsible` to it
 * would invent an affordance rather than preserve one.
 *
 * @param {any} elementNode
 * @returns {boolean}
 */
function hasJsxChildren(elementNode) {
  if (elementNode?.type !== 'JSXElement') {
    return false;
  }
  return (elementNode.children ?? []).some((/** @type {any} */ child) => {
    if (child.type === 'JSXText') {
      return child.value.trim() !== '';
    }
    if (child.type !== 'JSXExpressionContainer') {
      return true;
    }
    const expression = child.expression;
    if (expression == null || expression.type === 'JSXEmptyExpression') {
      return false;
    }
    if (
      expression.type === 'BooleanLiteral' ||
      expression.type === 'NullLiteral'
    ) {
      return false;
    }
    if (expression.type === 'Identifier' && expression.name === 'undefined') {
      return false;
    }
    if (expression.type === 'StringLiteral' && expression.value === '') {
      return false;
    }
    // Older parsers surface all of those as `Literal`.
    if (expression.type === 'Literal') {
      return expression.value !== null && expression.value !== '' &&
        typeof expression.value !== 'boolean';
    }
    // Anything dynamic may render — assume it does.
    return true;
  });
}

/**
 * @param {import('../../../../authoring/codemod/type').AstryxCodemodFile} file
 * @param {import('../../../../authoring/codemod/type').CodemodTransformApi} api
 * @returns {string | null | undefined}
 */
export default function transformer(file, api) {
  // Cheap bail-out: a file with no Banner in it cannot need this.
  if (!file.source.includes(COMPONENT)) {
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

    // A spread may carry either prop; rewriting around it would be guesswork.
    const hasSpread = attrs.some(
      (/** @type {any} */ a) => a.type === 'JSXSpreadAttribute',
    );
    // Already migrated by hand.
    const hasNewProp = attrs.some(
      (/** @type {any} */ a) =>
        a.type === 'JSXAttribute' && a.name?.name === NEW_PROP,
    );
    if (hasSpread || hasNewProp) {
      return;
    }

    const oldIndex = attrs.findIndex(
      (/** @type {any} */ a) =>
        a.type === 'JSXAttribute' && a.name?.name === OLD_PROP,
    );

    if (oldIndex !== -1) {
      const value = attrs[oldIndex].value;

      if (value == null) {
        // Bare `defaultIsExpanded` — collapsible, open.
        attrs[oldIndex] = j.jsxAttribute(j.jsxIdentifier(NEW_PROP));
      } else if (value.type === 'JSXExpressionContainer') {
        const expression = value.expression;
        const isLiteral =
          expression.type === 'BooleanLiteral' ||
          (expression.type === 'Literal' && typeof expression.value === 'boolean');
        if (isLiteral && expression.value === true) {
          attrs[oldIndex] = j.jsxAttribute(j.jsxIdentifier(NEW_PROP));
        } else if (isLiteral) {
          attrs[oldIndex] = collapsibleWithDefault(j.booleanLiteral(false));
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
      return;
    }

    // No `defaultIsExpanded`. Only a banner that actually had children was
    // implicitly collapsible.
    if (!hasJsxChildren(path.parent.node)) {
      return;
    }

    attrs.push(collapsibleWithDefault(j.booleanLiteral(false)));
    hasChanges = true;
  });

  return hasChanges ? root.toSource({quote: 'single'}) : undefined;
}
