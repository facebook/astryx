'use client';

import {XDSHeading, XDSText} from '@xds/core/Text';

export default function HeadingPageLayout() {
  return (
    <div style={{maxWidth: 800}}>
      <XDSHeading level={1}>Dashboard Overview</XDSHeading>
      <XDSText type="supporting" display="block">
        Last updated 5 minutes ago
      </XDSText>

      <div style={{marginTop: 32}}>
        <XDSHeading level={2}>Recent Activity</XDSHeading>
        <XDSText type="body" display="block">
          Here's what's been happening in your workspace.
        </XDSText>
      </div>

      <div style={{marginTop: 24}}>
        <XDSHeading level={3}>Today</XDSHeading>
        <XDSText type="body" display="block">
          • Project Alpha updated
          <br />
          • 3 new comments
          <br />• Task completed
        </XDSText>
      </div>
    </div>
  );
}
