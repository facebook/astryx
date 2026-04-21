'use client';

import {
  XDSTopNav,
  XDSTopNavHeading,
  XDSTopNavItem,
  XDSTopNavMenu,
} from '@xds/core/TopNav';

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

export default function TopNavMultipleDropdowns() {
  return (
    <XDSTopNav
      label="Main navigation"
      heading={<XDSTopNavHeading heading="Platform" href="#" />}
      startContent={
        <>
          <XDSTopNavMenu
            label="Products"
            items={[
              {
                title: 'Analytics',
                description: 'Track behavior',
                icon: <ChartIcon />,
                href: '#',
              },
              {
                title: 'Security',
                description: 'Enterprise protection',
                icon: <ShieldIcon />,
                href: '#',
              },
            ]}
          />
          <XDSTopNavMenu
            label="Resources"
            items={[
              {title: 'Documentation', href: '#'},
              {title: 'API Reference', href: '#'},
              {title: 'Community Forum', href: '#'},
            ]}
          />
          <XDSTopNavItem label="Pricing" href="#" />
        </>
      }
    />
  );
}
