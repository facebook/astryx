'use client';

import {XDSHeading, XDSText} from '@xds/core/Text';

const cards = [
  {
    title: 'Very Long Card Title That Gets Truncated',
    updated: '1 hour ago',
  },
  {
    title: 'Another Card',
    updated: '2 hours ago',
  },
  {
    title: 'Third Card With An Even Longer Title That Will Be Truncated',
    updated: '3 hours ago',
  },
];

export default function HeadingCardGrid() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: 16,
        maxWidth: 800,
      }}>
      {cards.map(card => (
        <div
          key={card.title}
          style={{
            padding: 16,
            borderRadius: 8,
            border: '1px solid #e0e0e0',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}>
          <XDSHeading level={3} maxLines={1}>
            {card.title}
          </XDSHeading>
          <XDSText type="body" maxLines={2} display="block">
            This is a card description that might be quite long and needs to be
            truncated after two lines to keep the card compact and uniform.
          </XDSText>
          <XDSText type="supporting" display="block">
            Updated {card.updated}
          </XDSText>
        </div>
      ))}
    </div>
  );
}
