// Copyright (c) Meta Platforms, Inc. and affiliates.

import {VStack, HStack} from '@astryxdesign/core/Stack';
import {Heading} from '@astryxdesign/core/Heading';
import {Text} from '@astryxdesign/core/Text';
import {Breadcrumbs, BreadcrumbItem} from '@astryxdesign/core/Breadcrumbs';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Badge} from '@astryxdesign/core/Badge';
import {Divider} from '@astryxdesign/core/Divider';

export default function ProductDetail() {
  return (
    <VStack gap={4} padding={4}>
      <Breadcrumbs>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem href="/electronics">Electronics</BreadcrumbItem>
        <BreadcrumbItem href="/electronics/audio">Audio</BreadcrumbItem>
        <BreadcrumbItem>Premium Wireless Headphones</BreadcrumbItem>
      </Breadcrumbs>

      <HStack gap={1}>
        <Button label="Back" variant="ghost" onClick={() => window.history.back()} />
      </HStack>

      <Card padding={4}>
        <VStack gap={3}>
          <HStack vAlign="center" gap={2}>
            <Heading level={1}>Premium Wireless Headphones</Heading>
            <Badge variant="success">In Stock</Badge>
          </HStack>
          <Divider />
          <VStack gap={2}>
            <Text type="display-2">$299.99</Text>
            <Text type="supporting">Free shipping on orders over $50</Text>
          </VStack>
          <Divider />
          <VStack gap={2}>
            <Heading level={3}>Description</Heading>
            <Text>
              Experience crystal-clear audio with active noise cancellation, 30-hour battery life,
              and premium comfort for all-day listening. Features Bluetooth 5.3 and multi-device pairing.
            </Text>
          </VStack>
          <HStack gap={2}>
            <Button label="Add to Cart" variant="primary" />
            <Button label="Add to Wishlist" variant="secondary" />
          </HStack>
        </VStack>
      </Card>
    </VStack>
  );
}
