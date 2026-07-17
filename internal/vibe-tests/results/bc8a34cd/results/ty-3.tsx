// Copyright (c) Meta Platforms, Inc. and affiliates.

import {Card} from '@astryxdesign/core/Card';
import {VStack} from '@astryxdesign/core/Stack';
import {Text} from '@astryxdesign/core/Text';
import {Heading} from '@astryxdesign/core/Heading';

export default function MetricsCard() {
  return (
    <div className="max-w-xs">
      <Card padding={4}>
        <VStack gap={1}>
          <Text type="label" color="secondary">Total Revenue</Text>
          <Heading level={2} type="display-2">$12,340.56</Heading>
          <Text type="supporting" color="accent">+12% from last month</Text>
        </VStack>
      </Card>
    </div>
  );
}
