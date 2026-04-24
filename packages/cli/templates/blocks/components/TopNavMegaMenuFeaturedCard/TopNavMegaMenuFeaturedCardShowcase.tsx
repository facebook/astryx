'use client';

import {
  XDSTopNav,
  XDSTopNavHeading,
  XDSTopNavMegaMenu,
  XDSTopNavMegaMenuItem,
  XDSTopNavMegaMenuFeaturedCard,
} from '@xds/core/TopNav';

function StarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
    </svg>
  );
}

export default function TopNavMegaMenuFeaturedCardShowcase() {
  return (
    <XDSTopNav
      label="Featured card demo"
      heading={<XDSTopNavHeading heading="Platform" />}
      startContent={
        <XDSTopNavMegaMenu
          label="Resources"
          items={
            <XDSTopNavMegaMenuItem
              title="Showcase"
              description="See what others have built"
              icon={<StarIcon />}
              href="#showcase"
            />
          }
          featured={
            <XDSTopNavMegaMenuFeaturedCard
              title="Introducing v2.0"
              description="Our biggest release yet with new components, faster builds, and a refreshed design language."
              linkLabel="Explore the release"
              linkHref="#release"
            />
          }
        />
      }
    />
  );
}
