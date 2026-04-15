'use client';

import {XDSGrid} from '@xds/core/Grid';
import {XDSButton} from '@xds/core/Button';

function StarIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

const items = [
  {id: '1', label: 'Star'},
  {id: '2', label: 'Star'},
  {id: '3', label: 'Star'},
  {id: '4', label: 'Star'},
  {id: '5', label: 'Star'},
  {id: '6', label: 'Star'},
];

export default function GridDense() {
  return (
    <XDSGrid columns={6} gap={2}>
      {items.map(item => (
        <XDSButton
          key={item.id}
          label={item.label}
          icon={<StarIcon />}
          variant="ghost"
          size="sm"
        />
      ))}
    </XDSGrid>
  );
}
