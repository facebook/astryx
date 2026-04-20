'use client';

import {XDSCard} from '@xds/core/Card';
import {XDSVStack} from '@xds/core/Layout';
import {XDSHeading} from '@xds/core/Text';

export default function CardCallout() {
  return (
    <div style={{display: 'flex', gap: 24, flexWrap: 'wrap'}}>
      <XDSCard width={350} variant="muted">
        <XDSVStack gap={2}>
          <XDSHeading level={3}>Tip</XDSHeading>
          <p style={{margin: 0, fontSize: 14, color: '#666'}}>
            Use the muted variant for callouts, tips, or highlighted
            information. The muted background provides visual contrast without
            needing a nested section.
          </p>
        </XDSVStack>
      </XDSCard>
      <XDSCard width={350} variant="muted">
        <XDSVStack gap={2}>
          <XDSHeading level={3}>Warning</XDSHeading>
          <p style={{margin: 0, fontSize: 14, color: '#666'}}>
            Muted cards work well for alerts and warnings too.
          </p>
        </XDSVStack>
      </XDSCard>
    </div>
  );
}
