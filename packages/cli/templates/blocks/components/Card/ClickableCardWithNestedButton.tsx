'use client';

import {XDSClickableCard} from '@xds/core/ClickableCard';
import {XDSStack} from '@xds/core/Layout';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSButton} from '@xds/core/Button';

export default function ClickableCardWithNestedButton() {
  return (
    <XDSClickableCard label="Product" href="#" width={320}>
      <XDSStack direction="vertical" gap={3}>
        <XDSStack direction="vertical" gap={1}>
          <XDSHeading level={4}>Wireless Headphones</XDSHeading>
          <XDSText type="body" color="secondary">
            $79.99
          </XDSText>
        </XDSStack>
        <XDSButton label="Add to cart" onClick={() => {}} variant="primary" />
      </XDSStack>
    </XDSClickableCard>
  );
}
