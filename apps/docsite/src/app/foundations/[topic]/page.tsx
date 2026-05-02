import * as stylex from '@stylexjs/stylex';
import {notFound} from 'next/navigation';
import {docTopics} from '../../../generated/docsRegistry';

const styles = stylex.create({
  page: {padding: '2rem', maxWidth: 720, marginInline: 'auto'},
  heading: {fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem'},
  description: {opacity: 0.7, marginBottom: '2rem'},
});

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
    <div {...stylex.props(styles.page)}>
      <h1 {...stylex.props(styles.heading)}>{topic.title}</h1>
      <p {...stylex.props(styles.description)}>{topic.description}</p>
    </div>
  );
}
