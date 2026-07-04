// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {NavIcon} from '@astryxdesign/core/NavIcon';
import {Icon} from '@astryxdesign/core/Icon';
import {HStack} from '@astryxdesign/core/Layout';

export default function NavIconBasic() {
  return (
    <HStack gap={4} vAlign="center">
      <NavIcon icon={<Icon icon="search" />} />
      <NavIcon icon={<Icon icon="calendar" />} />
    </HStack>
  );
}
