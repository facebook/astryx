'use client';

import {XDSNavIcon} from '@xds/core/NavIcon';
import {XDSIcon} from '@xds/core/Icon';
import {XDSHStack} from '@xds/core/Layout';

export default function NavIconShowcase() {
  return (
    <XDSHStack gap={4} vAlign="center">
      <XDSNavIcon icon={<XDSIcon icon="search" />} />
      <XDSNavIcon icon={<XDSIcon icon="calendar" />} />
      <XDSNavIcon icon={<XDSIcon icon="wrench" />} />
    </XDSHStack>
  );
}
