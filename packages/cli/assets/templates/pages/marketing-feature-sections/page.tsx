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
import {Icon} from '@astryxdesign/core/Icon';
import {Divider} from '@astryxdesign/core/Divider';
import {AspectRatio} from '@astryxdesign/core/AspectRatio';
import {
  BoltIcon,
  LockClosedIcon,
  PuzzlePieceIcon,
  SwatchIcon,
} from '@heroicons/react/24/outline';

// ─── Styles ─────────────────────────────────────────────────────────────────

const outer: CSSProperties = {
  maxWidth: 1120,
  width: '100%',
  paddingInline: 'var(--spacing-6)',
  paddingBlock: 'var(--spacing-8)',
};
const mediaFrame: CSSProperties = {
  borderRadius: 'var(--radius-container)',
  overflow: 'clip',
};
const mediaFill: CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
};
// The wide tile in the bento row spans two tracks at desk width and folds back
// to one when the grid drops to a single column.
const bentoWide: CSSProperties = {
  gridColumn: 'span 2',
};

// ─── Content ────────────────────────────────────────────────────────────────

const CAPABILITIES = [
  {
    id: 'speed',
    icon: BoltIcon,
    title: 'Ships in a sprint',
    body: 'Start from a page template instead of a blank file. Every region is already wired to the layout budget.',
  },
  {
    id: 'themes',
    icon: SwatchIcon,
    title: 'Themes, not overrides',
    body: 'Semantic tokens mean a rebrand is a theme swap, never a search-and-replace through your components.',
  },
  {
    id: 'compose',
    icon: PuzzlePieceIcon,
    title: 'Open internals',
    body: 'Every primitive is exported. Compose on top of it rather than fighting a closed component.',
  },
  {
    id: 'trust',
    icon: LockClosedIcon,
    title: 'Accessible by default',
    body: 'Focus order, roles, and announcements ship with the component, audited on every release.',
  },
];

const METRICS = [
  {id: 'components', value: '158', label: 'Components'},
  {id: 'templates', value: '45', label: 'Page templates'},
  {id: 'locales', value: '29', label: 'Locales'},
  {id: 'themes', value: '12', label: 'Built-in themes'},
];

// ─── Page ───────────────────────────────────────────────────────────────────

/**
 * A gallery of feature-section shapes, not one section repeated. Each block
 * below is a different composition an agent can lift: a split media row, an
 * icon grid, a metric band, and a bento grid with one wide tile.
 */
export default function MarketingFeatureSections() {
  return (
    <Layout
      content={
        <LayoutContent padding={0}>
          <Center>
            <VStack gap={10} style={outer}>
              {/* 1. Split media row ------------------------------------- */}
              <Section variant="transparent" padding={0}>
                <Grid columns={{minWidth: 320, max: 2}} gap={6} align="center">
                  <VStack gap={4}>
                    <HStack>
                      <Badge variant="teal" label="Layout" />
                    </HStack>
                    <Heading level={2} type="display-3" textWrap="balance">
                      Frame the page before you fill it
                    </Heading>
                    <Text type="body" color="secondary">
                      Pick the shell, budget the regions, then drop content in.
                      The layout holds its shape from a phone to an ultrawide
                      without a media query in your app code.
                    </Text>
                    <HStack gap={3}>
                      <Button label="Read the layout guide" variant="primary" />
                      <Button
                        label="See templates"
                        variant="ghost"
                        endContent={
                          <Icon icon="chevronRight" size="sm" color="inherit" />
                        }
                      />
                    </HStack>
                  </VStack>
                  <AspectRatio ratio={4 / 3} style={mediaFrame}>
                    <img
                      style={mediaFill}
                      src="/template-assets/colorful-working-horizontal-1.png"
                      alt="A team reviewing a layout on a shared screen"
                    />
                  </AspectRatio>
                </Grid>
              </Section>

              <Divider variant="subtle" />

              {/* 2. Icon grid ------------------------------------------- */}
              <Section variant="transparent" padding={0}>
                <VStack gap={6}>
                  <VStack gap={2} hAlign="center">
                    <Heading
                      level={2}
                      type="display-3"
                      justify="center"
                      textWrap="balance">
                      What you get on day one
                    </Heading>
                    <Text
                      type="body"
                      color="secondary"
                      justify="center"
                      textWrap="balance">
                      Four things that stay true whether you ship one page or a
                      hundred.
                    </Text>
                  </VStack>
                  <Grid columns={{minWidth: 240, max: 4}} gap={5} align="start">
                    {CAPABILITIES.map(item => (
                      <VStack key={item.id} gap={2}>
                        <Icon icon={item.icon} size="md" color="accent" />
                        <Heading level={3}>{item.title}</Heading>
                        <Text type="supporting" color="secondary">
                          {item.body}
                        </Text>
                      </VStack>
                    ))}
                  </Grid>
                </VStack>
              </Section>

              {/* 3. Metric band ----------------------------------------- */}
              <Section variant="muted" padding={6}>
                <Grid columns={{minWidth: 160, max: 4}} gap={4}>
                  {METRICS.map(metric => (
                    <VStack key={metric.id} gap={1} hAlign="center">
                      <Heading level={3} type="display-3" justify="center">
                        {metric.value}
                      </Heading>
                      <Text
                        type="supporting"
                        color="secondary"
                        justify="center">
                        {metric.label}
                      </Text>
                    </VStack>
                  ))}
                </Grid>
              </Section>

              {/* 4. Bento grid ------------------------------------------ */}
              <Section variant="transparent" padding={0}>
                <VStack gap={6}>
                  <Heading level={2} type="display-3" textWrap="balance">
                    Built for the work that comes after launch
                  </Heading>
                  <Grid
                    columns={{minWidth: 260, max: 3}}
                    gap={4}
                    align="stretch">
                    <Card style={bentoWide}>
                      <VStack gap={3}>
                        <HStack>
                          <Badge variant="blue" label="Tokens" />
                        </HStack>
                        <Heading level={3}>One rename, every surface</Heading>
                        <Text type="supporting" color="secondary">
                          Colors, spacing, and radii are named by purpose.
                          Change the theme and the whole product follows,
                          including dark mode and the charts.
                        </Text>
                      </VStack>
                    </Card>
                    <Card>
                      <VStack gap={3}>
                        <HStack>
                          <Badge variant="orange" label="Codemods" />
                        </HStack>
                        <Heading level={3}>Upgrades you can run</Heading>
                        <Text type="supporting" color="secondary">
                          Breaking changes ship with a codemod, so a version
                          bump is a command rather than a migration project.
                        </Text>
                      </VStack>
                    </Card>
                  </Grid>
                </VStack>
              </Section>
            </VStack>
          </Center>
        </LayoutContent>
      }
    />
  );
}
