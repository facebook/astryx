// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {XDSTypeahead} from '@xds/core/Typeahead';
import type {XDSSearchableItem, XDSSearchSource} from '@xds/core/Typeahead';
import {XDSCenter} from '@xds/core/Center';

const items: XDSSearchableItem[] = [
  {id: '1', label: 'New York'},
  {id: '2', label: 'San Francisco'},
  {id: '3', label: 'London'},
  {id: '4', label: 'Berlin'},
  {id: '5', label: 'Tokyo'},
  {id: '6', label: 'Singapore'},
  {id: '7', label: 'Sydney'},
  {id: '8', label: 'Toronto'},
];

const searchSource: XDSSearchSource = {
  search: (query: string) =>
    items.filter(i => i.label.toLowerCase().includes(query.toLowerCase())),
  bootstrap: () => items.slice(0, 5),
};

export default function TypeaheadWithValidation() {
  const [value, setValue] = useState<XDSSearchableItem | null>(null);
  return (
    <XDSCenter width={320}>
      <XDSTypeahead
        label="Office"
        placeholder="Search offices..."
        searchSource={searchSource}
        value={value}
        onChange={setValue}
        status={{type: 'error', message: 'Please select an office location'}}
      />
    </XDSCenter>
  );
}
