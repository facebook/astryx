// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file no-raw-paragraph.js
 * @description Disallow Astryx components from rendering a `<p>` by default.
 *
 * `<p>` is phrasing-content-only in HTML: it cannot legally contain
 * block-level children (`<div>`, layers, popovers, images-as-blocks, etc.).
 * When a block element ends up inside a `<p>`, the HTML parser silently
 * reparents it and closes the `<p>` early. Server-rendered markup and the
 * browser-parsed DOM then disagree, producing React hydration mismatches.
 *
 * Astryx components accept arbitrary `ReactNode` content into their slots, so
 * any component that emits a `<p>` can be handed block content and break. The
 * enforceable fix on our side: Astryx's own components never emit a `<p>` by
 * default. They render `<div>` (styled to preserve appearance) instead, which
 * can contain anything. Consumers who genuinely want paragraph semantics opt
 * in explicitly (a raw `<p>` they own, or a component override such as
 * Markdown's `components={{paragraph: 'p'}}`), and they own the composition
 * consequences.
 *
 * This rule flags two patterns in Astryx source:
 *   1. A raw `<p>` JSX element.
 *   2. An element-type prop whose DEFAULT resolves to `'p'`, e.g.
 *      `as: Component = 'p'` or `const Tag = as ?? 'p'`.
 *
 * It does NOT forbid `'p'` as an opt-in value (e.g. `as="p"` passed by a
 * consumer, or `'p'` appearing in an `as?: ... | 'p' | ...` union type) — only
 * Astryx defaulting to `<p>` on its own.
 *
 * Bad:
 *   <p {...stylex.props(styles.description)}>{description}</p>
 *   function Text({as: Component = 'p'}) { ... }
 *
 * Good:
 *   <div {...stylex.props(styles.description)}>{description}</div>
 *   function Text({as: Component = 'div'}) { ... }   // 'p' still allowed via prop
 */

const rule = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow Astryx components from rendering a <p> by default — render <div> so any content composes without hydration mismatches',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      rawParagraph:
        'Astryx components must not render a <p> by default. <p> cannot contain ' +
        'block-level children, so block content nested inside it triggers React ' +
        'hydration mismatches. Render <div> instead (style margin/line-height to ' +
        'preserve appearance). Consumers who want paragraph semantics can opt in.',
      defaultParagraph:
        'Element-type prop defaults to "p". Astryx components must not default to ' +
        'rendering a <p> (it cannot contain block children — see hydration mismatch). ' +
        'Default to "div" and keep "p" as an opt-in value consumers can pass.',
    },
    schema: [],
  },
  create(context) {
    const filename = context.filename;

    // Skip non-source files.
    if (filename.includes('.test.') || filename.includes('.stories.')) {
      return {};
    }

    /**
     * Is this assignment pattern an element-type prop (`as` / `component`)
     * that defaults to the literal 'p'?
     */
    function isElementTypeDefaultToP(pattern) {
      if (pattern.type !== 'AssignmentPattern') {
        return false;
      }
      // Default value must be the string literal 'p'.
      const right = pattern.right;
      if (right?.type !== 'Literal' || right.value !== 'p') {
        return false;
      }
      // Left side names an element-type prop. Covers both:
      //   {as = 'p'}            -> Identifier 'as'
      //   {as: Component = 'p'} -> handled at the Property level (see below)
      const left = pattern.left;
      if (left?.type === 'Identifier') {
        return /^(as|component|tag|element)$/i.test(left.name);
      }
      return false;
    }

    return {
      JSXOpeningElement(node) {
        if (node.name?.type === 'JSXIdentifier' && node.name.name === 'p') {
          context.report({node, messageId: 'rawParagraph'});
        }
      },

      // `{as = 'p'}` — shorthand destructured prop with default.
      AssignmentPattern(node) {
        if (isElementTypeDefaultToP(node)) {
          context.report({node, messageId: 'defaultParagraph'});
        }
      },

      // `{as: Component = 'p'}` — renamed destructured prop with default.
      Property(node) {
        if (
          node.value?.type === 'AssignmentPattern' &&
          node.value.right?.type === 'Literal' &&
          node.value.right.value === 'p'
        ) {
          const key = node.key;
          const keyName =
            key?.type === 'Identifier'
              ? key.name
              : key?.type === 'Literal'
                ? String(key.value)
                : '';
          if (/^(as|component|tag|element)$/i.test(keyName)) {
            context.report({
              node: node.value.right,
              messageId: 'defaultParagraph',
            });
          }
        }
      },

      // `const Tag = as ?? 'p'` / `as || 'p'` — defaulting via fallback expr.
      LogicalExpression(node) {
        if (
          (node.operator === '??' || node.operator === '||') &&
          node.right?.type === 'Literal' &&
          node.right.value === 'p' &&
          node.left?.type === 'Identifier' &&
          /^(as|component|tag|element)$/i.test(node.left.name)
        ) {
          context.report({node: node.right, messageId: 'defaultParagraph'});
        }
      },
    };
  },
};

export default rule;
