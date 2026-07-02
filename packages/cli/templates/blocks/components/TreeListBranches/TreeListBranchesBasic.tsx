// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {TreeList} from '@astryxdesign/core/TreeList';

const noop = () => {};

export default function TreeListBranchesBasic() {
  return (
    <TreeList
      items={[
        {
          id: 'src',
          label: 'src',
          isExpanded: true,
          children: [
            {
              id: 'components',
              label: 'components',
              isExpanded: true,
              children: [
                {id: 'button', label: 'Button.tsx', onClick: noop},
                {id: 'card', label: 'Card.tsx', onClick: noop},
              ],
            },
            {
              id: 'hooks',
              label: 'hooks',
              children: [
                {id: 'use-theme', label: 'useTheme.ts', onClick: noop},
              ],
            },
            {id: 'index', label: 'index.ts', onClick: noop},
          ],
        },
        {id: 'readme', label: 'README.md', onClick: noop},
      ]}
    />
  );
}
