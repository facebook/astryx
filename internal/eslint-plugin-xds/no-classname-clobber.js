/**
 * @file no-classname-clobber.js
 * @description Disallow `className` or `style` alongside `{...stylex.props()}` on JSX elements.
 *
 * `stylex.props()` returns `{ className, style }`. When a JSX element has an
 * explicit `className` or `style` attribute alongside a spread, one silently
 * clobbers the other — whichever appears last in source wins.
 *
 * className: Always flagged regardless of order. The xdsClassName() class or
 * the StyleX class is always lost — there's no valid reason to have both.
 *
 * style: Only flagged when it appears BEFORE the spread (definitely clobbered).
 * style AFTER the spread is a common pattern for dynamic values (width,
 * maxHeight, transform) that works when the StyleX styles are all static.
 *
 * Fix: Use `mergeProps(xdsClassName(...), stylex.props(...), className, style)`
 * which concatenates class names and merges style objects correctly.
 *
 * Bad:
 *   <div className={xdsClassName('foo')} {...stylex.props(styles.root)} />
 *   <div style={dynamicStyle} {...stylex.props(styles.root)} />
 *
 * Good:
 *   <div {...mergeProps(xdsClassName('foo'), stylex.props(styles.root))} />
 *   <div {...mergeProps(xdsClassName('foo'), stylex.props(styles.root), undefined, dynamicStyle)} />
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
        'Use mergeProps(xdsClassName(...), stylex.props(...)) to merge them correctly.',
      styleClobber:
        'style is clobbered by {...stylex.props()} that follows it. ' +
        'Use mergeProps(xdsClassName(...), stylex.props(...), undefined, style) to merge them correctly.',
    },
    schema: [],
  },
  create(context) {
    return {
      JSXOpeningElement(node) {
        const attrs = node.attributes;

        // Collect positions of relevant attributes
        let hasClassName = false;
        let stylexSpreadIndex = -1;
        const styleIndices = [];

        for (let i = 0; i < attrs.length; i++) {
          const attr = attrs[i];

          if (attr.type === 'JSXAttribute') {
            if (attr.name?.name === 'className') {
              hasClassName = true;
            }
            if (attr.name?.name === 'style') {
              styleIndices.push(i);
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
            stylexSpreadIndex = i;
          }
        }

        if (stylexSpreadIndex === -1) return;

        // className + stylex.props is always a bug regardless of order
        if (hasClassName) {
          context.report({ node, messageId: 'classNameClobber' });
        }

        // style before stylex.props is clobbered — flag it
        for (const idx of styleIndices) {
          if (idx < stylexSpreadIndex) {
            context.report({ node, messageId: 'styleClobber' });
          }
        }
      },
    };
  },
};

export default rule;
