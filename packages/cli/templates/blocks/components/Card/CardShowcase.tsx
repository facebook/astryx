'use client';

import {XDSCard} from '@xds/core/Card';
import {XDSStack} from '@xds/core/Layout';
import {XDSText, XDSHeading} from '@xds/core/Text';

export default function CardShowcase() {
  return (
    <XDSCard width={320}>
      <XDSStack direction="vertical" gap={2}>
        <XDSHeading level={4}>Card title</XDSHeading>
        <XDSText type="body" color="secondary">
          Cards group related content with a border and background. Use them for
          profiles, settings panels, or data summaries.
        </XDSText>
      </XDSStack>
    </XDSCard>
  );
}
