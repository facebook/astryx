/**
 * Page type: long-form-doc
 * Renders documentation topics from CLI docs/*.doc.mjs.
 * Used for: getting-started, typography, color, spacing, shape, icons,
 * elevation, motion, principles, styling, tokens, theme.
 */

import {notFound} from 'next/navigation';
import {XDSHeading, XDSText} from '@xds/core/Text';
import {XDSVStack} from '@xds/core/Layout';
import {XDSSection} from '@xds/core/Section';
import {docTopics} from '../../../generated/docsRegistry';

export function generateStaticParams() {
  return docTopics.map(d => ({topic: d.topic}));
}

export default async function DocPage({
  params,
}: {
  params: Promise<{topic: string}>;
}) {
  const {topic: slug} = await params;
  const topic = docTopics.find(d => d.topic === slug);
  if (!topic) notFound();

  return (
    <XDSSection maxWidth="md" padding={6}>
      <XDSVStack gap={4}>
        <XDSHeading level={1}>{topic.title}</XDSHeading>
        <XDSText type="body" color="secondary">
          {topic.description}
        </XDSText>
        {/* TODO: render full doc sections from pipeline */}
      </XDSVStack>
    </XDSSection>
  );
}
