'use client';

import {XDSTreeList} from '@xds/core/TreeList';

export default function TreeListInteractiveItems() {
  return (
    <XDSTreeList
      items={[
        { id: 'settings', label: 'Settings', onClick: () => navigate('/settings') },
        { id: 'docs', label: 'Docs', href: '/docs', target: '_blank' },
      ]}
    />
  );
}
