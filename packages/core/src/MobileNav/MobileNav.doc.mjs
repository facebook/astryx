// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'MobileNav',
  displayName: 'Mobile Nav',
  group: 'Navigation',
  category: 'Navigation',
  isHiddenFromOverview: true,
  keywords: ["mobilenav","drawer","sidebar","navigation","hamburger","menu","offcanvas","slideout","navdrawer","toggle"],
  components: [
    {
      name: 'XDSMobileNav',
      displayName: 'Mobile Nav',
      description: 'A slide-out drawer for mobile navigation. Accepts SideNav children.',
      props: [
        {
          name: 'isOpen',
          type: 'boolean',
          description: 'Whether the drawer is open. Inside XDSAppShell, this is managed automatically via context. Outside XDSAppShell, provide this prop to control the drawer yourself.',
        },
        {
          name: 'onOpenChange',
          type: '(isOpen: boolean) => void',
          description:
            'Called when the drawer visibility changes (backdrop click, Escape key, or close button). Inside XDSAppShell, this is managed automatically via context.',
        },
        {
          name: 'children',
          type: 'ReactNode',
          description:
            'Drawer content: typically XDSSideNavSection/XDSSideNavItem, or any ReactNode.',
          required: true,
        },
        {
          name: 'header',
          type: 'ReactNode',
          description: 'Header content for the drawer. Rendered next to the close button. Pass a string for a simple text heading, or a ReactNode for custom content (logo, search bar, etc.).',
        },
        {
          name: 'width',
          type: 'number',
          description:
            'Drawer width in pixels. Capped at 85vw to prevent overflow on small screens.',
          default: '280',
        },
        {
          name: 'side',
          type: "'start' | 'end'",
          description:
            'Which side the drawer slides from. Start is left in LTR, right in RTL.',
          default: "'start'",
        },
      ],
    },
    {
      name: 'XDSMobileNavToggle',
      displayName: 'Mobile Nav Toggle',
      description: 'Hamburger button that opens/closes the mobile nav drawer. Reads open state from XDSAppShell context automatically: does NOT accept isOpen or onOpenChange props. Renders nothing above the mobile breakpoint.',
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
  theming: {
    targets: [
      {className: 'xds-mobile-nav', visualProps: ['side']},
    ],
  },
  usage: {
    description:
      'A slide-out drawer for mobile navigation. MobileNav is the mobile counterpart to SideNav and accepts the same children. Use it on narrow viewports where a persistent sidebar is not practical. Inside XDSAppShell, use XDSMobileNavToggle as the trigger; it reads state from context automatically.',
    bestPractices: [
      { guidance: true, description: 'Share the same nav items between MobileNav and SideNav by extracting them into a variable.' },
      { guidance: true, description: 'Provide a header when the drawer\'s purpose is not obvious from its content.' },
      { guidance: true, description: 'Inside XDSAppShell, use XDSMobileNavToggle to open the drawer; it reads state from context. Do not pass isOpen/onOpenChange to the toggle.' },
      { guidance: false, description: 'Use MobileNav on desktop: use a persistent SideNav instead.' },
    ],
  },
};
/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'MobileNav',
  displayName: 'Mobile Nav',
  props: [
    {
      name: 'isOpen',
      type: 'boolean',
      description: '抽屉是否打开。',
      required: true,
    },
    {
      name: 'onOpenChange',
      type: '(isOpen: boolean) => void',
      description:
        '当抽屉可见性变化时调用（点击背景遮罩、按 Escape 键或点击关闭按钮）。',
      required: true,
    },
    {
      name: 'children',
      type: 'ReactNode',
      description:
        '抽屉内容，通常是 XDSSideNavSection/XDSSideNavItem 或任何 ReactNode。',
      required: true,
    },
    {
      name: 'header',
      type: 'ReactNode',
      description: '抽屉的头部内容。渲染在关闭按钮旁边。传入字符串作为简单文本标题，或传入 ReactNode 作为自定义内容。',
    },
    {
      name: 'width',
      type: 'number',
      description:
        '抽屉宽度（像素）。上限为 85vw 以防止在小屏幕上溢出。',
      default: '280',
    },
    {
      name: 'side',
      type: "'start' | 'end'",
      description:
        '抽屉滑出的方向。在 LTR 布局中 start 为左侧，在 RTL 布局中为右侧。',
      default: "'start'",
    },
  ],
  theming: {
    targets: [
      {className: 'xds-mobile-nav', visualProps: ['side']},
    ],
  },
  usage: {
    description:
      'A slide-out drawer for mobile navigation. MobileNav is the mobile counterpart to SideNav and accepts the same children. Use it on narrow viewports where a persistent sidebar is not practical.',
    bestPractices: [
      { guidance: true, description: 'Share the same nav items between MobileNav and SideNav by extracting them into a variable.' },
      { guidance: true, description: 'Provide a header when the drawer\'s purpose is not obvious from its content.' },
      { guidance: true, description: 'Inside XDSAppShell, use XDSMobileNavToggle to open the drawer; it reads state from context. Do not pass isOpen/onOpenChange to the toggle.' },
      { guidance: false, description: 'Use MobileNav on desktop: use a persistent SideNav instead.' },
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description:
    'Slide-out drawer overlay for mobile navigation. Mobile counterpart to XDSSideNav; accepts same children (XDSSideNavSection, XDSSideNavItem, or any ReactNode).',
  usage: {
    description:
      'A slide-out drawer for mobile navigation. MobileNav is the mobile counterpart to SideNav and accepts the same children. Use it on narrow viewports where a persistent sidebar is not practical.',
    bestPractices: [
      { guidance: true, description: 'Share nav items between MobileNav and SideNav by extracting into a variable.' },
      { guidance: true, description: 'Provide a header when the drawer purpose is not obvious from content.' },
      { guidance: true, description: 'Inside XDSAppShell, use XDSMobileNavToggle to open the drawer; it reads state from context. Do not pass isOpen/onOpenChange to the toggle.' },
      { guidance: false, description: 'Use MobileNav on desktop; use a persistent SideNav instead.' },
    ],
  },
  components: [
    {
      name: 'XDSMobileNav',
      description: 'Slide-out drawer for mobile navigation. Accepts SideNav children.',
    },
    {
      name: 'XDSMobileNavToggle',
      description: 'Hamburger button that opens/closes mobile nav drawer. Reads open state from XDSAppShell context automatically. Renders nothing above mobile breakpoint.',
    },
  ],
  propDescriptions: {
    isOpen: 'whether drawer is open',
    onOpenChange:
      'called when drawer visibility changes (backdrop click, Escape, close button)',
    children:
      'drawer content; typically XDSSideNavSection/XDSSideNavItem or any ReactNode',
    header: 'header content (string or ReactNode), rendered next to close button',
    width: 'drawer width px; capped at 85vw to prevent overflow on small screens',
    side: 'slide direction; start=left LTR, right RTL',
  },
};
