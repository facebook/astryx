// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {IconButton} from '@astryxdesign/core/IconButton';
import {Icon} from '@astryxdesign/core/Icon';
import {HStack} from '@astryxdesign/core/Stack';

export default function IconButtactionBar() {
  return (
    <HStack gap={1}>
      <IconButton
        label="Search"
        icon={<Icon icon="search" color="inherit" />}
        variant="ghost"
      />
      <IconButton
        label="Copy"
        icon={<Icon icon="copy" color="inherit" />}
        variant="ghost"
      />
      <IconButton
        label="Info"
        icon={<Icon icon="info" color="inherit" />}
        variant="ghost"
      />
      <IconButton
        label="Menu"
        icon={<Icon icon="menu" color="inherit" />}
        variant="ghost"
      />
      <IconButton
        label="Close"
        icon={<Icon icon="close" color="inherit" />}
        variant="ghost"
      />
    </HStack>
  );
}
