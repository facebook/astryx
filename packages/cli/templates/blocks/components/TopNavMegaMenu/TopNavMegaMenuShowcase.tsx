'use client';

import {
  XDSTopNav,
  XDSTopNavHeading,
  XDSTopNavItem,
  XDSTopNavMegaMenu,
  XDSTopNavMegaMenuItem,
  XDSTopNavMegaMenuFeaturedCard,
} from '@xds/core/TopNav';
import {
  RocketLaunchIcon,
  BookOpenIcon,
  CodeBracketIcon,
  ShieldCheckIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

export default function TopNavMegaMenuShowcase() {
  return (
    <XDSTopNav
      style={{width: 600}}
      label="Mega menu demo"
      heading={<XDSTopNavHeading heading="DevTools" />}
      startContent={
        <>
          <XDSTopNavItem label="Overview" href="#" isSelected />
          <XDSTopNavMegaMenu
            label="Products"
            items={
              <>
                <XDSTopNavMegaMenuItem
                  title="Deploy"
                  description="Ship to production in seconds"
                  icon={<RocketLaunchIcon width={20} height={20} />}
                  href="#deploy"
                />
                <XDSTopNavMegaMenuItem
                  title="Documentation"
                  description="Guides, references, and tutorials"
                  icon={<BookOpenIcon width={20} height={20} />}
                  href="#docs"
                />
                <XDSTopNavMegaMenuItem
                  title="API"
                  description="Programmatic access to all features"
                  icon={<CodeBracketIcon width={20} height={20} />}
                  href="#api"
                />
                <XDSTopNavMegaMenuItem
                  title="Security"
                  description="Enterprise-grade protection"
                  icon={<ShieldCheckIcon width={20} height={20} />}
                  href="#security"
                />
              </>
            }
            featured={
              <XDSTopNavMegaMenuFeaturedCard
                title="What's New"
                description="Check out our latest features and improvements in the Q2 release."
                linkLabel="Read the changelog"
                linkHref="#changelog"
              />
            }
          />
        </>
      }
      endContent={<MagnifyingGlassIcon width={20} height={20} />}
    />
  );
}
