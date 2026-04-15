'use client';

import {useXDSHoverCard} from '@xds/core/HoverCard';
import {XDSButton} from '@xds/core/Button';

function ProfileCard() {
  return (
    <div style={{padding: 16, minWidth: 200}}>
      <strong>Jane Doe</strong>
      <p style={{margin: '4px 0 0', color: 'var(--color-text-secondary)'}}>
        Software Engineer
      </p>
    </div>
  );
}

export default function HoverCardHook() {
  const hoverCard = useXDSHoverCard({placement: 'above'});

  return (
    <>
      <XDSButton
        label="Hover me"
        ref={hoverCard.ref}
        aria-describedby={hoverCard.describedBy}>
        Hover me
      </XDSButton>
      {hoverCard.renderHoverCard(<ProfileCard />)}
    </>
  );
}
