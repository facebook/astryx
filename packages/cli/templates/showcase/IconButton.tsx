'use client';

import {XDSIconButton} from '@xds/core/IconButton';
import {XDSIcon} from '@xds/core/Icon';

export default function IconButtonShowcase() {
  return (
    <XDSIconButton
      label="Settings"
      icon={<XDSIcon icon="wrench" color="inherit" />}
    />
  );
}
