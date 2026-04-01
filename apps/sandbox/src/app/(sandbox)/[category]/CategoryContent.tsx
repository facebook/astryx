'use client';

import {XDSHeading, XDSText} from '@xds/core/Text';
import {categories} from '../../sandboxPages';
import {ProjectCard} from '../../ProjectCard';

export function CategoryContent({slug}: {slug: string}) {
  const category = categories.find(c => c.slug === slug);

  if (!category) {
    return (
      <div>
        <XDSHeading level={1}>Not Found</XDSHeading>
        <XDSText type="body" color="secondary">
          Category &quot;{slug}&quot; doesn&apos;t exist.
        </XDSText>
      </div>
    );
  }

  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 24}}>
      <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
        <XDSHeading level={1}>{category.label}</XDSHeading>
        <XDSText type="body" color="secondary">
          {category.description}
        </XDSText>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 20,
        }}>
        {category.pages.map(page => (
          <ProjectCard key={page.href} page={page} />
        ))}
      </div>
    </div>
  );
}
