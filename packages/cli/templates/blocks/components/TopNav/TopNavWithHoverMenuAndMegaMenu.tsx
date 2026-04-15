'use client';

import {XDSTopNav, XDSTopNavHeading, XDSTopNavItem, XDSTopNavMegaMenu, XDSTopNavMegaMenuFeaturedCard, XDSTopNavMegaMenuItem, XDSTopNavMenu} from '@xds/core/TopNav';

function BuildingIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}

function RocketIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}

export default function TopNavWithHoverMenuAndMegaMenu() {
  return (
    <XDSTopNav
      label="Main navigation"
      heading={<XDSTopNavHeading heading="My App" href="/" />}
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
            items={
              <>
                <XDSTopNavMegaMenuItem title="Enterprise" description="For large teams" icon={<BuildingIcon />} href="/enterprise" />
                <XDSTopNavMegaMenuItem title="Startups" description="Move fast" icon={<RocketIcon />} href="/startups" />
              </>
            }
            featured={
              <XDSTopNavMegaMenuFeaturedCard
                title="New: AI Features"
                description="Explore our latest AI-powered tools."
                linkLabel="Learn more"
                linkHref="/ai"
              />
            }
          />
        </>
      }
    />
  );
}
