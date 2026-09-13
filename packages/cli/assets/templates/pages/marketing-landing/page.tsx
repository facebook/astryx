// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import type {CSSProperties} from 'react';
import {VStack, HStack, Layout, LayoutContent} from '@astryxdesign/core/Layout';
import {Center} from '@astryxdesign/core/Center';
import {Text, Heading} from '@astryxdesign/core/Text';
import {Grid} from '@astryxdesign/core/Grid';
import {Card} from '@astryxdesign/core/Card';
import {Section} from '@astryxdesign/core/Section';
import {Button} from '@astryxdesign/core/Button';
import {Badge} from '@astryxdesign/core/Badge';
import {Link} from '@astryxdesign/core/Link';
import {Icon} from '@astryxdesign/core/Icon';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Divider} from '@astryxdesign/core/Divider';
import {Blockquote} from '@astryxdesign/core/Blockquote';
import {AspectRatio} from '@astryxdesign/core/AspectRatio';

// ─── Styles ─────────────────────────────────────────────────────────────────

const outer: CSSProperties = {
  maxWidth: 1120,
  width: '100%',
  paddingInline: 'var(--spacing-6)',
  paddingBlock: 'var(--spacing-8)',
};
const heroFrame: CSSProperties = {
  borderRadius: 'var(--radius-page)',
  overflow: 'clip',
};
const heroFill: CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
};

// ─── Content ────────────────────────────────────────────────────────────────

const PILLARS = [
  {
    id: 'frame',
    title: 'Frame first',
    body: 'Choose a shell and budget the regions before a single component lands. The page keeps its shape at every width.',
  },
  {
    id: 'tokens',
    title: 'Tokens, not hex',
    body: 'Colors and spacing are named by purpose, so a rebrand or a dark mode is a theme swap rather than a rewrite.',
  },
  {
    id: 'open',
    title: 'Nothing sealed',
    body: 'Every primitive is exported. Build on top of a component instead of forking it when the design shifts.',
  },
];

const PLAN_TEASERS = [
  {id: 'starter', name: 'Starter', price: 'Free', note: 'Up to 3 projects'},
  {id: 'team', name: 'Team', price: '$19', note: 'Per editor, billed annually'},
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: '$54',
    note: 'SSO, audit log, residency',
  },
];

// ─── Page ───────────────────────────────────────────────────────────────────

/**
 * A full marketing landing page: hero, social proof, value pillars, a product
 * shot, a testimonial, a pricing teaser, and a closing call to action. It is
 * the composition an agent should reach for on "build me a landing page".
 */
export default function MarketingLanding() {
  return (
    <Layout
      content={
        <LayoutContent padding={0}>
          <Center>
            <VStack gap={10} style={outer}>
              {/* Hero ---------------------------------------------------- */}
              <VStack gap={6} hAlign="center">
                <Badge variant="teal" label="v0.4 is out" />
                <VStack gap={3} hAlign="center">
                  <Heading
                    level={1}
                    type="display-1"
                    justify="center"
                    textWrap="balance">
                    Ship the interface, not the scaffolding
                  </Heading>
                  <Text
                    type="large"
                    color="secondary"
                    justify="center"
                    textWrap="balance">
                    A design system for internal tools and products, with 158
                    components, 45 page templates, and a CLI that writes the
                    boilerplate for you.
                  </Text>
                </VStack>
                <HStack gap={3} wrap="wrap" justify="center">
                  <Button
                    label="Get started"
                    variant="primary"
                    endContent={
                      <Icon icon="chevronRight" size="sm" color="inherit" />
                    }
                  />
                  <Button label="Browse templates" variant="secondary" />
                </HStack>
                <Text type="supporting" color="secondary" justify="center">
                  MIT licensed. No account needed to try it.
                </Text>
              </VStack>

              {/* Product shot -------------------------------------------- */}
              <AspectRatio ratio={16 / 9} style={heroFrame}>
                <img
                  style={heroFill}
                  src="/template-assets/colorful-working-horizontal-2.png"
                  alt="The design system rendering a dashboard and a settings page"
                />
              </AspectRatio>

              {/* Value pillars ------------------------------------------- */}
              <Section variant="transparent" padding={0}>
                <Grid columns={{minWidth: 260, max: 3}} gap={6} align="start">
                  {PILLARS.map(pillar => (
                    <VStack key={pillar.id} gap={2}>
                      <Heading level={2}>{pillar.title}</Heading>
                      <Text type="supporting" color="secondary">
                        {pillar.body}
                      </Text>
                    </VStack>
                  ))}
                </Grid>
              </Section>

              <Divider variant="subtle" />

              {/* Testimonial --------------------------------------------- */}
              <Section variant="muted" padding={6}>
                <VStack gap={4}>
                  <Blockquote>
                    <Text type="large" textWrap="balance">
                      We replaced four in-house component libraries with this
                      one. The part that sold the team was not the components,
                      it was that a rebrand stopped being a quarter of work.
                    </Text>
                  </Blockquote>
                  <HStack gap={3} vAlign="center">
                    <Avatar name="Priya Raman" size="sm" />
                    <VStack gap={0.5}>
                      <Text type="label">Priya Raman</Text>
                      <Text type="supporting" color="secondary">
                        Head of Design Platform, Northwind
                      </Text>
                    </VStack>
                  </HStack>
                </VStack>
              </Section>

              {/* Pricing teaser ------------------------------------------ */}
              <Section variant="transparent" padding={0}>
                <VStack gap={5}>
                  <VStack gap={2} hAlign="center">
                    <Heading
                      level={2}
                      type="display-3"
                      justify="center"
                      textWrap="balance">
                      Simple plans, no seat math
                    </Heading>
                    <Text type="supporting" color="secondary" justify="center">
                      Viewers are always free. Only editors count toward a seat.
                    </Text>
                  </VStack>
                  <Grid
                    columns={{minWidth: 240, max: 3}}
                    gap={4}
                    align="stretch">
                    {PLAN_TEASERS.map(plan => (
                      <Card key={plan.id}>
                        <VStack gap={2}>
                          <Heading level={3}>{plan.name}</Heading>
                          <Heading level={4} type="display-3">
                            {plan.price}
                          </Heading>
                          <Text type="supporting" color="secondary">
                            {plan.note}
                          </Text>
                        </VStack>
                      </Card>
                    ))}
                  </Grid>
                  <Center>
                    <Link href="#">Compare every plan feature</Link>
                  </Center>
                </VStack>
              </Section>

              {/* Closing CTA --------------------------------------------- */}
              <Section variant="muted" padding={8}>
                <VStack gap={4} hAlign="center">
                  <Heading
                    level={2}
                    type="display-2"
                    justify="center"
                    textWrap="balance">
                    Start with a template, not a blank file
                  </Heading>
                  <Text
                    type="body"
                    color="secondary"
                    justify="center"
                    textWrap="balance">
                    One command scaffolds a themed page you can hand to a
                    reviewer today.
                  </Text>
                  <HStack gap={3} wrap="wrap" justify="center">
                    <Button label="Install the CLI" variant="primary" />
                    <Button label="Read the docs" variant="ghost" />
                  </HStack>
                </VStack>
              </Section>
            </VStack>
          </Center>
        </LayoutContent>
      }
    />
  );
}
