// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Page type: docs home
 * /docs: one card per guide, in the order `astryx docs` lists them. Each card
 * shows the guide's one-line promise and links to its first three children;
 * Reference follows the twelve guides as a plain link.
 */

import type {Metadata} from 'next';
import {Card} from '@astryxdesign/core/Card';
import {Grid} from '@astryxdesign/core/Grid';
import {VStack} from '@astryxdesign/core/Layout';
import {Link} from '@astryxdesign/core/Link';
import {Heading, Text} from '@astryxdesign/core/Text';
import {DocPageLayout} from '../../../components/docs/DocPageLayout';
import {docGuides} from '../../../generated/docsRegistry';
import {pageMetadata} from '../../../lib/pageMetadata';

export const metadata: Metadata = pageMetadata({
  title: 'Docs',
  description:
    'Twelve guides, each named for what you want to do with Astryx, plus the reference.',
  path: '/docs',
  type: 'article',
});

export default function DocsHomePage() {
  const guides = docGuides.filter(guide => guide.topic !== 'reference');
  const reference = docGuides.find(guide => guide.topic === 'reference');
  return (
    <DocPageLayout
      title="Docs"
      description="Pick what you want to do. Each guide opens a short page that links to its parts, and ends with the line your coding agent runs for it.">
      <Grid columns={{minWidth: 280, repeat: 'fill'}} gap={4}>
        {guides.map(guide => (
          <Card key={guide.topic}>
            <VStack gap={2}>
              <Heading level={2}>
                {guide.href ? (
                  <Link href={guide.href} isStandalone>
                    {guide.title}
                  </Link>
                ) : (
                  guide.title
                )}
              </Heading>
              <Text type="body" color="secondary">
                {guide.promise}
              </Text>
              <VStack gap={1}>
                {guide.children.slice(0, 3).map(child => (
                  <Link key={child.href} href={child.href} type="supporting">
                    {child.title}
                  </Link>
                ))}
              </VStack>
            </VStack>
          </Card>
        ))}
      </Grid>
      {reference ? (
        <Text type="body">
          <Link href={reference.href ?? `/docs/${reference.topic}`} isStandalone>
            {reference.title}
          </Link>
          {`: ${reference.promise}`}
        </Text>
      ) : null}
    </DocPageLayout>
  );
}
