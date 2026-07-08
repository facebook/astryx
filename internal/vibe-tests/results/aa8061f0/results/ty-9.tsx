// Copyright (c) Meta Platforms, Inc. and affiliates.

import {Heading} from '@astryxdesign/core/Heading';
import {Text} from '@astryxdesign/core/Text';
import {VStack} from '@astryxdesign/core/VStack';
import {Badge} from '@astryxdesign/core/Badge';
import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 0,
  },
  column: {
    padding: 24,
    textAlign: 'center' as const,
    borderRight: '1px solid var(--color-border)',
  },
  lastColumn: {
    borderRight: 'none',
  },
  highlighted: {
    backgroundColor: 'var(--color-surface-raised)',
  },
});

const plans = [
  {name: 'Starter', price: '$9/mo', highlighted: false},
  {name: 'Pro', price: '$29/mo', highlighted: false},
  {name: 'Enterprise', price: 'Custom', highlighted: true},
];

export default function ComparisonHeader() {
  return (
    <div {...stylex.props(styles.grid)}>
      {plans.map((plan, i) => (
        <div key={plan.name} {...stylex.props(styles.column, i === plans.length - 1 && styles.lastColumn, plan.highlighted && styles.highlighted)}>
          <VStack gap={2} hAlign="center">
            <Heading level={3}>{plan.name}</Heading>
            {plan.highlighted && <Badge label="Popular" />}
            <Text type="large">{plan.price}</Text>
          </VStack>
        </div>
      ))}
    </div>
  );
}
