// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Collapsible, CollapsibleGroup} from '@astryxdesign/core/Collapsible';
import {Card} from '@astryxdesign/core/Card';
import {VStack} from '@astryxdesign/core/Layout';
import {Center} from '@astryxdesign/core/Center';
import {Text} from '@astryxdesign/core/Text';

export default function CollapsibleGroupShowcase() {
  return (
    <Center width={400}>
      <CollapsibleGroup type="single" defaultValue="shipping">
        <VStack gap={2} width="100%">
          <Card>
            <Collapsible trigger="Shipping Information" value="shipping">
              <Text type="body" color="secondary">
                Standard shipping takes 3–5 business days. Express shipping is
                available for an additional fee.
              </Text>
            </Collapsible>
          </Card>
          <Card>
            <Collapsible trigger="Return Policy" value="returns">
              <Text type="body" color="secondary">
                Items can be returned within 30 days of purchase. Items must be
                unused and in original packaging.
              </Text>
            </Collapsible>
          </Card>
          <Card>
            <Collapsible trigger="Payment Methods" value="payment">
              <Text type="body" color="secondary">
                We accept all major credit cards, PayPal, and bank transfers.
              </Text>
            </Collapsible>
          </Card>
        </VStack>
      </CollapsibleGroup>
    </Center>
  );
}
