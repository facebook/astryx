/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'SideNav',
  description:
    'Sidebar navigation component for application pages. Supports sections, nested items, selected state, icons, and responsive collapse.',
  features: [
    'Five-zone layout: header, topContent, children (scrollable), footer, footerIcons',
    'Smart header interaction boundary logic — links and menu trigger coexist without overlap',
    'Nested items via children on XDSSideNavItem',
    'Selected state with optional alternate icon for filled/outline variants',
    'Section grouping with optional title, subtitle, and end content',
    'Accessible — nav landmark, aria-current="page", role="group" with aria-labelledby on sections',
    'Keyboard navigable — Tab through items, Enter/Space to activate',
  ],
  accessibility: [
    '<nav aria-label="Side navigation"> wraps the entire component',
    'aria-current="page" is applied to the selected item',
    'Sections use role="group" with aria-labelledby pointing to the section title',
    'isHeaderHidden visually hides the section title while keeping it accessible to screen readers',
  ],
  keyboard: 'Tab through items, Enter/Space to activate links',
  theming: {
    targets: [
      {className: 'xds-side-nav'},
      {className: 'xds-side-nav-heading'},
      {className: 'xds-side-nav-item'},
      {className: 'xds-side-nav-section'},
    ],
  },
  notes: [
    'When used inside XDSAppShell alongside XDSTopNav, omit XDSSideNavHeading — the TopNav already provides app identity and including the header would duplicate it.',
    'Without a TopNav, include XDSSideNavHeading to provide app identity.',
    'Header interaction model: headingHref only → whole header is one link; headingHref + superheadingHref, no menu → each text is an independent link; menu only, no hrefs → whole header is the popover trigger; menu + hrefs → links are independent <a> elements, chevron/remaining area is the popover trigger.',
    'Depends on useXDSPopover for the header menu popover and XDSIcon for rendering icon components in nav items.',
  ],
  examples: [
    {
      label: 'With XDSAppShell + TopNav (no header)',
      code: `// TopNav provides identity → SideNav has no header
<XDSAppShell
  topNav={<XDSTopNav heading={<XDSTopNavHeading heading="My App" />} />}
  sideNav={
    <XDSSideNav>
      <XDSSideNavSection title="Main" isHeaderHidden>
        <XDSSideNavItem
          label="Dashboard"
          icon={HomeIcon}
          isSelected
          href="/dashboard"
        />
        <XDSSideNavItem label="Projects" icon={FolderIcon} href="/projects" />
      </XDSSideNavSection>
    </XDSSideNav>
  }>
  <Content />
</XDSAppShell>`,
    },
    {
      label: 'Standalone (no TopNav)',
      code: `// No TopNav → SideNav header provides identity
<XDSAppShell
  sideNav={
    <XDSSideNav
      header={
        <XDSSideNavHeading icon={<AppIcon />} heading="My App" headingHref="/" />
      }
      topContent={<XDSButton label="Create new" variant="primary" />}
      footerIcons={<XDSButton icon={HelpIcon} variant="ghost" label="Help" />}>
      <XDSSideNavSection title="Main">
        <XDSSideNavItem
          label="Dashboard"
          icon={HomeIcon}
          selectedIcon={HomeIconSolid}
          isSelected
          href="/dashboard"
        />
        <XDSSideNavItem
          label="Projects"
          icon={FolderIcon}
          href="/projects"
          endContent={<XDSBadge>3</XDSBadge>}
        />
      </XDSSideNavSection>

      <XDSSideNavSection title="Settings">
        <XDSSideNavItem label="General" href="/settings/general" />
        <XDSSideNavItem label="Security" href="/settings/security" />
      </XDSSideNavSection>
    </XDSSideNav>
  }>
  <Content />
</XDSAppShell>`,
    },
  ],
  components: [
    {
      name: 'XDSSideNav',
      description:
        'Container with five zones: header, topContent, children (scrollable), footer, and footerIcons.',
      props: [
        {
          name: 'header',
          type: 'ReactNode',
          description: 'Header area (typically XDSSideNavHeading). Sticky.',
        },
        {
          name: 'topContent',
          type: 'ReactNode',
          description: 'Content below the header, e.g., a create button.',
        },
        {
          name: 'children',
          type: 'ReactNode',
          description: 'Navigation sections and items. Scrollable.',
        },
        {
          name: 'footer',
          type: 'ReactNode',
          description: 'Footer area above the icon bar.',
        },
        {
          name: 'footerIcons',
          type: 'ReactNode',
          description: 'Footer icon bar.',
        },
      ],
      examples: [
        {
          label: 'Basic',
          code: `<XDSSideNav
  header={<XDSSideNavHeading icon={<AppIcon />} heading="My App" headingHref="/" />}
  topContent={<XDSButton label="Create new" variant="primary" />}>
  <XDSSideNavSection title="Main">
    <XDSSideNavItem label="Dashboard" icon={HomeIcon} isSelected href="/dashboard" />
    <XDSSideNavItem label="Projects" icon={FolderIcon} href="/projects" />
  </XDSSideNavSection>
</XDSSideNav>`,
        },
      ],
    },
    {
      name: 'XDSSideNavHeading',
      description:
        'Product/suite/account heading with smart interaction boundary logic for links and a menu popover.',
      props: [
        {
          name: 'heading',
          type: 'string',
          description: 'Product/app name.',
          required: true,
        },
        {
          name: 'icon',
          type: 'ReactNode',
          description: 'Product/app icon.',
        },
        {
          name: 'headingHref',
          type: 'string',
          description: 'Link for the heading.',
        },
        {
          name: 'superheading',
          type: 'string',
          description: 'Text above the heading.',
        },
        {
          name: 'superheadingHref',
          type: 'string',
          description: 'Link for the superheading.',
        },
        {
          name: 'subheading',
          type: 'string',
          description: 'Text below the heading.',
        },
        {
          name: 'subheadingHref',
          type: 'string',
          description: 'Link for the subheading.',
        },
        {
          name: 'menu',
          type: 'ReactNode',
          description: 'Menu content rendered inside a popover.',
        },
      ],
      examples: [
        {
          label: 'Title link only',
          code: `<XDSSideNavHeading icon={<AppIcon />} heading="My App" headingHref="/" />`,
        },
        {
          label: 'With superheading and subheading',
          code: `<XDSSideNavHeading
  icon={<AppIcon />}
  superheading="Acme Corp"
  superheadingHref="/org"
  heading="My App"
  headingHref="/"
  subheading="v2.0"
/>`,
        },
        {
          label: 'With menu',
          code: `<XDSSideNavHeading
  icon={<AppIcon />}
  heading="My App"
  headingHref="/"
  menu={<WorkspaceSwitcher />}
/>`,
        },
      ],
    },
    {
      name: 'XDSSideNavItem',
      description:
        'Navigation item with icon, selected state, optional end content, and nesting support via children.',
      props: [
        {
          name: 'label',
          type: 'string',
          description: 'Item label.',
          required: true,
        },
        {
          name: 'as',
          type: 'XDSLinkComponentType',
          description: 'Custom link component.',
        },
        {
          name: 'icon',
          type: 'XDSIconType',
          description: 'Icon displayed in the outline (unselected) variant.',
        },
        {
          name: 'selectedIcon',
          type: 'XDSIconType',
          description:
            'Icon displayed when the item is selected (filled variant).',
        },
        {
          name: 'isSelected',
          type: 'boolean',
          description: 'Marks this item as the current page.',
          default: 'false',
        },
        {
          name: 'isDisabled',
          type: 'boolean',
          description: 'Disabled state.',
          default: 'false',
        },
        {
          name: 'href',
          type: 'string',
          description: 'Navigation URL.',
        },
        {
          name: 'onClick',
          type: '(e: MouseEvent) => void',
          description: 'Click handler.',
        },
        {
          name: 'endContent',
          type: 'ReactNode',
          description: 'Right-side content such as badges or counts.',
        },
        {
          name: 'children',
          type: 'ReactNode',
          description: 'Sub-items for nesting.',
        },
      ],
      examples: [
        {
          label: 'Basic link',
          code: `<XDSSideNavItem label="Dashboard" icon={HomeIcon} href="/dashboard" />`,
        },
        {
          label: 'Selected with alternate icon and badge',
          code: `<XDSSideNavItem
  label="Dashboard"
  icon={HomeIcon}
  selectedIcon={HomeIconSolid}
  isSelected
  href="/dashboard"
  endContent={<XDSBadge>3</XDSBadge>}
/>`,
        },
        {
          label: 'Nested items',
          code: `<XDSSideNavItem label="Settings" icon={GearIcon} href="/settings">
  <XDSSideNavItem label="General" href="/settings/general" />
  <XDSSideNavItem label="Security" href="/settings/security" />
</XDSSideNavItem>`,
        },
      ],
    },
    {
      name: 'XDSSideNavSection',
      description:
        'Section grouping with an optional title, subtitle, and end content.',
      props: [
        {
          name: 'title',
          type: 'string',
          description: 'Section title.',
          required: true,
        },
        {
          name: 'subtitle',
          type: 'string',
          description: 'Section subtitle.',
        },
        {
          name: 'children',
          type: 'ReactNode',
          description: 'Section items.',
        },
        {
          name: 'endContent',
          type: 'ReactNode',
          description: 'Right-side content in the section header.',
        },
        {
          name: 'isHeaderHidden',
          type: 'boolean',
          description:
            'Visually hides the section header while keeping it accessible to screen readers.',
          default: 'false',
        },
      ],
      examples: [
        {
          label: 'Basic section',
          code: `<XDSSideNavSection title="Main">
  <XDSSideNavItem label="Dashboard" href="/dashboard" />
  <XDSSideNavItem label="Projects" href="/projects" />
</XDSSideNavSection>`,
        },
        {
          label: 'With end content and hidden header',
          code: `<XDSSideNavSection title="Settings" endContent={<XDSBadge>New</XDSBadge>}>
  <XDSSideNavItem label="General" href="/settings/general" />
  <XDSSideNavItem label="Security" href="/settings/security" />
</XDSSideNavSection>`,
        },
        {
          label: 'Hidden header (used with TopNav)',
          code: `<XDSSideNavSection title="Main" isHeaderHidden>
  <XDSSideNavItem label="Dashboard" icon={HomeIcon} isSelected href="/dashboard" />
</XDSSideNavSection>`,
        },
      ],
    },
  ],
};
