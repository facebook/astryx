// Copyright (c) Meta Platforms, Inc. and affiliates.

import {Heading} from '@astryxdesign/core/Heading';
import {Text} from '@astryxdesign/core/Text';
import {Breadcrumbs, BreadcrumbItem} from '@astryxdesign/core/Breadcrumbs';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Badge} from '@astryxdesign/core/Badge';
import {Divider} from '@astryxdesign/core/Divider';
import {VStack, HStack} from '@astryxdesign/core/Stack';

export default function ProductDetail() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-4">
      <Breadcrumbs>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem href="/electronics">Electronics</BreadcrumbItem>
        <BreadcrumbItem href="/electronics/audio">Audio</BreadcrumbItem>
        <BreadcrumbItem>Premium Wireless Headphones</BreadcrumbItem>
      </Breadcrumbs>

      <Button label="Back" variant="ghost" onClick={() => window.history.back()} />

      <Card padding={4}>
        <VStack gap={3}>
          <HStack vAlign="center" gap={2}>
            <Heading level={1}>Premium Wireless Headphones</Heading>
            <Badge variant="success">In Stock</Badge>
          </HStack>
          <Divider />
          <div className="space-y-1">
            <Text type="display-2">$299.99</Text>
            <Text type="supporting">Free shipping on orders over $50</Text>
          </div>
          <Divider />
          <div className="space-y-2">
            <Heading level={3}>Description</Heading>
            <Text>
              Experience crystal-clear audio with active noise cancellation, 30-hour battery life,
              and premium comfort. Features Bluetooth 5.3 and multi-device pairing.
            </Text>
          </div>
          <HStack gap={2}>
            <Button label="Add to Cart" variant="primary" />
            <Button label="Add to Wishlist" variant="secondary" />
          </HStack>
        </VStack>
      </Card>
    </div>
  );
}
