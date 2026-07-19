// Copyright (c) Meta Platforms, Inc. and affiliates.

import {VStack} from '@astryxdesign/core/Stack';
import {HStack} from '@astryxdesign/core/Stack';
import {Heading} from '@astryxdesign/core/Heading';
import {Text} from '@astryxdesign/core/Text';
import {Button} from '@astryxdesign/core/Button';
import {Breadcrumbs, BreadcrumbItem} from '@astryxdesign/core/Breadcrumbs';
import {Card} from '@astryxdesign/core/Card';
import {Badge} from '@astryxdesign/core/Badge';
import {Divider} from '@astryxdesign/core/Divider';
import {Grid} from '@astryxdesign/core/Grid';

export default function ProductDetailPage() {
  return (
    <VStack gap={4}>
      <Breadcrumbs>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem href="/electronics">Electronics</BreadcrumbItem>
        <BreadcrumbItem href="/electronics/audio">Audio</BreadcrumbItem>
        <BreadcrumbItem isCurrent>Wireless Headphones Pro</BreadcrumbItem>
      </Breadcrumbs>
      <Grid columns={2} gap={6}>
        <Card>
          <VStack gap={2} align="center">
            <Text color="secondary">Product Image Placeholder</Text>
          </VStack>
        </Card>
        <VStack gap={3}>
          <HStack gap={2} align="center">
            <Heading level={1}>Wireless Headphones Pro</Heading>
            <Badge label="In Stock" variant="success" />
          </HStack>
          <Heading level={3}>$299.99</Heading>
          <Text color="secondary">
            Premium noise-cancelling headphones with 30-hour battery life,
            adaptive EQ, and spatial audio support.
          </Text>
          <Divider />
          <VStack gap={2}>
            <Text weight="semibold">Key Features:</Text>
            <Text>Active Noise Cancellation</Text>
            <Text>30-hour battery life</Text>
            <Text>Bluetooth 5.3</Text>
            <Text>USB-C fast charging</Text>
          </VStack>
          <HStack gap={2}>
            <Button label="Add to Cart" variant="primary" />
            <Button label="Save for Later" variant="secondary" />
          </HStack>
        </VStack>
      </Grid>
    </VStack>
  );
}
