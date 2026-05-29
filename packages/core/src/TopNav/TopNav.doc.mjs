// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'TopNav',
  displayName: 'Top Nav',
  group: 'TopNav',
  category: 'Navigation',
  keywords: ["topnav","navbar","appbar","header","toolbar","navigation","menubar","topbar"],
  playground: {
    defaults: {
      label: 'Navigation',
      heading: {__element: 'XDSTopNavHeading', props: {heading: 'My App'}},
    },
  },
  theming: {
    targets: [
      {className: 'xds-top-nav', states: ['mode']},
      {className: 'xds-top-nav-item', states: ['mode']},
      {className: 'xds-top-nav-heading'},
      {className: 'xds-top-nav-mega-menu', states: ['mode']},
      {className: 'xds-top-nav-mega-menu-item', states: ['mode']},
      {className: 'xds-top-nav-mega-menu-featured-card'},
      {className: 'xds-top-nav-menu'},
    ],
  },
  components: [
    {
      name: 'XDSTopNav',
      displayName: 'Top Nav',
      description: 'Main navigation bar container with slot-based layout. Children are accepted as an alias for startContent.',
      props: [
        {
          name: 'heading',
          type: 'ReactNode',
          description:
            'Heading slot content (logo, brand) — positioned at the left edge of the nav bar.',
          slotElements: [{__element: 'XDSText', props: {type: 'body', weight: 'bold'}, children: 'Heading'}],
        },
        {
          name: 'startContent',
          type: 'ReactNode',
          description:
            'Start content slot for navigation items or breadcrumbs — positioned after the heading, left-aligned.',
          slotElements: [{__element: 'XDSIcon', props: {icon: 'check', size: 'sm'}}],
        },
        {
          name: 'children',
          type: 'ReactNode',
          description:
            'Alias for startContent. Prefer startContent when composing with heading, centerContent, or endContent; children keeps the common React nav-item pattern from silently dropping items.',
          slotElements: [{__element: 'XDSTopNavItem', props: {label: 'Home', href: '#'}}],
        },
        {
          name: 'centerContent',
          type: 'ReactNode',
          description:
            'Center content slot (tabs, search bar, primary navigation) — when provided, switches the layout to a three-column CSS grid for true horizontal centering.',
          slotElements: [{__element: 'XDSText', props: {type: 'body', weight: 'bold'}, children: 'Center'}],
        },
        {
          name: 'endContent',
          type: 'ReactNode',
          description:
            'End content slot for search, icons, or user profile — positioned at the right edge.',
          slotElements: [
            {__element: 'XDSIcon', props: {icon: 'chevronDown', size: 'sm'}},
            {__element: 'XDSBadge', props: {label: '3'}},
          ],
        },
        {
          name: 'label',
          type: 'string',
          description:
            'Accessible label for the navigation landmark, applied as aria-label on the <nav> element.',
        },
        {
          name: 'xstyle',
          type: 'StyleXStyles',
          description:
            'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value — not an inline style object like style={{}}.',
        },
      ],    },
    {
      name: 'XDSTopNavHeading',
      displayName: 'Top Nav Heading',
      description:
        'Product/suite/account heading for the XDSTopNav heading slot. Supports smart interaction boundary logic: logo, heading text, superheading/subheading with independent links, and an optional menu popover with automatic chevron indicator.',
      props: [
        {
          name: 'logo',
          type: 'ReactNode',
          description:
            'Logo element to display before the heading text. Can be an image, XDSNavIcon, or any ReactNode.',
          slotElements: [{__element: 'XDSIcon', props: {icon: 'check', size: 'sm'}}],
        },
        {
          name: 'heading',
          type: 'string',
          description: 'Product/app name displayed as the primary heading text.',
        },
        {
          name: 'headingHref',
          type: 'string',
          description:
            'Link for the heading text (e.g. product home). When no menu is present and this is the only href, the whole heading becomes one clickable link.',
        },
        {
          name: 'href',
          type: 'string',
          description:
            'Deprecated — use headingHref instead. URL to navigate to when clicked.',
        },
        {
          name: 'superheading',
          type: 'string',
          description:
            'Text above the heading (e.g. suite name). Rendered in a smaller secondary style.',
        },
        {
          name: 'superheadingHref',
          type: 'string',
          description:
            'Link for the superheading text (e.g. suite home). When provided alongside a menu, renders as an independent inline link.',
        },
        {
          name: 'subheading',
          type: 'string',
          description:
            'Text below the heading (e.g. account context). Rendered in a smaller secondary style.',
        },
        {
          name: 'subheadingHref',
          type: 'string',
          description:
            'Link for the subheading text. When provided alongside a menu, renders as an independent inline link.',
        },
        {
          name: 'headerEndContent',
          type: 'ReactNode',
          description:
            'Content rendered at the trailing edge of the heading row (e.g. a badge or status indicator).',
          slotElements: [{__element: 'XDSButton', props: {label: 'Action', variant: 'ghost', size: 'sm'}}],
        },
        {
          name: 'menu',
          type: 'ReactNode',
          description:
            'Menu content shown in a popover dropdown. When provided, a chevron indicator appears automatically. Interaction boundary is determined by the presence of hrefs: no hrefs means the whole header is the trigger; with hrefs, links are independent and the chevron area is the trigger.',
          slotElements: [{__element: 'XDSButton', props: {label: 'Action', variant: 'ghost', size: 'sm'}}],
        },
        {
          name: 'as',
          type: 'XDSLinkComponentType',
          description:
            'Custom component to render instead of <a>. Overrides the provider-level default set by XDSLinkProvider. Must accept href, className, style, and children props.',
        },
        {
          name: 'xstyle',
          type: 'StyleXStyles',
          description:
            'StyleX styles for layout customization. Must be a stylex.create() value.',
        },
      ],
    },
    {
      name: 'XDSTopNavItem',
      displayName: 'Top Nav Item',
      description:
        'Navigation link item for use in XDSTopNav startContent — renders as an anchor with hover and selected states.',
      props: [
        {
          name: 'label',
          type: 'string',
          description:
            'Accessible label for the nav item. Rendered as visible text by default. When isIconOnly is true, used as aria-label instead.',
          required: true,
        },
        {
          name: 'href',
          type: 'string',
          description: 'Navigation target URL.',
        },
        {
          name: 'isSelected',
          type: 'boolean',
          description:
            'Whether this nav item is currently selected. Sets aria-current="page" and applies highlighted styles.',
          default: 'false',
        },
        {
          name: 'isDisabled',
          type: 'boolean',
          description:
            'Whether the nav item is disabled. Sets aria-disabled and prevents interaction.',
          default: 'false',
        },
        {
          name: 'isIconOnly',
          type: 'boolean',
          description:
            'Renders the item as a square icon-only element. When true, label becomes the aria-label and visible text is hidden. Requires icon to be set.',
          default: 'false',
        },
        {
          name: 'icon',
          type: 'ReactNode',
          description:
            'Optional icon to display before the label.',
          slotElements: [{__element: 'XDSIcon', props: {icon: 'check', size: 'sm'}}],
        },
        {
          name: 'children',
          type: 'ReactNode',
          description:
            'Custom content to render instead of the label text.',
        },
        {
          name: 'as',
          type: 'XDSLinkComponentType',
          description:
            'Custom component to render instead of <a>. Overrides the provider-level default set by XDSLinkProvider. Must accept href, className, style, and children props.',
        },
      ],
    },
    {
      name: 'XDSTopNavMenu',
      displayName: 'Top Nav Menu',
      description:
        'Navigation item that displays a hover-triggered popover menu with rich items containing an icon, title, and optional description.',
      props: [
        {
          name: 'label',
          type: 'string',
          description: 'Visible label for the trigger button.',
          required: true,
        },
        {
          name: 'items',
          type: 'XDSTopNavMenuItemData[]',
          description: 'Menu items to display in the hover popover.',
          required: true,
        },
        {
          name: 'delay',
          type: 'number',
          description:
            'Delay in milliseconds before showing the menu on hover.',
          default: '150',
        },
        {
          name: 'hideDelay',
          type: 'number',
          description:
            'Delay in milliseconds before hiding the menu after the mouse leaves.',
          default: '200',
        },
      ],
    },
    {
      name: 'XDSTopNavMegaMenu',
      displayName: 'Top Nav Mega Menu',
      description:
        'Navigation item that displays a full-width mega menu panel on hover. Uses a slots API with items and featured props. XDSTopNavMegaMenuItem renders itself in both desktop and mobile drawer modes. Supports inline collapsible drawer via render mode context.',
      props: [
        {
          name: 'label',
          type: 'string',
          description: 'Visible label for the trigger button.',
          required: true,
        },
        {
          name: 'items',
          type: 'ReactNode',
          description: 'Menu items slot — typically XDSTopNavMegaMenuItem components, but accepts any ReactNode.',
          slotElements: [{__element: 'XDSTopNavItem', props: {label: 'Item', href: '#'}}],
        },
        {
          name: 'featured',
          type: 'ReactNode',
          description: 'Featured content slot — rendered in the right panel on desktop, below items in the mobile drawer.',
          slotElements: [{__element: 'XDSCard', props: {padding: 4}, children: 'Featured content'}],
        },
        {
          name: 'delay',
          type: 'number',
          description:
            'Delay in milliseconds before showing the menu on hover.',
          default: '150',
        },
        {
          name: 'hideDelay',
          type: 'number',
          description:
            'Delay in milliseconds before hiding the menu after the mouse leaves.',
          default: '250',
        },
        {
          name: 'onOpenChange',
          type: '(isOpen: boolean) => void',
          description:
            'Callback fired when the mega menu opens or closes. Useful for coordinating wrapper styles.',
        },
      ],
    },
    {
      name: 'XDSTopNavMegaMenuItem',
      displayName: 'Top Nav Mega Menu Item',
      description:
        'An individual item inside an XDSTopNavMegaMenu. Renders itself in both desktop (popover grid) and mobile drawer modes via render mode context.',
      props: [
        {
          name: 'title',
          type: 'string',
          description: 'Display title for the menu item.',
          required: true,
        },
        {
          name: 'description',
          type: 'string',
          description: 'Optional description text displayed below the title.',
        },
        {
          name: 'icon',
          type: 'ReactNode',
          description: 'Optional icon element displayed to the left.',
          slotElements: [{__element: 'XDSIcon', props: {icon: 'check', size: 'sm'}}],
        },
        {
          name: 'href',
          type: 'string',
          description: 'URL to navigate to when clicked.',
        },
        {
          name: 'onClick',
          type: '() => void',
          description: 'Callback when item is clicked.',
        },
        {
          name: 'as',
          type: 'XDSLinkComponentType',
          description:
            'Custom component to render instead of <a> for link items. Overrides the provider-level default set by XDSLinkProvider.',
        },
      ],
    },
    {
      name: 'XDSTopNavMegaMenuFeaturedCard',
      displayName: 'Top Nav Mega Menu Featured Card',
      description:
        'Standard featured card for the XDSTopNavMegaMenu featured slot. Provides a consistent card with optional image, title, description, and CTA link.',
      props: [
        {
          name: 'title',
          type: 'string',
          description: 'Card title.',
          required: true,
        },
        {
          name: 'description',
          type: 'string',
          description: 'Description text below the title.',
        },
        {
          name: 'image',
          type: 'string',
          description: 'Optional image URL displayed above the body.',
        },
        {
          name: 'imageAlt',
          type: 'string',
          description: 'Alt text for the image.',
        },
        {
          name: 'linkLabel',
          type: 'string',
          description: 'CTA link text.',
        },
        {
          name: 'linkHref',
          type: 'string',
          description: 'CTA link URL.',
        },
        {
          name: 'children',
          type: 'ReactNode',
          description: 'Custom content rendered below the standard body.',
        },
      ],
    },
  ],
  usage: {
    description:
      'TopNav is a horizontal navigation bar for product-level navigation in application headers. Use TopNav for 5 or fewer always-visible navigation items, or minimal navigation paired with search and controls. For complex navigation hierarchies, use a sidebar; to filter content, use tabs or filter buttons instead.',
    bestPractices: [
      {guidance: true, description: 'Include a product logo and name in the heading slot to clearly identify the application.'},
      {guidance: true, description: 'Limit primary navigation items to 5 or fewer for quick scanning and minimal cognitive load.'},
      {guidance: false, description: 'Avoid using TopNav to filter page content — use Tabs or filter controls instead.'},
      {guidance: false, description: 'Avoid deeply nested navigation hierarchies — keep menus to one level of depth.'},
    ],
    anatomy: [
      {name: 'Product icon and name', required: true, description: 'Identifies the product in the navigation bar.'},
      {name: 'Navigation items', required: true, description: 'Primary links for product-level destinations.'},
      {name: 'More menu', required: false, description: 'Overflow menu for additional navigation items.'},
      {name: 'Flex area', required: false, description: 'Flexible region for search, primary action buttons, or other controls.'},
    ],
  },
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'TopNav',
  displayName: 'Top Nav',
  theming: {
    targets: [
      {className: 'xds-top-nav', states: ['mode']},
      {className: 'xds-top-nav-item', states: ['mode']},
      {className: 'xds-top-nav-heading'},
      {className: 'xds-top-nav-mega-menu', states: ['mode']},
      {className: 'xds-top-nav-mega-menu-item', states: ['mode']},
      {className: 'xds-top-nav-mega-menu-featured-card'},
      {className: 'xds-top-nav-menu'},
    ],
  },
  components: [
    {
      name: 'XDSTopNav',
      displayName: 'Top Nav',
      description: '采用插槽式布局的主导航栏容器。children 可作为 startContent 的别名。',
      props: [
        {
          name: 'heading',
          type: 'ReactNode',
          description:
            '标题插槽内容（标志、品牌）— 位于导航栏的左边缘。',
        },
        {
          name: 'startContent',
          type: 'ReactNode',
          description:
            '起始内容插槽，用于导航项或面包屑 — 位于标题之后，左对齐。',
        },
        {
          name: 'children',
          type: 'ReactNode',
          description:
            'startContent 的别名。与 heading、centerContent 或 endContent 组合时优先使用 startContent；children 可避免常见 React 导航项写法被静默丢弃。',
        },
        {
          name: 'centerContent',
          type: 'ReactNode',
          description:
            '居中内容插槽（标签页、搜索栏、主导航）— 提供时，布局切换为三列 CSS grid 以实现真正的水平居中。',
        },
        {
          name: 'endContent',
          type: 'ReactNode',
          description:
            '末尾内容插槽，用于搜索、图标或用户头像 — 位于右边缘。',
        },
        {
          name: 'label',
          type: 'string',
          description:
            '导航地标的无障碍标签，作为 aria-label 应用于 <nav> 元素。',
        },
        {
          name: 'xstyle',
          type: 'StyleXStyles',
          description:
            '用于布局自定义的 StyleX 样式（外边距、定位、尺寸）。必须是 stylex.create() 的值 — 不能是内联样式对象如 style={{}}。',
        },
      ],
    },
    {
      name: 'XDSTopNavHeading',
      displayName: 'Top Nav Heading',
      description:
        'XDSTopNav 标题插槽的产品/套件/账户标题组件。支持智能交互边界逻辑：标志、标题文本、独立链接的上标题/下标题，以及带自动箭头指示器的可选菜单弹出层。',
      props: [
        {
          name: 'logo',
          type: 'ReactNode',
          description:
            '在标题文本前显示的标志元素。可以是图片、XDSNavIcon 或任何 ReactNode。',
        },
        {
          name: 'heading',
          type: 'string',
          description: '作为主标题文本显示的产品/应用名称。',
        },
        {
          name: 'headingHref',
          type: 'string',
          description:
            '标题文本的链接（如产品首页）。当没有菜单且这是唯一的 href 时，整个标题变为一个可点击链接。',
        },
        {
          name: 'href',
          type: 'string',
          description:
            '已弃用 — 请使用 headingHref。点击时导航到的 URL。',
        },
        {
          name: 'superheading',
          type: 'string',
          description:
            '标题上方的文本（如套件名称）。以较小的次要样式渲染。',
        },
        {
          name: 'superheadingHref',
          type: 'string',
          description:
            '上标题文本的链接（如套件首页）。与菜单一起提供时，渲染为独立的内联链接。',
        },
        {
          name: 'subheading',
          type: 'string',
          description:
            '标题下方的文本（如账户上下文）。以较小的次要样式渲染。',
        },
        {
          name: 'subheadingHref',
          type: 'string',
          description:
            '下标题文本的链接。与菜单一起提供时，渲染为独立的内联链接。',
        },
        {
          name: 'headerEndContent',
          type: 'ReactNode',
          description:
            '在标题行尾部渲染的内容（如徽章或状态指示器）。',
        },
        {
          name: 'menu',
          type: 'ReactNode',
          description:
            '在弹出层下拉菜单中显示的菜单内容。提供时自动显示箭头指示器。交互边界由 href 的存在决定：没有 href 时整个标题为触发器；有 href 时链接独立，箭头区域为触发器。',
        },
        {
          name: 'as',
          type: 'XDSLinkComponentType',
          description:
            '用于替代 <a> 的自定义链接组件。覆盖 XDSLinkProvider 设置的默认组件。必须接受 href、className、style 和 children 属性。',
        },
        {
          name: 'xstyle',
          type: 'StyleXStyles',
          description:
            '用于布局自定义的 StyleX 样式。必须是 stylex.create() 的值。',
        },
      ],
    },
    {
      name: 'XDSTopNavItem',
      displayName: 'Top Nav Item',
      description:
        '用于 XDSTopNav startContent 的导航链接项 — 渲染为具有悬停和选中状态的锚点。',
      props: [
        {
          name: 'label',
          type: 'string',
          description:
            '导航项的无障碍标签。用作可见文本，或作为仅图标项的 aria-label。',
          required: true,
        },
        {
          name: 'href',
          type: 'string',
          description: '导航目标 URL。',
        },
        {
          name: 'isSelected',
          type: 'boolean',
          description:
            '此导航项是否为当前选中状态。设置 aria-current="page" 并应用高亮样式。',
          default: 'false',
        },
        {
          name: 'isDisabled',
          type: 'boolean',
          description:
            '导航项是否被禁用。设置 aria-disabled 并阻止交互。',
          default: 'false',
        },
        {
          name: 'icon',
          type: 'ReactNode',
          description:
            '在标签前显示的可选图标。如果在没有子元素的情况下提供，项目变为仅图标模式。',
        },
        {
          name: 'children',
          type: 'ReactNode',
          description:
            '替代标签文本渲染的自定义内容。省略且提供了图标时，项目变为仅图标模式。',
        },
        {
          name: 'as',
          type: 'XDSLinkComponentType',
          description:
            '替代 <a> 渲染的自定义组件。覆盖 XDSLinkProvider 设置的提供者级别默认值。必须接受 href、className、style 和 children 属性。',
        },
      ],
    },
    {
      name: 'XDSTopNavMenu',
      displayName: 'Top Nav Menu',
      description:
        '导航项，在悬停时显示弹出菜单，包含带图标、标题和可选描述的丰富菜单项。',
      props: [
        {
          name: 'label',
          type: 'string',
          description: '触发按钮的可见标签。',
          required: true,
        },
        {
          name: 'items',
          type: 'XDSTopNavMenuItemData[]',
          description: '在悬停弹出框中显示的菜单项。',
          required: true,
        },
        {
          name: 'delay',
          type: 'number',
          description:
            '悬停时显示菜单前的延迟（毫秒）。',
          default: '150',
        },
        {
          name: 'hideDelay',
          type: 'number',
          description:
            '鼠标离开后隐藏菜单的延迟（毫秒）。',
          default: '200',
        },
      ],
    },
    {
      name: 'XDSTopNavMegaMenu',
      displayName: 'Top Nav Mega Menu',
      description:
        '导航项，在悬停时显示全宽超级菜单面板。使用插槽 API（items 和 featured）。XDSTopNavMegaMenuItem 在桌面和移动抽屉模式中自行渲染。',
      props: [
        {
          name: 'label',
          type: 'string',
          description: '触发按钮的可见标签。',
          required: true,
        },
        {
          name: 'items',
          type: 'ReactNode',
          description: '菜单项插槽 — 通常为 XDSTopNavMegaMenuItem 组件，但接受任何 ReactNode。',
        },
        {
          name: 'featured',
          type: 'ReactNode',
          description: '特色内容插槽 — 桌面端显示在右侧面板，移动抽屉中显示在项目下方。',
        },
        {
          name: 'delay',
          type: 'number',
          description:
            '悬停时显示菜单前的延迟（毫秒）。',
          default: '150',
        },
        {
          name: 'hideDelay',
          type: 'number',
          description:
            '鼠标离开后隐藏菜单的延迟（毫秒）。',
          default: '250',
        },
        {
          name: 'onOpenChange',
          type: '(isOpen: boolean) => void',
          description:
            '超级菜单打开或关闭时触发的回调。用于协调包装器样式。',
        },
      ],
    },
    {
      name: 'XDSTopNavMegaMenuItem',
      displayName: 'Top Nav Mega Menu Item',
      description:
        '超级菜单中的单个项目。在桌面端（弹出层网格）和移动抽屉模式中都会自行渲染。',
      props: [
        {
          name: 'title',
          type: 'string',
          description: '菜单项的显示标题。',
          required: true,
        },
        {
          name: 'description',
          type: 'string',
          description: '标题下方的可选描述文本。',
        },
        {
          name: 'icon',
          type: 'ReactNode',
          description: '左侧显示的可选图标元素。',
        },
        {
          name: 'href',
          type: 'string',
          description: '点击时导航的 URL。',
        },
        {
          name: 'onClick',
          type: '() => void',
          description: '点击项目时的回调。',
        },
        {
          name: 'as',
          type: 'XDSLinkComponentType',
          description:
            '用于替代 <a> 的自定义链接组件。覆盖 XDSLinkProvider 设置的默认组件。',
        },
      ],
    },
    {
      name: 'XDSTopNavMegaMenuFeaturedCard',
      displayName: 'Top Nav Mega Menu Featured Card',
      description:
        '超级菜单 featured 插槽的标准特色卡片。提供带可选图片、标题、描述和 CTA 链接的一致卡片。',
      props: [
        {
          name: 'title',
          type: 'string',
          description: '卡片标题。',
          required: true,
        },
        {
          name: 'description',
          type: 'string',
          description: '标题下方的描述文本。',
        },
        {
          name: 'image',
          type: 'string',
          description: '正文上方显示的可选图片 URL。',
        },
        {
          name: 'imageAlt',
          type: 'string',
          description: '图片的替代文本。',
        },
        {
          name: 'linkLabel',
          type: 'string',
          description: 'CTA 链接文本。',
        },
        {
          name: 'linkHref',
          type: 'string',
          description: 'CTA 链接 URL。',
        },
        {
          name: 'children',
          type: 'ReactNode',
          description: '标准正文下方渲染的自定义内容。',
        },
      ],
    },
  ],
  usage: {
    description:
      'TopNav is a horizontal navigation bar for product-level navigation in application headers. Use TopNav for 5 or fewer always-visible navigation items, or minimal navigation paired with search and controls. For complex navigation hierarchies, use a sidebar; to filter content, use tabs or filter buttons instead.',
    bestPractices: [
      {guidance: true, description: 'Include a product logo and name in the heading slot to clearly identify the application.'},
      {guidance: true, description: 'Limit primary navigation items to 5 or fewer for quick scanning and minimal cognitive load.'},
      {guidance: false, description: 'Avoid using TopNav to filter page content — use Tabs or filter controls instead.'},
      {guidance: false, description: 'Avoid deeply nested navigation hierarchies — keep menus to one level of depth.'},
    ],
    anatomy: [
      {name: 'Product icon and name', required: true, description: 'Identifies the product in the navigation bar.'},
      {name: 'Navigation items', required: true, description: 'Primary links for product-level destinations.'},
      {name: 'More menu', required: false, description: 'Overflow menu for additional navigation items.'},
      {name: 'Flex area', required: false, description: 'Flexible region for search, primary action buttons, or other controls.'},
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'Top navigation bar for app headers w/ slot-based layout+companion nav item components.',
  usage: {
    description:
      'TopNav is a horizontal navigation bar for product-level navigation in application headers. Use TopNav for 5 or fewer always-visible navigation items, or minimal navigation paired with search and controls. For complex navigation hierarchies, use a sidebar; to filter content, use tabs or filter buttons instead.',
    bestPractices: [
      {guidance: true, description: 'Include a product logo and name in the heading slot to clearly identify the application.'},
      {guidance: true, description: 'Limit primary navigation items to 5 or fewer for quick scanning and minimal cognitive load.'},
      {guidance: false, description: 'Avoid using TopNav to filter page content — use Tabs or filter controls instead.'},
      {guidance: false, description: 'Avoid deeply nested navigation hierarchies — keep menus to one level of depth.'},
    ],
    anatomy: [
      {name: 'Product icon and name', required: true, description: 'Identifies the product in the navigation bar.'},
      {name: 'Navigation items', required: true, description: 'Primary links for product-level destinations.'},
      {name: 'More menu', required: false, description: 'Overflow menu for additional navigation items.'},
      {name: 'Flex area', required: false, description: 'Flexible region for search, primary action buttons, or other controls.'},
    ],
  },
  components: [
    {
      name: 'XDSTopNav',
      displayName: 'Top Nav',
      description: 'Main nav bar container w/ slot-based layout; children alias startContent.',
      propDescriptions: {
        heading: 'Heading slot (logo, brand) at left edge.',
        startContent: 'Nav items/breadcrumbs after heading, left-aligned.',
        children: 'Alias for startContent; prefer startContent with other slots.',
        centerContent: 'Center slot (tabs, search); switches to 3-column CSS grid for true centering.',
        endContent: 'Search/icons/profile at right edge.',
        label: 'A11y label for nav landmark, aria-label on <nav>.',
        xstyle: 'StyleX layout styles (margins, positioning). Must be stylex.create() value.',
      },
    },
    {
      name: 'XDSTopNavHeading',
      displayName: 'Top Nav Heading',
      description: 'Product/suite heading for XDSTopNav; logo+heading text w/ smart interaction boundaries, optional menu popover, superheading/subheading w/ independent links.',
      propDescriptions: {
        logo: 'Logo before heading text. Image, XDSNavIcon, or ReactNode.',
        heading: 'Product/app name.',
        headingHref: 'Link for heading (product home). Only href + no menu → whole heading is link.',
        href: 'Deprecated — use headingHref.',
        superheading: 'Text above heading (suite name). Smaller secondary style.',
        superheadingHref: 'Link for superheading. Independent inline link when menu present.',
        subheading: 'Text below heading (account context). Smaller secondary style.',
        subheadingHref: 'Link for subheading. Independent inline link when menu present.',
        headerEndContent: 'Trailing edge content (badge, status indicator).',
        menu: 'Popover dropdown content. Shows chevron auto. No hrefs → whole header triggers; with hrefs → chevron area triggers.',
        as: 'Custom link component. Overrides XDSLinkProvider default. Must accept href, className, style, children.',
        xstyle: 'StyleX layout styles. Must be stylex.create() value.',
      },
    },
    {
      name: 'XDSTopNavItem',
      displayName: 'Top Nav Item',
      description: 'Nav link for XDSTopNav startContent; renders as anchor w/ hover+selected states.',
      propDescriptions: {
        label: 'Visible text or aria-label when isIconOnly is true.',
        href: 'Navigation URL.',
        isSelected: 'Sets aria-current="page"+highlighted styles.',
        isDisabled: 'Sets aria-disabled, prevents interaction.',
        icon: 'Icon before label.',
        children: 'Custom content instead of label text.',
        as: 'Custom link component. Overrides XDSLinkProvider default. Must accept href, className, style, children.',
      },
    },
    {
      name: 'XDSTopNavMenu',
      displayName: 'Top Nav Menu',
      description: 'Nav item w/ hover-triggered popover menu containing rich items w/ icon, title, optional description.',
      propDescriptions: {
        label: 'Trigger button visible label.',
        items: 'Menu items in hover popover.',
        delay: 'Show delay ms on hover.',
        hideDelay: 'Hide delay ms after mouse leaves.',
      },
    },
    {
      name: 'XDSTopNavMegaMenu',
      displayName: 'Top Nav Mega Menu',
      description: 'Nav item w/ full-width mega menu panel on hover. Slots API w/ items+featured ReactNode props. Mobile drawer inline collapsible.',
      propDescriptions: {
        label: 'Trigger button visible label.',
        items: 'Menu items slot — typically XDSTopNavMegaMenuItem, accepts any ReactNode.',
        featured: 'Featured content slot — right panel desktop, below items in drawer.',
        delay: 'Show delay ms on hover.',
        hideDelay: 'Hide delay ms after mouse leaves.',
        onOpenChange: 'Fired on open/close. For coordinating wrapper styles.',
      },
    },
    {
      name: 'XDSTopNavMegaMenuItem',
      displayName: 'Top Nav Mega Menu Item',
      description: 'Individual mega menu item. Renders in desktop popover grid + mobile drawer modes via context.',
      propDescriptions: {
        title: 'Display title.',
        description: 'Description below title.',
        icon: 'Left icon element.',
        href: 'Navigation URL.',
        onClick: 'Click callback.',
        as: 'Custom link component, overrides XDSLinkProvider default.',
      },
    },
    {
      name: 'XDSTopNavMegaMenuFeaturedCard',
      displayName: 'Top Nav Mega Menu Featured Card',
      description: 'Standard featured card for mega menu featured slot. Optional image, title, description, CTA link.',
      propDescriptions: {
        title: 'Card title.',
        description: 'Description below title.',
        image: 'Image URL above body.',
        imageAlt: 'Image alt text.',
        linkLabel: 'CTA link text.',
        linkHref: 'CTA link URL.',
        children: 'Custom content below standard body.',
      },
    },
  ],
};
