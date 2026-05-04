'use client';

import {XDSGrid} from '@xds/core/Grid';
import {XDSCard} from '@xds/core/Card';
import {XDSVStack} from '@xds/core/Stack';
import {XDSText} from '@xds/core/Text';

const cards = [
  {title: 'Getting Started', description: 'Learn the basics of the platform.'},
  {title: 'Components', description: 'Browse the full component library.'},
  {title: 'Design Tokens', description: 'Colors, spacing, and typography.'},
  {title: 'Theming', description: 'Customize the look and feel.'},
  {title: 'Accessibility', description: 'Build inclusive experiences.'},
  {title: 'Patterns', description: 'Common UI composition patterns.'},
];

export default function GridGalleryExample() {
  return (
    <XDSGrid
      columns={{minWidth: 180}}
      gap={5}
      width="100%"
      style={{maxWidth: 400}}>
      {cards.map(card => (
        <XDSCard key={card.title}>
          <XDSVStack gap={1}>
            <XDSText type="label" display="block">
              {card.title}
            </XDSText>
            <XDSText type="supporting" display="block">
              {card.description}
            </XDSText>
          </XDSVStack>
        </XDSCard>
      ))}
    </XDSGrid>
  );
}
