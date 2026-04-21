'use client';

import {XDSCard} from '@xds/core/Card';
import {XDSVStack} from '@xds/core/Layout';
import {XDSHeading} from '@xds/core/Text';

export default function CardNestedCards() {
  return (
    <XDSCard width={400}>
      <XDSVStack gap={3}>
        <XDSHeading level={3}>Parent Card</XDSHeading>
        <XDSCard width="100%">
          <p style={{margin: 0, fontSize: 14, color: '#666'}}>
            Nested card resets container padding and gets its own padding.
          </p>
        </XDSCard>
        <XDSCard width="100%">
          <p style={{margin: 0, fontSize: 14, color: '#666'}}>
            Another nested card with independent padding.
          </p>
        </XDSCard>
      </XDSVStack>
    </XDSCard>
  );
}
