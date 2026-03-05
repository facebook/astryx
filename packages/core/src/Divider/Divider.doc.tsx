import type {ComponentDoc} from '../docs-types';

export const docs: ComponentDoc = {
  name: 'Divider',
  description: 'Visual separator with optional label, using XDS design tokens.',
  features: [
    'Supports horizontal and vertical orientations',
    'Optional label centered on the divider line',
    'Subtle and strong visual weight variants',
    'Full-bleed mode extends the divider to container edges via negative margins',
    'Themeable via ComponentStyles — exposes root, line, and label surfaces',
  ],
  examples: [
    {
      label: 'Basic',
      code: '<XDSDivider />',
    },
    {
      label: 'With label',
      code: '<XDSDivider label="or" />',
    },
    {
      label: 'Vertical',
      code: '<XDSDivider orientation="vertical" />',
    },
    {
      label: 'Strong variant',
      code: '<XDSDivider variant="strong" />',
    },
    {
      label: 'Full bleed',
      code: '<XDSDivider isFullBleed />',
    },
  ],
  props: [
    {
      name: 'orientation',
      type: "'horizontal' | 'vertical'",
      description: 'Orientation of the divider.',
      default: "'horizontal'",
    },
    {
      name: 'label',
      type: 'ReactNode',
      description: 'Optional label centered on the divider.',
    },
    {
      name: 'variant',
      type: "'subtle' | 'strong'",
      description: 'Visual weight of the divider line.',
      default: "'subtle'",
    },
    {
      name: 'isFullBleed',
      type: 'boolean',
      description:
        'Extend the divider to container edges with negative margins.',
      default: 'false',
    },
  ],
  theming: {
    componentKey: 'divider',
    surfaces: [
      {name: 'root', description: 'Root container element'},
      {name: 'line', description: 'Divider line element'},
      {name: 'label', description: 'Label text element'},
    ],
  },
};
