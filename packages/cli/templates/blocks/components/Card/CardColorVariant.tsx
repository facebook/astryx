'use client';

import {XDSCard} from '@xds/core/Card';

export default function CardColorVariant() {
  return (
    <XDSCard variant="blue" width={300}>
      <p>Blue tinted card</p>
    </XDSCard>
  );
}

export const showcase = {
  aspectRatio: 4 / 3,
  render: CardColorVariant,
};
