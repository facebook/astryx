'use client';

import {XDSTopNav, XDSTopNavHeading, XDSTopNavItem} from '@xds/core/TopNav';

function SearchBar() {
  return <div style={{padding: 8}}>SearchBar</div>;
}

function Avatar() {
  return <div style={{padding: 8}}>Avatar</div>;
}

export default function TopNavWithCenteredContentThreecolumnLayout() {
  return (
    <XDSTopNav
      label="Main navigation"
      heading={<XDSTopNavHeading heading="My App" href="/" />}
      startContent={<XDSTopNavItem label="Home" href="/" isSelected />}
      centerContent={<SearchBar />}
      endContent={<Avatar />}
    />
  );
}
