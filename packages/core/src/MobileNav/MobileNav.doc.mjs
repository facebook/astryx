/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'MobileNav',
  description:
    'Slide-out drawer overlay for mobile navigation. The mobile counterpart to XDSSideNav — accepts the same children (XDSSideNavSection, XDSSideNavItem, or any ReactNode).',
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
  examples: [
    {
      label: 'Basic hamburger menu',
      code: `const [isOpen, setIsOpen] = useState(false);

<XDSButton
  label="Menu"
  icon={<MenuIcon />}
  variant="ghost"
  onClick={() => setIsOpen(true)}
/>

<XDSMobileNav
  isOpen={isOpen}
  onOpenChange={() => setIsOpen(false)}
  title="Navigation"
>
  <XDSSideNavSection title="Main">
    <XDSSideNavItem label="Dashboard" href="/dashboard" isSelected />
    <XDSSideNavItem label="Analytics" href="/analytics" />
    <XDSSideNavItem label="Settings" href="/settings" />
  </XDSSideNavSection>
</XDSMobileNav>`,
    },
    {
      label: 'Responsive sidebar/drawer pattern',
      code: `const isMobile = useMediaQuery('(max-width: 768px)');
const [drawerOpen, setDrawerOpen] = useState(false);

const navSections = (
  <>
    <XDSSideNavSection title="Main">
      <XDSSideNavItem label="Dashboard" href="/" isSelected />
      <XDSSideNavItem label="Projects" href="/projects" />
    </XDSSideNavSection>
    <XDSSideNavSection title="Settings">
      <XDSSideNavItem label="General" href="/settings" />
      <XDSSideNavItem label="Security" href="/security" />
    </XDSSideNavSection>
  </>
);

{isMobile ? (
  <>
    <XDSButton
      label="Menu"
      icon={<MenuIcon />}
      variant="ghost"
      onClick={() => setDrawerOpen(true)}
    />
    <XDSMobileNav
      isOpen={drawerOpen}
      onOpenChange={() => setDrawerOpen(false)}
      title="My App"
    >
      {navSections}
    </XDSMobileNav>
  </>
) : (
  <XDSSideNav>{navSections}</XDSSideNav>
)}`,
    },
    {
      label: 'Shared children with XDSSideNav',
      code: `const sections = (
  <XDSSideNavSection title="Main">
    <XDSSideNavItem label="Home" href="/" />
    <XDSSideNavItem label="Settings" href="/settings" />
  </XDSSideNavSection>
);

// Desktop: sidebar
<XDSSideNav>{sections}</XDSSideNav>

// Mobile: drawer
<XDSMobileNav isOpen={open} onOpenChange={close}>{sections}</XDSMobileNav>`,
    },
  ],
  features: [
    'Native <dialog> element with showModal() for top-layer rendering — no z-index stacking issues',
    'Animated slide-in from start or end edge with backdrop fade',
    'Shares children with XDSSideNav — extract nav sections into a variable and render in both',
    'RTL-aware: automatically mirrors slide direction for right-to-left layouts',
    'Respects prefers-reduced-motion: reduces animation duration',
  ],
  accessibility: [
    'Uses native <dialog> with showModal() for correct ARIA modal semantics.',
    "aria-label set to title or 'Navigation' as fallback.",
    'Focus trapping provided by showModal() (browser-native).',
    'Escape key closes via native cancel event.',
    'Backdrop click closes the drawer.',
    'Body scroll locked while modal is open.',
  ],
  keyboard:
    'Escape closes the drawer; Tab/Shift+Tab cycles focus within the drawer (browser-native focus trapping)',
  theming: {
    targets: [
      {className: 'xds-mobile-nav', visualProps: ['side']},
    ],
  },
};
/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'MobileNav',
  description:
    '用于移动端导航的滑出式抽屉覆盖层。作为 XDSSideNav 的移动端对应组件，接受相同的子元素（XDSSideNavSection、XDSSideNavItem 或任何 ReactNode）。',
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
  examples: [
    {
      label: '基础汉堡菜单',
      code: `const [isOpen, setIsOpen] = useState(false);

<XDSButton
  label="Menu"
  icon={<MenuIcon />}
  variant="ghost"
  onClick={() => setIsOpen(true)}
/>

<XDSMobileNav
  isOpen={isOpen}
  onOpenChange={() => setIsOpen(false)}
  title="Navigation"
>
  <XDSSideNavSection title="Main">
    <XDSSideNavItem label="Dashboard" href="/dashboard" isSelected />
    <XDSSideNavItem label="Analytics" href="/analytics" />
    <XDSSideNavItem label="Settings" href="/settings" />
  </XDSSideNavSection>
</XDSMobileNav>`,
    },
    {
      label: '响应式侧边栏/抽屉模式',
      code: `const isMobile = useMediaQuery('(max-width: 768px)');
const [drawerOpen, setDrawerOpen] = useState(false);

const navSections = (
  <>
    <XDSSideNavSection title="Main">
      <XDSSideNavItem label="Dashboard" href="/" isSelected />
      <XDSSideNavItem label="Projects" href="/projects" />
    </XDSSideNavSection>
    <XDSSideNavSection title="Settings">
      <XDSSideNavItem label="General" href="/settings" />
      <XDSSideNavItem label="Security" href="/security" />
    </XDSSideNavSection>
  </>
);

{isMobile ? (
  <>
    <XDSButton
      label="Menu"
      icon={<MenuIcon />}
      variant="ghost"
      onClick={() => setDrawerOpen(true)}
    />
    <XDSMobileNav
      isOpen={drawerOpen}
      onOpenChange={() => setDrawerOpen(false)}
      title="My App"
    >
      {navSections}
    </XDSMobileNav>
  </>
) : (
  <XDSSideNav>{navSections}</XDSSideNav>
)}`,
    },
    {
      label: '与 XDSSideNav 共享子元素',
      code: `const sections = (
  <XDSSideNavSection title="Main">
    <XDSSideNavItem label="Home" href="/" />
    <XDSSideNavItem label="Settings" href="/settings" />
  </XDSSideNavSection>
);

// Desktop: sidebar
<XDSSideNav>{sections}</XDSSideNav>

// Mobile: drawer
<XDSMobileNav isOpen={open} onOpenChange={close}>{sections}</XDSMobileNav>`,
    },
  ],
  features: [
    '原生 <dialog> 元素配合 showModal() 实现顶层渲染，无 z-index 层叠问题',
    '从起始边缘或结束边缘滑入动画，配合背景遮罩淡入效果',
    '与 XDSSideNav 共享子元素，将导航区块提取为变量即可在两者中渲染',
    'RTL 感知：自动镜像滑动方向以适配从右到左的布局',
    '遵循 prefers-reduced-motion：减少动画持续时间',
  ],
  accessibility: [
    '使用原生 <dialog> 配合 showModal() 以获得正确的 ARIA 模态语义。',
    "aria-label 设置为标题，回退值为 'Navigation'。",
    'showModal() 提供焦点捕获（浏览器原生）。',
    '通过原生 cancel 事件，按 Escape 键关闭。',
    '点击背景遮罩关闭抽屉。',
    '模态框打开时锁定页面滚动。',
  ],
  keyboard:
    'Escape 关闭抽屉；Tab/Shift+Tab 在抽屉内循环切换焦点（浏览器原生焦点捕获）',
  theming: {
    targets: [
      {className: 'xds-mobile-nav', visualProps: ['side']},
    ],
  },
};

/** @type {string} */
export const docsDense = `TODO: apply dense protocol`;
