// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Center} from '@xds/core/Center';
import {Card} from '@xds/core/Card';
import {Stack} from '@xds/core/Layout';
import {Icon} from '@xds/core/Icon';
import {Text} from '@xds/core/Text';
import {InboxIcon} from '@heroicons/react/24/outline';

export default function CenterInsideACard() {
  return (
    <Card width={400}>
      <Center height={200}>
        <Stack direction="vertical" gap={2} hAlign="center">
          <Icon icon={InboxIcon} size="lg" color="secondary" />
          <Text type="body" weight="bold">
            No messages yet
          </Text>
          <Text type="supporting" color="secondary">
            Messages from your team will appear here.
          </Text>
        </Stack>
      </Center>
    </Card>
  );
}
