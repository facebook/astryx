// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Divider} from '@xds/core/Divider';
import {Card} from '@xds/core/Card';
import {Section} from '@xds/core/Section';
import {VStack, HStack} from '@xds/core/Layout';
import {Text} from '@xds/core/Text';

export default function DividerFullBleed() {
  return (
    <Section variant="transparent" width="100%">
      <Card width={400}>
        <VStack gap={3}>
          <Text type="label">Order Summary</Text>
          <HStack hAlign="between">
            <Text type="body">3 items</Text>
            <Text type="body">$127.00</Text>
          </HStack>
          <Divider isFullBleed />
          <HStack hAlign="between">
            <Text type="body">Shipping</Text>
            <Text type="body">$7.99</Text>
          </HStack>
          <HStack hAlign="between">
            <Text type="body">Tax</Text>
            <Text type="body">$10.16</Text>
          </HStack>
          <Divider isFullBleed />
          <HStack hAlign="between">
            <Text type="label">Total</Text>
            <Text type="label">$145.15</Text>
          </HStack>
        </VStack>
      </Card>
    </Section>
  );
}
