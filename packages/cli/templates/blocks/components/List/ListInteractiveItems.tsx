'use client';

import {XDSList, XDSListItem} from '@xds/core/List';

export default function ListInteractiveItems() {
  return (
    <XDSList>
      <XDSListItem
        label="Settings"
        onClick={() => {
          /* navigate('/settings') */
        }}
      />
      <XDSListItem label="Docs" href="/docs" target="_blank" />
    </XDSList>
  );
}

export const showcase = {
  aspectRatio: 3 / 4,
  render: ListInteractiveItems,
};
