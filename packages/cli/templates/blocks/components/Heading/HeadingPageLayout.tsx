'use client';

import {XDSVStack} from '@xds/core/Layout';
import {XDSHeading, XDSText} from '@xds/core/Text';

export default function HeadingPageLayout() {
  return (
    <XDSVStack gap={6} width="100%" style={{maxWidth: 400}}>
      <XDSVStack>
        <XDSHeading level={1}>Dashboard Overview</XDSHeading>
        <XDSText type="supporting" display="block">
          Last updated 5 minutes ago
        </XDSText>
      </XDSVStack>

      <XDSVStack>
        <XDSHeading level={2}>Recent Activity</XDSHeading>
        <XDSText type="body" display="block">
          Here's what's been happening in your workspace.
        </XDSText>
      </XDSVStack>

      <XDSVStack>
        <XDSHeading level={3}>Today</XDSHeading>
        <XDSText type="body" display="block">
          • Project Alpha updated
          <br />
          • 3 new comments
          <br />• Task completed
        </XDSText>
      </XDSVStack>
    </XDSVStack>
  );
}
