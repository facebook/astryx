'use client';

import {XDSLayout, XDSLayoutContent} from '@xds/core/Layout';
import {XDSTopNav, XDSTopNavHeading, XDSTopNavItem} from '@xds/core/TopNav';

function Logo() {
  return <div style={{padding: 8}}>Logo</div>;
}

function MainContent() {
  return <div style={{padding: 8}}>MainContent</div>;
}

function Avatar() {
  return <div style={{padding: 8}}>Avatar</div>;
}

export default function TopNavInXDSLayoutHeaderSlot() {
  return (
    <XDSLayout
      header={
        <XDSTopNav
          label="Main navigation"
          heading={<XDSTopNavHeading heading="My App" logo={<Logo />} href="/" />}
          startContent={
            <>
              <XDSTopNavItem label="Home" href="/" isSelected />
              <XDSTopNavItem label="Settings" href="/settings" />
            </>
          }
          endContent={<Avatar />}
        />
      }
      content={
        <XDSLayoutContent role="main">
          <MainContent />
        </XDSLayoutContent>
      }
    />
  );
}
