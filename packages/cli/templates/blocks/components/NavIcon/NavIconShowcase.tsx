// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {NavIcon} from '@xds/core/NavIcon';
import {Icon} from '@xds/core/Icon';
import {HStack} from '@xds/core/Layout';

export default function NavIconShowcase() {
  return (
    <HStack gap={4} vAlign="center">
      <NavIcon icon={<Icon icon="search" />} />
      <NavIcon icon={<Icon icon="calendar" />} />
      <NavIcon icon={<Icon icon="wrench" />} />
    </HStack>
  );
}
