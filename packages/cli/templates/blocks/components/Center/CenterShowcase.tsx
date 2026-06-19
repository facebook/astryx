// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Center} from '@xds/core/Center';
import {Stack} from '@xds/core/Layout';
import {Text, Heading} from '@xds/core/Text';

export default function CenterShowcase() {
  return (
    <Center axis="both" width="100%" height={240}>
      <Stack direction="vertical" gap={2} hAlign="center">
        <Heading level={4}>Centered content</Heading>
        <Text type="body" color="secondary">
          Horizontally and vertically aligned.
        </Text>
      </Stack>
    </Center>
  );
}
