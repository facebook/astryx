import {templates} from '../../../../generated/templateRegistry';
import {blocks} from '../../../../generated/blockRegistry';
import {TemplateRenderer} from './TemplateRenderer';

export function generateStaticParams() {
  return [
    ...templates.map(t => ({slug: t.slug})),
    ...blocks.map(b => ({slug: b.slug})),
  ];
}

export default async function TemplatePage({
  params,
}: {
  params: Promise<{slug: string}>;
}) {
  const {slug} = await params;
  return <TemplateRenderer slug={slug} />;
}
