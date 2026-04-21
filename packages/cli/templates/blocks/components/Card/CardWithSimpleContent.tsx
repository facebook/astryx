'use client';

import {XDSCard} from '@xds/core/Card';
import {XDSVStack} from '@xds/core/Layout';
import {XDSHeading} from '@xds/core/Text';

export default function CardWithSimpleContent() {
  return (
    <XDSCard width={320}>
      <XDSVStack gap={2}>
        <XDSHeading level={3}>Card Title</XDSHeading>
        <p style={{margin: 0, fontSize: 14, color: '#666'}}>
          This card contains simple content with a heading and body text. The
          container padding is applied automatically.
        </p>
      </XDSVStack>
    </XDSCard>
  );
}
