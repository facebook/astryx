// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {SideNav, SideNavHeading} from '@astryxdesign/core/SideNav';
import {NavHeadingMenu, NavHeadingMenuItem} from '@astryxdesign/core/NavMenu';

function AppIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z"
      />
    </svg>
  );
}

export default function NavHeadingMenuShowcase() {
  return (
    <SideNav
      header={
        <SideNavHeading
          heading="Acme Platform"
          icon={<AppIcon />}
          menu={
            <NavHeadingMenu size="lg">
              <NavHeadingMenuItem label="Dashboard" href="/dashboard" />
              <NavHeadingMenuItem label="Analytics" href="/analytics" />
              <NavHeadingMenuItem label="Settings" href="/settings" />
            </NavHeadingMenu>
          }
        />
      }>
      {null}
    </SideNav>
  );
}
