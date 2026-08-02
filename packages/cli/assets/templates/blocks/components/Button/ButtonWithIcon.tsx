// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Button} from '@astryxdesign/core/Button';
import {Icon} from '@astryxdesign/core/Icon';
import {Stack} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';
import {
  ArrowDownTrayIcon,
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

export default function ButtonWithIcon() {
  return (
    <Stack direction="vertical" gap={4}>
      <Text type="supporting" color="secondary">
        Icons reinforce the action
      </Text>
      <Stack direction="horizontal" gap={3} vAlign="center">
        <Button
          label="New item"
          variant="primary"
          icon={<Icon icon={PlusIcon} />}
        />
        <Button
          label="Edit"
          variant="secondary"
          icon={<Icon icon={PencilSquareIcon} />}
        />
        <Button
          label="Download"
          variant="ghost"
          icon={<Icon icon={ArrowDownTrayIcon} />}
        />
        <Button
          label="Delete"
          variant="destructive"
          icon={<Icon icon={TrashIcon} />}
        />
      </Stack>
    </Stack>
  );
}
