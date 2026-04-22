'use client';

import {useState} from 'react';
import {XDSTypeahead} from '@xds/core/Typeahead';
import type {XDSSearchableItem, XDSSearchSource} from '@xds/core/Typeahead';
import {XDSCenter} from '@xds/core/Center';

const items: XDSSearchableItem[] = [
  {id: '1', label: 'Engineering'},
  {id: '2', label: 'Design'},
  {id: '3', label: 'Marketing'},
  {id: '4', label: 'Sales'},
  {id: '5', label: 'Product'},
  {id: '6', label: 'Finance'},
  {id: '7', label: 'Legal'},
  {id: '8', label: 'Operations'},
];

const searchSource: XDSSearchSource = {
  search: (query: string) =>
    items.filter(i => i.label.toLowerCase().includes(query.toLowerCase())),
  bootstrap: () => items.slice(0, 5),
};

export default function TypeaheadWithHelperText() {
  const [value, setValue] = useState<XDSSearchableItem | null>(null);
  return (
    <XDSCenter width={320}>
      <XDSTypeahead
        label="Department"
        placeholder="Search departments..."
        searchSource={searchSource}
        value={value}
        onChange={setValue}
        description="Select the department this request should be routed to"
      />
    </XDSCenter>
  );
}
