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

function CubeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 16.5V7.914a1.5 1.5 0 0 0-.75-1.299l-7.5-4.329a1.5 1.5 0 0 0-1.5 0l-7.5 4.33A1.5 1.5 0 0 0 3 7.913V16.5a1.5 1.5 0 0 0 .75 1.3l7.5 4.328a1.5 1.5 0 0 0 1.5 0l7.5-4.329A1.5 1.5 0 0 0 21 16.5Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 7.5 8.25 4.764 8.25-4.764M12 22.089V12.264" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
    </svg>
  );
}

function BoltIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
    </svg>
  );
}

function CodeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
    </svg>
  );
}

export default function TopNavMegaMenu() {
  return (
    <div style={{position: 'relative'}}>
      <XDSTopNav
        label="Marketing navigation"
        heading={
          <XDSTopNavHeading
            heading="Acme"
            logo={<XDSNavIcon icon={<CubeIcon />} />}
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
                    icon={<ChartIcon />}
                    href="#analytics"
                  />
                  <XDSTopNavMegaMenuItem
                    title="Security"
                    description="Enterprise-grade protection for your data"
                    icon={<ShieldIcon />}
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
                    icon={<CodeIcon />}
                    href="#dev-tools"
                  />
                  <XDSTopNavMegaMenuItem
                    title="Global Network"
                    description="Low-latency edge infra in 40+ regions"
                    icon={<GlobeIcon />}
                    href="#network"
                  />
                </>
              }
              featured={
                <XDSTopNavMegaMenuFeaturedCard
                  title="What's new in v4.0"
                  description="AI-powered analytics and real-time collaboration."
                  image="https://images.unsplash.com/photo-1551434678-e076c223a692?w=560&h=280&fit=crop"
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
    </div>
  );
}
