/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'TopNav',
  description:
    'Top navigation bar component for application headers with slot-based layout and companion nav item components.',
  features: [
    'Slot-based layout — title, startContent, centerContent, and endContent slots for flexible organization',
    'Three-column centering — when centerContent is provided, switches to CSS grid (1fr auto 1fr) for true horizontal centering',
    'Companion components — XDSTopNavTitle, XDSTopNavItem, XDSTopNavMenu, XDSTopNavMegaMenu',
    'Accessible — uses role="navigation" with aria-label, aria-current="page" on selected items',
    'Themeable via className — target .xds-top-nav and sub-component classes',
    'Link customization — XDSTopNavItem accepts an as prop to swap the anchor element (e.g. for React Router)',
  ],
  examples: [
    {
      label: 'Basic nav with title and items',
      code: `<XDSTopNav
  label="Main navigation"
  title={
    <XDSTopNavTitle
      title="My App"
      logo={<XDSNavIcon icon={<HomeIcon style={{width: 16, height: 16}} />} />}
      href="/"
    />
  }
  startContent={
    <>
      <XDSTopNavItem label="Dashboard" href="/dashboard" isSelected />
      <XDSTopNavItem label="Products" href="/products" />
      <XDSTopNavItem label="Reports" href="/reports" />
    </>
  }
  endContent={
    <>
      <XDSButton
        label="Notifications"
        variant="ghost"
        icon={<BellIcon style={{width: 16, height: 16}} />}
      />
      <XDSButton
        label="Profile"
        variant="ghost"
        icon={<UserCircleIcon style={{width: 16, height: 16}} />}
      />
    </>
  }
/>`,
    },
    {
      label: 'With centered content (three-column layout)',
      code: `<XDSTopNav
  label="Main navigation"
  title={<XDSTopNavTitle title="My App" href="/" />}
  startContent={<XDSTopNavItem label="Home" href="/" isSelected />}
  centerContent={<SearchBar />}
  endContent={<Avatar />}
/>`,
    },
    {
      label: 'With hover menu and mega menu',
      code: `<XDSTopNav
  label="Main navigation"
  title={<XDSTopNavTitle title="My App" href="/" />}
  startContent={
    <>
      <XDSTopNavItem label="Home" href="/" isSelected />
      <XDSTopNavMenu
        label="Products"
        items={[
          {title: 'Analytics', description: 'View metrics', href: '/analytics'},
          {title: 'Reports', description: 'Generate reports', href: '/reports'},
        ]}
      />
      <XDSTopNavMegaMenu
        label="Solutions"
        items={[
          {title: 'Enterprise', description: 'For large teams', icon: <BuildingIcon />, href: '/enterprise'},
          {title: 'Startups', description: 'Move fast', icon: <RocketIcon />, href: '/startups'},
        ]}
        featured={{
          title: 'New: AI Features',
          description: 'Explore our latest AI-powered tools.',
          linkText: 'Learn more →',
          linkHref: '/ai',
        }}
      />
    </>
  }
/>`,
    },
    {
      label: 'In XDSLayout header slot',
      code: `<XDSLayout
  header={
    <XDSTopNav
      label="Main navigation"
      title={<XDSTopNavTitle title="My App" logo={<Logo />} href="/" />}
      startContent={
        <>
          <XDSTopNavItem label="Home" href="/" isSelected />
          <XDSTopNavItem label="Settings" href="/settings" />
        </>
      }
      endContent={<Avatar />}
    />
  }
  content={
    <XDSLayoutContent role="main">
      <MainContent />
    </XDSLayoutContent>
  }
/>`,
    },
  ],
  theming: {
    targets: [
      {className: 'xds-top-nav'},
      {className: 'xds-top-nav-item'},
      {className: 'xds-top-nav-title'},
      {className: 'xds-top-nav-mega-menu'},
    ],
  },
  accessibility: [
    'XDSTopNav renders a <nav> element with role="navigation" and aria-label set from the label prop',
    'XDSTopNavItem sets aria-current="page" when isSelected is true',
    'XDSTopNavItem sets aria-label for icon-only items (when icon is provided and no children or label text is visible)',
    'XDSTopNavItem sets aria-disabled and tabIndex=-1 when isDisabled is true',
    'XDSTopNavMenu sets aria-haspopup="true" on the trigger button',
    'XDSTopNavMegaMenu sets aria-haspopup="true" and aria-expanded on the trigger button',
    'XDSTopNavMegaMenu menu items are unreachable by keyboard (tabIndex=-1) when the panel is closed',
    'Escape key closes the XDSTopNavMegaMenu panel',
  ],
  keyboard:
    'Tab to navigate between items; Escape closes XDSTopNavMegaMenu panels',
  notes: [
    'Default height is 48px (--spacing-12) with 16px horizontal padding',
    'Uses --color-navbar token for background (defaults to white)',
    'Without centerContent: title and startContent grow to push endContent right (flex layout)',
    'With centerContent: switches to CSS grid (gridTemplateColumns: 1fr auto 1fr) — the right column is always rendered even when endContent is absent to maintain the three-column structure',
    'Positioning (sticky/fixed) is handled by the layout system (e.g. XDSAppShell), not TopNav itself',
    'Dividers are controlled by the layout system (e.g. XDSLayoutHeader hasDivider), not TopNav',
    'XDSTopNavMegaMenu panels position relative to the nearest positioned ancestor — wrap XDSTopNav in a container with position: relative for correct full-width behavior',
  ],
  components: [
    {
      name: 'XDSTopNav',
      description: 'Main navigation bar container with slot-based layout.',
      props: [
        {
          name: 'title',
          type: 'ReactNode',
          description:
            'Title slot content (logo, brand) — positioned at the left edge of the nav bar.',
        },
        {
          name: 'startContent',
          type: 'ReactNode',
          description:
            'Start content slot for navigation items or breadcrumbs — positioned after the title, left-aligned.',
        },
        {
          name: 'centerContent',
          type: 'ReactNode',
          description:
            'Center content slot (tabs, search bar, primary navigation) — when provided, switches the layout to a three-column CSS grid for true horizontal centering.',
        },
        {
          name: 'endContent',
          type: 'ReactNode',
          description:
            'End content slot for search, icons, or user profile — positioned at the right edge.',
        },
        {
          name: 'label',
          type: 'string',
          description:
            'Accessible label for the navigation landmark, applied as aria-label on the <nav> element.',
        },
      ],
      examples: [
        {
          label: 'Basic',
          code: `<XDSTopNav
  label="Main navigation"
  title={<XDSTopNavTitle title="My App" href="/" />}
  startContent={<XDSTopNavItem label="Dashboard" href="/dashboard" isSelected />}
  endContent={<XDSButton label="Profile" variant="ghost" />}
/>`,
        },
        {
          label: 'With centered content',
          code: `<XDSTopNav
  label="Main navigation"
  title={<XDSTopNavTitle title="My App" href="/" />}
  centerContent={<SearchInput placeholder="Search..." />}
  endContent={<Avatar />}
/>`,
        },
      ],
    },
    {
      name: 'XDSTopNavTitle',
      description:
        'Title component for the XDSTopNav title slot — displays a logo and/or title text, optionally as a clickable link.',
      props: [
        {
          name: 'title',
          type: 'string',
          description: 'Title text to display.',
        },
        {
          name: 'logo',
          type: 'ReactNode',
          description:
            'Logo element to display before the title text. Can be an image, XDSNavIcon, or any ReactNode.',
        },
        {
          name: 'href',
          type: 'string',
          description:
            'URL to navigate to when clicked. When provided, renders as an anchor element.',
        },
      ],
      examples: [
        {
          label: 'Logo with text link',
          code: `<XDSTopNavTitle
  title="My App"
  logo={<img src="/logo.svg" alt="" width={24} height={24} />}
  href="/"
/>`,
        },
        {
          label: 'With XDSNavIcon',
          code: `<XDSTopNavTitle
  title="Dashboard"
  logo={<XDSNavIcon icon={<HomeIcon style={{width: 16, height: 16}} />} />}
  href="/"
/>`,
        },
        {
          label: 'Logo only',
          code: `<XDSTopNavTitle logo={<BrandLogo />} href="/" />`,
        },
      ],
    },
    {
      name: 'XDSTopNavItem',
      description:
        'Navigation link item for use in XDSTopNav startContent — renders as an anchor with hover and selected states.',
      props: [
        {
          name: 'label',
          type: 'string',
          description:
            'Accessible label for the nav item. Used as visible text, or as aria-label for icon-only items.',
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
          name: 'icon',
          type: 'ReactNode',
          description:
            'Optional icon to display before the label. If provided without children, the item becomes icon-only.',
        },
        {
          name: 'children',
          type: 'ReactNode',
          description:
            'Custom content to render instead of the label text. When omitted and an icon is provided, the item becomes icon-only.',
        },
        {
          name: 'as',
          type: 'XDSLinkComponentType',
          description:
            'Custom component to render instead of <a>. Overrides the provider-level default set by XDSLinkProvider. Must accept href, className, style, and children props.',
        },
      ],
      examples: [
        {
          label: 'Basic nav items',
          code: `<>
  <XDSTopNavItem label="Home" href="/" isSelected />
  <XDSTopNavItem label="Products" href="/products" />
  <XDSTopNavItem label="Settings" href="/settings" isDisabled />
</>`,
        },
        {
          label: 'With icon',
          code: `<XDSTopNavItem
  label="Settings"
  href="/settings"
  icon={<GearIcon style={{width: 16, height: 16}} />}
/>`,
        },
        {
          label: 'Icon only',
          code: `<XDSTopNavItem
  label="Notifications"
  href="/notifications"
  icon={<BellIcon style={{width: 16, height: 16}} />}
/>`,
        },
      ],
    },
    {
      name: 'XDSTopNavMenu',
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
      examples: [
        {
          label: 'Basic hover menu',
          code: `<XDSTopNavMenu
  label="Products"
  items={[
    {title: 'Analytics', description: 'View metrics', href: '/analytics'},
    {title: 'Reports', description: 'Generate reports', href: '/reports'},
  ]}
/>`,
        },
        {
          label: 'With icons and click handlers',
          code: `<XDSTopNavMenu
  label="Tools"
  items={[
    {
      title: 'Analytics',
      description: 'Track and analyze user behavior',
      icon: <ChartBarIcon />,
      href: '/analytics',
    },
    {
      title: 'Export',
      description: 'Download your data',
      icon: <ArrowDownTrayIcon />,
      onClick: () => openExportDialog(),
    },
  ]}
/>`,
        },
      ],
    },
    {
      name: 'XDSTopNavMegaMenu',
      description:
        'Navigation item that displays a full-width mega menu panel on hover, with items in a two-column grid and an optional featured content area.',
      props: [
        {
          name: 'label',
          type: 'string',
          description: 'Visible label for the trigger button.',
          required: true,
        },
        {
          name: 'items',
          type: 'XDSTopNavMegaMenuItemData[]',
          description: 'Menu items to display in the mega menu panel.',
          required: true,
        },
        {
          name: 'featured',
          type: 'XDSTopNavMegaMenuFeatured',
          description:
            'Optional featured content displayed on the right side of the mega menu panel.',
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
          name: 'isSingleColumn',
          type: 'boolean',
          description:
            'Whether to use a single-column layout for menu items instead of two columns.',
          default: 'false',
        },
        {
          name: 'onOpenChange',
          type: '(isOpen: boolean) => void',
          description:
            'Callback fired when the mega menu opens or closes. Useful for coordinating wrapper styles.',
        },
      ],
      examples: [
        {
          label: 'With featured content',
          code: `<div style={{position: 'relative'}}>
  <XDSTopNav
    startContent={
      <XDSTopNavMegaMenu
        label="Solutions"
        items={[
          {title: 'Enterprise', description: 'For large teams', icon: <BuildingIcon />, href: '/enterprise'},
          {title: 'Startups', description: 'Move fast', icon: <RocketIcon />, href: '/startups'},
        ]}
        featured={{
          title: 'New: AI Features',
          description: 'Explore our latest AI-powered tools.',
          linkText: 'Learn more →',
          linkHref: '/ai',
        }}
      />
    }
  />
</div>`,
        },
        {
          label: 'Single column layout',
          code: `<XDSTopNavMegaMenu
  label="Products"
  isSingleColumn
  items={[
    {title: 'Analytics', description: 'Track behavior', icon: <ChartIcon />, href: '/analytics'},
    {title: 'Messaging', description: 'Real-time comms', icon: <ChatIcon />, href: '/messaging'},
    {title: 'Storage', description: 'Manage your data', icon: <DatabaseIcon />, href: '/storage'},
  ]}
/>`,
        },
      ],
    },
  ],
};
