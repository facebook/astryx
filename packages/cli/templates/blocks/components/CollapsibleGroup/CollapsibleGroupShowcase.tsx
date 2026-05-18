// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSCollapsible, XDSCollapsibleGroup} from '@xds/core/Collapsible';
import {XDSCard} from '@xds/core/Card';
import {XDSVStack} from '@xds/core/Layout';
import {XDSCenter} from '@xds/core/Center';
import {XDSText} from '@xds/core/Text';

export default function CollapsibleGroupShowcase() {
  return (
    <XDSCenter width={400}>
      <XDSCollapsibleGroup type="single" defaultValue="shipping">
        <XDSVStack gap={2} width="100%">
          <XDSCard>
            <XDSCollapsible trigger="Shipping Information" value="shipping">
              <XDSText type="body" color="secondary">
                Standard shipping takes 3–5 business days. Express shipping is
                available for an additional fee.
              </XDSText>
            </XDSCollapsible>
          </XDSCard>
          <XDSCard>
            <XDSCollapsible trigger="Return Policy" value="returns">
              <XDSText type="body" color="secondary">
                Items can be returned within 30 days of purchase. Items must be
                unused and in original packaging.
              </XDSText>
            </XDSCollapsible>
          </XDSCard>
          <XDSCard>
            <XDSCollapsible trigger="Payment Methods" value="payment">
              <XDSText type="body" color="secondary">
                We accept all major credit cards, PayPal, and bank transfers.
              </XDSText>
            </XDSCollapsible>
          </XDSCard>
        </XDSVStack>
      </XDSCollapsibleGroup>
    </XDSCenter>
  );
}
