// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import * as stylex from '@stylexjs/stylex';
import {ScrollableArea} from '@astryxdesign/core/ScrollableArea';
import {Card} from '@astryxdesign/core/Card';
import {HStack, VStack} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {List, ListItem} from '@astryxdesign/core/List';
import {colorVars, spacingVars} from '@astryxdesign/core/theme/tokens.stylex';

const styles = stylex.create({
  groupHeader: {
    position: 'sticky',
    insetBlockStart: 0,
    zIndex: 1,
    backgroundColor: colorVars['--color-background-card'],
    paddingBlock: spacingVars['--spacing-2'],
  },
});

const DAYS = [
  {
    date: 'Today',
    total: '−$84.31',
    entries: [
      {
        id: 'tx-9921',
        merchant: 'Blue Bottle Coffee',
        method: 'Visa ·· 4417',
        amount: '−$6.75',
      },
      {
        id: 'tx-9918',
        merchant: 'City Transit',
        method: 'Visa ·· 4417',
        amount: '−$2.90',
      },
      {
        id: 'tx-9914',
        merchant: 'Sunset Hardware',
        method: 'Checking ·· 0082',
        amount: '−$74.66',
      },
    ],
  },
  {
    date: 'Yesterday',
    total: '+$1,412.09',
    entries: [
      {
        id: 'tx-9902',
        merchant: 'Northwind Payroll',
        method: 'Direct deposit',
        amount: '+$1,640.00',
      },
      {
        id: 'tx-9897',
        merchant: 'Kestrel Insurance',
        method: 'Autopay',
        amount: '−$182.40',
      },
      {
        id: 'tx-9893',
        merchant: 'Greenhouse Market',
        method: 'Visa ·· 4417',
        amount: '−$45.51',
      },
    ],
  },
  {
    date: 'Monday, March 16',
    total: '−$311.08',
    entries: [
      {
        id: 'tx-9880',
        merchant: 'Harbor Dental',
        method: 'Checking ·· 0082',
        amount: '−$210.00',
      },
      {
        id: 'tx-9874',
        merchant: 'Atlas Fitness',
        method: 'Autopay',
        amount: '−$49.00',
      },
      {
        id: 'tx-9871',
        merchant: 'Corner Pharmacy',
        method: 'Visa ·· 4417',
        amount: '−$52.08',
      },
    ],
  },
] as const;

export default function ScrollableAreaStickyGroupHeaders() {
  return (
    <Card width={400} padding={0}>
      <VStack>
        <VStack gap={0.5} padding={4} paddingBlockEnd={2}>
          <Heading level={3}>Account activity</Heading>
          <Text type="supporting">Everyday Checking ·· 0082</Text>
        </VStack>
        <ScrollableArea
          axis="block"
          role="region"
          label="Account activity"
          height={280}
          paddingInline={4}
          paddingBlockEnd={4}>
          {DAYS.map(day => (
            <section key={day.date}>
              <HStack
                hAlign="between"
                vAlign="center"
                xstyle={styles.groupHeader}>
                <Text type="label" color="secondary">
                  {day.date}
                </Text>
                <Text type="supporting" hasTabularNumbers>
                  {day.total}
                </Text>
              </HStack>
              <List hasDividers density="compact">
                {day.entries.map(entry => (
                  <ListItem
                    key={entry.id}
                    label={entry.merchant}
                    description={entry.method}
                    endContent={
                      <Text type="body" hasTabularNumbers>
                        {entry.amount}
                      </Text>
                    }
                  />
                ))}
              </List>
            </section>
          ))}
        </ScrollableArea>
      </VStack>
    </Card>
  );
}
