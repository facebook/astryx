/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Layout',
  description:
    'Composable utilities and components for building structured layouts with a container/content separation pattern.',
  showcase: {
    aspectRatio: 16 / 9,
    code: '<XDSLayout>Layout content</XDSLayout>',
  },
  keywords: ["layout","container","content","flex","box","wrapper","scaffold","page","shell"],
  features: [
    'Primitive + higher-order architecture — XDSLayoutContainer is a primitive; XDSCard, XDSSection are higher-order',
    'Directional padding via CSS variables — inner/outer, horizontal/vertical padding control',
    'Context-aware defaults — components detect their slot and self-adjust',
    'Automatic RTL support — uses CSS logical properties',
    'XDSLayout provides a page shell with header, sidebar(s), content, and footer slots',
    'XDSHStack and XDSVStack for simple stacking layouts',
    'XDSStackItem for fill/alignment control within stacks',
  ],
  theming: {
    targets: [
      {className: 'xds-layout', visualProps: ['height']},
      {className: 'xds-layout-content'},
      {className: 'xds-layout-footer'},
      {className: 'xds-layout-header'},
      {className: 'xds-layout-panel'},
    ],
  },
  notes: [
    'Use XDSLayout for page shells and app layouts — any UI with a header bar, sidebar navigation, scrollable content area, or action footer. Do not use for simple stacking (use XDSVStack/XDSHStack instead).',
    'XDSLayoutContainer sets CSS variables that child components read: --layout-padding-outer-x (outer horizontal padding), --layout-padding-outer-y (outer vertical padding), --layout-padding-inner-x (inner horizontal padding used by Header, Footer, Content, Panel), --layout-padding-inner-y (inner vertical padding used by Header, Footer, Content, Panel).',
    'Architecture layers from top to bottom: Higher-Order Components (XDSCard, XDSSection), Layout Structure (XDSLayout + XDSLayoutHeader/Footer/Content/Panel), Primitive (XDSLayoutContainer sets CSS variables), Layout Utilities (XDSHStack, XDSVStack, stack(), stackItem()).',
    'All layout utilities and components are exported from @xds/core/Layout.',
  ],
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
        },
        {
          name: 'header',
          type: 'ReactNode',
          description: 'Header slot.',
        },
        {
          name: 'footer',
          type: 'ReactNode',
          description: 'Footer slot.',
        },
        {
          name: 'start',
          type: 'ReactNode',
          description: 'Start panel (left in LTR).',
        },
        {
          name: 'end',
          type: 'ReactNode',
          description: 'End panel (right in LTR).',
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
        'Section with background variants (section, transparent, wash), built on XDSLayoutContainer.',
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
    summary: 'Composable utilities for building structured layouts with container and content separation.',
  },
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'Layout',
  description:
    '用于构建结构化布局的可组合工具和组件，采用容器/内容分离模式。',
  features: [
    '基础 + 高阶架构：XDSLayoutContainer 是基础组件；XDSCard、XDSSection 是高阶组件',
    '通过 CSS 变量实现方向性内边距控制：内/外、水平/垂直内边距',
    '上下文感知默认值：组件检测其所在插槽并自动调整',
    '自动 RTL 支持：使用 CSS 逻辑属性',
    'XDSLayout 提供带有页眉、侧边栏、内容和页脚插槽的页面外壳',
    'XDSHStack 和 XDSVStack 用于简单的堆叠布局',
    'XDSStackItem 用于堆叠中的填充/对齐控制',
  ],
  theming: {
    targets: [
      {className: 'xds-layout', visualProps: ['height']},
      {className: 'xds-layout-content'},
      {className: 'xds-layout-footer'},
      {className: 'xds-layout-header'},
      {className: 'xds-layout-panel'},
    ],
  },
  notes: [
    '使用 XDSLayout 构建页面外壳和应用布局，适用于任何带有页眉栏、侧边栏导航、可滚动内容区域或操作页脚的 UI。不要用于简单堆叠（请改用 XDSVStack/XDSHStack）。',
    'XDSLayoutContainer 设置子组件读取的 CSS 变量：--layout-padding-outer-x（外部水平内边距）、--layout-padding-outer-y（外部垂直内边距）、--layout-padding-inner-x（Header、Footer、Content、Panel 使用的内部水平内边距）、--layout-padding-inner-y（Header、Footer、Content、Panel 使用的内部垂直内边距）。',
    '从上到下的架构层级：高阶组件（XDSCard、XDSSection）、布局结构（XDSLayout + XDSLayoutHeader/Footer/Content/Panel）、基础层（XDSLayoutContainer 设置 CSS 变量）、布局工具（XDSHStack、XDSVStack、stack()、stackItem()）。',
    '所有布局工具和组件均从 @xds/core/Layout 导出。',
  ],
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
        '基于 XDSLayoutContainer 构建的带有背景变体（section、transparent、wash）的区块。',
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
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description:
    'Composable utilities + components for structured layouts w/ container/content separation pattern.',
  features: [
    'Primitive + higher-order architecture; XDSLayoutContainer is primitive; XDSCard, XDSSection higher-order',
    'Directional padding via CSS variables; inner/outer, horizontal/vertical padding control',
    'Context-aware defaults; components detect slot + self-adjust',
    'Automatic RTL support; uses CSS logical properties',
    'XDSLayout provides page shell w/ header, sidebar(s), content, footer slots',
    'XDSHStack + XDSVStack for simple stacking layouts',
    'XDSStackItem for fill/alignment control within stacks',
  ],
  notes: [
    'Use XDSLayout for page shells + app layouts (header bar, sidebar nav, scrollable content, action footer). Not for simple stacking (use XDSVStack/XDSHStack).',
    'XDSLayoutContainer sets CSS vars child components read: --layout-padding-outer-x (outer horizontal), --layout-padding-outer-y (outer vertical), --layout-padding-inner-x (inner horizontal for Header/Footer/Content/Panel), --layout-padding-inner-y (inner vertical for Header/Footer/Content/Panel).',
    'Architecture layers top to bottom: Higher-Order (XDSCard, XDSSection), Layout Structure (XDSLayout + Header/Footer/Content/Panel), Primitive (XDSLayoutContainer sets CSS vars), Utilities (XDSHStack, XDSVStack, stack(), stackItem()).',
    'All layout utilities + components exported from @xds/core/Layout.',
  ],
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
        'Section w/ background variants (section, transparent, wash), built on XDSLayoutContainer.',
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
