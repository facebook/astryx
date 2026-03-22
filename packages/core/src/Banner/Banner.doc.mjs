/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Banner',
  description:
    'Persistent status notification for info, warning, error, or success messages.',

  features: [
    'Two-part layout: colored status header with icon, title, description, action buttons, and optional dismiss; optional card-background content area below',
    'When no children are provided, only the colored header renders',
    'Self-managed dismiss state — banner hides itself on dismiss without requiring external state wiring',
    'onDismiss callback fires alongside the internal state change for logging or backend sync',
    'Default status icons from @heroicons/react/24/solid: InformationCircleIcon (info), ExclamationTriangleIcon (warning), XCircleIcon (error), CheckCircleIcon (success)',
    'Status colors: info uses --color-accent-muted, warning uses --color-warning-muted, error uses --color-error-muted, success uses --color-success-muted',
    'Card container (default): has border-radius with optional card content area below the colored header',
    'Section container: no border-radius, full-width for page-level banners',
  ],

  examples: [
    {
      label: 'Simple — just the colored header',
      code: '<XDSBanner status="info" title="New update available" />',
    },
    {
      label: 'With description and self-dismissing behavior',
      code: `<XDSBanner
  status="error"
  title="Something went wrong"
  description="Please try again later."
  isDismissable
  onDismiss={() => logDismiss()}
/>`,
    },
    {
      label: 'With content area (card background below header)',
      code: `<XDSBanner
  status="error"
  title="Multiple errors found"
  description="The following issues need to be resolved:"
>
  <ul>
    <li>Email address is invalid</li>
    <li>Password must be at least 8 characters</li>
  </ul>
</XDSBanner>`,
    },
  ],

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

  accessibility: [
    'Uses role="alert" for error and warning statuses',
    'Uses role="status" for info and success statuses',
    'Dismiss button has aria-label="Dismiss"',
    'Status icon is aria-hidden="true" — status is conveyed by the ARIA role instead',
  ],

  theming: {
    targets: [
      {className: 'xds-banner', visualProps: ['container', 'status']},
      {className: 'xds-banner-icon', visualProps: ['status']},
    ],
    vars: [
      {name: '--banner-radius', description: 'Border radius (card container only)', default: 'var(--radius-3)'},
    ],
  },
  notes: [
    'Banner uses `status` as its extensible theming axis. Custom statuses via `defineTheme` components: `status:neutral`.',
    'Collapsible support is planned: the content area will support collapsing via useXDSCollapsible (issue #187)',
  ],
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'Banner',
  description:
    '持久性状态通知，用于展示信息、警告、错误或成功消息。',

  features: [
    '双区域布局：带图标、标题、描述、操作按钮和可选关闭按钮的彩色状态头部；下方可选的卡片背景内容区',
    '未提供 children 时，仅渲染彩色头部',
    '自管理关闭状态——横幅在关闭时自动隐藏，无需外部状态管理',
    'onDismiss 回调在内部状态变更的同时触发，用于日志记录或后端同步',
    '默认状态图标来自 @heroicons/react/24/solid：InformationCircleIcon（info）、ExclamationTriangleIcon（warning）、XCircleIcon（error）、CheckCircleIcon（success）',
    '状态颜色：info 使用 --color-accent-muted，warning 使用 --color-warning-muted，error 使用 --color-error-muted，success 使用 --color-success-muted',
    'Card 变体（默认）：带圆角，彩色头部下方可选卡片内容区',
    'Section 变体：无圆角，全宽，适用于页面级横幅',
  ],

  examples: [
    {
      label: '简单用法——仅彩色头部',
      code: '<XDSBanner status="info" title="New update available" />',
    },
    {
      label: '带描述和自动关闭行为',
      code: `<XDSBanner
  status="error"
  title="Something went wrong"
  description="Please try again later."
  isDismissable
  onDismiss={() => logDismiss()}
/>`,
    },
    {
      label: '带内容区（头部下方的卡片背景）',
      code: `<XDSBanner
  status="error"
  title="Multiple errors found"
  description="The following issues need to be resolved:"
>
  <ul>
    <li>Email address is invalid</li>
    <li>Password must be at least 8 characters</li>
  </ul>
</XDSBanner>`,
    },
  ],

  props: [
    {
      name: 'status',
      type: "'info' | 'warning' | 'error' | 'success'",
      description: '状态类型，控制图标和颜色。',
      required: true,
    },
    {
      name: 'title',
      type: 'ReactNode',
      description: '显示在头部的标题文本或 ReactNode。',
      required: true,
    },
    {
      name: 'description',
      type: 'ReactNode',
      description: '渲染在头部标题下方的描述文本。',
    },
    {
      name: 'icon',
      type: 'ReactNode',
      description: '覆盖默认的状态图标。',
    },
    {
      name: 'isDismissable',
      type: 'boolean',
      description: '横幅是否可被用户关闭。',
      default: 'false',
    },
    {
      name: 'onDismiss',
      type: '() => void',
      description:
        '点击关闭按钮时调用；无论是否提供此回调，横幅都会自动隐藏。',
    },
    {
      name: 'endContent',
      type: 'ReactNode',
      description:
        '渲染在头部区域末端对齐的操作内容，通常是按钮或链接。',
    },
    {
      name: 'container',
      type: "'card' | 'section'",
      description:
        '视觉变体：card 带圆角；section 无圆角全宽，适用于页面级场景。',
      default: "'card'",
    },
    {
      name: 'children',
      type: 'ReactNode',
      description:
        '渲染在彩色头部下方卡片背景区域的内容。',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        '用于布局自定义的 StyleX 样式（外边距、定位、尺寸）。必须是 stylex.create() 的值，而非内联样式对象如 style={{}}。',
    },
  ],

  accessibility: [
    '错误和警告状态使用 role="alert"',
    '信息和成功状态使用 role="status"',
    '关闭按钮带有 aria-label="Dismiss"',
    '状态图标设置为 aria-hidden="true"——状态信息通过 ARIA role 传达',
  ],

  theming: {
    targets: [
      {className: 'xds-banner', visualProps: ['container', 'status']},
      {className: 'xds-banner-icon', visualProps: ['status']},
    ],
    vars: [
      {name: '--banner-radius', description: 'Border radius (card container only)', default: 'var(--radius-3)'},
    ],
  },
  notes: [
    'Banner 使用 `status` 作为可扩展的主题轴。通过 defineTheme components 添加自定义状态：`status:neutral`。',
    '折叠支持已规划：内容区将通过 useXDSCollapsible 支持折叠（issue #187）',
  ],
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'persistent status notification for info, warning, error, success messages',
  features: [
    'two-part layout: colored status header w/ icon+title+description+actions+dismiss; optional card-bg content below',
    'w/o children, only colored header renders',
    'self-managed dismiss state, hides w/o external state wiring',
    'onDismiss fires alongside internal state change for logging/backend sync',
    'default status icons from @heroicons/react/24/solid: InformationCircleIcon, ExclamationTriangleIcon, XCircleIcon, CheckCircleIcon',
    'status colors: info=accent-deemphasized, warning=warning-deemphasized, error=negative-deemphasized, success=positive-deemphasized',
    'card container (default): border-radius w/ optional card content below header',
    'section container: no border-radius, full-width for page-level banners',
  ],
  notes: [
    'collapsible support planned via useXDSCollapsible (issue #187)',
  ],
  accessibility: [
    'role="alert" for error+warning',
    'role="status" for info+success',
    'dismiss button has aria-label="Dismiss"',
    'status icon aria-hidden="true", status conveyed by ARIA role',
  ],
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
