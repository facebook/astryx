// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState, type CSSProperties} from 'react';
import {VStack, HStack, Layout, LayoutContent} from '@astryxdesign/core/Layout';
import {Center} from '@astryxdesign/core/Center';
import {Text, Heading} from '@astryxdesign/core/Text';
import {Grid} from '@astryxdesign/core/Grid';
import {Section} from '@astryxdesign/core/Section';
import {Button} from '@astryxdesign/core/Button';
import {Link} from '@astryxdesign/core/Link';
import {Icon} from '@astryxdesign/core/Icon';
import {Divider} from '@astryxdesign/core/Divider';
import {TextInput} from '@astryxdesign/core/TextInput';

// ─── Styles ─────────────────────────────────────────────────────────────────

const brandBlock: CSSProperties = {
  maxWidth: 320,
};
const outer: CSSProperties = {
  maxWidth: 1120,
  width: '100%',
  paddingInline: 'var(--spacing-6)',
  paddingBlock: 'var(--spacing-8)',
};

// ─── Link data ──────────────────────────────────────────────────────────────

const SITEMAP = [
  {
    id: 'product',
    heading: 'Product',
    links: ['Components', 'Templates', 'Themes', 'Changelog', 'Roadmap'],
  },
  {
    id: 'developers',
    heading: 'Developers',
    links: ['Getting started', 'CLI reference', 'Migration guide', 'GitHub'],
  },
  {
    id: 'company',
    heading: 'Company',
    links: ['About', 'Blog', 'Careers', 'Press kit'],
  },
  {
    id: 'legal',
    heading: 'Legal',
    links: ['Privacy', 'Terms', 'Licenses', 'Accessibility'],
  },
];

const SOCIAL = ['GitHub', 'Discord', 'Bluesky'];

// ─── Page ───────────────────────────────────────────────────────────────────

/**
 * Three footer shapes on one page, so an agent can lift the one that matches
 * the product: a full sitemap footer, a newsletter capture footer, and a
 * one-line minimal footer. Each is a `Section`, not a `Card`, because a footer
 * is a page region rather than a discrete item.
 */
export default function MarketingFooter() {
  const [email, setEmail] = useState('');

  return (
    <Layout
      content={
        <LayoutContent padding={0}>
          <Center>
            <VStack gap={10} style={outer}>
              {/* 1. Sitemap footer -------------------------------------- */}
              <VStack gap={3}>
                <Text type="label" color="secondary">
                  Sitemap footer
                </Text>
                <Section variant="muted" padding={6}>
                  <VStack gap={6}>
                    <VStack gap={2} style={brandBlock}>
                      <Heading level={2}>Astryx</Heading>
                      <Text type="supporting" color="secondary">
                        A design system for building internal tools and
                        products.
                      </Text>
                    </VStack>
                    <Grid
                      columns={{minWidth: 180, max: 4}}
                      gap={6}
                      align="start">
                      {SITEMAP.map(column => (
                        <VStack key={column.id} gap={2}>
                          <Heading level={3}>{column.heading}</Heading>
                          <VStack gap={1.5}>
                            {column.links.map(link => (
                              <Link key={link} href="#">
                                {link}
                              </Link>
                            ))}
                          </VStack>
                        </VStack>
                      ))}
                    </Grid>
                    <Divider variant="subtle" />
                    <HStack
                      gap={4}
                      vAlign="center"
                      justify="between"
                      wrap="wrap">
                      <Text type="supporting" color="secondary">
                        Copyright 2026 Astryx. Open source under the MIT
                        license.
                      </Text>
                      <HStack gap={4}>
                        {SOCIAL.map(name => (
                          <Link key={name} href="#" isExternalLink>
                            {name}
                          </Link>
                        ))}
                      </HStack>
                    </HStack>
                  </VStack>
                </Section>
              </VStack>

              {/* 2. Newsletter footer ----------------------------------- */}
              <VStack gap={3}>
                <Text type="label" color="secondary">
                  Newsletter footer
                </Text>
                <Section variant="section" padding={6}>
                  <VStack gap={5}>
                    <Grid
                      columns={{minWidth: 280, max: 2}}
                      gap={6}
                      align="center">
                      <VStack gap={2}>
                        <Heading level={2} type="display-3" textWrap="balance">
                          One email a month, no filler
                        </Heading>
                        <Text type="supporting" color="secondary">
                          Release notes, new templates, and the occasional deep
                          dive on a component we rebuilt.
                        </Text>
                      </VStack>
                      <HStack gap={2} vAlign="end" wrap="wrap">
                        <VStack>
                          <TextInput
                            label="Email address"
                            value={email}
                            onChange={setEmail}
                            type="email"
                            placeholder="you@company.com"
                          />
                        </VStack>
                        <Button label="Subscribe" variant="primary" />
                      </HStack>
                    </Grid>
                    <Divider variant="subtle" />
                    <HStack
                      gap={4}
                      vAlign="center"
                      justify="between"
                      wrap="wrap">
                      <Text type="supporting" color="secondary">
                        Copyright 2026 Astryx
                      </Text>
                      <HStack gap={4}>
                        <Link href="#">Privacy</Link>
                        <Link href="#">Terms</Link>
                        <Link href="#">Status</Link>
                      </HStack>
                    </HStack>
                  </VStack>
                </Section>
              </VStack>

              {/* 3. Minimal footer -------------------------------------- */}
              <VStack gap={3}>
                <Text type="label" color="secondary">
                  Minimal footer
                </Text>
                <Section variant="transparent" padding={4} dividers={['top']}>
                  <HStack gap={4} vAlign="center" justify="between" wrap="wrap">
                    <HStack gap={2} vAlign="center">
                      <Icon icon="success" size="sm" color="success" />
                      <Text type="supporting" color="secondary">
                        All systems operational
                      </Text>
                    </HStack>
                    <HStack gap={4}>
                      <Link href="#">Docs</Link>
                      <Link href="#">Support</Link>
                      <Link href="#" isExternalLink>
                        GitHub
                      </Link>
                    </HStack>
                  </HStack>
                </Section>
              </VStack>
            </VStack>
          </Center>
        </LayoutContent>
      }
    />
  );
}
