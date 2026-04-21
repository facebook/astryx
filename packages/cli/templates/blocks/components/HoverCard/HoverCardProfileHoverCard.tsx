'use client';

import {XDSHoverCard} from '@xds/core/HoverCard';
import {XDSButton} from '@xds/core/Button';
import {XDSVStack} from '@xds/core/Layout';

export default function HoverCardProfileHoverCard() {
  return (
    <div style={{padding: 80}}>
      <XDSHoverCard
        placement="above"
        content={
          <div style={{width: 200}}>
            <XDSVStack gap={2}>
              <div style={{fontWeight: 600}}>Jane Doe</div>
              <div style={{fontSize: 14, opacity: 0.7}}>Software Engineer</div>
              <div style={{fontSize: 13}}>
                Building great products with great people.
              </div>
            </XDSVStack>
          </div>
        }>
        <XDSButton label="Hover me">Hover me</XDSButton>
      </XDSHoverCard>
    </div>
  );
}
