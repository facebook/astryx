/**
 * Page type: template viewer
 * Preview a template + view its source code.
 * TODO: render template in iframe, show source from pipeline.
 */

import {notFound} from 'next/navigation';
import {XDSHeading, XDSText} from '@xds/core/Text';
import {XDSVStack} from '@xds/core/Layout';
import {XDSSection} from '@xds/core/Section';
import {templates} from '../../../../generated/templateRegistry';

export function generateStaticParams() {
  return templates.map(t => ({slug: t.slug}));
}

export default async function TemplatePage({
  params,
}: {
  params: Promise<{slug: string}>;
}) {
  const {slug} = await params;
  const template = templates.find(t => t.slug === slug);
  if (!template) notFound();

  return (
    <XDSSection maxWidth="lg" padding={6}>
      <XDSVStack gap={4}>
        <XDSHeading level={1}>{template.name}</XDSHeading>
        <XDSText type="body" color="secondary">
          {template.description}
        </XDSText>
        {/* TODO: template preview iframe + source code viewer */}
      </XDSVStack>
    </XDSSection>
  );
}
