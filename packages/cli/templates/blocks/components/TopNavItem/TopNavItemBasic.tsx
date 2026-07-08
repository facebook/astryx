// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {TopNav, TopNavHeading, TopNavItem} from '@astryxdesign/core/TopNav';

export default function TopNavItemBasic() {
  return (
    <TopNav
      label="Main navigation"
      heading={<TopNavHeading heading="App" />}
      startContent={
        <>
          <TopNavItem label="Dashboard" href="#" isSelected />
          <TopNavItem label="Projects" href="#" />
          <TopNavItem label="Reports" href="#" />
        </>
      }
    />
  );
}
