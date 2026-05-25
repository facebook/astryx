// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Page type: template viewer
 * Preview a template + view its source code.
 */

import {notFound} from 'next/navigation';
import {XDSHeading, XDSText} from '@xds/core/Text';
import {XDSVStack} from '@xds/core/Layout';
import {XDSSection} from '@xds/core/Section';
import {XDSCodeBlock} from '@xds/core/CodeBlock';
import {templates} from '../../../../generated/templateRegistry';
import {PlaygroundButton} from '../../../../components/PlaygroundButton';

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
  if (!template) {
    notFound();
  }

  return (
    <XDSSection maxWidth="lg" padding={6}>
      <XDSVStack gap={4}>
        <XDSHeading level={1}>{template.name}</XDSHeading>
        <XDSText type="body" color="secondary">
          {template.description}
        </XDSText>
        {template.source && (
          <>
            <PlaygroundButton source={template.source} />
            <XDSCodeBlock code={template.source} language="tsx" hasCopyButton />
          </>
        )}
      </XDSVStack>
    </XDSSection>
  );
}
