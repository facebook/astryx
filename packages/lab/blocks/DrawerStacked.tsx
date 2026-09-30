// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @input Controlled open states for an order and its line item
 * @output Sibling non-modal drawers with last-opened-first dismissal
 * @position Copyable Lab Drawer example
 */

import {useState} from 'react';
import {Drawer} from '@astryxdesign/lab';
import {Button} from '@astryxdesign/core/Button';
import {Section} from '@astryxdesign/core/Section';
import {VStack} from '@astryxdesign/core/Stack';
import {Heading, Text} from '@astryxdesign/core/Text';

export default function DrawerStacked() {
  const [orderOpen, setOrderOpen] = useState(false);
  const [lineItemOpen, setLineItemOpen] = useState(false);

  return (
    <>
      <Button label="Open order" onClick={() => setOrderOpen(true)} />
      <Drawer
        isOpen={orderOpen}
        onOpenChange={setOrderOpen}
        label="Order details"
        width={440}
        hasScrim={false}>
        <Section padding={4}>
          <VStack gap={2}>
            <Heading level={3}>Order details</Heading>
            <Text type="body">
              Inspect a line item without losing the order.
            </Text>
            <Button
              label="Open line item"
              onClick={() => setLineItemOpen(true)}
            />
          </VStack>
        </Section>
      </Drawer>
      <Drawer
        isOpen={lineItemOpen}
        onOpenChange={setLineItemOpen}
        label="Line item"
        width={320}
        hasScrim={false}>
        <Section padding={4}>
          <VStack gap={2}>
            <Heading level={3}>Line item</Heading>
            <Text type="body">
              Press Escape to return to the order details.
            </Text>
          </VStack>
        </Section>
      </Drawer>
    </>
  );
}
