// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Button} from '@astryxdesign/core/Button';
import {Icon} from '@astryxdesign/core/Icon';
import {Stack} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';
import {PlusIcon} from '@heroicons/react/24/outline';

export default function ButtonFloating() {
  return (
    <Stack direction="vertical" gap={3} vAlign="start">
      <Text type="supporting" color="secondary">
        A floating action button — raised above content with `elevation`
      </Text>
      <Button
        label="New document"
        variant="primary"
        icon={<Icon icon={PlusIcon} />}
        elevation="med"
      />
    </Stack>
  );
}
