'use client';

import {XDSNavIcon} from '@xds/core/NavIcon';
import {XDSIcon} from '@xds/core/Icon';

export default function NavIconShowcase() {
  return (
    <div style={{display: 'flex', gap: 16, alignItems: 'center'}}>
      <XDSNavIcon icon={<XDSIcon name="home" />} />
      <XDSNavIcon icon={<XDSIcon name="settings" />} />
      <XDSNavIcon icon={<XDSIcon name="search" />} />
    </div>
  );
}
