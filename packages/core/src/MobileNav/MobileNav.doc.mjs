/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'MobileNav',
  keywords: ["mobilenav","drawer","sidebar","navigation","hamburger","menu","offcanvas","slideout","navdrawer","toggle"],
  theming: {
    targets: [
      {className: 'xds-mobile-nav', visualProps: ['side']},
    ],
  },
  components: [
    {
      name: 'XDSMobileNav',
      description:
        'Slide-out drawer overlay for mobile navigation. Uses the native <dialog> element for top-layer rendering with built-in focus trapping and backdrop.',
      props: [
        {
          name: 'isOpen',
          type: 'boolean',
          description:
            'Whether the drawer is open. Inside XDSAppShell, this is managed automatically via context. Outside XDSAppShell, provide this prop to control the drawer yourself.',
        },
        {
          name: 'onOpenChange',
          type: '(isOpen: boolean) => void',
          description:
            'Called when the drawer should open or close (backdrop click, Escape key, or close button). Inside XDSAppShell, this is managed automatically via context. Outside XDSAppShell, provide this prop to control the drawer yourself.',
        },
        {
          name: 'children',
          type: 'ReactNode',
          description:
            'Drawer content — typically XDSSideNavSection/XDSSideNavItem, or any ReactNode.',
          required: true,
        },
        {
          name: 'header',
          type: 'ReactNode',
          description:
            'Header content rendered next to the close button. Pass a string for a simple text heading, or a ReactNode for custom content (logo, SideNavHeading, search bar, etc.).',
        },
        {
          name: 'width',
          type: 'number',
          description: 'Drawer width in pixels. The drawer uses maxWidth to prevent exceeding this value on any screen size.',
          default: '320',
        },
        {
          name: 'side',
          type: "'start' | 'end' | 'auto'",
          description:
            "Which side the drawer slides from. 'start' is the inline-start edge (left in LTR), 'end' is the inline-end edge. 'auto' determines the side based on the trigger element's viewport position — opens from start if the toggle is in the left half, end otherwise.",
          default: "'auto'",
        },
        {
          name: 'label',
          type: 'string',
          description:
            'Accessible label for the drawer. Falls back to the header text if header is a string, then to \'Navigation\'.',
        },
      ],
    },
    {
      name: 'XDSMobileNavToggle',
      description:
        'Hamburger button that opens/closes the mobile nav drawer. Reads from AppShell context and renders nothing above the mobile breakpoint.',
      props: [
        {
          name: 'children',
          type: 'ReactNode',
          description: 'Custom content to render instead of the default hamburger icon.',
        },
        {
          name: 'label',
          type: 'string',
          description: 'Accessible label for the toggle button.',
          default: "'Open navigation'",
        },
      ],
    },
  ],
  usage: {
    description:
      'MobileNav is a slide-out drawer overlay for mobile navigation. It serves as the mobile counterpart to SideNav and accepts the same children. Use it on mobile viewports where a persistent side navigation is not practical.',
    bestPractices: [
      { guidance: true, description: 'Share the same navigation children between MobileNav and SideNav by extracting them into a variable.' },
      { guidance: true, description: 'Provide a descriptive header or label to improve context and screen reader clarity.' },
      { guidance: false, description: 'Use MobileNav on desktop viewports where a persistent SideNav would be more appropriate.' },
    ],
    anatomy: [
      {name: 'Backdrop', required: true, description: 'Semi-transparent overlay behind the drawer that closes the nav on click.'},
      {name: 'Drawer panel', required: true, description: 'The sliding container that holds header and content areas.'},
      {name: 'Header', required: false, description: 'Top bar with optional header content and a close button.'},
      {name: 'Content', required: true, description: 'Scrollable area for navigation items and other content.'},
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsZh = {
  components: [
    {
      name: 'XDSMobileNav',
      description: '移动端导航的滑出式抽屉覆盖层。使用原生 <dialog> 元素实现顶层渲染，内置焦点捕获和背景遮罩。',
      propDescriptions: {
        isOpen: '抽屉是否打开。在 XDSAppShell 内部通过上下文自动管理。在外部使用时需自行提供此属性。',
        onOpenChange: '当抽屉应打开或关闭时调用（点击背景遮罩、按 Escape 键或点击关闭按钮）。在 XDSAppShell 内部通过上下文自动管理。',
        children: '抽屉内容，通常是 XDSSideNavSection/XDSSideNavItem 或任何 ReactNode。',
        header: '关闭按钮旁渲染的头部内容。传入字符串作为简单文本标题，或传入 ReactNode 作为自定义内容（Logo、SideNavHeading、搜索栏等）。',
        width: '抽屉宽度（像素）。使用 maxWidth 防止在任何屏幕尺寸上超出此值。',
        side: '抽屉滑出的方向。start 为内联起始边缘（LTR 中为左侧），end 为内联结束边缘。auto 根据触发元素的视口位置自动决定。',
        label: '抽屉的无障碍标签。回退到 header 字符串，然后回退到"Navigation"。',
      },
    },
    {
      name: 'XDSMobileNavToggle',
      description: '打开/关闭移动导航抽屉的汉堡按钮。从 AppShell 上下文读取，在移动断点以上不渲染。',
      propDescriptions: {
        children: '替代默认汉堡图标的自定义内容。',
        label: '切换按钮的无障碍标签。',
      },
    },
  ],
  usage: {
    description: 'MobileNav 是移动端导航的滑出式抽屉覆盖层。作为 SideNav 的移动端对应组件，接受相同的子组件。在持久侧边导航不实际的移动视口中使用。',
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description:
    'Slide-out drawer overlay for mobile navigation. Mobile counterpart to XDSSideNav; accepts same children (XDSSideNavSection, XDSSideNavItem, or any ReactNode).',
  usage: {
    description:
      'MobileNav is a slide-out drawer overlay for mobile navigation. It serves as the mobile counterpart to SideNav and accepts the same children. Use it on mobile viewports where a persistent side navigation is not practical.',
    bestPractices: [
      { guidance: true, description: 'Share the same navigation children between MobileNav and SideNav by extracting them into a variable.' },
      { guidance: true, description: 'Provide a descriptive header or label to improve context and screen reader clarity.' },
      { guidance: false, description: 'Use MobileNav on desktop viewports where a persistent SideNav would be more appropriate.' },
    ],
  },
  components: [
    {
      name: 'XDSMobileNav',
      description: 'slide-out mobile nav drawer; native <dialog> w/ top-layer rendering',
      propDescriptions: {
        isOpen: 'Whether drawer is open. Auto-managed inside XDSAppShell.',
        onOpenChange: 'Open/close callback (backdrop, Escape, close btn). Auto-managed inside XDSAppShell.',
        children: 'Drawer content; typically XDSSideNavSection/XDSSideNavItem or any ReactNode.',
        header: 'Header content next to close button. String for text heading, ReactNode for custom content.',
        width: 'Drawer width px. Uses maxWidth to cap on small screens.',
        side: "Slide direction. start=inline-start, end=inline-end, auto=based on trigger position.",
        label: 'Accessible label. Falls back to header string, then \'Navigation\'.',
      },
    },
    {
      name: 'XDSMobileNavToggle',
      description: 'hamburger btn; reads AppShell context, hidden above mobile breakpoint',
      propDescriptions: {
        children: 'Custom icon content replacing default hamburger.',
        label: 'Accessible label for toggle button.',
      },
    },
  ],
};
