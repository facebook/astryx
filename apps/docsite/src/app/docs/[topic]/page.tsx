/**
 * Page type: long-form-doc
 * Renders guide and foundation docs from the pipeline.
 * Content blocks (prose, code, table, list) rendered via ContentBlockRenderer.
 */

import {notFound} from 'next/navigation';
import {XDSSection} from '@xds/core/Section';
import {docTopics} from '../../../generated/docsRegistry';
import {ReferenceDocView} from '../../../components/docs/ReferenceDocView';

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
    <XDSSection maxWidth="lg" padding={6}>
      <ReferenceDocView
        title={topic.title}
        description={topic.description}
        sections={topic.sections}
      />
    </XDSSection>
  );
}
