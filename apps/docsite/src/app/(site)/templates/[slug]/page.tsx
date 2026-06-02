// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Page type: template viewer
 *
 * Full-bleed live preview of a single page template with a floating
 * footer pill (back, name/description, Open in Playground, Use).
 * Layout mirrors the themes preview page. Rendering is delegated to
 * the TemplatePreviewPage client component.
 */

import {notFound} from 'next/navigation';
import {templates} from '../../../../generated/templateRegistry';
import {TemplatePreviewPage} from '../../../../components/TemplatePreviewPage';

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
    <TemplatePreviewPage
      slug={template.slug}
      name={template.name}
      description={template.description}
      source={template.source}
    />
  );
}
