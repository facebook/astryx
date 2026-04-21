'use client';

import {
  XDSTopNav,
  XDSTopNavHeading,
  XDSTopNavItem,
  XDSTopNavMenu,
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

function UserIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
  );
}

export default function TopNavHoverMenu() {
  return (
    <XDSTopNav
      label="Main navigation"
      heading={
        <XDSTopNavHeading
          heading="My App"
          logo={<XDSNavIcon icon={<CubeIcon />} />}
          href="#"
        />
      }
      startContent={
        <>
          <XDSTopNavItem label="Home" href="#" isSelected />
          <XDSTopNavMenu
            label="Products"
            items={[
              {
                title: 'Analytics',
                description: 'Track and analyze user behavior',
                icon: <ChartIcon />,
                href: '#analytics',
              },
              {
                title: 'Security',
                description: 'Enterprise-grade protection',
                icon: <ShieldIcon />,
                href: '#security',
              },
              {
                title: 'Automation',
                description: 'Streamline your workflows',
                icon: <BoltIcon />,
                href: '#automation',
              },
              {
                title: 'Developer Tools',
                description: 'APIs, SDKs, and CLI tools',
                icon: <CodeIcon />,
                href: '#dev-tools',
              },
            ]}
          />
          <XDSTopNavItem label="Pricing" href="#" />
        </>
      }
      endContent={
        <XDSButton
          label="Profile"
          variant="ghost"
          icon={<UserIcon />}
          isIconOnly
        />
      }
    />
  );
}
