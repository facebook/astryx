// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Page type: long-form-doc
 * Renders guide and foundation docs from the pipeline.
 * Content blocks (prose, code, table, list) rendered via ContentBlockRenderer.
 * Token topics (foundations category) render TokensDocView with live token tables.
 */

import {notFound} from 'next/navigation';
import {XDSSection} from '@xds/core/Section';
import {docTopics} from '../../../../generated/docsRegistry';
import {ReferenceDocView} from '../../../../components/docs/ReferenceDocView';
import {TokensDocView} from '../../../../components/docs/TokensDocView';

const TOKEN_TOPICS = new Set([
  'tokens',
  'color',
  'elevation',
  'motion',
  'shape',
  'spacing',
  'typography',
]);

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

  const isTokenTopic =
    topic.category === 'foundations' && TOKEN_TOPICS.has(topic.topic);

  return (
    <XDSSection maxWidth="lg" padding={6}>
      {isTokenTopic ? (
        <TokensDocView
          title={topic.title}
          description={topic.description}
          sections={topic.sections}
          topic={topic.topic}
        />
      ) : (
        <ReferenceDocView
          title={topic.title}
          description={topic.description}
          sections={topic.sections}
        />
      )}
    </XDSSection>
  );
}
