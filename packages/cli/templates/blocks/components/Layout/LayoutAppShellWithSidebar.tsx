'use client';

import {
  XDSLayout,
  XDSLayoutHeader,
  XDSLayoutContent,
  XDSLayoutPanel,
} from '@xds/core/Layout';

function Navigation() {
  return (
    <nav>
      <ul style={{listStyle: 'none', padding: 0, margin: 0}}>
        <li style={{padding: '8px 0'}}>Dashboard</li>
        <li style={{padding: '8px 0'}}>Settings</li>
        <li style={{padding: '8px 0'}}>Profile</li>
      </ul>
    </nav>
  );
}

export default function LayoutAppShellWithSidebar() {
  return (
    <XDSLayout
      header={<XDSLayoutHeader hasDivider>App Name</XDSLayoutHeader>}
      start={
        <XDSLayoutPanel hasDivider width={240} role="navigation">
          <Navigation />
        </XDSLayoutPanel>
      }
      content={
        <XDSLayoutContent role="main">Main content goes here</XDSLayoutContent>
      }
    />
  );
}
