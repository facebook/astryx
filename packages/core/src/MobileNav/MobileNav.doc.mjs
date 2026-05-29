// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'MobileNav',
  displayName: 'Mobile Nav',
  group: 'MobileNav',
  category: 'Navigation',
  keywords: ["mobilenav","drawer","sidebar","navigation","hamburger","menu","offcanvas","slideout","navdrawer"],
  props: [
    {
      name: 'isOpen',
      type: 'boolean',
      description: 'Whether the drawer is open.',
      required: true,
    },
    {
      name: 'onOpenChange',
      type: '(isOpen: boolean) => void',
      description:
        'Called when the drawer visibility changes (backdrop click, Escape key, or close button).',
      required: true,
    },
    {
      name: 'children',
      type: 'ReactNode',
      description:
        'Drawer content — typically XDSSideNavSection/XDSSideNavItem, or any ReactNode.',
      required: true,
    },
    {
      name: 'title',
      type: 'string',
      description: 'Optional title shown at the top of the drawer.',
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
      { guidance: true, description: 'Provide a title when the drawer\'s purpose is not obvious from its content.' },
      { guidance: false, description: 'Use MobileNav on desktop — use a persistent SideNav instead.' },
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
      name: 'title',
      type: 'string',
      description: '显示在抽屉顶部的可选标题。',
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
      { guidance: true, description: 'Provide a title when the drawer\'s purpose is not obvious from its content.' },
      { guidance: false, description: 'Use MobileNav on desktop — use a persistent SideNav instead.' },
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
      { guidance: true, description: 'Share the same nav items between MobileNav and SideNav by extracting them into a variable.' },
      { guidance: true, description: 'Provide a title when the drawer\'s purpose is not obvious from its content.' },
      { guidance: false, description: 'Use MobileNav on desktop — use a persistent SideNav instead.' },
    ],
  },
  propDescriptions: {
    isOpen: 'Whether drawer is open.',
    onOpenChange:
      'Called when drawer visibility changes (backdrop click, Escape key, close button).',
    children:
      'Drawer content; typically XDSSideNavSection/XDSSideNavItem or any ReactNode.',
    title: 'Optional title at top of drawer.',
    width: 'Drawer width px. Capped at 85vw to prevent overflow on small screens.',
    side: 'Slide direction. Start=left LTR, right RTL.',
  },
};
