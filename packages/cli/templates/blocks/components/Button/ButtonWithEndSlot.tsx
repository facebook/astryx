// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Button} from '@xds/core/Button';
import {Badge} from '@xds/core/Badge';
import {Stack} from '@xds/core/Layout';
import {Text} from '@xds/core/Text';

export default function ButtonWithEndSlot() {
  return (
    <Stack direction="vertical" gap={4}>
      <Text type="supporting" color="secondary">
        Trailing badges for counts or status
      </Text>
      <Stack direction="horizontal" gap={3} vAlign="center">
        <Button
          label="Messages"
          variant="primary"
          endContent={<Badge variant="info" label={3} />}
        />
        <Button
          label="Notifications"
          variant="secondary"
          endContent={<Badge variant="warning" label={12} />}
        />
        <Button
          label="Updates"
          variant="ghost"
          endContent={<Badge variant="neutral" label="New" />}
        />
      </Stack>
    </Stack>
  );
}
