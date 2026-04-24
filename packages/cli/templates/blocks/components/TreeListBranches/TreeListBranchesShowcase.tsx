'use client';

import {XDSTreeList} from '@xds/core/TreeList';

const noop = () => {};

export default function TreeListBranchesShowcase() {
  return (
    <XDSTreeList
      items={[
        {
          id: 'design-system',
          label: 'Design System',
          isExpanded: true,
          children: [
            {
              id: 'components',
              label: 'Components',
              isExpanded: true,
              children: [
                {
                  id: 'inputs',
                  label: 'Inputs',
                  children: [
                    {id: 'text-input', label: 'TextInput', onClick: noop},
                    {id: 'checkbox', label: 'Checkbox', onClick: noop},
                    {id: 'selector', label: 'Selector', onClick: noop},
                  ],
                },
                {
                  id: 'layout',
                  label: 'Layout',
                  children: [
                    {id: 'stack', label: 'Stack', onClick: noop},
                    {id: 'grid', label: 'Grid', onClick: noop},
                  ],
                },
              ],
            },
            {
              id: 'tokens',
              label: 'Tokens',
              children: [
                {id: 'colors', label: 'Colors', onClick: noop},
                {id: 'spacing', label: 'Spacing', onClick: noop},
                {id: 'typography', label: 'Typography', onClick: noop},
              ],
            },
          ],
        },
        {
          id: 'utilities',
          label: 'Utilities',
          children: [
            {id: 'hooks', label: 'Hooks', onClick: noop},
            {id: 'helpers', label: 'Helpers', onClick: noop},
          ],
        },
      ]}
    />
  );
}
