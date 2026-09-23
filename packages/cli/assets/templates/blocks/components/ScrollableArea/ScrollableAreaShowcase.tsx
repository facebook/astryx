// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {ScrollableArea} from '@astryxdesign/core/ScrollableArea';
import {Card} from '@astryxdesign/core/Card';
import {HStack, VStack} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {List, ListItem} from '@astryxdesign/core/List';
import {Avatar} from '@astryxdesign/core/Avatar';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {Timestamp} from '@astryxdesign/core/Timestamp';

const REVIEWS = [
  {
    id: 4812,
    title: 'Return focus to the trigger when a dialog closes',
    author: 'Priya Raman',
    repo: 'web/checkout',
    state: 'Changes requested',
    variant: 'warning',
    updated: '2026-03-18T16:12:00',
  },
  {
    id: 4809,
    title: 'Cache currency rates for the pricing table',
    author: 'Tomas Lindqvist',
    repo: 'services/pricing',
    state: 'Approved',
    variant: 'success',
    updated: '2026-03-18T15:47:00',
  },
  {
    id: 4805,
    title: 'Drop the legacy address parser',
    author: 'Ines Okafor',
    repo: 'services/identity',
    state: 'Awaiting review',
    variant: 'neutral',
    updated: '2026-03-18T14:20:00',
  },
  {
    id: 4801,
    title: 'Retry webhook delivery with exponential backoff',
    author: 'Daniel Okorie',
    repo: 'services/events',
    state: 'Awaiting review',
    variant: 'neutral',
    updated: '2026-03-18T11:05:00',
  },
  {
    id: 4794,
    title: 'Fix truncation in the order summary on narrow screens',
    author: 'Mei Watanabe',
    repo: 'web/checkout',
    state: 'Approved',
    variant: 'success',
    updated: '2026-03-17T18:33:00',
  },
  {
    id: 4788,
    title: 'Add idempotency keys to refund requests',
    author: 'Sofia Marchetti',
    repo: 'services/payments',
    state: 'Changes requested',
    variant: 'warning',
    updated: '2026-03-17T16:58:00',
  },
  {
    id: 4781,
    title: 'Backfill missing tax regions for EU orders',
    author: 'Hugo Bernard',
    repo: 'services/tax',
    state: 'Awaiting review',
    variant: 'neutral',
    updated: '2026-03-17T09:12:00',
  },
] as const;

export default function ScrollableAreaShowcase() {
  return (
    <Card width={380} padding={0}>
      <VStack>
        <HStack
          padding={4}
          paddingBlockEnd={2}
          hAlign="between"
          vAlign="center">
          <Heading level={3}>Review queue</Heading>
          <Text type="supporting">7 open</Text>
        </HStack>
        <ScrollableArea
          axis="block"
          role="region"
          label="Review queue"
          height={260}
          paddingInline={4}
          paddingBlockEnd={4}>
          <List hasDividers>
            {REVIEWS.map(review => (
              <ListItem
                key={review.id}
                label={review.title}
                description={`${review.repo} · ${review.author}`}
                startContent={<Avatar name={review.author} size="sm" />}
                endContent={
                  <HStack gap={2} vAlign="center">
                    <StatusDot
                      variant={review.variant}
                      label={review.state}
                      tooltip={review.state}
                    />
                    <Timestamp value={review.updated} format="time" />
                  </HStack>
                }
                onClick={() => {}}
              />
            ))}
          </List>
        </ScrollableArea>
      </VStack>
    </Card>
  );
}
