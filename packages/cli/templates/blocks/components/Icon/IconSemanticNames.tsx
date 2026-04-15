'use client';

import {XDSIcon} from '@xds/core/Icon';

export default function IconSemanticNames() {
  return (
    <div style={{display: 'flex', gap: 16, alignItems: 'center'}}>
      <XDSIcon icon="close" />
      <XDSIcon icon="chevronDown" size="sm" color="inherit" />
      <XDSIcon icon="checkCircle" color="positive" />
      <XDSIcon icon="info" size="sm" color="secondary" />
    </div>
  );
}
