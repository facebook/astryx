/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Center',
  description: 'Centers children horizontally and/or vertically using flexbox.',
  features: [
    'Supports centering on both axes, horizontal only, or vertical only',
    'Inline-flex mode for centering inline content such as text and icons',
    'Accepts explicit width and height to size the container',
  ],
  examples: [
    {
      label: 'Center both axes (default)',
      code: `<XDSCenter width={300} height={200}>
  <Content />
</XDSCenter>`,
    },
    {
      label: 'Center horizontally only',
      code: `<XDSCenter axis="horizontal">
  <Logo />
</XDSCenter>`,
    },
    {
      label: 'Inline centering for icons',
      code: `<XDSCenter isInline>
  <XDSIcon icon={StarIcon} />
</XDSCenter>`,
    },
  ],
  props: [
    {
      name: 'axis',
      type: "'both' | 'horizontal' | 'vertical'",
      description: 'Which direction(s) to center.',
      default: "'both'",
    },
    {
      name: 'width',
      type: 'number | string',
      description: 'Container width (px or CSS value).',
    },
    {
      name: 'height',
      type: 'number | string',
      description: 'Container height (px or CSS value).',
    },
    {
      name: 'isInline',
      type: 'boolean',
      description: 'Use inline-flex (useful for text/icons).',
      default: 'false',
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: 'Content to center.',
    },
  ],
  theming: {
    targets: [
      {className: 'xds-center', visualProps: ['axis']},
    ],
  },
};
