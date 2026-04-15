'use client';

import {XDSAppShell} from '@xds/core/AppShell';
import {XDSTopNav, XDSTopNavHeading} from '@xds/core/TopNav';
import {XDSHeading} from '@xds/core/Text';
import {XDSSection} from '@xds/core/Section';
import {XDSCard} from '@xds/core/Card';

export default function AppShellPaddedWithFullBleed() {
  return (
    <XDSAppShell
      contentPadding={4}
      topNav={
        <XDSTopNav
          label="App"
          heading={<XDSTopNavHeading heading="Dashboard" />}
        />
      }>
      <XDSHeading level={1}>Overview</XDSHeading>
      <XDSSection padding={0}>
        <div
          style={{
            height: 200,
            background: 'var(--color-accent-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          Full-width chart
        </div>
      </XDSSection>
      <XDSCard>Details</XDSCard>
    </XDSAppShell>
  );
}
