/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Section',
  description:
    'Container with background variants for creating visually distinct regions that automatically escape parent container padding for edge-to-edge fills.',
  features: [
    'Background variants: section, transparent, and wash',
    'Automatically escapes parent container padding for edge-to-edge fills',
    'Supports divider borders on any combination of sides (top, bottom, start, end)',
    'Flexible sizing via SizeValue for width, height, maxWidth, and minHeight',
    'Full-bleed mode removes internal padding for edge-to-edge content',
  ],
  examples: [
    {
      label: 'Wash variant',
      code: `<XDSSection variant="wash" width={300} height={250}>
  <XDSLayout
    content={<XDSLayoutContent>Content in wash section</XDSLayoutContent>}
  />
</XDSSection>`,
    },
    {
      label: 'Transparent variant',
      code: `<XDSSection variant="transparent">
  <XDSLayout
    content={<XDSLayoutContent>Transparent background</XDSLayoutContent>}
  />
</XDSSection>`,
    },
    {
      label: 'With dividers',
      code: `<XDSSection variant="section" dividers={['top', 'bottom']}>
  <XDSLayout
    content={<XDSLayoutContent>Section with top and bottom borders</XDSLayoutContent>}
  />
</XDSSection>`,
    },
    {
      label: 'Full bleed',
      code: `<XDSSection variant="wash" isFullBleed>
  <XDSLayout
    content={<XDSLayoutContent>Edge-to-edge content</XDSLayoutContent>}
  />
</XDSSection>`,
    },
  ],
  props: [
    {
      name: 'variant',
      type: "'section' | 'transparent' | 'wash'",
      description: 'Background variant applied to the section container.',
      default: "'section'",
    },
    {
      name: 'width',
      type: 'SizeValue',
      description:
        'Width of the section; a number is interpreted as pixels, a string is used as-is.',
    },
    {
      name: 'height',
      type: 'SizeValue',
      description:
        'Height of the section; a number is interpreted as pixels, a string is used as-is.',
    },
    {
      name: 'maxWidth',
      type: 'SizeValue',
      description: 'Maximum width of the section.',
    },
    {
      name: 'minHeight',
      type: 'SizeValue',
      description: 'Minimum height of the section.',
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: 'Content rendered inside the section.',
    },
    {
      name: 'dividers',
      type: "Array<'top' | 'bottom' | 'start' | 'end'>",
      description: 'Which sides of the section have divider borders.',
    },
    {
      name: 'isFullBleed',
      type: 'boolean',
      description: 'Removes internal padding so content extends edge-to-edge.',
      default: 'false',
    },
  ],
  theming: {
    targets: [
      {className: 'xds-section', visualProps: ['variant']},
    ],
  },
};
