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
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value — not an inline style object like style={{}}.',
    },
  ],
  theming: {
    targets: [
      {className: 'xds-aspect-ratio'},
    ],
  },
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'AspectRatio',
  description: '为子元素保持特定的宽高比。',
  features: [
    '接受任何以宽/高表示的数字比例（例如 16/9、4/3、1）',
    '子元素通过绝对定位填充容器',
    '通过 aspectRatio 组件键支持主题定制',
  ],
  examples: [
    {
      label: '宽屏图片 (16:9)',
      code: `<XDSAspectRatio ratio={16 / 9}>
  <img src="image.jpg" alt="Widescreen image" style={{objectFit: 'cover'}} />
</XDSAspectRatio>`,
    },
    {
      label: '正方形',
      code: `<XDSAspectRatio ratio={1}>
  <Avatar />
</XDSAspectRatio>`,
    },
    {
      label: '4:3 视频',
      code: `<XDSAspectRatio ratio={4 / 3}>
  <video src="video.mp4" />
</XDSAspectRatio>`,
    },
  ],
  props: [
    {
      name: 'ratio',
      type: 'number',
      description: '宽高比，以宽/高表示（例如 16/9、1）。',
      required: true,
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: '通过绝对定位填充容器的内容。',
      required: true,
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        '用于布局自定义的 StyleX 样式（外边距、定位、尺寸）。必须是 stylex.create() 的值，而不是像 style={{}} 这样的内联样式对象。',
    },
  ],
  theming: {
    targets: [
      {className: 'xds-aspect-ratio'},
    ],
  },
};

/** @type {string} */
export const docsDense = `TODO: apply dense protocol`;
