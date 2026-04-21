'use client';

import {useXDSHoverCard} from '@xds/core/HoverCard';
import {XDSButton} from '@xds/core/Button';
import {XDSVStack} from '@xds/core/Layout';

export default function HoverCardHookBasedHoverCard() {
  const hoverCard = useXDSHoverCard({
    placement: 'above',
    delay: 200,
  });

  return (
    <div style={{padding: 80}}>
      <XDSButton
        label="Using hook directly"
        ref={hoverCard.ref}
        aria-describedby={hoverCard.describedBy}>
        Using hook directly
      </XDSButton>
      {hoverCard.renderHoverCard(
        <div style={{width: 200}}>
          <XDSVStack gap={2}>
            <div style={{fontWeight: 600}}>Jane Doe</div>
            <div style={{fontSize: 14, opacity: 0.7}}>Software Engineer</div>
            <div style={{fontSize: 13}}>
              Building great products with great people.
            </div>
          </XDSVStack>
        </div>,
      )}
    </div>
  );
}
