// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {SideNav, SideNavHeading} from '@astryxdesign/core/SideNav';
import {NavHeadingMenu, NavHeadingMenuItem} from '@astryxdesign/core/NavMenu';

export default function NavHeadingMenuInSideNavHeading() {
  return (
    <SideNav
      header={
        <SideNavHeading
          heading="Analytics"
          superheading="Acme Corp"
          menu={
            <NavHeadingMenu>
              <NavHeadingMenuItem
                label="Analytics"
                description="Current workspace"
                onClick={() => {}}
              />
              <NavHeadingMenuItem label="CRM" onClick={() => {}} />
              <NavHeadingMenuItem label="Billing" onClick={() => {}} />
            </NavHeadingMenu>
          }
        />
      }>
      {null}
    </SideNav>
  );
}
