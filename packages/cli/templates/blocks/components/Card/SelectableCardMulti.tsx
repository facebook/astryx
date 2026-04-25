'use client';

import {useState} from 'react';
import {XDSSelectableCard} from '@xds/core/SelectableCard';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

const tags = [
  {id: 'react', name: 'React', variant: 'blue' as const},
  {id: 'typescript', name: 'TypeScript', variant: 'cyan' as const},
  {id: 'node', name: 'Node.js', variant: 'green' as const},
  {id: 'python', name: 'Python', variant: 'yellow' as const},
  {id: 'rust', name: 'Rust', variant: 'orange' as const},
  {id: 'go', name: 'Go', variant: 'teal' as const},
];

export default function SelectableCardMulti() {
  const [selected, setSelected] = useState(new Set(['react', 'typescript']));

  return (
    <XDSStack direction="horizontal" gap={2} wrap="wrap">
      {tags.map(tag => (
        <XDSSelectableCard
          key={tag.id}
          label={tag.name}
          isSelected={selected.has(tag.id)}
          variant={tag.variant}
          onChange={isNow => {
            setSelected(prev => {
              const next = new Set(prev);
              if (isNow) {
                next.add(tag.id);
              } else {
                next.delete(tag.id);
              }
              return next;
            });
          }}
          width={130}>
          <XDSText type="body" weight="bold">
            {tag.name}
          </XDSText>
        </XDSSelectableCard>
      ))}
    </XDSStack>
  );
}
