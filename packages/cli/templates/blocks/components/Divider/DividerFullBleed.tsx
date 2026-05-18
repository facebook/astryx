// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSDivider} from '@xds/core/Divider';
import {XDSCard} from '@xds/core/Card';
import {XDSSection} from '@xds/core/Section';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

export default function DividerFullBleed() {
  return (
    <XDSSection width="100%">
      <XDSCard>
        <XDSVStack gap={3}>
          <XDSText type="label">Order Summary</XDSText>
          <XDSHStack hAlign="between">
            <XDSText type="body">3 items</XDSText>
            <XDSText type="body">$127.00</XDSText>
          </XDSHStack>
          <XDSDivider isFullBleed />
          <XDSHStack hAlign="between">
            <XDSText type="body">Shipping</XDSText>
            <XDSText type="body">$7.99</XDSText>
          </XDSHStack>
          <XDSHStack hAlign="between">
            <XDSText type="body">Tax</XDSText>
            <XDSText type="body">$10.16</XDSText>
          </XDSHStack>
          <XDSDivider isFullBleed />
          <XDSHStack hAlign="between">
            <XDSText type="label">Total</XDSText>
            <XDSText type="label">$145.15</XDSText>
          </XDSHStack>
        </XDSVStack>
      </XDSCard>
    </XDSSection>
  );
}
