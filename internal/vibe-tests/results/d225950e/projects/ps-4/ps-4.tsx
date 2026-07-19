// Copyright (c) Meta Platforms, Inc. and affiliates.

import {Heading} from '@astryxdesign/core/Heading';
import {Text} from '@astryxdesign/core/Text';
import {Button} from '@astryxdesign/core/Button';
import {Breadcrumbs, BreadcrumbItem} from '@astryxdesign/core/Breadcrumbs';
import {Card} from '@astryxdesign/core/Card';
import {Badge} from '@astryxdesign/core/Badge';
import {Divider} from '@astryxdesign/core/Divider';

export default function ProductDetailPage() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <Breadcrumbs>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem href="/electronics">Electronics</BreadcrumbItem>
        <BreadcrumbItem href="/electronics/audio">Audio</BreadcrumbItem>
        <BreadcrumbItem isCurrent>Wireless Headphones Pro</BreadcrumbItem>
      </Breadcrumbs>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center justify-center h-64">
            <Text color="secondary">Product Image Placeholder</Text>
          </div>
        </Card>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Heading level={1}>Wireless Headphones Pro</Heading>
            <Badge label="In Stock" variant="success" />
          </div>
          <Heading level={3}>$299.99</Heading>
          <Text color="secondary">
            Premium noise-cancelling headphones with 30-hour battery life,
            adaptive EQ, and spatial audio support.
          </Text>
          <Divider />
          <div className="flex flex-col gap-1">
            <Text weight="semibold">Key Features:</Text>
            <Text>Active Noise Cancellation</Text>
            <Text>30-hour battery life</Text>
            <Text>Bluetooth 5.3</Text>
            <Text>USB-C fast charging</Text>
          </div>
          <div className="flex gap-2">
            <Button label="Add to Cart" variant="primary" />
            <Button label="Save for Later" variant="secondary" />
          </div>
        </div>
      </div>
    </div>
  );
}
