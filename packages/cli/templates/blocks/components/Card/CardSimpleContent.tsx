'use client';

import {XDSCard} from '@xds/core/Card';

export default function CardSimpleContent() {
  return (
    <XDSCard>
      <p>Card content with default padding</p>
    </XDSCard>
  );
}

export const showcase = {
  aspectRatio: 4 / 3,
  render: CardSimpleContent,
};
