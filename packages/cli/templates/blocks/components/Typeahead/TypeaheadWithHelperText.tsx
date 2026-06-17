// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {Typeahead} from '@xds/core/Typeahead';
import type {SearchableItem, SearchSource} from '@xds/core/Typeahead';
import {Center} from '@xds/core/Center';

const items: SearchableItem[] = [
  {id: '1', label: 'Engineering'},
  {id: '2', label: 'Design'},
  {id: '3', label: 'Marketing'},
  {id: '4', label: 'Sales'},
  {id: '5', label: 'Product'},
  {id: '6', label: 'Finance'},
  {id: '7', label: 'Legal'},
  {id: '8', label: 'Operations'},
];

const searchSource: SearchSource = {
  search: (query: string) =>
    items.filter(i => i.label.toLowerCase().includes(query.toLowerCase())),
  bootstrap: () => items.slice(0, 5),
};

export default function TypeaheadWithHelperText() {
  const [value, setValue] = useState<SearchableItem | null>(null);
  return (
    <Center width={320}>
      <Typeahead
        label="Department"
        placeholder="Search departments..."
        searchSource={searchSource}
        value={value}
        onChange={setValue}
        description="Select the department this request should be routed to"
      />
    </Center>
  );
}
