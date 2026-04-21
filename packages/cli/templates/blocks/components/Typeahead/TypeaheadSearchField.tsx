'use client';

import {useState} from 'react';
import {XDSTypeahead} from '@xds/core/Typeahead';
import type {XDSSearchableItem, XDSSearchSource} from '@xds/core/Typeahead';

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    </svg>
  );
}

const items: XDSSearchableItem[] = [
  {id: '1', label: 'Apple'},
  {id: '2', label: 'Banana'},
  {id: '3', label: 'Cherry'},
  {id: '4', label: 'Date'},
  {id: '5', label: 'Elderberry'},
  {id: '6', label: 'Fig'},
  {id: '7', label: 'Grape'},
  {id: '8', label: 'Honeydew'},
];

const searchSource: XDSSearchSource = {
  search: (query: string) =>
    items.filter(i => i.label.toLowerCase().includes(query.toLowerCase())),
  bootstrap: () => items.slice(0, 5),
};

export default function TypeaheadSearchField() {
  const [value, setValue] = useState<XDSSearchableItem | null>(null);
  return (
    <div style={{width: 320}}>
      <XDSTypeahead
        label="Fruit"
        placeholder="Search fruits..."
        searchSource={searchSource}
        value={value}
        onChange={setValue}
        startIcon={SearchIcon}
        hasEntriesOnFocus
      />
    </div>
  );
}
