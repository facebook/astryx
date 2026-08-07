// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {ComplexSelector} from '@astryxdesign/core/ComplexSelector';
import {TreeList} from '@astryxdesign/core/TreeList';

interface Destination {
  id: string;
  path: string;
}

const FOLDERS = [
  {
    id: 'design-systems',
    label: 'Design systems',
    children: [
      {id: 'components', label: 'Components'},
      {id: 'accessibility', label: 'Accessibility'},
      {id: 'tokens', label: 'Tokens'},
    ],
  },
  {
    id: 'research',
    label: 'Research',
    children: [
      {id: 'interviews', label: 'Interviews'},
      {id: 'field-notes', label: 'Field notes'},
    ],
  },
];

export default function ComplexSelectorFolderTree() {
  const [destination, setDestination] = useState<Destination>({
    id: 'components',
    path: 'Design systems / Components',
  });

  return (
    <ComplexSelector<Destination>
      label="Move to folder"
      description="Where this document should live"
      width={320}
      value={destination}
      onChange={setDestination}
      triggerLabel={destination.path}>
      {(value, onChange, close) => (
        <TreeList
          items={FOLDERS.map(folder => ({
            id: folder.id,
            label: folder.label,
            isExpanded: true,
            children: folder.children.map(child => ({
              id: child.id,
              label: child.label,
              isSelected: child.id === value.id,
              onClick: () => {
                onChange({
                  id: child.id,
                  path: `${folder.label} / ${child.label}`,
                });
                close();
              },
            })),
          }))}
        />
      )}
    </ComplexSelector>
  );
}
