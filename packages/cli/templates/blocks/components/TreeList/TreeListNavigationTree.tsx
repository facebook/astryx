'use client';

import {XDSTreeList} from '@xds/core/TreeList';

const noop = () => {};

export default function TreeListNavigationTree() {
  return (
    <XDSTreeList
      items={[
        {
          id: 'nav',
          label: 'Navigation',
          isExpanded: true,
          children: [
            {id: 'home', label: 'Home', onClick: noop},
            {id: 'about', label: 'About', onClick: noop, isSelected: true},
            {id: 'contact', label: 'Contact', onClick: noop},
          ],
        },
      ]}
    />
  );
}
