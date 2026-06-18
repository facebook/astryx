// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useStreamingText} from '@xds/core/hooks';
import {Card} from '@xds/core/Card';
import {VStack} from '@xds/core/Layout';
import {Text} from '@xds/core/Text';

const response =
  'XDS hooks keep behavior reusable while components keep visuals consistent.';

export default function UseStreamingTextHookUsage() {
  const displayedText = useStreamingText(response, false, {
    speed: 'fast',
  });

  return (
    <Card width={420} padding={4}>
      <VStack gap={2}>
        <Text type="body" weight="bold">
          Assistant response
        </Text>
        <Text type="body">{displayedText}</Text>
        <Text type="supporting" color="secondary">
          Complete
        </Text>
      </VStack>
    </Card>
  );
}
