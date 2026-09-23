// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {ScrollableArea} from '@astryxdesign/core/ScrollableArea';
import {Card} from '@astryxdesign/core/Card';
import {HStack, VStack, Stack} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Item} from '@astryxdesign/core/Item';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Badge} from '@astryxdesign/core/Badge';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';

const LINE_ITEMS = [
  {
    sku: 'CH-2204',
    name: 'Alder dining chair, walnut',
    detail: 'Qty 4 · $189.00 each',
    total: '$756.00',
  },
  {
    sku: 'TB-1180',
    name: 'Fenwick extending table',
    detail: 'Qty 1 · $1,240.00 each',
    total: '$1,240.00',
  },
  {
    sku: 'RG-0451',
    name: 'Hand-loomed wool rug, 8×10',
    detail: 'Qty 1 · $615.00 each',
    total: '$615.00',
  },
  {
    sku: 'LP-3392',
    name: 'Ridge floor lamp, brass',
    detail: 'Qty 2 · $148.00 each',
    total: '$296.00',
  },
  {
    sku: 'CS-7710',
    name: 'Linen seat cushion, fog',
    detail: 'Qty 4 · $42.00 each',
    total: '$168.00',
  },
  {
    sku: 'PR-0098',
    name: 'Felt floor protectors',
    detail: 'Qty 1 · $12.00 each',
    total: '$12.00',
  },
];

const TIMELINE = [
  {
    id: 'placed',
    label: 'Order placed',
    detail: 'March 14 · 9:22 AM',
    icon: 'check',
    color: 'success',
  },
  {
    id: 'paid',
    label: 'Payment captured',
    detail: 'March 14 · 9:23 AM · Visa ·· 4417',
    icon: 'check',
    color: 'success',
  },
  {
    id: 'packed',
    label: 'Packed at Oakland warehouse',
    detail: 'March 16 · 2:05 PM · 3 cartons',
    icon: 'check',
    color: 'success',
  },
  {
    id: 'transit',
    label: 'In transit',
    detail: 'Expected March 21 · Freight, curbside',
    icon: 'clock',
    color: 'accent',
  },
] as const;

export default function ScrollableAreaOverscrollChaining() {
  return (
    <Card width={430} padding={0}>
      <VStack>
        <VStack gap={0.5} padding={4} paddingBlockEnd={3}>
          <HStack hAlign="between" vAlign="center">
            <Heading level={3}>Order #48-2207</Heading>
            <Badge variant="blue" label="In transit" />
          </HStack>
          <Text type="supporting">Placed March 14 · Ines Okafor</Text>
        </VStack>
        <ScrollableArea
          axis="block"
          role="region"
          label="Order 48-2207 detail"
          height={320}
          paddingInline={4}
          paddingBlockEnd={4}>
          <VStack gap={4}>
            <VStack gap={2}>
              <HStack hAlign="between" vAlign="center">
                <Text type="label">Items</Text>
                <Text type="supporting">13 units</Text>
              </HStack>
              {/* Default overscroll="allow": a gesture that reaches the end of
                  this list carries on scrolling the order panel behind it. */}
              <ScrollableArea axis="block" label="Order items" height={160}>
                <Stack gap={0}>
                  {LINE_ITEMS.map(item => (
                    <Item
                      key={item.sku}
                      label={item.name}
                      description={item.detail}
                      endContent={<Text>{item.total}</Text>}
                    />
                  ))}
                </Stack>
              </ScrollableArea>
              <Text type="supporting">
                Scroll to the end of the item list and the panel keeps going —
                the default overscroll=&quot;allow&quot; hands the gesture to
                the nearest scrolling ancestor.
              </Text>
            </VStack>

            <Divider />

            <VStack gap={2}>
              <Text type="label">Fulfilment</Text>
              <Stack gap={0}>
                {TIMELINE.map(step => (
                  <Item
                    key={step.id}
                    startContent={
                      <Icon icon={step.icon} size="sm" color={step.color} />
                    }
                    label={step.label}
                    description={step.detail}
                  />
                ))}
              </Stack>
            </VStack>

            <Divider />

            <VStack gap={2}>
              <Text type="label">Customer</Text>
              <Item
                startContent={<Avatar name="Ines Okafor" size="sm" />}
                label="Ines Okafor"
                description="ines@northwind.example · 4 previous orders"
              />
              <Item
                label="Ship to"
                description="2118 Fell Street, San Francisco, CA 94117"
              />
            </VStack>
          </VStack>
        </ScrollableArea>
      </VStack>
    </Card>
  );
}
