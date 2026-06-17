// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {ClickableCard} from '@xds/core/ClickableCard';
import {Stack} from '@xds/core/Layout';
import {Text, Heading} from '@xds/core/Text';
import {Button} from '@xds/core/Button';

export default function ClickableCardWithNestedButton() {
  return (
    <ClickableCard label="Product" href="#" width={320}>
      <Stack direction="vertical" gap={3}>
        <Stack direction="vertical" gap={1}>
          <Heading level={4}>Wireless Headphones</Heading>
          <Text type="body" color="secondary">
            $79.99
          </Text>
        </Stack>
        <Button label="Add to cart" onClick={() => {}} variant="primary" />
      </Stack>
    </ClickableCard>
  );
}
