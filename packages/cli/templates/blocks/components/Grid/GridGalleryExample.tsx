'use client';

import {XDSGrid} from '@xds/core/Grid';
import {XDSCard} from '@xds/core/Card';
import {XDSText} from '@xds/core/Text';

const cards = [
  {title: 'Getting Started', description: 'Learn the basics of the platform.'},
  {title: 'Components', description: 'Browse the full component library.'},
  {title: 'Design Tokens', description: 'Colors, spacing, and typography.'},
  {title: 'Theming', description: 'Customize the look and feel.'},
  {title: 'Accessibility', description: 'Build inclusive experiences.'},
  {title: 'Patterns', description: 'Common UI composition patterns.'},
  {title: 'Migration Guide', description: 'Upgrading from previous versions.'},
  {title: 'API Reference', description: 'Detailed prop and hook docs.'},
];

export default function GridGalleryExample() {
  return (
    <XDSGrid columns={{minWidth: 280}} gap={5}>
      {cards.map(card => (
        <XDSCard key={card.title}>
          <div
            style={{
              height: 120,
              backgroundColor: 'var(--color-background-body)',
              borderRadius: 'var(--radius-element, 8px)',
              marginBottom: 12,
            }}
          />
          <XDSText type="label" display="block">
            {card.title}
          </XDSText>
          <XDSText type="supporting" display="block">
            {card.description}
          </XDSText>
        </XDSCard>
      ))}
    </XDSGrid>
  );
}
