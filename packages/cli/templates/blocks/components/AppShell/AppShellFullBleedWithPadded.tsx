'use client';

import {XDSAppShell} from '@xds/core/AppShell';
import {XDSTopNav, XDSTopNavHeading} from '@xds/core/TopNav';
import {XDSHeading} from '@xds/core/Text';
import {XDSText} from '@xds/core/Text';
import {XDSSection} from '@xds/core/Section';

export default function AppShellFullBleedWithPadded() {
  return (
    <XDSAppShell
      contentPadding={0}
      topNav={
        <XDSTopNav
          label="App"
          heading={<XDSTopNavHeading heading="Player" />}
        />
      }>
      <div
        style={{
          height: 300,
          background: '#000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
        }}>
        Full-width video player
      </div>
      <XDSSection padding={4}>
        <XDSHeading level={1}>Video Title</XDSHeading>
        <XDSText type="body">Video description</XDSText>
      </XDSSection>
    </XDSAppShell>
  );
}
