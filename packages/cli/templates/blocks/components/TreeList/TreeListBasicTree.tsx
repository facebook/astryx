'use client';

import {XDSTreeList} from '@xds/core/TreeList';

export default function TreeListBasicTree() {
  return (
    <XDSTreeList
      items={[
        { id: 'src', label: 'src', isExpanded: true, children: [
          { id: 'app', label: 'App.tsx' },
          { id: 'index', label: 'index.tsx' },
        ]},
        { id: 'pkg', label: 'package.json' },
      ]}
    />
  );
}
