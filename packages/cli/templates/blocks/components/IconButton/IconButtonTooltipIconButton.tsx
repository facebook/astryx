// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {IconButton} from '@xds/core/IconButton';
import {Icon} from '@xds/core/Icon';
import {HStack} from '@xds/core/Stack';

export default function IconButtonTooltipIconButton() {
  return (
    <HStack gap={2}>
      <IconButton
        label="Search"
        icon={<Icon icon="search" color="inherit" />}
        variant="ghost"
        tooltip="Search items"
      />
      <IconButton
        label="Copy link"
        icon={<Icon icon="copy" color="inherit" />}
        variant="ghost"
        tooltip="Copy to clipboard"
      />
      <IconButton
        label="More options"
        icon={<Icon icon="moreHorizontal" color="inherit" />}
        variant="ghost"
        tooltip="More options"
      />
    </HStack>
  );
}
