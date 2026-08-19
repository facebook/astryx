// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Card} from '@astryxdesign/core/Card';
import {Stack} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';

export default function CardWithSimpleContent() {
  return (
    <Card width={360}>
      <Stack direction="vertical" gap={2}>
        <Heading level={3}>Project Overview</Heading>
        <Text type="body" color="secondary">
          This project tracks the redesign of the onboarding flow. The goal is
          to reduce drop-off by 15% in Q2.
        </Text>
        <Text type="supporting" color="secondary">
          Last updated 2 hours ago
        </Text>
      </Stack>
    </Card>
  );
}
