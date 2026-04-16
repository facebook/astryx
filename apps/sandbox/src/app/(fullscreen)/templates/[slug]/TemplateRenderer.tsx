'use client';

import {use} from 'react';
import {notFound} from 'next/navigation';
import {templates} from '../../../../generated/templateRegistry';
import {blocks} from '../../../../generated/blockRegistry';
import {BlockPreview} from '../../BlockDocContext';
import {templateLoaders, blockLoaders} from '../../../../generated/templateLoaders';

const templateSlugs = new Set(templates.map(t => t.slug));
const blocksBySlug = new Map(blocks.map(b => [b.slug, b]));

export function TemplateRenderer({slug}: {slug: string}) {
  if (templateSlugs.has(slug)) {
    const loader = templateLoaders[slug];
    if (!loader) notFound();
    const {default: Component} = use(loader());
    return <Component />;
  }

  const block = blocksBySlug.get(slug);
  if (block) {
    const loader = blockLoaders[slug];
    if (!loader) notFound();
    const {default: Component} = use(loader());
    return (
      <BlockPreview meta={{aspectRatio: block.aspectRatio, scale: block.scale}}>
        <Component />
      </BlockPreview>
    );
  }

  notFound();
}
