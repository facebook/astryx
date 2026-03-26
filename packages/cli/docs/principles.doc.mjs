/** @type {import('../../core/src/docs-types').ReferenceDoc} */

export const docs = {
  name: 'principles',
  title: 'XDS Principles',
  description: 'Design principles, rules, and anti-patterns for XDS.',

  sections: [
    {
      title: 'Rules',
      content: [
        {
          type: 'list',
          style: 'ordered',
          items: [
            'Use XDS components for everything they cover',
            'StyleX for styling (not inline styles)',
            'Semantic tokens, not hardcoded values',
            'CSS variables for colors, not hex',
            'Form inputs are controlled (value + onChange)',
          ],
        },
      ],
    },
    {
      title: 'Style Overrides: xstyle prop',
      content: [
        {
          type: 'prose',
          text: 'Most XDS components accept an xstyle prop for customizing styles. It supports three formats.',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'Inline styles',
          code: `<XDSTextInput label="Name" xstyle={{ maxWidth: 300 }} />
<XDSCard xstyle={{ height: 200, padding: 16 }} />`,
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'StyleX styles',
          code: `import * as stylex from '@stylexjs/stylex';
const overrides = stylex.create({
  hoverCard: {
    boxShadow: {
      default: 'none',
      ':hover': {'@media (hover: hover)': '0 4px 12px rgba(0,0,0,0.15)'},
    },
  },
});
<XDSCard xstyle={overrides.hoverCard} />;`,
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'CSS class name',
          code: `<XDSCard xstyle="my-custom-card" />
<XDSCard xstyle={styles.customCard} />  // CSS Module`,
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            '1-2 simple properties: use inline',
            '3+ properties, reusable, or named: use stylex.create',
            'Pseudo-classes (:hover, :focus-visible): use stylex.create (required)',
            'All :hover MUST use @media (hover: hover) guards',
          ],
        },
      ],
    },
    {
      title: 'Anti-Patterns',
      content: [
        {
          type: 'list',
          style: 'dont',
          items: [
            'Inline styles on raw elements. Use xstyle on XDS components',
            'Hardcoded colors (#fff). Use var(--color-*)',
            'Hardcoded spacing (16px). Use spacing tokens or var(--spacing-*)',
            'Inventing props. Read component docs first',
          ],
        },
      ],
    },
    {
      title: 'StyleX Usage',
      content: [
        {
          type: 'code',
          lang: 'tsx',
          label: 'Basic StyleX pattern',
          code: `import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  container: {
    padding: 'var(--spacing-4)',
    backgroundColor: 'var(--color-background-surface)',
    borderRadius: 'var(--radius-element)',
  },
});

<div {...stylex.props(styles.container)}>`,
        },
      ],
    },
    {
      title: 'Quick Token Reference',
      content: [
        {
          type: 'prose',
          text: 'See `xds docs tokens` for the full list. Key values:',
        },
        {
          type: 'table',
          headers: ['Category', 'Values'],
          rows: [
            ['Spacing', '0=0px | 0.5=2px | 1=4px | 2=8px | 3=12px | 4=16px | 5=20px | 6=24px | 7=32px'],
            ['Radius', 'rounded=pill | container=12px | element=8px | content=4px'],
            ['Colors', 'accent, surface, wash, positive, negative, warning'],
          ],
        },
      ],
    },
  ],
};
