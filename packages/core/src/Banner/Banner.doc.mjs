/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Banner',
  keywords: ["banner","alert","notification","callout","notice","status","message","info","warning","error","success","toast"],
  usage: {
    description:
      'Banner is a persistent status notification that displays a prominent message with related actions. Use it to communicate critical or non-critical information for info, warning, error, or success scenarios at the page or section level.',
    bestPractices: [
      {guidance: true, description: 'Keep titles and descriptions to 1–2 lines and choose the appropriate status variant to match the severity of the message.'},
      {guidance: true, description: 'Use the card container for inline contextual messages and the section container for full-width page-level notifications.'},
      {guidance: false, description: 'Use a Banner for transient notifications that should auto-dismiss — use a Toast instead.'},
      {guidance: false, description: 'Stack multiple Banners of the same status — consolidate related messages into a single Banner.'},
    ],
    anatomy: [
      {name: 'Icon', required: true, description: 'Visual indicator for the banner type.'},
      {name: 'Heading', required: false, description: 'Required if no description is provided.'},
      {name: 'Description', required: false, description: 'Required if no heading is provided.'},
      {name: 'Action Button', required: false, description: 'Actionable button related to the banner message.'},
      {name: 'Expand/Collapse Button', required: false, description: 'Toggles additional banner content.'},
      {name: 'Dismissible Button', required: false, description: 'Dismisses the banner. Not available for critical banners.'},
      {name: 'Flex Space', required: false, description: 'Additional space for supplementary info.'},
    ],
  },

  props: [
    {
      name: 'status',
      type: "'info' | 'warning' | 'error' | 'success'",
      description: 'Status type controlling icon and color.',
      required: true,
    },
    {
      name: 'title',
      type: 'ReactNode',
      description: 'Title text or ReactNode displayed in the header.',
      required: true,
    },
    {
      name: 'description',
      type: 'ReactNode',
      description: 'Description text rendered below the title in the header.',
    },
    {
      name: 'icon',
      type: 'ReactNode',
      description: 'Override the default status icon.',
    },
    {
      name: 'isDismissable',
      type: 'boolean',
      description: 'Whether the banner can be dismissed by the user.',
      default: 'false',
    },
    {
      name: 'onDismiss',
      type: '() => void',
      description:
        'Called when the dismiss button is clicked; banner hides itself regardless of whether this is provided.',
    },
    {
      name: 'endContent',
      type: 'ReactNode',
      description:
        'Action content rendered in the header area, end-aligned. Typically a button or link.',
    },
    {
      name: 'container',
      type: "'card' | 'section'",
      description:
        'Container type: card has border-radius; section is full-width with no border-radius for page-level use.',
      default: "'card'",
    },
    {
      name: 'children',
      type: 'ReactNode',
      description:
        'Content rendered in the card-background area below the colored header.',
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
      {className: 'xds-banner', visualProps: ['container', 'status']},
      {className: 'xds-banner-icon', visualProps: ['status']},
    ],
    vars: [
      {name: '--banner-radius', description: 'Border radius (card container only)', default: 'var(--radius-container)'},
    ],
    derived: [
      {property: 'borderRadius', description: 'Border radius of the banner', default: 'var(--radius-container)', vars: ['--banner-radius']},
    ],
  },
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'Banner',
  usage: {
    description:
      'Banner is a persistent status notification that displays a prominent message with related actions. Use it to communicate critical or non-critical information for info, warning, error, or success scenarios at the page or section level.',
    bestPractices: [
      {guidance: true, description: 'Keep titles and descriptions to 1–2 lines and choose the appropriate status variant to match the severity of the message.'},
      {guidance: true, description: 'Use the card container for inline contextual messages and the section container for full-width page-level notifications.'},
      {guidance: false, description: 'Use a Banner for transient notifications that should auto-dismiss — use a Toast instead.'},
      {guidance: false, description: 'Stack multiple Banners of the same status — consolidate related messages into a single Banner.'},
    ],
    anatomy: [
      {name: 'Icon', required: true, description: 'Visual indicator for the banner type.'},
      {name: 'Heading', required: false, description: 'Required if no description is provided.'},
      {name: 'Description', required: false, description: 'Required if no heading is provided.'},
      {name: 'Action Button', required: false, description: 'Actionable button related to the banner message.'},
      {name: 'Expand/Collapse Button', required: false, description: 'Toggles additional banner content.'},
      {name: 'Dismissible Button', required: false, description: 'Dismisses the banner. Not available for critical banners.'},
      {name: 'Flex Space', required: false, description: 'Additional space for supplementary info.'},
    ],
  },
  props: [
    {name: 'status', type: "'info' | 'warning' | 'error' | 'success'", description: '状态类型，控制图标和颜色。', required: true},
    {name: 'title', type: 'ReactNode', description: '显示在头部的标题文本或 ReactNode。', required: true},
    {name: 'description', type: 'ReactNode', description: '渲染在头部标题下方的描述文本。'},
    {name: 'icon', type: 'ReactNode', description: '覆盖默认的状态图标。'},
    {name: 'isDismissable', type: 'boolean', description: '横幅是否可被用户关闭。', default: 'false'},
    {name: 'onDismiss', type: '() => void', description: '点击关闭按钮时调用；无论是否提供此回调，横幅都会自动隐藏。'},
    {name: 'endContent', type: 'ReactNode', description: '渲染在头部区域末端对齐的操作内容，通常是按钮或链接。'},
    {name: 'container', type: "'card' | 'section'", description: '视觉变体：card 带圆角；section 无圆角全宽，适用于页面级场景。', default: "'card'"},
    {name: 'children', type: 'ReactNode', description: '渲染在彩色头部下方卡片背景区域的内容。'},
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        '用于布局自定义的 StyleX 样式（外边距、定位、尺寸）。必须是 stylex.create() 的值，而非内联样式对象如 style={{}}。',
    },
  ],
  theming: {
    targets: [
      {
        className: 'xds-banner',
        visualProps: [
          'container',
          'status',
        ],
      },
      {
        className: 'xds-banner-icon',
        visualProps: [
          'status',
        ],
      },
    ],
    vars: [
      {name: '--banner-radius', description: 'Border radius (card container only)', default: 'var(--radius-container)'},
    ],
    derived: [
      {property: 'borderRadius', description: 'Border radius of the banner', default: 'var(--radius-container)', vars: ['--banner-radius']},
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'persistent status notification for info, warning, error, success messages',
  usage: {
    description:
      'Banner is a persistent status notification that displays a prominent message with related actions. Use it to communicate critical or non-critical information for info, warning, error, or success scenarios at the page or section level.',
    bestPractices: [
      {guidance: true, description: 'Keep titles and descriptions to 1–2 lines and choose the appropriate status variant to match the severity of the message.'},
      {guidance: true, description: 'Use the card container for inline contextual messages and the section container for full-width page-level notifications.'},
      {guidance: false, description: 'Use a Banner for transient notifications that should auto-dismiss — use a Toast instead.'},
      {guidance: false, description: 'Stack multiple Banners of the same status — consolidate related messages into a single Banner.'},
    ],
    anatomy: [
      {name: 'Icon', required: true, description: 'Visual indicator for the banner type.'},
      {name: 'Heading', required: false, description: 'Required if no description is provided.'},
      {name: 'Description', required: false, description: 'Required if no heading is provided.'},
      {name: 'Action Button', required: false, description: 'Actionable button related to the banner message.'},
      {name: 'Expand/Collapse Button', required: false, description: 'Toggles additional banner content.'},
      {name: 'Dismissible Button', required: false, description: 'Dismisses the banner. Not available for critical banners.'},
      {name: 'Flex Space', required: false, description: 'Additional space for supplementary info.'},
    ],
  },
  propDescriptions: {
    status: 'controls icon+color',
    title: 'title text/ReactNode in header',
    description: 'text below title in header',
    icon: 'override default status icon',
    isDismissable: 'user can dismiss banner',
    onDismiss: 'dismiss callback; banner self-hides regardless',
    endContent: 'end-aligned action in header, typically button/link',
    container: 'card=border-radius; section=full-width no radius for page-level',
    children: 'content in card-bg area below colored header',
    xstyle: 'StyleX layout customization via stylex.create()',
  },
};
