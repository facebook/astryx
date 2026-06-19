// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {Typeahead} from '@xds/core/Typeahead';
import type {SearchableItem, SearchSource} from '@xds/core/Typeahead';
import {Center} from '@xds/core/Center';
import {MagnifyingGlassIcon} from '@heroicons/react/24/outline';

const items: SearchableItem[] = [
  {id: '1', label: 'Olivia Martin'},
  {id: '2', label: 'Jackson Lee'},
  {id: '3', label: 'Isabella Nguyen'},
  {id: '4', label: 'William Kim'},
  {id: '5', label: 'Sofia Davis'},
  {id: '6', label: 'Lucas Brown'},
  {id: '7', label: 'Mia Wilson'},
  {id: '8', label: 'Ethan Jones'},
];

const searchSource: SearchSource = {
  search: (query: string) =>
    items.filter(i => i.label.toLowerCase().includes(query.toLowerCase())),
  bootstrap: () => items.slice(0, 5),
};

export default function TypeaheadSearchField() {
  const [value, setValue] = useState<SearchableItem | null>(null);
  return (
    <Center width={320}>
      <Typeahead
        label="Team member"
        placeholder="Search people..."
        searchSource={searchSource}
        value={value}
        onChange={setValue}
        startIcon={MagnifyingGlassIcon}
        hasEntriesOnFocus
      />
    </Center>
  );
}
