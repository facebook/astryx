// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {ScrollableArea} from '@astryxdesign/core/ScrollableArea';
import {Card} from '@astryxdesign/core/Card';
import {HStack, VStack} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Badge} from '@astryxdesign/core/Badge';
import {Link} from '@astryxdesign/core/Link';

const REPORTS = [
  {
    id: 'checkout-conversion',
    name: 'Checkout conversion',
    value: '4.82%',
    delta: '+0.34 pts',
    trend: 'success',
    window: 'Last 7 days',
  },
  {
    id: 'cart-abandonment',
    name: 'Cart abandonment',
    value: '61.4%',
    delta: '+2.1 pts',
    trend: 'error',
    window: 'Last 7 days',
  },
  {
    id: 'refund-rate',
    name: 'Refund rate',
    value: '1.9%',
    delta: '−0.4 pts',
    trend: 'success',
    window: 'Last 30 days',
  },
  {
    id: 'median-fulfilment',
    name: 'Median fulfilment',
    value: '1.6 days',
    delta: 'No change',
    trend: 'neutral',
    window: 'Last 30 days',
  },
  {
    id: 'support-contacts',
    name: 'Support contacts',
    value: '312',
    delta: '−18%',
    trend: 'success',
    window: 'Last 7 days',
  },
  {
    id: 'repeat-customers',
    name: 'Repeat customers',
    value: '27.5%',
    delta: '+1.2 pts',
    trend: 'success',
    window: 'Last 90 days',
  },
] as const;

export default function ScrollableAreaInlineRail() {
  return (
    <Card width={520} padding={4}>
      <VStack gap={3}>
        <HStack hAlign="between" vAlign="center">
          <VStack gap={0.5}>
            <Heading level={3}>Saved reports</Heading>
            <Text type="supporting">
              Updated hourly from the orders warehouse
            </Text>
          </VStack>
          <Link href="#reports">View all</Link>
        </HStack>
        <ScrollableArea
          axis="inline"
          role="region"
          label="Saved reports"
          isFullBleed
          paddingInline={4}
          paddingBlock={0.5}>
          <HStack gap={3}>
            {REPORTS.map(report => (
              <Card key={report.id} variant="muted" width={180} padding={3}>
                <VStack gap={2}>
                  <Text type="supporting" maxLines={1}>
                    {report.name}
                  </Text>
                  <Heading level={4}>{report.value}</Heading>
                  <HStack gap={2} vAlign="center">
                    <Badge variant={report.trend} label={report.delta} />
                    <Text type="supporting" size="2xs">
                      {report.window}
                    </Text>
                  </HStack>
                </VStack>
              </Card>
            ))}
          </HStack>
        </ScrollableArea>
      </VStack>
    </Card>
  );
}
