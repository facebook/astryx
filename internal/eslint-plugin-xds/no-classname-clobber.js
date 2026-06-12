// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file no-classname-clobber.js
 * @description Disallow `className` or `style` alongside `{...stylex.props()}` on JSX elements.
 *
 * `stylex.props()` returns `{ className, style }`. When a JSX element has an
 * explicit `className` or `style` attribute alongside a spread, one silently
 * clobbers the other — whichever appears last in source wins.
 *
 * Fix: Use `mergeProps(xdsProps(...), stylex.props(...), className, style)`
 * which concatenates class names, preserves reflected data attributes, and
 * merges style objects correctly.
 *
 * Bad:
 *   <div className={xdsClassName('foo')} {...stylex.props(styles.root)} />
 *   <div style={dynamicStyle} {...stylex.props(styles.root)} />
 *   <div {...stylex.props(styles.root)} style={dynamicStyle} />
 *
 * Good:
 *   <div {...mergeProps(xdsProps('foo'), stylex.props(styles.root))} />
 *   <div {...mergeProps(xdsProps('foo'), stylex.props(styles.root), undefined, dynamicStyle)} />
 */

const rule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow className/style alongside {...stylex.props()} — use mergeProps() instead',
      category: 'Possible Errors',
      recommended: true,
    },
    messages: {
      classNameClobber:
        'className is clobbered by {...stylex.props()}. ' +
        'Use mergeProps(xdsProps(...), stylex.props(...)) to merge them correctly.',
      styleClobber:
        'style and {...stylex.props()} clobber each other. ' +
        'Use mergeProps(xdsProps(...), stylex.props(...), undefined, style) to merge them correctly.',
    },
    schema: [],
  },
  create(context) {
    return {
      JSXOpeningElement(node) {
        const attrs = node.attributes;

        let hasClassName = false;
        let hasStyle = false;
        let hasStylexSpread = false;

        for (const attr of attrs) {
          if (attr.type === 'JSXAttribute') {
            if (attr.name?.name === 'className') {
              hasClassName = true;
            }
            if (attr.name?.name === 'style') {
              hasStyle = true;
            }
          }

          // Check for {...stylex.props(...)}
          if (
            attr.type === 'JSXSpreadAttribute' &&
            attr.argument?.type === 'CallExpression' &&
            attr.argument.callee?.type === 'MemberExpression' &&
            attr.argument.callee.object?.name === 'stylex' &&
            attr.argument.callee.property?.name === 'props'
          ) {
            hasStylexSpread = true;
          }
        }

        if (hasStylexSpread) {
          if (hasClassName) {
            context.report({node, messageId: 'classNameClobber'});
          }
          if (hasStyle) {
            context.report({node, messageId: 'styleClobber'});
          }
        }
      },
    };
  },
};

export default rule;
