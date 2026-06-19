// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {Typeahead} from '@xds/core/Typeahead';
import type {SearchableItem, SearchSource} from '@xds/core/Typeahead';
import {Center} from '@xds/core/Center';

const items: SearchableItem[] = [
  {id: '1', label: 'United States'},
  {id: '2', label: 'United Kingdom'},
  {id: '3', label: 'Canada'},
  {id: '4', label: 'Australia'},
  {id: '5', label: 'Germany'},
  {id: '6', label: 'France'},
  {id: '7', label: 'Japan'},
  {id: '8', label: 'Brazil'},
];

const searchSource: SearchSource = {
  search: (query: string) =>
    items.filter(i => i.label.toLowerCase().includes(query.toLowerCase())),
  bootstrap: () => items.slice(0, 5),
};

export default function TypeaheadLimitedResults() {
  const [value, setValue] = useState<SearchableItem | null>(null);
  return (
    <Center width={320}>
      <Typeahead
        label="Country"
        placeholder="Search countries..."
        searchSource={searchSource}
        value={value}
        onChange={setValue}
        hasEntriesOnFocus
        maxMenuItems={3}
      />
    </Center>
  );
}
