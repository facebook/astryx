// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file no-hardcoded-anchor.js
 * @description Disallow hardcoded `<a>` elements in Astryx core components.
 *
 * Components that render links should use `useLinkComponent()` to resolve
 * the link element, allowing consumers to swap in their framework's router
 * (Next.js Link, React Router Link, etc.) via `LinkProvider`.
 *
 * This rule catches `<a>` JSX elements and suggests using the link provider
 * pattern instead. It allows `<a>` in a few known cases:
 * - Test files (*.test.tsx)
 * - The Link infrastructure itself (Link.tsx, LinkProvider.tsx)
 * - In-page anchors (href starting with #)
 *
 * Bad:
 *   <a href={href} className={styles.link}>{children}</a>
 *
 * Good:
 *   const LinkComponent = useLinkComponent();
 *   <LinkComponent href={href} className={styles.link}>{children}</LinkComponent>
 */

const ALLOWED_FILES = [
  'Link.tsx',
  'LinkProvider.tsx',
  'LinkContext.ts',
  'useLinkComponent.ts',
  'types.ts',
];

const rule = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow hardcoded <a> elements — use useLinkComponent() for router integration',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      hardcodedAnchor:
        'Hardcoded <a> element. Use `useLinkComponent()` to resolve the link component, ' +
        'so consumers can swap in their framework router via LinkProvider. ' +
        'See: packages/core/src/Link/useLinkComponent.ts',
    },
    schema: [],
  },
  create(context) {
    const filename = context.filename;

    // Skip test files
    if (filename.includes('.test.') || filename.includes('.stories.')) {
      return {};
    }

    // Skip the Link infrastructure files themselves
    if (ALLOWED_FILES.some(f => filename.endsWith(f))) {
      return {};
    }

    return {
      JSXOpeningElement(node) {
        // Only flag <a> elements
        if (node.name?.type !== 'JSXIdentifier' || node.name.name !== 'a') {
          return;
        }

        // Allow in-page anchors (href="#..." or href={`#...`})
        const hrefAttr = node.attributes.find(
          attr =>
            attr.type === 'JSXAttribute' &&
            attr.name?.name === 'href' &&
            (
              // String literal: href="#section"
              (attr.value?.type === 'Literal' &&
                typeof attr.value.value === 'string' &&
                attr.value.value.startsWith('#')) ||
              // Expression: href={`#${id}`}
              (attr.value?.type === 'JSXExpressionContainer' &&
                attr.value.expression?.type === 'TemplateLiteral' &&
                attr.value.expression.quasis?.[0]?.value?.raw?.startsWith('#'))
            ),
        );
        if (hrefAttr) {
          return;
        }

        context.report({node, messageId: 'hardcodedAnchor'});
      },
    };
  },
};

export default rule;
