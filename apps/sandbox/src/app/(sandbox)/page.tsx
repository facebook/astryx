'use client';

import {XDSText, XDSHeading} from '@xds/core/Text';
import {categories} from '../sandboxPages';
import {ProjectCard} from '../ProjectCard';

export default function Home() {
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 40}}>
      <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
        <XDSHeading level={1}>XDS Sandbox</XDSHeading>
        <XDSText type="body" color="secondary">
          A testing ground for XDS components. Explore tools and templates
          below, or create new pages under{' '}
          <XDSText type="body" weight="bold">
            src/app/pages/
          </XDSText>
          .
        </XDSText>
      </div>

      {categories.map(category => (
        <div
          key={category.slug}
          style={{display: 'flex', flexDirection: 'column', gap: 16}}>
          <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
            <XDSHeading level={2}>{category.label}</XDSHeading>
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
      ))}
    </div>
  );
}
