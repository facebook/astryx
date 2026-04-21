'use client';

import {XDSCard} from '@xds/core/Card';
import {XDSStack} from '@xds/core/Layout';
import {XDSHeading, XDSText} from '@xds/core/Text';

export default function CardCallout() {
  return (
    <XDSStack direction="horizontal" gap={4}>
      <XDSCard width={320} variant="muted">
        <XDSStack direction="vertical" gap={2}>
          <XDSHeading level={3}>Tip</XDSHeading>
          <XDSText type="body" color="secondary">
            Use the muted variant for callouts, tips, or supplementary
            information that should be visually distinct but not prominent.
          </XDSText>
        </XDSStack>
      </XDSCard>
      <XDSCard width={320} variant="muted">
        <XDSStack direction="vertical" gap={2}>
          <XDSHeading level={3}>Note</XDSHeading>
          <XDSText type="body" color="secondary">
            Muted cards work well in sidebars, help panels, or anywhere you want
            to de-emphasize content without hiding it.
          </XDSText>
        </XDSStack>
      </XDSCard>
    </XDSStack>
  );
}
