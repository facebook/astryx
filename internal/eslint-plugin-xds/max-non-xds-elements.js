/**
 * @file max-non-xds-elements.js
 * @description ESLint rule limiting raw HTML elements in template files.
 *
 * Templates should use XDS components, not raw HTML. This rule counts
 * raw HTML JSX elements (div, span, button, etc.) and errors if the
 * count exceeds a configurable maximum (default: 3).
 *
 * Rationale: Templates are reference implementations. If a template
 * uses raw HTML, developers will copy that pattern. XDS components
 * provide tokens, accessibility, and responsive behavior for free.
 *
 * Options:
 *   max: number (default 3) — maximum raw HTML elements allowed per file
 *   allowedTags: string[] (default []) — tags that don't count toward the limit
 *
 * @example
 * ```
 * // eslint @xds/max-non-xds-elements: ["error", { max: 3 }]
 * ```
 */

// HTML tags that count as "non-XDS elements"
const HTML_TAGS = new Set([
  // Layout
  'div', 'span', 'section', 'article', 'aside', 'header', 'footer',
  'main', 'nav', 'figure', 'figcaption', 'details', 'summary',
  // Text
  'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'pre',
  'code', 'em', 'strong', 'small', 'sub', 'sup', 'mark', 'del', 'ins',
  'abbr', 'time', 'address',
  // Lists
  'ul', 'ol', 'li', 'dl', 'dt', 'dd',
  // Tables
  'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption', 'colgroup', 'col',
  // Forms
  'form', 'input', 'textarea', 'select', 'option', 'optgroup',
  'button', 'label', 'fieldset', 'legend', 'output', 'datalist',
  // Media
  'img', 'picture', 'source', 'video', 'audio', 'canvas',
  'iframe', 'embed', 'object',
  // SVG
  'svg', 'path', 'circle', 'rect', 'line', 'polyline', 'polygon',
  'ellipse', 'g', 'defs', 'clipPath', 'mask', 'use', 'text',
  'tspan', 'image', 'foreignObject', 'linearGradient', 'radialGradient', 'stop',
  // Interactive
  'a', 'dialog', 'menu',
  // Other
  'hr', 'br', 'wbr',
]);

const rule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Limit raw HTML elements in template files — prefer XDS components',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      tooManyHtmlElements:
        'Template uses {{count}} raw HTML elements (max {{max}}). ' +
        'Found: {{tags}}. Use XDS components instead (XDSVStack, XDSCard, XDSText, etc.).',
    },
    schema: [
      {
        type: 'object',
        properties: {
          max: { type: 'number', minimum: 0 },
          allowedTags: {
            type: 'array',
            items: { type: 'string' },
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    const options = context.options[0] || {};
    const max = options.max ?? 3;
    const allowedTags = new Set(options.allowedTags || []);

    // Track occurrences per file
    const htmlElements = []; // { node, tag }

    return {
      JSXOpeningElement(node) {
        // Get the element name
        const name = node.name;
        let tagName;

        if (name.type === 'JSXIdentifier') {
          tagName = name.name;
        } else {
          // JSXMemberExpression (e.g. motion.div) or JSXNamespacedName — skip
          return;
        }

        // Only count lowercase tags (HTML intrinsic elements)
        // React components are PascalCase, so this naturally excludes them
        if (tagName[0] !== tagName[0].toLowerCase()) {
          return;
        }

        // Check if it's a known HTML tag
        if (!HTML_TAGS.has(tagName)) {
          return;
        }

        // Check if it's in the allow list
        if (allowedTags.has(tagName)) {
          return;
        }

        htmlElements.push({ node, tag: tagName });
      },

      'Program:exit'() {
        if (htmlElements.length > max) {
          // Count unique tags for the message
          const tagCounts = {};
          for (const { tag } of htmlElements) {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          }
          const tagSummary = Object.entries(tagCounts)
            .sort((a, b) => b[1] - a[1])
            .map(([tag, count]) => `<${tag}> ×${count}`)
            .join(', ');

          // Report on the first element over the limit
          context.report({
            node: htmlElements[max].node,
            messageId: 'tooManyHtmlElements',
            data: {
              count: String(htmlElements.length),
              max: String(max),
              tags: tagSummary,
            },
          });
        }
      },
    };
  },
};

export default rule;
