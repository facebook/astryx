// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState, type CSSProperties} from 'react';
import {VStack, HStack, Layout, LayoutContent} from '@astryxdesign/core/Layout';
import {Center} from '@astryxdesign/core/Center';
import {Text, Heading} from '@astryxdesign/core/Text';
import {Grid} from '@astryxdesign/core/Grid';
import {Card} from '@astryxdesign/core/Card';
import {Section} from '@astryxdesign/core/Section';
import {Button} from '@astryxdesign/core/Button';
import {Badge} from '@astryxdesign/core/Badge';
import {Icon} from '@astryxdesign/core/Icon';
import {Divider} from '@astryxdesign/core/Divider';
import {CollapsibleGroup, Collapsible} from '@astryxdesign/core/Collapsible';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';

// ─── Styles ─────────────────────────────────────────────────────────────────

const outer: CSSProperties = {
  maxWidth: 1120,
  width: '100%',
  paddingInline: 'var(--spacing-6)',
  paddingBlock: 'var(--spacing-8)',
};
// The recommended tier is lifted rather than recolored, so the emphasis
// survives a theme swap and does not read as a status color.
const featuredTier: CSSProperties = {
  outline: '2px solid var(--color-border-selected)',
  outlineOffset: -2,
  borderRadius: 'var(--radius-container)',
};

// ─── Plan data ──────────────────────────────────────────────────────────────

type Billing = 'monthly' | 'annual';

interface Plan {
  id: string;
  name: string;
  blurb: string;
  price: Record<Billing, number>;
  cta: string;
  isFeatured?: boolean;
  features: string[];
}

const PLANS: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    blurb: 'For a side project or a first prototype.',
    price: {monthly: 0, annual: 0},
    cta: 'Start for free',
    features: [
      'Up to 3 projects',
      'Community support',
      '1 GB asset storage',
      'Weekly usage digest',
    ],
  },
  {
    id: 'team',
    name: 'Team',
    blurb: 'For a working team that ships every week.',
    price: {monthly: 24, annual: 19},
    cta: 'Start free trial',
    isFeatured: true,
    features: [
      'Unlimited projects',
      'Shared component library',
      'Role-based permissions',
      'Priority support',
      '100 GB asset storage',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    blurb: 'For organizations with procurement and audit needs.',
    price: {monthly: 68, annual: 54},
    cta: 'Talk to sales',
    features: [
      'Everything in Team',
      'SSO and SCIM provisioning',
      'Audit log export',
      'Dedicated success manager',
      'Custom data residency',
    ],
  },
];

const FAQS = [
  {
    id: 'switch',
    question: 'Can we change plans later?',
    answer:
      'Yes. Upgrades take effect immediately and downgrades apply at the end of the current billing period. Unused time is credited to the next invoice.',
  },
  {
    id: 'seats',
    question: 'How are seats counted?',
    answer:
      'A seat is any member who can edit. Viewers and commenters are free and unlimited on every paid plan.',
  },
  {
    id: 'trial',
    question: 'What happens when the trial ends?',
    answer:
      'The workspace moves to Starter automatically. Nothing is deleted, and paid features become read-only until a plan is chosen.',
  },
  {
    id: 'invoice',
    question: 'Do you support invoicing?',
    answer:
      'Annual Enterprise plans can be paid by invoice with net-30 terms. Monthly plans are card only.',
  },
];

// ─── Page ───────────────────────────────────────────────────────────────────

export default function MarketingPricing() {
  const [billing, setBilling] = useState<Billing>('annual');

  return (
    <Layout
      content={
        <LayoutContent padding={0}>
          <Center>
            <VStack gap={10} style={outer}>
              {/* Header ------------------------------------------------- */}
              <VStack gap={5} hAlign="center">
                <VStack gap={3} hAlign="center">
                  <Heading
                    level={1}
                    type="display-3"
                    justify="center"
                    textWrap="balance">
                    Pricing that grows with the team
                  </Heading>
                  <Text
                    type="body"
                    color="secondary"
                    justify="center"
                    textWrap="balance">
                    Every plan includes the full component library, unlimited
                    viewers, and no charge for the first two weeks.
                  </Text>
                </VStack>
                <SegmentedControl
                  value={billing}
                  onChange={value => setBilling(value as Billing)}
                  label="Billing period">
                  <SegmentedControlItem value="monthly" label="Monthly" />
                  <SegmentedControlItem
                    value="annual"
                    label="Annual (save 20%)"
                  />
                </SegmentedControl>
              </VStack>

              {/* Tiers ---------------------------------------------------- */}
              <Grid columns={{minWidth: 280, max: 3}} gap={4} align="stretch">
                {PLANS.map(plan => (
                  <Card
                    key={plan.id}
                    style={plan.isFeatured ? featuredTier : undefined}>
                    <VStack gap={5}>
                      <VStack gap={2}>
                        <HStack gap={2} vAlign="center">
                          <Heading level={2}>{plan.name}</Heading>
                          {plan.isFeatured ? (
                            <Badge variant="purple" label="Most popular" />
                          ) : null}
                        </HStack>
                        <Text type="supporting" color="secondary">
                          {plan.blurb}
                        </Text>
                      </VStack>

                      <HStack gap={1} vAlign="end">
                        <Heading level={3} type="display-3">
                          {plan.price[billing] === 0
                            ? 'Free'
                            : `$${plan.price[billing]}`}
                        </Heading>
                        {plan.price[billing] === 0 ? null : (
                          <Text type="supporting" color="secondary">
                            per editor / month
                          </Text>
                        )}
                      </HStack>

                      <Button
                        label={plan.cta}
                        variant={plan.isFeatured ? 'primary' : 'secondary'}
                        width="100%"
                      />

                      <Divider variant="subtle" />

                      <VStack gap={2} role="list">
                        {plan.features.map(feature => (
                          <HStack
                            key={feature}
                            gap={2}
                            vAlign="start"
                            role="listitem">
                            <Icon icon="check" size="sm" color="success" />
                            <Text type="supporting">{feature}</Text>
                          </HStack>
                        ))}
                      </VStack>
                    </VStack>
                  </Card>
                ))}
              </Grid>

              {/* FAQ ------------------------------------------------------ */}
              <Section variant="transparent" padding={0}>
                <VStack gap={4}>
                  <Heading level={2}>
                    Questions people ask before buying
                  </Heading>
                  <CollapsibleGroup type="single" hasDividers>
                    {FAQS.map(faq => (
                      <Collapsible
                        key={faq.id}
                        value={faq.id}
                        defaultIsOpen={false}
                        trigger={<Text type="body">{faq.question}</Text>}>
                        <Text type="supporting" color="secondary">
                          {faq.answer}
                        </Text>
                      </Collapsible>
                    ))}
                  </CollapsibleGroup>
                </VStack>
              </Section>
            </VStack>
          </Center>
        </LayoutContent>
      }
    />
  );
}
