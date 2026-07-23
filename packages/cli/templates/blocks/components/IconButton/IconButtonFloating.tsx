// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {IconButton} from '@astryxdesign/core/IconButton';
import {Icon} from '@astryxdesign/core/Icon';
import {Stack} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';
import {PlusIcon} from '@heroicons/react/24/outline';

export default function IconButtonFloating() {
  return (
    <Stack direction="vertical" gap={3} vAlign="start">
      <Text type="supporting" color="secondary">
        FABs are usually icon-only — raise one with `elevation`
      </Text>
      <IconButton
        label="Compose"
        variant="primary"
        icon={<Icon icon={PlusIcon} />}
        elevation="high"
      />
    </Stack>
  );
}
