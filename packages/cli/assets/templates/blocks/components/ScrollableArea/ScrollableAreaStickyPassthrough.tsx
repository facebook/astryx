// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import * as stylex from '@stylexjs/stylex';
import {ScrollableArea} from '@astryxdesign/core/ScrollableArea';
import {Card} from '@astryxdesign/core/Card';
import {HStack, VStack, Stack} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Item} from '@astryxdesign/core/Item';
import {Badge} from '@astryxdesign/core/Badge';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {colorVars, spacingVars} from '@astryxdesign/core/theme/tokens.stylex';

const styles = stylex.create({
  queueHeader: {
    position: 'sticky',
    insetBlockStart: 0,
    zIndex: 1,
    backgroundColor: colorVars['--color-background-card'],
    paddingBlock: spacingVars['--spacing-2'],
  },
});

const ESCALATIONS = [
  {
    id: 'INC-4471',
    summary: 'Checkout returns 502 for EU card payments',
    meta: 'Raised 14 min ago · Payments',
    severity: 'error',
    level: 'Sev 1',
  },
  {
    id: 'INC-4468',
    summary: 'Refund webhooks retrying against a dead endpoint',
    meta: 'Raised 52 min ago · Events',
    severity: 'warning',
    level: 'Sev 2',
  },
  {
    id: 'INC-4463',
    summary: 'Tax service latency above the alert threshold',
    meta: 'Raised 1 hr ago · Tax',
    severity: 'warning',
    level: 'Sev 2',
  },
  {
    id: 'INC-4459',
    summary: 'Address validation failing for PO boxes',
    meta: 'Raised 2 hr ago · Identity',
    severity: 'warning',
    level: 'Sev 3',
  },
  {
    id: 'INC-4455',
    summary: 'Order export job stuck behind a lock',
    meta: 'Raised 3 hr ago · Warehouse',
    severity: 'warning',
    level: 'Sev 3',
  },
] as const;

const WAITING = [
  {
    id: 'TK-2290',
    summary: 'Duplicate invoice on annual renewal',
    meta: 'Awaiting reply since Monday · Northwind Co.',
  },
  {
    id: 'TK-2284',
    summary: 'SSO metadata rejected during setup',
    meta: 'Awaiting reply since Friday · Kestrel Group',
  },
  {
    id: 'TK-2279',
    summary: 'Bulk upload rejects rows with accented names',
    meta: 'Awaiting reply since Friday · Marchetti SRL',
  },
  {
    id: 'TK-2273',
    summary: 'Requests a VAT number change on past invoices',
    meta: 'Awaiting reply since Thursday · Bernard et Fils',
  },
  {
    id: 'TK-2269',
    summary: 'Cannot remove a seat from the team plan',
    meta: 'Awaiting reply since Wednesday · Okorie Labs',
  },
];

const RESOLVED = [
  {
    id: 'TK-2277',
    summary: 'Tax region missing on Irish orders',
    meta: 'Resolved yesterday by Mei Watanabe',
  },
  {
    id: 'TK-2271',
    summary: 'Order export timed out over 90 days',
    meta: 'Resolved yesterday by Hugo Bernard',
  },
  {
    id: 'TK-2264',
    summary: 'Address autocomplete dropped unit numbers',
    meta: 'Resolved Monday by Priya Raman',
  },
  {
    id: 'TK-2258',
    summary: 'Receipt email rendered without the logo',
    meta: 'Resolved Monday by Tomas Lindqvist',
  },
  {
    id: 'TK-2251',
    summary: 'Discount code accepted after expiry',
    meta: 'Resolved last week by Ines Okafor',
  },
];

export default function ScrollableAreaStickyPassthrough() {
  return (
    <Card width={420} padding={0}>
      <VStack>
        <VStack gap={0.5} padding={4} paddingBlockEnd={2}>
          <Heading level={3}>Assigned to you</Heading>
          <Text type="supporting">Support · on call until 6:00 PM</Text>
        </VStack>
        <ScrollableArea
          axis="block"
          role="region"
          label="Assigned queues"
          height={300}
          paddingInline={4}
          paddingBlockEnd={4}>
          {/* Fitting content, so this viewport clips instead of scrolling and
              never becomes the Sticky boundary: the heading pins to the outer
              panel edge. */}
          <ScrollableArea axis="block" label="Escalations">
            <HStack
              hAlign="between"
              vAlign="center"
              xstyle={styles.queueHeader}>
              <Text type="label">Escalations</Text>
              <Badge variant="error" label="5 open" />
            </HStack>
            <Stack gap={0}>
              {ESCALATIONS.map(incident => (
                <Item
                  key={incident.id}
                  startContent={
                    <StatusDot
                      variant={incident.severity}
                      label={incident.level}
                    />
                  }
                  label={incident.summary}
                  description={incident.meta}
                  endContent={<Text color="secondary">{incident.id}</Text>}
                />
              ))}
            </Stack>
          </ScrollableArea>

          {/* Same fitting content, but containment is explicit: this viewport
              stays the Sticky boundary, so its heading leaves with it. */}
          <ScrollableArea
            axis="block"
            label="Waiting on customer"
            stickyContainment="always">
            <HStack
              hAlign="between"
              vAlign="center"
              xstyle={styles.queueHeader}>
              <Text type="label">Waiting on customer</Text>
              <Badge label="5 open" />
            </HStack>
            <Stack gap={0}>
              {WAITING.map(ticket => (
                <Item
                  key={ticket.id}
                  startContent={<StatusDot variant="neutral" label="Waiting" />}
                  label={ticket.summary}
                  description={ticket.meta}
                  endContent={<Text color="secondary">{ticket.id}</Text>}
                />
              ))}
            </Stack>
          </ScrollableArea>

          <HStack hAlign="between" vAlign="center" xstyle={styles.queueHeader}>
            <Text type="label">Recently resolved</Text>
            <Badge variant="success" label="5" />
          </HStack>
          <Stack gap={0}>
            {RESOLVED.map(ticket => (
              <Item
                key={ticket.id}
                startContent={<StatusDot variant="success" label="Resolved" />}
                label={ticket.summary}
                description={ticket.meta}
                endContent={<Text color="secondary">{ticket.id}</Text>}
              />
            ))}
          </Stack>
        </ScrollableArea>
      </VStack>
    </Card>
  );
}
