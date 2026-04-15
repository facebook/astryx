'use client';

import {XDSHoverCard} from '@xds/core/HoverCard';
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

export default function HoverCardBasic() {
  return (
    <XDSHoverCard content={<ProfileCard />} placement="above">
      <XDSButton label="Hover me">Hover me</XDSButton>
    </XDSHoverCard>
  );
}
