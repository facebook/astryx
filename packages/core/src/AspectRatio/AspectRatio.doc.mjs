/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'AspectRatio',
  description: 'Maintains a specific aspect ratio for its children.',
  showcase: {
    aspectRatio: 16 / 9,
    code: '<XDSAspectRatio ratio={16/9}><div style={{background: "#eee", height: "100%"}} /></XDSAspectRatio>',
  },
  keywords: ["aspect-ratio","ratio","proportion","responsive","embed","container","widescreen","thumbnail","letterbox","crop"],
  features: [
    'Accepts any numeric ratio expressed as width/height (e.g. 16/9, 4/3, 1)',
    'Children are positioned absolutely to fill the container',
    'Supports theming via the aspectRatio component key',
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
  usage: {
    summary: 'Maintains a specific aspect ratio for its children, useful for responsive media containers.',
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

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'maintains specific aspect ratio for children',
  features: [
    'any numeric ratio as width/height (e.g. 16/9, 4/3, 1)',
    'children positioned absolutely to fill container',
    'themeable via aspectRatio component key',
  ],
  propDescriptions: {
    ratio: 'width/height ratio (e.g. 16/9, 1)',
    children: 'content positioned absolutely to fill container',
    xstyle: 'StyleX layout customization via stylex.create()',
  },
};
