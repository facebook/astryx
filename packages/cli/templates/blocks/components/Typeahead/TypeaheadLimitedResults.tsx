'use client';

import {useState} from 'react';
import {XDSTypeahead} from '@xds/core/Typeahead';
import type {XDSSearchableItem, XDSSearchSource} from '@xds/core/Typeahead';
import {XDSCenter} from '@xds/core/Center';

const items: XDSSearchableItem[] = [
  {id: '1', label: 'United States'},
  {id: '2', label: 'United Kingdom'},
  {id: '3', label: 'Canada'},
  {id: '4', label: 'Australia'},
  {id: '5', label: 'Germany'},
  {id: '6', label: 'France'},
  {id: '7', label: 'Japan'},
  {id: '8', label: 'Brazil'},
];

const searchSource: XDSSearchSource = {
  search: (query: string) =>
    items.filter(i => i.label.toLowerCase().includes(query.toLowerCase())),
  bootstrap: () => items.slice(0, 5),
};

export default function TypeaheadLimitedResults() {
  const [value, setValue] = useState<XDSSearchableItem | null>(null);
  return (
    <XDSCenter width={320}>
      <XDSTypeahead
        label="Country"
        placeholder="Search countries..."
        searchSource={searchSource}
        value={value}
        onChange={setValue}
        hasEntriesOnFocus
        maxMenuItems={3}
      />
    </XDSCenter>
  );
}
