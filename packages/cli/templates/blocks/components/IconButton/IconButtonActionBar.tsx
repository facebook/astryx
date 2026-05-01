'use client';

import {XDSIconButton} from '@xds/core/IconButton';
import {XDSIcon} from '@xds/core/Icon';
import {XDSHStack} from '@xds/core/Stack';

export default function IconButtactionBar() {
  return (
    <XDSHStack gap={1}>
      <XDSIconButton
        label="Search"
        icon={<XDSIcon icon="search" color="inherit" />}
        variant="ghost"
      />
      <XDSIconButton
        label="Copy"
        icon={<XDSIcon icon="copy" color="inherit" />}
        variant="ghost"
      />
      <XDSIconButton
        label="Info"
        icon={<XDSIcon icon="info" color="inherit" />}
        variant="ghost"
      />
      <XDSIconButton
        label="Menu"
        icon={<XDSIcon icon="menu" color="inherit" />}
        variant="ghost"
      />
      <XDSIconButton
        label="Close"
        icon={<XDSIcon icon="close" color="inherit" />}
        variant="ghost"
      />
    </XDSHStack>
  );
}
