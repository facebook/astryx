// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useRef, useState} from 'react';
import {BaseTypeahead, createStaticSource} from '@astryxdesign/core/Typeahead';
import type {SearchableItem} from '@astryxdesign/core/Typeahead';
import {Icon} from '@astryxdesign/core/Icon';
import {HStack, VStack} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';
import {MagnifyingGlassIcon} from '@heroicons/react/24/outline';

const frameworks: SearchableItem[] = [
  {id: 'react', label: 'React'},
  {id: 'vue', label: 'Vue'},
  {id: 'angular', label: 'Angular'},
  {id: 'svelte', label: 'Svelte'},
  {id: 'solid', label: 'SolidJS'},
  {id: 'remix', label: 'Remix'},
  {id: 'next', label: 'Next.js'},
  {id: 'nuxt', label: 'Nuxt'},
];

const source = createStaticSource(frameworks);

export default function BaseTypeaheadCustomSearch() {
  const [value, setValue] = useState<SearchableItem | null>(null);
  const wrapperRef = useRef<HTMLElement>(null);

  return (
    <VStack gap={3} style={{width: 320}}>
      <HStack
        ref={wrapperRef}
        gap={2}
        vAlign="center"
        style={{
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-control)',
          padding: '6px 10px',
          background: 'var(--color-surface)',
        }}>
        <Icon icon={MagnifyingGlassIcon} size="sm" color="secondary" />
        <BaseTypeahead
          searchSource={source}
          value={value}
          onChange={setValue}
          anchorRef={wrapperRef}
          placeholder="Search frameworks…"
          hasEntriesOnFocus
          debounceMs={0}
        />
      </HStack>
      <Text type="supporting" color="secondary">
        {value != null ? `Selected: ${value.label}` : 'No selection'}
      </Text>
    </VStack>
  );
}
