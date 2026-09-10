// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file no-classname-clobber.js
 * @description Disallow two things on one JSX element that each set
 * `className`, since the later one silently replaces the earlier.
 *
 * React applies attributes left to right, so a `className` written twice on an
 * element is not merged — the last writer wins and everything the first one
 * carried is gone. There are two ways to write it twice:
 *
 * 1. A literal `className=` (or `style=`) attribute beside a
 *    `{...stylex.props()}` spread.
 * 2. TWO SPREADS that each carry a `className`. Every one of these returns a
 *    `{className, style}` object: `stylex.props()`, `themeProps()`,
 *    `focusOutlineProps.*()`, and `mergeProps()` when it merges one of those.
 *
 * The second shape is the one that hides. Breadcrumbs shipped it:
 *
 *   <button
 *     {...mergeProps(themeProps('breadcrumb-item-menu-trigger'), {...trigger})}
 *     {...stylex.props(itemStyles.link)}
 *   />
 *
 * Both halves read as correct, and `mergeProps` on the first line reads as if
 * the merging is handled. It is not: the second spread replaces the className
 * the first built, so `astryx-breadcrumb-item-menu-trigger` — documented,
 * registered, part of the public theming surface — rendered on no element at
 * all, and a theme targeting it did nothing.
 *
 * Nothing else caught it. `themingTargets.test.ts` asserts documented targets
 * are a SUBSET of what source registers, so a target that renders on zero
 * elements passes.
 *
 * `mergeProps` is the sanctioned merge and concatenates class names, so
 * anything already inside a single `mergeProps()` call is correct. The rule
 * fires only when two SEPARATE spreads each independently carry one.
 *
 * Bad:
 *   <div className={themeProps('foo').className} {...stylex.props(styles.root)} />
 *   <div style={dynamicStyle} {...stylex.props(styles.root)} />
 *   <div {...themeProps('foo')} {...stylex.props(styles.root)} />
 *   <div {...mergeProps(themeProps('foo'), rest)} {...stylex.props(styles.root)} />
 *
 * Good:
 *   <div {...mergeProps(themeProps('foo'), stylex.props(styles.root))} />
 *   <div {...mergeProps(themeProps('foo'), stylex.props(styles.root), className, style)} />
 *   <div {...rest} {...stylex.props(styles.root)} />
 */

/**
 * Bare-identifier calls that return a `{className}` object.
 *
 * `xdsClassName`/`xdsThemeProps` are the pre-rename spellings of
 * `themeProps`. No call site uses them today; they stay listed so a
 * re-introduction is caught rather than waved through.
 */
const THEME_PROP_CALLS = new Set([
  'themeProps',
  'xdsThemeProps',
  'xdsClassName',
]);

/** The object whose every method returns `stylex.props(...)`. */
const CLASSNAME_NAMESPACES = new Set(['focusOutlineProps']);

/** Strip TS-only wrappers so `stylex.props(x) as never` still reads as a call. */
function unwrap(node) {
  let current = node;
  while (
    current &&
    (current.type === 'TSAsExpression' ||
      current.type === 'TSSatisfiesExpression' ||
      current.type === 'TSNonNullExpression')
  ) {
    current = current.expression;
  }
  return current;
}

/**
 * Name this expression if it produces a className, else null.
 *
 * The returned string is the short form used in the report, not source text:
 * a spread's real source runs to several lines and reads badly in a message.
 */
function classNameProducer(node) {
  const expr = unwrap(node);
  if (!expr || expr.type !== 'CallExpression') return null;

  const callee = expr.callee;

  if (callee.type === 'Identifier') {
    if (THEME_PROP_CALLS.has(callee.name)) return `${callee.name}()`;
    // mergeProps only carries a className if something it merges has one.
    if (callee.name === 'mergeProps') {
      return expr.arguments.some(arg => classNameProducer(arg) !== null)
        ? 'mergeProps()'
        : null;
    }
    return null;
  }

  if (callee.type === 'MemberExpression' && !callee.computed) {
    const object = callee.object?.name;
    const property = callee.property?.name;
    if (object === 'stylex' && property === 'props') return 'stylex.props()';
    if (CLASSNAME_NAMESPACES.has(object)) return `${object}.${property}()`;
  }

  return null;
}

const rule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow two className sources on one JSX element — use mergeProps() instead',
      category: 'Possible Errors',
      recommended: true,
    },
    messages: {
      classNameClobber:
        'className is clobbered by {...stylex.props()}. ' +
        'Use mergeProps(themeProps(...), stylex.props(...)) to merge them correctly.',
      styleClobber:
        'style and {...stylex.props()} clobber each other. ' +
        'Use mergeProps(themeProps(...), stylex.props(...), undefined, style) to merge them correctly.',
      spreadClassNameClobber:
        '{{later}} and {{earlier}} are separate spreads that each set className, so {{later}} replaces the one {{earlier}} built and its classes never reach the DOM. ' +
        'Pass both through a single mergeProps() call.',
    },
    schema: [],
  },
  create(context) {
    return {
      JSXOpeningElement(node) {
        let hasClassName = false;
        let hasStyle = false;
        /** Every spread on this element that independently sets className. */
        const producers = [];

        for (const attr of node.attributes) {
          if (attr.type === 'JSXAttribute') {
            if (attr.name?.name === 'className') hasClassName = true;
            if (attr.name?.name === 'style') hasStyle = true;
            continue;
          }

          if (attr.type === 'JSXSpreadAttribute') {
            const producer = classNameProducer(attr.argument);
            if (producer) producers.push({attr, producer});
          }
        }

        // Original shape: a literal attribute beside a stylex.props() spread.
        // Reported against stylex.props() only — it is the one whose class
        // names a literal className displaces, and widening this half would
        // re-report every element the spread-versus-spread check already
        // covers.
        const stylexSpread = producers.find(
          ({producer}) => producer === 'stylex.props()',
        );
        if (stylexSpread) {
          if (hasClassName) {
            context.report({node, messageId: 'classNameClobber'});
          }
          if (hasStyle) {
            context.report({node, messageId: 'styleClobber'});
          }
        }

        // One report per element rather than one per extra spread: the fix is
        // a single rewrite of the whole attribute list either way.
        if (producers.length > 1) {
          const [earlier, later] = producers;
          context.report({
            node: later.attr,
            messageId: 'spreadClassNameClobber',
            data: {earlier: earlier.producer, later: later.producer},
          });
        }
      },
    };
  },
};

export default rule;
export {classNameProducer};
