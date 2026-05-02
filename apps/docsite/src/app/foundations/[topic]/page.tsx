import {notFound} from 'next/navigation';
import {XDSHeading, XDSText} from '@xds/core/Text';
import {XDSVStack} from '@xds/core/Layout';
import {XDSSection} from '@xds/core/Section';
import {docTopics} from '../../../generated/docsRegistry';

export function generateStaticParams() {
  return docTopics.map(d => ({topic: d.topic}));
}

export default async function FoundationPage({
  params,
}: {
  params: Promise<{topic: string}>;
}) {
  const {topic: topicSlug} = await params;
  const topic = docTopics.find(d => d.topic === topicSlug);
  if (!topic) notFound();

  return (
    <XDSSection maxWidth="md" padding={6}>
      <XDSVStack gap={4}>
        <XDSHeading level={1}>{topic.title}</XDSHeading>
        <XDSText type="body" color="secondary">
          {topic.description}
        </XDSText>
      </XDSVStack>
    </XDSSection>
  );
}
