import {lazy, Suspense} from 'react';
import {templates} from '../../generated/templateRegistry';
import {blocks} from '../../generated/blockRegistry';
import {BlockPreview} from './BlockDocContext';

const templateSlugs = new Set(templates.map(t => t.slug));
const blocksBySlug = new Map(blocks.map(b => [b.slug, b]));

const pageModules = import.meta.glob<{default: React.ComponentType}>(
  '../../../../../packages/cli/templates/pages/*/page.tsx',
);

const blockModules = import.meta.glob<{default: React.ComponentType}>(
  [
    '../../../../../packages/cli/templates/blocks/components/**/*.tsx',
    '!**/*.doc.mjs',
    '!**/*.test.*',
  ],
);

function getPageLoader(slug: string) {
  const key = Object.keys(pageModules).find(k =>
    k.includes(`/${slug}/page.tsx`),
  );
  return key ? pageModules[key] : null;
}

function getBlockLoader(slug: string, component: string) {
  const key = Object.keys(blockModules).find(
    k => k.endsWith(`/${component}/${slug}.tsx`),
  );
  return key ? blockModules[key] : null;
}

export default function TemplateRoute({slug}: {slug: string}) {
  if (templateSlugs.has(slug)) {
    const loader = getPageLoader(slug);
    if (!loader) return <div>Template not found: {slug}</div>;
    const Page = lazy(loader);
    return (
      <Suspense>
        <Page />
      </Suspense>
    );
  }

  const block = blocksBySlug.get(slug);
  if (block) {
    const loader = getBlockLoader(slug, block.component);
    if (!loader) return <div>Block not found: {slug}</div>;
    const Block = lazy(loader);
    return (
      <BlockPreview
        meta={{aspectRatio: block.aspectRatio, scale: block.scale}}>
        <Suspense>
          <Block />
        </Suspense>
      </BlockPreview>
    );
  }

  return <div>Not found: {slug}</div>;
}
