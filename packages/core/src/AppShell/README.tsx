import type {ComponentDoc} from '../docs-types';

export const docs: ComponentDoc = {
  name: 'AppShell',
  description:
    'Application-level layout shell providing header, side navigation, and main content area — composes XDSLayout internally and replaces the XDSPage + XDSPageLayout pattern.',
  features: [
    'Two navigation slots: topNav (horizontal bar) and sideNav (vertical sidebar)',
    'Two height modes: fill (viewport-height, independent scroll containers) and auto (page-scroll with sticky nav)',
    'Controlled and uncontrolled sideNav collapse with responsive auto-collapse via sideNavBreakpoint',
    'Mobile: collapsed sideNav renders as an overlay with backdrop',
    'Composes XDSLayout internally for automatic padding collapse, scroll containment, and slot awareness',
    'Semantic HTML: <main> with role="main", SideNav with role="navigation", skip-to-content link',
    'Escape key closes mobile sideNav overlay',
  ],
  examples: [
    {
      label: 'TopNav + SideNav (most common)',
      code: `<XDSAppShell
  topNav={
    <XDSTopNav
      label="Main navigation"
      title={<XDSTopNavTitle title="My App" logo={<Logo />} />}
      startContent={
        <>
          <XDSTopNavItem label="Home" href="/" isSelected />
          <XDSTopNavItem label="Products" href="/products" />
        </>
      }
    />
  }
  sideNav={
    // No header — TopNav has the app identity
    <XDSSideNav>
      <XDSSideNavSection title="Main" isHeaderHidden>
        <XDSSideNavItem
          label="Dashboard"
          icon={HomeIcon}
          isSelected
          href="/dashboard"
        />
        <XDSSideNavItem
          label="Analytics"
          icon={ChartBarIcon}
          href="/analytics"
        />
      </XDSSideNavSection>
      <XDSSideNavSection title="Settings">
        <XDSSideNavItem label="General" icon={CogIcon} href="/settings" />
      </XDSSideNavSection>
    </XDSSideNav>
  }>
  <DashboardContent />
</XDSAppShell>`,
    },
    {
      label: 'SideNav only (no TopNav)',
      code: `<XDSAppShell
  sideNav={
    <XDSSideNav
      header={
        <XDSSideNavHeader icon={<AppIcon />} title="My App" titleHref="/" />
      }>
      <XDSSideNavSection title="Main" isHeaderHidden>
        <XDSSideNavItem
          label="Dashboard"
          icon={HomeIcon}
          isSelected
          href="/dashboard"
        />
        <XDSSideNavItem
          label="Analytics"
          icon={ChartBarIcon}
          href="/analytics"
        />
      </XDSSideNavSection>
    </XDSSideNav>
  }>
  <DashboardContent />
</XDSAppShell>`,
    },
    {
      label: 'TopNav only (no sideNav)',
      code: `<XDSAppShell
  topNav={
    <XDSTopNav
      label="Navigation"
      title={<XDSTopNavTitle title="Landing Page" />}
    />
  }>
  <LandingContent />
</XDSAppShell>`,
    },
    {
      label: 'Auto height for content-heavy pages',
      code: `<XDSAppShell
  topNav={<XDSTopNav label="Docs" title={<XDSTopNavTitle title="Docs" />} />}
  sideNav={<XDSSideNav>...</XDSSideNav>}
  height="auto"
>
  <LongDocumentContent />
</XDSAppShell>`,
    },
    {
      label: 'Controlled sideNav collapse',
      code: `<XDSAppShell
  topNav={<XDSTopNav label="App" title={<XDSTopNavTitle title="App" />} />}
  sideNav={<XDSSideNav>...</XDSSideNav>}
  isSideNavCollapsed={collapsed}
  onSideNavCollapsedChange={setCollapsed}
>
  <Content />
</XDSAppShell>`,
    },
  ],
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description: 'Main content area, rendered inside a <main> element.',
    },
    {
      name: 'topNav',
      type: 'ReactNode',
      description: 'Top navigation slot, typically XDSTopNav.',
    },
    {
      name: 'sideNav',
      type: 'ReactNode',
      description: 'Side navigation slot, typically XDSSideNav.',
    },
    {
      name: 'banner',
      type: 'ReactNode',
      description:
        'Banner slot for system-wide announcements, placed above the topNav.',
    },
    {
      name: 'height',
      type: "'fill' | 'auto'",
      description:
        "Height behavior: 'fill' makes the shell fill the viewport (100dvh) with independent scroll containers; 'auto' lets the shell grow with content and uses sticky positioning for nav.",
      default: "'fill'",
    },
    {
      name: 'isSideNavCollapsed',
      type: 'boolean',
      description: 'Whether the sideNav is collapsed (controlled mode).',
    },
    {
      name: 'initialIsSideNavCollapsed',
      type: 'boolean',
      description: 'Initial collapsed state for uncontrolled mode.',
      default: 'false',
    },
    {
      name: 'onSideNavCollapsedChange',
      type: '(isCollapsed: boolean) => void',
      description: 'Callback fired when the sideNav collapse state changes.',
    },
    {
      name: 'sideNavBreakpoint',
      type: "'sm' | 'md' | 'lg' | 'none'",
      description:
        'Viewport-width breakpoint below which the sideNav auto-collapses. Use "none" to disable responsive collapse.',
      default: "'md'",
    },
    {
      name: 'sideNavWidth',
      type: 'number',
      description: 'Width of the sideNav panel in pixels.',
      default: '260',
    },
  ],
  accessibility: [
    'Semantic HTML via XDSLayout slots — each slot maps to a proper landmark element.',
    '<main> content area has role="main" for landmark navigation.',
    'SideNav has role="navigation" with aria-label="Application navigation".',
    'Skip-to-content link is visually hidden but shown on focus for keyboard users.',
    'Escape key closes the mobile sideNav overlay.',
  ],
  notes: [
    'When a TopNav is present, omit XDSSideNavHeader from the SideNav — the TopNav already provides app identity. Adding both would double the identity.',
    'When there is no TopNav, include XDSSideNavHeader inside the SideNav so the app name and logo are present.',
    'XDSAppShell composes XDSLayout internally: topNav + banner map to XDSLayoutHeader, sideNav maps to XDSLayoutPanel, and children map to XDSLayoutContent.',
    'SideNav collapse animations currently snap open/closed; ViewTransitions support is planned.',
    'In "auto" height mode, TopNav gets position: sticky; top: 0 and SideNav gets position: sticky; top: <header-height>.',
    'In "fill" height mode, the shell fills 100dvh, TopNav is pinned at the top, and both the SideNav and content area have independent scroll containers.',
  ],
};
