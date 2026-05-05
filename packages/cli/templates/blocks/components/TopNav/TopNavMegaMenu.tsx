'use client';

import {
  XDSTopNav,
  XDSTopNavHeading,
  XDSTopNavItem,
  XDSTopNavMegaMenu,
  XDSTopNavMegaMenuItem,
  XDSTopNavMegaMenuFeaturedCard,
} from '@xds/core/TopNav';
import {XDSNavIcon} from '@xds/core/NavIcon';
import {XDSButton} from '@xds/core/Button';
import {XDSIcon} from '@xds/core/Icon';
import {
  CubeIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  BoltIcon,
  CodeBracketIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';

export default function TopNavMegaMenu() {
  return (
    <XDSTopNav
      label="Marketing navigation"
      heading={
        <XDSTopNavHeading
          heading="My App"
          logo={<XDSNavIcon icon={<XDSIcon icon={CubeIcon} size="sm" />} />}
          href="#"
        />
      }
      startContent={
        <>
          <XDSTopNavMegaMenu
            label="Products"
            items={
              <>
                <XDSTopNavMegaMenuItem
                  title="Analytics"
                  description="Track and analyze user behavior across your apps"
                  icon={<ChartBarIcon />}
                  href="#analytics"
                />
                <XDSTopNavMegaMenuItem
                  title="Security"
                  description="Enterprise-grade protection for your data"
                  icon={<ShieldCheckIcon />}
                  href="#security"
                />
                <XDSTopNavMegaMenuItem
                  title="Automation"
                  description="Streamline workflows with intelligent tools"
                  icon={<BoltIcon />}
                  href="#automation"
                />
                <XDSTopNavMegaMenuItem
                  title="Developer Tools"
                  description="APIs, SDKs, and CLI for integration"
                  icon={<CodeBracketIcon />}
                  href="#dev-tools"
                />
                <XDSTopNavMegaMenuItem
                  title="Global Network"
                  description="Low-latency edge infra in 40+ regions"
                  icon={<GlobeAltIcon />}
                  href="#network"
                />
              </>
            }
            featured={
              <XDSTopNavMegaMenuFeaturedCard
                title="What's new in v4.0"
                description="AI-powered analytics and real-time collaboration."
                image="https://lookaside.facebook.com/assets/xds_oss/light-working-horizontal-1.png"
                imageAlt="Team collaboration"
                linkLabel="Read the announcement"
                linkHref="#announcement"
              />
            }
          />
          <XDSTopNavItem label="Pricing" href="#" />
          <XDSTopNavItem label="Docs" href="#" />
        </>
      }
      endContent={
        <>
          <XDSButton label="Sign in" variant="ghost" />
          <XDSButton label="Get started" variant="primary" />
        </>
      }
    />
  );
}
