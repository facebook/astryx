// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {OverflowList} from '@astryxdesign/core/OverflowList';
import {Badge} from '@astryxdesign/core/Badge';
import {Card} from '@astryxdesign/core/Card';

const tags = [
  'React',
  'TypeScript',
  'StyleX',
  'Storybook',
  'Vitest',
  'Playwright',
  'ESLint',
  'Prettier',
  'Vite',
  'pnpm',
];

export default function OverflowListMultiRowTags() {
  return (
    <Card
      padding={2}
      style={{
        resize: 'horizontal',
        overflow: 'hidden',
        minWidth: 120,
        width: 260,
      }}>
      <OverflowList
        gap={1}
        maxRows={2}
        overflowRenderer={overflowItems => (
          <Badge variant="neutral" label={`+${overflowItems.length}`} />
        )}>
        {tags.map(tag => (
          <Badge key={tag} variant="info" label={tag} />
        ))}
      </OverflowList>
    </Card>
  );
}
