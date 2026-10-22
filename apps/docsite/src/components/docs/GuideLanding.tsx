// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file GuideLanding.tsx
 * @input One guide's landing page: its promise, its own must-know lines, its
 *   children with one line each, and where the anchors of the guide's old
 *   single page now open
 * @output A short page that links to a page per child, instead of every
 *   child's text pasted into one page
 * @position Docsite guide and nested-namespace pages (docs/[topic]/page.tsx)
 */

import {useEffect} from 'react';
import {Card} from '@astryxdesign/core/Card';
import {Grid} from '@astryxdesign/core/Grid';
import {VStack} from '@astryxdesign/core/Layout';
import {Link} from '@astryxdesign/core/Link';
import {Heading, Text} from '@astryxdesign/core/Text';
import {ContentBlockRenderer} from './ContentBlockRenderer';
import {DocPageLayout} from './DocPageLayout';
import type {DocSection} from '../../generated/docsRegistry';
import type {ReactNode} from 'react';

export function GuideLanding({
  title,
  description,
  sections,
  items,
  anchors,
  footer,
}: {
  title: string;
  description: string;
  sections: DocSection[];
  items: {title: string; href: string; summary: string}[];
  anchors?: Record<string, string>;
  footer?: ReactNode;
}) {
  // A link to a section of the guide's old single page opens the child page
  // that holds that text now.
  useEffect(() => {
    const hash = decodeURIComponent(window.location.hash.slice(1));
    const target = hash ? anchors?.[hash] : undefined;
    if (target) {
      window.location.replace(target);
    }
  }, [anchors]);

  return (
    <DocPageLayout title={title} description={description}>
      {sections.flatMap(section =>
        section.content.map((block, i) => (
          <ContentBlockRenderer key={`${section.title}:${i}`} block={block} />
        )),
      )}
      {items.length > 0 ? (
        <Grid columns={{minWidth: 260, repeat: 'fill'}} gap={4}>
          {items.map(item => (
            <Card key={item.href}>
              <VStack gap={2}>
                <Heading level={2}>
                  <Link href={item.href} isStandalone>
                    {item.title}
                  </Link>
                </Heading>
                {item.summary ? (
                  <Text type="body" color="secondary">
                    {item.summary}
                  </Text>
                ) : null}
              </VStack>
            </Card>
          ))}
        </Grid>
      ) : null}
      {footer}
    </DocPageLayout>
  );
}
