// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {HStack, StackItem} from '@astryxdesign/core/Layout';
import {Card} from '@astryxdesign/core/Card';
import {Text} from '@astryxdesign/core/Text';

export default function StackItemFill() {
  return (
    <HStack gap={3} vAlign="center" width="100%" style={{maxWidth: 400}}>
      <StackItem size="static">
        <Card padding={3}>
          <Text type="supporting" color="secondary">
            Static
          </Text>
        </Card>
      </StackItem>
      <StackItem size="fill">
        <Card padding={3}>
          <Text type="supporting" color="secondary">
            Fills remaining space
          </Text>
        </Card>
      </StackItem>
    </HStack>
  );
}
