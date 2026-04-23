'use client';

import {useState} from 'react';
import {XDSTypeahead} from '@xds/core/Typeahead';
import type {XDSSearchableItem, XDSSearchSource} from '@xds/core/Typeahead';
import {XDSCenter} from '@xds/core/Center';
import {MagnifyingGlassIcon} from '@heroicons/react/24/outline';

const items: XDSSearchableItem[] = [
  {id: '1', label: 'Olivia Martin'},
  {id: '2', label: 'Jackson Lee'},
  {id: '3', label: 'Isabella Nguyen'},
  {id: '4', label: 'William Kim'},
  {id: '5', label: 'Sofia Davis'},
  {id: '6', label: 'Lucas Brown'},
  {id: '7', label: 'Mia Wilson'},
  {id: '8', label: 'Ethan Jones'},
];

const searchSource: XDSSearchSource = {
  search: (query: string) =>
    items.filter(i => i.label.toLowerCase().includes(query.toLowerCase())),
  bootstrap: () => items.slice(0, 5),
};

export default function TypeaheadSearchField() {
  const [value, setValue] = useState<XDSSearchableItem | null>(null);
  return (
    <XDSCenter width={320}>
      <XDSTypeahead
        label="Team member"
        placeholder="Search people..."
        searchSource={searchSource}
        value={value}
        onChange={setValue}
        startIcon={MagnifyingGlassIcon}
        hasEntriesOnFocus
      />
    </XDSCenter>
  );
}
