/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'AspectRatio',
  description: 'Maintains a specific aspect ratio for its children.',
  features: [
    'Accepts any numeric ratio expressed as width/height (e.g. 16/9, 4/3, 1)',
    'Children are positioned absolutely to fill the container',
    'Supports theming via the aspectRatio component key',
  ],
  examples: [
    {
      label: 'Widescreen image (16:9)',
      code: `<XDSAspectRatio ratio={16 / 9}>
  <img src="image.jpg" alt="Widescreen image" style={{objectFit: 'cover'}} />
</XDSAspectRatio>`,
    },
    {
      label: 'Square',
      code: `<XDSAspectRatio ratio={1}>
  <Avatar />
</XDSAspectRatio>`,
    },
    {
      label: '4:3 video',
      code: `<XDSAspectRatio ratio={4 / 3}>
  <video src="video.mp4" />
</XDSAspectRatio>`,
    },
  ],
  props: [
    {
      name: 'ratio',
      type: 'number',
      description: 'Aspect ratio as width/height (e.g. 16/9, 1).',
      required: true,
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: 'Content positioned absolutely to fill the container.',
      required: true,
    },
  ],
  theming: {
    componentKey: 'aspectRatio',
    surfaces: [
      {
        name: 'root',
        description: 'Root container styles.',
      },
    ],
  },
};
