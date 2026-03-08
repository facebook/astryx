/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Text',
  description:
    'Typography components for the XDS design system, including semantic body text, headings, and a wrapper for applying typography styles to native HTML.',
  examples: [
    {
      label: 'Body text',
      code: '<XDSText type="body">Body text content.</XDSText>',
    },
    {
      label: 'Supporting text',
      code: '<XDSText type="supporting">Helper text beneath a field.</XDSText>',
    },
    {
      label: 'Heading',
      code: '<XDSHeading level={1}>Page Title</XDSHeading>',
    },
    {
      label: 'Editorial heading',
      code: '<XDSHeading level={1} variant="editorial">Article Title</XDSHeading>',
    },
    {
      label: 'Truncated text with tooltip',
      code: '<XDSText type="body" maxLines={2}>Very long text that will be clamped after two lines and show a tooltip on hover.</XDSText>',
    },
    {
      label: 'Font wrapper for native HTML',
      code: `<XDSFontWrapper variant="editorial">
  <article dangerouslySetInnerHTML={{__html: markdownContent}} />
</XDSFontWrapper>`,
    },
  ],
  features: [
    'Semantic text types (body, large, label, supporting, code) driven by theme tokens',
    'Headings use native h1–h6 elements with optional aria-level override for decoupled visual vs document hierarchy',
    'Line-clamp truncation with automatic overflow-detecting tooltip',
    'Optical alignment (text-box-trim / capsize) for precise vertical rhythm',
    'XDSFontWrapper applies typography styles to native HTML — useful for user-generated content and markdown output',
    'useXDSFontWrapperStyles hook for programmatic StyleX access to heading and prose styles',
    'Tabular number support for aligned numeric data',
    'All typography driven by CSS custom properties — fully themeable per-component',
  ],
  theming: {
    targets: [
      {className: 'xds-heading', visualProps: ['level', 'variant']},
      {className: 'xds-text', visualProps: ['type']},
    ],
  },
  accessibility: [
    'XDSHeading renders the correct semantic h1–h6 element based on the `level` prop.',
    'When `accessibilityLevel` differs from `level`, `aria-level` is set so screen readers announce the correct document outline position while preserving the visual style.',
    'Truncated text sets a native `title` attribute as a fallback, and also lazily renders an XDSTooltip for sighted keyboard users.',
  ],
  components: [
    {
      name: 'XDSText',
      description:
        'Semantic body text component that renders text with type-based styling from the theme, with optional truncation, decoration, and layout props.',
      examples: [
        {
          label: 'Basic',
          code: '<XDSText type="body">Body text</XDSText>',
        },
        {
          label: 'All types',
          code: `<XDSText type="body">Body</XDSText>
<XDSText type="large">Large body</XDSText>
<XDSText type="label">Label</XDSText>
<XDSText type="supporting">Supporting</XDSText>
<XDSText type="code">{'const x = 1;'}</XDSText>`,
        },
        {
          label: 'Truncation',
          code: '<XDSText type="body" maxLines={2}>Clamped to two lines with a tooltip on hover.</XDSText>',
        },
        {
          label: 'Styled text',
          code: '<XDSText type="body" color="secondary" weight="bold" hasTabularNumbers>42,000</XDSText>',
        },
        {
          label: 'Block with strikethrough',
          code: '<XDSText type="body" display="block" hasStrikethrough>Deprecated item</XDSText>',
        },
      ],
      props: [
        {
          name: 'type',
          type: "'body' | 'large' | 'label' | 'supporting' | 'code'",
          description:
            'Semantic text type. Determines size, weight, and line-height from the theme.',
          required: true,
        },
        {
          name: 'children',
          type: 'ReactNode',
          description: 'Text content.',
          required: true,
        },
        {
          name: 'size',
          type: "'4xs' | '3xs' | '2xs' | 'xsm' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl'",
          description:
            'Explicit font size override. Overrides the size from `type` but preserves other type properties. Prefer using `type` alone.',
        },
        {
          name: 'color',
          type: "'primary' | 'secondary' | 'disabled' | 'placeholder' | 'active' | 'inherit'",
          description:
            "Text color. Defaults to 'secondary' for the 'supporting' type, 'primary' for all others.",
        },
        {
          name: 'weight',
          type: "'normal' | 'medium' | 'semibold' | 'bold'",
          description: 'Font weight override.',
        },
        {
          name: 'display',
          type: "'inline' | 'block'",
          description:
            "Display type. Silently overridden to 'block' when maxLines > 0 or hasCapsize is true.",
          default: "'inline'",
        },
        {
          name: 'as',
          type: "'span' | 'p' | 'div' | 'label'",
          description: 'HTML element to render.',
          default: "'span'",
        },
        {
          name: 'maxLines',
          type: 'number',
          description:
            'Maximum lines before truncation. 0 means no truncation. When set, shows a tooltip on hover if content is truncated.',
          default: '0',
        },
        {
          name: 'hasTruncateTooltip',
          type: 'boolean | LayerPlacement',
          description:
            'Controls tooltip behavior for truncated text. true shows the tooltip at the default position, false disables it, or a LayerPlacement string sets a specific position.',
          default: 'true',
        },
        {
          name: 'wordBreak',
          type: "'break-word' | 'break-all'",
          description:
            "Word break behavior when truncating. Defaults to 'break-all' for single-line truncation, 'break-word' otherwise.",
        },
        {
          name: 'textWrap',
          type: "'wrap' | 'nowrap' | 'balance' | 'pretty'",
          description: 'Text wrapping behavior.',
        },
        {
          name: 'hasCapsize',
          type: 'boolean',
          description:
            'Enable optical alignment using text-box-trim. Forces block display.',
          default: 'false',
        },
        {
          name: 'hasStrikethrough',
          type: 'boolean',
          description: 'Apply strikethrough text decoration.',
          default: 'false',
        },
        {
          name: 'hasTabularNumbers',
          type: 'boolean',
          description:
            'Use tabular (monospace) numbers for aligned numeric data.',
          default: 'false',
        },
        {
          name: 'id',
          type: 'string',
          description: 'HTML id attribute.',
        },
      ],
    },
    {
      name: 'XDSHeading',
      description:
        'Semantic heading component that renders h1–h6 elements with themed styling, optional editorial scale, and line-clamp truncation.',
      examples: [
        {
          label: 'Basic',
          code: '<XDSHeading level={1}>Page Title</XDSHeading>',
        },
        {
          label: 'Editorial scale',
          code: '<XDSHeading level={1} variant="editorial">Article Title</XDSHeading>',
        },
        {
          label: 'Accessibility level override',
          code: '<XDSHeading level={2} accessibilityLevel={3}>Sidebar Section</XDSHeading>',
        },
        {
          label: 'Truncated heading',
          code: '<XDSHeading level={2} maxLines={1}>Very Long Section Title That Gets Clipped</XDSHeading>',
        },
        {
          label: 'Muted heading',
          code: '<XDSHeading level={3} color="secondary">Muted Heading</XDSHeading>',
        },
      ],
      props: [
        {
          name: 'level',
          type: '1 | 2 | 3 | 4 | 5 | 6',
          description:
            'Visual heading level. Determines both the HTML element (h1–h6) and the styling from the theme.',
          required: true,
        },
        {
          name: 'children',
          type: 'ReactNode',
          description: 'Heading content.',
          required: true,
        },
        {
          name: 'accessibilityLevel',
          type: '1 | 2 | 3 | 4 | 5 | 6',
          description:
            'Accessibility level override. When set and different from `level`, applies `aria-level` so the document outline differs from the visual style.',
        },
        {
          name: 'variant',
          type: "'default' | 'editorial'",
          description:
            "Visual variant. 'default' uses a dense scale for internal tools (h1: 20px); 'editorial' uses a larger scale for content-heavy pages (h1: 32px).",
          default: "'default'",
        },
        {
          name: 'color',
          type: "'primary' | 'secondary' | 'disabled' | 'placeholder' | 'active' | 'inherit'",
          description: 'Text color.',
          default: "'primary'",
        },
        {
          name: 'display',
          type: "'inline' | 'block'",
          description:
            "Display type. Silently overridden to 'block' when maxLines > 0 or hasCapsize is true.",
          default: "'block'",
        },
        {
          name: 'maxLines',
          type: 'number',
          description:
            'Maximum lines before truncation. 0 means no truncation. When set, shows a tooltip on hover if content is truncated.',
          default: '0',
        },
        {
          name: 'hasTruncateTooltip',
          type: 'boolean | LayerPlacement',
          description:
            'Controls tooltip behavior for truncated text. true shows the tooltip at the default position, false disables it, or a LayerPlacement string sets a specific position.',
          default: 'true',
        },
        {
          name: 'wordBreak',
          type: "'break-word' | 'break-all'",
          description:
            "Word break behavior when truncating. Defaults to 'break-all' for single-line truncation, 'break-word' otherwise.",
        },
        {
          name: 'textWrap',
          type: "'wrap' | 'nowrap' | 'balance' | 'pretty'",
          description: 'Text wrapping behavior.',
        },
        {
          name: 'hasCapsize',
          type: 'boolean',
          description:
            'Enable optical alignment using text-box-trim. Forces block display.',
          default: 'false',
        },
        {
          name: 'hasStrikethrough',
          type: 'boolean',
          description: 'Apply strikethrough text decoration.',
          default: 'false',
        },
        {
          name: 'id',
          type: 'string',
          description: 'HTML id attribute.',
        },
      ],
    },
    {
      name: 'XDSFontWrapper',
      description:
        'Wrapper that applies XDS typography styles to native HTML elements within its scope. Useful for user-generated content, markdown output, and other scenarios where XDSText and XDSHeading cannot be used directly.',
      examples: [
        {
          label: 'Default variant',
          code: `<XDSFontWrapper>
  <h1>Page Title</h1>
  <p>Body text with <strong>bold</strong> and <em>italic</em>.</p>
  <ul>
    <li>List item 1</li>
    <li>List item 2</li>
  </ul>
</XDSFontWrapper>`,
        },
        {
          label: 'Editorial variant',
          code: `<XDSFontWrapper variant="editorial">
  <article dangerouslySetInnerHTML={{__html: markdownContent}} />
</XDSFontWrapper>`,
        },
      ],
      props: [
        {
          name: 'children',
          type: 'ReactNode',
          description: 'Content to style with XDS typography.',
          required: true,
        },
        {
          name: 'variant',
          type: "'default' | 'editorial'",
          description:
            "Heading scale variant. 'default' uses a dense scale for internal tools; 'editorial' uses a larger scale for content-heavy pages.",
          default: "'default'",
        },
      ],
    },
    {
      name: 'useXDSFontWrapperStyles',
      description:
        'Hook that returns StyleX style objects from the current theme for headings and prose elements, for use when applying typography styles to native HTML programmatically.',
      examples: [
        {
          label: 'Basic usage',
          code: `import {useXDSFontWrapperStyles} from '@xds/core';
import * as stylex from '@stylexjs/stylex';

function Article() {
  const {headingStyles, proseStyles} = useXDSFontWrapperStyles();

  return (
    <article>
      <h1 {...stylex.props(headingStyles?.h1)}>Title</h1>
      <p {...stylex.props(proseStyles?.p)}>Content...</p>
    </article>
  );
}`,
        },
      ],
      props: [],
    },
  ],
};
