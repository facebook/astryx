/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Layout',
  group: 'Layout',
  keywords: ["layout","container","content","flex","box","wrapper","scaffold","page","shell"],
  playground: {
    defaults: {
      header: {__element: 'XDSLayoutHeader', props: {}, children: {__element: 'XDSHeading', props: {level: 3}, children: 'Page Title'}},
      content: {__element: 'XDSLayoutContent', props: {}, children: {__element: 'XDSText', props: {type: 'body', color: 'secondary'}, children: 'Main content area. This is the scrollable center section of the layout.'}},
      footer: {__element: 'XDSLayoutFooter', props: {}, children: {__element: 'XDSText', props: {type: 'supporting', color: 'secondary'}, children: 'Footer — status bar or actions'}},
    },
  },
  theming: {
    targets: [
      {className: 'xds-layout', visualProps: ['height']},
      {className: 'xds-layout-content'},
      {className: 'xds-layout-footer'},
      {className: 'xds-layout-header'},
      {className: 'xds-layout-panel'},
    ],
  },
  components: [
    {
      name: 'XDSLayout',
      description:
        'Page shell with header, sidebar(s), content, and footer slots for building full app layouts.',
      props: [
        {
          name: 'content',
          type: 'ReactNode',
          description: 'Main content area (center).',
          slotElements: [{__element: 'XDSLayoutContent', props: {}, children: 'Content'}],
        },
        {
          name: 'header',
          type: 'ReactNode',
          description: 'Header slot.',
          slotElements: [{__element: 'XDSLayoutHeader', props: {}, children: 'Header'}],
        },
        {
          name: 'footer',
          type: 'ReactNode',
          description: 'Footer slot.',
          slotElements: [{__element: 'XDSLayoutFooter', props: {}, children: 'Footer'}],
        },
        {
          name: 'start',
          type: 'ReactNode',
          description: 'Start panel (left in LTR).',
          slotElements: [{__element: 'XDSLayoutPanel', props: {}, children: 'Panel'}],
        },
        {
          name: 'end',
          type: 'ReactNode',
          description: 'End panel (right in LTR).',
          slotElements: [{__element: 'XDSLayoutPanel', props: {}, children: 'Panel'}],
        },
        {
          name: 'height',
          type: "'fill' | 'auto'",
          description:
            'Height behavior — fill the container or grow with content.',
          default: "'fill'",
        },
      ],    },
    {
      name: 'XDSLayoutHeader',
      description: 'Top bar for page titles, app bars, and toolbars.',
      props: [
        {
          name: 'children',
          type: 'ReactNode',
          description: 'Header content.',
        },
        {
          name: 'hasDivider',
          type: 'boolean',
          description: 'Border at bottom edge.',
          default: 'false',
        },
        {
          name: 'height',
          type: 'number | string',
          description: 'Header height.',
        },
        {
          name: 'label',
          type: 'string',
          description: 'Accessible label for the landmark element.',
        },
        {
          name: 'role',
          type: 'AriaRole',
          description: 'ARIA landmark role.',
        },
      ],
    },
    {
      name: 'XDSLayoutContent',
      description: 'Scrollable main content area.',
      props: [
        {
          name: 'children',
          type: 'ReactNode',
          description: 'Content.',
        },
        {
          name: 'isScrollable',
          type: 'boolean',
          description: 'Enable scrollable overflow.',
          default: 'true',
        },
        {
          name: 'label',
          type: 'string',
          description: 'Accessible label for the landmark element.',
        },
        {
          name: 'role',
          type: 'AriaRole',
          description: 'ARIA landmark role.',
        },
      ],
    },
    {
      name: 'XDSLayoutFooter',
      description: 'Bottom bar for action bars, pagination, and status bars.',
      props: [
        {
          name: 'children',
          type: 'ReactNode',
          description: 'Footer content.',
        },
        {
          name: 'hasDivider',
          type: 'boolean',
          description: 'Border at top edge.',
          default: 'false',
        },
        {
          name: 'height',
          type: 'number | string',
          description: 'Footer height.',
        },
        {
          name: 'label',
          type: 'string',
          description: 'Accessible label for the landmark element.',
        },
        {
          name: 'role',
          type: 'AriaRole',
          description: 'ARIA landmark role.',
        },
      ],
    },
    {
      name: 'XDSLayoutPanel',
      description: 'Sidebar for navigation, settings, or inspector panels.',
      props: [
        {
          name: 'children',
          type: 'ReactNode',
          description: 'Panel content.',
        },
        {
          name: 'hasDivider',
          type: 'boolean',
          description: 'Border on the appropriate edge.',
          default: 'false',
        },
        {
          name: 'isScrollable',
          type: 'boolean',
          description: 'Enable scrollable overflow.',
          default: 'true',
        },
        {
          name: 'label',
          type: 'string',
          description: 'Accessible label for the landmark element.',
        },
        {
          name: 'role',
          type: 'AriaRole',
          description: 'ARIA landmark role.',
        },
      ],
    },
    {
      name: 'XDSLayoutContainer',
      description:
        'Primitive component that sets CSS variables for padding, used as the base for XDSCard and XDSSection.',
      props: [],
    },
    {
      name: 'XDSCard',
      description:
        'Card with shadow and themed styling, built on XDSLayoutContainer.',
      props: [],
    },
    {
      name: 'XDSSection',
      description:
        'Section with background variants (section, transparent, muted), built on XDSLayoutContainer.',
      props: [],
    },
    {
      name: 'XDSHStack',
      description: 'Horizontal stack that arranges children left-to-right.',
      props: [],
    },
    {
      name: 'XDSVStack',
      description: 'Vertical stack that arranges children top-to-bottom.',
      props: [],
    },
    {
      name: 'XDSStackItem',
      description:
        'Stack item with fill and alignment control for use inside XDSHStack or XDSVStack.',
      props: [],
    },
  ],
  usage: {
    description:
      'Layout provides composable components for building structured page shells with header, sidebar, content, and footer slots. Use XDSLayout for full app layouts and XDSHStack/XDSVStack for simple directional stacking.',
    bestPractices: [
      { guidance: true, description: 'Use XDSLayout for page shells that need distinct zones like header, sidebar(s), content, and footer.' },
      { guidance: true, description: 'Use XDSHStack and XDSVStack for simple directional stacking within a content area.' },
      { guidance: false, description: 'Use XDSLayout for simple stacking layouts — use XDSHStack or XDSVStack instead.' },
      { guidance: false, description: 'Nest multiple XDSLayout components — use one per page shell and compose content within its slots.' },
    ],
  },
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'Layout',
  theming: {
    targets: [
      {className: 'xds-layout', visualProps: ['height']},
      {className: 'xds-layout-content'},
      {className: 'xds-layout-footer'},
      {className: 'xds-layout-header'},
      {className: 'xds-layout-panel'},
    ],
  },
  components: [
    {
      name: 'XDSLayout',
      description:
        '带有页眉、侧边栏、内容和页脚插槽的页面外壳，用于构建完整的应用布局。',
      props: [
        {
          name: 'content',
          type: 'ReactNode',
          description: '主内容区域（居中）。',
        },
        {
          name: 'header',
          type: 'ReactNode',
          description: '页眉插槽。',
        },
        {
          name: 'footer',
          type: 'ReactNode',
          description: '页脚插槽。',
        },
        {
          name: 'start',
          type: 'ReactNode',
          description: '起始面板（LTR 模式下为左侧）。',
        },
        {
          name: 'end',
          type: 'ReactNode',
          description: '结束面板（LTR 模式下为右侧）。',
        },
        {
          name: 'height',
          type: "'fill' | 'auto'",
          description:
            '高度行为：填充容器或随内容增长。',
          default: "'fill'",
        },
      ],
    },
    {
      name: 'XDSLayoutHeader',
      description: '用于页面标题、应用栏和工具栏的顶部栏。',
      props: [
        {
          name: 'children',
          type: 'ReactNode',
          description: '页眉内容。',
        },
        {
          name: 'hasDivider',
          type: 'boolean',
          description: '底部边缘的边框。',
          default: 'false',
        },
        {
          name: 'height',
          type: 'number | string',
          description: '页眉高度。',
        },
        {
          name: 'label',
          type: 'string',
          description: '地标元素的无障碍标签。',
        },
        {
          name: 'role',
          type: 'AriaRole',
          description: 'ARIA 地标角色。',
        },
      ],
    },
    {
      name: 'XDSLayoutContent',
      description: '可滚动的主内容区域。',
      props: [
        {
          name: 'children',
          type: 'ReactNode',
          description: '内容。',
        },
        {
          name: 'isScrollable',
          type: 'boolean',
          description: '启用可滚动溢出。',
          default: 'true',
        },
        {
          name: 'label',
          type: 'string',
          description: '地标元素的无障碍标签。',
        },
        {
          name: 'role',
          type: 'AriaRole',
          description: 'ARIA 地标角色。',
        },
      ],
    },
    {
      name: 'XDSLayoutFooter',
      description: '用于操作栏、分页和状态栏的底部栏。',
      props: [
        {
          name: 'children',
          type: 'ReactNode',
          description: '页脚内容。',
        },
        {
          name: 'hasDivider',
          type: 'boolean',
          description: '顶部边缘的边框。',
          default: 'false',
        },
        {
          name: 'height',
          type: 'number | string',
          description: '页脚高度。',
        },
        {
          name: 'label',
          type: 'string',
          description: '地标元素的无障碍标签。',
        },
        {
          name: 'role',
          type: 'AriaRole',
          description: 'ARIA 地标角色。',
        },
      ],
    },
    {
      name: 'XDSLayoutPanel',
      description: '用于导航、设置或检查器面板的侧边栏。',
      props: [
        {
          name: 'children',
          type: 'ReactNode',
          description: '面板内容。',
        },
        {
          name: 'hasDivider',
          type: 'boolean',
          description: '相应边缘的边框。',
          default: 'false',
        },
        {
          name: 'isScrollable',
          type: 'boolean',
          description: '启用可滚动溢出。',
          default: 'true',
        },
        {
          name: 'label',
          type: 'string',
          description: '地标元素的无障碍标签。',
        },
        {
          name: 'role',
          type: 'AriaRole',
          description: 'ARIA 地标角色。',
        },
      ],
    },
    {
      name: 'XDSLayoutContainer',
      description:
        '设置内边距 CSS 变量的基础组件，作为 XDSCard 和 XDSSection 的基础。',
      props: [],
    },
    {
      name: 'XDSCard',
      description:
        '基于 XDSLayoutContainer 构建的带有阴影和主题样式的卡片。',
      props: [],
    },
    {
      name: 'XDSSection',
      description:
        '基于 XDSLayoutContainer 构建的带有背景变体（section、transparent、muted）的区块。',
      props: [],
    },
    {
      name: 'XDSHStack',
      description: '将子元素从左到右排列的水平堆叠。',
      props: [],
    },
    {
      name: 'XDSVStack',
      description: '将子元素从上到下排列的垂直堆叠。',
      props: [],
    },
    {
      name: 'XDSStackItem',
      description:
        '用于 XDSHStack 或 XDSVStack 内部的堆叠项，支持填充和对齐控制。',
      props: [],
    },
  ],
  usage: {
    description:
      'Layout provides composable components for building structured page shells with header, sidebar, content, and footer slots. Use XDSLayout for full app layouts and XDSHStack/XDSVStack for simple directional stacking.',
    bestPractices: [
      { guidance: true, description: 'Use XDSLayout for page shells that need distinct zones like header, sidebar(s), content, and footer.' },
      { guidance: true, description: 'Use XDSHStack and XDSVStack for simple directional stacking within a content area.' },
      { guidance: false, description: 'Use XDSLayout for simple stacking layouts — use XDSHStack or XDSVStack instead.' },
      { guidance: false, description: 'Nest multiple XDSLayout components — use one per page shell and compose content within its slots.' },
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description:
    'Composable utilities + components for structured layouts w/ container/content separation pattern.',
  usage: {
    description:
      'Layout provides composable components for building structured page shells with header, sidebar, content, and footer slots. Use XDSLayout for full app layouts and XDSHStack/XDSVStack for simple directional stacking.',
    bestPractices: [
      { guidance: true, description: 'Use XDSLayout for page shells that need distinct zones like header, sidebar(s), content, and footer.' },
      { guidance: true, description: 'Use XDSHStack and XDSVStack for simple directional stacking within a content area.' },
      { guidance: false, description: 'Use XDSLayout for simple stacking layouts — use XDSHStack or XDSVStack instead.' },
      { guidance: false, description: 'Nest multiple XDSLayout components — use one per page shell and compose content within its slots.' },
    ],
  },
  components: [
    {
      name: 'XDSLayout',
      description:
        'Page shell w/ header, sidebar(s), content, footer slots for full app layouts.',
      propDescriptions: {
        content: 'Main content area (center).',
        header: 'Header slot.',
        footer: 'Footer slot.',
        start: 'Start panel (left in LTR).',
        end: 'End panel (right in LTR).',
        height: 'Height behavior; fill container or grow w/ content.',
      },
    },
    {
      name: 'XDSLayoutHeader',
      description: 'Top bar for page titles, app bars, toolbars.',
      propDescriptions: {
        children: 'Header content.',
        hasDivider: 'Border at bottom edge.',
        height: 'Header height.',
        label: 'Accessible label for landmark element.',
        role: 'ARIA landmark role.',
      },
    },
    {
      name: 'XDSLayoutContent',
      description: 'Scrollable main content area.',
      propDescriptions: {
        children: 'Content.',
        isScrollable: 'Enable scrollable overflow.',
        label: 'Accessible label for landmark element.',
        role: 'ARIA landmark role.',
      },
    },
    {
      name: 'XDSLayoutFooter',
      description: 'Bottom bar for action bars, pagination, status bars.',
      propDescriptions: {
        children: 'Footer content.',
        hasDivider: 'Border at top edge.',
        height: 'Footer height.',
        label: 'Accessible label for landmark element.',
        role: 'ARIA landmark role.',
      },
    },
    {
      name: 'XDSLayoutPanel',
      description: 'Sidebar for navigation, settings, inspector panels.',
      propDescriptions: {
        children: 'Panel content.',
        hasDivider: 'Border on appropriate edge.',
        isScrollable: 'Enable scrollable overflow.',
        label: 'Accessible label for landmark element.',
        role: 'ARIA landmark role.',
      },
    },
    {
      name: 'XDSLayoutContainer',
      description:
        'Primitive setting CSS padding vars; base for XDSCard + XDSSection.',
    },
    {
      name: 'XDSCard',
      description:
        'Card w/ shadow + themed styling, built on XDSLayoutContainer.',
    },
    {
      name: 'XDSSection',
      description:
        'Section w/ background variants (section, transparent, muted), built on XDSLayoutContainer.',
    },
    {
      name: 'XDSHStack',
      description: 'Horizontal stack arranging children left-to-right.',
    },
    {
      name: 'XDSVStack',
      description: 'Vertical stack arranging children top-to-bottom.',
    },
    {
      name: 'XDSStackItem',
      description:
        'Stack item w/ fill + alignment control inside XDSHStack or XDSVStack.',
    },
  ],
};
