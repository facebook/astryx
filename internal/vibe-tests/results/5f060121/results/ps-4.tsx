// Copyright (c) Meta Platforms, Inc. and affiliates.

import {Breadcrumbs, BreadcrumbItem} from '@astryxdesign/core/Breadcrumbs';
import {Card} from '@astryxdesign/core/Card';
import {Button} from '@astryxdesign/core/Button';
import {Heading} from '@astryxdesign/core/Heading';
import {Text} from '@astryxdesign/core/Text';

export default function ProductDetail() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <Breadcrumbs>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem href="/electronics">Electronics</BreadcrumbItem>
        <BreadcrumbItem href="/electronics/audio">Audio</BreadcrumbItem>
        <BreadcrumbItem isCurrent>Wireless Headphones</BreadcrumbItem>
      </Breadcrumbs>
      <Card padding={5}>
        <div className="flex flex-col gap-4">
          <Heading level={1}>Wireless Headphones Pro</Heading>
          <Text type="large" color="accent">$199.99</Text>
          <Text color="secondary">
            Premium noise-cancelling headphones with 30-hour battery life, adaptive EQ, and multipoint connection.
          </Text>
          <div className="flex gap-3">
            <Button label="Add to Cart" variant="primary" />
            <Button label="Save for Later" variant="ghost" />
          </div>
        </div>
      </Card>
    </div>
  );
}
