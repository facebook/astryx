'use client';

import {XDSTreeList} from '@xds/core/TreeList';

const noop = () => {};

export default function TreeListShowcase() {
  return (
    <XDSTreeList
      items={[
        {
          id: 'src',
          label: 'src',
          isExpanded: true,
          children: [
            {
              id: 'components',
              label: 'components',
              children: [
                {id: 'button', label: 'Button.tsx', onClick: noop},
                {id: 'card', label: 'Card.tsx', onClick: noop},
                {id: 'list', label: 'List.tsx', onClick: noop},
              ],
            },
            {id: 'app', label: 'App.tsx', onClick: noop},
            {id: 'index', label: 'index.tsx', onClick: noop},
          ],
        },
        {
          id: 'public',
          label: 'public',
          children: [
            {id: 'favicon', label: 'favicon.ico', onClick: noop},
            {id: 'index-html', label: 'index.html', onClick: noop},
          ],
        },
        {id: 'pkg', label: 'package.json', onClick: noop},
        {id: 'readme', label: 'README.md', onClick: noop},
      ]}
    />
  );
}
