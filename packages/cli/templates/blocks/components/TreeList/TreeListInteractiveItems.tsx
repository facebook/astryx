'use client';

import {XDSTreeList} from '@xds/core/TreeList';

const navigate = (path: string) => console.log(path);

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
